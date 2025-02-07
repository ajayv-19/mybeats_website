import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Divider, Paper, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useSelector } from 'react-redux';
import { selectAccount } from 'src/app/features/account/accountSlice';
import axios from 'axios';
import { useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SettingsPlanBilling } from '../SettingsApi';
import CheckoutForm from '../tabcomponents/PlanBillingComponents/CheckoutForm';
import { useDispatch } from 'react-redux';
import { fetchCompanySubscription, selectSubscription } from 'src/app/features/company/companySlice';

type FormType = SettingsPlanBilling;

type PlanType = {
	id: number;
	value: string;
	label: string;
	details: string;
	price: number;
};

const PLANS: Array<PlanType> = [
	{
		id: 1,
		value: 'free',
		label: 'Free',
		details: 'Starter plan for individuals.',
		price: 0
	},
	{
		id: 2,
		value: 'silver',
		label: 'Silver',
		details: 'Collaborate up to 10 people.',
		price: 0.99
	},
	{
		id: 3,
		value: 'gold',
		label: 'Gold',
		details: 'For bigger businesses.',
		price: 1.99
	}
];

interface SubscriptionResponse {
	clientSecret: string;
}

const defaultValues: FormType = {
	plan: null
};

const stripePromise = loadStripe(
	'pk_test_51QVNrHDIv4SXGrBxLk9llPOeoiczwAeRWCINxXbBNNw2Ecr1FTlk4ZasY3wHAZrjDcANw5bJN318FKvXtS2qpJEA00O6QyClPD'
);

function PlanBillingTab() {
	const { user, company } = useSelector(selectAccount);
	const subscription = useSelector(selectSubscription);
	const dispatch = useDispatch();

	const schema = z.object({
		plan: z.number() // ✅ Store `plan_id` (number) instead of `value` (string)
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
				plan_id: formState.plan,
				user_id: user.id
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
			setIsLoading(false);
			console.error('Error while fetching client secret', error);
		}
	};

	useEffect(() => {		
		dispatch(fetchCompanySubscription());
	}, [])

	console.log("subscription", subscription);

	if (!company)
		return (
			<div>
				<p>First, register your company</p>
			</div>
		);

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
										onClick={() => field.onChange(plan.id)} // ✅ Store `plan.id` instead of `plan.value`
										key={plan.id} // ✅ Key should also be based on `id`
									>
										{field.value === plan.id && ( // ✅ Compare using `plan.id`
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
