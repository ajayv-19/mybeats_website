import { useLocation } from 'react-router-dom';
import _ from '@lodash';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'app/shared-components/PageBreadcrumb';
import SettingsAppNavigation from './SettingsAppNavigation';
import { selectAccount } from 'src/app/features/account/accountSlice';
import { useSelector } from 'react-redux';

type SettingsAppHeaderProps = {
	className?: string;
	onSetSidebarOpen: (open: boolean) => void;
	isUserExists: boolean;
};

function SettingsAppHeader(props: SettingsAppHeaderProps) {
	const { user } = useSelector(selectAccount); // Get user from Redux
	const { className, onSetSidebarOpen, isUserExists } = props;
	const { pathname } = useLocation();

	if (!user) {
		return null; // Return null if user is not available
	}

	console.log("===>", user.company_id);
	// Filter navigation based on user.company
	const filterItems = ['apps.settings.account', 'apps.settings.company']
	const navigation = isUserExists
		? SettingsAppNavigation.children
		: SettingsAppNavigation.children.filter((item) => item.id === 'apps.settings.account');
	console.log("navigation===>", navigation);
	const filteredNavigation = user?.company_id
		? navigation // If company exists, show all navigation items
		: navigation.filter(
			(item) =>
				filterItems.includes(item.id)
		); // If no company, show only Account and Company tabs
	console.log("filtered===>", filteredNavigation);
	// Find the current navigation item based on the URL
	const currentNavigation = _.find(filteredNavigation, { url: pathname });
	console.log("current===>", currentNavigation);

	return (
		<div className={clsx('flex space-x-12', className)}>
			<Hidden lgUp>
				<IconButton
					className="border border-divider"
					onClick={() => onSetSidebarOpen(true)}
					aria-label="open left sidebar"
				>
					<FuseSvgIcon>heroicons-outline:bars-3</FuseSvgIcon>
				</IconButton>
			</Hidden>
			<div>
				<PageBreadcrumb className="mb-8" />

				<Typography className="text-3xl font-bold leading-none tracking-tight lg:ml-0">
					{currentNavigation?.title}
				</Typography>
			</div>
		</div>
	);
}

export default SettingsAppHeader;


