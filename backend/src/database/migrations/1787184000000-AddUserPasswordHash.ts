import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPasswordHash1787184000000 implements MigrationInterface {
  name = 'AddUserPasswordHash1787184000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password_hash" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "password_hash"`,
    );
  }
}
