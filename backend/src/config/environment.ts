import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsUrl, Max, Min, validateSync } from 'class-validator';

export enum NodeEnvironment { Development = 'development', Production = 'production', Test = 'test' }
export class Environment {
  @IsEnum(NodeEnvironment) NODE_ENV!: NodeEnvironment;
  @IsInt() @Min(1) @Max(65_535) PORT!: number;
  @IsNotEmpty() DATABASE_HOST!: string;
  @IsInt() @Min(1) @Max(65_535) DATABASE_PORT!: number;
  @IsNotEmpty() DATABASE_NAME!: string;
  @IsNotEmpty() DATABASE_USER!: string;
  @IsNotEmpty() DATABASE_PASSWORD!: string;
  @IsUrl({ require_tld: false, protocols: ['http', 'https'] }) FRONTEND_URL!: string;
  @IsNotEmpty() JWT_SECRET!: string;
  @IsInt() @Min(60) JWT_EXPIRES_IN!: number;
}
export function validateEnvironment(configuration: Record<string, unknown>): Environment {
  const environment = plainToInstance(Environment, configuration, { enableImplicitConversion: true });
  const errors = validateSync(environment, { skipMissingProperties: false, whitelist: true });
  if (errors.length) throw new Error(`Invalid environment configuration: ${errors.toString()}`);
  return environment;
}
