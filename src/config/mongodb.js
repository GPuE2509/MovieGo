import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || `mongodb://localhost:27017/${process.env.DB_NAME || 'sdn302'}`;

export async function connectMongo() {
  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || process.env.DB_NAME || 'sdn302',
      user: process.env.MONGO_USER || undefined,
      pass: process.env.MONGO_PASSWORD || undefined,
      authSource: process.env.MONGO_AUTH_SOURCE || undefined,
      serverSelectionTimeoutMS: 8000
    });
    // eslint-disable-next-line no-console
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

export function disconnectMongo() {
  return mongoose.disconnect();
}

export { mongoose };


