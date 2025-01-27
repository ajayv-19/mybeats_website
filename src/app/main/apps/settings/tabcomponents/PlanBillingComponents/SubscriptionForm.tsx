import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import _ from '@lodash';
import clsx from 'clsx';
import Paper from '@mui/material/Paper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import { useSelector } from 'react-redux';
import { selectAccount } from 'src/app/features/account/accountSlice';
import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';
import SubscriptionFormType from '../../types/SubscriptionFormTypes';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
	'pk_test_51QVNrHDIv4SXGrBxLk9llPOeoiczwAeRWCINxXbBNNw2Ecr1FTlk4ZasY3wHAZrjDcANw5bJN318FKvXtS2qpJEA00O6QyClPD'
);


const defaultValues: SubscriptionFormType = {
	companyName: '',
	emailDomain: '',
	website: '',
	planValue: ''
};

const plans = [
	{
		value: 'basic',
		label: 'Basic',
		details: 'Starter plan for individuals.',
		price: 9
	},
	{
		value: 'team',
		label: 'Team',
		details: 'Collaborate up to 10 people.',
		price: 29
	},
	{
		value: 'enterprise',
		label: 'Enterprise',
		details: 'For bigger businesses.',
		price: 99
	}
];

function SubscriptionForm() {
	/**
	 * Form Validation Schema
	 */
	const schema = z.object({
		planValue: z.enum(['basic', 'team', 'enterprise']),
		phone: z.number(),
		website: z.string()
	});

	const { control, reset, handleSubmit, formState } = useForm<SubscriptionFormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});
	const { isValid, dirtyFields, errors } = formState;

	const { company, user } = useSelector(selectAccount);

	const [redirectUrl, setRedirectUrl] = useState(null);

	useEffect(() => {
		if (company) {
			reset({
				planValue: company.plan_type,
				companyName: company.Company_Name,
				emailDomain: company.domain,
				phone: 1234567890
			});
		}
	}, [company, reset]);

	const onSubmit = async () => {
		const session = await fetchAuthSession();
		const authToken = session.tokens?.accessToken?.toString();

		const requestData = {
			currency_code: 'USD', // Replace with desired currency code if different
			company_id: company.id, // Replace with actual company ID
			plan_id: 1, // Replace with actual plan ID
			user_id: user.id // Replace with actual user ID
		};

		const response = await axios.post(
			'https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/create-subscription',
			requestData,
			{
				headers: {
					Authorization: authToken
				}
			}
		);

		setRedirectUrl(response.data.redirect_link);

	};

	if (redirectUrl) {
		return (
			<Elements stripe={stripePromise} options={{clientSecret: redirectUrl}}>
				<CheckoutForm clientSecret={redirectUrl} />
			</Elements>
		)
	} 

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="my-40 border-t">
				<div className="w-full">
					<Typography className="text-xl">Select your plan</Typography>
				</div>
			</div>
			<div className="mt-32 grid w-full gap-16 sm:grid-cols-3">
				<div className="sm:col-span-3">
					<Alert severity="info">
						Changing the plan will take effect immediately. You will be charged for the rest of the current
						month.
					</Alert>
				</div>
				<Controller
					name="planValue"
					control={control}
					render={({ field }) => (
						<>
							{plans.map((plan) => (
								<Paper
									sx={{
										'&.selected': {
											border: (theme) => `3px solid ${theme.palette.secondary.main}`
										}
									}}
									className={clsx(
										' flex flex-1 cursor-pointer flex-col items-start justify-start rounded-md p-24 border-3 border-transparent relative',
										field.value === plan.value ? 'selected' : ''
									)}
									onClick={() => field.onChange(plan.value)}
									key={plan.value}
								>
									{field.value === plan.value && (
										<FuseSvgIcon
											className="absolute right-0 top-0 mr-12 mt-12"
											size={24}
											color="secondary"
										>
											heroicons-solid:check-circle
										</FuseSvgIcon>
									)}
									<Typography className="font-semibold uppercase">{plan.label}</Typography>
									<Typography
										className="mt-4"
										color="text.secondary"
									>
										{plan.details}
									</Typography>
									<div className="flex-auto" />
									<div className="flex items-end mt-8 text-lg">
										<Typography>
											{plan.price.toLocaleString('en-US', {
												style: 'currency',
												currency: 'USD'
											})}
										</Typography>
										<Typography color="text.secondary"> / month</Typography>
									</div>
								</Paper>
							))}
						</>
					)}
				/>
			</div>

			<div>
				<div className="my-40 border-t" />
				<div className="w-full">
					<Typography className="text-xl">Company Information</Typography>
				</div>
				<div className="grid w-full gap-24 sm:grid-cols-4 mt-32">
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="companyName"
							render={({ field }) => (
								<TextField
									className=""
									{...field}
									label="Company Name"
									placeholder="Company Name"
									// disabled={companyExist}
									id="companyName"
									// error={!errors.companyName}
									helperText={errors?.companyName?.message}
									variant="outlined"
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:building-office-2</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>

					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="phone"
							render={({ field }) => (
								<TextField
									{...field}
									label="Phone Number"
									placeholder="Phone Number"
									// disabled={companyExist}
									variant="outlined"
									fullWidth
									type="number"
									helperText="Should be a valid 10 digit phone number"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:phone</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>

					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="website"
							render={({ field }) => (
								<TextField
									{...field}
									label="Website"
									placeholder="Website"
									// disabled={companyExist}
									variant="outlined"
									fullWidth
									error={!!errors.website}
									helperText={errors?.website?.message}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:globe-alt</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="emailDomain"
							render={({ field }) => (
								<TextField
									className=""
									{...field}
									label="Email domain"
									placeholder="Email domain"
									// disabled={companyExist}
									id="domain"
									// error={errors?.domain}
									// helperText={errors?.domain?.message}
									variant="outlined"
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:briefcase</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>
				</div>
			</div>
			<Divider className="mb-40 mt-44 border-t" />

			<div className="flex items-center justify-end space-x-8">
				<Button
					variant="outlined"
					disabled={_.isEmpty(dirtyFields)}
				>
					Cancel
				</Button>
				<Button
					variant="contained"
					color="secondary"
					// disabled={_.isEmpty(dirtyFields) || !isValid}
					type="submit"
				>
					Save
				</Button>
			</div>
		</form>
	);
}

export default SubscriptionForm;
