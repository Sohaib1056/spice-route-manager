import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const options = {
      maxPoolSize: 50, // Increased for scalability
      minPoolSize: 10, // Maintain minimum active connections
      socketTimeoutMS: 60000, // Increase socket timeout
      serverSelectionTimeoutMS: 30000, // More time for Atlas cluster selection
      heartbeatFrequencyMS: 10000, // Keep-alive heartbeats
      connectTimeoutMS: 30000,
      family: 4, 
    };

    console.log("Attempting to connect to MongoDB Atlas...");
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/spice-route",
      options
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      if (error.message.includes("whitelist")) {
        console.error("CRITICAL: IP not whitelisted in MongoDB Atlas. Please add 0.0.0.0/0 to Network Access.");
      }
    } else {
      console.error("An unknown error occurred during database connection");
    }
    process.exit(1);
  }
};

export default connectDB;
