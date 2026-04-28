import express from "express";
import { 
  getLowStockProducts, 
  getLowStockStats,
  getReorderList 
} from "../controllers/lowStockController";

const router = express.Router();

router.get("/", getLowStockProducts);
router.get("/stats", getLowStockStats);
router.get("/reorder-list", getReorderList);

export default router;
