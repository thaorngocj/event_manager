import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityLogTable1779546360093 implements MigrationInterface {
  name = 'CreateActivityLogTable1779546360093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" integer NOT NULL,
        "action" character varying(100) NOT NULL,
        "targetType" character varying(50),
        "targetId" character varying(100),
        "details" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "import_history"
      DROP CONSTRAINT "FK_ebdf06c2a7ddc54a6b5421dbd6d"
    `);

    await queryRunner.query(`
      ALTER TABLE "import_history"
      ALTER COLUMN "eventId" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "import_history"
      ADD CONSTRAINT "FK_ebdf06c2a7ddc54a6b5421dbd6d"
      FOREIGN KEY ("eventId")
      REFERENCES "events"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_logs"
      ADD CONSTRAINT "FK_d54f841fa5478e4734590d44036"
      FOREIGN KEY ("user_id")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "activity_logs"
      DROP CONSTRAINT "FK_d54f841fa5478e4734590d44036"
    `);

    await queryRunner.query(`
      ALTER TABLE "import_history"
      DROP CONSTRAINT "FK_ebdf06c2a7ddc54a6b5421dbd6d"
    `);

    await queryRunner.query(`
      ALTER TABLE "import_history"
      ALTER COLUMN "eventId" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "import_history"
      ADD CONSTRAINT "FK_ebdf06c2a7ddc54a6b5421dbd6d"
      FOREIGN KEY ("eventId")
      REFERENCES "events"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      DROP TABLE "activity_logs"
    `);
  }
}
