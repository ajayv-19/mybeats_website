import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store/store";
import axios from "axios";
import _ from "lodash";

const BASE_URL =
  "https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi";

type PaymentStateType = {
  clientSecret: string;
  loading: boolean;
  error: Error;
};

const initialState: PaymentStateType = {
  clientSecret: null,
  loading: false,
  error: null,
};

export const initiateSubscription = createAsyncThunk(
  "payment/initiateSubscription",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const { localCompanyData } = state.company;

    try {
      const response = await axios.post(`${BASE_URL}/create-subscription`);
      console.log("response", response);
    } catch (error) {
      rejectWithValue(error);
    }
  }
);

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPaymentState: (state, action: PayloadAction) => {
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
      .addCase(initiateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        _.merge(state, action.payload);
      })
      .addCase(initiateSubscription.rejected, (state, action) => {
        state.loading = false;
        _.merge(state, action.payload);
      });
  },
});

export const { setPaymentState } = paymentSlice.actions;

export const selectPayment = (state: RootState) => state.payment;

export default paymentSlice.reducer;
