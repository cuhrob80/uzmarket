import { ConfigService } from '@nestjs/config';
import { Environment } from '../config/environment';

export interface StorageConfig {
  driver: 'local';
  localPath: string;
  publicUrl: string;
}

export function createStorageConfig(
  config: ConfigService<Environment, true>,
): StorageConfig {
  return {
    driver: 'local',
    localPath: config.get('STORAGE_LOCAL_PATH', { infer: true }) ?? './storage',
    publicUrl:
      config.get('STORAGE_PUBLIC_URL', { infer: true }) ??
      'http://localhost:3001/media',
  };
}
