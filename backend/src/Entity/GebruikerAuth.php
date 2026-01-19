<?php

namespace App\Entity;

use App\Repository\GebruikerAuthRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikerAuthRepository::class)]
#[ORM\Table(name: 'gebruiker_auth')]
class GebruikerAuth implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $laatste_login = null;

    // One-to-One relation with Gebruikers (Profile)
    #[ORM\OneToOne(inversedBy: 'gebruikerAuth', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gebruiker = null;

    public function __construct()
    {
        $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        // Get role from profile, default to ROLE_USER
        $role = $this->gebruiker ? $this->gebruiker->getRol() : null;
        
        $roles = ['ROLE_USER'];
        if ($role === 'admin') {
            $roles[] = 'ROLE_ADMIN';
        } elseif ($role === 'behandelaar') {
            $roles[] = 'ROLE_BEHANDELAAR';
        }

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        // Not used, roles are determined by Gebruikers entity
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    public function getGebruiker(): ?Gebruikers
    {
        return $this->gebruiker;
    }

    public function setGebruiker(Gebruikers $gebruiker): static
    {
        $this->gebruiker = $gebruiker;
        return $this;
    }

    public function getLaatsteLogin(): ?\DateTimeInterface
    {
        return $this->laatste_login;
    }

    public function setLaatsteLogin(?\DateTimeInterface $laatste_login): static
    {
        $this->laatste_login = $laatste_login;

        return $this;
    }
}