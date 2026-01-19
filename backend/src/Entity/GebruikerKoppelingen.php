<?php

namespace App\Entity;

use App\Repository\GebruikerKoppelingenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikerKoppelingenRepository::class)]
class GebruikerKoppelingen
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    // The Patient
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gebruiker = null;

    // The Caregiver (Behandelaar)
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gekoppelde_gebruiker = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $rechten = null; // {"read": true}

    #[ORM\Column(length: 20)]
    private ?string $status = null; // active, pending

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    public function __construct()
    {
        $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    public function getId(): ?Uuid { return $this->id; }
    
    public function getGebruiker(): ?Gebruikers { return $this->gebruiker; }
    public function setGebruiker(?Gebruikers $gebruiker): static { $this->gebruiker = $gebruiker; return $this; }

    public function getGekoppeldeGebruiker(): ?Gebruikers { return $this->gekoppelde_gebruiker; }
    public function setGekoppeldeGebruiker(?Gebruikers $gekoppelde_gebruiker): static { $this->gekoppelde_gebruiker = $gekoppelde_gebruiker; return $this; }

    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }
}