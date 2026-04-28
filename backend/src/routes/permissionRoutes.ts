import express from "express";
import {
  getAllPermissions,
  getUserPermissions,
  updateUserPermissions,
  bulkUpdatePermissions,
} from "../controllers/permissionController";

const router = express.Router();

router.route("/").get(getAllPermissions);

router.route("/bulk").put(bulkUpdatePermissions);

router.route("/:userId").get(getUserPermissions).put(updateUserPermissions);

export default router;
