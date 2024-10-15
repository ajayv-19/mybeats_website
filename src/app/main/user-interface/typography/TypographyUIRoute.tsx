import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const TypographyUI = lazy(() => import('./TypographyUI'));

const TypographyUIRoute: FuseRouteItemType = {
	path: 'ui/typography',
	element: <TypographyUI />
};

export default TypographyUIRoute;
