import { fetchAuthSession } from "@aws-amplify/auth";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store/store";
import axios from "axios";
import _ from "lodash";
import { CompanyFormInput } from "src/app/main/apps/settings/types/CompanyTypes.types";

type CompanyReduxType = {
  localCompanyData: CompanyFormInput;
  loading: false;
  error: Error;
};

const initialState: CompanyReduxType = {
  localCompanyData: null,
  loading: false,
  error: null,
};

/**
 * Thunk to fetch company subscription status.
 */
export const fetchCompanySubscription = createAsyncThunk(
  "company/fetchCompanySubscription",
  async (_, { rejectWithValue, getState }) => {
    try {
      const authToken = (
        await fetchAuthSession()
      ).tokens?.accessToken?.toString();

      // ✅ Fix: Correctly get state without calling `selectAccount()`
      const state = getState();
      const { company } = state.account; // Ensure correct access to company

      if (!company?.id) {
        return rejectWithValue("Company ID is missing");
      }

      const response = await axios.get(
        `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/company/${company.id}/subscription`,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      if (response.status === 200) {
        console.log("response", response.data);
        // return response.data.subscription; // ✅ Return subscription data
      }

      return rejectWithValue("Failed to fetch subscription details");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unknown error");
    }
  }
);

/**
 * Company Slice.
 */
export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    resetCompanyState: () => initialState,
    setCompanyDataLocally: (state, action: PayloadAction<CompanyFormInput>) => {
      state.localCompanyData = action.payload;
    },
    /**
     * Update account settings locally in the Redux store.
     */
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
        _.merge(state, action.payload);
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

export default companySlice.reducer;
