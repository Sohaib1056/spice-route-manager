import express from "express";
import { getSales, createSale } from "../controllers/saleController";

const router = express.Router();

router.route("/").get(getSales).post(createSale);

export default router;
