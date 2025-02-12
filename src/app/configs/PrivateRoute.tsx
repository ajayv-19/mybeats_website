import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import FuseLoading from "@fuse/core/FuseLoading";
import { fetchAuthSession } from "@aws-amplify/auth";

function PrivateRoute() {
  const [isLoading, setIsLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const authToken = (
          await fetchAuthSession()
        ).tokens?.accessToken?.toString();

        const data = await fetchAuthSession();
        const { email } = data.tokens.idToken.payload;

        const response = await axios.get(
          `https://b89ns5qxe2.execute-api.us-east-1.amazonaws.com/dev/backendapi/users`,
          {
            params: {
              email,
            },
            headers: {
              Authorization: authToken,
            },
          }
        );

        if (response.status === 200) {
          setUserExists(true);
          navigate("/dashboards/analytics");
        } else {
          navigate("/apps/settings/account");
        }
      } catch (error) {
        console.error("User authentication failed:", error);
        navigate("/apps/settings/account");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (isLoading) {
    return <FuseLoading />; // Show loading indicator
  }

  return userExists ? <Outlet /> : <Navigate to="/apps/settings/account" />;
}

export default PrivateRoute;
