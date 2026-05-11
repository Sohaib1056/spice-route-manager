import { Request, Response } from "express";
import Purchase from "../models/Purchase";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";
import Supplier from "../models/Supplier";
import AuditLog from "../models/AuditLog";
import path from "path";
import fs from "fs";

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  try {
    const purchase = new Purchase(req.body);
    await purchase.save();

    // Create audit log
    if (req.body.currentUserId) {
      await AuditLog.create({
        userId: req.body.currentUserId,
        userName: req.body.currentUserName || "System",
        userRole: req.body.currentUserRole || "Staff",
        action: "purchase",
        category: "transaction",
        severity: "success",
        module: "Purchases",
        description: `New purchase order created: ${purchase.po}`,
        details: `Supplier: ${purchase.supplierName}, Total: PKR ${purchase.total}`,
        ipAddress: req.ip,
      });
    }
    
    // Update supplier total purchases and balance due
    const supplier = await Supplier.findById(purchase.supplierId);
    if (supplier) {
      supplier.totalPurchases += purchase.total;
      supplier.balanceDue += purchase.total;
      
      // Update status based on balance
      const totalOwed = supplier.openingBalance + supplier.totalPurchases;
      if (supplier.balanceDue === 0) {
        supplier.status = "Paid";
      } else if (supplier.balanceDue > 0 && supplier.balanceDue < totalOwed) {
        supplier.status = "Partial";
      } else {
        supplier.status = "Due";
      }
      
      await supplier.save();
      console.log(`Supplier ${supplier.name} updated: totalPurchases=${supplier.totalPurchases}, balanceDue=${supplier.balanceDue}, status=${supplier.status}`);
    }

    // Create audit log
    if (req.body.currentUserId) {
      await AuditLog.create({
        userId: req.body.currentUserId,
        userName: req.body.currentUserName || "System",
        userRole: req.body.currentUserRole || "Staff",
        action: "update",
        category: "transaction",
        severity: "info",
        module: "Purchases",
        description: `Purchase order received: ${purchase.po}`,
        details: `Status updated to Received`,
        ipAddress: req.ip,
      });
    }

    if (purchase.status === "Received") {
      console.log(`[CreatePurchase] Creating movements for Received PO: ${purchase.po}`);
      for (const item of purchase.items) {
        try {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.productId },
            { $inc: { stock: Number(item.qty) || 0 } },
            { new: true }
          );

          if (updatedProduct) {
            const newStock = updatedProduct.stock;
            const prevStock = newStock - (Number(item.qty) || 0);

            await StockMovement.create({
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              type: "In",
              qty: Number(item.qty),
              prevStock,
              newStock,
              reason: `Purchase Order (Creation): ${purchase.po}`,
              doneBy: req.body.currentUserName || "System",
              date: new Date()
            });
          }
        } catch (itemErr) {
          console.error(`[CreatePurchase] Movement failed for ${item.productId}:`, itemErr);
        }
      }
    }
    
    res.status(201).json(purchase);
  } catch (error) {
    console.error("Error creating purchase:", error);
    res.status(400).json({ message: "Error creating purchase order" });
  }
};

export const receivePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { receivedDate, notes, currentUserId, currentUserName, currentUserRole } = req.body;

    console.log(`[ReceivePurchase] START - PO ID: ${id}`);

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      console.error(`[ReceivePurchase] NOT FOUND: ${id}`);
      return res.status(404).json({ message: "Purchase order not found" });
    }
    
    if (purchase.status === "Received") {
      console.log(`[ReceivePurchase] ALREADY RECEIVED: ${purchase.po}`);
      return res.json(purchase);
    }

    // 1. Handle Supplier Bill (Safe Parsing)
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      purchase.supplierBill = {
        name: req.file.originalname,
        url: fileUrl,
        size: req.file.size
      };
    } else if (req.body.supplierBill && req.body.supplierBill !== "undefined") {
      try {
        const bill = typeof req.body.supplierBill === 'string' 
          ? JSON.parse(req.body.supplierBill) 
          : req.body.supplierBill;
        if (bill && (bill.url || bill.name)) {
          purchase.supplierBill = bill;
        }
      } catch (e) {
        console.warn("[ReceivePurchase] supplierBill parse failed, skipping");
      }
    }

    // 2. Update Status and Date
    purchase.status = "Received";
    const rDate = receivedDate ? new Date(receivedDate) : new Date();
    purchase.receivedDate = isNaN(rDate.getTime()) ? new Date() : rDate;

    // 3. Save Purchase FIRST (Database Check)
    console.log(`[ReceivePurchase] SAVING PURCHASE: ${purchase.po}`);
    try {
      purchase.markModified('supplierBill');
      await purchase.save();
    } catch (saveErr: any) {
      console.error(`[ReceivePurchase] SAVE FAILED:`, saveErr);
      
      // LOG THE EXACT VALIDATION ERRORS IF THEY EXIST
      if (saveErr.name === 'ValidationError') {
        console.error(`[ReceivePurchase] Validation Details:`, JSON.stringify(saveErr.errors, null, 2));
        return res.status(400).json({ 
          message: "Validation Error", 
          details: Object.keys(saveErr.errors).reduce((acc: any, key) => {
            acc[key] = saveErr.errors[key].message;
            return acc;
          }, {})
        });
      }
      return res.status(500).json({ message: "Database Save Error", error: saveErr.message });
    }

    // 4. Strict Inventory Update
    console.log(`[ReceivePurchase] Updating inventory for ${purchase.items.length} items`);
    for (const item of purchase.items) {
      try {
        if (!item.productId) continue;
        
        // Use findOneAndUpdate with $inc for atomic database-level update
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.productId },
          { $inc: { stock: Number(item.qty) || 0 } },
          { new: true }
        );

        if (updatedProduct) {
          const newStock = updatedProduct.stock;
          const prevStock = newStock - (Number(item.qty) || 0);
          
          console.log(`[ReceivePurchase] Atomic Stock Update for ${updatedProduct.name}: ${prevStock} -> ${newStock}`);

          // Log stock movement (non-blocking)
          try {
            await StockMovement.create({
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              type: "In",
              qty: Number(item.qty),
              prevStock,
              newStock,
              reason: `PO Received: ${purchase.po}`,
              doneBy: currentUserName || "System",
              date: new Date()
            });
          } catch (logErr) {
            console.warn(`[ReceivePurchase] StockMovement log failed for ${updatedProduct.name}`);
          }
        } else {
          console.error(`[ReceivePurchase] Product not found for atomic update: ${item.productId}`);
        }
      } catch (itemErr: any) {
        console.error(`[ReceivePurchase] Item Update Failed for ${item.name}:`, itemErr);
      }
    }

    // 5. Audit Log (Optional)
    try {
      await AuditLog.create({
        userId: currentUserId || "system",
        userName: currentUserName || "System",
        userRole: currentUserRole || "Staff",
        action: "update",
        category: "transaction",
        severity: "info",
        module: "Purchases",
        description: `PO Received: ${purchase.po}`,
        details: `Total: PKR ${purchase.total}`,
        ipAddress: req.ip,
      });
    } catch (auditErr) {
      console.warn("[ReceivePurchase] Audit log failed");
    }
    
    console.log(`[ReceivePurchase] SUCCESS: ${purchase.po}`);
    return res.json(purchase);
  } catch (error: any) {
    console.error("[ReceivePurchase] UNEXPECTED FATAL ERROR:", error);
    return res.status(500).json({ 
      message: "Unexpected Server Error", 
      error: error.message 
    });
  }
};

export const updatePurchase = async (req: Request, res: Response) => {
  try {
    const oldPurchase = await Purchase.findById(req.params.id);
    if (!oldPurchase) return res.status(404).json({ message: "Purchase order not found" });
    
    const wasReceived = oldPurchase.status === "Received";
    const oldItems = JSON.parse(JSON.stringify(oldPurchase.items));
    const oldTotal = oldPurchase.total;
    const oldSupplierId = oldPurchase.supplierId;
    
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!purchase) return res.status(404).json({ message: "Purchase order not found" });
    
    const isReceived = purchase.status === "Received";
    const newTotal = purchase.total;
    const newSupplierId = purchase.supplierId;

    // --- Stock Sync Logic ---
    // If order WAS received and now its items or status changed, we need to revert old stock and apply new
    if (wasReceived) {
      for (const item of oldItems) {
        try {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.productId },
            { $inc: { stock: -Number(item.qty) } },
            { new: true }
          );
          if (updatedProduct) {
            await StockMovement.create({
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              type: "Out",
              qty: item.qty,
              prevStock: updatedProduct.stock + Number(item.qty),
              newStock: updatedProduct.stock,
              reason: `Edit Purchase Order (Revert): ${purchase.po}`,
              doneBy: "System",
              date: new Date()
            });
          }
        } catch (err) {
          console.error(`Stock revert failed for item ${item.productId}`, err);
        }
      }
    }

    // If order IS NOW received (either it was already or it's newly received), apply new stock
    if (isReceived) {
      for (const item of purchase.items) {
        try {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.productId },
            { $inc: { stock: Number(item.qty) } },
            { new: true }
          );
          if (updatedProduct) {
            await StockMovement.create({
              productId: updatedProduct._id,
              productName: updatedProduct.name,
              type: "In",
              qty: item.qty,
              prevStock: updatedProduct.stock - Number(item.qty),
              newStock: updatedProduct.stock,
              reason: `Edit Purchase Order (Apply): ${purchase.po}`,
              doneBy: "System",
              date: new Date()
            });
          }
        } catch (err) {
          console.error(`Stock apply failed for item ${item.productId}`, err);
        }
      }
    }
    
    // Update supplier totals
    if (oldSupplierId.toString() === newSupplierId.toString()) {
      // Same supplier - update the difference
      const difference = newTotal - oldTotal;
      const supplier = await Supplier.findById(oldSupplierId);
      if (supplier) {
        supplier.totalPurchases += difference;
        supplier.balanceDue += difference;
        
        // Update status based on balance
        const totalOwed = supplier.openingBalance + supplier.totalPurchases;
        if (supplier.balanceDue === 0) {
          supplier.status = "Paid";
        } else if (supplier.balanceDue > 0 && supplier.balanceDue < totalOwed) {
          supplier.status = "Partial";
        } else {
          supplier.status = "Due";
        }
        
        await supplier.save();
      }
    } else {
      // Different supplier - remove from old, add to new
      const oldSupplier = await Supplier.findById(oldSupplierId);
      if (oldSupplier) {
        oldSupplier.totalPurchases -= oldTotal;
        oldSupplier.balanceDue -= oldTotal;
        
        const oldTotalOwed = oldSupplier.openingBalance + oldSupplier.totalPurchases;
        if (oldSupplier.balanceDue === 0) {
          oldSupplier.status = "Paid";
        } else if (oldSupplier.balanceDue > 0 && oldSupplier.balanceDue < oldTotalOwed) {
          oldSupplier.status = "Partial";
        } else {
          oldSupplier.status = "Due";
        }
        
        await oldSupplier.save();
      }
      
      const newSupplier = await Supplier.findById(newSupplierId);
      if (newSupplier) {
        newSupplier.totalPurchases += newTotal;
        newSupplier.balanceDue += newTotal;
        
        const newTotalOwed = newSupplier.openingBalance + newSupplier.totalPurchases;
        if (newSupplier.balanceDue === 0) {
          newSupplier.status = "Paid";
        } else if (newSupplier.balanceDue > 0 && newSupplier.balanceDue < newTotalOwed) {
          newSupplier.status = "Partial";
        } else {
          newSupplier.status = "Due";
        }
        
        await newSupplier.save();
      }
    }
    
    res.json(purchase);
  } catch (error) {
    console.error("Error updating purchase:", error);
    res.status(400).json({ message: "Error updating purchase order" });
  }
};

export const deletePurchase = async (req: Request, res: Response) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase order not found" });
    
    // Update supplier totals before deleting
    const supplier = await Supplier.findById(purchase.supplierId);
    if (supplier) {
      // Always subtract from totalPurchases
      supplier.totalPurchases -= purchase.total;
      
      // For balanceDue, check payment status
      if (purchase.paymentStatus === "Pending") {
        // Purchase was never paid, subtract full amount from balance
        supplier.balanceDue -= purchase.total;
        console.log(`Deleting unpaid purchase ${purchase.po}. Subtracting ${purchase.total} from balance.`);
      } else if (purchase.paymentStatus === "Paid") {
        // Purchase was fully paid, balance was already reduced
        // Don't subtract from balance
        console.log(`Deleting paid purchase ${purchase.po}. Balance already adjusted, not subtracting.`);
      } else if (purchase.paymentStatus === "Partial") {
        // Purchase was partially paid
        // Recalculate balance from scratch to be safe
        const PurchaseImported = (await import("../models/Purchase")).default;
        const allPurchases = await (PurchaseImported as any).find({ 
          supplierId: supplier._id,
          _id: { $ne: purchase._id } // Exclude the one being deleted
        });
        
        // Calculate total of all remaining purchases
        const totalRemainingPurchases = allPurchases.reduce((sum: number, p: any) => sum + p.total, 0);
        
        // Get total paid from finance transactions
        const FinanceTransactionImported = (await import("../models/FinanceTransaction")).default;
        const payments = await (FinanceTransactionImported as any).find({
          supplierId: supplier._id,
          type: "Expense",
          category: "Supplier Payment"
        });
        const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        
        // Recalculate balance
        const totalOwed = supplier.openingBalance + totalRemainingPurchases;
        supplier.balanceDue = totalOwed - totalPaid;
        
        console.log(`Deleting partially paid purchase ${purchase.po}. Recalculated balance: ${supplier.balanceDue}`);
      }
      
      // Ensure balance doesn't go negative
      if (supplier.balanceDue < 0) {
        console.log(`Warning: Supplier ${supplier.name} balance went negative (${supplier.balanceDue}). Setting to 0.`);
        supplier.balanceDue = 0;
      }
      
      // Update status based on balance
      const totalOwed = supplier.openingBalance + supplier.totalPurchases;
      if (supplier.balanceDue === 0) {
        supplier.status = "Paid";
      } else if (supplier.balanceDue > 0 && supplier.balanceDue < totalOwed) {
        supplier.status = "Partial";
      } else {
        supplier.status = "Due";
      }
      
      await supplier.save();
      console.log(`Supplier ${supplier.name} after delete: totalPurchases=${supplier.totalPurchases}, balanceDue=${supplier.balanceDue}, status=${supplier.status}`);
    }
    
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: "Purchase order removed" });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

