import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773037226708 implements MigrationInterface {
    name = 'InitialSchema1773037226708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tha_organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'DEPARTMENT', "parentId" uuid, CONSTRAINT "PK_dfad1320aa1d5507c44faf1b7ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tha_task_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'DONE')`);
        await queryRunner.query(`CREATE TABLE "tha_task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "status" "public"."tha_task_status_enum" NOT NULL DEFAULT 'TODO', "category" character varying NOT NULL DEFAULT 'Work', "position" integer NOT NULL DEFAULT '0', "organizationId" uuid NOT NULL, "assigneeId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_97cddd47e6ff827689c3532e2de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tha_audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "resourceId" character varying, "details" text, "actorId" uuid, "organizationId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5bbda39ccdf623f6ab306b09ea5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tha_user_role_enum" AS ENUM('OWNER', 'ADMIN', 'VIEWER')`);
        await queryRunner.query(`CREATE TABLE "tha_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."tha_user_role_enum" NOT NULL DEFAULT 'VIEWER', "organizationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b391daf72dce00301aad0153d6d" UNIQUE ("email"), CONSTRAINT "PK_fe312ee8144b3d50abf4e88d5ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tha_organization" ADD CONSTRAINT "FK_ac803a32cb788936498cab0ad69" FOREIGN KEY ("parentId") REFERENCES "tha_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tha_task" ADD CONSTRAINT "FK_fe41a1391d6d5c34e0491d72175" FOREIGN KEY ("organizationId") REFERENCES "tha_organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tha_task" ADD CONSTRAINT "FK_44421b2e45c4a2e4718a17aab54" FOREIGN KEY ("assigneeId") REFERENCES "tha_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tha_audit_log" ADD CONSTRAINT "FK_6f136da5128a440c2ec2f2f9545" FOREIGN KEY ("actorId") REFERENCES "tha_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tha_user" ADD CONSTRAINT "FK_6dab8a92223f0e55c587f58bbcd" FOREIGN KEY ("organizationId") REFERENCES "tha_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tha_user" DROP CONSTRAINT "FK_6dab8a92223f0e55c587f58bbcd"`);
        await queryRunner.query(`ALTER TABLE "tha_audit_log" DROP CONSTRAINT "FK_6f136da5128a440c2ec2f2f9545"`);
        await queryRunner.query(`ALTER TABLE "tha_task" DROP CONSTRAINT "FK_44421b2e45c4a2e4718a17aab54"`);
        await queryRunner.query(`ALTER TABLE "tha_task" DROP CONSTRAINT "FK_fe41a1391d6d5c34e0491d72175"`);
        await queryRunner.query(`ALTER TABLE "tha_organization" DROP CONSTRAINT "FK_ac803a32cb788936498cab0ad69"`);
        await queryRunner.query(`DROP TABLE "tha_user"`);
        await queryRunner.query(`DROP TYPE "public"."tha_user_role_enum"`);
        await queryRunner.query(`DROP TABLE "tha_audit_log"`);
        await queryRunner.query(`DROP TABLE "tha_task"`);
        await queryRunner.query(`DROP TYPE "public"."tha_task_status_enum"`);
        await queryRunner.query(`DROP TABLE "tha_organization"`);
    }

}
