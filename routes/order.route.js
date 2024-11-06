import express from "express";
import { createOrder, getUserOrders } from "../controllers/order.controller.js";
import { auth } from "../middleware/auth.js";
import {
  paymobAuth,
  paymobPaymentKey,
  paymobWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/webhook/paymob", paymobWebhook);

router.use(auth);
// paymob
router.post("/paymob/authenticate", paymobAuth);
router.post("/paymob/payment-key", paymobPaymentKey);

router.post("/", createOrder);
router.get("/:userId", getUserOrders);

export default router;
