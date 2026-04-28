import express from "express";
import { 
  getSuppliers, 
  createSupplier, 
  getSupplierById, 
  updateSupplier, 
  deleteSupplier,
  recordPayment,
  getSupplierLedger
} from "../controllers/supplierController";

const router = express.Router();

router.route("/").get(getSuppliers).post(createSupplier);
router.route("/:id").get(getSupplierById).put(updateSupplier).delete(deleteSupplier);
router.route("/:id/payment").post(recordPayment);
router.route("/:id/ledger").get(getSupplierLedger);

export default router;
