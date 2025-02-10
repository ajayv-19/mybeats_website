import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import AwsAuthenticator from '../../../auth/services/aws/components/AWSAuthenticator';
import { useDispatch } from 'react-redux';
import { fetchAccountDetails } from 'src/app/features/account/accountSlice';

function AwsSignInTab() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const isDemo = searchParams.get('demo') === 'true';
	const demoEmail = isDemo ? 'ajayvdurga911999@gmail.com' : '';
	const demoPassword = isDemo ? 'Aj19!@#$' : '';

	const dispatch = useDispatch();

  useEffect(() => {
    const attemptDemoLogin = async () => {
      if (isDemo && demoEmail && demoPassword) {
        console.log("demoEmail", demoEmail);
        console.log("demoPassword", demoPassword);
        console.log("isDemo", isDemo);
        try {
          const res = await signIn({
            username: demoEmail,
            password: demoPassword,
          });

          console.log("res", res);
          if (res.isSignedIn) {
            console.log("SignedInWorked", res.isSignedIn);
            navigate("/dashboards/analytics");
          }
        } catch (error) {
          console.error("Error", "error about signin");
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
