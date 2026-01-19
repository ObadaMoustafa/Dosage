<?php

namespace App\Entity;

use App\Repository\GebruikerMedicijnSchemaRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: GebruikerMedicijnSchemaRepository::class)]
#[ORM\Table(name: 'gebruiker_medicijn_schema')]
class GebruikerMedicijnSchema
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id = null;

    // Link to the user's specific medicine
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?GebruikerMedicijn $gebruikerMedicijn = null;

    // Encrypted schedule details (times, days, etc.)
    #[ORM\Column(type: Types::TEXT)]
    private ?string $medicijn_schema = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $aangemaakt_op = null;

    public function __construct()
    {
        $this->aangemaakt_op = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
    }

    public function getId(): ?Uuid { return $this->id; }

    public function getGebruikerMedicijn(): ?GebruikerMedicijn { return $this->gebruikerMedicijn; }
    public function setGebruikerMedicijn(?GebruikerMedicijn $gebruikerMedicijn): static { $this->gebruikerMedicijn = $gebruikerMedicijn; return $this; }

    public function getMedicijnSchema(): ?string { return $this->medicijn_schema; }
    public function setMedicijnSchema(string $medicijn_schema): static { $this->medicijn_schema = $medicijn_schema; return $this; }
}