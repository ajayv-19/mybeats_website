import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
	const { user } = useSelector(selectAccount);
	const dispatch = useDispatch<AppDispatch>();

	const navigate = useNavigate();

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

	return (
		<Root
			content={
				<div className="flex-auto p-12 md:p-32 lg:p-48">
					<SettingsAppHeader
						className="mb-24 md:mb-32"
						onSetSidebarOpen={setLeftSidebarOpen}
						isUserExists={!!user}
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
					isUserExists={!!user}
				/>
			}
			leftSidebarWidth={380}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default SettingsApp;
