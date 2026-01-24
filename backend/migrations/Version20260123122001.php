<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260123122001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn AS SELECT id, medicijn, aangemaakt_op, gebruiker_id FROM gebruiker_medicijn');
        $this->addSql('DROP TABLE gebruiker_medicijn');
        $this->addSql('CREATE TABLE gebruiker_medicijn (id BLOB NOT NULL, medicijn_naam VARCHAR(255) NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, toedieningsvorm VARCHAR(255) DEFAULT NULL, sterkte VARCHAR(255) DEFAULT NULL, beschrijving CLOB DEFAULT NULL, bijsluiter CLOB DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_F89AB8AA9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn (id, medicijn_naam, aangemaakt_op, gebruiker_id) SELECT id, medicijn, aangemaakt_op, gebruiker_id FROM __temp__gebruiker_medicijn');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn');
        $this->addSql('CREATE INDEX IDX_F89AB8AA9C92A3DF ON gebruiker_medicijn (gebruiker_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn AS SELECT id, medicijn_naam, aangemaakt_op, gebruiker_id FROM gebruiker_medicijn');
        $this->addSql('DROP TABLE gebruiker_medicijn');
        $this->addSql('CREATE TABLE gebruiker_medicijn (id BLOB NOT NULL, medicijn VARCHAR(255) NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_F89AB8AA9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn (id, medicijn, aangemaakt_op, gebruiker_id) SELECT id, medicijn_naam, aangemaakt_op, gebruiker_id FROM __temp__gebruiker_medicijn');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn');
        $this->addSql('CREATE INDEX IDX_F89AB8AA9C92A3DF ON gebruiker_medicijn (gebruiker_id)');
    }
}
