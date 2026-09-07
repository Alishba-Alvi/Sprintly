import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerificationToUser1787400000000 implements MigrationInterface {
    name = 'AddEmailVerificationToUser1787400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "verificationTokenHash" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verificationTokenHash"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isVerified"`);
    }

}