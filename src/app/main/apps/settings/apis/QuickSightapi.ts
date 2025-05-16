import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';
import { toast } from 'sonner';

export const deleteQuickSightUser = async (email: string) => {

	const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
        console.log(data);

        const authToken = (
          await fetchAuthSession()
        ).tokens?.idToken?.toString();

        const authToken2 = (
          await fetchAuthSession()
        ).tokens?.accessToken?.toString();
        // console.log("authToken ", authToken);
        // console.log("authToken2 ", authToken2);

        const payloadSub = data.tokens.idToken.payload.sub;
        //const { email } = data.tokens.idToken.payload;

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
	

	const getUserData = await axios.post(
		`https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/delete-user?email=${email}&jwtToken=${authToken}&payloadSub=${payloadSub}`,{},{headers: {
			Authorization: authToken
		}});
		
	return getUserData;
}