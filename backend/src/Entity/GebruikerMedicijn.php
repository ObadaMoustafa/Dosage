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

    // Optional link to general medicine DB (can be null if custom medicine)
    #[ORM\ManyToOne]
    private ?Medicijnen $medicijn_ref = null;

    // Encrypted details about this specific user's medicine
    #[ORM\Column(type: Types::TEXT)]
    private ?string $medicijn_versleuteld = null; 

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    public function __construct()
    {
        $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    public function getId(): ?Uuid { return $this->id; }
    
    public function getGebruiker(): ?Gebruikers { return $this->gebruiker; }
    public function setGebruiker(?Gebruikers $gebruiker): static { $this->gebruiker = $gebruiker; return $this; }

    public function getMedicijnVersleuteld(): ?string { return $this->medicijn_versleuteld; }
    public function setMedicijnVersleuteld(string $medicijn_versleuteld): static { $this->medicijn_versleuteld = $medicijn_versleuteld; return $this; }
}