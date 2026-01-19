<?php

namespace App\Entity;

use App\Repository\LogMeldingenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LogMeldingenRepository::class)]
class LogMeldingen
{
    // Use standard ID for logs (auto-increment is fine here, or UUID if you prefer consistency)
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $tijdstip = null;

    #[ORM\Column(length: 200)]
    private ?string $onderdeel = null; // e.g., "Auth", "Database"

    #[ORM\Column(length: 2000)]
    private ?string $melding = null; // Error message

    public function __construct()
    {
        $this->tijdstip = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    public function getId(): ?int { return $this->id; }
    public function getTijdstip(): ?\DateTimeInterface { return $this->tijdstip; }
    public function setTijdstip(\DateTimeInterface $tijdstip): static { $this->tijdstip = $tijdstip; return $this; }
    public function getOnderdeel(): ?string { return $this->onderdeel; }
    public function setOnderdeel(string $onderdeel): static { $this->onderdeel = $onderdeel; return $this; }
    public function getMelding(): ?string { return $this->melding; }
    public function setMelding(string $melding): static { $this->melding = $melding; return $this; }
}