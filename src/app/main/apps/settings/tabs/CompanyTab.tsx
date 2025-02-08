import _ from "lodash";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextField from "@mui/material/TextField";
import { Button, Divider, InputAdornment } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  selectAccount,
  submitCompanyDetails,
} from "src/app/features/account/accountSlice";
import { SettingsCompany } from "../SettingsApi";
import AuthorityForm from "../tabcomponents/AuthorityForm";

// Get the form type of the settings company
type FormType = SettingsCompany;

// Default values for the company
const defaultValues: FormType = {
  companyName: null,
  phone: null,
  website: null,
  policyholderCount: null,
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  companyName: z.string().min(1, "Company Name is required"), //  Company name is required
  phone: z.string().min(1, "Phone number is required"), // Phone number is required
  website: z.string().url("Invalid website URL").optional(), //  Website should be in the format of the url
  policyholderCount: z.number().min(1, "Enter the amount of policyholders"), // Policy holder count is required
});

function CompanyTab() {
  const dispatch = useDispatch(); // declare dispatch

  const { company } = useSelector(selectAccount); // get company from the account

  // Use Form for the company information form
  const { control, reset, handleSubmit, formState } = useForm<FormType>({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState; // unpack the form state

  useEffect(() => {
    if (company) {
      // When there is company information in the redux
      // set the default values for the company form
      reset({
        companyName: company.Company_Name ?? null,
        phone: company.phone_number ?? null,
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
  };

  if (true) return <AuthorityForm />;

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
          {/* Company Name */}
          <div className="sm:col-span-2">
            <Controller
              disabled={!!company}
              control={control}
              name="companyName"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company Name"
                  placeholder="Company Name"
                  id="company-name"
                  variant="outlined"
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
              disabled={!!company}
              name="phone"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  placeholder="Phone"
                  id="phone"
                  variant="outlined"
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
              disabled={!!company}
              name="website"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Website"
                  placeholder="Website"
                  id="website"
                  variant="outlined"
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
              disabled={!!company}
              name="policyholderCount"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Policy Holder Count"
                  placeholder="Number of policyholders"
                  id="policyholder-amount"
                  variant="outlined"
                  type="number"
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
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
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
            disabled={_.isEmpty(dirtyFields) || !isValid}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CompanyTab;
