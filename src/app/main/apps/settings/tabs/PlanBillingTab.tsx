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
		</div>
	);
}

export default PlanBillingTab;
