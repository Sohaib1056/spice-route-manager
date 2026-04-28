import mongoose, { Document, Schema } from "mongoose";

export interface IFinanceTransaction extends Document {
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense" | "Transfer";
  amount: number;
  reference: string;
  method: string;
  paymentMethod?: string; // Added for compatibility
  notes?: string;
  addedBy: string;
  supplierId?: mongoose.Types.ObjectId; // Added for supplier payments
  createdAt: Date;
  updatedAt: Date;
}

const financeTransactionSchema = new Schema<IFinanceTransaction>(
  {
    date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    type: {
      type: String,
      enum: ["Income", "Expense", "Transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reference: {
      type: String,
      default: function() {
        return `TXN-${Date.now()}`;
      },
    },
    method: {
      type: String,
      default: "Cash",
    },
    paymentMethod: {
      type: String,
      default: "Cash",
    },
    notes: {
      type: String,
      default: "",
    },
    addedBy: {
      type: String,
      default: "System",
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
financeTransactionSchema.index({ date: -1 });
financeTransactionSchema.index({ type: 1 });
financeTransactionSchema.index({ category: 1 });
financeTransactionSchema.index({ supplierId: 1 });

const FinanceTransaction = mongoose.model<IFinanceTransaction>(
  "FinanceTransaction",
  financeTransactionSchema
);

export default FinanceTransaction;
