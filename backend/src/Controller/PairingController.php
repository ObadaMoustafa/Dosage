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

        // Rule 1: Therapist Singleton Check
        if ($type === GebruikerKoppelingen::TYPE_THERAPIST) {
            $existingTherapist = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
                'gebruiker' => $user,
                'connectionType' => GebruikerKoppelingen::TYPE_THERAPIST
            ]);

            if ($existingTherapist) {
                return $this->json(['error' => 'U heeft al een hoofdbehandelaar. Ontkoppel deze eerst.'], 403);
            }
        }

        // Rule 2: Cleanup Old Codes (Expired OR Active) for this specific type
        // If the user requests a new code, we assume they lost the old one or it expired.
        // We delete ANY previous code for this user & type to avoid duplicates.
        $oldCode = $em->getRepository(PairingCode::class)->findOneBy([
            'gebruiker' => $user,
            'connectionType' => $type
        ]);

        if ($oldCode) {
            $em->remove($oldCode);
            // We flush later
        }

        // Generate New Code
        $codeString = (string) random_int(10000, 99999);

        $pairingCode = new PairingCode();
        $pairingCode->setCode($codeString);
        $pairingCode->setGebruiker($user);
        $pairingCode->setConnectionType($type);
        $pairingCode->setExpiresAt(new \DateTime('+15 minutes'));

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

        // 2. Lazy Cleanup: Check Expiry
        if (!$pairingCode->isValid()) {
            // Code exists but expired -> DELETE IT immediately
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

        // 4. Check if already linked (Duplicate Check)
        $existingLink = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
            'gebruiker' => $patient,
            'gekoppelde_gebruiker' => $currentUser
        ]);

        if ($existingLink) {
            return $this->json(['error' => 'U bent al gekoppeld aan deze gebruiker.'], 409);
        }

        // 5. Create Connection
        $connection = new GebruikerKoppelingen();
        $connection->setGebruiker($patient);
        $connection->setGekoppeldeGebruiker($currentUser);
        $connection->setConnectionType($type);
        // Set Status Active immediately as implied by code usage
        $connection->setStatus(GebruikerKoppelingen::STATUS_ACTIVE);

        // Auto-assign permissions
        if ($type === GebruikerKoppelingen::TYPE_THERAPIST) {
            $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_WRITE);
        } else {
            $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_READ);
        }

        // 6. Burn the used code
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
        // Finds the connection by ID
        $connection = $em->getRepository(GebruikerKoppelingen::class)->find($id);

        if (!$connection) {
            return $this->json(['error' => 'Koppeling niet gevonden.'], 404);
        }

        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        // Authorization Rule:
        // You can delete if you are the PATIENT (owner) OR the LINKED USER (leaving)
        if ($connection->getGebruiker() !== $currentUser && $connection->getGekoppeldeGebruiker() !== $currentUser) {
            return $this->json(['error' => 'Niet toegestaan.'], 403);
        }

        $em->remove($connection);
        $em->flush();

        return $this->json(['message' => 'Koppeling verbroken.']);
    }
}