//import fetchUserData from "../services/fetchauth";
import axios from "axios";
import { fetchAuthSession } from "@aws-amplify/auth";
import { EXPRESS_BACKEND } from "src/constants/constants";

export const checkUserExist = async () => {
  const authToken = (await fetchAuthSession()).tokens?.accessToken?.toString();

  const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
  console.log(data);

  const email = data.tokens.idToken.payload.email;

  console.log("authToken ", authToken);

  const userStatus = await axios.get(
    `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/checkusers`,
    {
      params: {
        email: email,
        //email: "dummy456@gmail.com",
      },
      headers: {
        Authorization: authToken,
      },
    }
  );

  return userStatus;
};
