import { Request, Response } from "express";
import Supplier from "../models/Supplier";
import FinanceTransaction from "../models/FinanceTransaction";
import AuditLog from "../models/AuditLog";
import Purchase from "../models/Purchase";

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
    const { openingBalance, ...otherData } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    // Handle opening balance change
    if (openingBalance !== undefined && openingBalance !== supplier.openingBalance) {
      const diff = openingBalance - supplier.openingBalance;
      supplier.balanceDue += diff;
      supplier.openingBalance = openingBalance;
    }

    // Apply other updates
    Object.assign(supplier, otherData);

    // Update status based on new balance
    const totalOwed = supplier.openingBalance + supplier.totalPurchases;
    if (supplier.balanceDue === 0) {
      supplier.status = "Paid";
    } else if (supplier.balanceDue > 0 && supplier.balanceDue < totalOwed) {
      supplier.status = "Partial";
    } else {
      supplier.status = "Due";
    }

    await supplier.save();
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
    // Get all purchases for this supplier that are not fully paid
    const purchases = await Purchase.find({ 
      supplierId: supplier._id,
      paymentStatus: { $ne: "Paid" }
    }).sort({ date: 1 }); // Oldest first

    let remainingPayment = amount;
    const updatedPurchases = [];

    for (const purchase of purchases) {
      if (remainingPayment <= 0) break;

      // Use a more robust way to calculate total paid for this specific PO
      const poPayments = await FinanceTransaction.find({
        supplierId: supplier._id,
        category: "Supplier Payment",
        $or: [
          { notes: { $regex: new RegExp(purchase.po, "i") } },
          { description: { $regex: new RegExp(purchase.po, "i") } }
        ]
      });
      
      const alreadyPaidForThisPO = poPayments.reduce((sum, p) => sum + p.amount, 0);
      const remainingDueForThisPO = Math.max(0, purchase.total - alreadyPaidForThisPO);

      if (remainingDueForThisPO <= 0) {
        purchase.paymentStatus = "Paid";
        await purchase.save();
        updatedPurchases.push(purchase.po);
        continue;
      }
      
      if (remainingPayment >= remainingDueForThisPO) {
        purchase.paymentStatus = "Paid";
        remainingPayment -= remainingDueForThisPO;
        updatedPurchases.push(purchase.po);
      } else if (remainingPayment > 0) {
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
      description: `Payment to ${supplier.name}${updatedPurchases.length > 0 ? ` (PO: ${updatedPurchases.join(", ")})` : ""}${note ? ` - ${note}` : ""}`,
      date: paymentDate,
      method: method || "Cash",
      paymentMethod: method || "Cash",
      reference: `Supplier: ${supplier.name}`,
      supplierId: supplier._id,
      notes: `${note ? `${note} ` : ""}${updatedPurchases.length > 0 ? `Applied to: ${updatedPurchases.join(", ")}` : ""}`,
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
