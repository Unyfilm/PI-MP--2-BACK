// Global test setup
import { config } from '../src/config/environment';

// Ensure we're in test environment
if (config.nodeEnv !== 'test') {
  throw new Error('Tests must run in NODE_ENV=test environment');
}

// Prevent production database access
if (process.env.MONGODB_URI?.includes('mongodb+srv://moviePI')) {
  console.error('❌ Tests attempting to use production database!');
  process.exit(1);
}

console.log('🧪 Test environment initialized correctly');