import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { fetchAccountDetails, selectAccount } from 'src/app/features/account/accountSlice';
import { AppDispatch } from 'app/store/store';
import FusePageSimple from '@fuse/core/FusePageSimple';
import SettingsAppSidebarContent from './SettingsAppSidebarContent';
import SettingsAppHeader from './SettingsAppHeader';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageCarded-header': {},
	'& .FusePageCarded-sidebar': {},
	'& .FusePageCarded-leftSidebar': {}
}));

/**
 * The settings app.
 */
function SettingsApp() {
	const location = useLocation();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
	const [isUserExists, setIsUserExists] = useState(false);
	const account = useSelector(selectAccount);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
	}, [isMobile]);

	useEffect(() => {
		if (isMobile) {
			setLeftSidebarOpen(false);
		}
	}, [location, isMobile]);

	// Fetch user existence status
	useEffect(() => {
		dispatch(fetchAccountDetails());
	}, []);

	useEffect(() => {
		if (account.error) {
			setIsUserExists(false);
		} else {
			setIsUserExists(true);
		}
	}, [account]);

	// Redirect to account page if not on it and user doesn't exist
	if (!isUserExists && location.pathname !== '/apps/settings/account') {
		return <Navigate to="/apps/settings/account" />;
	}

	return (
		<Root
			content={
				<div className="flex-auto p-12 md:p-32 lg:p-48">
					<SettingsAppHeader
						className="mb-24 md:mb-32"
						onSetSidebarOpen={setLeftSidebarOpen}
						isUserExists={isUserExists}
					/>
					<Outlet />
				</div>
			}
			leftSidebarOpen={leftSidebarOpen}
			leftSidebarOnClose={() => {
				setLeftSidebarOpen(false);
			}}
			leftSidebarContent={
				<SettingsAppSidebarContent
					onSetSidebarOpen={setLeftSidebarOpen}
					isUserExists={isUserExists}
				/>
			}
			leftSidebarWidth={380}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default SettingsApp;
