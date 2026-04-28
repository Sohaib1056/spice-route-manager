import { Request, Response } from "express";
import Supplier from "../models/Supplier";
import FinanceTransaction from "../models/FinanceTransaction";
import AuditLog from "../models/AuditLog";

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: "Error creating supplier" });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: "Error updating supplier" });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Record payment to supplier
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { amount, method, date, note, userId, userName, userRole } = req.body;
    const supplierId = req.params.id;

    console.log("Recording payment:", { amount, method, date, note, supplierId });

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid payment amount" 
      });
    }

    // Find supplier
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ 
        success: false,
        message: "Supplier not found" 
      });
    }

    // Check if payment exceeds balance due
    if (amount > supplier.balanceDue) {
      return res.status(400).json({ 
        success: false,
        message: `Payment amount (${amount}) exceeds balance due (${supplier.balanceDue})` 
      });
    }

    // Update supplier balance
    const previousBalance = supplier.balanceDue;
    supplier.balanceDue -= amount;

    // Update status based on new balance
    if (supplier.balanceDue === 0) {
      supplier.status = "Paid";
    } else if (supplier.balanceDue > 0 && supplier.balanceDue < (supplier.totalPurchases + supplier.openingBalance)) {
      supplier.status = "Partial";
    } else {
      supplier.status = "Due";
    }

    await supplier.save();

    // Update purchase orders payment status
    // Get all purchases for this supplier
    const PurchaseModel = await import("../models/Purchase.js");
    const Purchase = PurchaseModel.default;
    const purchases = await Purchase.find({ 
      supplierId: supplier._id,
      paymentStatus: { $ne: "Paid" } // Only unpaid or partial purchases
    }).sort({ date: 1 }); // Oldest first

    // Calculate how much to allocate to each purchase
    let remainingPayment = amount;
    const updatedPurchases = [];

    for (const purchase of purchases) {
      if (remainingPayment <= 0) break;

      // Calculate how much is owed for this purchase
      const purchaseOwed = purchase.total;
      
      if (remainingPayment >= purchaseOwed) {
        // Full payment for this purchase
        purchase.paymentStatus = "Paid";
        remainingPayment -= purchaseOwed;
        updatedPurchases.push(purchase.po);
      } else {
        // Partial payment
        purchase.paymentStatus = "Partial";
        remainingPayment = 0;
      }
      
      await purchase.save();
    }

    console.log(`Updated ${updatedPurchases.length} purchase orders to "Paid" status`);

    // Format date properly
    const paymentDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Create finance transaction
    const transaction = await FinanceTransaction.create({
      type: "Expense",
      category: "Supplier Payment",
      amount: amount,
      description: `Payment to ${supplier.name}${note ? ` - ${note}` : ""}`,
      date: paymentDate,
      method: method || "Cash",
      paymentMethod: method || "Cash",
      reference: `Supplier: ${supplier.name}`,
      supplierId: supplier._id,
      notes: note || "",
      addedBy: userName || "System",
    });

    // Create audit log (optional - only if userId provided)
    if (userId) {
      try {
        await AuditLog.create({
          userId,
          userName: userName || "Unknown",
          userRole: userRole || "Staff",
          action: "create",
          category: "finance",
          severity: "info",
          module: "Supplier Payment",
          description: `Recorded payment to supplier: ${supplier.name}`,
          details: `Amount: PKR ${amount}, Method: ${method}, Previous Balance: PKR ${previousBalance}, New Balance: PKR ${supplier.balanceDue}${updatedPurchases.length > 0 ? `, Updated POs: ${updatedPurchases.join(", ")}` : ""}`,
          ipAddress: req.ip,
        });
      } catch (auditError) {
        console.error("Error creating audit log:", auditError);
        // Don't fail the payment if audit log fails
      }
    }

    res.json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        supplier,
        transaction,
        updatedPurchases: updatedPurchases.length,
      },
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ 
      success: false,
      message: "Error recording payment",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get supplier ledger with all transactions
export const getSupplierLedger = async (req: Request, res: Response) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Get all finance transactions for this supplier
    const payments = await FinanceTransaction.find({ 
      supplierId: supplierId,
      type: "Expense",
      category: "Supplier Payment"
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: {
        supplier,
        payments,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
