import express from "express";
import { getStockMovements, adjustStock } from "../controllers/stockController";

const router = express.Router();

router.get("/movements", getStockMovements);
router.post("/adjust", adjustStock);

export default router;
