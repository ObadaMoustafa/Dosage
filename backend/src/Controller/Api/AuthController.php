<?php

namespace App\Controller\Api;

use App\Security\User;
use PDO;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $hasher, PDO $pdo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON body.'], 400);
        }

        $firstName = trim((string) ($data['first_name'] ?? ''));
        $lastName = trim((string) ($data['last_name'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($firstName === '' || $lastName === '' || $email === '' || $password === '') {
            return $this->json(['error' => 'first_name, last_name, email and password are required.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Invalid email format.'], 400);
        }

        $stmt = $pdo->prepare('SELECT 1 FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        if ($stmt->fetchColumn()) {
            return $this->json(['error' => 'Email already registered.'], 409);
        }

        $avatarUrl = trim((string) ($data['avatar_url'] ?? ''));
        $avatarUrl = $avatarUrl !== '' ? $avatarUrl : null;
        $createdAt = (new \DateTimeImmutable())->format('c');
        $userForHash = new User(0, $firstName, $lastName, $email, '', ['ROLE_USER'], $avatarUrl, $createdAt);
        $passwordHash = $hasher->hashPassword($userForHash, $password);
        $rolesJson = json_encode(['ROLE_USER'], JSON_THROW_ON_ERROR);

        $insert = $pdo->prepare('
            INSERT INTO users (first_name, last_name, email, password, roles, avatar_url, created_at)
            VALUES (:first_name, :last_name, :email, :password, :roles, :avatar_url, :created_at)
        ');
        $insert->execute([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => $passwordHash,
            'roles' => $rolesJson,
            'avatar_url' => $avatarUrl,
            'created_at' => $createdAt,
        ]);

        $id = (int) $pdo->lastInsertId();

        return $this->json([
            'id' => $id,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'roles' => ['ROLE_USER'],
            'avatar_url' => $avatarUrl,
            'created_at' => $createdAt,
        ], 201);
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthenticated.'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'avatar_url' => $user->getAvatarUrl(),
            'created_at' => $user->getCreatedAt(),
        ]);
    }

    #[Route('/api/me', name: 'api_me_update', methods: ['PUT'])]
    public function updateMe(Request $request, PDO $pdo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthenticated.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON body.'], 400);
        }

        $firstName = isset($data['first_name']) ? trim((string) $data['first_name']) : $user->getFirstName();
        $lastName = isset($data['last_name']) ? trim((string) $data['last_name']) : $user->getLastName();
        $avatarUrl = isset($data['avatar_url']) ? trim((string) $data['avatar_url']) : ($user->getAvatarUrl() ?? '');
        $avatarUrl = $avatarUrl !== '' ? $avatarUrl : null;

        if ($firstName === '' || $lastName === '') {
            return $this->json(['error' => 'first_name and last_name are required.'], 400);
        }

        $stmt = $pdo->prepare('
            UPDATE users
            SET first_name = :first_name,
                last_name = :last_name,
                avatar_url = :avatar_url
            WHERE id = :id
        ');
        $stmt->execute([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'avatar_url' => $avatarUrl,
            'id' => $user->getId(),
        ]);

        return $this->json([
            'id' => $user->getId(),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'avatar_url' => $avatarUrl,
            'created_at' => $user->getCreatedAt(),
        ]);
    }

    #[Route('/api/password', name: 'api_password_update', methods: ['PUT'])]
    public function updatePassword(
        Request $request,
        PDO $pdo,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthenticated.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON body.'], 400);
        }

        $currentPassword = (string) ($data['current_password'] ?? '');
        $newPassword = (string) ($data['new_password'] ?? '');

        if ($currentPassword === '' || $newPassword === '') {
            return $this->json(['error' => 'current_password and new_password are required.'], 400);
        }

        if (!$hasher->isPasswordValid($user, $currentPassword)) {
            return $this->json(['error' => 'Current password is incorrect.'], 400);
        }

        $passwordHash = $hasher->hashPassword($user, $newPassword);
        $stmt = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
        $stmt->execute([
            'password' => $passwordHash,
            'id' => $user->getId(),
        ]);

        return $this->json(['status' => 'ok']);
    }
}
