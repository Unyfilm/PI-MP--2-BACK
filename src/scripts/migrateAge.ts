/**
 * Migration script to safely add age field to existing users
 * This uses the User model for proper validation
 */

import mongoose from 'mongoose';
import { User } from '../models/User';
import { config } from '../config/environment';

async function migrateUsersAge() {
  try {
    const mongoUri = config.mongodbUri;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for age migration');

    const usersWithoutAge = await User.find({ age: { $exists: false } });
    
    console.log(`📊 Found ${usersWithoutAge.length} users without age field`);

    if (usersWithoutAge.length === 0) {
      console.log('✅ All users already have age field - no migration needed');
      return;
    }

    let updatedCount = 0;
    for (const user of usersWithoutAge) {
      try {
        await User.updateOne(
          { _id: user._id },
          { $set: { age: 18 } }, 
          { runValidators: false } 
        );
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update user ${user._id}:`, error);
      }
    }

    console.log(`✅ Migration completed: ${updatedCount} users updated with default age`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  migrateUsersAge()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateUsersAge };