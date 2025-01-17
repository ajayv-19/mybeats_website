const { API_URL, API_PREFIX, STRIPE_SECRET_KEY } = require("../globals.const");
const StripeClient = require("stripe");
const { Company, User, Plans, Payment, Subscriptions } = require("../models");
const datelib = require("../lib/date.js");
const getCustomerDetails = async (email, payload) => {
  const stripe = StripeClient(STRIPE_SECRET_KEY);
  let customer = null;
  const customers = await stripe.customers.list({
    email: email,
    limit: 1, // Only need the first match
  });
  const hasCustomer = !!customers.data.length;
  if (!hasCustomer) {
    const newCustomer = await stripe.customers.create(payload);
    customer = newCustomer;
  } else {
    customer = customers.data[0];
  }
  return customer;
};
class PaymentController {
  setupRoutes(router) {
    router.post("/create-payment", this.CreatePayment);
    router.get("/payment-success", this.PaymentSuccess);
    router.get("/payment-cancel", this.PaymentCancel);
    router.get("/payment-session", this.GetPaymentSubscribed);
  }
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

      const company = await Company.findOne({ where: { id: company_id } });

      const amount = plan.pricing * company.policyholder_count;
      console.log(amount, typeof amount);

      const payment = await Payment.create({
        user_id,
        company_id,
        plan_id,
        vendor: "strip",
        status: "INITIATING",
      });

      const order_id = payment.id;
      const customer = await getCustomerDetails(user.email, {
        name: user.Customer_Name,
        email: user.email,
        phone: company.phone_number,
      });

      console.log({ customer });

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
                interval: plan.interval,
                interval_count: plan.interval_count,
              },
            },
            quantity: 1,
          },
        ],
        customer: customer.id,
        //customer_email: user.email,
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
  }

  async PaymentSuccess(req, res) {
    const { order_id, session_id, vendor } = req.query;

    const paymentRow = await Payment.findOne({ where: { id: order_id } });

    if (paymentRow) {
      paymentRow.update({
        status: "SUCCESS",
        transaction_id: session_id,
        transaction_date: datelib.now(),
      });
      // Save request data as payer information

      const {
        user_id,
        company_id,
        plan_id,
        transaction_payload,
        id: payment_id,
        transaction_date,
      } = paymentRow;
      console.log("Payment success:", paymentRow);

      const plan = await Plans.findOne({ where: { id: plan_id } });
      const starts_at = transaction_date;
      const ends_at = datelib.addDays(transaction_date, plan.days);
      let subscription = null;
      const hasSubscription = await Subscriptions.findOne({
        where: { user_id, company_id },
      });
      if (!hasSubscription) {
        subscription = await Subscriptions.create({
          company_id,
          user_id,
          starts_at,
          ends_at,
          isactive: true,
          plan_id,
          payment_id,
        });
      } else {
        subscription = hasSubscription;
        subscription.update({
          isactive: true,
          starts_at,
          ends_at,
          plan_id,
        });
      }

      if (subscription) {
        const company = await Company.findOne({ where: { id: company_id } });
        company.update({
          subscription_id: subscription.id,
          plan_id,
          plan_type: plan.name,
          last_renewal: starts_at,
          expiry_date: ends_at,
          //plan_id
        });
      }

      res.status(200).json({
        message: "Payment updated successfully",
        payment: paymentRow,
        subscription,
      });
    } else {
      res.status(400).json({
        error: true,
        message: "Unable to update payment",
      });
    }
  }

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
  }

  async GetPaymentSubscribed(req, res) {
    const { user_id } = req.query;
    const user = await User.findOne({ where: { id: user_id } });
    const company_id = user.company_id;
    const company = await Company.findOne({ where: { id: company_id } });
    const subscription_id = company.subscription_id;
    const subscription = await Subscriptions.findOne({
      where: { id: subscription_id },
    });
    const payment_id = subscription.payment_id;
    const payment = await Payment.findOne({ where: { id: payment_id } });
    const stripe = StripeClient(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(
      payment.transaction_id
    );

    res.status(200).json({
      message: "Payment Session retrived successfully",
      session,
    });
  }
}

module.exports = new PaymentController();
//Compare this snippet from amplify/backend/function/user/src/controllers/user.controller.js:
