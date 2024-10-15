import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const DocumentationPageLayout = lazy(() => import('./DocumentationPageLayout'));

/**
 * Documentation Route
 */
const DocumentationRoute: FuseRouteItemType = {
	path: 'documentation',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <Navigate to="getting-started/introduction" />
		}
	]
};

export default DocumentationRoute;
