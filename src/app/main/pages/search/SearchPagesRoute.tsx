import { Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ClassicSearchPage = lazy(() => import('./ClassicSearchPage'));
const ModernSearchPage = lazy(() => import('./ModernSearchPage'));

/**
 * Search Pages Route
 */
const SearchPagesRoute: FuseRouteItemType = {
	path: 'pages/search',
	children: [
		{
			path: '',
			element: <Navigate to="modern" />
		},
		{
			path: 'modern',
			element: <ModernSearchPage />
		},
		{
			path: 'classic',
			element: <ClassicSearchPage />
		}
	]
};

export default SearchPagesRoute;
