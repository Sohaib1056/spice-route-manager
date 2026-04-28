import { Request, Response } from "express";
import FinanceTransaction from "../models/FinanceTransaction";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/responseHandler";
import { logUserAction } from "../utils/auditLogger";

// @desc    Get all finance transactions
// @route   GET /api/finance
// @access  Private
export const getTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type, category, from, to } = req.query;

  const query: any = {};

  if (type && type !== "All") {
    query.type = type;
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = from;
    if (to) query.date.$lte = to;
  }

  const transactions = await FinanceTransaction.find(query).sort({ date: -1, createdAt: -1 });

  sendSuccess(res, transactions, "Transactions fetched successfully");
});

// @desc    Get finance statistics
// @route   GET /api/finance/stats
// @access  Private
export const getFinanceStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { range } = req.query;

  let dateFilter: any = {};
  const today = new Date();

  if (range === "This Week") {
    // Last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { date: { $gte: weekAgo.toISOString().slice(0, 10) } };
  } else if (range === "This Month") {
    // From start of current month to today
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    dateFilter = { date: { $gte: monthStart.toISOString().slice(0, 10) } };
  } else if (range === "This Year") {
    // From start of current year to today
    const yearStart = new Date(today.getFullYear(), 0, 1);
    dateFilter = { date: { $gte: yearStart.toISOString().slice(0, 10) } };
  }

  // Get income and expense for the selected range
  const [incomeResult, expenseResult] = await Promise.all([
    FinanceTransaction.aggregate([
      { $match: { type: "Income", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinanceTransaction.aggregate([
      { $match: { type: "Expense", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const income = incomeResult[0]?.total || 0;
  const expense = expenseResult[0]?.total || 0;
  const profit = income - expense;

  // Calculate total cash from ALL transactions (not just filtered range)
  const [allIncomeResult, allExpenseResult] = await Promise.all([
    FinanceTransaction.aggregate([
      { $match: { type: "Income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinanceTransaction.aggregate([
      { $match: { type: "Expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = allIncomeResult[0]?.total || 0;
  const totalExpense = allExpenseResult[0]?.total || 0;
  const cash = totalIncome - totalExpense; // Total cash = all income - all expenses

  sendSuccess(res, { income, expense, profit, cash }, "Statistics fetched successfully");
});

// @desc    Get monthly revenue and expense data
// @route   GET /api/finance/monthly
// @access  Private
export const getMonthlyData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const months = 6; // Last 6 months
  const monthlyData = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [incomeResult, expenseResult] = await Promise.all([
      FinanceTransaction.aggregate([
        { $match: { type: "Income", date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      FinanceTransaction.aggregate([
        { $match: { type: "Expense", date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    monthlyData.push({
      month: date.toLocaleString("default", { month: "short" }),
      revenue: incomeResult[0]?.total || 0,
      expense: expenseResult[0]?.total || 0,
    });
  }

  sendSuccess(res, monthlyData, "Monthly data fetched successfully");
});

// @desc    Get expense breakdown
// @route   GET /api/finance/expense-breakdown
// @access  Private
export const getExpenseBreakdown = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const breakdown = await FinanceTransaction.aggregate([
    { $match: { type: "Expense" } },
    {
      $group: {
        _id: "$category",
        value: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        value: 1,
      },
    },
  ]);

  sendSuccess(res, breakdown, "Expense breakdown fetched successfully");
});

// @desc    Create finance transaction
// @route   POST /api/finance
// @access  Private
export const createTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type, category, amount, date, description, reference, method, notes, addedBy, currentUserId, currentUserName, currentUserRole } = req.body;

  // Validate required fields
  if (!type || !amount || !date || !description) {
    sendError(res, "Please provide type, amount, date, and description", 400);
    return;
  }

  // Validate amount is positive
  if (Number(amount) <= 0) {
    sendError(res, "Amount must be greater than 0", 400);
    return;
  }

  // Generate reference if not provided
  const txnReference = reference && reference.trim() ? reference : `TXN-${Date.now()}`;

  const transaction = await FinanceTransaction.create({
    type,
    category: category || "General",
    amount: Number(amount),
    date,
    description: description.trim(),
    reference: txnReference,
    method: method || "Cash",
    notes: notes || "",
    addedBy: addedBy || "System",
  });

  // Create audit log
  await logUserAction(
    currentUserId || "system",
    currentUserName || addedBy || "System",
    currentUserRole || "Admin",
    "create",
    "Finance",
    `Added ${type.toLowerCase()} transaction: ${description}`,
    req.ip,
    `Amount: PKR ${amount}, Category: ${category || "General"}`
  );

  sendSuccess(res, transaction, "Transaction created successfully", 201);
});

// @desc    Delete finance transaction
// @route   DELETE /api/finance/:id
// @access  Private
export const deleteTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const transaction = await FinanceTransaction.findById(req.params.id);

  if (!transaction) {
    sendError(res, "Transaction not found", 404);
    return;
  }

  await FinanceTransaction.findByIdAndDelete(req.params.id);

  // Create audit log
  await logUserAction(
    req.body.currentUserId || "system",
    req.body.currentUserName || "System",
    req.body.currentUserRole || "Admin",
    "delete",
    "Finance",
    `Deleted ${transaction.type.toLowerCase()} transaction: ${transaction.description}`,
    req.ip,
    `Amount: PKR ${transaction.amount}`
  );

  sendSuccess(res, null, "Transaction deleted successfully");
});
