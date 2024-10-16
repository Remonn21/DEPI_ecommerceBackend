import express from "express";
import { createOrder, getUserOrders } from "../controllers/order.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);
router.post("/", createOrder);
router.get("/:userId", getUserOrders);

export default router;
