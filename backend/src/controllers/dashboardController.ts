import { Request, Response } from "express";
import Product from "../models/Product";
import Sale from "../models/Sale";
import Purchase from "../models/Purchase";
import FinanceTransaction from "../models/FinanceTransaction";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [products, sales, purchases, transactions] = await Promise.all([
      Product.find(),
      Sale.find(),
      Purchase.find(),
      FinanceTransaction.find()
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
      const dailySales = sales.filter(s => {
        const saleDate = s.date instanceof Date ? s.date.toISOString().slice(0, 10) : s.date.toString().slice(0, 10);
        return saleDate === date;
      });
      return {
        date,
        revenue: dailySales.reduce((sum, s) => sum + s.total, 0)
      };
    });

    // --- All time totals for global boxes ---
    const totalIncomeFromTxns = transactions.filter((t: any) => t.type === "Income").reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenseFromTxns = transactions.filter((t: any) => t.type === "Expense").reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Cash in Hand should be: All Sales Revenue + Any Other Income Transactions - All Expenses
    // We already have totalRevenue (from sales). totalIncomeFromTxns includes "Income" typed finance transactions.
    const cashInHand = totalRevenue + totalIncomeFromTxns - totalExpenseFromTxns;
    const netProfit = totalRevenue + totalIncomeFromTxns - totalExpenseFromTxns; // Net Profit follows the same logic for all-time


    // Today's Sales & Profit
    const today = new Date().toISOString().slice(0, 10);
    const todaySalesData = sales.filter(s => {
      const saleDate = s.date instanceof Date ? s.date.toISOString().slice(0, 10) : s.date.toString().slice(0, 10);
      return saleDate === today;
    });
    const todaySales = todaySalesData.reduce((sum, s) => sum + s.total, 0);

    let todayProfit = 0;
    todaySalesData.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p._id.toString() === item.productId.toString());
        if (product) {
          const cost = product.buyPrice * item.qty;
          const revenue = item.price * item.qty;
          const itemDiscount = sale.subtotal > 0 ? (sale.discount / sale.subtotal) * (item.price * item.qty) : 0;
          todayProfit += (revenue - cost - itemDiscount);
        }
      });
    });

    const totalStockValuePurchase = products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);
    const totalStockValueSell = products.reduce((sum, p) => sum + (p.stock * p.sellPrice), 0);

    const recentSales = sales.sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    }).slice(0, 5);


    res.json({
      stats: {
        revenue: totalRevenue,
        orders: totalOrders,
        lowStock: lowStockItems,
        customers: totalCustomers,
        totalExpenses: totalExpenseFromTxns,
        netProfit: netProfit,
        cashInHand: cashInHand
      },
      chartData,
      recentSales,
      todaySales,
      todayProfit,
      totalStockValuePurchase,
      totalStockValueSell
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
