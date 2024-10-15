import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import StaffRoleExample from './StaffRoleExample';
import authRoles from '../../../auth/authRoles';

/**
 * StaffRoleExampleConfig
 */
const StaffRoleExampleRoute: FuseRouteItemType = {
	path: 'auth/staff-role-example',
	element: <StaffRoleExample />,
	auth: authRoles.staff // ['admin','staff']
};

export default StaffRoleExampleRoute;
