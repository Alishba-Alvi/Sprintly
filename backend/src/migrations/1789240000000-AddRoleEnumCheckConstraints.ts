import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleEnumCheckConstraints1789240000000 implements MigrationInterface {
    name = 'AddRoleEnumCheckConstraints1789240000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "CHK_user_systemRole" CHECK ("systemRole" IN ('admin', 'user'))
        `);
        await queryRunner.query(`
            ALTER TABLE "project_member"
            ADD CONSTRAINT "CHK_project_member_projectRole" CHECK ("projectRole" IN ('lead', 'member', 'viewer'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_member" DROP CONSTRAINT "CHK_project_member_projectRole"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "CHK_user_systemRole"`);
    }
}