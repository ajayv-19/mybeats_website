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
  UserInvites,
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

    console.log("existing customers", existingCustomers[0]);

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
      metadata, // ✅ Extract metadata dynamically from Stripe event
    } = customer_subscription_created;

    // Ensure metadata exists before using it
    const company_id = metadata?.company_id
      ? Number(metadata.company_id)
      : null;
    const plan_id = metadata?.plan_id ? Number(metadata.plan_id) : null;
    const user_id = metadata?.user_id ? Number(metadata.user_id) : null;
    const policyholders_count = metadata?.policyholders_count ? Number(metadata.policyholders_count) : null;

    const company = await Company.findByPk(company_id);
    company.update({
      is_subscribed: true,
      license_used: company.license_used == 0 ? 1 : company.license_used,
      number_of_admins: company.number_of_admins == 0 ? 1 : company.number_of_admins,
      policyholder_count: policyholders_count,
    });
    const user = await User.findByPk(user_id);
    user.update({ role_id: 1 });

    // Create a new row in the NewSubscriptions table
    const newSubscription = await NewSubscriptions.create({
      sub_id,
      user_id, //: metadata.user_id || null, // If user_id exists, store it; otherwise, keep it NULL
      company_id, //: metadata.company_id,
      plan_id,
      amount: plan.amount / 100, // Convert cents to dollars (Stripe sends amounts in cents)
      bill_start: new Date(current_period_start * 1000), // Convert Unix timestamp to Date
      bill_end: new Date(current_period_end * 1000), // Convert Unix timestamp to Date
      status: status.toUpperCase(), // Normalize status
    });
    company.update({ subscription_id: newSubscription.id });
    company.update({ plan_id: plan_id });

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

    console.log("🔄 Subscription updated:", subscription);


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

    // Get plan_id from subscription metadata
    const plan_id = subscription.metadata.plan_id;
    const policyholder_count = subscription.metadata.policyholders_count;
    const company_id = subscription.metadata.company_id;
    const company = await Company.findByPk(company_id);
    company.update({ plan_id: plan_id });
    company.update({ policyholder_count: policyholder_count });


    console.log("📊 Updating DB with new values:", {
      newQuantity,
      newAmount,
      plan_id,
    });

    // Update database with all values including plan_id
    await existingSubscription.update({
      amount: newAmount,
      bill_end: new Date(subscription.current_period_end * 1000),
      plan_id: plan_id,
    });

    console.log("✅ Subscription updated in database with new plan.");
  } catch (error) {
    console.error("❌ Error handling subscription update:", error);
    // You might want to add additional error handling here
    throw error; // Re-throw if you want to handle it in the calling function
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

const pauseSubscription = async () => { };

const removeAccessQ = async () => { };

class PaymentController {
  setupRoutes(router) {
    router.post("/create-subscription", (...arg) =>
      this.CreateSubscription(...arg)
    );
    router.post("/update-subscription", (...arg) =>
      this.UpdateSubscription(...arg)
    );
    router.post("/cancel-subscription", (...arg) =>
      this.CancelSubscription(...arg)
    );
    router.post("/webhook", (...arg) => this.HandleStripeEvent(...arg));

    router.post("/create-setup-intent", (...arg) =>
      this.CreateSetupIntent(...arg)
    );
    router.post("/update-payment-methods", (...arg) =>
      this.UpdatePaymentMethods(...arg)
    );
    router.post("/update-default-payment-method", (...arg) =>
      this.UpdateDefaultPaymentMethod(...arg)
    );
    router.post("/getplans", (...arg) =>
      this.GetAllPlans(...arg)
    );
  }

  async HandleStripeEvent(req, res) {
    try {
      const event = req.body;

      // Handle the event
      switch (event.type) {
        // When a subscription is created for a customer for a customer
        // Add a row to the subscription table with status active
        // Update the payment row's status from active to succesfull
        case "customer.subscription.created": //get company subscrited true
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
        case "invoice.payment_failed": //get company subscrited false
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

  async CreateSetupIntent(req, res) {
    try {
      const { email } = req.body; // Get customer email from frontend
      const stripe = StripeClient(STRIPE_SECRET_KEY);

      const customer = await getCustomerDetails(email);

      // Create a SetupIntent
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ["card", "us_bank_account"], // Supports card payments
      });

      res.json({ clientSecret: setupIntent.client_secret, customer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async UpdatePaymentMethods(req, res) {
    try {
      const { customerId, paymentMethodId, subscriptionId } = req.body;
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      if (!customerId || !paymentMethodId || !subscriptionId) {
        return res.status(400).json({ error: 'Missing required parameters.' });
      }

      // 1. Attach the payment method to the customer (if not already attached)
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // 2. Set the default payment method for the customer
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // 3. Update the subscription to use the new payment method
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
      });

      console.log('✅ Updated subscription with new payment method');

      return res.status(200).json({
        success: true,
        message: 'Payment method updated successfully.',
        subscription: updatedSubscription,
      });
    } catch (error) {
      console.error('❌ Error in updating payment method:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async UpdateSubscription(req, res) {
    try {
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      const company_extract = await Company.findOne({ where: { id: req.body.company_id } });
      const { company_id, plan_id, user_id, quantity = company_extract.policyholder_count } = req.body;

      if (!user_id || !plan_id || !company_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const [user, plan, company] = await Promise.all([
        User.findOne({ where: { id: user_id } }),
        Plans.findOne({ where: { id: plan_id } }),
        Company.findOne({ where: { id: company_id } }),
      ]);

      if (!user || !plan || !company) {
        return res.status(400).json({ error: "Invalid user, plan, or company" });
      }

      const customer = await getCustomerDetails(user.email);

      const existingSubscriptions = await stripe.subscriptions.list({
        limit: 1,
        customer: customer.id,
        status: "active",
      });

      if (existingSubscriptions.data.length === 0) {
        return res.status(404).json({ error: "No active subscription found for customer " + customer.id });
      }

      const currentSubscription = existingSubscriptions.data[0];
      if (company.policyholder_count != quantity) {
        company.update({ policyholder_count: quantity });
      }
      const subscriptionUpdateParams = {
        items: [{
          id: currentSubscription.items.data[0].id,
          price: plan.price_id,
          quantity: quantity || company.policyholder_count,
        }],
        proration_behavior: "create_prorations",
        proration_date: Math.floor(Date.now() / 1000),
        payment_behavior: "allow_incomplete",
        payment_settings: {
          payment_method_types: ["card"],
        },
        metadata: {
          user_id,
          company_id,
          plan_id,
          updated_at: new Date().toISOString(),
          policyholders_count: quantity,
        },
        expand: ["latest_invoice.payment_intent"],
      };
      //Company.update({ plan_id: plan_id });
      //Company.update({ policyholder_count: quantity });
      const updatedSubscription = await stripe.subscriptions.update(
        currentSubscription.id,
        subscriptionUpdateParams
      );

      const paymentIntentClientSecret = updatedSubscription.latest_invoice?.payment_intent?.client_secret;

      res.status(200).json({
        message: "Subscription updated with proration. Confirm payment client-side.",
        subscription: updatedSubscription,
        clientSecret: paymentIntentClientSecret,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({
        error: "Unable to update subscription",
        details: error.message,
      });
    }
  }

  async UpdateDefaultPaymentMethod(req, res) {
    try {
      const { email, payment_method_id } = req.body;
      const stripe = StripeClient(STRIPE_SECRET_KEY);

      const customer = await getCustomerDetails(email);

      // Update the default payment method for the customer
      const updatedCustomer = await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: payment_method_id,
        },
      });

      res.status(200).json({
        message: "Default payment method updated successfully",
        customer: updatedCustomer,
      });
    } catch (error) {
      console.error("Error updating default payment method:", error);
      res.status(500).json({ error: "Unable to update default payment method" });
    }
  }



  // Create Subscription route
  async CreateSubscription(req, res) {
    try {
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      const {
        currency_code = "USD",
        company_id,
        quantity,
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
            quantity: quantity, // The company is going to subscribe for the policyholders that they have
          },
        ],
        metadata: {
          policyholders_count: quantity,
          user_id,
          company_id,
          plan_id,
        },
        payment_behavior: "default_incomplete",

        payment_settings: {
          payment_method_types: ["card", "us_bank_account"],
        },
        expand: ["latest_invoice.payment_intent"],
      });
      console.log("subscription", subscription);
      res.status(200).json({
        message: "Subscription initiated successfully",
        clientSecret: subscription?.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Unable to create subscription" });
    }
  }

  async CancelSubscription(req, res) {
    try {
      const stripe = StripeClient(STRIPE_SECRET_KEY);
      const { user_id } = req.body;

      // Validate required input
      if (!user_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Fetch user details
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        return res.status(400).json({ error: "Invalid user" });
      }

      // Find the active subscription in your database
      const activeSubscription = await NewSubscriptions.findOne({
        where: { user_id, status: "ACTIVE" },
      });

      if (!activeSubscription) {
        return res.status(404).json({ error: "No active subscription found" });
      }

      // Cancel the subscription in Stripe
      const canceledSubscription = await stripe.subscriptions.update(
        activeSubscription.sub_id,
        {
          cancel_at_period_end: true,
        }
      );

      // Update the subscription status in the database
      await NewSubscriptions.update(
        { status: "CANCELED", plan_id: -1 },
        { where: { id: activeSubscription.id } }
      );

      res.status(200).json({
        message: "Subscription canceled successfully",
        subscription: canceledSubscription,
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ error: "Unable to cancel subscription" });
    }
  }

  GetAllPlans = async (req, res) => {
    try {
      // Fetch all plans from the database
      const plans = await Plans.findAll();

      // Return the plans as a response
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error("Error fetching plans:", error);

      // Return an error response
      res.status(500).json({
        success: false,
        message: "Failed to fetch plans",
        error: error.message,
      });
    }
  };
}
module.exports = new PaymentController();
// 28 april 2025
