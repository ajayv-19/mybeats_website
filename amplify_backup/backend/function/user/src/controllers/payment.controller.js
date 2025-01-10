const { API_URL, API_PREFIX, STRIPE_SECRET_KEY } = require("../globals.const");
const StripeClient = require("stripe");
const { Company, User, Plans, Payment } = require("../models");
const { now } = require("../lib/date.js");
const PaymentController = {
  async CreatePayment(req, res) {
    try {
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      console.log({ STRIPE_SECRET_KEY });
      const { currency_code = "USD", company_id, plan_id, user_id } = req.body;

      if (!currency_code || !plan_id || !user_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Map product data
      const products = [plan_id];

      const plan = await Plans.findOne({ where: { id: plan_id } });
      console.log(plan, "plan");

      const user = await User.findOne({ where: { id: user_id } });

      const amount = plan.pricing;
      console.log(amount, typeof amount);

      const company = await Company.findOne({ where: { id: company_id } });

      const payment = await Payment.create({
        user_id,
        company_id,
        plan_id,
        vendor: "strip",
        status: "INITIATING",
      });

      const order_id = payment.id;

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: currency_code,
              product_data: {
                name: products.join(", "),
                description: `Subscription for ${company.Company_Name}`,
              },
              unit_amount: amount * 100, // plan.amont;
              recurring: {
                interval: "month",
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          name: user.Customer_Name,
          mobile_number: company.phone_number,
          order_id: order_id,
        },
        mode: "subscription",
        success_url: `${API_URL}${API_PREFIX}/payment-success?order_id=${order_id}&session_id={CHECKOUT_SESSION_ID}&vendor=stripepay`,
        cancel_url: `${API_URL}${API_PREFIX}/payment-cancel?order_id=${order_id}&session_id={CHECKOUT_SESSION_ID}&vendor=stripepay`,
      });

      // Save payment record (Mock DB call, replace with your DB logic)
      const paymentPayload = {
        user_id,
        company_id,
        payment_token: session.id,
        order_id,
        amount,
        currency: currency_code,
        payload: session,
      };

      const paymentRow = await Payment.findOne({ where: { id: order_id } });
      await paymentRow.update({
        transaction_payload: JSON.stringify(paymentPayload),
        status: "INITIATED",
      });

      console.log("Payment created:", paymentPayload);

      res.status(200).json({
        payment: paymentPayload,
        redirect_link: session.url,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Unable to create payment session" });
    }
  },

  async PaymentSuccess(req, res) {
    const { order_id, session_id, vendor } = req.query;

    const paymentRow = await Payment.findOne({ where: { id: order_id } });

    if (paymentRow) {
      paymentRow.update({
        status: "SUCCESS",
        transaction_id: session_id,
        transaction_date: now(),
      });
      // Save request data as payer information
      console.log("Payment success:", paymentRow);

      res.status(200).json({
        message: "Payment updated successfully",
        paymentRow,
      });
    } else {
      res.status(400).json({
        error: true,
        message: "Unable to update payment",
      });
    }
  },

  async PaymentCancel(req, res) {
    const { order_id, session_id, vendor } = req.query;

    const paymentRow = await Payment.findOne({ where: { id: order_id } });

    if (paymentRow) {
      paymentRow.update({
        status: "FAILED",
        transaction_id: session_id,
        transaction_date: now(),
      });
      // Save request data as payer information
      console.log("Payment success:", paymentRow);

      res.status(200).json({
        message: "Payment updated successfully",
        paymentRow,
      });
    } else {
      res.status(400).json({
        error: true,
        message: "Unable to update payment",
      });
    }
  },
};

module.exports = PaymentController;
// Compare this snippet from amplify/backend/function/user/src/controllers/user.controller.js:
