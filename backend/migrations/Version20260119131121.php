<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260119131121 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE gebruiker_auth (id BLOB NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, aangemaakt_op DATETIME NOT NULL, laatste_login DATETIME DEFAULT NULL, gebruiker_id BLOB NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_D8CC11DF9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D8CC11DFE7927C74 ON gebruiker_auth (email)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D8CC11DF9C92A3DF ON gebruiker_auth (gebruiker_id)');
        $this->addSql('CREATE TABLE gebruikers (id BLOB NOT NULL, rol VARCHAR(20) NOT NULL, publieke_sleutel CLOB DEFAULT NULL, profielgegevens CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, PRIMARY KEY (id))');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE gebruiker_auth');
        $this->addSql('DROP TABLE gebruikers');
    }
}
