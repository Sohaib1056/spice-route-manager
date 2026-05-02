import express from "express";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { upload } from "../middleware/upload";

const router = express.Router();

import Product from "../models/Product";

router.route("/")
  .get(getProducts)
  .post(upload.single("image"), createProduct);

router.route("/:id")
  .get(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      console.error("[GetProductById] Error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  })
  .put(upload.single("image"), updateProduct)
  .delete(deleteProduct);

export default router;
