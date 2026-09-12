import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIssueEnumCheckConstraints1789160000000 implements MigrationInterface {
    name = 'AddIssueEnumCheckConstraints1789160000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "issue"
            ADD CONSTRAINT "CHK_issue_type" CHECK ("type" IN ('task', 'bug', 'story', 'epic'))
        `);
        await queryRunner.query(`
            ALTER TABLE "issue"
            ADD CONSTRAINT "CHK_issue_status" CHECK ("status" IN ('to_do', 'in_progress', 'in_review', 'done'))
        `);
        await queryRunner.query(`
            ALTER TABLE "issue"
            ADD CONSTRAINT "CHK_issue_priority" CHECK ("priority" IN ('low', 'medium', 'high', 'critical'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issue" DROP CONSTRAINT "CHK_issue_priority"`);
        await queryRunner.query(`ALTER TABLE "issue" DROP CONSTRAINT "CHK_issue_status"`);
        await queryRunner.query(`ALTER TABLE "issue" DROP CONSTRAINT "CHK_issue_type"`);
    }
}