import { MigrationInterface, QueryRunner } from 'typeorm';
import bcryptjs from 'bcryptjs';

export class SeedSuperAdmin1775788473889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const superAdminPassword = await bcryptjs.hash('super123', 10);

    // Insert super admin
    await queryRunner.query(
      `INSERT INTO "user" (email, username, password, role) VALUES
        ('superadmin1@school.edu', 'superadmin1', '${superAdminPassword}', 'SUPER_ADMIN')`,
    );

    console.log('Seed super admin inserted!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user" WHERE email = 'superadmin1@school.edu'`,
    );
    console.log('Seed users removed!');
  }
}
