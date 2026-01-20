<?php

namespace App\Entity;

use App\Repository\MedicijnenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: MedicijnenRepository::class)]
class Medicijnen
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\Column(length: 100)]
    private ?string $naam = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $toedieningsvorm = null; // tablet, syrup, etc.

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $sterkte = null; // 500mg, etc.

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $beschrijving = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $bijsluiter = null; // Leaflet text

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
    public function getNaam(): ?string
    {
        return $this->naam;
    }
    public function setNaam(string $naam): static
    {
        $this->naam = $naam;
        return $this;
    }

    public function getToedieningsvorm()
    {
        return $this->toedieningsvorm;
    }

    public function setToedieningsvorm($toedieningsvorm)
    {
        $this->toedieningsvorm = $toedieningsvorm;
        return $this;
    }

    public function getSterkte()
    {
        return $this->sterkte;
    }

    public function setSterkte($sterkte)
    {
        $this->sterkte = $sterkte;
        return $this;
    }
    public function getBeschrijving()
    {
        return $this->beschrijving;
    }

    public function setBeschrijving($beschrijving)
    {
        $this->beschrijving = $beschrijving;
        return $this;
    }

    public function getBijsluiter()
    {
        return $this->bijsluiter;
    }

    public function setBijsluiter($bijsluiter)
    {
        $this->bijsluiter = $bijsluiter;
        return $this;
    }
}