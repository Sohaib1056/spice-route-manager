import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  // Company Info
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  ntnNumber: string;
  taxRate: number;
  logo?: string;

  // System Settings
  currency: string;
  defaultTax: number;
  lowStockThreshold: number;
  dateFormat: string;
  invoicePrefix: string;
  poPrefix: string;
  businessType: "Retail" | "Wholesale" | "Both";

  // Backup Info
  lastBackupDate?: Date;
  lastBackupSize?: string;

  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    // Company Info
    companyName: {
      type: String,
      default: "Spice Route Manager",
    },
    ownerName: {
      type: String,
      default: "Admin",
    },
    phone: {
      type: String,
      default: "+92 300 0000000",
    },
    email: {
      type: String,
      default: "info@spiceroute.com",
    },
    address: {
      type: String,
      default: "Lahore, Pakistan",
    },
    city: {
      type: String,
      default: "Lahore",
    },
    ntnNumber: {
      type: String,
      default: "",
    },
    taxRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    logo: {
      type: String,
    },

    // System Settings
    currency: {
      type: String,
      default: "PKR",
    },
    defaultTax: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    dateFormat: {
      type: String,
      enum: ["DD MMM YYYY", "YYYY-MM-DD", "DD/MM/YYYY"],
      default: "DD MMM YYYY",
    },
    invoicePrefix: {
      type: String,
      default: "INV-",
    },
    poPrefix: {
      type: String,
      default: "PO-",
    },
    businessType: {
      type: String,
      enum: ["Retail", "Wholesale", "Both"],
      default: "Both",
    },

    // Backup Info
    lastBackupDate: {
      type: Date,
    },
    lastBackupSize: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;
