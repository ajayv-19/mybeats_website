const {
  API_URL,
  API_PREFIX,
  STRIPE_SECRET_KEY,
} = require("../globals.const.js");
const ProxyResponse = require("../lib/util.js");
const StripeClient = require("stripe");
const {
  Company,
  User,
  Plans,
  Payment,
  Subscriptions,
  NewSubscriptions,
} = require("../models/index.js");

const datelib = require("../lib/date.js");

const getCustomerDetails = async (email, payload) => {
  const stripe = StripeClient(STRIPE_SECRET_KEY);

  try {
    // Check if a customer with the given email already exists
    const { data: existingCustomers } = await stripe.customers.list({
      email,
      limit: 1, // Fetch only the first matching customer
    });

    // If customer exists, return the first match
    if (existingCustomers.length > 0) {
      return existingCustomers[0];
    }

    // If no customer exists, create a new one
    const newCustomer = await stripe.customers.create(payload);
    return newCustomer;
  } catch (error) {
    console.error("Error fetching or creating Stripe customer:", error);
    throw new Error("Unable to retrieve or create customer.");
  }
};
const addSubscription = async (customer_subscription_created) => {
  try {
    // Extract relevant details from the event
    const {
      id: sub_id,
      status,
      current_period_start,
      current_period_end,
      plan,
    } = customer_subscription_created;

    // Using static metadata since metadata is missing in Stripe response
    const metadata = {
      company_id: 1, // Replace with actual static company ID
      plan_id: 1, // Replace with actual static plan ID
      user_id: 1, // Replace with actual static user ID (or keep NULL)
    };

    console.log("✅ Using static metadata:", metadata);

    // Create a new row in the NewSubscriptions table
    const newSubscription = await NewSubscriptions.create({
      sub_id,
      user_id: metadata.user_id || null, // If user_id exists, store it; otherwise, keep it NULL
      company_id: metadata.company_id,
      amount: plan.amount / 100, // Convert cents to dollars (Stripe sends amounts in cents)
      bill_start: new Date(current_period_start * 1000), // Convert Unix timestamp to Date
      bill_end: new Date(current_period_end * 1000), // Convert Unix timestamp to Date
      status: status.toUpperCase(), // Normalize status
    });

    console.log("✅ Subscription created successfully:", newSubscription);
    return { success: true, data: newSubscription };
  } catch (error) {
    console.error("❌ Error creating subscription:", error);
    return { success: false, error: "Unable to create subscription" };
  }
};

const handleSuccesfullInvoicePayment = async (invoice) => {
  try {
    const subscription_id = invoice.subscription;

    console.log("💰 Payment succeeded for subscription:", subscription_id);

    // Find the subscription in our database
    const subscription = await NewSubscriptions.findOne({
      where: { sub_id: subscription_id },
    });

    if (!subscription) {
      console.error("Subscription not found in DB:", subscription_id);
      return;
    }

    // Calculate new billing cycle
    const newStartDate = new Date(); // Today
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + 1); // Add 1 month

    // Update subscription with new billing period
    subscription.status = "ACTIVE";
    subscription.bill_start = newStartDate;
    subscription.bill_end = newEndDate;
    await subscription.save();

    console.log("✅ Billing cycle updated:", {
      sub_id: subscription_id,
      newStartDate,
      newEndDate,
    });
  } catch (error) {
    console.error("❌ Error updating successful payment:", error);
  }
};

const handleSubscriptionUpdated = async (subscription) => {
  try {
    const stripe = StripeClient(STRIPE_SECRET_KEY);
    console.log("🔄 Subscription updated in Stripe:", subscription.id);

    const existingSubscription = await NewSubscriptions.findOne({
      where: { sub_id: subscription.id },
    });

    if (!existingSubscription) {
      console.error("⚠️ Subscription not found in DB:", subscription.id);
      return;
    }

    // Extract subscription item details
    const subscriptionItem = subscription.items.data[0];
    const newQuantity = subscriptionItem.quantity;
    const subscriptionItemId = subscriptionItem.id;

    // Fetch subscription item from Stripe to get price details
    const stripeItem =
      await stripe.subscriptionItems.retrieve(subscriptionItemId);
    const newAmount = (stripeItem.price.unit_amount / 100) * newQuantity; // Convert cents to dollars

    console.log("📊 Updating DB with new values:", { newQuantity, newAmount });

    // Update database
    existingSubscription.amount = newAmount;
    existingSubscription.bill_end = new Date(
      subscription.current_period_end * 1000
    );
    await existingSubscription.save();

    console.log("✅ Subscription updated in database.");
  } catch (error) {
    console.error("❌ Error handling subscription update:", error);
  }
};

const handleFailedInvoive = async (invoice) => {
  try {
    const subscription_id = invoice.subscription;

    console.log("❌ Payment failed for subscription:", subscription_id);

    // Find the subscription in our database
    const subscription = await NewSubscriptions.findOne({
      where: { sub_id: subscription_id },
    });

    if (!subscription) {
      console.error("Subscription not found in database:", subscription_id);
      return;
    }

    // Update status to PAYMENT_FAILED
    subscription.status = "PAYMENT_FAILED";
    await subscription.save();

    console.log("✅ Subscription updated to PAYMENT_FAILED:", subscription_id);
  } catch (error) {
    console.error("❌ Error handling failed payment:", error);
  }
};

const pauseSubscription = async () => {};

const removeAccessQ = async () => {};

class PaymentController {
  setupRoutes(router) {
    // router.post("/create-payment", (...arg) => this.CreatePayment(...arg));
    // router.get("/payment-success", (...arg) => this.PaymentSuccess(...arg));
    // router.get("/payment-cancel", (...arg) => this.PaymentCancel(...arg));
    // router.get("/payment-session", (...arg) =>
    //   this.GetPaymentSubscribed(...arg)
    // );
    router.post("/create-subscription", (...arg) =>
      this.CreateSubscription(...arg)
    );
    router.post("/webhook", (...arg) => this.HandleStripeEvent(...arg));
  }

  async HandleStripeEvent(req, res) {
    try {
      const event = req.body;

      // Handle the event
      switch (event.type) {
        // When a subscription is created for a customer for a customer
        // Add a row to the subscription table with status active
        // Update the payment row's status from active to succesfull
        case "customer.subscription.created":
          const customer_subscription_created = event.data.object;
          await addSubscription(customer_subscription_created);
          break;

        // When a subscription is updated
        case "customer.subscription.updated":
          const customer_subscription_updated = event.data.object;
          await handleSubscriptionUpdated(customer_subscription_updated);
          break;

        case "invoice.payment_succeeded":
          const invoice_suceeded = event.data.object;
          await handleSuccesfullInvoicePayment(invoice_suceeded);
          break;

        // When a customer fails to pay for the subscription
        case "invoice.payment_failed":
          const invoice_failed = event.data.object;
          await handleFailedInvoive(invoice_failed);
          break;

        // TODO: Update subscription (Prorated Charge) -> Change the number of policyholders (Change the price) -> Update the payment and the subscription in stripe

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      res.status(500).json({ error: "Unable to create subscription" });
    }
  }

  // Update subscription
  // TODO: Downgrade -> Calc new amount -> Calc new subscription -> Cancel previous sub -> Calc refund amount to the user
  // TODO: Upgrade -> Same thing

  // Create Subscription route
  async CreateSubscription(req, res) {
    try {
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      const {
        currency_code = "USD",
        company_id,

        plan_id,
        user_id,
      } = req.body;

      // Throw an error when the required parameters are not there
      if (!currency_code || !user_id || !plan_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Get the user details
      const user = await User.findOne({ where: { id: user_id } });
      const plan = await Plans.findOne({ where: { id: plan_id } });
      if (!user || !plan) {
        return res.status(400).json({ error: "Invalid user or plan" });
      }
      const price_id = plan.price_id;

      // Get the company details
      const company = await Company.findOne({ where: { id: company_id } });

      // Get the customer detail
      const customer = await getCustomerDetails(user.email, {
        name: user.Customer_Name,
        email: user.email,
        phone: company.phone_number,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: price_id, // price id is related to the subscription plan
            quantity: company.policyholder_count, // The company is going to subscribe for the policyholders that they have
          },
        ],
        metadata: {
          user_id,
          company_id,
          plan_id,
        },
        payment_behavior: "default_incomplete",

        payment_settings: {
          save_default_payment_method: "on_subscription",
          payment_method_types: ["card", "us_bank_account"],
        },
        expand: ["latest_invoice.payment_intent"],
      });

      // Initiate payment
      await Payment.create({
        user_id,
        company_id,
        plan_id,
        vendor: "stripe",
        status: "INITIATED",
        subscription_id: subscription.id,
        transaction_payload: JSON.stringify(subscription),
      });

      res.status(200).json({
        message: "Subscription initiated successfully",
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Unable to create subscription" });
    }
  }

  async CancelSubscription(req, res) {
    try {
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      const { subscription_id, cancel_immediately } = req.body;

      if (!subscription_id) {
        return res.status(400).json({ error: "Missing subscription_id" });
      }

      // Fetch existing subscription
      const subscription = await stripe.subscriptions.retrieve(subscription_id);

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      // Cancel the subscription (either immediately or at the end of the billing period)
      const canceledSubscription = await stripe.subscriptions.update(
        subscription_id,
        {
          cancel_at_period_end: !cancel_immediately, // If true, the user will have access till the end of their billing cycle
        }
      );

      // Update subscription status in DB
      await Subscriptions.update(
        {
          status: cancel_immediately ? "CANCELED" : "PENDING_CANCELLATION",
          updated_at: new Date(),
        },
        { where: { subscription_id } }
      );

      res.status(200).json({
        message: cancel_immediately
          ? "Subscription canceled immediately"
          : "Subscription will be canceled at the end of the billing cycle",
        canceledSubscription,
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ error: "Unable to cancel subscription" });
    }
  }

  //   async CreatePayment(req, res) {
  //     try {
  //       const stripe = StripeClient(STRIPE_SECRET_KEY);
  //       console.log({ STRIPE_SECRET_KEY });
  //       const { currency_code = "USD", company_id, plan_id, user_id } = req.body;

  //       if (!currency_code || !plan_id || !user_id) {
  //         return res.status(400).json({ error: "Missing required parameters" });
  //       }

  //       // Map product data
  //       const products = [plan_id];

  //       const plan = await Plans.findOne({ where: { id: plan_id } });
  //       console.log(plan, "plan");

  //       const user = await User.findOne({ where: { id: user_id } });

  //       const company = await Company.findOne({ where: { id: company_id } });

  //       const amount = plan.pricing * company.policyholder_count;
  //       console.log(amount, typeof amount);

  //       const payment = await Payment.create({
  //         user_id,
  //         company_id,
  //         plan_id,
  //         vendor: "stripe",
  //         status: "INITIATING",
  //       });

  //       const order_id = payment.id;
  //       const customer = await getCustomerDetails(user.email, {
  //         name: user.Customer_Name,
  //         email: user.email,
  //         phone: company.phone_number,
  //       });

  //       console.log({ customer });

  //       // Create Checkout Session
  //       const session = await stripe.checkout.sessions.create({
  //         line_items: [
  //           {
  //             price_data: {
  //               currency: currency_code,
  //               product_data: {
  //                 name: products.join(", "),
  //                 description: `Subscription for ${company.Company_Name}`,
  //               },
  //               unit_amount: amount * 100, // plan.amont;
  //               recurring: {
  //                 interval: plan.interval,
  //                 interval_count: plan.interval_count,
  //               },
  //             },
  //             quantity: 1,
  //           },
  //         ],
  //         customer: customer.id,
  //         //customer_email: user.email,
  //         metadata: {
  //           name: user.Customer_Name,
  //           mobile_number: company.phone_number,
  //           order_id: order_id,
  //         },
  //         mode: "subscription",
  //         success_url: `${API_URL}${API_PREFIX}/payment-success?order_id=${order_id}&session_id={CHECKOUT_SESSION_ID}&vendor=stripepay`,
  //         cancel_url: `${API_URL}${API_PREFIX}/payment-cancel?order_id=${order_id}&session_id={CHECKOUT_SESSION_ID}&vendor=stripepay`,
  //       });

  //       // Save payment record (Mock DB call, replace with your DB logic)
  //       const paymentPayload = {
  //         user_id,
  //         company_id,
  //         payment_token: session.id,
  //         order_id,
  //         amount,
  //         currency: currency_code,
  //         payload: session,
  //       };

  //       const paymentRow = await Payment.findOne({ where: { id: order_id } });
  //       await paymentRow.update({
  //         transaction_payload: JSON.stringify(paymentPayload),
  //         status: "INITIATED",
  //       });

  //       console.log("Payment created:", paymentPayload);

  //       res.status(200).json({
  //         payment: paymentPayload,
  //         redirect_link: session.url,
  //       });
  //     } catch (error) {
  //       console.error("Error creating payment:", error);
  //       res.status(500).json({ error: "Unable to create payment session" });
  //     }
  //   }

  //   async PaymentSuccess(req, res) {
  //     const { order_id, session_id, vendor } = req.query;

  //     const paymentRow = await Payment.findOne({ where: { id: order_id } });

  //     if (paymentRow) {
  //       paymentRow.update({
  //         status: "SUCCESS",
  //         transaction_id: session_id,
  //         transaction_date: datelib.now(),
  //       });
  //       // Save request data as payer information

  //       const {
  //         user_id,
  //         company_id,
  //         plan_id,
  //         transaction_payload,
  //         id: payment_id,
  //         transaction_date,
  //       } = paymentRow;
  //       console.log("Payment success:", paymentRow);

  //       const plan = await Plans.findOne({ where: { id: plan_id } });
  //       let starts_at = transaction_date;
  //       // console.log(plan, "plan");
  //       let ends_at = datelib.addDays(transaction_date, plan.days);
  //       let subscription = null;
  //       const hasSubscription = await Subscriptions.findOne({
  //         where: { company_id },
  //       });

  //       if (!hasSubscription) {
  //         subscription = await Subscriptions.create({
  //           company_id,
  //           user_id,
  //           starts_at,
  //           ends_at,
  //           isactive: true,
  //           plan_id,
  //           payment_id,
  //         });
  //       } else {
  //         // Cancel existing subscription on stripe
  //         await this.MakeSubscribtionCancel(
  //           { body: { user_id } },
  //           new ProxyResponse()
  //         );

  //         subscription = hasSubscription;
  //         subscription.update({
  //           isactive: true,
  //           starts_at,
  //           ends_at,
  //           plan_id,
  //           payment_id,
  //         });
  //       }

  //       if (subscription) {
  //         const company = await Company.findOne({ where: { id: company_id } });
  //         company.update({
  //           subscription_id: subscription.id,
  //           plan_id,
  //           plan_type: plan.name,
  //           last_renewal: starts_at,
  //           expiry_date: ends_at,
  //           //plan_id
  //         });
  //       }

  //       res.status(200).json({
  //         message: "Payment updated successfully",
  //         payment: paymentRow,
  //         subscription,
  //       });
  //     } else {
  //       res.status(400).json({
  //         error: true,
  //         message: "Unable to update payment",
  //       });
  //     }
  //   }

  //   async PaymentCancel(req, res) {
  //     const { order_id, session_id, vendor } = req.query;

  //     const paymentRow = await Payment.findOne({ where: { id: order_id } });

  //     if (paymentRow) {
  //       paymentRow.update({
  //         status: "FAILED",
  //         transaction_id: session_id,
  //         transaction_date: now(),
  //       });
  //       // Save request data as payer information
  //       console.log("Payment success:", paymentRow);

  //       const {
  //         user_id,
  //         company_id,
  //         plan_id,
  //         transaction_payload,
  //         id: payment_id,
  //         transaction_date,
  //       } = paymentRow;
  //       const subscription = await Subscriptions.findOne({
  //         where: { company_id },
  //       });
  //       subscription.update({
  //         isactive: false,
  //         plan_id,
  //         payment_id,
  //       });

  //       res.status(200).json({
  //         message: "Payment updated successfully",
  //         paymentRow,
  //       });
  //     } else {
  //       res.status(400).json({
  //         error: true,
  //         message: "Unable to update payment",
  //       });
  //     }
  //   }

  //   async GetPaymentSubscribed(req, res) {
  //     const { user_id } = req.query;
  //     const user = await User.findOne({ where: { id: user_id } });
  //     const company_id = user.company_id;
  //     const company = await Company.findOne({ where: { id: company_id } });
  //     const subscription_id = company.subscription_id;
  //     const subscription = await Subscriptions.findOne({
  //       where: { id: subscription_id },
  //     });
  //     const payment_id = subscription.payment_id;
  //     const payment = await Payment.findOne({ where: { id: payment_id } });
  //     const stripe = StripeClient(STRIPE_SECRET_KEY);
  //     const session = await stripe.checkout.sessions.retrieve(
  //       payment.transaction_id
  //     );

  //     res.status(200).json({
  //       message: "Payment Session retrived successfully",
  //       session,
  //     });
  //   }

  //   async MakeSubscribtionCancel(req, res) {
  //     const { user_id } = req.body;
  //     const user = await User.findOne({ where: { id: user_id } });
  //     const company_id = user.company_id;
  //     const company = await Company.findOne({ where: { id: company_id } });
  //     const subscription_id = company.subscription_id;
  //     const subscription = await Subscriptions.findOne({
  //       where: { id: subscription_id },
  //     });
  //     const payment_id = subscription.payment_id;
  //     const payment = await Payment.findOne({ where: { id: payment_id } });
  //     const stripe = StripeClient(STRIPE_SECRET_KEY);
  //     const session = await stripe.checkout.sessions.retrieve(
  //       payment.transaction_id
  //     );
  //     const remote_subscription_id = session.subscription;
  //     //const result = await stripe.subscriptions.del(remote_subscription_id);
  //     console.log({ remote_subscription_id, subscription, session, payment });
  //     try {
  //       //const result = await stripe.subscriptions.del(remote_subscription_id);
  //       const result = await stripe.subscriptions.update(remote_subscription_id, {
  //         cancel_at_period_end: true,
  //       });
  //       console.log(result, "result");
  //       res.status(200).json({
  //         message: "Subscription cancelled successfully",
  //         result,
  //       });
  //     } catch (error) {
  //       console.log(error, "error");
  //       res.status(400).json({
  //         error: true,
  //         message: "Unable to cancel subscription",
  //       });
  //     }
  //   }
  // }
}
module.exports = new PaymentController();
//Compare this snippet from amplify/backend/function/user/src/controllers/user.controller.js:
