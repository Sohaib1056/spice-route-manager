import { Request, Response } from "express";
import FinanceTransaction from "../models/FinanceTransaction";
import Supplier from "../models/Supplier";
import AuditLog from "../models/AuditLog";
import WebsiteOrder from "../models/WebsiteOrder";
import Product from "../models/Product";
import Sale from "../models/Sale";
import Return from "../models/Return";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/responseHandler";
import { logUserAction } from "../utils/auditLogger";

// @desc    Get all finance transactions
// @route   GET /api/finance
// @access  Private
export const getTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type, category, from, to, range } = req.query;

  const query: any = {};

  if (type && type !== "All") {
    query.type = type;
  }

  if (category && category !== "All") {
    query.category = category;
  }

  // Handle range-based filtering for transactions list
  if (range && range !== "All Time") {
    const today = new Date();
    let start: Date;

    if (range === "Today") {
      start = new Date();
      start.setHours(0, 0, 0, 0);
    } else if (range === "This Week") {
      start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (range === "This Month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (range === "This Year") {
      start = new Date(today.getFullYear(), 0, 1);
    } else {
      start = new Date(0);
    }

    query.$or = [
      { date: { $gte: start.toISOString().slice(0, 10) } },
      { createdAt: { $gte: start } }
    ];
  }

  if (from || to) {
    query.date = query.date || {};
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
  let websiteDateFilter: any = {};
  let saleDateFilter: any = {};
  let refundDateFilter: any = {};
  const today = new Date();

  if (range === "Today") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    
    dateFilter = { 
      $or: [
        { date: { $gte: todayStart.toISOString().slice(0, 10), $lt: tomorrowStart.toISOString().slice(0, 10) } },
        { createdAt: { $gte: todayStart, $lt: tomorrowStart } }
      ]
    };
    websiteDateFilter = { 
      $or: [
        { orderDate: { $gte: todayStart, $lt: tomorrowStart } },
        { createdAt: { $gte: todayStart, $lt: tomorrowStart } }
      ]
    };
    // Fix POS sale date filter for today
    saleDateFilter = {
      $or: [
        { date: { $gte: todayStart, $lt: tomorrowStart } },
        { createdAt: { $gte: todayStart, $lt: tomorrowStart } }
      ]
    };
    refundDateFilter = {
      $or: [
        { refundedAt: { $gte: todayStart, $lt: tomorrowStart } },
        { createdAt: { $gte: todayStart, $lt: tomorrowStart } }
      ]
    };
  } else if (range === "This Week") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    dateFilter = { 
      $or: [
        { date: { $gte: weekAgo.toISOString().slice(0, 10) } },
        { createdAt: { $gte: weekAgo } }
      ]
    };
    websiteDateFilter = { 
      $or: [
        { orderDate: { $gte: weekAgo } },
        { createdAt: { $gte: weekAgo } }
      ]
    };
    saleDateFilter = {
      $or: [
        { date: { $gte: weekAgo } },
        { createdAt: { $gte: weekAgo } }
      ]
    };
    refundDateFilter = {
      $or: [
        { refundedAt: { $gte: weekAgo } },
        { createdAt: { $gte: weekAgo } }
      ]
    };
  } else if (range === "This Month") {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    dateFilter = { 
      $or: [
        { date: { $gte: monthStart.toISOString().slice(0, 10) } },
        { createdAt: { $gte: monthStart } }
      ]
    };
    websiteDateFilter = { 
      $or: [
        { orderDate: { $gte: monthStart } },
        { createdAt: { $gte: monthStart } }
      ]
    };
    saleDateFilter = {
      $or: [
        { date: { $gte: monthStart } },
        { createdAt: { $gte: monthStart } }
      ]
    };
    refundDateFilter = {
      $or: [
        { refundedAt: { $gte: monthStart } },
        { createdAt: { $gte: monthStart } }
      ]
    };
  } else if (range === "This Year") {
    const yearStart = new Date(today.getFullYear(), 0, 1);
    
    dateFilter = { 
      $or: [
        { date: { $gte: yearStart.toISOString().slice(0, 10) } },
        { createdAt: { $gte: yearStart } }
      ]
    };
    websiteDateFilter = { 
      $or: [
        { orderDate: { $gte: yearStart } },
        { createdAt: { $gte: yearStart } }
      ]
    };
    saleDateFilter = {
      $or: [
        { date: { $gte: yearStart } },
        { createdAt: { $gte: yearStart } }
      ]
    };
    refundDateFilter = {
      $or: [
        { refundedAt: { $gte: yearStart } },
        { createdAt: { $gte: yearStart } }
      ]
    };
  } else if (range === "All Time") {
    dateFilter = {};
    websiteDateFilter = {};
    saleDateFilter = {};
    refundDateFilter = {};
  }

  const [incomeResult, expenseResult, websiteResult, products, sales, returnsData, rangeReturnsData] = await Promise.all([
    FinanceTransaction.aggregate([
      { $match: { type: "Income", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinanceTransaction.aggregate([
      { $match: { type: "Expense", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    WebsiteOrder.find({ paymentStatus: "Paid", ...websiteDateFilter }).lean(),
    Product.find().lean(),
    Sale.find(saleDateFilter).lean(),
    Return.find({ status: "Refunded" }).lean(),
    Return.find({ 
      status: "Refunded", 
      ...refundDateFilter
    }).lean()
  ]);

  // Use Sets to unique results since we're using $or queries
  const uniqueWebsiteOrdersMap = new Map();
  websiteResult.forEach((o: any) => uniqueWebsiteOrdersMap.set(o._id.toString(), o));
  const uniqueWebsiteOrders = Array.from(uniqueWebsiteOrdersMap.values());

  const uniqueSalesMap = new Map();
  sales.forEach((s: any) => uniqueSalesMap.set(s._id.toString(), s));
  const uniqueSales = Array.from(uniqueSalesMap.values());

  const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
  
  // Range Revenue = POS + Website - Range Refunds
  const rangeRefundAmount = rangeReturnsData.reduce((sum: number, r: any) => sum + (r.refundAmount || 0), 0);
  const rangeRevenue = uniqueSales.reduce((sum, s) => sum + (s.total || 0), 0) + 
                       uniqueWebsiteOrders.reduce((sum, o) => sum + (o.total || 0), 0) - 
                       rangeRefundAmount;

  // Calculate Profit for Selected Range (POS)
  let rangeProfit = 0;
  uniqueSales.forEach((sale: any) => {
    sale.items.forEach((item: any) => {
      const product = productMap.get(item.productId?.toString());
      const buyPrice = product?.buyPrice || 0;
      const sellPrice = item.price || 0;
      const quantity = item.qty || 0;
      const revenue = sellPrice * quantity;
      const itemDiscount = sale.subtotal > 0 ? ((sale.discount || 0) / sale.subtotal) * revenue : 0;
      rangeProfit += (revenue - (buyPrice * quantity) - itemDiscount);
    });
  });

  // Calculate Profit for Selected Range (Website)
  uniqueWebsiteOrders.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const product = productMap.get(item.productId?.toString());
      const buyPrice = product?.buyPrice || 0;
      const sellPrice = item.price || 0;
      const quantity = item.quantity || 0;

      let weightInGrams = 1000;
      const weightStr = (item.selectedWeight || "").toString().toLowerCase();
      if (weightStr.includes('kg')) {
        const match = weightStr.match(/(\d+(\.\d+)?)\s*kg/);
        weightInGrams = match ? parseFloat(match[1]) * 1000 : 1000;
      } else if (weightStr.includes('g')) {
        const match = weightStr.match(/(\d+)\s*g/);
        weightInGrams = match ? parseFloat(match[1]) : 500;
      }

      let effectiveBuyPrice = buyPrice;
      if (product?.unit === 'kg') {
        effectiveBuyPrice = (buyPrice / 1000) * weightInGrams;
      }
      rangeProfit += (sellPrice * quantity) - (effectiveBuyPrice * quantity);
    });
  });

  const rangeIncomeTxns = incomeResult[0]?.total || 0;
  const rangeExpenseTxns = expenseResult[0]?.total || 0;

  // Profit for range = Item Margins + Other Income - Range Expenses - Range Refunds
  const profit = rangeProfit + rangeIncomeTxns - rangeExpenseTxns - rangeRefundAmount;

  // Income shown in UI for range (usually just Revenue + Other Income)
  const income = rangeRevenue + rangeIncomeTxns;

  // Calculate total cash from ALL transactions
  const [allIncomeTxns, allExpenseTxns, allSales, allWebsiteOrders, allReturns] = await Promise.all([
    FinanceTransaction.aggregate([
      { $match: { type: "Income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FinanceTransaction.aggregate([
      { $match: { type: "Expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    WebsiteOrder.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Return.aggregate([
      { $match: { status: "Refunded" } },
      { $group: { _id: null, total: { $sum: "$refundAmount" } } },
    ]),
  ]);

  const totalIn = (allIncomeTxns[0]?.total || 0) + 
                  (allSales[0]?.total || 0) + 
                  (allWebsiteOrders[0]?.total || 0);
  const totalOut = (allExpenseTxns[0]?.total || 0) + 
                   (allReturns[0]?.total || 0);
  const cash = totalIn - totalOut;


  sendSuccess(res, { income, expense: rangeExpenseTxns, profit, cash }, "Statistics fetched successfully");
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
  await AuditLog.create({
    userId: currentUserId || "60d0fe4f5311236168a109ca", // Fallback to a default ID if missing
    userName: currentUserName || addedBy || "System",
    userRole: currentUserRole || "Admin",
    action: "create",
    category: "transaction",
    severity: "info",
    module: "Finance",
    description: `Added ${type.toLowerCase()} transaction: ${description}`,
    details: `Amount: PKR ${amount}, Category: ${category || "General"}`,
    ipAddress: req.ip,
  });

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

  // If this was a supplier payment, revert the supplier balance
  if (transaction.category === "Supplier Payment" && transaction.supplierId) {
    const supplier = await Supplier.findById(transaction.supplierId);
    if (supplier) {
      supplier.balanceDue += transaction.amount;
      
      // Update status
      const totalOwed = supplier.openingBalance + supplier.totalPurchases;
      if (supplier.balanceDue === 0) {
        supplier.status = "Paid";
      } else if (supplier.balanceDue > 0 && supplier.balanceDue < totalOwed) {
        supplier.status = "Partial";
      } else {
        supplier.status = "Due";
      }
      
      await supplier.save();
      console.log(`Reverted supplier ${supplier.name} balance after transaction deletion. New balance: ${supplier.balanceDue}`);
    }
  }

  await FinanceTransaction.findByIdAndDelete(req.params.id);

  // Create audit log
  await AuditLog.create({
    userId: req.body.currentUserId || "60d0fe4f5311236168a109ca",
    userName: req.body.currentUserName || "System",
    userRole: req.body.currentUserRole || "Admin",
    action: "delete",
    category: "transaction",
    severity: "warning",
    module: "Finance",
    description: `Deleted ${transaction.type.toLowerCase()} transaction: ${transaction.description}`,
    details: `Amount: PKR ${transaction.amount}`,
    ipAddress: req.ip,
  });

  sendSuccess(res, null, "Transaction deleted successfully");
});
