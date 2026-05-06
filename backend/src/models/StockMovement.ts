import mongoose, { Schema, Document } from "mongoose";

export interface IStockMovement extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  type: "In" | "Out" | "Adjustment" | "Return" | "Damaged";
  qty: number;
  prevStock: number;
  newStock: number;
  reason: string;
  doneBy: string;
  date: Date;
}

const StockMovementSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  productName: { type: String, required: true, index: true },
  type: { type: String, enum: ["In", "Out", "Adjustment", "Return", "Damaged"], required: true, index: true },
  qty: { type: Number, required: true },
  prevStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, required: true },
  doneBy: { type: String, default: "System Admin", index: true },
  date: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export default mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
