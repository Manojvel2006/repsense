module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  testMatch: ['**/e2e/**/*.test.ts'],
  setupFilesAfterSetup: ['@testing-library/jest-native/extend-expect'],
  testTimeout: 120000,
  maxWorkers: 1,
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
};