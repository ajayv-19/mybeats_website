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
			title: 'Plan subscription',
			type: 'item',
			url: '/apps/settings/plan-billing',
			subtitle: 'Manage subscription plan and payment method'
		},
		{
			id: 'apps.settings.team',
			icon: 'heroicons-outline:user-group',
			title: 'Team',
			type: 'item',
			url: '/apps/settings/team',
			subtitle: 'Manage your existing team and change roles/permissions'
		},
		{
			id: 'apps.settings.policyholders',
			icon: 'heroicons-outline:lock-closed',
			title: 'Polciyholders',
			type: 'item',
			url: '/apps/settings/policyholders',
			subtitle: 'Manage your password and 2-step verification preferences'
		},
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
