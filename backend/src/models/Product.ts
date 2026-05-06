import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  nameUrdu?: string;
  sku: string;
  category: string;
  emoji?: string;
  buyPrice: number;
  sellPrice: number;
  pricePerWeight: Record<string, number>;
  originalPrice: Record<string, number>;
  weightOptions: string[];
  stock: number;
  minStock: number;
  active: boolean;
  description?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  origin?: string;
  storageInfo?: string;
  shelfLife?: string;
  image?: string;
  discountPercentage?: number;
  unit?: string;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: true },
  nameUrdu: { type: String },
  sku: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  emoji: { type: String, default: "🥜" },
  buyPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  pricePerWeight: { type: Map, of: Number, default: {} },
  originalPrice: { type: Map, of: Number, default: {} },
  weightOptions: [{ type: String }],
  stock: { type: Number, default: 0, index: true },
  minStock: { type: Number, default: 10 },
  active: { type: Boolean, default: true, index: true },
  description: { type: String },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  badge: { type: String },
  origin: { type: String },
  storageInfo: { type: String },
  shelfLife: { type: String },
  image: { type: String },
  discountPercentage: { type: Number, default: 0 },
  unit: { type: String, default: "kg" },
}, { timestamps: true });

export default mongoose.model<IProduct>("Product", ProductSchema);
