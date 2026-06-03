import { MigrationInterface, QueryRunner } from 'typeorm';
import bcryptjs from 'bcryptjs';

export class SeedUsers1775752000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminPassword = await bcryptjs.hash('admin123', 10);
    const studentPassword = await bcryptjs.hash('123456', 10);

    // Insert admin
    await queryRunner.query(
      `INSERT INTO "user" (email, username, password, role) VALUES
      ('admin@school.edu', 'admin', '${adminPassword}', 'ADMIN')`,
    );

    // Insert 2 students
    await queryRunner.query(
      `INSERT INTO "user" (email, username, password, role) VALUES
      ('sv01@school.edu', 'sv01', '${studentPassword}', 'STUDENT'),
      ('sv02@school.edu', 'sv02', '${studentPassword}', 'STUDENT')`,
    );

    console.log('Seed admin + students inserted!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user" WHERE email IN ('admin@school.edu', 'sv01@school.edu', 'sv02@school.edu')`,
    );
    console.log('Seed users removed!');
  }
}
