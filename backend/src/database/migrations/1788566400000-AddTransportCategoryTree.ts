import type { MigrationInterface, QueryRunner } from 'typeorm';

interface CategorySeed {
  name: string;
  slug: string;
  children?: CategorySeed[];
}

const transportCategories: CategorySeed[] = [
  {
    name: 'Легковые автомобили',
    slug: 'transport-passenger-cars',
  },
  {
    name: 'Автозапчасти и аксессуары',
    slug: 'transport-car-parts-accessories',
    children: [
      { name: 'Автозапчасти', slug: 'transport-car-parts' },
      { name: 'Аксессуары для авто', slug: 'transport-car-accessories' },
      { name: 'Автозвук', slug: 'transport-car-audio' },
      { name: 'Транспорт на запчасти', slug: 'transport-vehicles-for-parts' },
      {
        name: 'GPS-навигаторы и видеорегистраторы',
        slug: 'transport-gps-dashcams',
      },
    ],
  },
  {
    name: 'Шины, диски и колёса',
    slug: 'transport-tires-rims-wheels',
    children: [
      { name: 'Автошины', slug: 'transport-car-tires' },
      { name: 'Мотошины', slug: 'transport-motorcycle-tires' },
      { name: 'Диски', slug: 'transport-rims' },
      { name: 'Колёса в сборе', slug: 'transport-complete-wheels' },
      { name: 'Колпаки', slug: 'transport-hubcaps' },
    ],
  },
  {
    name: 'Мото',
    slug: 'transport-motorcycles',
    children: [
      { name: 'Мотоциклы', slug: 'transport-motorcycles-bikes' },
      { name: 'Скутеры и мопеды', slug: 'transport-scooters-mopeds' },
      { name: 'Квадроциклы', slug: 'transport-atvs' },
      { name: 'Трициклы', slug: 'transport-tricycles' },
      { name: 'Питбайки', slug: 'transport-pit-bikes' },
      { name: 'Снегоходы', slug: 'transport-snowmobiles' },
      { name: 'Другая мототехника', slug: 'transport-other-motorcycles' },
    ],
  },
  {
    name: 'Мотозапчасти и аксессуары',
    slug: 'transport-motorcycle-parts-accessories',
    children: [
      { name: 'Мотозапчасти', slug: 'transport-motorcycle-parts' },
      { name: 'Мотоэкипировка', slug: 'transport-motorcycle-gear' },
      { name: 'Мотоаксессуары', slug: 'transport-motorcycle-accessories' },
    ],
  },
  {
    name: 'Самокаты и персональный электротранспорт',
    slug: 'transport-personal-mobility',
    children: [
      { name: 'Электросамокаты', slug: 'transport-electric-scooters' },
      { name: 'Обычные самокаты', slug: 'transport-kick-scooters' },
      { name: 'Электровелосипеды', slug: 'transport-electric-bikes' },
      { name: 'Моноколёса', slug: 'transport-electric-unicycles' },
      { name: 'Гироскутеры', slug: 'transport-hoverboards' },
      {
        name: 'Другой персональный электротранспорт',
        slug: 'transport-other-personal-mobility',
      },
    ],
  },
  {
    name: 'Грузовые автомобили',
    slug: 'transport-trucks',
  },
  { name: 'Автобусы', slug: 'transport-buses' },
  {
    name: 'Спецтехника',
    slug: 'transport-special-machinery',
    children: [
      { name: 'Экскаваторы', slug: 'transport-special-excavators' },
      { name: 'Погрузчики', slug: 'transport-special-loaders' },
      { name: 'Автокраны и краны', slug: 'transport-special-cranes' },
      { name: 'Бульдозеры', slug: 'transport-special-bulldozers' },
      { name: 'Грейдеры', slug: 'transport-special-graders' },
      {
        name: 'Катки и дорожная техника',
        slug: 'transport-special-road-machinery',
      },
      {
        name: 'Бетоносмесители и автобетононасосы',
        slug: 'transport-special-concrete-machinery',
      },
      {
        name: 'Подъёмники и автовышки',
        slug: 'transport-special-lifts',
      },
      {
        name: 'Коммунальная техника',
        slug: 'transport-special-municipal-machinery',
      },
      { name: 'Буровая техника', slug: 'transport-special-drilling' },
      { name: 'Складская техника', slug: 'transport-special-warehouse' },
      {
        name: 'Другая спецтехника',
        slug: 'transport-special-other',
      },
    ],
  },
  {
    name: 'Сельхозтехника',
    slug: 'transport-agricultural-machinery',
    children: [
      { name: 'Тракторы', slug: 'transport-agricultural-tractors' },
      {
        name: 'Минитракторы и мототракторы',
        slug: 'transport-agricultural-mini-tractors',
      },
      {
        name: 'Мотоблоки и культиваторы',
        slug: 'transport-agricultural-tillers',
      },
      { name: 'Комбайны', slug: 'transport-agricultural-harvesters' },
      {
        name: 'Посевная и посадочная техника',
        slug: 'transport-agricultural-seeding',
      },
      {
        name: 'Почвообрабатывающая техника',
        slug: 'transport-agricultural-tillage',
      },
      {
        name: 'Косилки и сенозаготовительная техника',
        slug: 'transport-agricultural-haymaking',
      },
      {
        name: 'Опрыскиватели',
        slug: 'transport-agricultural-sprayers',
      },
      {
        name: 'Техника для внесения удобрений',
        slug: 'transport-agricultural-fertilizing',
      },
      {
        name: 'Уборочная техника',
        slug: 'transport-agricultural-harvesting',
      },
      {
        name: 'Техника для животноводства',
        slug: 'transport-agricultural-livestock',
      },
      {
        name: 'Навесное и прицепное оборудование',
        slug: 'transport-agricultural-attachments',
      },
      {
        name: 'Другая сельхозтехника',
        slug: 'transport-agricultural-other',
      },
    ],
  },
  {
    name: 'Прицепы и полуприцепы',
    slug: 'transport-trailers',
  },
  {
    name: 'Запчасти для спецтехники и сельхозтехники',
    slug: 'transport-heavy-machinery-parts',
  },
  {
    name: 'Водный транспорт',
    slug: 'transport-watercraft',
    children: [
      { name: 'Лодки', slug: 'transport-watercraft-boats' },
      { name: 'Катера', slug: 'transport-watercraft-launches' },
      { name: 'Яхты', slug: 'transport-watercraft-yachts' },
      { name: 'Гидроциклы', slug: 'transport-watercraft-jet-skis' },
      { name: 'Каяки и каноэ', slug: 'transport-watercraft-kayaks-canoes' },
      {
        name: 'Водные велосипеды',
        slug: 'transport-watercraft-pedal-boats',
      },
      {
        name: 'Лодочные моторы',
        slug: 'transport-watercraft-outboard-motors',
      },
      {
        name: 'Другой водный транспорт',
        slug: 'transport-watercraft-other',
      },
    ],
  },
  {
    name: 'Прочие запчасти',
    slug: 'transport-other-parts',
    children: [
      {
        name: 'Запчасти для водного транспорта',
        slug: 'transport-other-parts-watercraft',
      },
      {
        name: 'Запчасти для прицепов и полуприцепов',
        slug: 'transport-other-parts-trailers',
      },
      {
        name: 'Запчасти для автобусов',
        slug: 'transport-other-parts-buses',
      },
      {
        name: 'Запчасти для грузового транспорта',
        slug: 'transport-other-parts-trucks',
      },
      {
        name: 'Запчасти для коммунальной техники',
        slug: 'transport-other-parts-municipal',
      },
      {
        name: 'Запчасти для железнодорожной техники',
        slug: 'transport-other-parts-railway',
      },
      {
        name: 'Универсальные детали и комплектующие',
        slug: 'transport-other-parts-universal',
      },
      { name: 'Другие запчасти', slug: 'transport-other-parts-other' },
    ],
  },
];

export class AddTransportCategoryTree1788566400000
  implements MigrationInterface
{
  name = 'AddTransportCategoryTree1788566400000';

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
    await queryRunner.query(
      `ALTER TABLE "categories"
       ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_parent_sort"
       ON "categories" ("parent_id", "sort_order", "name")`,
    );

    const transportId = await this.upsertCategory(
      queryRunner,
      { name: 'Транспорт', slug: 'transport' },
      null,
      1,
    );

    for (const [categoryIndex, category] of transportCategories.entries()) {
      const categoryId = await this.upsertCategory(
        queryRunner,
        category,
        transportId,
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
    for (const category of [...transportCategories].reverse()) {
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
      `DELETE FROM "categories" WHERE "slug" = 'transport'`,
    );
    await queryRunner.query(`DROP INDEX "IDX_categories_parent_sort"`);
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "sort_order"`,
    );
  }
}
