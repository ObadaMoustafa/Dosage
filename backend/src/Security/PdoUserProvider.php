<?php

namespace App\Security;

use PDO;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class PdoUserProvider implements UserProviderInterface
{
    public function __construct(private PDO $pdo)
    {
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $stmt = $this->pdo->prepare('
            SELECT id, first_name, last_name, email, password, roles, avatar_url, created_at
            FROM users
            WHERE email = :email
            LIMIT 1
        ');
        $stmt->execute(['email' => $identifier]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            $exception = new UserNotFoundException(sprintf('User "%s" not found.', $identifier));
            $exception->setUserIdentifier($identifier);
            throw $exception;
        }

        $roles = json_decode($row['roles'] ?? '[]', true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($roles)) {
            $roles = [];
        }

        return new User(
            (int) $row['id'],
            $row['first_name'],
            $row['last_name'],
            $row['email'],
            $row['password'],
            $roles,
            $row['avatar_url'] ?? null,
            $row['created_at']
        );
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new \InvalidArgumentException('Unsupported user class.');
        }

        return $this->loadUserByIdentifier($user->getUserIdentifier());
    }

    public function supportsClass(string $class): bool
    {
        return $class === User::class;
    }
}
