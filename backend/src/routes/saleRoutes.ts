import express from "express";
import { getSales, createSale, getSaleById } from "../controllers/saleController";

const router = express.Router();

router.route("/").get(getSales).post(createSale);
router.route("/:id").get(getSaleById);

export default router;
