import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import AuditLog from "../models/AuditLog";

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/spice-route");
    console.log("MongoDB Connected");

    // Clear existing data
    await User.deleteMany({});
    await AuditLog.deleteMany({});
    console.log("Cleared existing users and audit logs");

    // Create Admin User
    const admin = await User.create({
      name: "Admin User",
      email: "admin@spiceroute.com",
      password: "admin123",
      role: "Admin",
      status: "Active",
    });
    console.log("✓ Admin user created");

    // Create Manager User
    const manager = await User.create({
      name: "Ahmed Khan",
      email: "ahmed@spiceroute.com",
      password: "manager123",
      role: "Manager",
      status: "Active",
      permissions: {
        dashboard: true,
        inventory: true,
        stock: true,
        purchase: true,
        sales: true,
        supplier: true,
        finance: true,
        reports: true,
        users: false,
        settings: false,
      },
    });
    console.log("✓ Manager user created");

    // Create Staff User 1
    const staff1 = await User.create({
      name: "Fatima Ali",
      email: "fatima@spiceroute.com",
      password: "staff123",
      role: "Staff",
      status: "Active",
      permissions: {
        dashboard: true,
        inventory: true,
        stock: false,
        purchase: false,
        sales: true,
        supplier: false,
        finance: false,
        reports: false,
        users: false,
        settings: false,
      },
    });
    console.log("✓ Staff user 1 created");

    // Create Staff User 2
    const staff2 = await User.create({
      name: "Hassan Raza",
      email: "hassan@spiceroute.com",
      password: "staff123",
      role: "Staff",
      status: "Active",
      permissions: {
        dashboard: true,
        inventory: true,
        stock: true,
        purchase: true,
        sales: true,
        supplier: true,
        finance: false,
        reports: false,
        users: false,
        settings: false,
      },
    });
    console.log("✓ Staff user 2 created");

    // Create some sample audit logs
    const sampleLogs = [
      {
        userId: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: "login" as const,
        category: "security" as const,
        severity: "info" as const,
        module: "Authentication",
        description: "Admin user logged in",
        details: "Login from Chrome browser",
        ipAddress: "192.168.1.100",
      },
      {
        userId: manager._id,
        userName: manager.name,
        userRole: manager.role,
        action: "create" as const,
        category: "product" as const,
        severity: "success" as const,
        module: "Inventory",
        description: "Added new product 'Almonds Premium'",
        details: "SKU: ALM-001, Price: PKR 2500/kg",
        ipAddress: "192.168.1.102",
      },
      {
        userId: staff1._id,
        userName: staff1.name,
        userRole: staff1.role,
        action: "sale" as const,
        category: "transaction" as const,
        severity: "success" as const,
        module: "Sales",
        description: "Processed sale transaction",
        details: "Invoice #INV-1234, Amount: PKR 15,000",
        ipAddress: "192.168.1.105",
      },
      {
        userId: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: "permission_change" as const,
        category: "security" as const,
        severity: "warning" as const,
        module: "Permissions",
        description: `Updated permissions for ${staff1.name}`,
        details: "Granted access to Finance module",
        ipAddress: "192.168.1.100",
        changes: [
          {
            field: "Finance Access",
            oldValue: "Disabled",
            newValue: "Enabled",
          },
        ],
      },
      {
        userId: manager._id,
        userName: manager.name,
        userRole: manager.role,
        action: "update" as const,
        category: "product" as const,
        severity: "info" as const,
        module: "Inventory",
        description: "Updated product pricing",
        details: "Product: Cashews, SKU: CSH-002",
        ipAddress: "192.168.1.102",
        changes: [
          {
            field: "Sell Price",
            oldValue: "PKR 1800",
            newValue: "PKR 1950",
          },
          {
            field: "Buy Price",
            oldValue: "PKR 1500",
            newValue: "PKR 1600",
          },
        ],
      },
    ];

    await AuditLog.insertMany(sampleLogs);
    console.log("✓ Sample audit logs created");

    console.log("\n=================================");
    console.log("Seed completed successfully!");
    console.log("=================================");
    console.log("\nLogin Credentials:");
    console.log("------------------");
    console.log("Admin:");
    console.log("  Email: admin@spiceroute.com");
    console.log("  Password: admin123");
    console.log("\nManager:");
    console.log("  Email: ahmed@spiceroute.com");
    console.log("  Password: manager123");
    console.log("\nStaff:");
    console.log("  Email: fatima@spiceroute.com");
    console.log("  Password: staff123");
    console.log("\n  Email: hassan@spiceroute.com");
    console.log("  Password: staff123");
    console.log("=================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedUsers();
