import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import ContactView from './contact/ContactView';
import ContactForm from './contact/ContactForm';

const ContactsApp = lazy(() => import('./ContactsApp'));

/**
 * The ContactsApp Route.
 */
const ContactsAppRoute: FuseRouteItemType = {
	path: 'apps/contacts',
	element: <ContactsApp />,
	children: [
		{
			path: ':id',
			element: <ContactView />
		},
		{
			path: ':id/edit',
			element: <ContactForm />
		}
	]
};

export default ContactsAppRoute;
