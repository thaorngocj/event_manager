import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEvent1775795013098 implements MigrationInterface {
  name = 'CreateEvent1775795013098';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event" (
        "id" SERIAL NOT NULL, 
        "title" character varying NOT NULL, 
        "description" character varying NOT NULL, 
        "startDate" TIMESTAMP NOT NULL, 
        "endDate" TIMESTAMP NOT NULL, 
        "location" character varying NOT NULL, 
        "maxParticipants" integer, 
        "status" character varying NOT NULL DEFAULT 'UPCOMING', 
        CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "event"`);
  }
}
