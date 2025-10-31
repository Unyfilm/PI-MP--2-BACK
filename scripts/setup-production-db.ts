
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const setupProductionDatabase = async (): Promise<void> => {
  try {
    
    const mongoUri = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI_PROD or MONGODB_URI environment variable is required');
    }

    if (!mongoUri.includes('movie-streaming-prod')) {
      throw new Error('This script should only run against production database');
    }

    console.log('🔗 Connecting to production database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to production MongoDB');

    const db = mongoose.connection.db!;

    
    console.log('📝 Creating Users indexes...');
    await db.collection('users').createIndex(
      { email: 1 }, 
      { unique: true, background: true, name: 'email_unique' }
    );
    
    await db.collection('users').createIndex(
      { username: 1 }, 
      { unique: true, background: true, name: 'username_unique' }
    );
    
    await db.collection('users').createIndex(
      { resetPasswordToken: 1 }, 
      { sparse: true, background: true, name: 'reset_token_sparse' }
    );
    
    await db.collection('users').createIndex(
      { resetPasswordExpires: 1 }, 
      { expireAfterSeconds: 0, background: true, name: 'reset_expires_ttl' }
    );

    
    console.log('🎬 Creating Movies indexes...');
    await db.collection('movies').createIndex(
      { title: 'text', description: 'text' }, 
      { background: true, name: 'movies_text_search' }
    );
    
    await db.collection('movies').createIndex(
      { genre: 1, releaseYear: -1 }, 
      { background: true, name: 'genre_year_compound' }
    );
    
    await db.collection('movies').createIndex(
      { featured: 1, createdAt: -1 }, 
      { background: true, name: 'featured_recent' }
    );

    
    console.log('🔐 Creating Sessions collection...');
    await db.collection('sessions').createIndex(
      { createdAt: 1 }, 
      { expireAfterSeconds: 604800, background: true, name: 'session_ttl' } // 7 days
    );

    
    console.log('🔍 Verifying indexes...');
    const userIndexes = await db.collection('users').listIndexes().toArray();
    const movieIndexes = await db.collection('movies').listIndexes().toArray();
    const sessionIndexes = await db.collection('sessions').listIndexes().toArray();

    console.log(`✅ Users collection: ${userIndexes.length} indexes created`);
    console.log(`✅ Movies collection: ${movieIndexes.length} indexes created`);
    console.log(`✅ Sessions collection: ${sessionIndexes.length} indexes created`);

    
    const adminExists = await db.collection('users').findOne({ 
      email: 'admin@movieplatform.com',
      role: 'admin' 
    });

    if (!adminExists) {
      console.log('👤 Admin user not found. You may want to create one manually.');
    }

    console.log('🎉 Production database setup completed successfully!');
    console.log('📊 Database statistics:');
    
    const stats = await db.stats();
    console.log(`   - Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Collections: ${stats.collections}`);
    console.log(`   - Indexes: ${stats.indexes}`);

  } catch (error: any) {
    console.error('❌ Error setting up production database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};


if (require.main === module) {
  console.log('🚀 Starting production database setup...');
  setupProductionDatabase();
}

export { setupProductionDatabase };