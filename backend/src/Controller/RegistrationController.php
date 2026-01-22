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

class RegistrationController extends AbstractController
{
    #[Route('/api/auth/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // 1. Validate input
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['first_name']) || !isset($data['last_name'])) {
            return $this->json(['message' => 'Missing required fields'], 400);
        }

        $user = new Gebruikers();

        // 2. Basic Info
        $user->setVoornaam($data['first_name']);
        $user->setAchternaam($data['last_name']);

        // 3. Avatar Generation
        $fullName = "{$data['first_name']}+{$data['last_name']}";
        $avatarUrl = "https://ui-avatars.com/api/?name={$fullName}&background=random&color=fff&size=128&bold=true&rounded=true&format=png";
        $user->setAvatarUrl($avatarUrl);

        // 4. Force Role to PATIENT or registration.
        $user->setRol('patient');

        // 5. Auth Info
        $user->setEmail($data['email']);

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // 6. Save to Database
        try {
            $entityManager->persist($user);
            $entityManager->flush();
        } catch (UniqueConstraintViolationException $e) {
            return $this->json(['message' => 'Email already exists'], 409);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Registration error: ' . $e->getMessage()], 500);
        }

        return $this->json(['message' => 'User registered successfully'], 201);
    }
}