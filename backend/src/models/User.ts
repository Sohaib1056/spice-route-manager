import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import config from "../config/env";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Staff";
  status: "Active" | "Inactive";
  permissions: {
    dashboard: boolean;
    inventory: boolean;
    stock: boolean;
    purchase: boolean;
    sales: boolean;
    supplier: boolean;
    finance: boolean;
    reports: boolean;
    users: boolean;
    settings: boolean;
  };
  lastLogin?: Date;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Staff"],
      default: "Staff",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    permissions: {
      dashboard: { type: Boolean, default: true },
      inventory: { type: Boolean, default: false },
      stock: { type: Boolean, default: false },
      purchase: { type: Boolean, default: false },
      sales: { type: Boolean, default: false },
      supplier: { type: Boolean, default: false },
      finance: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      users: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
    },
    lastLogin: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Admin users get all permissions by default
userSchema.pre("save", function () {
  if (this.role === "Admin") {
    this.permissions = {
      dashboard: true,
      inventory: true,
      stock: true,
      purchase: true,
      sales: true,
      supplier: true,
      finance: true,
      reports: true,
      users: true,
      settings: true,
    };
  }
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
