import _ from "lodash";
import axios from "axios";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Paper, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuthSession } from "@aws-amplify/auth";
import { fetchAccountDetails, selectAccount } from "src/app/features/account/accountSlice";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useEffect, useState } from "react";
import FuseLoading from "@fuse/core/FuseLoading";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { SettingsPlanBilling } from "../SettingsApi";
import CheckoutForm from "../tabcomponents/PlanBillingComponents/CheckoutForm";
import { PlanType } from "../types/PlanTypes.types";
import TextField from "@mui/material/TextField";
import { InputAdornment } from "@mui/material";
import {
  fetchCompanySubscription,
} from "src/app/features/company/companySlice";
import { selectCompanySubscription } from "src/app/features/account/accountSlice";
import { useNavigate } from "react-router";
import { Check } from "@mui/icons-material";
import { AppDispatch } from "app/store/store";
import { fetchPlans, selectPlans, selectPlansLoading } from "../../../../features/plans/plansSlice";
import { any } from "promise";
import ViewPlan from "../tabcomponents/PlanBillingComponents/ViewPlan";
import { toast } from "sonner";
import { is } from "immutable";


type FormType = SettingsPlanBilling;




interface SubscriptionResponse {
  clientSecret: string;
  subscription: any;
}


const defaultValues: FormType = {
  plan_id: null,
  policyholderCount: null,
};


const stripePromise = loadStripe(
  "pk_test_51QVNrHDIv4SXGrBxLk9llPOeoiczwAeRWCINxXbBNNw2Ecr1FTlk4ZasY3wHAZrjDcANw5bJN318FKvXtS2qpJEA00O6QyClPD"
);


function PlanBillingTab() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();


  const { user, company, plan, subscription, isactive } = useSelector(selectAccount);

  //const subscription = useSelector(selectCompanySubscription);
  const plans = useSelector(selectPlans); // Get plans from Redux
  const isPlansLoading = useSelector(selectPlansLoading); // Check if plans are loading
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"update" | "cancel" | "next" | null>(null);



  const schema = z.object({
    policyholderCount: z
      .coerce
      .number()
      .min(1, "Enter the amount of policyholders"),
    plan_id: z.number(),
  });


  const { control, handleSubmit, formState, reset } = useForm<FormType>({
    ...({
      ...defaultValues,
      plan_id: subscription?.plan_id || null,
      policyholderCount: company?.policyholder_count || 0,
    }),
    mode: "all",
    resolver: zodResolver(schema),
  });


  const { isValid, dirtyFields } = formState;


  const [clientSecret, setIsClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);


  const handleEdit = () => {
    setEditMode((prev) => !prev);
  }
  const handleModalOpen = (type: "update" | "cancel" | "next") => {
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setActionType(null);
  };

  const handleModalConfirm = async () => {
    if (actionType === "update") {
      // Call the update API
      handleSubmit(onSubmit)();
    } else if (actionType === "cancel") {
      // Call the cancel API
      await cancelSubscription();
    }
    else if (actionType === "next") {
      // Call the next API
      handleSubmit(onSubmit)();

    }
    handleModalClose();
  };

  const onSubmit = async (formState: FormType) => {
    console.log("formState", formState);

    if (formState.policyholderCount < 1) return
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      const authToken = session.tokens?.accessToken?.toString();


      const requestData = {
        currency_code: "USD",
        company_id: company.id,
        plan_id: formState.plan_id,
        user_id: user.id,
        quantity: formState.policyholderCount,
      };


      console.log("request data 121", { subscription, requestData });


      const response = await axios.post<SubscriptionResponse>(
        `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/${isactive ? "update-subscription" : "create-subscription"}`,
        requestData,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );


      console.log("response", response);
      if (subscription) {
        //navigate("/apps/settings/account");
      }


      const { clientSecret, subscription: subscriptionResponse } = response.data;
      console.log("clientSecret", { clientSecret, subscriptionResponse });

      if (subscriptionResponse?.latest_invoice?.payment_intent?.status === "succeeded") {
        console.log("Payment succeeded");
        toast.success("Payment succeeded");
        dispatch(fetchAccountDetails());
        navigate("/apps/settings/team");
        return;
      }


      setIsClientSecret(clientSecret);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error while fetching client secret", error);
    } finally {
      setIsLoading(false);
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
      if (response.status === 200) {
        toast.success("Subscription cancelled successfully");
      }


      dispatch(fetchCompanySubscription());
    } catch (error) {
      console.error("Error while cancelling", error);
    }
  };


  useEffect(() => {
    if (!isNaN(subscription?.plan_id)) {
      reset({
        plan_id: subscription.plan_id,
        policyholderCount: company?.policyholder_count || 0,
      });
    }
  }, [subscription, reset]);


  useEffect(() => {
    dispatch(fetchCompanySubscription());
    dispatch(fetchPlans()); // Fetch plans when the component loads
  }, []);


  console.log("subscription", { subscription, company });
  console.log("plans", plans);


  console.log("isLoading:", isLoading);
  console.log("isPlansLoading:", isPlansLoading);
  console.log("plans:", plans);
  console.log("plan:", plan);

  if (isLoading || isPlansLoading) // ||!plans
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        loading...
      </div>
    );
  console.log(clientSecret, "clientSecret");


  if (clientSecret)
    return (
      <div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </div>
    );
  console.log(editMode, "editMode");


  if (!editMode && plan) {
    return (
      <ViewPlan handleEdit={handleEdit} />
    );
  }


  if (!plans) {
    return (
      <div>
        <Typography variant="h6" color="textSecondary">
          No plans available. Please try again later.
        </Typography>
      </div>
    );
  }


  return (
    <div>
      {/* Back Button */}
      {/* <div className="absolute left-10 bottom-10 ml-12 mt-12">
       <Button
         variant="contained"
         color="secondary"
         onClick={() => handleEdit()} // Replace with the reverse of handleEdit
       >
         Current Plan
       </Button>
     </div> */}


      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-32 grid w-full gap-16 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="policyholderCount"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Policyholders count"
                  placeholder="Number of policyholders"
                  id="policyholder-count"
                  variant="outlined"
                  type="number"
                  error={!!formState.errors.policyholderCount}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:users
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="mt-32 grid w-full gap-16 sm:grid-cols-3">
          <Controller
            name="plan_id"
            control={control}
            render={({ field }) => (
              <>
                {plans.map(o => ({
                  ...o,
                  label: o.name,
                  details: o.description,
                  price: o.pricing,
                  bulletPoints: o.feature_description.split("\n"),
                })).map((plan) => (
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
            color="secondary"
            onClick={() => handleEdit()} // Replace with the reverse of handleEdit
            disabled={!isactive}
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={(event) => {
              event.preventDefault();
              handleModalOpen("cancel")
            }}
            color="error"
            disabled={user?.role_id !== 1 || !isactive}
          >
            Cancel
          </Button>
          <Button
            variant="contained"

            color="secondary"
            type="submit"
            onClick={(event) => {
              event.preventDefault();
              if (isactive) {
                handleModalOpen("update")
              } else {
                handleModalOpen("next")
              }
            }}
            disabled={!isValid || (isactive && user?.role_id !== 1)}
          >
            {isactive ? "Update" : "Next"}
          </Button>
        </div>
      </form>


      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === "update"
              ? "Are you sure you want to update your subscription?"
              : actionType === "next" ? "Are you sure you want to Purchase this " : "Are you sure you want to cancel your subscription?"}

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="primary">
            No
          </Button>
          <Button onClick={handleModalConfirm} color="secondary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );


}

export default PlanBillingTab;



