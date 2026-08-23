import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { LocalStorageProvider } from '../src/storage/local-storage.provider';

describe('LocalStorageProvider', () => {
  let storagePath: string;
  let provider: LocalStorageProvider;

  beforeEach(async () => {
    storagePath = await mkdtemp(join(tmpdir(), 'uzmarket-storage-'));

    const configService = new ConfigService({
      STORAGE_LOCAL_PATH: storagePath,
      STORAGE_PUBLIC_URL: 'http://localhost:3001/media',
    });

    provider = new LocalStorageProvider(configService as never);
  });

  afterEach(async () => {
    await rm(storagePath, { recursive: true, force: true });
  });

  it('stores a file and builds its public URL', async () => {
    await provider.putObject({
      key: 'listings/test/photo.webp',
      body: Buffer.from('image-data'),
      contentType: 'image/webp',
    });

    const stored = await readFile(
      join(storagePath, 'listings/test/photo.webp'),
      'utf8',
    );

    expect(stored).toBe('image-data');
    expect(provider.getPublicUrl('listings/test/photo.webp')).toBe(
      'http://localhost:3001/media/listings/test/photo.webp',
    );
  });

  it('deletes a stored file', async () => {
    await provider.putObject({
      key: 'listings/test/delete.webp',
      body: Buffer.from('delete-me'),
      contentType: 'image/webp',
    });

    await expect(
      provider.deleteObject('listings/test/delete.webp'),
    ).resolves.toBeUndefined();

    await expect(
      readFile(join(storagePath, 'listings/test/delete.webp')),
    ).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('rejects path traversal keys', async () => {
    await expect(
      provider.putObject({
        key: '../secret.txt',
        body: Buffer.from('blocked'),
        contentType: 'text/plain',
      }),
    ).rejects.toThrow('Invalid storage key');

    expect(() => provider.getPublicUrl('../secret.txt')).toThrow(
      'Invalid storage key',
    );
  });

  it('rejects empty storage keys', async () => {
    await expect(
      provider.putObject({
        key: '',
        body: Buffer.from('blocked'),
        contentType: 'text/plain',
      }),
    ).rejects.toThrow('Invalid storage key');
  });
});
