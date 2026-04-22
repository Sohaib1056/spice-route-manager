import express from "express";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController";

const router = express.Router();

router.route("/").get(getProducts).post(createProduct);
router.route("/:id").put(updateProduct).delete(deleteProduct);

export default router;
