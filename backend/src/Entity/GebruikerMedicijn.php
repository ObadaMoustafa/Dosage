<?php

namespace App\Entity;

use App\Repository\GebruikerMedicijnRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikerMedicijnRepository::class)]
class GebruikerMedicijn
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gebruiker = null;

    #[ORM\Column(length: 255)]
    private ?string $medicijn_naam = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $toedieningsvorm = null; // e.g. Pill, Syrup

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $sterkte = null; // e.g. 500mg

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $beschrijving = null; // Usage instructions

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $bijsluiter = null; // Leaflet info or notes

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    public function __construct()
    {
        $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

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

    public function getMedicijnNaam(): ?string
    {
        return $this->medicijn_naam;
    }
    public function setMedicijnNaam(string $medicijn_naam): static
    {
        $this->medicijn_naam = $medicijn_naam;
        return $this;
    }

    public function getToedieningsvorm(): ?string
    {
        return $this->toedieningsvorm;
    }
    public function setToedieningsvorm(?string $toedieningsvorm): static
    {
        $this->toedieningsvorm = $toedieningsvorm;
        return $this;
    }

    public function getSterkte(): ?string
    {
        return $this->sterkte;
    }
    public function setSterkte(?string $sterkte): static
    {
        $this->sterkte = $sterkte;
        return $this;
    }

    public function getBeschrijving(): ?string
    {
        return $this->beschrijving;
    }
    public function setBeschrijving(?string $beschrijving): static
    {
        $this->beschrijving = $beschrijving;
        return $this;
    }

    public function getBijsluiter(): ?string
    {
        return $this->bijsluiter;
    }
    public function setBijsluiter(?string $bijsluiter): static
    {
        $this->bijsluiter = $bijsluiter;
        return $this;
    }

    public function getAangemaaktOp(): ?\DateTimeInterface
    {
        return $this->aangemaakt_op;
    }
    public function setAangemaaktOp(\DateTimeInterface $aangemaakt_op): static
    {
        $this->aangemaakt_op = $aangemaakt_op;
        return $this;
    }
}