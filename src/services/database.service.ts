import mongoose from 'mongoose';
import { DATABASE_URL } from '../config';
import logger from '../utils/logger.util';

async function connectDB() {
  try {
    logger.log('Connecting to MongoDB...');
    
    await mongoose.connect(DATABASE_URL);
    
    logger.log('MongoDB connected');
  } catch (error) {
    logger.critical('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;