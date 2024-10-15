import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import Chat from './chat/Chat';
import MessengerFirstScreen from './MessengerFirstScreen';

const MessengerApp = lazy(() => import('./MessengerApp'));

/**
 * Messenger App Route
 */
const MessengerAppRoute: FuseRouteItemType = {
	path: 'apps/messenger',
	element: <MessengerApp />,
	children: [
		{
			path: '',
			element: <MessengerFirstScreen />
		},
		{
			path: ':id',
			element: <Chat />
		}
	]
};

export default MessengerAppRoute;
