import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import GuestRoleExample from './GuestRoleExample';
import authRoles from '../../../auth/authRoles';

/**
 * GuestRoleExampleRoute
 */
const GuestRoleExampleRoute: FuseRouteItemType = {
	path: 'auth/guest-role-example',
	element: <GuestRoleExample />,
	auth: authRoles.onlyGuest // ['guest']
};

export default GuestRoleExampleRoute;
