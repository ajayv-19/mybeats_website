import { fetchAuthSession } from "@aws-amplify/auth";

const fetchUserData = async () => {
  const authToken = (await fetchAuthSession()).tokens?.accessToken?.toString();
  const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
  console.log(data);
  return data;
};

export default fetchUserData;
