import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommentAndActivityLogTables1789371568803 implements MigrationInterface {
    name = 'CreateCommentAndActivityLogTables1789371568803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activity_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issueId" uuid NOT NULL, "actorId" uuid, "action" character varying NOT NULL, "fromValue" character varying, "toValue" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0ccb822782e65cc1589c918029" ON "activity_log" ("issueId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issueId" uuid NOT NULL, "authorId" uuid, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c91b5a63310845bdeca63d9ee1" ON "comment" ("issueId") `);
        await queryRunner.query(`ALTER TABLE "activity_log" ADD CONSTRAINT "FK_aa1d3163fc61d351452835fcea0" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_log" ADD CONSTRAINT "FK_dfcfb7c2c5086ec721868d85409" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c91b5a63310845bdeca63d9ee13" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c91b5a63310845bdeca63d9ee13"`);
        await queryRunner.query(`ALTER TABLE "activity_log" DROP CONSTRAINT "FK_dfcfb7c2c5086ec721868d85409"`);
        await queryRunner.query(`ALTER TABLE "activity_log" DROP CONSTRAINT "FK_aa1d3163fc61d351452835fcea0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c91b5a63310845bdeca63d9ee1"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ccb822782e65cc1589c918029"`);
        await queryRunner.query(`DROP TABLE "activity_log"`);
    }

}
