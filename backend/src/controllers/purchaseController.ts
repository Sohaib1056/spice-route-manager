import { Request, Response } from "express";
import Purchase from "../models/Purchase";
import Product from "../models/Product";

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  try {
    const purchase = new Purchase(req.body);
    await purchase.save();
    
    if (purchase.status === "Received") {
      for (const item of purchase.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty }
        });
      }
    }
    
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ message: "Error creating purchase order" });
  }
};

export const receivePurchase = async (req: Request, res: Response) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase order not found" });
    
    if (purchase.status !== "Received") {
      purchase.status = "Received";
      purchase.receivedDate = new Date();
      await purchase.save();
      
      for (const item of purchase.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty }
        });
      }
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ message: "Error receiving purchase" });
  }
};
