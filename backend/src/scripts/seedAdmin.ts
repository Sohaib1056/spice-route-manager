import mongoose from "mongoose";
import User from "../models/User";
import connectDB from "../config/db";

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("🌱 Starting admin user seed...");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin123@gmail.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Name:", existingAdmin.name);
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin123@gmail.com",
      password: "654321", // Will be hashed automatically by pre-save hook
      role: "Admin",
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
        users: true,
        settings: true,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin123@gmail.com");
    console.log("🔑 Password: 654321");
    console.log("👤 Name:     Admin User");
    console.log("🎭 Role:     Admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💡 Use these credentials to login to the system");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
