<?php

namespace App\Controller;

use App\Entity\GebruikerAuth;
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

        // 1. Validate input (Updated)
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['role']) || !isset($data['first_name']) || !isset($data['last_name'])) {
            return $this->json(['message' => 'Missing required fields'], 400);
        }

        // 2. Create Profile (Gebruikers) first
        $profile = new Gebruikers();
        // save names
        $profile->setVoornaam($data['first_name']);
        $profile->setAchternaam($data['last_name']);

        // Role should be: patient, behandelaar, or admin
        $profile->setRol($data['role']); 
        // Set created_at time to Europe/Amsterdam
        
        // 3. Create Auth User (GebruikerAuth)
        $user = new GebruikerAuth();
        $user->setEmail($data['email']);
        $user->setGebruiker($profile); // Link the profile to the auth user

        // 4. Hash the password
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // 5. Save to Database
        try {
            $entityManager->persist($profile);
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