import express from "express";
import { login, logout, getCurrentUser, changePassword } from "../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.put("/change-password", changePassword);

export default router;
