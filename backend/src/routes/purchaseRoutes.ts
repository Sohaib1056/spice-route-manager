import express from "express";
import { getPurchases, createPurchase, receivePurchase } from "../controllers/purchaseController";

const router = express.Router();

router.route("/").get(getPurchases).post(createPurchase);
router.route("/:id/receive").put(receivePurchase);

export default router;
