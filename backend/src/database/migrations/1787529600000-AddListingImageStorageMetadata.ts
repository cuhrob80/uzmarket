import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingImageStorageMetadata1787529600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "listing_images"
        ADD COLUMN "storage_key" character varying,
        ADD COLUMN "mime_type" character varying(100),
        ADD COLUMN "width" integer,
        ADD COLUMN "height" integer,
        ADD COLUMN "file_size_bytes" bigint
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_listing_images_storage_key"
      ON "listing_images" ("storage_key")
      WHERE "storage_key" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "UQ_listing_images_storage_key"`,
    );

    await queryRunner.query(`
      ALTER TABLE "listing_images"
        DROP COLUMN "file_size_bytes",
        DROP COLUMN "height",
        DROP COLUMN "width",
        DROP COLUMN "mime_type",
        DROP COLUMN "storage_key"
    `);
  }
}
