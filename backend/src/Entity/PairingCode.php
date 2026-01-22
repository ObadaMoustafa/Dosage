<?php

namespace App\Entity;

use App\Repository\PairingCodeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PairingCodeRepository::class)]
class PairingCode
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 10, unique: true)]
    private ?string $code = null;

    // THERAPIST or FAMILY
    #[ORM\Column(length: 20, name: 'type_verbinding')]
    private ?string $connectionType = null;

    #[ORM\Column(type: 'datetime', name: 'verloopt_op')]
    private ?\DateTimeInterface $expiresAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gebruiker = null; // Patient

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }
    public function setCode(string $code): static
    {
        $this->code = $code;
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

    public function getExpiresAt(): ?\DateTimeInterface
    {
        return $this->expiresAt;
    }
    public function setExpiresAt(\DateTimeInterface $expiresAt): static
    {
        $this->expiresAt = $expiresAt;
        return $this;
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

    public function isValid(): bool
    {
        return $this->expiresAt > new \DateTime();
    }
}