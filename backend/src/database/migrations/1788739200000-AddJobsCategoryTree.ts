import type { MigrationInterface, QueryRunner } from 'typeorm';

interface JobCategorySeed {
  name: string;
  slug: string;
}

const jobCategories: JobCategorySeed[] = [
  { name: 'Продажи и торговля', slug: 'jobs-sales-trade' },
  {
    name: 'Транспорт, доставка, логистика и склад',
    slug: 'jobs-transport-delivery-logistics-warehouse',
  },
  { name: 'Строительство и ремонт', slug: 'jobs-construction-repair' },
  {
    name: 'Рестораны, кафе и гостиницы',
    slug: 'jobs-restaurants-cafes-hotels',
  },
  {
    name: 'Производство и рабочие специальности',
    slug: 'jobs-production-skilled-trades',
  },
  { name: 'Сельское хозяйство', slug: 'jobs-agriculture' },
  { name: 'Автосервис', slug: 'jobs-auto-service' },
  { name: 'IT, интернет и телеком', slug: 'jobs-it-internet-telecom' },
  { name: 'Бухгалтерия и финансы', slug: 'jobs-accounting-finance' },
  { name: 'Юриспруденция', slug: 'jobs-legal' },
  { name: 'Офис, администрация и HR', slug: 'jobs-office-admin-hr' },
  {
    name: 'Маркетинг, реклама и дизайн',
    slug: 'jobs-marketing-advertising-design',
  },
  {
    name: 'Медицина и фармацевтика',
    slug: 'jobs-medicine-pharmacy',
  },
  { name: 'Образование и наука', slug: 'jobs-education-science' },
  { name: 'Охрана и безопасность', slug: 'jobs-security' },
  {
    name: 'Домашний персонал, клининг и бытовые услуги',
    slug: 'jobs-domestic-cleaning-services',
  },
  { name: 'Красота, фитнес и спорт', slug: 'jobs-beauty-fitness-sport' },
  { name: 'Другие сферы', slug: 'jobs-other' },
];

export class AddJobsCategoryTree1788739200000
  implements MigrationInterface
{
  name = 'AddJobsCategoryTree1788739200000';

  private async upsertCategory(
    queryRunner: QueryRunner,
    category: JobCategorySeed,
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
    const jobsId = await this.upsertCategory(
      queryRunner,
      { name: 'Работа', slug: 'jobs' },
      null,
      3,
    );

    for (const [index, category] of jobCategories.entries()) {
      await this.upsertCategory(
        queryRunner,
        category,
        jobsId,
        index + 1,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const category of [...jobCategories].reverse()) {
      await queryRunner.query(
        `DELETE FROM "categories" WHERE "slug" = $1`,
        [category.slug],
      );
    }

    await queryRunner.query(
      `DELETE FROM "categories" WHERE "slug" = 'jobs'`,
    );
  }
}
