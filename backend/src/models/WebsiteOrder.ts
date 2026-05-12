import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  nameUrdu?: string;
  emoji?: string;
  selectedWeight: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ICustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface IShippingAddress {
  address: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode?: string;
}

export interface IWebsiteOrder extends Document {
  orderNumber: string;
  orderDate: Date;
  
  // Customer Information
  customer: ICustomerInfo;
  
  // Shipping Address
  shippingAddress: IShippingAddress;
  
  // Order Items
  items: IOrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCharges: number;
  total: number;
  
  // Payment & Delivery
  paymentMethod: "cod" | "online";
  paymentStatus: "Pending" | "Paid" | "Failed";
  
  // Order Status
  orderStatus: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  
  // Additional Info
  deliveryNotes?: string;
  trackingNumber?: string;
  
  // Timestamps
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

const WebsiteOrderSchema: Schema = new Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, // This creates an index automatically
    default: () => `WEB-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  orderDate: { type: Date, default: Date.now },
  
  // Customer Information
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }
  },
  
  // Shipping Address
  shippingAddress: {
    address: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String }
  },
  
  // Order Items
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    nameUrdu: { type: String },
    emoji: { type: String },
    selectedWeight: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  
  // Pricing
  subtotal: { type: Number, required: true },
  shippingCharges: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Payment & Delivery
  paymentMethod: { 
    type: String, 
    enum: ["cod", "online"], 
    default: "cod" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Paid", "Failed"], 
    default: "Pending" 
  },
  
  // Order Status
  orderStatus: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"], 
    default: "Pending" 
  },
  
  // Additional Info
  deliveryNotes: { type: String },
  trackingNumber: { type: String },
  
  // Timestamps
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date }
  
}, { timestamps: true });

// Indexes for better query performance
// Note: orderNumber already has unique index from schema definition
WebsiteOrderSchema.index({ orderDate: -1 });
WebsiteOrderSchema.index({ orderStatus: 1 });
WebsiteOrderSchema.index({ "customer.phone": 1 });

export default mongoose.model<IWebsiteOrder>("WebsiteOrder", WebsiteOrderSchema);
