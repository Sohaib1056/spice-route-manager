import express from "express";
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  createAuditLog,
  cleanupAuditLogs,
  getRecentActivity,
  getUserActivity,
} from "../controllers/auditController";

const router = express.Router();

router.route("/").get(getAuditLogs).post(createAuditLog);

router.route("/stats").get(getAuditStats);

router.route("/recent").get(getRecentActivity);

router.route("/cleanup").delete(cleanupAuditLogs);

router.route("/user/:userId").get(getUserActivity);

router.route("/:id").get(getAuditLogById);

export default router;
