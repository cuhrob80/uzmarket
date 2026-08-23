export interface StorageUpload {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface StorageProvider {
  putObject(upload: StorageUpload): Promise<void>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
