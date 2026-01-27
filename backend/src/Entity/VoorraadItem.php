<?php

namespace App\Entity;

use App\Repository\VoorraadItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: VoorraadItemRepository::class)]
#[ORM\Table(name: 'voorraad_item')]
class VoorraadItem
{
    public const STATUS_OP_PEIL = 'Op peil';
    public const STATUS_BIJNA_OP = 'Bijna op';
    public const STATUS_BIJNA_LEEG = 'Bijna leeg';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Gebruikers $gebruiker = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $strips_count = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $pills_per_strip = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $loose_pills = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $threshold = null;

    #[ORM\Column(length: 20)]
    private ?string $status = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $last_updated = null;

    public function __construct()
    {
        $this->last_updated = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
        $this->status = self::STATUS_OP_PEIL;
        $this->loose_pills = 0;
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getStripsCount(): ?int
    {
        return $this->strips_count;
    }

    public function setStripsCount(int $strips_count): static
    {
        $this->strips_count = $strips_count;
        return $this;
    }

    public function getPillsPerStrip(): ?int
    {
        return $this->pills_per_strip;
    }

    public function setPillsPerStrip(int $pills_per_strip): static
    {
        $this->pills_per_strip = $pills_per_strip;
        return $this;
    }

    public function getLoosePills(): ?int
    {
        return $this->loose_pills;
    }

    public function setLoosePills(int $loose_pills): static
    {
        $this->loose_pills = $loose_pills;
        return $this;
    }

    public function getThreshold(): ?int
    {
        return $this->threshold;
    }

    public function setThreshold(int $threshold): static
    {
        $this->threshold = $threshold;
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

    public function getLastUpdated(): ?\DateTimeInterface
    {
        return $this->last_updated;
    }

    public function setLastUpdated(\DateTimeInterface $last_updated): static
    {
        $this->last_updated = $last_updated;
        return $this;
    }
}
