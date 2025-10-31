/**
 * Production validation script
 * Run before deployment to ensure configuration is secure
 */

import { validateConfig, config, isProduction } from '../src/config/environment';

const validateProduction = () => {
  console.log('🔍 Validating production configuration...');
  
  try {
    process.env.NODE_ENV = 'production';
    
    validateConfig();
    
    const securityIssues: string[] = [];
    
    if (config.jwtSecret.includes('development') || config.jwtSecret.length < 32) {
      securityIssues.push('JWT_SECRET is not production-ready');
    }
    
    if (!config.clientUrl.startsWith('https://') && config.nodeEnv === 'production') {
      securityIssues.push('CLIENT_URL should use HTTPS in production');
    }
    
    if (config.mongodbUri.includes('localhost') || config.mongodbUri.includes('127.0.0.1')) {
      securityIssues.push('MONGODB_URI points to localhost in production');
    }
    
    if (securityIssues.length > 0) {
      console.error('❌ Security issues found:');
      securityIssues.forEach(issue => console.error(`  - ${issue}`));
      process.exit(1);
    }
    
    console.log('✅ Production configuration is valid and secure');
    
  } catch (error: any) {
    console.error('❌ Production validation failed:', error.message);
    process.exit(1);
  }
};

validateProduction();