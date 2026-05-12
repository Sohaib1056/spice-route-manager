import mongoose from "mongoose";

const connectDB = async (retryCount: number = 0): Promise<void> => {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

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
      bufferCommands: false,
      // Add retry settings
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 10000,
    };

    const mongoUri = process.env.MONGO_URI;

    // Validate MongoDB URI format
    if (!mongoUri) {
      console.error("FATAL: MONGO_URI is not defined in environment variables.");
      console.error("Please set MONGO_URI in your Railway environment variables.");
      console.error("Format: mongodb+srv://username:password@cluster.mongodb.net/dbname");
      if (process.env.NODE_ENV === 'production') {
        console.error("CRITICAL: Cannot start server without database connection in production.");
        process.exit(1);
      }
      return;
    }

    // Validate URI structure
    if (!mongoUri.startsWith('mongodb+srv://') && !mongoUri.startsWith('mongodb://')) {
      console.error("FATAL: Invalid MONGO_URI format. Must start with mongodb:// or mongodb+srv://");
      process.exit(1);
    }

    // Set global mongoose options before connecting
    mongoose.set('bufferCommands', false);
    mongoose.set('debug', process.env.NODE_ENV === 'development');

    console.log(`Attempting to connect to MongoDB Atlas... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
    console.log(`MongoDB URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log("Mongoose connection state:", mongoose.connection.readyState);
    
    // Setup connection monitoring
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (err.message.includes('whitelist')) {
        console.error('🔥 IP WHITELIST ISSUE DETECTED!');
        console.error('Please add 0.0.0.0/0 to your MongoDB Atlas Network Access');
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => connectDB(0), 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    if (mongoose.connection.readyState !== 1) {
      console.error("Mongoose failed to enter connected state (1). Current state:", mongoose.connection.readyState);
      throw new Error("Failed to establish proper connection");
    }

  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error (Attempt ${retryCount + 1}/${maxRetries + 1}):`);
    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      
      // Specific error handling
      if (error.message.includes("whitelist") || error.message.includes("IP")) {
        console.error("🔥 IP WHITELIST ISSUE:");
        console.error("1. Go to MongoDB Atlas → Network Access");
        console.error("2. Click 'Add IP Address'");
        console.error("3. Select 'Allow access from anywhere (0.0.0.0/0)'");
        console.error("4. Click 'Confirm'");
      }
      
      if (error.message.includes("bad auth") || error.message.includes("authentication")) {
        console.error("🔐 AUTHENTICATION ISSUE:");
        console.error("1. Check username and password in MONGO_URI");
        console.error("2. Ensure the database user has proper permissions");
        console.error("3. Verify the database user is not deleted");
      }
      
      if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
        console.error("🌐 NETWORK/DNS ISSUE:");
        console.error("1. Check cluster URL in MONGO_URI");
        console.error("2. Verify cluster name is correct");
        console.error("3. Check if Atlas cluster is active");
      }
      
      if (error.message.includes("timed out") || error.message.includes("timeout")) {
        console.error("⏰ TIMEOUT ISSUE:");
        console.error("1. Network connectivity issues");
        console.error("2. Atlas cluster might be overloaded");
        console.error("3. Try again in a few moments");
      }
    } else {
      console.error("Unknown database connection error:", error);
    }

    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return connectDB(retryCount + 1);
    }

    console.error("🚨 CRITICAL: Failed to connect to MongoDB after all retries");
    
    // In production, we might want to exit or continue with limited functionality
    if (process.env.NODE_ENV === 'production') {
      console.error("Production mode: Cannot continue without database connection");
      process.exit(1);
    } else {
      console.warn("Development mode: Continuing without database (limited functionality)");
    }
  }
};

export default connectDB;
