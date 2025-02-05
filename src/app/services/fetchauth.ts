import { fetchAuthSession } from '@aws-amplify/auth';

const fetchUserData = async () => {
	const authToken = (await fetchAuthSession()).tokens?.accessToken?.toString();
	const data = await fetchAuthSession();
	return data;
};

export default fetchUserData;
