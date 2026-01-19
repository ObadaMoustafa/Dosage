<?php

namespace App\Entity;

use App\Repository\GebruikersRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikersRepository::class)]
class Gebruikers
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    // patient, behandelaar, admin
    #[ORM\Column(length: 20)]
    private ?string $rol = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $publieke_sleutel = null;

    // Encrypted profile data
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $profielgegevens = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    #[ORM\OneToOne(mappedBy: 'gebruiker', cascade: ['persist', 'remove'])]
    private ?GebruikerAuth $gebruikerAuth = null;

    public function __construct()
    {
       $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getRol(): ?string
    {
        return $this->rol;
    }

    public function setRol(string $rol): static
    {
        $this->rol = $rol;
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

    public function getGebruikerAuth(): ?GebruikerAuth
    {
        return $this->gebruikerAuth;
    }

    public function setGebruikerAuth(GebruikerAuth $gebruikerAuth): static
    {
        if ($gebruikerAuth->getGebruiker() !== $this) {
            $gebruikerAuth->setGebruiker($this);
        }
        $this->gebruikerAuth = $gebruikerAuth;
        return $this;
    }


    
}