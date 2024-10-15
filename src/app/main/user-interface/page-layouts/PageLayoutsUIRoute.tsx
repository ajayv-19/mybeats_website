import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import EmptyExampleComponent from './empty/EmptyExampleComponent';
import PageLayoutOverview from './PageLayoutOverview';
import SimpleWithSidebarsNormalScrollComponent from './simple/with-sidebars/SimpleWithSidebarsNormalScrollComponent';
import SimpleWithSidebarsPageScrollComponent from './simple/with-sidebars/SimpleWithSidebarsPageScrollComponent';
import SimpleWithSidebarsContentScrollComponent from './simple/with-sidebars/SimpleWithSidebarsContentScrollComponent';
import SimpleFullWidthNormalScrollComponent from './simple/full-width/SimpleFullWidthNormalScrollComponent';
import SimpleFullWidthPageScrollComponent from './simple/full-width/SimpleFullWidthPageScrollComponent';
import SimpleFullWidthContentScrollComponent from './simple/full-width/SimpleFullWidthContentScrollComponent';
import CardedFullWidthNormalScrollComponent from './carded/full-width/CardedFullWidthNormalScrollComponent';
import CardedFullWidthPageScrollComponent from './carded/full-width/CardedFullWidthPageScrollComponent';
import CardedFullWidthContentScrollComponent from './carded/full-width/CardedFullWidthContentScrollComponent';
import CardedWithSidebarsNormalScrollComponent from './carded/with-sidebars/CardedWithSidebarsNormalScrollComponent';
import CardedWithSidebarsPageScrollComponent from './carded/with-sidebars/CardedWithSidebarsPageScrollComponent';
import CardedWithSidebarsContentScrollComponent from './carded/with-sidebars/CardedWithSidebarsContentScrollComponent';
import overviews from './constants/overviews';

const OverviewPageLayoutsUI = lazy(() => import('./OverviewPageLayoutsUI'));

/**
 * The UI configuration for the page layouts.
 */
const PageLayoutsUIRoute: FuseRouteItemType = {
	path: 'ui/page-layouts',
	children: [
		{
			path: '',
			element: <Navigate to="overview" />
		},
		{
			path: 'overview',
			element: <OverviewPageLayoutsUI />
		},
		{
			path: 'empty',
			element: <EmptyExampleComponent />
		},
		{
			path: 'carded',
			children: [
				{
					path: 'full-width',
					children: [
						{
							path: '',
							element: <Navigate to="overview" />
						},
						{
							path: 'overview',
							element: <PageLayoutOverview layoutOptions={overviews.carded.fullWidth} />
						},
						{
							path: 'normal-scroll',
							element: <CardedFullWidthNormalScrollComponent />
						},
						{
							path: 'page-scroll',
							element: <CardedFullWidthPageScrollComponent />
						},
						{
							path: 'content-scroll',
							element: <CardedFullWidthContentScrollComponent />
						}
					]
				},
				{
					path: 'with-sidebars',
					children: [
						{
							path: '',
							element: <Navigate to="overview" />
						},
						{
							path: 'overview',
							element: <PageLayoutOverview layoutOptions={overviews.carded.withSidebars} />
						},
						{
							path: 'normal-scroll',
							element: <CardedWithSidebarsNormalScrollComponent />
						},
						{
							path: 'page-scroll',
							element: <CardedWithSidebarsPageScrollComponent />
						},
						{
							path: 'content-scroll',
							element: <CardedWithSidebarsContentScrollComponent />
						}
					]
				}
			]
		},
		{
			path: 'simple',
			children: [
				{
					path: 'full-width',
					children: [
						{
							path: '',
							element: <Navigate to="overview" />
						},
						{
							path: 'overview',
							element: <PageLayoutOverview layoutOptions={overviews.simple.fullWidth} />
						},
						{
							path: 'normal-scroll',
							element: <SimpleFullWidthNormalScrollComponent />
						},
						{
							path: 'page-scroll',
							element: <SimpleFullWidthPageScrollComponent />
						},
						{
							path: 'content-scroll',
							element: <SimpleFullWidthContentScrollComponent />
						}
					]
				},
				{
					path: 'with-sidebars',
					children: [
						{
							path: '',
							element: <Navigate to="overview" />
						},
						{
							path: 'overview',
							element: <PageLayoutOverview layoutOptions={overviews.simple.withSidebars} />
						},
						{
							path: 'normal-scroll',
							element: <SimpleWithSidebarsNormalScrollComponent />
						},
						{
							path: 'page-scroll',
							element: <SimpleWithSidebarsPageScrollComponent />
						},
						{
							path: 'content-scroll',
							element: <SimpleWithSidebarsContentScrollComponent />
						}
					]
				}
			]
		}
	]
};

export default PageLayoutsUIRoute;
