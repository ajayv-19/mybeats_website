import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const SettingsAppNavigation: FuseNavItemType = {
	id: 'apps.settings',
	title: 'Settings',
	type: 'collapse',
	icon: 'heroicons-outline:cog-6-tooth',
	url: '/apps/settings',
	children: [
		{
			id: 'apps.settings.account',
			icon: 'heroicons-outline:user-circle',
			title: 'Account',
			type: 'item',
			url: '/apps/settings/account',
			subtitle: 'Manage your profile'
		},
		{
			id: 'apps.settings.company',
			icon: 'heroicons-outline:building-office',
			title: 'Company',
			type: 'item',
			url: '/apps/settings/company',
			subtitle: 'Register your company'
		},
		{
			id: 'apps.settings.planBilling',
			icon: 'heroicons-outline:credit-card',
			title: 'Subscription',
			type: 'item',
			url: '/apps/settings/plan-billing',
			subtitle: 'Manage subscription and payment method'
		},
		{
			id: 'apps.settings.team',
			icon: 'heroicons-outline:user-group',
			title: 'Team',
			type: 'item',
			url: '/apps/settings/team',
			subtitle: 'Manage team and roles'
		},
		{
			id: 'apps.settings.policyholders',
			icon: 'heroicons-outline:lock-closed',
			title: 'Policyholders',
			type: 'item',
			url: '/apps/settings/policyholders',
			subtitle: 'Upload unique IDs'
		},
		// {
		// 	id: 'apps.settings.agent_froms',
		// 	icon: 'heroicons-outline:lock-closed',
		// 	title: 'Agent Forms',
		// 	type: 'item',
		// 	url: '/apps/settings/agent-forms',
		// 	subtitle: 'Manage agent forms'
		// },
		// {
		// 	id: 'apps.settings.notifications',
		// 	icon: 'heroicons-outline:bell',
		// 	title: 'Notifications',
		// 	type: 'item',
		// 	url: '/apps/settings/notifications',
		// 	subtitle: "Manage when you'll be notified on which channels"
		// }
	]
};

export default SettingsAppNavigation;
