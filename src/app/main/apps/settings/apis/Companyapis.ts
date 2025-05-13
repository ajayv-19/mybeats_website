import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';
import { toast } from 'sonner';

export const sendMembersEmail = async (email: string) => {
	const session = await fetchAuthSession();
	const authToken = session.tokens?.accessToken?.toString();

	const getUserData = await axios.post(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/email/send`,
		{
			to: email,
		},
		{
			headers: {
				Authorization: authToken
			}
		},
	);
	
	return getUserData;
};