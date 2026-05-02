import { Request, Response } from "express";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const movements = await StockMovement.find().sort({ date: -1 });
    res.json(movements);
  } catch (error) {
    console.error("[StockController] Error fetching movements:", error);
    res.status(500).json({ message: "Server Error", error: error instanceof Error ? error.message : String(error) });
  }
};

export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { productId, newQty, reason, doneBy } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const prevStock = product.stock;
    const type = newQty > prevStock ? "In" : "Adjustment"; // Simple logic for adjustment type
    
    product.stock = newQty;
    await product.save();

    const movement = new StockMovement({
      productId,
      productName: product.name,
      type,
      qty: Math.abs(newQty - prevStock),
      prevStock,
      newStock: newQty,
      reason,
      doneBy: doneBy || "System Admin",
      date: new Date()
    });

    await movement.save();
    res.json({ product, movement });
  } catch (error) {
    res.status(400).json({ message: "Error adjusting stock" });
  }
};
