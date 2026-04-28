import { Request, Response } from "express";
import Product from "../models/Product";
import AuditLog from "../models/AuditLog";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Create audit log
    if (req.body.currentUserId) {
      await AuditLog.create({
        userId: req.body.currentUserId,
        userName: req.body.currentUserName || "System",
        userRole: req.body.currentUserRole || "Staff",
        action: "create",
        category: "product",
        severity: "success",
        module: "Inventory",
        description: `Product created: ${product.name}`,
        details: `SKU: ${product.sku}, Category: ${product.category}`,
        ipAddress: req.ip,
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Error creating product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Create audit log
    if (req.body.currentUserId) {
      await AuditLog.create({
        userId: req.body.currentUserId,
        userName: req.body.currentUserName || "System",
        userRole: req.body.currentUserRole || "Staff",
        action: "update",
        category: "product",
        severity: "info",
        module: "Inventory",
        description: `Product updated: ${product.name}`,
        details: `Updated fields for SKU: ${product.sku}`,
        ipAddress: req.ip,
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Create audit log
    if (req.body.currentUserId) {
      await AuditLog.create({
        userId: req.body.currentUserId,
        userName: req.body.currentUserName || "System",
        userRole: req.body.currentUserRole || "Staff",
        action: "delete",
        category: "product",
        severity: "warning",
        module: "Inventory",
        description: `Product deleted: ${product.name}`,
        details: `SKU: ${product.sku}`,
        ipAddress: req.ip,
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
