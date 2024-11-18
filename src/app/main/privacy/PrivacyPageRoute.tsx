import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '../../auth/authRoles';
import PrivacyPage from './PrivacyPage';

const SignInPageRoute: FuseRouteItemType = {
	path: 'privacy',
	element: <PrivacyPage />,
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
	auth: authRoles.onlyGuest // []
};

export default SignInPageRoute;
