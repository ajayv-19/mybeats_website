import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useEffect, useState } from 'react';
import { fetchProfileData } from 'src/app/backendServices/ProfileServices';
import { useNavigate } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';
import CompanyRegisterDialog from '../tabcomponents/plancomponts/RegisterCompanyPopUp';
import UserInvitationDialog from '../tabcomponents/plancomponts/ShareorCancle';
import SubscriptionForm from '../tabcomponents/PlanBillingComponents/SubscriptionForm';

type FormType = {
	plan?: string;
	cardHolder?: string;
	cardNumber?: string;
	cardExpiration?: string;
	cardCVC?: string;
	country?: string;
	zip?: string;
	Company_Name: string;
	domain: string;
	website: string;
	phone: number;
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

const defaultValues: FormType = {
	plan: 'team',
	cardHolder: '',
	cardNumber: '',
	cardExpiration: '',
	cardCVC: '',
	country: '',
	zip: '',

	Company_Name: '',

	domain: '',
	website: '',
	phone: 0
};

/**
 * Form Validation Schema
 */
const schema = z.object({
	plan: z.enum(['basic', 'team', 'enterprise']),
	cardHolder: z.string(),
	cardNumber: z.string(),
	cardExpiration: z.string(),
	cardCVC: z.string(),
	country: z.string(),
	zip: z.string(),
	phone: z.number()
});

const stripePromise = loadStripe(
	'pk_test_51QVNrHDIv4SXGrBxLk9llPOeoiczwAeRWCINxXbBNNw2Ecr1FTlk4ZasY3wHAZrjDcANw5bJN318FKvXtS2qpJEA00O6QyClPD'
);

function PlanBillingTab() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [companyExist, setCompanyExists] = useState(false);
	const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
	const [userInvitation, setUserInvitation] = useState(false);

	const { control, reset, handleSubmit, formState } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});
	const [company, setCompany] = useState<FormType>();
	const { isValid, dirtyFields, errors } = formState;

	const fetchCompanyData = async () => {
		try {
			const getUserData = await fetchProfileData();

			if (getUserData.status === 200) {
				const companyData = getUserData.data.userdata.company;

				console.log('plan billing tab', companyData);

				if (!companyData) {
					setCompanyExists(false);
					setDialogOpen(true);
				} else {
					setCompanyExists(true);
					setShowSubscriptionForm(true);
				}

				setCompany(companyData);
				reset(companyData); // Reset form values with fetched user data
			}
		} catch (error) {
		} finally {
			// setIsLoading(false);
		}
	};
	useEffect(() => {
		fetchCompanyData();
	}, [reset]);

	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	const handleDialogYes = () => {
		setDialogOpen(false);
		setShowSubscriptionForm(true);
	};

	const handleDialogNo = () => {
		setDialogOpen(false);
		setUserInvitation(true);
	};

	const handleBack = () => {
		setUserInvitation(false);
		setDialogOpen(true);
	};
	const navigate = useNavigate();
	const handlecancle = () => {
		navigate(`/apps/settings/account`);
	};

	const [clientSecretFetched, setClientSecret] = useState('');

	useEffect(() => {
		const fetchClientSecret = async () => {
			const session = await fetchAuthSession();
			const authToken = session.tokens?.accessToken?.toString();

			const paymentIntent = await axios.post(
				'https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/create-payment',
				{},
				{
					headers: {
						Authorization: authToken
					}
				}
			);

			setClientSecret(paymentIntent.data.clientSecret);
		};

		fetchClientSecret();
	}, []);

	const options = {
		// passing the client secret obtained from the server
		clientSecret: clientSecretFetched
	};

	// if (clientSecretFetched !== '') {
	// 	return (
	// 		<Elements
	// 			stripe={stripePromise}
	// 			options={options}
	// 		>
	// 			<CheckoutForm clientSecret={clientSecretFetched} />
	// 		</Elements>
	// 	);
	// }



	return (
		<div className="w-full max-w-3xl">
			<CompanyRegisterDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				onYes={handleDialogYes}
				onNo={handleDialogNo}
			/>
			{userInvitation && (
				<UserInvitationDialog
					open={userInvitation}
					onClose={() => setUserInvitation(false)}
					onShare={() => console.log('Share')}
					onCancel={() => handlecancle()}
					onBack={() => handleBack()}
				/>
			)}

			<SubscriptionForm/>

			{/* {showSubscriptionForm && (
				// <form onSubmit={handleSubmit(onSubmit)}>
				// 	<div className="my-40 border-t">
				// 		<div className="w-full">
				// 			<Typography className="text-xl">Select your plan</Typography>
				// 		</div>
				// 	</div>
				// 	<div className="mt-32 grid w-full gap-16 sm:grid-cols-3">
				// 		<div className="sm:col-span-3">
				// 			<Alert severity="info">
				// 				Changing the plan will take effect immediately. You will be charged for the rest of the
				// 				current month.
				// 			</Alert>
				// 		</div>
				// 		<Controller
				// 			name="plan"
				// 			control={control}
				// 			render={({ field }) => (
				// 				<>
				// 					{plans.map((plan) => (
				// 						<Paper
				// 							sx={{
				// 								'&.selected': {
				// 									border: (theme) => `3px solid ${theme.palette.secondary.main}`
				// 								}
				// 							}}
				// 							className={clsx(
				// 								' flex flex-1 cursor-pointer flex-col items-start justify-start rounded-md p-24 border-3 border-transparent relative',
				// 								field.value === plan.value ? 'selected' : ''
				// 							)}
				// 							onClick={() => field.onChange(plan.value)}
				// 							key={plan.value}
				// 						>
				// 							{field.value === plan.value && (
				// 								<FuseSvgIcon
				// 									className="absolute right-0 top-0 mr-12 mt-12"
				// 									size={24}
				// 									color="secondary"
				// 								>
				// 									heroicons-solid:check-circle
				// 								</FuseSvgIcon>
				// 							)}
				// 							<Typography className="font-semibold uppercase">{plan.label}</Typography>
				// 							<Typography
				// 								className="mt-4"
				// 								color="text.secondary"
				// 							>
				// 								{plan.details}
				// 							</Typography>
				// 							<div className="flex-auto" />
				// 							<div className="flex items-end mt-8 text-lg">
				// 								<Typography>
				// 									{plan.price.toLocaleString('en-US', {
				// 										style: 'currency',
				// 										currency: 'USD'
				// 									})}
				// 								</Typography>
				// 								<Typography color="text.secondary"> / month</Typography>
				// 							</div>
				// 						</Paper>
				// 					))}
				// 				</>
				// 			)}
				// 		/>
				// 	</div>

				// 	<div>
				// 		<div className="my-40 border-t" />
				// 		<div className="w-full">
				// 			<Typography className="text-xl">Company Information</Typography>
				// 		</div>
				// 		<div className="grid w-full gap-24 sm:grid-cols-4 mt-32">
				// 			<div className="sm:col-span-2">
				// 				<Controller
				// 					control={control}
				// 					name="Company_Name"
				// 					render={({ field }) => (
				// 						<TextField
				// 							className=""
				// 							{...field}
				// 							label="Company Name"
				// 							placeholder="Company Name"
				// 							disabled={companyExist}
				// 							id="Company_Name"
				// 							error={!!errors.Company_Name}
				// 							helperText={errors?.Company_Name?.message}
				// 							variant="outlined"
				// 							fullWidth
				// 							InputProps={{
				// 								startAdornment: (
				// 									<InputAdornment position="start">
				// 										<FuseSvgIcon size={20}>
				// 											heroicons-solid:building-office-2
				// 										</FuseSvgIcon>
				// 									</InputAdornment>
				// 								)
				// 							}}
				// 						/>
				// 					)}
				// 				/>
				// 			</div>

				// 			<div className="sm:col-span-2">
				// 				<Controller
				// 					control={control}
				// 					name="phone"
				// 					render={({ field }) => (
				// 						<TextField
				// 							{...field}
				// 							label="Phone Number"
				// 							placeholder="Phone Number"
				// 							disabled={companyExist}
				// 							variant="outlined"
				// 							fullWidth
				// 							type="number"
				// 							helperText="Should be a valid 10 digit phone number"
				// 							InputProps={{
				// 								startAdornment: (
				// 									<InputAdornment position="start">
				// 										<FuseSvgIcon size={20}>heroicons-solid:phone</FuseSvgIcon>
				// 									</InputAdornment>
				// 								)
				// 							}}
				// 						/>
				// 					)}
				// 				/>
				// 			</div>

				// 			<div className="sm:col-span-2">
				// 				<Controller
				// 					control={control}
				// 					name="website"
				// 					render={({ field }) => (
				// 						<TextField
				// 							{...field}
				// 							label="Website"
				// 							placeholder="Website"
				// 							disabled={companyExist}
				// 							variant="outlined"
				// 							fullWidth
				// 							error={!!errors.website}
				// 							helperText={errors?.website?.message}
				// 							InputProps={{
				// 								startAdornment: (
				// 									<InputAdornment position="start">
				// 										<FuseSvgIcon size={20}>heroicons-solid:globe-alt</FuseSvgIcon>
				// 									</InputAdornment>
				// 								)
				// 							}}
				// 						/>
				// 					)}
				// 				/>
				// 			</div>
				// 			<div className="sm:col-span-2">
				// 				<Controller
				// 					control={control}
				// 					name="domain"
				// 					render={({ field }) => (
				// 						<TextField
				// 							className=""
				// 							{...field}
				// 							label="Email domain"
				// 							placeholder="Email domain"
				// 							disabled={companyExist}
				// 							id="domain"
				// 							error={!!errors.domain}
				// 							helperText={errors?.domain?.message}
				// 							variant="outlined"
				// 							fullWidth
				// 							InputProps={{
				// 								startAdornment: (
				// 									<InputAdornment position="start">
				// 										<FuseSvgIcon size={20}>heroicons-solid:briefcase</FuseSvgIcon>
				// 									</InputAdornment>
				// 								)
				// 							}}
				// 						/>
				// 					)}
				// 				/>
				// 			</div>
				// 		</div>
				// 	</div>
				// 	<Divider className="mb-40 mt-44 border-t" />

				// 	<div className="flex items-center justify-end space-x-8">
				// 		<Button
				// 			variant="outlined"
				// 			disabled={_.isEmpty(dirtyFields)}
				// 		>
				// 			Cancel
				// 		</Button>
				// 		<Button
				// 			variant="contained"
				// 			color="secondary"
				// 			disabled={_.isEmpty(dirtyFields) || !isValid}
				// 			type="submit"
				// 		>
				// 			Save
				// 		</Button>
				// 	</div>
				// </form>
			)} */}
		</div>
	);
}

export default PlanBillingTab;
