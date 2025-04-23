import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import AwsAuthenticator from "../../../auth/services/aws/components/AWSAuthenticator";
import { useDispatch } from "react-redux";
import { fetchAccountDetails } from "src/app/features/account/accountSlice";

function AwsSignInTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDemo = searchParams.get("demo") === "true";
  const demoEmail = isDemo ? "novelaitech@gmail.com" : "";
  const demoPassword = isDemo ? "MyBeats@2025" : "";

  const dispatch = useDispatch();

  // useEffect(() => {
  //   const attemptDemoLogin = async () => {
  //     if (isDemo && demoEmail && demoPassword) {
  //       console.log("demoEmail", demoEmail);
  //       console.log("demoPassword", demoPassword);
  //       console.log("isDemo", isDemo);
  //       try {
  //         const res = await signIn({
  //           username: demoEmail,
  //           password: demoPassword,
  //         });

  //         console.log("res", res);
  //         if (res.isSignedIn) {
  //           console.log("SignedInWorked", res.isSignedIn);
  //           navigate("/dashboards/analytics");
  //         }
  //       } catch (error) {
  //         console.error("Error", "error about signin");
  //       }
  //     }
  //   };

  //   attemptDemoLogin();
  // }, [isDemo, demoEmail, demoPassword, navigate]);

  useEffect(() => {
    const attemptDemoLogin = async () => {
      if (isDemo && demoEmail && demoPassword) {
        try {
          const res = await signIn({
            username: demoEmail,
            password: demoPassword,
          });
          if (res.isSignedIn) {
            navigate("/dashboards/analytics");
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
    <div>
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

      <div className="flex flex-row justify-center gap-2 items-center">
        <a
          href="/terms-and-conditions"
          className="hover:underline text-blue-600"
        >
          Terms and Conditions
        </a>
        <span> & </span>
        <a href="/privacy" className="hover:underline text-blue-600">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

export default AwsSignInTab;
