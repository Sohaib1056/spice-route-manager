import AuditLog, { AuditAction, AuditCategory, AuditSeverity, IChange } from "../models/AuditLog";
import mongoose from "mongoose";

interface AuditLogData {
  userId: mongoose.Types.ObjectId | string;
  userName: string;
  userRole: "Admin" | "Manager" | "Staff";
  action: AuditAction;
  category: AuditCategory;
  severity?: AuditSeverity;
  module: string;
  description: string;
  details?: string;
  ipAddress?: string;
  changes?: IChange[];
}

export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    await AuditLog.create({
      ...data,
      severity: data.severity || "info",
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error("Error creating audit log:", error);
  }
};

export const logUserAction = async (
  userId: mongoose.Types.ObjectId | string,
  userName: string,
  userRole: "Admin" | "Manager" | "Staff",
  action: AuditAction,
  module: string,
  description: string,
  ipAddress?: string,
  details?: string,
  changes?: IChange[]
): Promise<void> => {
  const category: AuditCategory = 
    module === "Users" || module === "Permissions" ? "user" :
    module === "Inventory" || module === "Stock" ? "product" :
    module === "Sales" || module === "Purchase" ? "transaction" :
    module === "Authentication" ? "security" : "system";

  const severity: AuditSeverity =
    action === "delete" ? "error" :
    action === "permission_change" || action === "settings_change" ? "warning" :
    action === "create" || action === "sale" || action === "purchase" ? "success" : "info";

  await createAuditLog({
    userId,
    userName,
    userRole,
    action,
    category,
    severity,
    module,
    description,
    details,
    ipAddress,
    changes,
  });
};
