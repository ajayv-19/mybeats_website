import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextField from "@mui/material/TextField";
import { Button, Divider, InputAdornment } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FuseLoading from "@fuse/core/FuseLoading";
import { AppDispatch } from "app/store/store";
import {
  selectAccount,
  submitCompanyDetails,
} from "src/app/features/account/accountSlice";
import AuthorityForm from "../tabcomponents/AuthorityForm";
import { useNavigate } from "react-router";

// Define the form schema using Zod
const schema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  website: z.string().url("Invalid website URL").optional(),
  policyholderCount: z.coerce
    .number()
    .min(1, "Enter the amount of policyholders"),
});

// Default form values
const defaultValues = {
  companyName: null,
  phoneNumber: null,
  website: null,
  policyholderCount: null,
};

function CompanyTab() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { company } = useSelector(selectAccount);

  const { control, reset, handleSubmit, formState } = useForm({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  // States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (company) {
      // Populate form fields with company data
      reset({
        companyName: company.Company_Name ?? null,
        phoneNumber: company.phone_number ?? null,
        website: company.website ?? null,
        policyholderCount: company.policyholder_count ?? null,
      });

      // Set authorization state based on subscription status
      setIsAuthorized(!!company.is_subscribed);
      setLoading(false); // Stop loading once data is fetched
    } else {
      setLoading(false); // Stop loading even if no company data is available
    }
  }, [company, reset]);

  const onSubmit = (formData) => {
    if (!isValid) {
      return; // Prevent submission if the form is invalid
    }

    dispatch(submitCompanyDetails({ formData }));
    navigate("/apps/settings/plan-billing");
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <FuseLoading />
      </div>
    );
  }

  // Show AuthorityForm if the user is not authorized
  if (!isAuthorized) {
    return (
      <AuthorityForm
        authorizeUser={(isAuthorized) => {
          setIsAuthorized(isAuthorized);
        }}
      />
    );
  }

  // Show the main form if the user is authorized
  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
          {/* Company Name */}
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="companyName"
              render={({ field }) => (
                <TextField
                  {...field}
                  disabled={company?.is_subscribed}
                  label="Company Name"
                  placeholder="Company Name"
                  id="company-name"
                  variant="outlined"
                  error={!!errors.companyName}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:building-office
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>

          {/* Phone Number */}
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  placeholder="Phone"
                  id="phone"
                  variant="outlined"
                  type="number"
                  error={!!errors.phoneNumber}
                  required
                  fullWidth
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
        </div>

        <div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
          {/* Website */}
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="website"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Website"
                  placeholder="Website"
                  id="website"
                  variant="outlined"
                  error={!!errors.website}
                  required
                  fullWidth
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

          {/* Policy Holder Count */}
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="policyholderCount"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Policy Holder Count"
                  placeholder="Number of policyholders"
                  id="policyholder-count"
                  variant="outlined"
                  type="number"
                  error={!!errors.policyholderCount}
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

        <Divider className="mb-40 mt-44 border-t" />

        {/* Form Buttons */}
        <div className="flex items-center justify-end space-x-8">
          <Button variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={!isValid} // Disable button if form is invalid or no fields are dirty
          >
            {company?.is_subscribed ? "Update" : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CompanyTab;