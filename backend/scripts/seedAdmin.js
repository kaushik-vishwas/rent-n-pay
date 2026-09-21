/**
 * Admin Seed Script
 * Run: node scripts/seedAdmin.js
 * 
 * Ek baar chalao — superadmin create ho jayega
 * Already exist karta hai to skip kar dega
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Check if superadmin already exists
    const existingAdmin = await Admin.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Env se lo ya defaults use karo
    const adminData = {
      name: "Admin",
      email:  "admin@gmail.com",
      password:  "123456",
      role: "admin",
    };

    const admin = await Admin.create(adminData);

    console.log("🎉 Admin created successfully!");
    console.log("   Name  :", admin.name);
    console.log("   Email :", admin.email);
    console.log("   Role  :", admin.role);
    console.log("   _id   :", admin._id);
    console.log("\n⚠️  Please change the password after first login.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin(); 