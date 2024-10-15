import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import SignUpPage from './SignUpPage';
import authRoles from '../../auth/authRoles';

/**
 * Sign-up page route.
 */
const SignUpPageRoute: FuseRouteItemType = {
	path: 'sign-up',
	element: <SignUpPage />,
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				toolbar: {
					display: false
				},
				footer: {
					display: false
				},
				leftSidePanel: {
					display: false
				},
				rightSidePanel: {
					display: false
				}
			}
		}
	},
	auth: authRoles.onlyGuest
};

export default SignUpPageRoute;
