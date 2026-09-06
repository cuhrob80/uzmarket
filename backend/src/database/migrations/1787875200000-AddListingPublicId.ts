import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingPublicId1787875200000 implements MigrationInterface {
  name = 'AddListingPublicId1787875200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "listings"
      ADD COLUMN "public_id" BIGSERIAL NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "listings"
      ADD CONSTRAINT "UQ_listings_public_id"
      UNIQUE ("public_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "listings"
      DROP CONSTRAINT "UQ_listings_public_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "listings"
      DROP COLUMN "public_id"
    `);
  }
}
