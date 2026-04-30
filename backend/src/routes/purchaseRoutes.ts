import express from "express";
import { getPurchases, createPurchase, receivePurchase, updatePurchase, deletePurchase } from "../controllers/purchaseController";
import { upload } from "../middleware/upload";

const router = express.Router();

router.route("/").get(getPurchases).post(createPurchase);
router.route("/:id").put(updatePurchase).delete(deletePurchase);
router.route("/:id/receive").put(upload.single("receipt"), receivePurchase);

export default router;
