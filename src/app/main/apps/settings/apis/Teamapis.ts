import axios from 'src/app/constant/axios';
import { fetchAuthSession } from '@aws-amplify/auth';
import { toast } from 'sonner';



export const getTeamMembers = async (company_id: number, user_id: number) => {


	const getUserData = await axios.get(
		`/listInvitedUsers`,
		{
			params: {company_id: company_id, user_id: user_id},
			//remove headers
			
		},
	);
	return getUserData;
};


export const inviteTeamMembers = async (email: string) => {


	const getUserData = await axios.post(
		`/email/invite`,
		{
			to: email,
		},
		
	);
	
	return getUserData;
};


export const removeTeamMembers = async (email: string) => {
	

	const getUserData = await axios.post(
		`/email/invite/cancel`,
		{
			emailId: email,
		},
	);
	
	return getUserData;
};




export const updateUserPermission = async (email: string, role: string) => {


	const getUserData = await axios.post(
		`/updaterole`,{
			email: email,
			role: role
		
		},
	
	);

	
	return getUserData;
}


