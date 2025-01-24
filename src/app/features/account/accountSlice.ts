/* eslint import/no-extraneous-dependencies: off */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/store/store';
import _ from '@lodash';
import { uploadData } from '@aws-amplify/storage';
import { addOrUpdateUser } from 'src/app/main/apps/settings/apis/Accountapis';
import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';

type UserDetails = {
	Customer_Name: string;
	email: string;
	image?: string;
};

type CompanyDetails = {
	Company_Name: string;
	domain: string;
	phone_number: number;
	plan_type: string;
};

type AccountState = {
	user: UserDetails;
	company: CompanyDetails;
	loading: boolean;
	error: string;
	success: boolean;
};

/**
 * The initital state for account details
 */
const initialState: AccountState = {
	user: null,
	company: null,
	loading: false,
	error: null,
	success: false
};

/**
 * Thunk to handle form submission and image upload.
 */
export const submitAccountDetails = createAsyncThunk(
	'account/submitDetails',
	async (
		{
			formData,
			profileImageLink,
			defaultEmail
		}: { formData: UserDetails; profileImageLink: File | null; defaultEmail: string },
		{ rejectWithValue }
	) => {
		try {
			let linkFromS3 = '';

			// Upload the image to S3 if a profile image link exists
			if (profileImageLink) {
				const sanitizedEmail = defaultEmail.replace(/[.@]/g, ''); // Sanitize email
				const fileExtension = profileImageLink.name.substring(profileImageLink.name.lastIndexOf('.'));
				const fileName = `profiles/${sanitizedEmail}${fileExtension}`;

				// Upload image
				// TODO: uploadData is deprecated, have to change this method. 
				const result = await uploadData({
					key: fileName,
					data: profileImageLink
				}).result;

				linkFromS3 = `https://insurance-dashboard-imagesdd445-dev.s3.us-east-1.amazonaws.com/public/${result.key}`;
				formData = { ...formData, image: linkFromS3 };
			}

			// Submit the account details to the API
			const response = await addOrUpdateUser(formData);

			if (response.status === 200) {
				return response.data.userdata as UserDetails;
			}

			return rejectWithValue('Failed to submit account details');
		} catch (error) {
			console.error('Failed to update account settings:', error);
			return rejectWithValue(error.message || 'Unknown error');
		}
	}
);

/**
 * Thunk to fetch account details.
 */
export const fetchAccountDetails = createAsyncThunk('account/fetchDetails', async (_, { rejectWithValue }) => {
	try {
		const authToken = (await fetchAuthSession()).tokens?.accessToken?.toString();
		const data = await fetchAuthSession();
		const { email } = data.tokens.idToken.payload;

		const response = await axios.get(
			`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/users`,
			{
				params: {
					email
				},
				headers: {
					Authorization: authToken
				}
			}
		);

		if (response.status === 200) {
			return response.data.userdata;
		}

		return rejectWithValue('Failed to fetch account details');
	} catch (error) {
		return rejectWithValue(error.message || 'Unknown error');
	}
});

/**
 * The Account slice.
 */
export const accountSlice = createSlice({
	name: 'account',
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
		}
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
			})
			.addCase(fetchAccountDetails.fulfilled, (state, action) => {
				state.loading = false;
				state.success = true;
				_.merge(state, action.payload); // Update state with fetched data
			})
			.addCase(fetchAccountDetails.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				state.success = false;
			});
	}
});

export const { resetAccountState, setAccountSettings } = accountSlice.actions;

/**
 * Selectors for accessing account state.
 */
export const selectAccount = (state: RootState) => state.account;

export const selectAccountLoading = (state: RootState) => state.account.loading;

export const selectAccountError = (state: RootState) => state.account.error;

export const selectAccountSuccess = (state: RootState) => state.account.success;

export const selectAccountImage = (state: RootState) => state.account.user.image;

export const selectAccountEmail = (state: RootState) => state.account.user.email;

export const selectAccountName = (state: RootState) => state.account.user.Customer_Name;

export default accountSlice.reducer;
