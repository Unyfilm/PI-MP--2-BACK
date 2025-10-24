/**
 * Database setup and seeding script
 * Run this after setting up your MongoDB Atlas connection
 */

import { connectDB, disconnectDB } from './src/config/database';
import { User } from './src/models/User';
import { Movie } from './src/models/Movie';
import { UserRole } from './src/types/user.types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create sample data for development
 */
const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (only in development)
    if (process.env.NODE_ENV === 'development') {
      await User.deleteMany({});
      await Movie.deleteMany({});
      console.log('🗑️ Cleared existing data');
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@movieplatform.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      age: 30,
      role: UserRole.ADMIN,
    });

    await adminUser.save();
    console.log('👤 Created admin user');

    // Create sample user
    const sampleUser = new User({
      username: 'moviefan',
      email: 'user@example.com',
      password: 'User123!',
      firstName: 'Movie',
      lastName: 'Fan',
      age: 25,
      role: UserRole.USER,
    });

    await sampleUser.save();
    console.log('👤 Created sample user');

    // Create sample movies - COMMENTED OUT TO AVOID VALIDATION ERRORS
    // const sampleMovies = [
    //   {
    //     title: 'The Matrix',
    //     description: 'A computer programmer discovers reality is a simulation.',
    //     synopsis: 'Neo, a computer programmer, is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.',
    //     releaseDate: new Date('1999-03-31'),
    //     duration: 136,
    //     genre: ['Action', 'Science Fiction'],
    //     director: 'The Wachowskis',
    //     cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    //     poster: 'https://example.com/matrix-poster.jpg',
    //     trailer: 'https://example.com/matrix-trailer.mp4',
    //     videoUrl: 'https://example.com/matrix-full.mp4',
    //     language: 'en',
    //     tags: ['cyberpunk', 'philosophy', 'action'],
    //   },
    //   {
    //     title: 'Inception',
    //     description: 'A thief who steals corporate secrets through dream-sharing technology.',
    //     synopsis: 'Dom Cobb is a skilled thief who steals secrets from deep within the subconscious during the dream state. He is offered a chance to have his criminal history erased as payment for implanting an idea into a target\'s subconscious.',
    //     releaseDate: new Date('2010-07-16'),
    //     duration: 148,
    //     genre: ['Action', 'Science Fiction', 'Thriller'],
    //     director: 'Christopher Nolan',
    //     cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
    //     poster: 'https://example.com/inception-poster.jpg',
    //     trailer: 'https://example.com/inception-trailer.mp4',
    //     videoUrl: 'https://example.com/inception-full.mp4',
    //     language: 'en',
    //     tags: ['dreams', 'heist', 'mind-bending'],
    //   },
    // ];

    // for (const movieData of sampleMovies) {
    //   const movie = new Movie(movieData);
    //   await movie.save();
    // }

    // console.log('🎬 Created sample movies');
    console.log('✅ Database seeding completed successfully!');
    
    console.log('\n📋 Sample Accounts:');
    console.log('Admin - Email: admin@movieplatform.com, Password: Admin123!');
    console.log('User - Email: user@example.com, Password: User123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Test database connection
 */
const testConnection = async (): Promise<void> => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await connectDB();
    
    // Test a simple query
    const userCount = await User.countDocuments();
    const movieCount = await Movie.countDocuments();
    
    console.log(`✅ Connection successful!`);
    console.log(`📊 Database stats: ${userCount} users, ${movieCount} movies`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Main setup function
 */
const setupDatabase = async (): Promise<void> => {
  try {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'test':
        await testConnection();
        break;
      case 'seed':
        await connectDB();
        await seedDatabase();
        break;
      case 'reset':
        await connectDB();
        console.log('🗑️ Resetting database...');
        await User.deleteMany({});
        await Movie.deleteMany({});
        await seedDatabase();
        break;
      default:
        console.log('📋 Available commands:');
        console.log('  npm run db:test  - Test database connection');
        console.log('  npm run db:seed  - Seed database with sample data');
        console.log('  npm run db:reset - Reset and seed database');
        break;
    }

    await disconnectDB();
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase, testConnection, seedDatabase };