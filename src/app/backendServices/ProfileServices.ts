// //import fetchUserData from "../services/fetchauth";
// import axios from "axios";
// import { fetchAuthSession } from "@aws-amplify/auth";
// import { EXPRESS_BACKEND } from "src/constants/constants";

// export const fetchProfileData = async () => {
//   const authToken = (await fetchAuthSession()).tokens?.accessToken?.toString();

//   const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
//   console.log(data);

//   const email = data.tokens.idToken.payload.email;

//   console.log("authToken ", authToken);

//   const getUserData = await axios.get(
//     `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/users`,
//     {
//       params: {
//         email: email,
//       },
//       headers: {
//         Authorization: authToken,
//       },
//     }
//   );

//   //   const getUserData = await axios.get(
//   //     `${EXPRESS_BACKEND}/get-company-by-email?email=${email}`,
//   //     {

//   //     }
//   //   );
//   return getUserData;
// };

import axios from "axios";
import { fetchAuthSession } from "@aws-amplify/auth";
import { EXPRESS_BACKEND } from "src/constants/constants";

export const fetchProfileData = async () => {
  try {
    const authToken = (
      await fetchAuthSession()
    ).tokens?.accessToken?.toString();
    console.log(authToken, "authToken");

    const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
    console.log(data);

    const email = data.tokens.idToken.payload.email;

    console.log("authToken ", authToken);

    const getUserData = await axios.get(
      `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/users`,
      {
        params: {
          email: email,
        },
        headers: {
          Authorization: authToken,
        },
      }
    );

    return getUserData;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw new Error("Failed to fetch profile data");
  }
};
