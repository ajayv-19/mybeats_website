import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import DocumentationPageLayout from '../DocumentationPageLayout';

const ChangelogDoc = lazy(() => import('./ChangelogDoc'));

/**
 * Changelog Doc Route
 */
const ChangelogDocRoute: FuseRouteItemType = {
	path: 'documentation/changelog',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <ChangelogDoc />
		}
	]
};

export default ChangelogDocRoute;
