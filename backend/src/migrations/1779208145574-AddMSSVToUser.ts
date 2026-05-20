import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMSSVToUser1779208145574 implements MigrationInterface {
    name = 'AddMSSVToUser1779208145574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "registration" DROP CONSTRAINT "FK_registration_user"`);
        await queryRunner.query(`ALTER TABLE "registration" DROP CONSTRAINT "FK_registration_event"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_import_history_event"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_import_history_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_events_startDate_endDate"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_events_eventCategory"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_events_status"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "mssv" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "registration" DROP COLUMN "checkedInAt"`);
        await queryRunner.query(`ALTER TABLE "registration" ADD "checkedInAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "registration" DROP COLUMN "registeredAt"`);
        await queryRunner.query(`ALTER TABLE "registration" ADD "registeredAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP COLUMN "importedAt"`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD "importedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_03dcebc1ab44daa177ae9479c4" ON "events" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_36305be594fe2364c89b1f00aa" ON "events" ("eventCategory") `);
        await queryRunner.query(`CREATE INDEX "IDX_c4fc28b63512e6a8b87cef71a7" ON "events" ("startDate", "endDate") `);
        await queryRunner.query(`ALTER TABLE "registration" ADD CONSTRAINT "FK_af6d07a8391d587c4dd40e7a5a9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "registration" ADD CONSTRAINT "FK_c9cbfae000488578b2bb322c8bd" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_ebdf06c2a7ddc54a6b5421dbd6d" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_c48984503abe981a54178b80062" FOREIGN KEY ("importedBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_c48984503abe981a54178b80062"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_ebdf06c2a7ddc54a6b5421dbd6d"`);
        await queryRunner.query(`ALTER TABLE "registration" DROP CONSTRAINT "FK_c9cbfae000488578b2bb322c8bd"`);
        await queryRunner.query(`ALTER TABLE "registration" DROP CONSTRAINT "FK_af6d07a8391d587c4dd40e7a5a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c4fc28b63512e6a8b87cef71a7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36305be594fe2364c89b1f00aa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_03dcebc1ab44daa177ae9479c4"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP COLUMN "importedAt"`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD "importedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "registration" DROP COLUMN "registeredAt"`);
        await queryRunner.query(`ALTER TABLE "registration" ADD "registeredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "registration" DROP COLUMN "checkedInAt"`);
        await queryRunner.query(`ALTER TABLE "registration" ADD "checkedInAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mssv"`);
        await queryRunner.query(`CREATE INDEX "IDX_events_status" ON "events" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_events_eventCategory" ON "events" ("eventCategory") `);
        await queryRunner.query(`CREATE INDEX "IDX_events_startDate_endDate" ON "events" ("endDate", "startDate") `);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_import_history_user" FOREIGN KEY ("importedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_import_history_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "registration" ADD CONSTRAINT "FK_registration_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "registration" ADD CONSTRAINT "FK_registration_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
