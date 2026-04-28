import { Request, Response } from "express";
import Purchase from "../models/Purchase";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";
import Supplier from "../models/Supplier";
import AuditLog from "../models/AuditLog";

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
      for (const item of purchase.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prevStock = product.stock;
          product.stock += item.qty;
          await product.save();

          await StockMovement.create({
            productId: product._id,
            productName: product.name,
            type: "In",
            qty: item.qty,
            prevStock,
            newStock: product.stock,
            reason: `Purchase Order: ${purchase.po}`,
            doneBy: "System",
            date: new Date()
          });
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
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase order not found" });
    
    if (purchase.status !== "Received") {
      purchase.status = "Received";
      purchase.receivedDate = new Date();
      await purchase.save();

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
      
      for (const item of purchase.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prevStock = product.stock;
          product.stock += item.qty;
          await product.save();

          await StockMovement.create({
            productId: product._id,
            productName: product.name,
            type: "In",
            qty: item.qty,
            prevStock,
            newStock: product.stock,
            reason: `Received Purchase Order: ${purchase.po}`,
            doneBy: "System",
            date: new Date()
          });
        }
      }
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ message: "Error receiving purchase" });
  }
};

export const updatePurchase = async (req: Request, res: Response) => {
  try {
    const oldPurchase = await Purchase.findById(req.params.id);
    if (!oldPurchase) return res.status(404).json({ message: "Purchase order not found" });
    
    const oldTotal = oldPurchase.total;
    const oldSupplierId = oldPurchase.supplierId;
    
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!purchase) return res.status(404).json({ message: "Purchase order not found" });
    
    const newTotal = purchase.total;
    const newSupplierId = purchase.supplierId;
    
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
        const PurchaseModel = await import("../models/Purchase.js");
        const PurchaseImported = PurchaseModel.default;
        const allPurchases = await PurchaseImported.find({ 
          supplierId: supplier._id,
          _id: { $ne: purchase._id } // Exclude the one being deleted
        });
        
        // Calculate total of all remaining purchases
        const totalRemainingPurchases = allPurchases.reduce((sum: number, p: any) => sum + p.total, 0);
        
        // Get total paid from finance transactions
        const FinanceTransactionModel = await import("../models/FinanceTransaction.js");
        const FinanceTransactionImported = FinanceTransactionModel.default;
        const payments = await FinanceTransactionImported.find({
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

