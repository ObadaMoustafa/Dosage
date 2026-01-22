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

    // Just the name of the medicine (Plain Text)
    #[ORM\Column(length: 255)]
    private ?string $medicijn = null;

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

    public function getMedicijn(): ?string
    {
        return $this->medicijn;
    }
    public function setMedicijn(string $medicijn): static
    {
        $this->medicijn = $medicijn;
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