import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingJobType1788825600000 implements MigrationInterface {
  name = 'AddListingJobType1788825600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "listing_job_type_enum" AS ENUM ('vacancy', 'resume')`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ADD "job_type" "listing_job_type_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_listings_job_type" ON "listings" ("job_type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_listings_job_type"`);
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "job_type"`);
    await queryRunner.query(`DROP TYPE "listing_job_type_enum"`);
  }
}
