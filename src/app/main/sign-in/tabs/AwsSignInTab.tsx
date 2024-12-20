import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import AwsAuthenticator from "../../../auth/services/aws/components/AWSAuthenticator";

function AwsSignInTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDemo = searchParams.get("demo") === "true";
  const demoEmail = isDemo ? "ajayvdurga911999@gmail.com" : ""; //change to env later
  const demoPassword = isDemo ? "Aj19!@#$" : "";

  useEffect(() => {
    const attemptDemoLogin = async () => {
      if (isDemo && demoEmail && demoPassword) {
        try {
          const res = await signIn({
            username: demoEmail,
            password: demoPassword,
          });
          if (res.isSignedIn) {
            navigate("/dashboards/project");
            location.reload();
          }
          console.log("Demo login successful:", res);
          // Redirect to home or dashboard after successful login
        } catch (error) {
          console.error("Demo login failed:", error);
          // Login failed - form will be shown with pre-filled credentials
        }
      }
    };

    attemptDemoLogin();
  }, [isDemo, demoEmail, demoPassword, navigate]);

  return (
    <AwsAuthenticator
      initialState="signIn"
      socialProviders={[]}
      hideSignUp
      formFields={{
        signIn: {
          username: {
            defaultValue: demoEmail,
          },
          password: {
            defaultValue: demoPassword,
          },
        },
      }}
    />
  );
}

export default AwsSignInTab;
