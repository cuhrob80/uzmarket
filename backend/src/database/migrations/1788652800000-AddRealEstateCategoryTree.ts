import type { MigrationInterface, QueryRunner } from 'typeorm';

interface CategorySeed {
  name: string;
  slug: string;
  children?: CategorySeed[];
}

const realEstateCategories: CategorySeed[] = [
  {
    name: 'Квартиры',
    slug: 'real-estate-apartments',
  },
  {
    name: 'Комнаты и койко-места',
    slug: 'real-estate-rooms-bed-spaces',
  },
  {
    name: 'Дома, дачи и коттеджи',
    slug: 'real-estate-houses-cottages',
  },
  {
    name: 'Земельные участки',
    slug: 'real-estate-land-plots',
  },
  {
    name: 'Коммерческая недвижимость',
    slug: 'real-estate-commercial',
    children: [
      { name: 'Офисы', slug: 'real-estate-commercial-offices' },
      {
        name: 'Торговые помещения',
        slug: 'real-estate-commercial-retail-premises',
      },
      { name: 'Склады', slug: 'real-estate-commercial-warehouses' },
      {
        name: 'Производственные помещения',
        slug: 'real-estate-commercial-industrial-premises',
      },
      {
        name: 'Помещения общественного питания',
        slug: 'real-estate-commercial-food-service-premises',
      },
      {
        name: 'Помещения свободного назначения',
        slug: 'real-estate-commercial-multipurpose-premises',
      },
      {
        name: 'Здания и комплексы',
        slug: 'real-estate-commercial-buildings-complexes',
      },
      {
        name: 'Другая коммерческая недвижимость',
        slug: 'real-estate-commercial-other',
      },
    ],
  },
  {
    name: 'Гаражи и машиноместа',
    slug: 'real-estate-garages-parking',
  },
];

export class AddRealEstateCategoryTree1788652800000
  implements MigrationInterface
{
  name = 'AddRealEstateCategoryTree1788652800000';

  private async upsertCategory(
    queryRunner: QueryRunner,
    category: CategorySeed,
    parentId: string | null,
    sortOrder: number,
  ): Promise<string> {
    const rows: Array<{ id: string }> = await queryRunner.query(
      `
        INSERT INTO "categories"
          ("name", "slug", "parent_id", "is_active", "sort_order")
        VALUES ($1, $2, $3, true, $4)
        ON CONFLICT ("slug") DO UPDATE
        SET
          "name" = EXCLUDED."name",
          "parent_id" = EXCLUDED."parent_id",
          "is_active" = true,
          "sort_order" = EXCLUDED."sort_order",
          "updated_at" = now()
        RETURNING "id"
      `,
      [category.name, category.slug, parentId, sortOrder],
    );

    return rows[0].id;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const realEstateId = await this.upsertCategory(
      queryRunner,
      { name: 'Недвижимость', slug: 'real-estate' },
      null,
      2,
    );

    for (const [categoryIndex, category] of realEstateCategories.entries()) {
      const categoryId = await this.upsertCategory(
        queryRunner,
        category,
        realEstateId,
        categoryIndex + 1,
      );

      for (const [childIndex, child] of (category.children ?? []).entries()) {
        await this.upsertCategory(
          queryRunner,
          child,
          categoryId,
          childIndex + 1,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const category of [...realEstateCategories].reverse()) {
      for (const child of [...(category.children ?? [])].reverse()) {
        await queryRunner.query(`DELETE FROM "categories" WHERE "slug" = $1`, [
          child.slug,
        ]);
      }

      await queryRunner.query(`DELETE FROM "categories" WHERE "slug" = $1`, [
        category.slug,
      ]);
    }

    await queryRunner.query(
      `DELETE FROM "categories" WHERE "slug" = 'real-estate'`,
    );
  }
}
