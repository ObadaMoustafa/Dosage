<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260119131719 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE gebruiker_koppelingen (id BLOB NOT NULL, rechten CLOB DEFAULT NULL, status VARCHAR(20) NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, gekoppelde_gebruiker_id BLOB NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_F182EC009C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_F182EC00C53F1A85 FOREIGN KEY (gekoppelde_gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_F182EC009C92A3DF ON gebruiker_koppelingen (gebruiker_id)');
        $this->addSql('CREATE INDEX IDX_F182EC00C53F1A85 ON gebruiker_koppelingen (gekoppelde_gebruiker_id)');
        $this->addSql('CREATE TABLE gebruiker_medicijn (id BLOB NOT NULL, medicijn_versleuteld CLOB NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, medicijn_ref_id BLOB DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_F89AB8AA9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_F89AB8AAB72C2C79 FOREIGN KEY (medicijn_ref_id) REFERENCES medicijnen (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_F89AB8AA9C92A3DF ON gebruiker_medicijn (gebruiker_id)');
        $this->addSql('CREATE INDEX IDX_F89AB8AAB72C2C79 ON gebruiker_medicijn (medicijn_ref_id)');
        $this->addSql('CREATE TABLE medicijnen (id BLOB NOT NULL, naam VARCHAR(100) NOT NULL, toedieningsvorm VARCHAR(50) DEFAULT NULL, sterkte VARCHAR(50) DEFAULT NULL, beschrijving CLOB DEFAULT NULL, bijsluiter CLOB DEFAULT NULL, aangemaakt_op DATETIME NOT NULL, PRIMARY KEY (id))');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE gebruiker_koppelingen');
        $this->addSql('DROP TABLE gebruiker_medicijn');
        $this->addSql('DROP TABLE medicijnen');
    }
}
