import { fetchAuthSession } from "@aws-amplify/auth";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store/store";
import axios from "axios";
import _ from "lodash";
import { CompanyFormInput } from "src/app/main/apps/settings/types/CompanyTypes.types";

type CompanyReduxType = {
  localCompanyData: CompanyFormInput;
  subscription: any; // Add proper type based on your subscription data structure
  number_of_users_invited?: number; // Optional field if needed
  loading: boolean;
  error: any;
};

const initialState: CompanyReduxType = {
  localCompanyData: null,
  subscription: null,
  number_of_users_invited: 0,
  loading: false,
  error: null,
};

export const fetchCompanySubscription = createAsyncThunk(
  "company/fetchCompanySubscription",
  async (_, { rejectWithValue, getState }) => {
    try {
      const authToken = (
        await fetchAuthSession()
      ).tokens?.accessToken?.toString();

      const state = getState() as RootState; // Ensure correct typing
      const companyId = state.account.company?.id; // Adjust based on your Redux state structure

      if (!companyId) {
        return rejectWithValue("Company ID is missing");
      }

      const response = await axios.get(
        `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/company/${companyId}/subscription`,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      if (response.status === 200) {
        return response.data.subscription;
      }

      return rejectWithValue("Failed to fetch subscription details");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unknown error");
    }
  }
);

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    resetCompanyState: () => initialState,
    setCompanyDataLocally: (state, action: PayloadAction<CompanyFormInput>) => {
      state.localCompanyData = action.payload;
    },
    setCompanySettings: (state, action) => {
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
      .addCase(fetchCompanySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload; // Directly set subscription data
      })
      .addCase(fetchCompanySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCompanyState, setCompanySettings, setCompanyDataLocally } =
  companySlice.actions;

export const selectLocalCompanyData = (state: RootState) =>
  state.company.localCompanyData;

export const selectCompanySubscription = (state: RootState) =>
  state.company.subscription;

export default companySlice.reducer;
