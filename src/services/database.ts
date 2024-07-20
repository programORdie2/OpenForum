import mongoose from 'mongoose';
import { DATABASE_URL } from '../config';

async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(DATABASE_URL);
    
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;