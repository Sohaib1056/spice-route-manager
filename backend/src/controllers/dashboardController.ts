import { Request, Response } from "express";
import Product from "../models/Product";
import Sale from "../models/Sale";
import Purchase from "../models/Purchase";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [products, sales, purchases] = await Promise.all([
      Product.find(),
      Sale.find(),
      Purchase.find()
    ]);

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    const lowStockItems = products.filter(p => p.stock < p.minStock).length;
    const totalCustomers = new Set(sales.map(s => s.customer)).size;

    // Last 7 days chart data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const chartData = last7Days.map(date => {
      const dailySales = sales.filter(s => s.date.toISOString().slice(0, 10) === date);
      return {
        date,
        revenue: dailySales.reduce((sum, s) => sum + s.total, 0)
      };
    });

    const recentSales = sales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

    res.json({
      stats: {
        revenue: totalRevenue,
        orders: totalOrders,
        lowStock: lowStockItems,
        customers: totalCustomers
      },
      chartData,
      recentSales
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
