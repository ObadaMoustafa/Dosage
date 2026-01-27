<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260127172000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add loose_pills to voorraad_item';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE voorraad_item ADD COLUMN loose_pills INTEGER NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE voorraad_item DROP COLUMN loose_pills');
    }
}
