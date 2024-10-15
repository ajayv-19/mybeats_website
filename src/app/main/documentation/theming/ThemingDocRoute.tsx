import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import DocumentationPageLayout from '../DocumentationPageLayout';

const ThemeShemesDoc = lazy(() => import('./theme-schemes/ThemeShemesDoc'));
const ThemeLayoutsDoc = lazy(() => import('./theme-layouts/ThemeLayoutsDoc'));
const PageLayoutsDoc = lazy(() => import('./page-layouts/PageLayoutsDoc'));
const RTLSupportDoc = lazy(() => import('./rtl-support/RTLSupportDoc'));
const ChangingDefaultFontDoc = lazy(() => import('./changing-default-font/ChangingDefaultFontDoc'));

/**
 * Theming Doc Routes
 */
const ThemingDocRoute: FuseRouteItemType = {
	path: 'documentation/theming',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <Navigate to="theme-schemes" />
		},
		{
			path: 'theme-schemes',
			element: <ThemeShemesDoc />
		},
		{
			path: 'theme-layouts',
			element: <ThemeLayoutsDoc />
		},
		{
			path: 'page-layouts',
			element: <PageLayoutsDoc />
		},
		{
			path: 'rtl-support',
			element: <RTLSupportDoc />
		},
		{
			path: 'changing-default-font',
			element: <ChangingDefaultFontDoc />
		}
	]
};

export default ThemingDocRoute;
