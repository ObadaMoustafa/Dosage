<?php

namespace App\Entity;

use App\Repository\GebruikersRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikersRepository::class)]
class Gebruikers implements UserInterface, PasswordAuthenticatedUserInterface
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

    #[ORM\Column(length: 255)]
    private ?string $voornaam = null;

    #[ORM\Column(length: 255)]
    private ?string $achternaam = null;

    // patient, behandelaar, admin
    #[ORM\Column(length: 20)]
    private ?string $rol = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar_url = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $publieke_sleutel = null;

    // Encrypted profile data
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $profielgegevens = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $laatste_login = null;

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

    /**
     * A visual identifier that represents this user.
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        // Default role
        $roles = ['ROLE_USER'];

        // Map your string role to Symfony Role
        if ($this->rol === 'admin') {
            $roles[] = 'ROLE_ADMIN';
        } elseif ($this->rol === 'behandelaar') {
            $roles[] = 'ROLE_BEHANDELAAR';
        } elseif ($this->rol === 'patient') {
            $roles[] = 'ROLE_PATIENT';
        }

        return array_unique($roles);
    }

    public function getRol(): ?string
    {
        return $this->rol;
    }

    public function setRol(string $rol): static
    {
        $allowedRoles = ['patient', 'behandelaar', 'admin'];

        if (!\in_array($rol, $allowedRoles)) {
            throw new \InvalidArgumentException("Invalid role. Allowed: " . implode(', ', $allowedRoles));
        }

        $this->rol = $rol;
        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    public function getVoornaam(): ?string
    {
        return $this->voornaam;
    }

    public function setVoornaam(string $voornaam): static
    {
        $this->voornaam = $voornaam;
        return $this;
    }

    public function getAchternaam(): ?string
    {
        return $this->achternaam;
    }

    public function setAchternaam(string $achternaam): static
    {
        $this->achternaam = $achternaam;
        return $this;
    }



    public function getAvatarUrl(): ?string
    {
        return $this->avatar_url;
    }

    public function setAvatarUrl(?string $avatar_url): static
    {
        $this->avatar_url = $avatar_url;
        return $this;
    }

    public function getPubliekeSleutel(): ?string
    {
        return $this->publieke_sleutel;
    }

    public function setPubliekeSleutel(?string $publieke_sleutel): static
    {
        $this->publieke_sleutel = $publieke_sleutel;
        return $this;
    }

    public function getProfielgegevens(): ?string
    {
        return $this->profielgegevens;
    }

    public function setProfielgegevens(?string $profielgegevens): static
    {
        $this->profielgegevens = $profielgegevens;
        return $this;
    }

    public function getAangemaaktOp(): ?\DateTimeInterface
    {
        return $this->aangemaakt_op;
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