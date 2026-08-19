import type { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import type { Environment } from '../config/environment';

interface DatabaseEnvironment {
  DATABASE_HOST: string; DATABASE_PORT: number; DATABASE_NAME: string;
  DATABASE_USER: string; DATABASE_PASSWORD: string;
}
export function buildTypeOrmOptions(env: DatabaseEnvironment): DataSourceOptions {
  return {
    type: 'postgres', host: env.DATABASE_HOST, port: env.DATABASE_PORT,
    database: env.DATABASE_NAME, username: env.DATABASE_USER, password: env.DATABASE_PASSWORD,
    entities: [], migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    migrationsRun: false, synchronize: false,
  };
}
export function createTypeOrmOptions(config: ConfigService<Environment, true>): DataSourceOptions {
  return buildTypeOrmOptions({
    DATABASE_HOST: config.get('DATABASE_HOST', { infer: true }),
    DATABASE_PORT: config.get('DATABASE_PORT', { infer: true }),
    DATABASE_NAME: config.get('DATABASE_NAME', { infer: true }),
    DATABASE_USER: config.get('DATABASE_USER', { infer: true }),
    DATABASE_PASSWORD: config.get('DATABASE_PASSWORD', { infer: true }),
  });
}
