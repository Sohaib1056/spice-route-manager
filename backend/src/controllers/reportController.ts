import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/responseHandler";
import FinanceTransaction from "../models/FinanceTransaction";
import Sale from "../models/Sale";
import Purchase from "../models/Purchase";
import Product from "../models/Product";
import Return from "../models/Return";
import WebsiteOrder from "../models/WebsiteOrder";

// @desc    Get report data
// @route   GET /api/reports
// @access  Private
export const getReportData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Use a faster aggregation or Promise.all for initial counts
  const [sales, purchases, products, transactions, returns, websiteOrders] = await Promise.all([
    Sale.find().lean(),
    Purchase.find({ status: "Received" }).lean(),
    Product.find().select("stock buyPrice name sku").lean(),
    FinanceTransaction.find().select("type amount").lean(),
    Return.find({ status: "Refunded" }).lean(),
    WebsiteOrder.find({ paymentStatus: "Paid" }).lean()
  ]);

  const totalRefunds = returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  const posRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const websiteRevenue = websiteOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  const totalRevenue = (posRevenue + websiteRevenue) - totalRefunds;
  const totalPurchaseCost = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
  
  const totalIncomeTxns = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenseTxns = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const inventoryValueCost = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.buyPrice || 0)), 0);
  const netProfit = (totalRevenue + totalIncomeTxns) - totalExpenseTxns;

  // Get last 7 days data
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  // Optimize daily data lookup by creating a map
  const salesMap = new Map<string, number>();
  
  // Add POS sales
  sales.forEach((s: any) => {
    const dateValue = s.date;
    const date = dateValue instanceof Date ? dateValue.toISOString().slice(0, 10) : String(dateValue).slice(0, 10);
    salesMap.set(date, (salesMap.get(date) || 0) + (s.total || 0));
  });

  // Add Website sales
  websiteOrders.forEach((o: any) => {
    const dateValue = o.orderDate;
    const date = dateValue instanceof Date ? dateValue.toISOString().slice(0, 10) : String(dateValue).slice(0, 10);
    salesMap.set(date, (salesMap.get(date) || 0) + (o.total || 0));
  });

  // Deduct returns from daily sales map
  returns.forEach((r: any) => {
    const date = r.refundedAt instanceof Date ? r.refundedAt.toISOString().slice(0, 10) : String(r.refundedAt).slice(0, 10);
    salesMap.set(date, (salesMap.get(date) || 0) - (r.refundAmount || 0));
  });

  const purchaseMap = new Map<string, number>();
  purchases.forEach((p: any) => {
    const dateValue = p.date;
    const date = dateValue instanceof Date ? dateValue.toISOString().slice(0, 10) : String(dateValue).slice(0, 10);
    purchaseMap.set(date, (purchaseMap.get(date) || 0) + (p.total || 0));
  });

  const chartData = days.map(date => ({
    name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    date,
    Sales: salesMap.get(date) || 0,
    Purchases: purchaseMap.get(date) || 0,
  }));

  sendSuccess(res, {
    summary: {
      salesRevenue: totalRevenue,
      purchaseCost: totalPurchaseCost,
      inventoryValue: inventoryValueCost,
      netProfit: netProfit,
    },
    chartData,
  });
});

// @desc    Export report as CSV
// @route   GET /api/reports/export
// @access  Private
export const exportReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type } = req.query;

  // Get all transactions from database
  const transactions = await FinanceTransaction.find({})
    .sort({ date: -1, createdAt: -1 })
    .limit(100); // Last 100 transactions

  // Create CSV header
  let csvData = "Date,Type,Category,Description,Amount,Reference,Method\n";

  // Add transaction rows
  transactions.forEach((txn) => {
    csvData += `${txn.date},${txn.type},${txn.category},"${txn.description}",${txn.amount},${txn.reference},${txn.method}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=report-${Date.now()}.csv`);
  res.send(csvData);
});

// @desc    Get print-ready report
// @route   GET /api/reports/print
// @access  Private
export const getPrintReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Calculate actual values from database
  const [incomeResult, expenseResult] = await Promise.all([
    FinanceTransaction.aggregate([
      { $match: { type: "Income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinanceTransaction.aggregate([
      { $match: { type: "Expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = incomeResult[0]?.total || 0;
  const totalExpense = expenseResult[0]?.total || 0;

  const [salesRevenueResult, purchaseCostResult] = await Promise.all([
    FinanceTransaction.aggregate([
      { $match: { type: "Income", category: { $in: ["Sales Revenue", "Product Sales"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinanceTransaction.aggregate([
      { $match: { type: "Expense", category: { $in: ["Purchase Cost", "Inventory Purchase"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const salesRevenue = salesRevenueResult[0]?.total || totalIncome;
  const purchaseCost = purchaseCostResult[0]?.total || 0;
  const netProfit = totalIncome - totalExpense;
  const inventoryValue = Math.max(0, purchaseCost * 0.6);

  sendSuccess(res, {
    title: "Business Report",
    generatedAt: new Date().toISOString(),
    summary: {
      salesRevenue,
      purchaseCost,
      inventoryValue,
      netProfit,
    },
  });
});
