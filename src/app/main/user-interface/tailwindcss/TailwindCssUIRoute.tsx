import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const TailwindCssUI = lazy(() => import('./TailwindCssUI'));

const TailwindCssUIRoute: FuseRouteItemType = {
	path: 'ui/tailwindcss',
	element: <TailwindCssUI />
};

export default TailwindCssUIRoute;
