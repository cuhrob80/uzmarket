import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatar1788940000000 implements MigrationInterface {
  name = 'AddUserAvatar1788940000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "avatar_url" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "users" ADD "avatar_storage_key" character varying',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN "avatar_storage_key"',
    );
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN "avatar_url"',
    );
  }
}
