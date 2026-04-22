import { Request, Response } from "express";
import Sale from "../models/Sale";
import Product from "../models/Product";

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
    
    // Update stock levels
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }
    
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: "Error creating sale" });
  }
};
