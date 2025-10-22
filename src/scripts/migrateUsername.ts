/**
 * Migration script to generate usernames for users who don't have one
 */

import mongoose from 'mongoose';
import { User } from '../models/User';
import { config } from '../config/environment';

async function migrateUsersUsername() {
  try {
    // Connect to MongoDB
    const mongoUri = config.mongodbUri;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for username migration');

    // Find all users without username
    const usersWithoutUsername = await User.find({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" }
      ]
    });
    
    console.log(`📊 Found ${usersWithoutUsername.length} users without username`);

    if (usersWithoutUsername.length === 0) {
      console.log('✅ All users already have usernames - no migration needed');
      return;
    }

    // Generate username for each user
    let updatedCount = 0;
    for (const user of usersWithoutUsername) {
      try {
        // Generate username using the method
        const generatedUsername = await user.generateUsername();
        
        // Update the user with the generated username
        await User.updateOne(
          { _id: user._id },
          { $set: { username: generatedUsername } }
        );
        
        console.log(`✅ Generated username "${generatedUsername}" for user ${user.email}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update user ${user._id}:`, error);
      }
    }

    console.log(`✅ Migration completed: ${updatedCount} users updated with generated usernames`);
    
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
  migrateUsersUsername()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { migrateUsersUsername };