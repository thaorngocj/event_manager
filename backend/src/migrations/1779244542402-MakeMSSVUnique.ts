import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeMSSVUnique1779244542402 implements MigrationInterface {
    name = 'MakeMSSVUnique1779244542402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_7206e95d9a6e0dada8cffd066ce" UNIQUE ("mssv")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_7206e95d9a6e0dada8cffd066ce"`);
    }

}
