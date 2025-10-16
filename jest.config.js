/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  testTimeout: 15000, // Increased for MongoDB Memory Server
  forceExit: true,
  detectOpenHandles: true,
  
  // Ensure tests use test environment
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Exclude production files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Environment variables for tests
  setupFiles: ['<rootDir>/tests/env.setup.js']
};