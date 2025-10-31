
const mongoose = require('mongoose');
require('dotenv').config();

async function migrateAgeField() {
  try {
    
    const dbUri = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI_PROD 
      : process.env.MONGO_URI_DEV || process.env.MONGO_URI;
      
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB for migration');

    
    const result = await mongoose.connection.db.collection('users').updateMany(
      { age: { $exists: false } },
      { $set: { age: 18 } } 
    );

    console.log(`✅ Migration completed: ${result.modifiedCount} users updated with default age`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
}


migrateAgeField();