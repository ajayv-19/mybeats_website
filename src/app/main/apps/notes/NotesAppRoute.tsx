import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const NotesApp = lazy(() => import('./NotesApp'));

/**
 * The Notes App Route
 */
const NotesAppRoute: FuseRouteItemType = {
	path: 'apps/notes',
	children: [
		{
			path: '',
			element: <NotesApp />,
			exact: true
		},
		{
			path: ':filter',
			element: <NotesApp />,
			children: [
				{
					path: ':id'
				}
			]
		}
	]
};

export default NotesAppRoute;
