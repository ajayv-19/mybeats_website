import { fetchAuthSession } from 'aws-amplify/auth';

// Fetch default email
export const fetchDefaultEmail = async () => {
	const data = await fetchAuthSession();
	const defaultemail: string = data.tokens.idToken.payload.email
		? String(data.tokens.idToken.payload.email)
		: 'default@example.com';

	return defaultemail;
};
