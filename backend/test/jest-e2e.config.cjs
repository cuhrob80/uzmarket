module.exports = {
  rootDir: '..', testEnvironment: 'node', testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  setupFiles: ['<rootDir>/test/setup-environment.cjs'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }] },
};
