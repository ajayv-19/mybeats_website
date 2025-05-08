import _ from "lodash";
import axios from "axios";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Divider, Paper, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuthSession } from "@aws-amplify/auth";
import { selectAccount } from "src/app/features/account/accountSlice";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useEffect, useState } from "react";
import FuseLoading from "@fuse/core/FuseLoading";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { SettingsPlanBilling } from "../SettingsApi";
import CheckoutForm from "../tabcomponents/PlanBillingComponents/CheckoutForm";
import { PlanType } from "../types/PlanTypes.types";
import {
  fetchCompanySubscription,
  selectCompanySubscription,
} from "src/app/features/company/companySlice";
import { useNavigate } from "react-router";
import { Check } from "@mui/icons-material";
import { AppDispatch } from "app/store/store";

type FormType = SettingsPlanBilling;

const PLANS: Array<PlanType> = [
  {
    id: 4,
    value: "free",
    label: "Bronze",
    details: "Monthly Starter Plan",
    price: 0.99,
    bulletPoints: [
      "Access to basic features",
      "Dashboard tutorials",
      "One business account",
    ],
  },
  {
    id: 2,
    value: "silver",
    label: "Silver",
    details: "Monthly Plan for Mid-sized Companies",
    price: 1.99,
    bulletPoints: [
      "Access to advanced features",
      "Historical data trends",
      "Report generation",
      "Free training for dashboard",
      "Customer Support Via Email",
      "Five business accounts",
    ],
  },
  {
    id: 3,
    value: "gold",
    label: "Gold",
    details: "Monthly Plan for Large Companies",
    price: 2.99,
    bulletPoints: [
      "Integration of FINN - AI Agent",
      "Access to advanced features",
      "Historical data trends",
      "Advanced reporting",
      "Periodic free training for dashboard",
      "Dedicated representative for support",
      "Ten business accounts",
    ],
  },
];

interface SubscriptionResponse {
  clientSecret: string;
  subscription: any;
}

const defaultValues: FormType = {
  plan: null,
};

const stripePromise = loadStripe(
  "pk_test_51QVNrHDIv4SXGrBxLk9llPOeoiczwAeRWCINxXbBNNw2Ecr1FTlk4ZasY3wHAZrjDcANw5bJN318FKvXtS2qpJEA00O6QyClPD"
);

function PlanBillingTab() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, company } = useSelector(selectAccount);
  const subscription = useSelector(selectCompanySubscription);

  const schema = z.object({
    plan: z.number(), // ✅ Store `plan_id` (number) instead of `value` (string)
  });

  const { control, handleSubmit, formState, reset } = useForm<FormType>({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields } = formState;

  const [clientSecret, setIsClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formState: FormType) => {
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      const authToken = session.tokens?.accessToken?.toString();

      const requestData = {
        currency_code: "USD",
        company_id: company.id,
        plan_id: formState.plan,
        user_id: user.id,
      };

      console.log("request data 121",{ subscription, requestData});

      const response = await axios.post<SubscriptionResponse>(
        `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/${subscription ? "update-subscription" : "create-subscription"}`,
        requestData,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      if (subscription) {
        //navigate("/apps/settings/account");
      }

      const { clientSecret, subscription: subscriptionResponse  } = response.data;
      if(subscriptionResponse?.latest_invoice?.payment_intent?.status === "succeeded") {
        navigate("/apps/settings/account");
        return;
      }

      setIsClientSecret(clientSecret);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error while fetching client secret", error);
    }
  };

  const cancelSubscription = async () => {
    try {
      const session = await fetchAuthSession();
      const authToken = session.tokens?.accessToken?.toString();
      const response = await axios.post(
        "https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/cancel-subscription",
        {
          user_id: user?.id,
        },
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      dispatch(fetchCompanySubscription());
    } catch (error) {
      console.error("Error while cancelling", error);
    }
  };

  useEffect(() => {
    if (subscription?.plan_id) {
      reset({
        plan: subscription.plan_id,
      });
    }
  }, [subscription, reset]);

  useEffect(() => {
    dispatch(fetchCompanySubscription());
  }, []);

  console.log("subscription", subscription);

  if (isLoading)
    return (
      <div>
        <FuseLoading />
      </div>
    );

  if (clientSecret)
    return (
      <div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </div>
    );

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-32 grid w-full gap-16 sm:grid-cols-3">
          <Controller
            name="plan"
            control={control}
            render={({ field }) => (
              <>
                {PLANS.map((plan) => (
                  <Paper
                    sx={{
                      "&.selected": {
                        border: (theme) =>
                          `3px solid ${theme.palette.secondary.main}`,
                      },
                    }}
                    className="flex flex-1 cursor-pointer flex-col items-start justify-start rounded-md p-24 border-3 border-transparent relative"
                    onClick={() => field.onChange(plan.id)} // ✅ Store `plan.id` instead of `plan.value`
                    key={plan.id} // ✅ Key should also be based on `id`
                  >
                    {Number(field.value) === plan.id && ( // ✅ Compare using `plan.id`
                      <FuseSvgIcon
                        className="absolute right-0 top-0 mr-12 mt-12"
                        size={24}
                        color="secondary"
                      >
                        heroicons-solid:check-circle
                      </FuseSvgIcon>
                    )}
                    <Typography className="font-semibold uppercase">
                      {plan.label}
                    </Typography>
                    <Typography className="mt-4" color="text.secondary">
                      {plan.details}
                    </Typography>
                    {/* <div className="flex-auto" /> */}
                    <div className="flex items-end mt-8 text-lg">
                      <Typography>
                        {plan.price.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </Typography>
                      <Typography color="text.secondary">
                        {" "}
                        / policyholder
                      </Typography>
                    </div>

                    <div className="mt-32">
                      {plan.bulletPoints.map((point) => (
                        <div className="flex gap-4">
                          <Check />
                          <Typography>{point}</Typography>
                        </div>
                      ))}
                    </div>
                  </Paper>
                ))}
              </>
            )}
          />
        </div>

        <Divider className="mb-40 mt-44 border-t" />
        <div className="flex items-center justify-end space-x-8">
          <Button
            variant="contained"
            onClick={cancelSubscription}
            color="error"
            disabled={user?.role_id !== 1}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            // disabled={_.isEmpty(dirtyFields) || !isValid}
          >
            {user?.role_id === 1 ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PlanBillingTab;
