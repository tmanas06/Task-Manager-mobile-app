const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Task = require('../models/Task');

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing users and tasks');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskapp.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('👤 Created admin: admin@taskapp.com / Admin@123');

    // Create regular users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'user1@taskapp.com',
      password: 'User@123',
      role: 'user',
    });
    console.log('👤 Created user1: user1@taskapp.com / User@123');

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'user2@taskapp.com',
      password: 'User@123',
      role: 'user',
    });
    console.log('👤 Created user2: user2@taskapp.com / User@123');

    // Create sample tasks
    const tasks = await Task.insertMany([
      {
        title: 'Design Landing Page',
        description:
          'Create wireframes and high-fidelity mockups for the main landing page. Include mobile responsive designs.',
        status: 'pending',
        assignedTo: user1._id,
        createdBy: admin._id,
      },
      {
        title: 'Set Up CI/CD Pipeline',
        description:
          'Configure GitHub Actions for automated testing and deployment to staging environment.',
        status: 'in-progress',
        assignedTo: user1._id,
        createdBy: admin._id,
      },
      {
        title: 'Write API Documentation',
        description:
          'Document all REST API endpoints using Swagger/OpenAPI specification. Include request/response examples.',
        status: 'pending',
        assignedTo: user2._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement User Authentication',
        description:
          'Build JWT-based authentication system with signup, login, and token refresh functionality.',
        status: 'completed',
        assignedTo: user2._id,
        createdBy: admin._id,
      },
      {
        title: 'Database Performance Optimization',
        description:
          'Analyze slow queries, add proper indexes, and implement query caching for frequently accessed data.',
        status: 'in-progress',
        assignedTo: user1._id,
        createdBy: admin._id,
      },
    ]);
    console.log(`📋 Created ${tasks.length} sample tasks`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Test Credentials:');
    console.log('─────────────────');
    console.log('Admin: admin@taskapp.com / Admin@123');
    console.log('User1: user1@taskapp.com / User@123');
    console.log('User2: user2@taskapp.com / User@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
