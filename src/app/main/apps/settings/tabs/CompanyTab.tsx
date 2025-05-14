import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextField from "@mui/material/TextField";
import { Button, Card, CardContent, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FuseLoading from "@fuse/core/FuseLoading";
import { AppDispatch } from "app/store/store";
import {
  selectAccount,
  submitCompanyDetails,
} from "src/app/features/account/accountSlice";
import AuthorityForm from "../tabcomponents/AuthorityForm";
import { useNavigate } from "react-router";
import { sendMembersEmail } from "../apis/Companyapis";
import { toast } from "sonner";

// Zod Schema
const schema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  website: z.string().url("Invalid website URL").optional(),
});

const defaultValues = {
  companyName: null,
  phoneNumber: null,
  website: '',
};

function CompanyTab() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const { user, company, isactive } = useSelector(selectAccount);

  const { control, reset, handleSubmit, formState } = useForm({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, errors } = formState;

  // States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [emailForm, setEmailForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (company) {
      reset({
        companyName: company.Company_Name ?? null,
        phoneNumber: company.phone_number ?? null,
        website: company.website ?? null,
      });
      setIsAuthorized(!!user?.company_id);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [company, reset, user?.company_id]);

  const onSubmit = (formData) => {
    if (!isValid) return;
    dispatch(submitCompanyDetails({ formData }));
    navigate("/apps/settings/plan-billing");
  };

  const handleSend = async () => {
    if (!email) {
      toast.error("Please enter an email address");
    }
    const response = await sendMembersEmail(email)
    console.log("Email sent response:", response);
    if (response.status === 200) {
      toast.success("Email sent successfully");
      navigate("/apps/settings/account");
      setEmail("");
    } else {
      toast.error("Failed to send email");
    }
  }
  const handleCancelClick = () => {
    setEmailForm(false);
    setIsAuthorized(false);
  }

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <FuseLoading />
      </div>
    );
  }

  // Display Email Form if requested
  if (emailForm) {
    return (
      <Card elevation={3} style={{ maxWidth: 500, margin: "auto", padding: "20px" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Authorized Person's Email
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Please provide the authorized person's email address to proceed.
          </Typography>

          <Grid container spacing={2} style={{ marginTop: "16px" }}>
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
              />
            </Grid>

            <Grid item xs={12} container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" onClick={handleSend}>
                  Send
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );

  }

  // Display Authority Form
  if (!isAuthorized) {
    return (
      <AuthorityForm
        emailForm={emailForm}
        setEmailForm={setEmailForm}
        authorizeUser={(value) => setIsAuthorized(value)}
      />
    );
  }

  // Display Main Company Form
  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-32 grid w-full gap-24 sm:grid-cols-1">
          {/* Company Name */}
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
                      <FuseSvgIcon size={20}>heroicons-solid:building-office</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Phone Number */}
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
                      <FuseSvgIcon size={20}>heroicons-solid:phone</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Website */}
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
                      <FuseSvgIcon size={20}>heroicons-solid:globe-alt</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
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
            disabled={!isValid}
          >
            {company?.is_subscribed ? "Update" : "Next"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CompanyTab;