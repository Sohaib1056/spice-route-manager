import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const options = {
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      connectTimeoutMS: 30000,
      family: 4, 
      retryWrites: true,
      w: 'majority' as const,
      bufferCommands: false, // Disable buffering at the connection level
    };

    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("FATAL: MONGO_URI is not defined in environment variables.");
      process.exit(1);
    }

    // Set global mongoose options before connecting
    mongoose.set('bufferCommands', false);
    mongoose.set('debug', process.env.NODE_ENV === 'development');

    console.log("Attempting to connect to MongoDB Atlas...");
    const conn = await mongoose.connect(mongoUri, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log("Mongoose connection state:", mongoose.connection.readyState);
    
    if (mongoose.connection.readyState !== 1) {
      console.error("Mongoose failed to enter connected state (1). Current state:", mongoose.connection.readyState);
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      if (error.message.includes("whitelist") || error.message.includes("timed out") || error.message.includes("buffering")) {
        console.error("CRITICAL DATABASE ISSUE: Potential causes:");
        console.error("1. IP not whitelisted (Add 0.0.0.0/0 in Atlas)");
        console.error("2. Invalid MONGO_URI (Check credentials and Cluster URL)");
        console.error("3. Atlas Cluster is suspended or down");
      }
    } else {
      console.error("An unknown error occurred during database connection");
    }
    process.exit(1);
  }
};

export default connectDB;
