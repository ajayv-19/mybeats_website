

import axios from 'src/app/constant/axios';

export const sendMembersEmail = async (email: string) => {
	const getUserData = await axios.post(
		`/email/send`,
		{
			to: email,
		},
	);
	
	return getUserData;
};