import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../config/environment';
import { createStorageConfig } from './storage.config';
import type { StorageProvider, StorageUpload } from './storage.types';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly rootPath: string;
  private readonly publicUrl: string;

  constructor(configService: ConfigService<Environment, true>) {
    const config = createStorageConfig(configService);

    this.rootPath = resolve(config.localPath);
    this.publicUrl = config.publicUrl.replace(/\/+$/, '');
  }

  async putObject(upload: StorageUpload): Promise<void> {
    const filePath = this.resolveKey(upload.key);

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, upload.body);
  }

  async deleteObject(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true });
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${this.normalizeKey(key)}`;
  }

  private resolveKey(key: string): string {
    const normalizedKey = this.normalizeKey(key);
    const filePath = resolve(this.rootPath, normalizedKey);

    if (!filePath.startsWith(`${this.rootPath}/`)) {
      throw new Error('Invalid storage key');
    }

    return filePath;
  }

  private normalizeKey(key: string): string {
    const normalizedKey = key.replace(/^\/+/, '');

    if (
      !normalizedKey ||
      normalizedKey.includes('\\') ||
      normalizedKey.split('/').some((segment) => segment === '.' || segment === '..')
    ) {
      throw new Error('Invalid storage key');
    }

    return normalizedKey;
  }
}
