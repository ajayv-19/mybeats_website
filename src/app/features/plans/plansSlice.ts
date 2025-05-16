import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "app/store/store";
import { fetchAuthSession } from "@aws-amplify/auth"; // Import fetchAuthSession for authentication

// Plan type
export interface Plan {
  id: number;
  name: string;
  description: string;
  pricing: number;
  team_size: number;
  feature_description: string;
  days: number;
  interval: string;
  interval_count: number;
  price_id: string;
}

type PlansState = {
  plans: Plan[];
  loading: boolean;
  error: string | null;
};

const initialState: PlansState = {
  plans: [],
  loading: false,
  error: null,
};

// Thunk to fetch all plans with authentication
export const fetchPlans = createAsyncThunk(
  "plans/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch the authentication session to get the token
      const authToken = (
        await fetchAuthSession()
      ).tokens?.accessToken?.toString();

      if (!authToken) {
        throw new Error("Authentication token is missing");
      }

      // Make the API call with the Authorization header
      const response = await axios.post(
        "https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/getplans",
        {},
        {
          headers: {
            Authorization: authToken, // Include the token in the Authorization header
          },
        }
      );

      return response.data.data.sort((a,b)=>a.id-b.id); // Should be an array of Plan
    } catch (error: any) {
      console.error("Error fetching plans:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch plans");
    }
  }
);

// Slice
export const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    resetPlansState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<Plan[]>) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { resetPlansState } = plansSlice.actions;

// Selectors
export const selectPlans = (state: RootState) => state.plans.plans;
export const selectPlansLoading = (state: RootState) => state.plans.loading;
export const selectPlansError = (state: RootState) => state.plans.error;

export default plansSlice.reducer;