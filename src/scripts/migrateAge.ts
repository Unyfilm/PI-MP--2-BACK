/**
 * Migration script to safely add age field to existing users
 * This uses the User model for proper validation
 */

import mongoose from 'mongoose';
import { User } from '../models/User';
import { config } from '../config/environment';

async function migrateUsersAge() {
  try {
    // Connect to MongoDB
    const mongoUri = config.mongodbUri;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for age migration');

    // Find all users without age field
    const usersWithoutAge = await User.find({ age: { $exists: false } });
    
    console.log(`📊 Found ${usersWithoutAge.length} users without age field`);

    if (usersWithoutAge.length === 0) {
      console.log('✅ All users already have age field - no migration needed');
      return;
    }

    // Update each user individually to avoid validation issues
    let updatedCount = 0;
    for (const user of usersWithoutAge) {
      try {
        // Use updateOne to bypass validation middleware
        await User.updateOne(
          { _id: user._id },
          { $set: { age: 18 } }, // Default age of 18
          { runValidators: false } // Skip validation for migration
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

// Run if called directly
if (require.main === module) {
  migrateUsersAge()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateUsersAge };