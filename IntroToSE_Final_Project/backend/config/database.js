/**
 * Database Configuration
 * 
 * Chức năng:
 * - Kết nối MongoDB sử dụng Mongoose
 * - Xử lý connection pooling
 * - Error handling cho database connection
 * 
 * Luồng xử lý:
 * 1. Import mongoose và dotenv
 * 2. Đọc MONGODB_URI từ .env
 * 3. Tạo connection với options (useNewUrlParser, useUnifiedTopology)
 * 4. Listen events: connected, error, disconnected
 * 5. Graceful shutdown khi app terminate
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
