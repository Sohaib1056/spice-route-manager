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

// 1. Health check first - ensure it's accessible without any middleware interference
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 2. Ultimate CORS Middleware - MUST be before everything else
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Explicitly allow Vercel and Localhost origins
  const allowedOrigins = [
    "https://spice-route-manager.vercel.app",
    "https://spice-route-manager-voem.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    // For tools like Postman
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    // Fallback to allowing the request origin anyway to prevent blocking
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With, Origin, Access-Control-Allow-Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
  
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// 3. standard CORS as backup
const corsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// 4. Other Middlewares
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Disable CSP for API
}));
app.use(morgan("dev"));

// Static Folder for Uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
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

app.get("/", (req, res) => {
  res.json({
    message: "Spice Route Manager API is running...",
    version: "1.0.2-STRICT-CORS-FIX",
    timestamp: new Date().toISOString()
  });
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
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
connectDB();

server.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
