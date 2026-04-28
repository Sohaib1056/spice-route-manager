import express from "express";
import { getPurchases, createPurchase, receivePurchase, updatePurchase, deletePurchase } from "../controllers/purchaseController";

const router = express.Router();

router.route("/").get(getPurchases).post(createPurchase);
router.route("/:id").put(updatePurchase).delete(deletePurchase);
router.route("/:id/receive").put(receivePurchase);

export default router;
