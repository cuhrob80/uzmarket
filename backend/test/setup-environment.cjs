process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_HOST = process.env.TEST_DATABASE_HOST ?? 'localhost';
process.env.DATABASE_PORT = process.env.TEST_DATABASE_PORT ?? '5433';
process.env.DATABASE_NAME = process.env.TEST_DATABASE_NAME ?? 'uzmarket_test';
process.env.DATABASE_USER = process.env.TEST_DATABASE_USER ?? 'uzmarket';
process.env.DATABASE_PASSWORD = process.env.TEST_DATABASE_PASSWORD ?? 'uzmarket_local';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e';
process.env.JWT_EXPIRES_IN = '900';
process.env.STORAGE_LOCAL_PATH =
  process.env.TEST_STORAGE_LOCAL_PATH ?? '/tmp/uzmarket-e2e-storage';
process.env.STORAGE_PUBLIC_URL = 'http://localhost:3001/media';

if (!/(^|[_-])test([_-]|$)/i.test(process.env.DATABASE_NAME)) {
  throw new Error(
    `E2E safety guard refused database "${process.env.DATABASE_NAME}". ` +
      'TEST_DATABASE_NAME must identify a dedicated test database.',
  );
}
