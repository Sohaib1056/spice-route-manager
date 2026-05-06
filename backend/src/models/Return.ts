import mongoose, { Schema, Document } from "mongoose";

export interface IReturn extends Document {
  returnId: string;
  type: "website" | "pos";
  orderId?: mongoose.Types.ObjectId;
  saleId?: mongoose.Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  cashierName?: string;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    weight: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  reason: "Damaged Product" | "Wrong Item" | "Quality Issue" | "Customer Changed Mind" | "Other";
  condition: "Unopened" | "Opened" | "Good Condition" | "Damaged";
  notes?: string;
  refundMethod: "Cash" | "JazzCash" | "Bank Transfer" | "Store Credit";
  refundAmount: number;
  status: "Pending" | "Approved" | "Rejected" | "Refunded";
  rejectionReason?: string;
  processedBy?: string;
  processedAt?: Date;
  refundedAt?: Date;
  transactionReference?: string;
}

const ReturnSchema: Schema = new Schema(
  {
    returnId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["website", "pos"], required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "WebsiteOrder", index: true },
    saleId: { type: Schema.Types.ObjectId, ref: "Sale", index: true },
    customer: {
      name: { type: String, default: "Walk-in Customer", index: true },
      phone: { type: String, index: true },
      email: { type: String },
    },
    cashierName: { type: String },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        weight: { type: String, required: false, default: "N/A" },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    reason: {
      type: String,
      enum: ["Damaged Product", "Wrong Item", "Quality Issue", "Customer Changed Mind", "Other"],
      required: true,
    },
    condition: {
      type: String,
      enum: ["Unopened", "Opened", "Good Condition", "Damaged"],
      required: true,
    },
    notes: { type: String },
    refundMethod: {
      type: String,
      enum: ["Cash", "JazzCash", "Bank Transfer", "Store Credit"],
      required: true,
    },
    refundAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Refunded"],
      default: "Pending",
      index: true,
    },
    rejectionReason: { type: String },
    processedBy: { type: String },
    processedAt: { type: Date },
    refundedAt: { type: Date },
    transactionReference: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IReturn>("Return", ReturnSchema);
