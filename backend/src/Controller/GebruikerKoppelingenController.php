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
class GebruikerKoppelingenController extends AbstractController
{
    #[Route('/invite', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function generateCode(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        // Default to TRUSTED if not provided
        $type = strtoupper($data['type'] ?? GebruikerKoppelingen::TYPE_TRUSTED);

        // Validation: Only allow supported types
        if (!in_array($type, [GebruikerKoppelingen::TYPE_TRUSTED, GebruikerKoppelingen::TYPE_THERAPIST])) {
            return $this->json(['error' => 'Invalid connection type.'], 400);
        }

        // Rule: Cleanup Old Codes (Expired OR Active) for this specific type to avoid duplicates
        $oldCode = $em->getRepository(PairingCode::class)->findOneBy([
            'gebruiker' => $user,
            'connectionType' => $type
        ]);

        if ($oldCode) {
            $em->remove($oldCode);
        }

        // Generate New 6-digit Code
        $codeString = (string) random_int(100000, 999999);

        $pairingCode = new PairingCode();
        $pairingCode->setCode($codeString);
        $pairingCode->setGebruiker($user);
        $pairingCode->setConnectionType($type);

        // Set expiry (15 minutes from now)
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
            return $this->json(['error' => 'Invalid code.'], 404);
        }

        // 2. Validate Expiry
        if (!$pairingCode->isValid()) {
            $em->remove($pairingCode);
            $em->flush();
            return $this->json(['error' => 'Code has expired.'], 400);
        }

        $patient = $pairingCode->getGebruiker();
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();
        $type = $pairingCode->getConnectionType();

        // 3. Prevent Self-Linking
        if ($patient === $currentUser) {
            return $this->json(['error' => 'You cannot link to yourself.'], 400);
        }

        // 4. Role Validation: If code is for THERAPIST, scanner must be a 'behandelaar'
        if ($type === GebruikerKoppelingen::TYPE_THERAPIST && $currentUser->getRol() !== 'behandelaar') {
            return $this->json(['error' => 'Only a therapist can scan this code.'], 403);
        }

        // 5. Duplicate Check
        $existingLink = $em->getRepository(GebruikerKoppelingen::class)->findOneBy([
            'gebruiker' => $patient,
            'gekoppelde_gebruiker' => $currentUser
        ]);

        if ($existingLink) {
            return $this->json(['error' => 'You are already linked to this user.'], 409);
        }

        // 6. Create Connection
        $connection = new GebruikerKoppelingen();
        $connection->setGebruiker($patient);
        $connection->setGekoppeldeGebruiker($currentUser);
        $connection->setConnectionType($type);

        // Note: 'aangemaakt_op' is set automatically in the Entity constructor

        // Auto-assign permissions based on type
        if ($type === GebruikerKoppelingen::TYPE_THERAPIST) {
            $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_WRITE);
        } else {
            $connection->setAccessLevel(GebruikerKoppelingen::ACCESS_READ);
        }

        // 7. Burn Code (One-time use)
        $em->remove($pairingCode);

        $em->persist($connection);
        $em->flush();

        return $this->json([
            'message' => 'Successfully linked!',
            'patient' => [
                'name' => $patient->getVoornaam() . ' ' . $patient->getAchternaam(),
                'type' => $type
            ]
        ]);
    }

    #[Route('/viewers', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getMyViewers(EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        // Query: Who is watching ME? (I am the 'gebruiker')
        $connections = $em->getRepository(GebruikerKoppelingen::class)->findBy([
            'gebruiker' => $currentUser,
        ]);

        $response = [
            'therapists' => [], // Doctors
            'trusted' => []     // Family/Friends
        ];

        foreach ($connections as $conn) {
            $viewer = $conn->getGekoppeldeGebruiker();

            $item = [
                'connection_id' => $conn->getId(), // Needed for Unlink action
                'user_id' => $viewer->getId(),
                'name' => $viewer->getVoornaam() . ' ' . $viewer->getAchternaam(),
                'email' => $viewer->getEmail(),
                'avatar' => $viewer->getAvatarUrl(),
                'role' => $viewer->getRol(),
                'access' => $conn->getConnectionType(),
                'since' => $conn->getCreatedAt()->format('Y-m-d')
            ];

            if ($conn->getConnectionType() === GebruikerKoppelingen::TYPE_THERAPIST) {
                $response['therapists'][] = $item;
            } else {
                $response['trusted'][] = $item;
            }
        }

        return $this->json($response);
    }

    // For the user to get the people who he can see {full_access & read_only}
    #[Route('/subjects', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getMySubjects(EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        // Check connections
        $connections = $em->getRepository(GebruikerKoppelingen::class)->findBy([
            'gekoppelde_gebruiker' => $currentUser,
        ]);

        $response = [
            'full_access' => [], // For patients I treat as a Doctor
            'read_only' => []    // For family members/friends I care for
        ];

        foreach ($connections as $conn) {
            $subject = $conn->getGebruiker();

            $item = [
                'connection_id' => $conn->getId(), // Needed for Unlink action
                'user_id' => $subject->getId(),
                'name' => $subject->getVoornaam() . ' ' . $subject->getAchternaam(),
                'avatar' => $subject->getAvatarUrl(),
                'email' => $subject->getEmail(), // Maybe useful for doctors
                'since' => $conn->getCreatedAt()->format('Y-m-d')
            ];

            if ($conn->getAccessLevel() === GebruikerKoppelingen::ACCESS_WRITE) {
                $response['full_access'][] = $item;
            } else {
                $response['read_only'][] = $item;
            }
        }

        return $this->json($response);
    }

    #[Route('/unlink/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function unlink(string $id, EntityManagerInterface $em): JsonResponse
    {
        /** @var Gebruikers $currentUser */
        $currentUser = $this->getUser();

        // Find the other user (Target)
        $otherUser = $em->getRepository(Gebruikers::class)->find($id);
        if (!$otherUser) {
            return $this->json(['error' => 'User not found.'], 404);
        }

        $repo = $em->getRepository(GebruikerKoppelingen::class);

        // Check for connection in both directions
        // Direction A: Current User is the Patient
        $connection = $repo->findOneBy([
            'gebruiker' => $currentUser,
            'gekoppelde_gebruiker' => $otherUser
        ]);

        // Direction B: Current User is the Linked User (Therapist/Family)
        if (!$connection) {
            $connection = $repo->findOneBy([
                'gebruiker' => $otherUser,
                'gekoppelde_gebruiker' => $currentUser
            ]);
        }

        if (!$connection) {
            return $this->json(['error' => 'No connection found with this user.'], 404);
        }

        $em->remove($connection);
        $em->flush();

        return $this->json(['message' => 'Connection removed successfully.']);
    }
}