import express from "express";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { upload } from "../middleware/upload";

const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(upload.single("imageFile"), createProduct);

router.route("/:id")
  .put(upload.single("imageFile"), updateProduct)
  .delete(deleteProduct);

export default router;
