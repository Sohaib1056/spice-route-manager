import mongoose, { Document, Schema } from "mongoose";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "permission_change"
  | "settings_change"
  | "purchase"
  | "sale"
  | "stock_adjustment";

export type AuditCategory = "user" | "product" | "transaction" | "system" | "security";

export type AuditSeverity = "info" | "warning" | "success" | "error";

export interface IChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: "Admin" | "Manager" | "Staff";
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  module: string;
  description: string;
  details?: string;
  ipAddress?: string;
  changes?: IChange[];
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ["Admin", "Manager", "Staff"],
      required: true,
    },
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "permission_change",
        "settings_change",
        "purchase",
        "sale",
        "stock_adjustment",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["user", "product", "transaction", "system", "security"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    module: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    changes: [
      {
        field: { type: String, required: true },
        oldValue: { type: String, required: true },
        newValue: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
