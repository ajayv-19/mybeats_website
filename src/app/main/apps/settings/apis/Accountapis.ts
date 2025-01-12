import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';

interface FormData {
	// Define the structure of formData here
	email?: string;
	username?: string;
	Company_Name?: string;
	role?: string;
	Customer_Name?: string;
	usertype?: string;
	created_timestamp?: string | null;
	image?: string;
	domain?: string;
	removedByAdmin?: string | null;
	id?: number;
}

export const addOrUpdateUser = async (formData: FormData) => {
	const session = await fetchAuthSession();
	const authToken = session.tokens?.accessToken?.toString();
	const { email } = session.tokens.idToken.payload;

	console.log('Session data:', session);
	console.log('authToken:', authToken);

	const getUserData = await axios.post(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/addOrUpdateUserDetails`,
		{
			...formData
		},
		{
			headers: {
				Authorization: authToken
			}
		}
	);
	return getUserData;
};
