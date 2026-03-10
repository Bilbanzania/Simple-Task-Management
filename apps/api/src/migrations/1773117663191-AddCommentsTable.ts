import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentsTable1773117663191 implements MigrationInterface {
    name = 'AddCommentsTable1773117663191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tha_comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "taskId" uuid NOT NULL, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_81ed0b4d6b4fc196b5ca2bca419" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tha_comment" ADD CONSTRAINT "FK_9f5d02423d66668d95152354660" FOREIGN KEY ("taskId") REFERENCES "tha_task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tha_comment" ADD CONSTRAINT "FK_553373f79ae3ff770a41a11b051" FOREIGN KEY ("authorId") REFERENCES "tha_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tha_comment" DROP CONSTRAINT "FK_553373f79ae3ff770a41a11b051"`);
        await queryRunner.query(`ALTER TABLE "tha_comment" DROP CONSTRAINT "FK_9f5d02423d66668d95152354660"`);
        await queryRunner.query(`DROP TABLE "tha_comment"`);
    }

}
