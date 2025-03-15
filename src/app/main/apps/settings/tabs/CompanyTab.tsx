import _ from "lodash";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextField from "@mui/material/TextField";
import { Button, Divider, InputAdornment } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { AppDispatch } from "app/store/store";
import {
  selectAccount,
  submitCompanyDetails,
} from "src/app/features/account/accountSlice";
import { setCompanyDataLocally } from "src/app/features/company/companySlice";
import AuthorityForm from "../tabcomponents/AuthorityForm";
import { CompanyFormInput } from "../types/CompanyTypes.types";
import { useNavigate } from "react-router";

// Get the form type of the settings company
type FormType = CompanyFormInput;

// Default values for the company
const defaultValues: FormType = {
  companyName: null,
  phoneNumber: null,
  website: null,
  policyholderCount: null,
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  companyName: z.string().min(1, "Company Name is required"), //  Company name is required
  phoneNumber: z
    .string()
    .min(1, "Phone number is required") // Phone number is required
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"), // Ensure phone number is exactly 10 digits
  website: z.string().url("Invalid website URL").optional(), //  Website should be in the format of the url
  policyholderCount: z.coerce
    .number()
    .min(1, "Enter the amount of policyholders"), // Policy Holder count should be greater than 1
});

function CompanyTab() {
  const dispatch = useDispatch<AppDispatch>(); // declare dispatch
  const navigate = useNavigate();

  const { company, user } = useSelector(selectAccount); // get company from the account

  // Use Form for the company information form
  const { control, reset, handleSubmit, formState } = useForm<FormType>({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState; // unpack the form state

  // STATES
  const [userIsAuthorized, setUserIsAuthorized] = useState(!!company);

  useEffect(() => {
    if (company) {
      // When there is company information in the redux
      // set the default values for the company form
      reset({
        companyName: company.Company_Name ?? null,
        phoneNumber: company.phone_number ?? null,
        website: company.website ?? null,
        policyholderCount: company.policyholder_count ?? null,
      });
    }
  }, [company, reset]); // Trigger reset whenever `company` data changes

  /**
   * Handling submission of the company form
   * @param formData
   */
  const onSubmit = (formData: FormType) => {
    dispatch(submitCompanyDetails({ formData }));
    navigate("/apps/settings/plan-billing");
  };

  // If user is not authorized to see the company form
  // Show them the Authority Form
  if (!userIsAuthorized)
    return (
      <AuthorityForm
        authorizeUser={(isAuthorized) => setUserIsAuthorized(isAuthorized)}
      />
    );

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
          {/* Company Name */}
          <div className="sm:col-span-2">
            <Controller
              // disabled={!!company}
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
              // disabled={!!company}
              name="phoneNumber"
              render={({ field }) => (
                <TextField
                  {...field}
                  // disabled={
                  //   !company?.is_subscribed ||
                  //   (company?.is_subscribed && user.role_id !== 1)
                  // }
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
          {/* Website of the company */}
          <div className="sm:col-span-2">
            <Controller
              control={control}
              // disabled={
              //   !company?.is_subscribed ||
              //   (company?.is_subscribed && user.role_id !== 1)
              // }
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
              // disabled={
              //   !company?.is_subscribed ||
              //   (company?.is_subscribed && user.role_id !== 1)
              // }
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
                          heroicons-solid:envelope
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

        {/* Form Buttons  */}
        <div className="flex items-center justify-end space-x-8">
          <Button variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            // disabled={_.isEmpty(dirtyFields) || !isValid}
          >
            {user?.role_id === 1 ? "Update" : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CompanyTab;
