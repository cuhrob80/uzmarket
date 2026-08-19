import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketplaceCore1787097600000 implements MigrationInterface {
  name = 'CreateMarketplaceCore1787097600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "phone" character varying,
        "display_name" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "parent_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_categories_parent"
          FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "listing_status_enum"
      AS ENUM ('draft', 'active', 'sold', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "listings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "seller_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "price" numeric(14,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'UZS',
        "status" "listing_status_enum" NOT NULL DEFAULT 'draft',
        "location" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_listings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_listings_seller"
          FOREIGN KEY ("seller_id") REFERENCES "users"("id")
          ON DELETE RESTRICT,
        CONSTRAINT "FK_listings_category"
          FOREIGN KEY ("category_id") REFERENCES "categories"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_listings_seller_id" ON "listings" ("seller_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_listings_category_id" ON "listings" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_listings_status" ON "listings" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_listings_created_at" ON "listings" ("created_at")`);

    await queryRunner.query(`
      CREATE TABLE "listing_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "listing_id" uuid NOT NULL,
        "url" character varying NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_listing_images_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_listing_images_listing"
          FOREIGN KEY ("listing_id") REFERENCES "listings"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_listing_images_listing_id" ON "listing_images" ("listing_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "listing_images"`);
    await queryRunner.query(`DROP TABLE "listings"`);
    await queryRunner.query(`DROP TYPE "listing_status_enum"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
