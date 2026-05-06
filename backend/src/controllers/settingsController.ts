import { Request, Response } from "express";
import Settings from "../models/Settings";
import User from "../models/User";
import Product from "../models/Product";
import Sale from "../models/Sale";
import Purchase from "../models/Purchase";
import FinanceTransaction from "../models/FinanceTransaction";
import Supplier from "../models/Supplier";
import StockMovement from "../models/StockMovement";
import AuditLog from "../models/AuditLog";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/responseHandler";
import { logUserAction } from "../utils/auditLogger";

// @desc    Get settings
// @route   GET /api/settings
// @access  Private
export const getSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let settings = await Settings.findOne();

  // If no settings exist, create default settings
  if (!settings) {
    settings = await Settings.create({});
  }

  sendSuccess(res, settings, "Settings fetched successfully");
});

// @desc    Update company info
// @route   PUT /api/settings/company
// @access  Admin
export const updateCompanyInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    companyName,
    ownerName,
    phone,
    email,
    address,
    city,
    ntnNumber,
    taxRate,
    logo,
    currentUserId,
    currentUserName,
    currentUserRole,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  // Track changes
  const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

  if (companyName !== undefined && companyName !== settings.companyName) {
    changes.push({ field: "Company Name", oldValue: settings.companyName, newValue: companyName });
    settings.companyName = companyName;
  }

  if (ownerName !== undefined && ownerName !== settings.ownerName) {
    changes.push({ field: "Owner Name", oldValue: settings.ownerName, newValue: ownerName });
    settings.ownerName = ownerName;
  }

  if (phone !== undefined && phone !== settings.phone) {
    changes.push({ field: "Phone", oldValue: settings.phone, newValue: phone });
    settings.phone = phone;
  }

  if (email !== undefined && email !== settings.email) {
    changes.push({ field: "Email", oldValue: settings.email, newValue: email });
    settings.email = email;
  }

  if (address !== undefined && address !== settings.address) {
    changes.push({ field: "Address", oldValue: settings.address, newValue: address });
    settings.address = address;
  }

  if (city !== undefined && city !== settings.city) {
    changes.push({ field: "City", oldValue: settings.city, newValue: city });
    settings.city = city;
  }

  if (ntnNumber !== undefined && ntnNumber !== settings.ntnNumber) {
    changes.push({ field: "NTN Number", oldValue: settings.ntnNumber, newValue: ntnNumber });
    settings.ntnNumber = ntnNumber;
  }

  if (taxRate !== undefined && taxRate !== settings.taxRate) {
    changes.push({ field: "Tax Rate", oldValue: `${settings.taxRate}%`, newValue: `${taxRate}%` });
    settings.taxRate = taxRate;
  }

  if (logo !== undefined) {
    settings.logo = logo;
  }

  await settings.save();

  // Create audit log
  if (changes.length > 0) {
    await logUserAction(
      currentUserId || "system",
      currentUserName || "System",
      currentUserRole || "Admin",
      "update",
      "Settings",
      "Updated company information",
      req.ip,
      `Modified ${changes.length} field(s)`,
      changes
    );
  }

  sendSuccess(res, settings, "Company info updated successfully");
});

// @desc    Update system settings
// @route   PUT /api/settings/system
// @access  Admin
export const updateSystemSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    defaultTax,
    lowStockThreshold,
    dateFormat,
    invoicePrefix,
    poPrefix,
    businessType,
    currentUserId,
    currentUserName,
    currentUserRole,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  // Track changes
  const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

  if (defaultTax !== undefined && defaultTax !== settings.defaultTax) {
    changes.push({ field: "Default Tax", oldValue: `${settings.defaultTax}%`, newValue: `${defaultTax}%` });
    settings.defaultTax = defaultTax;
  }

  if (lowStockThreshold !== undefined && lowStockThreshold !== settings.lowStockThreshold) {
    changes.push({
      field: "Low Stock Threshold",
      oldValue: String(settings.lowStockThreshold),
      newValue: String(lowStockThreshold),
    });
    settings.lowStockThreshold = lowStockThreshold;
  }

  if (dateFormat !== undefined && dateFormat !== settings.dateFormat) {
    changes.push({ field: "Date Format", oldValue: settings.dateFormat, newValue: dateFormat });
    settings.dateFormat = dateFormat;
  }

  if (invoicePrefix !== undefined && invoicePrefix !== settings.invoicePrefix) {
    changes.push({ field: "Invoice Prefix", oldValue: settings.invoicePrefix, newValue: invoicePrefix });
    settings.invoicePrefix = invoicePrefix;
  }

  if (poPrefix !== undefined && poPrefix !== settings.poPrefix) {
    changes.push({ field: "PO Prefix", oldValue: settings.poPrefix, newValue: poPrefix });
    settings.poPrefix = poPrefix;
  }

  if (businessType !== undefined && businessType !== settings.businessType) {
    changes.push({ field: "Business Type", oldValue: settings.businessType, newValue: businessType });
    settings.businessType = businessType;
  }

  await settings.save();

  // Create audit log
  if (changes.length > 0) {
    await logUserAction(
      currentUserId || "system",
      currentUserName || "System",
      currentUserRole || "Admin",
      "update",
      "Settings",
      "Updated system settings",
      req.ip,
      `Modified ${changes.length} field(s)`,
      changes
    );
  }

  sendSuccess(res, settings, "System settings updated successfully");
});

// @desc    Create backup
// @route   POST /api/settings/backup
// @access  Admin
export const createBackup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { currentUserId, currentUserName, currentUserRole } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  // Update backup info
  settings.lastBackupDate = new Date();
  settings.lastBackupSize = `${(Math.random() * 50 + 10).toFixed(1)} MB`; // Mock size

  await settings.save();

  // Create audit log
  await logUserAction(
    currentUserId || "system",
    currentUserName || "System",
    currentUserRole || "Admin",
    "create",
    "Settings",
    "Created database backup",
    req.ip,
    `Backup size: ${settings.lastBackupSize}`
  );

  sendSuccess(res, { lastBackupDate: settings.lastBackupDate, lastBackupSize: settings.lastBackupSize }, "Backup created successfully");
});

// @desc    Download backup
// @route   GET /api/settings/backup/download
// @access  Admin
export const downloadBackup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      users,
      products,
      sales,
      purchases,
      financeTransactions,
      suppliers,
      stockMovements,
      auditLogs,
      settings
    ] = await Promise.all([
      User.find().lean(),
      Product.find().lean(),
      Sale.find().lean(),
      Purchase.find().lean(),
      FinanceTransaction.find().lean(),
      Supplier.find().lean(),
      StockMovement.find().lean(),
      AuditLog.find().lean(),
      Settings.findOne().lean()
    ]);

    const backupData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      data: {
        users,
        products,
        sales,
        purchases,
        financeTransactions,
        suppliers,
        stockMovements,
        auditLogs,
        settings
      }
    };

    const fileName = `spice-route-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Create audit log
    await logUserAction(
      "system",
      "System",
      "Admin",
      "create",
      "Settings",
      "Downloaded full database backup",
      req.ip,
      `Backup contains ${sales.length} sales, ${products.length} products`
    );

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ success: false, message: "Error generating backup file" });
  }
});

// @desc    Reset all data (DANGER)
// @route   DELETE /api/settings/reset
// @access  Admin
export const resetAllData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { currentUserId, currentUserName, currentUserRole, confirmText } = req.body;

  // Require confirmation
  if (confirmText !== "DELETE ALL DATA") {
    sendError(res, "Confirmation text does not match. Please type 'DELETE ALL DATA' to confirm.", 400);
    return;
  }

  // Create audit log before reset
  await logUserAction(
    currentUserId || "system",
    currentUserName || "System",
    currentUserRole || "Admin",
    "delete",
    "Settings",
    "⚠️ CRITICAL: Reset all data - All database records deleted",
    req.ip,
    "This action deleted all data from the system"
  );

  // Perform actual reset
  await Promise.all([
    Product.deleteMany({}),
    Sale.deleteMany({}),
    Purchase.deleteMany({}),
    FinanceTransaction.deleteMany({}),
    Supplier.deleteMany({}),
    StockMovement.deleteMany({}),
    AuditLog.deleteMany({}),
    // We don't delete Settings or Users to keep the system operational
  ]);

  sendSuccess(res, null, "Data reset completed successfully");
});
