// agent-notes: { ctx: "MongoDB connection setup with graceful timeout fallback", deps: ["mongoose"], state: "active", last: "anti@2026-07-31" }
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/skillbridge';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}. Running in hybrid fallback mode.`);
  }
};

export default connectDB;
