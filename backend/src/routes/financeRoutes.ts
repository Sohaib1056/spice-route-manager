import express from "express";
import {
  getTransactions,
  getFinanceStats,
  getMonthlyData,
  getExpenseBreakdown,
  createTransaction,
  deleteTransaction,
} from "../controllers/financeController";

const router = express.Router();

router.route("/").get(getTransactions).post(createTransaction);

router.route("/stats").get(getFinanceStats);

router.route("/monthly").get(getMonthlyData);

router.route("/expense-breakdown").get(getExpenseBreakdown);

router.route("/:id").delete(deleteTransaction);

export default router;
