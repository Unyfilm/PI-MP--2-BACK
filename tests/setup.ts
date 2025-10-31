
import { config } from '../src/config/environment';


if (config.nodeEnv !== 'test') {
  throw new Error('Tests must run in NODE_ENV=test environment');
}


if (process.env.MONGODB_URI?.includes('mongodb+srv://moviePI')) {
  console.error('❌ Tests attempting to use production database!');
  process.exit(1);
}

console.log('🧪 Test environment initialized correctly');