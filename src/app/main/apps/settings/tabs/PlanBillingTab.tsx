import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import _ from "@lodash";
import clsx from "clsx";
import Paper from "@mui/material/Paper";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";

import { useEffect, useState } from "react";
import {
  SettingsPlanBilling,
  useGetPlanBillingSettingsQuery,
  useUpdatePlanBillingSettingsMutation,
} from "../SettingsApi";
import { fetchProfileData } from "src/app/backendServices/ProfileServices";
import CompanyRegisterDialog from "../tabcomponents/plancomponts/RegisterCompanyPopUp";
import UserInvitationDialog from "../tabcomponents/plancomponts/ShareorCancle";
import { useNavigate } from "react-router";

type FormType = {
  plan?: string;
  cardHolder?: string;
  cardNumber?: string;
  cardExpiration?: string;
  cardCVC?: string;
  country?: string;
  zip?: string;
  Company_Name: string;
  domain: string;
  website: string;
  phone: number;
};

const plans = [
  {
    value: "basic",
    label: "Basic",
    details: "Starter plan for individuals.",
    price: 9,
  },
  {
    value: "team",
    label: "Team",
    details: "Collaborate up to 10 people.",
    price: 29,
  },
  {
    value: "enterprise",
    label: "Enterprise",
    details: "For bigger businesses.",
    price: 99,
  },
];

const defaultValues: FormType = {
  plan: "team",
  cardHolder: "",
  cardNumber: "",
  cardExpiration: "",
  cardCVC: "",
  country: "",
  zip: "",

  Company_Name: "",

  domain: "",
  website: "",
  phone: 0,
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  plan: z.enum(["basic", "team", "enterprise"]),
  cardHolder: z.string(),
  cardNumber: z.string(),
  cardExpiration: z.string(),
  cardCVC: z.string(),
  country: z.string(),
  zip: z.string(),
  phone: z.number(),
});

function PlanBillingTab() {
  const { data: planBillingSettings } = useGetPlanBillingSettingsQuery();
  const [updatePlanBillingSettings] = useUpdatePlanBillingSettingsMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [companyExist, setCompanyExists] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [userInvitation, setUserInvitation] = useState(false);

  const { control, reset, handleSubmit, formState } = useForm<FormType>({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });
  const [company, setCompany] = useState<FormType>();
  const { isValid, dirtyFields, errors } = formState;

  const fetchCompanyData = async () => {
    try {
      const getUserData = await fetchProfileData();
      console.log(getUserData, "getUserData");

      if (getUserData.status === 200) {
        const companyData = getUserData.data.userdata.company;
        if (!companyData) {
          setCompanyExists(false);
          setDialogOpen(true);
        } else {
          setCompanyExists(true);
          setShowSubscriptionForm(true);
        }
        setCompany(companyData);
        reset(companyData); // Reset form values with fetched user data
        console.log(companyData, "companyData");
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCompanyData();
  }, [reset]);

  useEffect(() => {
    reset(planBillingSettings);
  }, [planBillingSettings, reset]);

  /**
   * Form Submit
   */
  function onSubmit(formData: FormType) {
    updatePlanBillingSettings(formData);
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogYes = () => {
    setDialogOpen(false);
    setShowSubscriptionForm(true);
    console.log("clickedTrue");

    // Handle the logic for registering the company
  };

  const handleDialogNo = () => {
    setDialogOpen(false);
    setUserInvitation(true);
    // Handle the logic for not registering the company
  };

  const handleBack = () => {
    setUserInvitation(false);
    setDialogOpen(true);
  };
  const navigate = useNavigate();
  const handlecancle = () => {
    // navigate(`${window.origin}/dashboards/project`);
    navigate(`/apps/settings/account`);
  };
  return (
    <div className="w-full max-w-3xl">
      <CompanyRegisterDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onYes={handleDialogYes}
        onNo={handleDialogNo}
      />
      {userInvitation && (
        <UserInvitationDialog
          open={userInvitation}
          onClose={() => setUserInvitation(false)}
          onShare={() => console.log("Share")}
          onCancel={() => handlecancle()}
          onBack={() => handleBack()}
        />
      )}

      {showSubscriptionForm && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="my-40 border-t">
            <div className="w-full">
              <Typography className="text-xl">Select your plan</Typography>
              {/* <Typography color="text.secondary">
              Upgrade or downgrade your current plan.
            </Typography> */}
            </div>
          </div>
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
                  {plans.map((plan) => (
                    <Paper
                      sx={{
                        "&.selected": {
                          border: (theme) =>
                            `3px solid ${theme.palette.secondary.main}`,
                        },
                      }}
                      className={clsx(
                        " flex flex-1 cursor-pointer flex-col items-start justify-start rounded-md p-24 border-3 border-transparent relative",
                        field.value === plan.value ? "selected" : ""
                      )}
                      onClick={() => field.onChange(plan.value)}
                      key={plan.value}
                    >
                      {field.value === plan.value && (
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
                        <Typography color="text.secondary"> / month</Typography>
                      </div>
                    </Paper>
                  ))}
                </>
              )}
            />
          </div>

          <div>
            <div className="my-40 border-t" />
            <div className="w-full">
              <Typography className="text-xl">Company Information</Typography>
              {/* <Typography color="text.secondary">
              Communication details in case we want to connect with you. These
              will be kept private.
            </Typography> */}
            </div>
            <div className="grid w-full gap-24 sm:grid-cols-4 mt-32">
              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="Company_Name"
                  render={({ field }) => (
                    <TextField
                      className=""
                      {...field}
                      label="Company Name"
                      placeholder="Company Name"
                      disabled={companyExist}
                      id="Company_Name"
                      error={!!errors.Company_Name}
                      helperText={errors?.Company_Name?.message}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FuseSvgIcon size={20}>
                              heroicons-solid:building-office-2
                            </FuseSvgIcon>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone Number"
                      placeholder="Phone Number"
                      disabled={companyExist}
                      variant="outlined"
                      fullWidth
                      type="number"
                      //error={!!errors.phone}
                      // helperText={errors?.phone?.message}
                      helperText="Should be a valid 10 digit phone number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FuseSvgIcon size={20}>
                              heroicons-solid:phone
                            </FuseSvgIcon>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="website"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Website"
                      placeholder="Website"
                      disabled={companyExist}
                      variant="outlined"
                      fullWidth
                      error={!!errors.website}
                      helperText={errors?.website?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FuseSvgIcon size={20}>
                              heroicons-solid:globe-alt
                            </FuseSvgIcon>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="domain"
                  render={({ field }) => (
                    <TextField
                      className=""
                      {...field}
                      label="Email domain"
                      placeholder="Email domain"
                      disabled={companyExist}
                      id="domain"
                      error={!!errors.domain}
                      helperText={errors?.domain?.message}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FuseSvgIcon size={20}>
                              heroicons-solid:briefcase
                            </FuseSvgIcon>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* <div className="mb-40 mt-48 border-t" />
        <div className="w-full">
          <Typography className="text-xl">Payment Details</Typography>
          <Typography color="text.secondary">
            Update your billing information. Make sure to set your location
            correctly as it could affect your tax rates.
          </Typography>
        </div>
        <div className="mt-32 grid w-full grid-cols-4 gap-24">
          <div className="col-span-4">
            <Controller
              control={control}
              name="cardHolder"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Card holder"
                  placeholder="Card holder"
                  id="cardHolder"
                  error={!!errors.cardHolder}
                  helperText={errors?.cardHolder?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:user-circle
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Controller
              control={control}
              name="cardNumber"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Card number"
                  placeholder="Card number"
                  id="cardNumber"
                  error={!!errors.cardNumber}
                  helperText={errors?.cardNumber?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:credit-card
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Controller
              control={control}
              name="cardExpiration"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Expiration date"
                  placeholder="MM / YY"
                  id="cardExpiration"
                  error={!!errors.cardExpiration}
                  helperText={errors?.cardExpiration?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:credit-card
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Controller
              control={control}
              name="cardCVC"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CVC / CVC2"
                  placeholder="CVC / CVC2"
                  id="cardCVC"
                  error={!!errors.cardCVC}
                  helperText={errors?.cardCVC?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:lock-closed
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Country"
                  placeholder="County"
                  id="country"
                  error={!!errors.country}
                  helperText={errors?.country?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>heroicons-solid:map</FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <Controller
              control={control}
              name="zip"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ZIP / Postal code"
                  placeholder="ZIP / Postal code"
                  id="zip"
                  error={!!errors.zip}
                  helperText={errors?.zip?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:hashtag
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div> */}

          <Divider className="mb-40 mt-44 border-t" />

          <div className="flex items-center justify-end space-x-8">
            <Button
              variant="outlined"
              disabled={_.isEmpty(dirtyFields)}
              onClick={() => reset(planBillingSettings)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              disabled={_.isEmpty(dirtyFields) || !isValid}
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PlanBillingTab;
