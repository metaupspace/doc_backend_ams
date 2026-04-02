import mongoose from 'mongoose';
import { databaseUrl } from './env.ts';
import logger from './logger.ts';

export const connectDB = async () => {
  try {
    await mongoose.connect(databaseUrl);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`MongoDB disconnection failed: ${error.message}`);
  }
};

export default mongoose;
