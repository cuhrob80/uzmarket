process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_HOST = process.env.TEST_DATABASE_HOST ?? 'localhost';
process.env.DATABASE_PORT = process.env.TEST_DATABASE_PORT ?? '5433';
process.env.DATABASE_NAME = process.env.TEST_DATABASE_NAME ?? 'uzmarket';
process.env.DATABASE_USER = process.env.TEST_DATABASE_USER ?? 'uzmarket';
process.env.DATABASE_PASSWORD = process.env.TEST_DATABASE_PASSWORD ?? 'uzmarket_local';
process.env.FRONTEND_URL = 'http://localhost:3000';
