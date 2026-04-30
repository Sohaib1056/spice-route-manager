import express from "express";
import {
  getAllWebsiteOrders,
  getWebsiteOrderById,
  createWebsiteOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelWebsiteOrder,
  getWebsiteOrderStats,
  deleteWebsiteOrder
} from "../controllers/websiteOrderController";

const router = express.Router();

// Get all website orders with filters
router.get("/", getAllWebsiteOrders);

// Get statistics
router.get("/stats", getWebsiteOrderStats);

// Get single order
router.get("/:id", getWebsiteOrderById);

// Create new order (from website)
router.post("/", createWebsiteOrder);

// Update order status
router.patch("/:id/status", updateOrderStatus);

// Update payment status
router.patch("/:id/payment", updatePaymentStatus);

// Cancel order
router.patch("/:id/cancel", cancelWebsiteOrder);

// Delete order
router.delete("/:id", deleteWebsiteOrder);

export default router;
