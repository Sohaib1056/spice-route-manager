import express from "express";
import {
  getReturns,
  getReturnStats,
  getReturnById,
  createReturn,
  approveReturn,
  rejectReturn,
  markAsRefunded,
} from "../controllers/returnController";

const router = express.Router();

router.get("/", getReturns);
router.get("/stats", getReturnStats);
router.get("/:id", getReturnById);
router.post("/", createReturn);
router.patch("/:id/approve", approveReturn);
router.patch("/:id/reject", rejectReturn);
router.patch("/:id/refunded", markAsRefunded);

export default router;
