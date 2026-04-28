import { Request, Response } from "express";
import Sale from "../models/Sale";
import Product from "../models/Product";
import StockMovement from "../models/StockMovement";

export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    
    // Update stock levels and create movements
    for (const item of sale.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const prevStock = product.stock;
        product.stock -= item.qty;
        await product.save();

        await StockMovement.create({
          productId: product._id,
          productName: product.name,
          type: "Out",
          qty: item.qty,
          prevStock,
          newStock: product.stock,
          reason: `Sale Invoice: ${sale.invoice}`,
          doneBy: "System",
          date: new Date()
        });
      }
    }
    
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: "Error creating sale" });
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
