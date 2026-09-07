import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectInvitationTable1787400100000 implements MigrationInterface {
    name = 'CreateProjectInvitationTable1787400100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" uuid NOT NULL, "email" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'member', "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "invitedByUserId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_project_invitation_tokenHash" UNIQUE ("tokenHash"), CONSTRAINT "PK_project_invitation_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "project_invitation" ADD CONSTRAINT "FK_project_invitation_project" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_invitation" ADD CONSTRAINT "FK_project_invitation_invitedBy" FOREIGN KEY ("invitedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_invitation" DROP CONSTRAINT "FK_project_invitation_invitedBy"`);
        await queryRunner.query(`ALTER TABLE "project_invitation" DROP CONSTRAINT "FK_project_invitation_project"`);
        await queryRunner.query(`DROP TABLE "project_invitation"`);
    }

}