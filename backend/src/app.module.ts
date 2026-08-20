import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { type Environment, validateEnvironment } from './config/environment';
import { createTypeOrmOptions } from './database/database.config';
import { HealthModule } from './health/health.module';
import { ListingsModule } from './listings/listings.module';

@Module({ imports: [
  ConfigModule.forRoot({ cache: true, isGlobal: true, validate: validateEnvironment }),
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService<Environment, true>) => createTypeOrmOptions(config),
  }),
  HealthModule,
  ListingsModule,
] })
export class AppModule {}
