import express from "express";
import { getReportData, exportReport, getPrintReport } from "../controllers/reportController";

const router = express.Router();

router.route("/").get(getReportData);

router.route("/export").get(exportReport);

router.route("/print").get(getPrintReport);

export default router;
