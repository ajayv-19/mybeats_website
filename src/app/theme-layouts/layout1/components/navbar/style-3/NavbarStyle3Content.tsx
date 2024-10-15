import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import clsx from 'clsx';
import { memo, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import FuseNavigation from '@fuse/core/FuseNavigation';
import { useLocation } from 'react-router-dom';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import isUrlInChildren from '@fuse/core/FuseNavigation/isUrlInChildren';
import { Location } from 'history';
import { Theme } from '@mui/system';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import { selectNavigation } from 'app/theme-layouts/shared-components/navigation/store/navigationSlice';
import { navbarCloseMobile } from 'app/theme-layouts/shared-components/navbar/navbarSlice';
import { Divider } from '@mui/material';
import UserMenu from 'app/theme-layouts/shared-components/UserMenu';

const Root = styled('div')(({ theme }) => ({
	backgroundColor: theme.palette.background.default,
	color: theme.palette.text.primary
}));

type StyledPanelProps = {
	theme?: Theme;
	opened?: boolean;
};

const StyledPanel = styled(FuseScrollbars)<StyledPanelProps>(({ theme, opened }) => ({
	backgroundColor: theme.palette.background.default,
	color: theme.palette.text.primary,
	transition: theme.transitions.create(['opacity'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.shortest
	}),
	opacity: 0,
	pointerEvents: 'none',
	...(opened && {
		opacity: 1,
		pointerEvents: 'initial'
	}),
	minHeight: 0
}));

/**
 * Check if the item needs to be opened.
 */
function needsToBeOpened(location: Location, item: FuseNavItemType) {
	return location && isUrlInChildren(item, location.pathname);
}

type NavbarStyle3ContentProps = { className?: string; dense?: number };

/**
 * The navbar style 3 content.
 */
function NavbarStyle3Content(props: NavbarStyle3ContentProps) {
	const { className = '', dense = false } = props;
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const navigation = useAppSelector(selectNavigation);
	const [selectedNavigation, setSelectedNavigation] = useState<FuseNavItemType[]>([]);
	const [panelOpen, setPanelOpen] = useState(false);
	const dispatch = useAppDispatch();
	const location = useLocation();

	useEffect(() => {
		navigation?.forEach((item) => {
			if (needsToBeOpened(location, item)) {
				setSelectedNavigation([item]);
			}
		});
	}, [navigation, location]);

	function handleParentItemClick(selected: FuseNavItemType) {
		/** if there is no child item do not set/open panel
		 */
		if (!selected.children) {
			setSelectedNavigation([]);
			setPanelOpen(false);
			return;
		}

		/**
		 * If navigation already selected toggle panel visibility
		 */
		if (selectedNavigation[0]?.id === selected.id) {
			setPanelOpen(!panelOpen);
		} else {
			/**
			 * Set navigation and open panel
			 */
			setSelectedNavigation([selected]);
			setPanelOpen(true);
		}
	}

	function handleChildItemClick() {
		setPanelOpen(false);

		if (isMobile) {
			dispatch(navbarCloseMobile());
		}
	}

	return (
		<ClickAwayListener onClickAway={() => setPanelOpen(false)}>
			<Root className={clsx('flex h-full flex-auto', className)}>
				<div
					id="fuse-navbar-side-panel"
					className="flex shrink-0 flex-col items-center h-full"
				>
					<img
						className="my-32 w-44"
						src="assets/images/logo/logo.svg"
						alt="logo"
					/>

					<FuseScrollbars
						className="flex flex-col min-h-0 w-full flex-1 justify-start overflow-y-auto overflow-x-hidden"
						option={{
							suppressScrollX: true,
							wheelPropagation: false
						}}
					>
						<FuseNavigation
							className={clsx('navigation shrink-0 justify-center min-h-full')}
							navigation={navigation}
							layout="vertical-2"
							onItemClick={handleParentItemClick}
							firstLevel
							selectedId={selectedNavigation[0]?.id}
							dense={Boolean(dense)}
						/>
					</FuseScrollbars>
					<Divider />

					<div className="flex shrink-0 justify-center w-full py-16">
						<UserMenu className="" />
					</div>
				</div>

				{selectedNavigation.length > 0 && (
					<StyledPanel
						id="fuse-navbar-panel"
						opened={panelOpen}
						className={clsx('overflow-y-auto overflow-x-hidden shadow pt-16')}
						option={{ suppressScrollX: true, wheelPropagation: false }}
					>
						<FuseNavigation
							className={clsx('navigation')}
							navigation={selectedNavigation}
							layout="vertical"
							onItemClick={handleChildItemClick}
						/>
					</StyledPanel>
				)}
			</Root>
		</ClickAwayListener>
	);
}

export default memo(NavbarStyle3Content);
