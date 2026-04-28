import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/responseHandler";
import FinanceTransaction from "../models/FinanceTransaction";

// @desc    Get report data
// @route   GET /api/reports
// @access  Private
export const getReportData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

  // Get category-wise breakdown
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

  const salesRevenue = salesRevenueResult[0]?.total || totalIncome; // Use total income if no specific sales
  const purchaseCost = purchaseCostResult[0]?.total || 0;
  const netProfit = totalIncome - totalExpense;
  
  // Calculate inventory value (purchases - cost of goods sold)
  // For now, use remaining cash as proxy for inventory value
  const inventoryValue = Math.max(0, purchaseCost * 0.6); // Estimate: 60% of purchases still in inventory

  // Get last 7 days data
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  // Get actual daily data
  const chartData = await Promise.all(
    days.map(async (date) => {
      const [dailySales, dailyPurchases] = await Promise.all([
        FinanceTransaction.aggregate([
          { $match: { type: "Income", date } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        FinanceTransaction.aggregate([
          { $match: { type: "Expense", date } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      return {
        name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date,
        Sales: dailySales[0]?.total || 0,
        Purchases: dailyPurchases[0]?.total || 0,
      };
    })
  );

  sendSuccess(res, {
    summary: {
      salesRevenue,
      purchaseCost,
      inventoryValue,
      netProfit,
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
