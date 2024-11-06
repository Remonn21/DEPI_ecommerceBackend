import axios from "axios";
import Order from "../models/order.model.js";

export const paymobAuth = async (req, res) => {
  try {
    const authResponse = await axios.post(`${process.env.PAYMOB_API_BASE}/auth/tokens`, {
      api_key: process.env.PAYMOB_API_KEY,
    });
    res.json(authResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Authentication Failed" });
  }
};

export const paymobPaymentKey = async (req, res) => {
  const { authToken, orderId, amountCents } = req.body;

  const user = req.currentUser;

  const order = await Order.findOne({ _id: orderId, user: user.id });
  if (!order) {
    return res
      .status(400)
      .json({ error: "Invalid order ID or the order doesn't belong to you" });
  }

  console.log("auth Data: ", user);
  try {
    const paymentKeyResponse = await axios.post(
      `${process.env.PAYMOB_API_BASE}/acceptance/payment_keys`,
      {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        // order_id: order._id,
        billing_data: {
          apartment: "NA",
          email: "example@example.com",
          floor: "NA",
          first_name: "John",
          street: "Sample",
          building: "NA",
          phone_number: "+20123456789",
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EGY",
          last_name: "Doe",
          state: "NA",
        },
        currency: "EGP",
        integration_id: process.env.PAYMOB_INTEGRATION_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    res.json(paymentKeyResponse.data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const paymobWebhook = async (req, res) => {
  try {
    const eventData = req.body;

    if (eventData && eventData.obj && eventData.obj.success) {
      // Payment was successful
      const transactionData = eventData.obj;

      const orderId = transactionData.order_id;
      const amountPaid = transactionData.amount_cents;
      //   const paymentMethod = transactionData.payment_method;

      console.log(orderId, amountPaid);

      await Order.updateOne({ _id: orderId }, { status: "paid", amountPaid });

      res.status(200).send("Webhook received and processed successfully");
    } else {
      // Handle other statuses or errors
      console.log("Payment failed or event data invalid", eventData);
      res.status(400).send("Event data invalid or payment failed");
    }
  } catch (error) {
    console.error("Error handling Paymob webhook:", error);
    res.status(500).send("Internal server error");
  }
};
