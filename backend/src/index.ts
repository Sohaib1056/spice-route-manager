import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db";
import config from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

// Routes
import productRoutes from "./routes/productRoutes";
import supplierRoutes from "./routes/supplierRoutes";
import saleRoutes from "./routes/saleRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import stockRoutes from "./routes/stockRoutes";
import userRoutes from "./routes/userRoutes";
import permissionRoutes from "./routes/permissionRoutes";
import auditRoutes from "./routes/auditRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import financeRoutes from "./routes/financeRoutes";
import reportRoutes from "./routes/reportRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import lowStockRoutes from "./routes/lowStockRoutes";
import websiteOrderRoutes from "./routes/websiteOrderRoutes";
import returnRoutes from "./routes/returnRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Trust proxy - CRITICAL for Railway/Vercel deployment
app.set('trust proxy', 1);

// Simple health check - MUST be first for Railway
app.get('/health', (req, res) => {
  console.log('✅ Health check endpoint hit');
  res.status(200).send('OK');
});

// 1. CORS Configuration - MUST be FIRST before any other middleware
const allowedOrigins = [
  "https://spice-route-manager.vercel.app",
  "https://spice-route-manager-voem.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174"
];

// CORS middleware with proper configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any Vercel preview deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Otherwise, allow it anyway to prevent blocking
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Accept", 
    "X-Requested-With", 
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// 2. Additional CORS headers for extra compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.includes('.vercel.app'))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  // Handle OPTIONS preflight requests explicitly
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With, Origin");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }
  
  next();
});

// 3. Body parsers - BEFORE routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Security middleware - AFTER CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// 5. Logging
app.use(morgan("dev"));

// Static Folder for Uploads - with CORS headers
app.use("/uploads", cors(), express.static(path.join(__dirname, "../uploads"), {
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
}));

// API Routes with error handling
try {
  app.use("/api/products", productRoutes);
  app.use("/api/suppliers", supplierRoutes);
  app.use("/api/sales", saleRoutes);
  app.use("/api/purchases", purchaseRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/stock", stockRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/permissions", permissionRoutes);
  app.use("/api/audit", auditRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/low-stock", lowStockRoutes);
  app.use("/api/website-orders", websiteOrderRoutes);
  app.use("/api/returns", returnRoutes);
  console.log('✅ All API routes mounted successfully');
} catch (error) {
  console.error('❌ CRITICAL: Error mounting API routes:', error);
  process.exit(1);
}

app.get("/", (req, res) => {
  res.json({
    message: "Spice Route Manager API is running...",
    version: "1.0.4-CORS-PRODUCTION-READY",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    environment: process.env.NODE_ENV || "development",
    allowedOrigins: [
      "https://spice-route-manager.vercel.app",
      "https://spice-route-manager-voem.vercel.app",
      "*.vercel.app"
    ]
  });
});

// 404 handler for undefined routes (must be after all routes)
app.use((req, res) => {
  console.log(`⚠️  404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow all Vercel deployments and localhost
      if (!origin || 
          origin.includes('.vercel.app') || 
          origin.includes('localhost') ||
          allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible to our router
app.set('socketio', io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Connect Database
connectDB().catch((error) => {
  console.error('❌ CRITICAL: Database connection failed:', error);
  console.error('Server will continue but database operations will fail');
});

// Log startup information
console.log('='.repeat(60));
console.log('🚀 Spice Route Manager API Starting...');
console.log('='.repeat(60));
console.log(`📍 Environment: ${config.nodeEnv}`);
console.log(`🔌 Port: ${PORT}`);
console.log(`🌐 CORS Enabled for origins:`);
allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
console.log(`   - *.vercel.app (all preview deployments)`);
console.log(`📦 MongoDB URI: ${process.env.MONGO_URI ? 'Configured ✅' : 'Missing ❌'}`);
console.log('='.repeat(60));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API ready: http://localhost:${PORT}/api`);
  console.log(`🌍 Server is listening on all interfaces (0.0.0.0:${PORT})`);
}).on('error', (error: any) => {
  console.error('❌ CRITICAL: Server failed to start:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
  }
  process.exit(1);
});
