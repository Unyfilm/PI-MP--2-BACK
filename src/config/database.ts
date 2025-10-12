/**
 * Database configuration and connection setup
 * Handles MongoDB Atlas connection using Mongoose
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Establish a connection to the MongoDB database.
 * 
 * Uses the connection string provided in the environment variable `MONGODB_URI`.
 * On success, logs a confirmation message. On failure, logs the error and
 * terminates the process with exit code 1.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is established.
 * @throws Will terminate the process if the connection fails.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      // Modern Mongoose doesn't need these options, they're defaults now
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error: any) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from the MongoDB database.
 * 
 * Gracefully closes the active connection and logs the result.
 * If an error occurs, it is logged to the console.
 * 
 * @async
 * @function disconnectDB
 * @returns {Promise<void>} Resolves when the connection is closed.
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error: any) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Database connection event listeners
 */
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});