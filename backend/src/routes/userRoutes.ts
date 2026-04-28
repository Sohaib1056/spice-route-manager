import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword,
} from "../controllers/userController";
import { validateUserInput } from "../middleware/validation";

const router = express.Router();

router.route("/").get(getUsers).post(validateUserInput, createUser);

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

router.route("/:id/password").put(updateUserPassword);

export default router;
