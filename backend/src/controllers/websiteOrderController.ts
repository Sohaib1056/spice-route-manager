import { Request, Response } from "express";
import WebsiteOrder from "../models/WebsiteOrder";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";
import { sendSuccess, sendError } from "../utils/responseHandler";
import { createAuditLog, logUserAction } from "../utils/auditLogger";

export const logAudit = async (
  userId: string,
  action: string,
  module: string,
  details?: string,
  description?: string
): Promise<void> => {
  try {
    await createAuditLog({
      userId,
      userName: "System/Website",
      userRole: "Staff",
      action: action.toLowerCase() as any,
      category: "system",
      module,
      description: description || `Action ${action} on ${module}`,
      details,
    });
  } catch (error) {
    console.error("Audit log helper error:", error);
  }
};

// Get all website orders
export const getAllWebsiteOrders = async (req: Request, res: Response) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Search by order number, customer name, or phone
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate as string);
      if (endDate) query.orderDate.$lte = new Date(endDate as string);
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await WebsiteOrder.find(query)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('items.productId', 'name nameUrdu emoji');
    
    const total = await WebsiteOrder.countDocuments(query);
    
    // Get statistics
    const stats = await WebsiteOrder.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);
    
    sendSuccess(res, {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      },
      stats
    }, "Website orders fetched successfully");
    
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Get single website order
export const getWebsiteOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await WebsiteOrder.findById(id)
      .populate('items.productId', 'name nameUrdu emoji sku');
    
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    
    sendSuccess(res, order, "Order fetched successfully");
    
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Create new website order (from website/API)
export const createWebsiteOrder = async (req: Request, res: Response) => {
  try {
    const {
      customer,
      shippingAddress,
      items,
      subtotal,
      shippingCharges,
      total,
      paymentMethod,
      deliveryNotes
    } = req.body;
    
    // Validate required fields
    if (!customer || !customer.firstName || !customer.lastName || !customer.phone) {
      return sendError(res, "Customer information is required", 400);
    }
    
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.province) {
      return sendError(res, "Complete shipping address is required", 400);
    }
    
    if (!items || items.length === 0) {
      return sendError(res, "Order must contain at least one item", 400);
    }
    
    // Optional: Validate items and check stock (only if productId exists in database)
    // for (const item of items) {
    //   const product = await Product.findById(item.productId);
    //   if (product && product.stock < item.quantity) {
    //     return sendError(res, `Insufficient stock for ${item.name}`, 400);
    //   }
    // }
    
    // Create order
    const order = new WebsiteOrder({
      customer,
      shippingAddress,
      items,
      subtotal,
      shippingCharges,
      total,
      paymentMethod,
      deliveryNotes,
      orderStatus: "Pending",
      paymentStatus: paymentMethod === "cod" ? "Pending" : "Pending"
    });
    
    // Update product stock and create stock movement
    for (const item of items) {
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prevStock = product.stock;
          product.stock -= item.quantity;
          await product.save();

          await StockMovement.create({
            productId: product._id,
            productName: product.name,
            type: "Out",
            qty: item.quantity,
            prevStock,
            newStock: product.stock,
            reason: `Website Order: ${order.orderNumber}`,
            doneBy: "System/Website",
            date: new Date()
          });
        }
      }
    }

    await order.save();
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new-website-order', order);
    }
    
    // Log audit
    await logAudit(
      req.user?.id || "website",
      "CREATE",
      "WebsiteOrder",
      order._id.toString(),
      `New website order created: ${order.orderNumber}`
    );
    
    sendSuccess(res, order, "Order created successfully", 201);
    
  } catch (error: any) {
    console.error("Create order error:", error);
    sendError(res, error.message, 500);
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber } = req.body;
    
    const order = await WebsiteOrder.findById(id);
    
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    
    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    
    // Update timestamps based on status
    if (orderStatus === "Confirmed" && !order.confirmedAt) {
      order.confirmedAt = new Date();
    }
    if (orderStatus === "Shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
    }
    if (orderStatus === "Delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
      // Auto-update payment status for COD
      if (order.paymentMethod === "cod") {
        order.paymentStatus = "Paid";
      }
    }
    
    await order.save();
    
    // Log audit
    await logAudit(
      req.user?.id || "unknown",
      "UPDATE",
      "WebsiteOrder",
      order._id.toString(),
      `Order status changed from ${oldStatus} to ${orderStatus}`
    );
    
    sendSuccess(res, order, "Order status updated successfully");
    
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const order = await WebsiteOrder.findById(id);
    
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    
    const oldStatus = order.paymentStatus;
    order.paymentStatus = paymentStatus;
    
    await order.save();
    
    // Log audit
    await logAudit(
      req.user?.id || "unknown",
      "UPDATE",
      "WebsiteOrder",
      order._id.toString(),
      `Payment status changed from ${oldStatus} to ${paymentStatus}`
    );
    
    sendSuccess(res, order, "Payment status updated successfully");
    
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Delete/Cancel order
export const cancelWebsiteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await WebsiteOrder.findById(id);
    
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    
    // Only allow cancellation for pending/confirmed orders
    if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
      return sendError(res, "Cannot cancel order in current status", 400);
    }
    
    order.orderStatus = "Cancelled";
    await order.save();
    
    // Log audit
    await logAudit(
      req.user?.id || "unknown",
      "UPDATE",
      "WebsiteOrder",
      order._id.toString(),
      `Order cancelled: ${order.orderNumber}`
    );
    
    sendSuccess(res, order, "Order cancelled successfully");
    
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Delete website order
export const deleteWebsiteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await WebsiteOrder.findByIdAndDelete(id);
    
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    
    // Log audit
    await logAudit(
      req.user?.id || "unknown",
      "DELETE",
      "WebsiteOrder",
      id,
      `Order deleted: ${order.orderNumber}`
    );
    
    sendSuccess(res, null, "Order deleted successfully");
    
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Get order statistics
export const getWebsiteOrderStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      total: await WebsiteOrder.countDocuments(),
      pending: await WebsiteOrder.countDocuments({ orderStatus: "Pending" }),
      confirmed: await WebsiteOrder.countDocuments({ orderStatus: "Confirmed" }),
      processing: await WebsiteOrder.countDocuments({ orderStatus: "Processing" }),
      shipped: await WebsiteOrder.countDocuments({ orderStatus: "Shipped" }),
      delivered: await WebsiteOrder.countDocuments({ orderStatus: "Delivered" }),
      cancelled: await WebsiteOrder.countDocuments({ orderStatus: "Cancelled" }),
      todayOrders: await WebsiteOrder.countDocuments({ orderDate: { $gte: today } }),
      
      // Revenue stats
      totalRevenue: await WebsiteOrder.aggregate([
        { $match: { orderStatus: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      
      pendingPayments: await WebsiteOrder.aggregate([
        { $match: { paymentStatus: "Pending" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ])
    };
    
    sendSuccess(res, stats, "Statistics fetched successfully");
    
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
