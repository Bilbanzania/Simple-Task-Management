import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDueDateAndSubtasks1773111184404 implements MigrationInterface {
    name = 'AddDueDateAndSubtasks1773111184404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tha_task" ADD "dueDate" date`);
        await queryRunner.query(`ALTER TABLE "tha_task" ADD "subtasks" text DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tha_task" DROP COLUMN "subtasks"`);
        await queryRunner.query(`ALTER TABLE "tha_task" DROP COLUMN "dueDate"`);
    }

}
