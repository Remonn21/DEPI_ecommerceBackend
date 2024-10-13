import express from "express";
import UserController from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";
import { allowedTo } from "../middleware/allowedTo.js";

const router = express.Router();

router.route("/").get(auth, allowedTo("admin"), UserController.getUsers);
router.route("/signup").post(UserController.signup);
router.route("/login").post(UserController.login);

export default router;
