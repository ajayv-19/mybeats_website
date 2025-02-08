import _ from "lodash";
import axios from "axios";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Divider, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { fetchAuthSession } from "@aws-amplify/auth";
import { selectAccount } from "src/app/features/account/accountSlice";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useState } from "react";
import FuseLoading from "@fuse/core/FuseLoading";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { SettingsPlanBilling } from "../SettingsApi";
import CheckoutForm from "../tabcomponents/PlanBillingComponents/CheckoutForm";
import { PlanType } from "../types/PlanTypes.types";
import { useDispatch } from "react-redux";
import { initiateSubscription } from "src/app/features/payment/paymentSlice";
import { AppDispatch } from "app/store/store";

type FormType = SettingsPlanBilling;

const PLANS: Array<PlanType> = [
  {
    id: 1,
    value: "free",
    label: "Free",
    details: "Monthly Starter Plan",
    price: 0,
  },
  {
    id: 2,
    value: "silver",
    label: "Silver",
    details: "Monthly Plan for Small to Mid-sized Companies",
    price: 0.99,
  },
  {
    id: 3,
    value: "gold",
    label: "Gold",
    details: "Monthly Plan for Large Companies",
    price: 1.99,
  },
];

interface SubscriptionResponse {
  clientSecret: string;
}

const defaultValues: FormType = {
  plan: null,
};

const stripePromise = loadStripe(
  "pk_test_51QVNrHDIv4SXGrBxLk9llPOeoiczwAeRWCINxXbBNNw2Ecr1FTlk4ZasY3wHAZrjDcANw5bJN318FKvXtS2qpJEA00O6QyClPD"
);

function PlanBillingTab() {
  const dispatch = useDispatch<AppDispatch>();

  const { user, company } = useSelector(selectAccount);

  const schema = z.object({
    plan: z.number(), // ✅ Store `plan_id` (number) instead of `value` (string)
  });

  const { control, handleSubmit, formState } = useForm<FormType>({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields } = formState;

  const [clientSecret, setIsClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formState: FormType) => {
    dispatch(initiateSubscription());

    // try {
    //   setIsLoading(true);
    //   const session = await fetchAuthSession();
    //   const authToken = session.tokens?.accessToken?.toString();

    //   const requestData = {
    //     currency_code: "USD",
    //     company_id: company.id,
    //     plan_id: formState.plan,
    //     user_id: user.id,
    //   };

    //   const response = await axios.post<SubscriptionResponse>(
    //     "https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/create-subscription",
    //     requestData,
    //     {
    //       headers: {
    //         Authorization: authToken,
    //       },
    //     },
    //   );

    //   const { clientSecret } = response.data;

    //   setIsClientSecret(clientSecret);
    //   setIsLoading(false);
    // } catch (error) {
    //   setIsLoading(false);
    //   console.error("Error while fetching client secret", error);
    // }
  };

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
          <div className="sm:col-span-3">
            <Alert severity="info">
              Changing the plan will take effect immediately. You will be
              charged for the rest of the current month.
            </Alert>
          </div>
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
                    <div className="flex-auto" />
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
                  </Paper>
                ))}
              </>
            )}
          />
        </div>

        <Divider className="mb-40 mt-44 border-t" />
        <div className="flex items-center justify-end space-x-8">
          <Button variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={_.isEmpty(dirtyFields) || !isValid}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PlanBillingTab;
