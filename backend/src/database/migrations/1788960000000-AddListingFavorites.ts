import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingFavorites1788960000000
  implements MigrationInterface
{
  name = 'AddListingFavorites1788960000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "listing_favorites" (
        "user_id" uuid NOT NULL,
        "listing_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_listing_favorites" PRIMARY KEY ("user_id", "listing_id"),
        CONSTRAINT "FK_listing_favorites_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_listing_favorites_listing" FOREIGN KEY ("listing_id")
          REFERENCES "listings"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_listing_favorites_listing_id" ON "listing_favorites" ("listing_id")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "listing_favorites"');
  }
}
