import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import DocumentationPageLayout from '../DocumentationPageLayout';

const ReactHookFormDoc = lazy(() => import('./react-hook-form/ReactHookFormDoc'));
const GoogleMapReactDoc = lazy(() => import('./google-map-react/GoogleMapReactDoc'));
const ReactApexchartsDoc = lazy(() => import('./react-apexcharts/ReactApexchartsDoc'));

/**
 * Third Party Components Doc Routes
 */
const ThirdPartyComponentsRoute: FuseRouteItemType = {
	path: '/documentation/third-party-components',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <Navigate to="react-hook-form" />
		},
		{
			path: 'react-hook-form',
			element: <ReactHookFormDoc />
		},
		{
			path: 'google-map-react',
			element: <GoogleMapReactDoc />
		},
		{
			path: 'react-apexcharts',
			element: <ReactApexchartsDoc />
		}
	]
};

export default ThirdPartyComponentsRoute;
