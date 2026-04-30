import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController";

const router = express.Router();

router.route("/").get(getOrders).post(createOrder);
router.route("/:id/status").put(updateOrderStatus);

export default router;
