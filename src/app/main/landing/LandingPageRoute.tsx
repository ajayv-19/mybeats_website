import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '../../auth/authRoles';
import LandingPage from './LandingPage';

const LandingPageRoute: FuseRouteItemType = {
	path: 'home',
	element: <LandingPage />,
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

export default LandingPageRoute;
