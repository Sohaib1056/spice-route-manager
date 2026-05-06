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
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
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

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
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
  res.send("Spice Route Manager API is running...");
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
