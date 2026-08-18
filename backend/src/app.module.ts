import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnvironment } from './config/environment';
import { createTypeOrmOptions } from './database/database.config';
import { HealthModule } from './health/health.module';

@Module({ imports: [
  ConfigModule.forRoot({ cache: true, isGlobal: true, validate: validateEnvironment }),
  TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => createTypeOrmOptions(config) }),
  HealthModule,
] })
export class AppModule {}
