<?php

namespace App\Entity;

use App\Repository\GebruikerKoppelingenRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikerKoppelingenRepository::class)]
class GebruikerKoppelingen
{
    public const ACCESS_READ = 'READ_ONLY';
    public const ACCESS_WRITE = 'FULL_ACCESS';

    public const TYPE_FAMILY = 'FAMILY';
    public const TYPE_THERAPIST = 'THERAPIST';

    public const STATUS_ACTIVE = 'active';
    public const STATUS_PENDING = 'pending';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gebruiker = null; // Patient

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gekoppelde_gebruiker = null; // Doctor/Family

    // READ_ONLY or FULL_ACCESS
    #[ORM\Column(length: 20, name: 'toegangsniveau')]
    private ?string $accessLevel = null;

    // FAMILY or THERAPIST
    #[ORM\Column(length: 20, name: 'type_verbinding')]
    private ?string $connectionType = null;

    #[ORM\Column(length: 20)]
    private ?string $status = self::STATUS_ACTIVE;

    #[ORM\Column(type: 'datetime', name: 'aangemaakt_op')]
    private ?\DateTimeInterface $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    // Getters & Setters
    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getGebruiker(): ?Gebruikers
    {
        return $this->gebruiker;
    }
    public function setGebruiker(?Gebruikers $gebruiker): static
    {
        $this->gebruiker = $gebruiker;
        return $this;
    }

    public function getGekoppeldeGebruiker(): ?Gebruikers
    {
        return $this->gekoppelde_gebruiker;
    }
    public function setGekoppeldeGebruiker(?Gebruikers $gekoppelde_gebruiker): static
    {
        $this->gekoppelde_gebruiker = $gekoppelde_gebruiker;
        return $this;
    }

    public function getAccessLevel(): ?string
    {
        return $this->accessLevel;
    }
    public function setAccessLevel(string $accessLevel): static
    {
        $this->accessLevel = $accessLevel;
        return $this;
    }

    public function getConnectionType(): ?string
    {
        return $this->connectionType;
    }
    public function setConnectionType(string $connectionType): static
    {
        $this->connectionType = $connectionType;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }
    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }
}