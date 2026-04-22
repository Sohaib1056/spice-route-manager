import mongoose, { Schema, Document } from "mongoose";

interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export interface IPurchase extends Document {
  po: string;
  date: Date;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  items: IPurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Received" | "Cancelled";
  paymentStatus: "Pending" | "Partial" | "Paid";
  receivedDate?: Date;
  supplierBill?: {
    name: string;
    url: string;
    size: number;
  };
}

const PurchaseSchema: Schema = new Schema({
  po: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
  supplierName: { type: String, required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Sent", "Received", "Cancelled"], default: "Draft" },
  paymentStatus: { type: String, enum: ["Pending", "Partial", "Paid"], default: "Pending" },
  receivedDate: { type: Date },
  supplierBill: {
    name: { type: String },
    url: { type: String },
    size: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model<IPurchase>("Purchase", PurchaseSchema);
