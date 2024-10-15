import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const MockApiDoc = lazy(() => import('./MockApiDoc'));

/**
 * Mock Api Doc Route
 */
const MockApiDocRoute: FuseRouteItemType = {
	path: 'documentation',
	children: [
		{
			path: 'mock-api',
			element: <MockApiDoc />
		}
	]
};

export default MockApiDocRoute;
