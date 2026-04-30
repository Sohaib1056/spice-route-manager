import { Request, Response } from "express";
import Order from "../models/Order";
import AuditLog from "../models/AuditLog";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Create audit log for the new order
    await AuditLog.create({
      userId: "System",
      userName: "Website Customer",
      userRole: "Customer",
      action: "create",
      category: "order",
      severity: "success",
      module: "Sales",
      description: `New Order received from ${order.customer.name}`,
      details: `Total: Rs. ${order.grandTotal}, Method: ${order.paymentMethod}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ success: false, message: "Error creating order" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ success: false, message: "Error updating order" });
  }
};
