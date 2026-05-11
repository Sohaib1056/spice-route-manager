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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://spice-route-manager-voem.vercel.app",
  "https://spice-route-manager.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any of the allowed origins or is a vercel subdomain
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === "*") return true;
      if (origin === allowedOrigin) return true;
      // Also allow any vercel preview deployments for this project
      if (origin.includes("vercel.app") && (origin.includes("spice-route-manager") || origin.includes("dryfruit"))) {
        return true;
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      // Instead of failing, we'll allow it but log it during this debug phase
      // This helps identify if CORS is the real culprit or just a symptom of 500
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "Origin"],
  exposedHeaders: ["Set-Cookie", "Access-Control-Allow-Origin"]
};

const io = new Server(server, {
  cors: corsOptions
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

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: false,
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
    version: "1.0.1-CORS-FIX",
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
