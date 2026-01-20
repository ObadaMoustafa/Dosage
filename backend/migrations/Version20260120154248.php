<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260120154248 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE gebruikers ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruikers AS SELECT id, voornaam, achternaam, rol, publieke_sleutel, profielgegevens, aangemaakt_op FROM gebruikers');
        $this->addSql('DROP TABLE gebruikers');
        $this->addSql('CREATE TABLE gebruikers (id BLOB NOT NULL, voornaam VARCHAR(255) NOT NULL, achternaam VARCHAR(255) NOT NULL, rol VARCHAR(20) NOT NULL, publieke_sleutel CLOB DEFAULT NULL, profielgegevens CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, PRIMARY KEY (id))');
        $this->addSql('INSERT INTO gebruikers (id, voornaam, achternaam, rol, publieke_sleutel, profielgegevens, aangemaakt_op) SELECT id, voornaam, achternaam, rol, publieke_sleutel, profielgegevens, aangemaakt_op FROM __temp__gebruikers');
        $this->addSql('DROP TABLE __temp__gebruikers');
    }
}
