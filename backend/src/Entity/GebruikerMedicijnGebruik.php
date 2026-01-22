<?php

namespace App\Entity;

use App\Repository\GebruikerMedicijnGebruikRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikerMedicijnGebruikRepository::class)]
#[ORM\Table(name: 'gebruiker_medicijn_gebruik')]
class GebruikerMedicijnGebruik
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?GebruikerMedicijn $gebruikerMedicijn = null;

    // Optional: linked to a schedule
    #[ORM\ManyToOne]
    private ?GebruikerMedicijnSchema $gebruikerMedicijnSchema = null;

    // Number of tablets taken (Integer)
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $medicijn_turven = null;

    // Last time taken or updated
    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    public function __construct()
    {
        $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
        $this->medicijn_turven = 0; // Default starts at 0
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

    public function getGebruikerMedicijnSchema(): ?GebruikerMedicijnSchema
    {
        return $this->gebruikerMedicijnSchema;
    }
    public function setGebruikerMedicijnSchema(?GebruikerMedicijnSchema $gebruikerMedicijnSchema): static
    {
        $this->gebruikerMedicijnSchema = $gebruikerMedicijnSchema;
        return $this;
    }

    public function getMedicijnTurven(): ?int
    {
        return $this->medicijn_turven;
    }
    public function setMedicijnTurven(int $medicijn_turven): static
    {
        $this->medicijn_turven = $medicijn_turven;
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