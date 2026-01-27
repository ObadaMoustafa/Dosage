<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260127164500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Link gebruiker_medicijn to voorraad_item';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE gebruiker_medicijn ADD COLUMN voorraad_item_id BLOB DEFAULT NULL');
        $this->addSql('CREATE INDEX IDX_F89AB8AA1DEB4A9F ON gebruiker_medicijn (voorraad_item_id)');
        $this->addSql('ALTER TABLE gebruiker_medicijn ADD CONSTRAINT FK_F89AB8AA1DEB4A9F FOREIGN KEY (voorraad_item_id) REFERENCES voorraad_item (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE gebruiker_medicijn DROP COLUMN voorraad_item_id');
    }
}
