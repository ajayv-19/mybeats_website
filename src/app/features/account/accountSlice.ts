/* eslint import/no-extraneous-dependencies: off */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "app/store/store";
import _ from "@lodash";
import { uploadData } from "@aws-amplify/storage";
import { addOrUpdateUser } from "src/app/main/apps/settings/apis/Accountapis";
import { fetchAuthSession } from "@aws-amplify/auth";
import axios from "axios";
import { CompanyFormInput } from "src/app/main/apps/settings/types/CompanyTypes.types";
import { toast } from "sonner";

type UserDetails = {
  id?: number;
  Customer_Name?: string;
  email?: string;
  image?: string;
  role_id?: number;
  company_id?: string;
};

type CompanyDetails = {
  id?: number;
  Company_Name: string;
  domain: string;
  phone_number: number;
  website?: string;
  is_subscribed?: boolean;
  plan_type: string;
  address: string;
  policyholder_count: number;
  
};

type PlanSubscription = {
  amount: string;               // e.g., "25.87"
  bill_start: string;           // ISO timestamp string
  bill_end: string;             // ISO timestamp string
  company_id: number;
  id: number;
  plan_id: number;
  status: "ACTIVE" | "INACTIVE" | string; // enum can be refined
  sub_id: string;              // Stripe subscription ID
  user_id: number;
};

type PlanDetails = {
  id: number;
  name: string;
  description: string;
  feature_description: string;
  interval: "day" | "week" | "month" | "year" | string; // can be refined
  interval_count: number;
  days: number;
  pricing: number; // e.g., 0.9 means 90% or $0.90
  price_id: string; // Stripe price ID
  team_size: number;
};

type AccountState = {
  user: UserDetails;
  company: CompanyDetails;
  subscription: PlanSubscription;
  plan: PlanDetails,
  loading: boolean;
  error: string;
  success: boolean;
  isactive: boolean;
  fetched: boolean; // Added fetched property
};

/**
 * The initial state for account details
 */
const initialState: AccountState = {
  user: null,
  company: null,
  subscription: null,
  plan: null,
  loading: false,
  error: null,
  success: false,
  isactive: null,
  fetched: false, // Initialize fetched as false
};

/**
 * Thunk to handle form submission and image upload.
 */
export const submitAccountDetails = createAsyncThunk(
  "account/submitDetails",
  async (
    {
      formData,
      profileImageLink,
      defaultEmail,
    }: {
      formData: UserDetails;
      profileImageLink: File | null;
      defaultEmail: string;
    },
    { rejectWithValue }
  ) => {
    try {
      let linkFromS3 = "";

      // Upload the image to S3 if a profile image link exists
      if (profileImageLink) {
        const sanitizedEmail = defaultEmail.replace(/[.@]/g, ""); // Sanitize email
        const fileExtension = profileImageLink.name.substring(
          profileImageLink.name.lastIndexOf(".")
        );
        const fileName = `profiles/${sanitizedEmail}${fileExtension}`;

        // Upload image
        // TODO: uploadData is deprecated, have to change this method.
        const result = await uploadData({
          key: fileName,
          data: profileImageLink,
        }).result;

        linkFromS3 = `https://insurance-dashboard-imagesdd445-dev.s3.us-east-1.amazonaws.com/public/${result.key}`;
        formData = { ...formData, image: linkFromS3 };
      }

      // Submit the account details to the API
      const response = await addOrUpdateUser(formData);

      if (response.status === 200) {
        toast.success("User details added successfully");
        return response.data.userdata as UserDetails;
        
      }

      return rejectWithValue("Failed to submit account details");
    } catch (error) {
      toast.success("User Update failed");
      console.error("Failed to update account settings:", error);
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

/**
 * Thunk to submit company details
 */
export const submitCompanyDetails = createAsyncThunk(
  "account/submitCompany",
  async (
    { formData }: { formData: CompanyFormInput },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState; // Ensure correct typing
      const user_id = state.account.user?.id; // Adjust based on your Redux state structure

      const authToken = (
        await fetchAuthSession()
      ).tokens?.accessToken?.toString();
      const data = await fetchAuthSession();
      const { email } = data.tokens.idToken.payload;

      const requestData = {
        name: formData.companyName,
        phone_number: formData.phoneNumber,
        email,
        user_id,
        policyholder_count: formData.policyholderCount,
        website: formData.website,
      };

      const response = await axios.post(
        `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/company`,
        requestData, // ✅ Corrected request body
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) { 
        toast.success("Company details added successfully");

      }

      dispatch(fetchAccountDetails());

      return response.data;
    } catch (error) {
      console.error("error", error);
      return rejectWithValue(error.response?.data?.message || "Unknown error");
    }
  }
);

/**
 * Thunk to fetch account details.
 */
export const fetchAccountDetails = createAsyncThunk(
  "account/fetchDetails",
  async (_, { rejectWithValue }) => {
    try {
      const authToken = (
        await fetchAuthSession()
      ).tokens?.accessToken?.toString();
      const data = await fetchAuthSession();
      const { email } = data.tokens.idToken.payload;

      const response = await axios.get(
        `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/users`,
        {
          params: {
            email,
          },
          headers: {
            Authorization: authToken,
          },
        }
      );

      if (response.status === 200) {
        console.log("response user", response.data.userdata);
        return response.data.userdata;
      } else if (response.status === 404) {
        return null; 
      }

      return rejectWithValue("Failed to fetch account details");
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

/**
 * The Account slice.
 */
export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    resetAccountState: () => initialState,

    /**
     * Update account settings locally in the Redux store.
     */
    setAccountSettings: (state, action) => {
      const oldState = _.cloneDeep(state);
      const newState = _.merge({}, oldState, action.payload);

      if (_.isEqual(oldState, newState)) {
        return undefined;
      }

      return newState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAccountDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitAccountDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        _.merge(state, action.payload); // Update state with the response data
      })
      .addCase(submitAccountDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(fetchAccountDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fetched = false; // Reset fetched flag
      })
      .addCase(fetchAccountDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.fetched = true; // Set fetched to true
        _.merge(state, action.payload); // Update state with fetched data
      })
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
        state.fetched = false; // Ensure fetched remains false
      });
  },
});

export const { resetAccountState, setAccountSettings } = accountSlice.actions;

/**
 * Selectors for accessing account state.
 */
export const selectAccount = (state: RootState) => state.account;

export const selectAccountLoading = (state: RootState) => state.account.loading;

export const selectAccountError = (state: RootState) => state.account.error;

export const selectAccountSuccess = (state: RootState) => state.account.success;

export const selectAccountImage = (state: RootState) =>
  state.account.user.image;

export const selectAccountEmail = (state: RootState) =>
  state.account.user.email;

export const selectAccountName = (state: RootState) =>
  state.account.user.Customer_Name;

export const selectAccountFetched = (state: RootState) =>
  state.account.fetched; // Selector for fetched flag

export const selectCompanySubscription = (state: RootState) =>
  state.account.subscription;

export default accountSlice.reducer;