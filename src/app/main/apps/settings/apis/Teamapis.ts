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


export const inviteTeamMembers = async (email: string) => {
	const session = await fetchAuthSession();
	const authToken = session.tokens?.accessToken?.toString();

	const getUserData = await axios.post(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/email/invite`,
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


export const removeTeamMembers = async (email: string) => {
	const session = await fetchAuthSession();
	const authToken = session.tokens?.accessToken?.toString();

	const getUserData = await axios.post(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/email/invite/cancel`,
		{
			emailId: email,
		},
		{
			headers: {
				Authorization: authToken
			}
		},
	);
	return getUserData;
};

const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
        console.log(data);

        const authToken = (
          await fetchAuthSession()
        ).tokens?.idToken?.toString();

        const authToken2 = (
          await fetchAuthSession()
        ).tokens?.accessToken?.toString();
        console.log("authToken ", authToken);
        console.log("authToken2 ", authToken2);

        const payloadSub = data.tokens.idToken.payload.sub;
        const { email } = data.tokens.idToken.payload;

        const params = {
          headers: {
            Authorization: authToken,
          },
          response: true,
          queryStringParameters: {
            jwtToken: authToken,
            payloadSub,
            email,
          },
        };
        console.log(params);

export const deleteQuickSightUser = async (email: string) => {
	

	const getUserData = await axios.post(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/delete-user`,
		{
			headers: {
				Authorization: authToken
			},
			params:{
				jwtToken: authToken,
				payloadSub,
				email,
			}
		},
	);
	return getUserData;
}
export const updateUserPermission = async (email: string, role: string) => {
	

	const getUserData = await axios.post(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/updaterole`,{
			email: email,
			role: role
		
		},
		{
			headers: {
				Authorization: authToken
			},
		},
	);
	return getUserData;
}


