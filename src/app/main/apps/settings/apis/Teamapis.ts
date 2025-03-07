import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';



export const getTeamMembers = async (company_id: number, user_id: number) => {
	const session = await fetchAuthSession();
	const authToken = session.tokens?.accessToken?.toString();

	const getUserData = await axios.get(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/listInvitedUsers`,
		{
			params: {company_id: company_id, user_id: user_id},
			
				headers: {
					Authorization: authToken
				}
			
		},
	);
	return getUserData;
};