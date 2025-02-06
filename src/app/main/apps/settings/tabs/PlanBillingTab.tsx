import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Divider, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useSelector } from 'react-redux';
import { selectAccount } from 'src/app/features/account/accountSlice';
import axios from 'axios';
import { useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SettingsPlanBilling } from '../SettingsApi';
import CheckoutForm from '../tabcomponents/PlanBillingComponents/CheckoutForm';

type FormType = SettingsPlanBilling;

type PlanType = {
	value: string;
	label: string;
	details: string;
	price: number;
};

const PLANS: Array<PlanType> = [
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

interface SubscriptionResponse {
	clientSecret: string;
}

const defaultValues: FormType = {
	plan: null,
	numberOfUsers: null
};

const stripePromise = loadStripe(
	'pk_test_51QVNrHDIv4SXGrBxLk9llPOeoiczwAeRWCINxXbBNNw2Ecr1FTlk4ZasY3wHAZrjDcANw5bJN318FKvXtS2qpJEA00O6QyClPD'
);

function PlanBillingTab() {
	const { user, company } = useSelector(selectAccount);

	const schema = z.object({
		plan: z.enum(['basic', 'team', 'enterprise'])
	});

	const { control, reset, handleSubmit, formState } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	const [clientSecret, setIsClientSecret] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (formState: FormType) => {
		try {
			setIsLoading(true);
			const session = await fetchAuthSession();
			const authToken = session.tokens?.accessToken?.toString();

			const requestData = {
				currency_code: 'USD',
				company_id: company.id,
				plan_id: 1,
				user_id: user.id,
				price_id: 'price_1QlFc0DIv4SXGrBxcTOIm2TJ'
			};

			const response = await axios.post<SubscriptionResponse>(
				'https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/create-subscription',
				requestData,
				{
					headers: {
						Authorization: authToken
					}
				}
			);

			const { clientSecret } = response.data;

			setIsClientSecret(clientSecret);
			setIsLoading(false);
		} catch (error) {
			console.error('Error while fetching client secret', error);
		}
	};

	if (!company) return (
		<div>
			<p>First, register your company</p>
		</div>
	)

	if (isLoading)
		return (
			<div>
				<FuseLoading />
			</div>
		);

	if (clientSecret)
		return (
			<div>
				<Elements
					stripe={stripePromise}
					options={{ clientSecret }}
				>
					<CheckoutForm clientSecret={clientSecret} />
				</Elements>
			</div>
		);

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mt-32 grid w-full gap-16 sm:grid-cols-3">
					<div className="sm:col-span-3">
						<Alert severity="info">
							Changing the plan will take effect immediately. You will be charged for the rest of the
							current month.
						</Alert>
					</div>
					<Controller
						name="plan"
						control={control}
						render={({ field }) => (
							<>
								{PLANS.map((plan) => (
									<Paper
										sx={{
											'&.selected': {
												border: (theme) => `3px solid ${theme.palette.secondary.main}`
											}
										}}
										className="flex flex-1 cursor-pointer flex-col items-start justify-start rounded-md p-24 border-3 border-transparent relative"
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

				<div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="numberOfUsers"
							render={({ field }) => (
								<TextField
									{...field}
									label="Number of Users"
									placeholder="Enter the number of policyholders"
									id="number-of-users"
									variant="outlined"
									type="number"
									required
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:user-circle</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>
				</div>

				<Divider className="mb-40 mt-44 border-t" />
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

export default PlanBillingTab;
