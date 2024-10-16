import { asyncWrapper } from "../utils/asyncWrapper.js";
import Order from "./../models/order.model.js";

export const createOrder = asyncWrapper(async (req, res) => {
   const { user_id, totalAmount, shippingAddress, paymentMethod } = req.body;
   const newOrder = await Order.create({
      user_id,
      totalAmount,
      shippingAddress,
      paymentMethod,
   });

   res.json({ status: 201, data: newOrder });
});

export const getUserOrders = asyncWrapper(async (req, res) => {
   const orders = await Order.find({ user_id: req.params.userId });

   res.json({ status: 200, data: orders });
});
