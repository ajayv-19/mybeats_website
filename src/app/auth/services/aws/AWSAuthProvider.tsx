import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import awsExports from '../../../../../src2/aws-exports';

type AWSAuthProviderProps = {
	children: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
Amplify.configure(awsExports);

function AWSAuthProvider(props: AWSAuthProviderProps) {
	const { children } = props;

	return <Authenticator.Provider>{children}</Authenticator.Provider>;
}

export default AWSAuthProvider;
