<?php

namespace App\Entity;

use App\Repository\GebruikerMedicijnSchemaRepository;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikerMedicijnSchemaRepository::class)]
#[ORM\Table(name: 'gebruiker_medicijn_schema')]
class GebruikerMedicijnSchema
{
    public const string STATUS_OPTIJD = 'optijd';
    public const string STATUS_GEMIST = 'gemist';

    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    // gmn_id -> UUID FK
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?GebruikerMedicijn $gebruikerMedicijn = null;

    // JSON {maandag: Boolean, ...}
    #[ORM\Column(type: Types::JSON)]
    private array $dagen = [];

    // JSON [time, ...]
    #[ORM\Column(type: Types::JSON)]
    private array $tijden = [];

    // number (Integer)
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $aantal = null;

    // upcoming turven time
    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?DateTimeInterface $next_occurrence = null;

    // text
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $beschrijving = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?DateTimeInterface $aangemaakt_op = null;

    public function __construct()
    {
        $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getGebruikerMedicijn(): ?GebruikerMedicijn
    {
        return $this->gebruikerMedicijn;
    }
    public function setGebruikerMedicijn(?GebruikerMedicijn $gebruikerMedicijn): static
    {
        $this->gebruikerMedicijn = $gebruikerMedicijn;
        return $this;
    }

    public function getDagen(): array
    {
        return $this->dagen;
    }
    public function setDagen(array $dagen): static
    {
        $this->dagen = $dagen;
        return $this;
    }

    public function getTijden(): array
    {
        return $this->tijden;
    }
    public function setTijden(array $tijden): static
    {
        $this->tijden = $tijden;
        return $this;
    }

    public function getAantal(): ?int
    {
        return $this->aantal;
    }
    public function setAantal(int $aantal): static
    {
        $this->aantal = $aantal;
        return $this;
    }

    public function getNextOccurrence(): ?DateTimeInterface
    {
        return $this->next_occurrence;
    }

    public function setNextOccurrence(?DateTimeInterface $nextOccurrence): static
    {
        $this->next_occurrence = $nextOccurrence;
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

    public function getAangemaaktOp(): ?DateTimeInterface
    {
        return $this->aangemaakt_op;
    }
}