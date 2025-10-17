const mongoose = require('mongoose');
const Role = require('../models/role');

async function initializeRoles() {
  try {
    const count = await Role.estimatedDocumentCount();

    if (count === 0) {
      await Role.insertMany([
        { role_name: 'ROLE_ADMIN' },
        { role_name: 'ROLE_USER' },
      ]);
      console.log('✅ Roles initialized successfully!');
    } else {
      console.log('ℹ️ Roles already exist, skip initialization.');
    }
  } catch (err) {
    console.error('❌ Error initializing roles:', err);
  }
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_booking';
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    initializeRoles();
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
