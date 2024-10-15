import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const IconListPage = lazy(() => import('./IconListPage'));

/**
 * Icons UI Route
 */
const IconsUIRoute: FuseRouteItemType = {
	path: 'ui/icons',
	children: [
		{
			path: '',
			element: <Navigate to="heroicons" />
		},
		{
			path: 'heroicons',
			children: [
				{
					path: '',
					element: <Navigate to="outline" />
				},
				{
					path: 'outline',
					element: (
						<IconListPage
							pageTitle="Heroicons Outline"
							referenceUrl="https://heroicons.com/"
							iconSet="heroicons-outline"
							apiUrl="/mock-api/ui/icons/heroicons"
						/>
					)
				},
				{
					path: 'solid',
					element: (
						<IconListPage
							pageTitle="Heroicons Solid"
							referenceUrl="https://heroicons.com/"
							iconSet="heroicons-solid"
							apiUrl="/mock-api/ui/icons/heroicons"
						/>
					)
				}
			]
		},
		{
			path: 'material',
			children: [
				{
					path: '',
					element: <Navigate to="outline" />
				},
				{
					path: 'outline',
					element: (
						<IconListPage
							pageTitle="Material Outline"
							iconSet="material-outline"
							apiUrl="/mock-api/ui/icons/material"
						/>
					)
				},
				{
					path: 'solid',
					element: (
						<IconListPage
							pageTitle="Material Solid"
							iconSet="material-solid"
							apiUrl="/mock-api/ui/icons/material"
						/>
					)
				},
				{
					path: 'twotone',
					element: (
						<IconListPage
							pageTitle="Material Twotone"
							iconSet="material-twotone"
							apiUrl="/mock-api/ui/icons/material"
						/>
					)
				}
			]
		},
		{
			path: 'feather',
			element: (
				<IconListPage
					pageTitle="Feather"
					iconSet="feather"
					apiUrl="/mock-api/ui/icons/feather"
				/>
			)
		}
	]
};

export default IconsUIRoute;
