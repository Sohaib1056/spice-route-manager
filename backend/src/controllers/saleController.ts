import { Request, Response } from "express";
import Sale from "../models/Sale";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";

export const getSales = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { invoice: { $regex: search, $options: "i" } },
        { customer: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error in getSales:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

import AuditLog from "../models/AuditLog";
import User from "../models/User";

export const createSale = async (req: Request, res: Response) => {
  try {
    const saleData = req.body;
    
    // 1. Create and Save Sale FIRST
    const sale = new Sale(saleData);
    await sale.save();

    // 2. Update stock levels and create movements (Atomic per item)
    for (const item of sale.items) {
      try {
        // Use findOneAndUpdate with $inc (negative) for atomic database-level deduction
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.productId },
          { $inc: { stock: -(Number(item.qty) || 0) } },
          { new: true }
        );

        if (updatedProduct) {
          const newStock = updatedProduct.stock;
          const prevStock = newStock + (Number(item.qty) || 0);
          
          console.log(`[CreateSale] Atomic Stock Update for ${updatedProduct.name}: ${prevStock} -> ${newStock}`);

          await StockMovement.create({
            productId: updatedProduct._id,
            productName: updatedProduct.name,
            type: "Out",
            qty: Number(item.qty),
            prevStock,
            newStock,
            reason: `Sale Invoice: ${sale.invoice}`,
            doneBy: req.body.currentUserName || "System",
            date: new Date()
          });
        } else {
          console.error(`[CreateSale] Product not found for atomic update: ${item.productId}`);
        }
      } catch (itemErr) {
        console.error(`[CreateSale] Error updating stock for item ${item.productId}:`, itemErr);
      }
    }

    // 3. Create audit log (Non-blocking)
    try {
      await AuditLog.create({
        userId: req.body.currentUserId || "system",
        userName: req.body.currentUserName || "System",
        userRole: req.body.currentUserRole || "Staff",
        action: "sale",
        category: "transaction",
        severity: "success",
        module: "Sales",
        description: `New sale completed: ${sale.invoice}`,
        details: `Total: PKR ${sale.total}, Items: ${sale.items.length}`,
        ipAddress: req.ip,
      });
    } catch (auditErr) {
      console.warn("Audit log creation failed for sale:", auditErr);
    }
    
    res.status(201).json(sale);
  } catch (error: any) {
    console.error("Error creating sale:", error);
    res.status(400).json({ 
      message: "Error creating sale", 
      error: error.message,
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let sale;
    
    // Check if ID is a MongoDB ObjectId
    if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
      sale = await Sale.findById(id);
    } else {
      // Otherwise, search by invoice number
      sale = await Sale.findOne({ invoice: id });
    }

    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (error) {
    console.error("Error in getSaleById:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
