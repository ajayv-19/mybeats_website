import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Navigate } from 'react-router-dom';
import DocumentationPageLayout from '../DocumentationPageLayout';

const SettingsDoc = lazy(() => import('./settings/SettingsDoc'));
const RoutingDoc = lazy(() => import('./routing/RoutingDoc'));
const NavigationDoc = lazy(() => import('./navigation/NavigationDoc'));

/**
 * Configuration Doc Route
 */
const ConfigurationDocRoute: FuseRouteItemType = {
	path: 'documentation/configuration',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <Navigate to="settings" />
		},
		{
			path: 'settings',
			element: <SettingsDoc />
		},
		{
			path: 'routing',
			element: <RoutingDoc />
		},
		{
			path: 'navigation',
			element: <NavigationDoc />
		}
	]
};

export default ConfigurationDocRoute;
