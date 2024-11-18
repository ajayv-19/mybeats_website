import AwsAuthenticator from '../../../auth/services/aws/components/AWSAuthenticator';

function AwsSignInTab() {
	return (
		<AwsAuthenticator
			initialState="signIn"
			socialProviders={[]}
			hideSignUp
		/>
		

	);
}

export default AwsSignInTab;
