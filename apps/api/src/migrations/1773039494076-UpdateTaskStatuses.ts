import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTaskStatuses1773039494076 implements MigrationInterface {
    name = 'UpdateTaskStatuses1773039494076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."tha_task_status_enum" RENAME TO "tha_task_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tha_task_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "tha_task" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tha_task" ALTER COLUMN "status" TYPE "public"."tha_task_status_enum" USING "status"::"text"::"public"."tha_task_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tha_task" ALTER COLUMN "status" SET DEFAULT 'TODO'`);
        await queryRunner.query(`DROP TYPE "public"."tha_task_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tha_task_status_enum_old" AS ENUM('TODO', 'IN_PROGRESS', 'DONE')`);
        await queryRunner.query(`ALTER TABLE "tha_task" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tha_task" ALTER COLUMN "status" TYPE "public"."tha_task_status_enum_old" USING "status"::"text"::"public"."tha_task_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tha_task" ALTER COLUMN "status" SET DEFAULT 'TODO'`);
        await queryRunner.query(`DROP TYPE "public"."tha_task_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tha_task_status_enum_old" RENAME TO "tha_task_status_enum"`);
    }

}
