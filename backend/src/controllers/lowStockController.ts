import { Request, Response } from "express";
import Product from "../models/Product";

// @desc    Get low stock products
// @route   GET /api/low-stock
// @access  Private
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const { status, category, sortBy = "stock", order = "asc" } = req.query;

    // Build query
    let query: any = {};

    // Filter by stock status
    if (status === "out-of-stock") {
      query.stock = 0;
    } else if (status === "low-stock") {
      query.$expr = { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$minStock"] }] };
    } else {
      // Default: show both low stock and out of stock
      query.$or = [
        { stock: 0 },
        { $expr: { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$minStock"] }] } }
      ];
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Only show active products
    query.active = true;

    // Build sort object
    const sortObj: any = {};
    if (sortBy === "stock") {
      sortObj.stock = order === "asc" ? 1 : -1;
    } else if (sortBy === "name") {
      sortObj.name = order === "asc" ? 1 : -1;
    } else if (sortBy === "category") {
      sortObj.category = order === "asc" ? 1 : -1;
    }

    // Fetch products
    const products = await Product.find(query).sort(sortObj);

    // Calculate statistics
    const stats = {
      totalLowStock: products.length,
      outOfStock: products.filter(p => p.stock === 0).length,
      criticalLowStock: products.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
      totalValue: products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0),
    };

    res.json({
      success: true,
      data: {
        products,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching low stock products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get low stock statistics
// @route   GET /api/low-stock/stats
// @access  Private
export const getLowStockStats = async (req: Request, res: Response) => {
  try {
    // Get all active products
    const allProducts = await Product.find({ active: true });

    // Calculate statistics
    const stats = {
      totalProducts: allProducts.length,
      inStock: allProducts.filter(p => p.stock > p.minStock).length,
      lowStock: allProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
      outOfStock: allProducts.filter(p => p.stock === 0).length,
      criticalItems: allProducts.filter(p => p.stock > 0 && p.stock <= (p.minStock * 0.5)).length,
    };

    // Get category-wise breakdown
    const categories = [...new Set(allProducts.map(p => p.category))];
    const categoryBreakdown = categories.map(cat => {
      const catProducts = allProducts.filter(p => p.category === cat);
      return {
        category: cat,
        total: catProducts.length,
        lowStock: catProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
        outOfStock: catProducts.filter(p => p.stock === 0).length,
      };
    });

    res.json({
      success: true,
      data: {
        stats,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching low stock stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get products that need reorder
// @route   GET /api/low-stock/reorder-list
// @access  Private
export const getReorderList = async (req: Request, res: Response) => {
  try {
    // Get products that are low stock or out of stock
    const products = await Product.find({
      active: true,
      $or: [
        { stock: 0 },
        { $expr: { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$minStock"] }] } }
      ]
    }).sort({ stock: 1 });

    // Calculate suggested reorder quantity
    const reorderList = products.map(product => {
      const suggestedQty = Math.max(product.minStock * 2, 100); // At least 2x min stock or 100 units
      const estimatedCost = suggestedQty * product.buyPrice;
      
      return {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: product.stock,
        minStock: product.minStock,
        unit: product.unit,
        buyPrice: product.buyPrice,
        suggestedQty,
        estimatedCost,
        status: product.stock === 0 ? "Out of Stock" : "Low Stock",
        priority: product.stock === 0 ? "High" : product.stock <= (product.minStock * 0.5) ? "Medium" : "Low",
      };
    });

    // Calculate total estimated cost
    const totalEstimatedCost = reorderList.reduce((sum, item) => sum + item.estimatedCost, 0);

    res.json({
      success: true,
      data: {
        reorderList,
        summary: {
          totalItems: reorderList.length,
          highPriority: reorderList.filter(i => i.priority === "High").length,
          mediumPriority: reorderList.filter(i => i.priority === "Medium").length,
          lowPriority: reorderList.filter(i => i.priority === "Low").length,
          totalEstimatedCost,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reorder list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reorder list",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
