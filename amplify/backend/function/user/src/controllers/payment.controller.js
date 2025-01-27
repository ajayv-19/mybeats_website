const {
  API_URL,
  API_PREFIX,
  STRIPE_SECRET_KEY,
} = require("../globals.const.js");
const StripeClient = require("stripe");
const {
  Company,
  User,
  Plans,
  Payment,
  Subscriptions,
} = require("../models/index.js");
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
    router.post("/create-payment", (...arg) => this.CreatePayment(...arg));
    router.get("/payment-success", (...arg) => this.PaymentSuccess(...arg));
    router.get("/payment-cancel", (...arg) => this.PaymentCancel(...arg));
    router.get("/payment-session", (...arg) =>
      this.GetPaymentSubscribed(...arg)
    );
    router.post("/create-subscription", (...arg) =>
      this.CreateSubscription(...arg)
    );
    router.post("/cancel-subscription", (...arg) =>
      this.MakeSubscribtionCancel(...arg)
    );
    router.post("/create-payment-intent", (...arg) =>
      this.FetchPaymentIntent(...arg)
    );
    router.post("/webhook", (...arg) => this.HandleStripeEvent(...arg));
  }

  async HandleStripeEvent(req, res) {
    try {
      const event = req.body;

      

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          // Then define and call a method to handle the successful payment intent.
          // handlePaymentIntentSucceeded(paymentIntent);
          break;
        case "payment_method.attached":
          const paymentMethod = event.data.object;
          // Then define and call a method to handle the successful attachment of a PaymentMethod.
          // handlePaymentMethodAttached(paymentMethod);
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({received: true});

    } catch (error) {
      res.status(500).json({ error: "Unable to create subscription" });
    }
  }

  async CreateSubscription(req, res) {
    try {
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      const { currency_code = "USD", company_id, plan_id, user_id } = req.body;

      if (!currency_code || !plan_id || !user_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Map product data
      const products = [plan_id];

      const plan = await Plans.findOne({ where: { id: plan_id } });

      const user = await User.findOne({ where: { id: user_id } });

      const company = await Company.findOne({ where: { id: company_id } });

      const amount = plan.pricing * company.policyholder_count;
      console.log(amount, typeof amount);

      const customer = await getCustomerDetails(user.email, {
        name: user.Customer_Name,
        email: user.email,
        phone: company.phone_number,
      });

      console.log(plan, user, company);

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: "price_1QlFc0DIv4SXGrBxcTOIm2TJ",
            quantity: 5,
          },
        ],
        metadata: {
          user_id,
          company_id,
          plan_id,
        },
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        payment_method_types: ["card", "us_bank_account"],
      });

      const payment = await Payment.create({
        user_id,
        company_id,
        plan_id,
        vendor: "stripe",
        status: "INITIATED",
        payment_token: subscription.id,
        transaction_payload: JSON.stringify(subscription),
      });

      await Subscriptions.create({
        company_id,
        user_id,
        plan_id,
        starts_at: datelib.now(),
        ends_at: datelib.addDays(datelib.now(), plan.days),
        isactive: true,
        payment_id: payment.id,
      });

      res.status(200).json({
        message: "Subscription created successfully",
        subscription,
        redirect_link: subscription.latest_invoice.payment_intent.client_secret,
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Unable to create subscription" });
    }
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
        vendor: "stripe",
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
      let starts_at = transaction_date;
      // console.log(plan, "plan");
      let ends_at = datelib.addDays(transaction_date, plan.days);
      let subscription = null;
      const hasSubscription = await Subscriptions.findOne({
        where: { company_id },
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
        // Cancel existing subscription on stripe
        await this.MakeSubscribtionCancel({ body: { user_id } }, res);

        subscription = hasSubscription;
        subscription.update({
          isactive: true,
          starts_at,
          ends_at,
          plan_id,
          payment_id,
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

      const {
        user_id,
        company_id,
        plan_id,
        transaction_payload,
        id: payment_id,
        transaction_date,
      } = paymentRow;
      const subscription = await Subscriptions.findOne({
        where: { company_id },
      });
      subscription.update({
        isactive: false,
        plan_id,
        payment_id,
      });

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

  async MakeSubscribtionCancel(req, res) {
    const { user_id } = req.body;
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
    const remote_subscription_id = session.subscription;
    //const result = await stripe.subscriptions.del(remote_subscription_id);
    console.log({ remote_subscription_id, subscription, session, payment });
    try {
      //const result = await stripe.subscriptions.del(remote_subscription_id);
      const result = await stripe.subscriptions.update(remote_subscription_id, {
        cancel_at_period_end: true,
      });
      console.log(result, "result");
      res.status(200).json({
        message: "Subscription cancelled successfully",
        result,
      });
    } catch (error) {
      console.log(error, "error");
      res.status(400).json({
        error: true,
        message: "Unable to cancel subscription",
      });
    }
  }

  async FetchPaymentIntent(req, res) {
    const { items } = req.body;
    const stripe = StripeClient(STRIPE_SECRET_KEY);
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 30 * 100,
      currency: "usd",
      payment_method_types: ["card", "us_bank_account"],
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      // automatic_payment_methods: {
      //   enabled: true,
      // },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }
}

module.exports = new PaymentController();
//Compare this snippet from amplify/backend/function/user/src/controllers/user.controller.js:
