import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteSchema1779031253440 implements MigrationInterface {
  name = 'CompleteSchema1779031253440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // 1. Thêm các cột còn thiếu vào bảng "user"
    // ============================================================
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS "resetPasswordToken" character varying,
        ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP WITH TIME ZONE
    `);

    // ============================================================
    // 2. Tạo bảng "events" (thay thế bảng "event" cũ)
    //    Entity dùng @Entity('events') nên tên bảng là "events"
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id"                   SERIAL NOT NULL,
        "title"                character varying(255) NOT NULL,
        "description"          text,
        "location"             character varying(500) NOT NULL,
        "startDate"            TIMESTAMP WITH TIME ZONE NOT NULL,
        "endDate"              TIMESTAMP WITH TIME ZONE NOT NULL,
        "registrationDeadline" TIMESTAMP WITH TIME ZONE,
        "status"               character varying NOT NULL DEFAULT 'UPCOMING',
        "isCancelled"          boolean NOT NULL DEFAULT false,
        "displayCategory"      character varying NOT NULL DEFAULT 'NORMAL',
        "eventCategory"        character varying NOT NULL DEFAULT 'ACADEMIC',
        "scale"                character varying NOT NULL DEFAULT 'SCHOOL',
        "faculty"              character varying(255),
        "organizer"            character varying(255),
        "contactEmail"         character varying(100),
        "contactPhone"         character varying(20),
        "maxParticipants"      integer,
        "registeredCount"      integer NOT NULL DEFAULT 0,
        "imageUrl"             text,
        "bannerUrl"            text,
        "tags"                 text,
        "createdAt"            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt"            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "createdBy"            integer,
        CONSTRAINT "PK_events" PRIMARY KEY ("id")
      )
    `);

    // Index cho bảng "events"
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_events_startDate_endDate"
        ON "events" ("startDate", "endDate")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_events_eventCategory"
        ON "events" ("eventCategory")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_events_status"
        ON "events" ("status")
    `);

    // ============================================================
    // 3. Tạo bảng "registration"
    //    Entity dùng @Entity() không đặt tên → TypeORM mặc định là "registration"
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "registration" (
        "id"           SERIAL NOT NULL,
        "userId"       integer NOT NULL,
        "eventId"      integer NOT NULL,
        "status"       character varying NOT NULL DEFAULT 'REGISTERED',
        "qrCode"       character varying,
        "checkedInAt"  TIMESTAMP WITH TIME ZONE,
        "checkedBy"    integer,
        "registeredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_registration" PRIMARY KEY ("id"),
        CONSTRAINT "FK_registration_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_registration_event"
          FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE
      )
    `);

    // ============================================================
    // 4. Tạo bảng "import_history"
    // ============================================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "import_history" (
        "id"           SERIAL NOT NULL,
        "eventId"      integer NOT NULL,
        "importedBy"   integer NOT NULL,
        "fileName"     character varying NOT NULL,
        "totalRows"    integer NOT NULL DEFAULT 0,
        "successCount" integer NOT NULL DEFAULT 0,
        "failedCount"  integer NOT NULL DEFAULT 0,
        "errors"       text,
        "importedAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_import_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_import_history_event"
          FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_import_history_user"
          FOREIGN KEY ("importedBy") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa theo thứ tự ngược lại (FK trước)
    await queryRunner.query(`DROP TABLE IF EXISTS "import_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "registration"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_events_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_events_eventCategory"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_events_startDate_endDate"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "resetPasswordExpires"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "resetPasswordToken"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "createdAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "isActive"`);
  }
}
