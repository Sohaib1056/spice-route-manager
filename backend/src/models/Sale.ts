import mongoose, { Schema, Document } from "mongoose";

interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export interface ISale extends Document {
  invoice: string;
  date: Date;
  customer: string;
  customerPhone?: string;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: "Cash" | "Credit" | "Bank Transfer";
  status: "Paid" | "Credit" | "Returned";
}

const SaleSchema: Schema = new Schema({
  invoice: { type: String, required: true, unique: true }, // unique creates index automatically
  date: { type: Date, default: Date.now, index: true },
  customer: { type: String, default: "Walk-in Customer", index: true },
  customerPhone: { type: String, index: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: "pcs" }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment: { type: String, enum: ["Cash", "Credit", "Bank Transfer"], default: "Cash", index: true },
  status: { type: String, enum: ["Paid", "Credit", "Returned"], default: "Paid", index: true },
}, { timestamps: true });

export default mongoose.model<ISale>("Sale", SaleSchema);
