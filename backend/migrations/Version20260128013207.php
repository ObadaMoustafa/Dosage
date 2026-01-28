<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260128013207 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_koppelingen AS SELECT id, toegangsniveau, type_verbinding, aangemaakt_op, gebruiker_id, gekoppelde_gebruiker_id FROM gebruiker_koppelingen');
        $this->addSql('DROP TABLE gebruiker_koppelingen');
        $this->addSql('CREATE TABLE gebruiker_koppelingen (id BLOB NOT NULL, toegangsniveau VARCHAR(20) NOT NULL, type_verbinding VARCHAR(20) NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, gekoppelde_gebruiker_id BLOB NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_F182EC009C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_F182EC00C53F1A85 FOREIGN KEY (gekoppelde_gebruiker_id) REFERENCES gebruikers (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_koppelingen (id, toegangsniveau, type_verbinding, aangemaakt_op, gebruiker_id, gekoppelde_gebruiker_id) SELECT id, toegangsniveau, type_verbinding, aangemaakt_op, gebruiker_id, gekoppelde_gebruiker_id FROM __temp__gebruiker_koppelingen');
        $this->addSql('DROP TABLE __temp__gebruiker_koppelingen');
        $this->addSql('CREATE INDEX IDX_F182EC00C53F1A85 ON gebruiker_koppelingen (gekoppelde_gebruiker_id)');
        $this->addSql('CREATE INDEX IDX_F182EC009C92A3DF ON gebruiker_koppelingen (gebruiker_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn_schema AS SELECT id, dagen, tijden, aantal, beschrijving, aangemaakt_op, gebruiker_medicijn_id FROM gebruiker_medicijn_schema');
        $this->addSql('DROP TABLE gebruiker_medicijn_schema');
        $this->addSql('CREATE TABLE gebruiker_medicijn_schema (id BLOB NOT NULL, dagen CLOB NOT NULL, tijden CLOB NOT NULL, aantal INTEGER NOT NULL, beschrijving CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_medicijn_id BLOB NOT NULL, next_occurrence DATETIME DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_8C9BBA108E684394 FOREIGN KEY (gebruiker_medicijn_id) REFERENCES gebruiker_medicijn (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn_schema (id, dagen, tijden, aantal, beschrijving, aangemaakt_op, gebruiker_medicijn_id) SELECT id, dagen, tijden, aantal, beschrijving, aangemaakt_op, gebruiker_medicijn_id FROM __temp__gebruiker_medicijn_schema');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn_schema');
        $this->addSql('CREATE INDEX IDX_8C9BBA108E684394 ON gebruiker_medicijn_schema (gebruiker_medicijn_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE gebruiker_koppelingen ADD COLUMN status VARCHAR(20) NOT NULL');
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn_schema AS SELECT id, dagen, tijden, aantal, beschrijving, aangemaakt_op, gebruiker_medicijn_id FROM gebruiker_medicijn_schema');
        $this->addSql('DROP TABLE gebruiker_medicijn_schema');
        $this->addSql('CREATE TABLE gebruiker_medicijn_schema (id BLOB NOT NULL, dagen CLOB NOT NULL, tijden CLOB NOT NULL, aantal INTEGER NOT NULL, beschrijving CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_medicijn_id BLOB NOT NULL, innemen_status VARCHAR(20) DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_8C9BBA108E684394 FOREIGN KEY (gebruiker_medicijn_id) REFERENCES gebruiker_medicijn (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn_schema (id, dagen, tijden, aantal, beschrijving, aangemaakt_op, gebruiker_medicijn_id) SELECT id, dagen, tijden, aantal, beschrijving, aangemaakt_op, gebruiker_medicijn_id FROM __temp__gebruiker_medicijn_schema');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn_schema');
        $this->addSql('CREATE INDEX IDX_8C9BBA108E684394 ON gebruiker_medicijn_schema (gebruiker_medicijn_id)');
    }
}
