
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  testTimeout: 15000, 
  forceExit: true,
  detectOpenHandles: true,
  
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  
  setupFiles: ['<rootDir>/tests/env.setup.js']
};