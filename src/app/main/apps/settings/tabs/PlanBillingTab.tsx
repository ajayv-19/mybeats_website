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
import ViewPlan from "../tabcomponents/PlanBillingComponents/ViewPlan";
import ModelContents from "../tabcomponents/PlanBillingComponents/modelcontent";
import { toast } from "sonner";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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

  const ModelContent = ModelContents[actionType];

  if (isLoading || isPlansLoading) // ||!plans
    return (
      <div className="flex justify-center items-center h-full">
        <FuseLoading />
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
      <ViewPlan handleEdit={handleEdit} stripePromise={stripePromise} />
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
                    key={plan.id}
                    elevation={3}
                    className={`flex flex-col justify-between p-8 rounded-2xl shadow-md h-full ${Number(field.value) === plan.id
                      ? "border-2 border-orange-500"
                      : "border border-gray-200"
                      }`}
                    sx={{ minHeight: 400, display: "flex", flexDirection: "column" }}
                  >
                    {/* Header */}
                    <div className="text-center">
                      <Typography className="font-semibold text-lg">
                        {plan.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="mt-1">
                        {plan.details}
                      </Typography>

                      {/* Price */}
                      <Typography variant="h4" className="my-4 font-bold">
                        {plan.price.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}{" "}
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.secondary"
                        >
                          / Policyholder
                        </Typography>
                      </Typography>

                      <div className="w-full border-t border-gray-300 my-4" />
                    </div>

                    {/* Features */}
                    <div className="flex-1">
                      {plan.bulletPoints.map((point, index) => (
                        <div className="flex items-start gap-2 mb-2" key={index}>
                          <span className="text-orange-500 font-bold pt-1">✔</span>
                          <Typography variant="body2">{point}</Typography>
                        </div>
                      ))}
                    </div>

                    {/* Select Button */}
                    <div className="mt-8 text-center">
                      <Button

                        variant="contained"
                        color="secondary"
                        onClick={() => field.onChange(plan.id)}
                      >
                        Select
                      </Button>
                    </div>
                  </Paper>
                ))}
              </>
            )}
          />
        </div>


        <Divider className="mb-40 mt-44 border-t" />

        <div className="flex items-center justify-between space-x-8">
          <div>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleEdit()} // Replace with the reverse of handleEdit
              disabled={!isactive}
            >
              Back
            </Button>
          </div>

          <div className="space-x-6">
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

        </div>
      </form>


      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {ModelContent && <ModelContent data={{ user, company, plan, subscription, isactive, control, plans }} />}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="primary" variant="contained">
            No
          </Button>
          <Button onClick={handleModalConfirm} color="primary" autoFocus variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );


}

export default PlanBillingTab;



