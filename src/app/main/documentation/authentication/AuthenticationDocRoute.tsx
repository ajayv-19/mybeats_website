import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import DocumentationPageLayout from '../DocumentationPageLayout';

const AuthenticationDoc = lazy(() => import('./AuthenticationDoc'));

/**
 * Authentication Doc Route
 */
const AuthenticationDocRoute: FuseRouteItemType = {
	path: 'documentation/authentication',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <AuthenticationDoc />
		}
	]
};

export default AuthenticationDocRoute;
