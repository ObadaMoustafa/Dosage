<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use App\Entity\GebruikerKoppelingen;
use App\Entity\PairingCode;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Uid\Uuid;

#[Route('/api/pairing')]
class PairingController extends AbstractController
{
    #[Route('/code', methods: ['POST'])]
    #[IsGranted('ROLE_PATIENT')]
    public function generateCode(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        // Default to FAMILY if not provided, strictly check allowed types
        $type = strtoupper($data['type'] ?? GebruikerKoppelingen::TYPE_FAMILY);
        if (!in_array($type, [GebruikerKoppelingen::TYPE_FAMILY, GebruikerKoppelingen::TYPE_THERAPIST])) {
            return $this->json(['error' => 'Ongeldig type verbinding.'], 400);
        }

        // Rule 1: Cleanup Old Codes (Expired OR Active) for this specific type
        $oldCode = $em->getRepository(PairingCode::class)->findOneBy([
            'gebruiker' => $user,
            'connectionType' => $type
        ]);

        if ($oldCode) {
            $em->remove($oldCode);
        }

        // Generate New Code
        $codeString = (string) random_int(10000, 99999);

        $pairingCode = new PairingCode();
        $pairingCode->setCode($codeString);
        $pairingCode->setGebruiker($user);
        $pairingCode->setConnectionType($type);
        $expiryTime = new \DateTime('+15 minutes', new \DateTimeZone('Europe/Amsterdam'));
        $pairingCode->setExpiresAt($expiryTime);

        $em->persist($pairingCode);
        $em->flush();

        return $this->json([
            'code' => $codeString,
            'type' => $type,
            'expires_at' => $pairingCode->getExpiresAt()->format('Y-m-d H:i:s')
        ]);
    }

    #[Route('/link', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function linkAccount(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $codeString = $data['code'] ?? '';

        // 1. Find Code
        $pairingCode = $em->getRepository(PairingCode::class)->findOneBy(['code' => $codeString]);

        if (!$pairingCode) {
            return $this->json(['error' => 'Ongeldige code.'], 404);
        }

        // 2. Validate Expiry
        if (!$pairingCode->isValid()) {
            $em->remove($pairingCode);
            $em->flush();
            return $this->json(['error' => 'Code is verlopen.'], 400);
        }

        $patient = $pairingCode->getGebruiker();
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();
        $type = $pairingCode->getConnectionType();

        // 3. Prevent Self-Linking
        if ($patient === $currentUser) {
            return $this->json(['error' => 'U kunt uzelf niet koppelen.'], 400);
        }

        // 4. SECURITY FIX: Validate Role based on Connection Type
        // If the code is for a Therapist, the user scanning it MUST be a Therapist
        if ($type === GebruikerKoppelingen::TYPE_THERAPIST && $currentUser->getRol() !== 'behandelaar') {
            return $this->json(['error' => 'Alleen een behandelaar kan deze code gebruiken.'], 403);
        }

        // 5. Duplicate Check
        $existingLink = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
            'gebruiker' => $patient,
            'gekoppelde_gebruiker' => $currentUser
        ]);

        if ($existingLink) {
            return $this->json(['error' => 'U bent al gekoppeld aan deze gebruiker.'], 409);
        }

        // 6. Create Connection
        $connection = new GebruikerKoppelingen();
        $connection->setGebruiker($patient);
        $connection->setGekoppeldeGebruiker($currentUser);
        $connection->setConnectionType($type);
        $connection->setStatus(GebruikerKoppelingen::STATUS_ACTIVE);

        // Auto-assign permissions
        if ($type === GebruikerKoppelingen::TYPE_THERAPIST) {
            $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_WRITE);
        } else {
            $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_READ);
        }

        // 7. Burn Code
        $em->remove($pairingCode);

        $em->persist($connection);
        $em->flush();

        return $this->json([
            'message' => 'Succesvol gekoppeld!',
            'patient' => [
                'name' => $patient->getVoornaam() . ' ' . $patient->getAchternaam(),
                'type' => $type
            ]
        ]);
    }

    #[Route('/unlink/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function unlink(string $id, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        // 1. Fix UUID format if it is missing hyphens (32 chars)
        if (preg_match('/^[a-f\d]{32}$/i', $id)) {
            $id = sprintf('%s-%s-%s-%s-%s', substr($id, 0, 8), substr($id, 8, 4), substr($id, 12, 4), substr($id, 16, 4), substr($id, 20));
        }

        // 2. Find the other user (Target)
        $otherUser = $em->getRepository(Gebruikers::class)->find($id);
        if (!$otherUser) {
            return $this->json(['error' => 'User not found.'], 404);
        }

        $repo = $em->getRepository(GebruikerKoppelingen::class);

        // 3. Search for the connection (Check both directions)

        // Direction A: I am the Patient, removing the Therapist/Family
        $connection = $repo->findOneBy([
            'gebruiker' => $currentUser,
            'gekoppelde_gebruiker' => $otherUser
        ]);

        // Direction B: I am the Therapist/Family, removing the Patient
        if (!$connection) {
            $connection = $repo->findOneBy([
                'gebruiker' => $otherUser, // They are the patient
                'gekoppelde_gebruiker' => $currentUser // I am the linked user
            ]);
        }

        if (!$connection) {
            return $this->json(['error' => 'No connection found with this user.'], 404);
        }

        // 4. Remove
        $em->remove($connection);
        $em->flush();

        return $this->json(['message' => 'Connection removed successfully.']);
    }
}