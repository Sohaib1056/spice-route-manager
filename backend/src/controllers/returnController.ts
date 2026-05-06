import { Request, Response } from "express";
import Return from "../models/Return";
import Product from "../models/Product";
import WebsiteOrder from "../models/WebsiteOrder";
import Sale from "../models/Sale";
import StockMovement from "../models/StockMovement";
import FinanceTransaction from "../models/FinanceTransaction";
import AuditLog from "../models/AuditLog";
import mongoose from "mongoose";

export const getReturns = async (req: Request, res: Response) => {
  try {
    const { type, status, search, fromDate, toDate, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate as string),
        $lte: new Date(toDate as string),
      };
    }
    if (search) {
      query.$or = [
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
        { returnId: { $regex: search, $options: "i" } },
      ];
    }

    const returns = await Return.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Return.countDocuments(query);

    res.json({
      success: true,
      data: {
        returns,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReturnStats = async (req: Request, res: Response) => {
  try {
    const totalReturns = await Return.countDocuments();
    const pendingReturns = await Return.countDocuments({ status: "Pending" });
    const approvedRefunds = await Return.countDocuments({ status: "Approved" });
    
    const totalRefundAmountData = await Return.aggregate([
      { $match: { status: "Refunded" } },
      { $group: { _id: null, total: { $sum: "$refundAmount" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalReturns,
        pendingReturns,
        approvedRefunds,
        totalRefundAmount: totalRefundAmountData[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReturnById = async (req: Request, res: Response) => {
  try {
    const returnItem = await Return.findById(req.params.id);
    if (!returnItem) {
      return res.status(404).json({ success: false, message: "Return not found" });
    }
    res.json({ success: true, data: returnItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReturn = async (req: Request, res: Response) => {
  try {
    console.log("Incoming Return Payload:", JSON.stringify(req.body, null, 2));

    const lastReturn = await Return.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastReturn && lastReturn.returnId) {
      const parts = lastReturn.returnId.split("-");
      if (parts.length >= 3) {
        const lastNum = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastNum)) {
          nextId = lastNum + 1;
        }
      }
    }
    const year = new Date().getFullYear();
    const returnId = `RTN-${year}-${nextId.toString().padStart(4, "0")}`;

    const { type, orderId, saleId, customer, items, reason, condition, refundMethod, refundAmount } = req.body;

    // Strict validation of required fields
    if (!type || !customer || !items || !reason || !condition || !refundMethod || refundAmount === undefined) {
      console.error("Missing required fields in return payload");
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields. Please ensure customer, items, reason, condition, and refund details are provided." 
      });
    }

    // Validate items array and each item
    if (!Array.isArray(items) || items.length === 0) {
      console.error("Items array is empty or invalid");
      return res.status(400).json({ success: false, message: "At least one item must be selected for return." });
    }

    const processedItems = items.map((item: any) => {
      if (!item.productId || !item.productName || !item.quantity || !item.unitPrice || !item.totalPrice) {
        throw new Error(`Invalid item data for product: ${item.productName || 'Unknown'}`);
      }
      return {
        ...item,
        weight: item.weight || "N/A"
      };
    });

    // Prepare return data, handling optional IDs and providing defaults for customer
    const returnData: any = {
      ...req.body,
      customer: {
        name: customer?.name || "Walk-in Customer",
        phone: customer?.phone || "",
        email: customer?.email || ""
      },
      items: processedItems,
      returnId,
    };

    // Ensure orderId and saleId are null if they are empty strings or missing
    if (!returnData.orderId || returnData.orderId === "") delete returnData.orderId;
    if (!returnData.saleId || returnData.saleId === "") delete returnData.saleId;

    const newReturn = new Return(returnData);

    console.log("Saving new return with ID:", returnId);
    await newReturn.save();
    res.status(201).json({ success: true, data: newReturn });
  } catch (error: any) {
    console.error("Create Return Error Details:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "An internal server error occurred while creating the return request." 
    });
  }
};

export const approveReturn = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const returnItem = await Return.findById(req.params.id);
    if (!returnItem) {
      return res.status(404).json({ success: false, message: "Return not found" });
    }

    if (returnItem.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Only pending returns can be approved" });
    }

    // Update stock and create stock movements
    for (const item of returnItem.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) continue;

      const prevStock = product.stock;
      product.stock += item.quantity;
      await product.save({ session });

      await StockMovement.create([{
        productId: item.productId,
        productName: product.name,
        type: "Return",
        qty: item.quantity,
        prevStock,
        newStock: product.stock,
        reason: `Return Approved: ${returnItem.returnId}`,
        doneBy: req.body.processedBy || "System",
        date: new Date(),
      }], { session });
    }

    returnItem.status = "Approved";
    returnItem.processedBy = req.body.processedBy;
    returnItem.processedAt = new Date();
    await returnItem.save({ session });

    // Commit BEFORE Audit Log to ensure stock is updated first
    await session.commitTransaction();

    // Create Audit Log outside main transaction if needed or include it
    try {
      await AuditLog.create({
        userId: "system",
        userName: req.body.processedBy || "System",
        userRole: "Staff",
        action: "update",
        category: "inventory",
        severity: "info",
        module: "Returns",
        description: `Return Approved: ${returnItem.returnId}`,
        details: `Return approved for customer ${returnItem.customer.name}. Amount: ${returnItem.refundAmount}`,
      });
    } catch (auditErr) {
      console.error("Audit log failed after approval:", auditErr);
    }

    res.json({ success: true, data: returnItem });
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Approve Return Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const rejectReturn = async (req: Request, res: Response) => {
  try {
    const { rejectionReason, processedBy } = req.body;
    const returnItem = await Return.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        rejectionReason,
        processedBy,
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!returnItem) {
      return res.status(404).json({ success: false, message: "Return not found" });
    }

    res.json({ success: true, data: returnItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRefunded = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { transactionReference, processedBy } = req.body;
    const returnItem = await Return.findById(req.params.id).session(session);

    if (!returnItem) {
      return res.status(404).json({ success: false, message: "Return not found" });
    }

    if (returnItem.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Only approved returns can be marked as refunded" });
    }

    // Create Finance Transaction (Expense)
    await FinanceTransaction.create([{
      date: new Date().toISOString().split('T')[0],
      description: `Refund for Return: ${returnItem.returnId}`,
      category: "Refund",
      type: "Expense",
      amount: returnItem.refundAmount,
      reference: transactionReference || returnItem.returnId,
      method: returnItem.refundMethod || "Cash",
      paymentMethod: returnItem.refundMethod || "Cash",
      notes: `Customer: ${returnItem.customer.name}, Return ID: ${returnItem.returnId}`,
      addedBy: processedBy || "System",
    }], { session });

    returnItem.status = "Refunded";
    returnItem.transactionReference = transactionReference;
    returnItem.processedBy = processedBy;
    returnItem.refundedAt = new Date();
    await returnItem.save({ session });

    await session.commitTransaction();

    // Create Audit Log outside main transaction
    try {
      await AuditLog.create({
        userId: "system",
        userName: processedBy || "System",
        userRole: "Staff",
        action: "update",
        category: "finance",
        severity: "success",
        module: "Returns",
        description: `Refund Processed: ${returnItem.returnId}`,
        details: `Refund of ${returnItem.refundAmount} processed for customer ${returnItem.customer.name}`,
      });
    } catch (auditErr) {
      console.error("Audit log failed after refund:", auditErr);
    }

    res.json({ success: true, data: returnItem });
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Refund Process Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
