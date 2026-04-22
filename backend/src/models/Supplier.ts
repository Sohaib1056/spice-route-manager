import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  ntn: string;
  openingBalance: number;
  totalPurchases: number;
  balanceDue: number;
  status: "Paid" | "Due" | "Partial";
}

const SupplierSchema: Schema = new Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  ntn: { type: String, default: "" },
  openingBalance: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  status: { type: String, enum: ["Paid", "Due", "Partial"], default: "Paid" },
}, { timestamps: true });

export default mongoose.model<ISupplier>("Supplier", SupplierSchema);
