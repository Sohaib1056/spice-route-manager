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
    const productData = { ...req.body };
    
    console.log("[CreateProduct] Payload received:", productData);
    
    // Explicitly handle weight-based maps if they arrive as strings
    if (typeof productData.pricePerWeight === 'string') {
      try {
        productData.pricePerWeight = JSON.parse(productData.pricePerWeight);
      } catch (e) {
        console.warn("[CreateProduct] pricePerWeight parse failed, keeping as is");
      }
    }
    
    if (typeof productData.originalPrice === 'string') {
      try {
        productData.originalPrice = JSON.parse(productData.originalPrice);
      } catch (e) {
        console.warn("[CreateProduct] originalPrice parse failed, keeping as is");
      }
    }

    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    
    // Ensure numeric fields are actually numbers
    productData.buyPrice = Number(productData.buyPrice) || 0;
    productData.sellPrice = Number(productData.sellPrice) || 0;
    productData.stock = Number(productData.stock) || 0;
    productData.minStock = Number(productData.minStock) || 0;
    productData.discountPercentage = Number(productData.discountPercentage) || 0;

    // Initialize maps if they are missing to satisfy schema even if not required
    if (!productData.pricePerWeight) productData.pricePerWeight = {};
    if (!productData.originalPrice) productData.originalPrice = {};
    if (!productData.weightOptions) productData.weightOptions = [];

    const product = new Product(productData);
    await product.save();

    // Create audit log (Non-blocking)
    try {
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
    } catch (auditErr) {
      console.warn("[CreateProduct] Audit log failed:", auditErr);
    }

    res.status(201).json(product);
  } catch (error: any) {
    console.error("[CreateProduct] ERROR DETAILS:", error);
    res.status(500).json({ 
      message: "Internal Server Error during product creation", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productData = { ...req.body };
    
    console.log("[UpdateProduct] Payload received:", productData);

    // Explicitly handle weight-based maps if they arrive as strings
    if (typeof productData.pricePerWeight === 'string') {
      try {
        productData.pricePerWeight = JSON.parse(productData.pricePerWeight);
      } catch (e) {
        console.warn("[UpdateProduct] pricePerWeight parse failed, keeping as is");
      }
    }
    
    if (typeof productData.originalPrice === 'string') {
      try {
        productData.originalPrice = JSON.parse(productData.originalPrice);
      } catch (e) {
        console.warn("[UpdateProduct] originalPrice parse failed, keeping as is");
      }
    }

    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    // Ensure numeric fields are actually numbers
    if (productData.buyPrice !== undefined) productData.buyPrice = Number(productData.buyPrice);
    if (productData.sellPrice !== undefined) productData.sellPrice = Number(productData.sellPrice);
    if (productData.stock !== undefined) productData.stock = Number(productData.stock);
    if (productData.minStock !== undefined) productData.minStock = Number(productData.minStock);
    if (productData.discountPercentage !== undefined) productData.discountPercentage = Number(productData.discountPercentage);

    // Initialize maps if they are missing
    if (!productData.pricePerWeight) productData.pricePerWeight = {};
    if (!productData.originalPrice) productData.originalPrice = {};
    if (!productData.weightOptions) productData.weightOptions = [];

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Create audit log (Non-blocking)
    try {
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
    } catch (auditErr) {
      console.warn("[UpdateProduct] Audit log failed:", auditErr);
    }

    res.json(product);
  } catch (error: any) {
    console.error("[UpdateProduct] ERROR DETAILS:", error);
    res.status(500).json({ 
      message: "Internal Server Error during product update", 
      error: error.message 
    });
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
