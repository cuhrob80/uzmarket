import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingModeration1788950000000
  implements MigrationInterface
{
  name = 'AddListingModeration1788950000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "listing_status_enum" ADD VALUE IF NOT EXISTS 'pending'`,
    );
    await queryRunner.query(
      `ALTER TYPE "listing_status_enum" ADD VALUE IF NOT EXISTS 'rejected'`,
    );
    await queryRunner.query(
      `ALTER TYPE "listing_status_enum" ADD VALUE IF NOT EXISTS 'unpublished'`,
    );
    await queryRunner.query(
      `ALTER TYPE "listing_status_enum" ADD VALUE IF NOT EXISTS 'deleted'`,
    );
    await queryRunner.query(
      'ALTER TABLE "listings" ADD "moderation_note" text',
    );
    await queryRunner.query(
      `UPDATE "listings" SET "status" = 'archived' WHERE "status" = 'sold'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "listings" DROP COLUMN "moderation_note"',
    );
    await queryRunner.query(
      `UPDATE "listings" SET "status" = 'draft' WHERE "status"::text IN ('pending', 'rejected', 'unpublished', 'deleted')`,
    );
    await queryRunner.query(
      'ALTER TYPE "listing_status_enum" RENAME TO "listing_status_enum_old"',
    );
    await queryRunner.query(
      `CREATE TYPE "listing_status_enum" AS ENUM('draft', 'active', 'sold', 'archived')`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "status" TYPE "listing_status_enum" USING "status"::text::"listing_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ALTER COLUMN "status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(
      'DROP TYPE "listing_status_enum_old"',
    );
  }
}
