import express from "express";
import {
  getSettings,
  updateCompanyInfo,
  updateSystemSettings,
  createBackup,
  downloadBackup,
  resetAllData,
} from "../controllers/settingsController";

const router = express.Router();

router.route("/").get(getSettings);

router.route("/company").put(updateCompanyInfo);

router.route("/system").put(updateSystemSettings);

router.route("/backup").post(createBackup);

router.route("/backup/download").get(downloadBackup);

router.route("/reset").delete(resetAllData);

export default router;
