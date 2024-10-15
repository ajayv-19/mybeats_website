// Dynamically import all *ConfigConfig.tsx files from the app folder
import { FuseRouteConfigType, FuseRoutesType } from '@fuse/utils/FuseUtils';
import settingsConfig from 'app/configs/settingsConfig';
import { Navigate } from 'react-router-dom';
import FuseLoading from '@fuse/core/FuseLoading';
import { layoutConfigOnlyMain } from 'app/configs/layoutConfigTemplates';
import ErrorBoundary from '@fuse/utils/ErrorBoundary';
import App from '../App';
import Error404Page from '../main/404/Error404Page';
import Error401Page from '../main/401/Error401Page';

const configModules: Record<string, unknown> = import.meta.glob('/src/app/main/**/*Route.tsx', { eager: true });

const mainRoutes: FuseRouteConfigType[] = Object.keys(configModules)
	.map((modulePath) => {
		const moduleConfigs = (configModules[modulePath] as { default: FuseRouteConfigType | FuseRouteConfigType[] })
			.default;
		return Array.isArray(moduleConfigs) ? moduleConfigs : [moduleConfigs];
	})
	.flat();

const routes: FuseRoutesType = [
	{
		path: '/',
		element: <App />,
		auth: settingsConfig.defaultAuth,
		errorElement: <ErrorBoundary />,
		children: [
			{
				path: '/',
				element: <Navigate to="/dashboards/project" />
			},
			...mainRoutes,
			{
				path: 'loading',
				element: <FuseLoading />,
				settings: { layout: layoutConfigOnlyMain }
			},
			{
				path: '401',
				element: <Error401Page />
			},
			{
				path: '404',
				element: <Error404Page />,
				settings: { layout: layoutConfigOnlyMain },
				auth: null
			}
		]
	},
	{
		path: '*',
		element: <Navigate to="404" />
	}
];

export default routes;
