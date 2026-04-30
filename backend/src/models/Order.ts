import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    productId: string;
    name: string;
    weight: string;
    price: number;
    quantity: number;
    emoji?: string;
  }>;
  totalPrice: number;
  shipping: number;
  grandTotal: number;
  paymentMethod: 'cod' | 'online';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
}

const OrderSchema: Schema = new Schema({
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
  },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    emoji: { type: String },
  }],
  totalPrice: { type: Number, required: true },
  shipping: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IOrder>("Order", OrderSchema);
