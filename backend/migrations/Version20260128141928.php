<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260128141928 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE gebruiker_koppelingen (id BLOB NOT NULL, toegangsniveau VARCHAR(20) NOT NULL, type_verbinding VARCHAR(20) NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, gekoppelde_gebruiker_id BLOB NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_F182EC009C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_F182EC00C53F1A85 FOREIGN KEY (gekoppelde_gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_F182EC009C92A3DF ON gebruiker_koppelingen (gebruiker_id)');
        $this->addSql('CREATE INDEX IDX_F182EC00C53F1A85 ON gebruiker_koppelingen (gekoppelde_gebruiker_id)');
        $this->addSql('CREATE TABLE gebruiker_medicijn (id BLOB NOT NULL, medicijn_naam VARCHAR(255) NOT NULL, toedieningsvorm VARCHAR(255) DEFAULT NULL, sterkte VARCHAR(255) DEFAULT NULL, beschrijving CLOB DEFAULT NULL, bijsluiter CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, voorraad_item_id BLOB DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_F89AB8AA9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_F89AB8AA139F60F9 FOREIGN KEY (voorraad_item_id) REFERENCES voorraad_item (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_F89AB8AA9C92A3DF ON gebruiker_medicijn (gebruiker_id)');
        $this->addSql('CREATE INDEX IDX_F89AB8AA139F60F9 ON gebruiker_medicijn (voorraad_item_id)');
        $this->addSql('CREATE TABLE gebruiker_medicijn_gebruik (id BLOB NOT NULL, medicijn_turven INTEGER NOT NULL, status VARCHAR(20) NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_medicijn_id BLOB NOT NULL, gebruiker_medicijn_schema_id BLOB DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_D0388048E684394 FOREIGN KEY (gebruiker_medicijn_id) REFERENCES gebruiker_medicijn (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_D0388043906A32 FOREIGN KEY (gebruiker_medicijn_schema_id) REFERENCES gebruiker_medicijn_schema (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_D0388048E684394 ON gebruiker_medicijn_gebruik (gebruiker_medicijn_id)');
        $this->addSql('CREATE INDEX IDX_D0388043906A32 ON gebruiker_medicijn_gebruik (gebruiker_medicijn_schema_id)');
        $this->addSql('CREATE TABLE gebruiker_medicijn_schema (id BLOB NOT NULL, dagen CLOB NOT NULL, tijden CLOB NOT NULL, aantal INTEGER NOT NULL, next_occurrence DATETIME DEFAULT NULL, beschrijving CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_medicijn_id BLOB NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_8C9BBA108E684394 FOREIGN KEY (gebruiker_medicijn_id) REFERENCES gebruiker_medicijn (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_8C9BBA108E684394 ON gebruiker_medicijn_schema (gebruiker_medicijn_id)');
        $this->addSql('CREATE TABLE gebruikers (id BLOB NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, voornaam VARCHAR(255) NOT NULL, achternaam VARCHAR(255) NOT NULL, rol VARCHAR(20) NOT NULL, avatar_url VARCHAR(255) DEFAULT NULL, is_active BOOLEAN DEFAULT 1 NOT NULL, publieke_sleutel CLOB DEFAULT NULL, profielgegevens CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, laatste_login DATETIME DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_968F1E25E7927C74 ON gebruikers (email)');
        $this->addSql('CREATE TABLE log_meldingen (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, tijdstip DATETIME NOT NULL, onderdeel VARCHAR(200) NOT NULL, melding VARCHAR(2000) NOT NULL)');
        $this->addSql('CREATE TABLE medicijnen (id BLOB NOT NULL, naam VARCHAR(100) NOT NULL, toedieningsvorm VARCHAR(50) DEFAULT NULL, sterkte VARCHAR(50) DEFAULT NULL, beschrijving CLOB DEFAULT NULL, bijsluiter CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE pairing_code (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, code VARCHAR(10) NOT NULL, type_verbinding VARCHAR(20) NOT NULL, verloopt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, CONSTRAINT FK_D0ACCEDE9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D0ACCEDE77153098 ON pairing_code (code)');
        $this->addSql('CREATE INDEX IDX_D0ACCEDE9C92A3DF ON pairing_code (gebruiker_id)');
        $this->addSql('CREATE TABLE voorraad_item (id BLOB NOT NULL, name VARCHAR(255) NOT NULL, strips_count INTEGER NOT NULL, pills_per_strip INTEGER NOT NULL, loose_pills INTEGER NOT NULL, threshold INTEGER NOT NULL, status VARCHAR(20) NOT NULL, last_updated DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_869FC28A9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_869FC28A9C92A3DF ON voorraad_item (gebruiker_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE gebruiker_koppelingen');
        $this->addSql('DROP TABLE gebruiker_medicijn');
        $this->addSql('DROP TABLE gebruiker_medicijn_gebruik');
        $this->addSql('DROP TABLE gebruiker_medicijn_schema');
        $this->addSql('DROP TABLE gebruikers');
        $this->addSql('DROP TABLE log_meldingen');
        $this->addSql('DROP TABLE medicijnen');
        $this->addSql('DROP TABLE pairing_code');
        $this->addSql('DROP TABLE voorraad_item');
    }
}
