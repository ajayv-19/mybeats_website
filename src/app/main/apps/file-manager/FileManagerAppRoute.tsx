import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const FileManagerApp = lazy(() => import('./FileManagerApp'));

/**
 * The File Manager App Route.
 */
const FileManagerAppRoute: FuseRouteItemType = {
	path: 'apps/file-manager',
	element: <FileManagerApp />,
	children: [
		{
			element: <FileManagerApp />,
			path: ':folderId'
		}
	]
};

export default FileManagerAppRoute;
