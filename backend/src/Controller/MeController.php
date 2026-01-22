<?php

namespace App\Controller;

use App\Entity\Gebruikers;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class MeController extends AbstractController
{
    #[Route('/api/auth/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var Gebruikers|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'User not found or not logged in'], 401);
        }

        // $user is now the profile itself, no need for getGebruiker()
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'first_name' => $user->getVoornaam(),
            'last_name' => $user->getAchternaam(),
            'role' => $user->getRol(),
            'avatar_url' => $user->getAvatarUrl(),
            'created_at' => $user->getAangemaaktOp()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/api/auth/me', name: 'api_me_update', methods: ['PUT'])]
    public function updateProfile(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var Gebruikers|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        // 1. Update Names
        if (isset($data['first_name'])) {
            $user->setVoornaam($data['first_name']);
        }
        if (isset($data['last_name'])) {
            $user->setAchternaam($data['last_name']);
        }

        // 2. Regenerate Avatar if names changed
        if (isset($data['first_name']) || isset($data['last_name'])) {
            $fullName = "{$user->getVoornaam()}+{$user->getAchternaam()}";
            $avatarUrl = "https://ui-avatars.com/api/?name={$fullName}&background=random&color=fff&size=128&bold=true&rounded=true&format=png";
            $user->setAvatarUrl($avatarUrl);
        }

        // 3. Update Email (handle uniqueness)
        if (isset($data['email']) && $data['email'] !== $user->getEmail()) {
            $user->setEmail($data['email']);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();
        } catch (UniqueConstraintViolationException $e) {
            return $this->json(['error' => 'This email is already in use.'], 409);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Update failed: ' . $e->getMessage()], 500);
        }

        return $this->json(['message' => 'Profile updated successfully']);
    }

    #[Route('/api/auth/change-password', name: 'api_change_password', methods: ['PUT'])]
    public function changePassword(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var Gebruikers|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['current_password']) || !isset($data['new_password'])) {
            return $this->json(['message' => 'Missing fields'], 400);
        }

        // 1. Verify Current Password
        if (!$passwordHasher->isPasswordValid($user, $data['current_password'])) {
            return $this->json(['error' => 'Huidig wachtwoord is onjuist.'], 400); // Incorrect current password
        }

        // 2. Hash and Set New Password
        $newHashedPassword = $passwordHasher->hashPassword($user, $data['new_password']);
        $user->setPassword($newHashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json(['message' => 'Password changed successfully']);
    }

    #[Route('/api/auth/me', name: 'api_me_delete', methods: ['DELETE'])]
    public function deleteAccount(EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var Gebruikers|null $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        // Just remove the user (Profile and Auth are now one)
        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(['message' => 'Account deleted successfully']);
    }
}