import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  unit: "kg" | "g" | "pack";
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  active: boolean;
  description?: string;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unit: { type: String, enum: ["kg", "g", "pack"], default: "kg" },
  buyPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 10 },
  active: { type: Boolean, default: true },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model<IProduct>("Product", ProductSchema);
