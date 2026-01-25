<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260122171417 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn AS SELECT id, aangemaakt_op, gebruiker_id FROM gebruiker_medicijn');
        $this->addSql('DROP TABLE gebruiker_medicijn');
        $this->addSql('CREATE TABLE gebruiker_medicijn (id BLOB NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, medicijn VARCHAR(255) NOT NULL, PRIMARY KEY (id), CONSTRAINT FK_F89AB8AA9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn (id, aangemaakt_op, gebruiker_id) SELECT id, aangemaakt_op, gebruiker_id FROM __temp__gebruiker_medicijn');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn');
        $this->addSql('CREATE INDEX IDX_F89AB8AA9C92A3DF ON gebruiker_medicijn (gebruiker_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn_gebruik AS SELECT id, medicijn_turven, aangemaakt_op, gebruiker_medicijn_id, gebruiker_medicijn_schema_id FROM gebruiker_medicijn_gebruik');
        $this->addSql('DROP TABLE gebruiker_medicijn_gebruik');
        $this->addSql('CREATE TABLE gebruiker_medicijn_gebruik (id BLOB NOT NULL, medicijn_turven INTEGER NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_medicijn_id BLOB NOT NULL, gebruiker_medicijn_schema_id BLOB DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_D0388048E684394 FOREIGN KEY (gebruiker_medicijn_id) REFERENCES gebruiker_medicijn (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_D0388043906A32 FOREIGN KEY (gebruiker_medicijn_schema_id) REFERENCES gebruiker_medicijn_schema (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn_gebruik (id, medicijn_turven, aangemaakt_op, gebruiker_medicijn_id, gebruiker_medicijn_schema_id) SELECT id, medicijn_turven, aangemaakt_op, gebruiker_medicijn_id, gebruiker_medicijn_schema_id FROM __temp__gebruiker_medicijn_gebruik');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn_gebruik');
        $this->addSql('CREATE INDEX IDX_D0388043906A32 ON gebruiker_medicijn_gebruik (gebruiker_medicijn_schema_id)');
        $this->addSql('CREATE INDEX IDX_D0388048E684394 ON gebruiker_medicijn_gebruik (gebruiker_medicijn_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn AS SELECT id, aangemaakt_op, gebruiker_id FROM gebruiker_medicijn');
        $this->addSql('DROP TABLE gebruiker_medicijn');
        $this->addSql('CREATE TABLE gebruiker_medicijn (id BLOB NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_id BLOB NOT NULL, medicijn_versleuteld CLOB NOT NULL, medicijn_ref_id BLOB DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_F89AB8AA9C92A3DF FOREIGN KEY (gebruiker_id) REFERENCES gebruikers (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_F89AB8AAB72C2C79 FOREIGN KEY (medicijn_ref_id) REFERENCES medicijnen (id) ON UPDATE NO ACTION ON DELETE NO ACTION NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn (id, aangemaakt_op, gebruiker_id) SELECT id, aangemaakt_op, gebruiker_id FROM __temp__gebruiker_medicijn');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn');
        $this->addSql('CREATE INDEX IDX_F89AB8AA9C92A3DF ON gebruiker_medicijn (gebruiker_id)');
        $this->addSql('CREATE INDEX IDX_F89AB8AAB72C2C79 ON gebruiker_medicijn (medicijn_ref_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__gebruiker_medicijn_gebruik AS SELECT id, medicijn_turven, aangemaakt_op, gebruiker_medicijn_id, gebruiker_medicijn_schema_id FROM gebruiker_medicijn_gebruik');
        $this->addSql('DROP TABLE gebruiker_medicijn_gebruik');
        $this->addSql('CREATE TABLE gebruiker_medicijn_gebruik (id BLOB NOT NULL, medicijn_turven CLOB NOT NULL, aangemaakt_op DATETIME NOT NULL, gebruiker_medicijn_id BLOB NOT NULL, gebruiker_medicijn_schema_id BLOB DEFAULT NULL, PRIMARY KEY (id), CONSTRAINT FK_D0388048E684394 FOREIGN KEY (gebruiker_medicijn_id) REFERENCES gebruiker_medicijn (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_D0388043906A32 FOREIGN KEY (gebruiker_medicijn_schema_id) REFERENCES gebruiker_medicijn_schema (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO gebruiker_medicijn_gebruik (id, medicijn_turven, aangemaakt_op, gebruiker_medicijn_id, gebruiker_medicijn_schema_id) SELECT id, medicijn_turven, aangemaakt_op, gebruiker_medicijn_id, gebruiker_medicijn_schema_id FROM __temp__gebruiker_medicijn_gebruik');
        $this->addSql('DROP TABLE __temp__gebruiker_medicijn_gebruik');
        $this->addSql('CREATE INDEX IDX_D0388048E684394 ON gebruiker_medicijn_gebruik (gebruiker_medicijn_id)');
        $this->addSql('CREATE INDEX IDX_D0388043906A32 ON gebruiker_medicijn_gebruik (gebruiker_medicijn_schema_id)');
    }
}
