import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import Navigation from 'app/theme-layouts/shared-components/navigation/Navigation';
import NavbarToggleButton from 'app/theme-layouts/shared-components/navbar/NavbarToggleButton';
import UserMenu from 'app/theme-layouts/shared-components/UserMenu';
import { Divider, Hidden } from '@mui/material';
import NavbarPinToggleButton from 'app/theme-layouts/shared-components/navbar/NavbarPinToggleButton';
import Logo from '../../../../shared-components/Logo';

const Root = styled('div')(({ theme }) => ({
	backgroundColor: theme.palette.background.default,
	color: theme.palette.text.primary,
	'& ::-webkit-scrollbar-thumb': {
		boxShadow: `inset 0 0 0 20px ${
			theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.24)' : 'rgba(255, 255, 255, 0.24)'
		}`
	},
	'& ::-webkit-scrollbar-thumb:active': {
		boxShadow: `inset 0 0 0 20px ${
			theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.37)' : 'rgba(255, 255, 255, 0.37)'
		}`
	}
}));

const StyledContent = styled(FuseScrollbars)(() => ({
	overscrollBehavior: 'contain',
	overflowX: 'hidden',
	overflowY: 'auto',
	WebkitOverflowScrolling: 'touch',
	backgroundRepeat: 'no-repeat',
	backgroundSize: '100% 40px, 100% 10px',
	backgroundAttachment: 'local, scroll'
}));

type NavbarStyle2ContentProps = {
	className?: string;
};

/**
 * The navbar style 2 content.
 */
function NavbarStyle2Content(props: NavbarStyle2ContentProps) {
	const { className = '' } = props;

	return (
		<Root className={clsx('flex h-full flex-auto flex-col overflow-hidden', className)}>
			<div className="flex h-48 shrink-0 flex-row items-center px-12 md:h-76">
				<div className="mx-4 flex flex-1">
					<Logo />
				</div>
				<Hidden lgDown>
					<NavbarPinToggleButton className="h-32 w-32 p-0" />
				</Hidden>
				<Hidden lgUp>
					<NavbarToggleButton className="h-32 w-32 p-0" />
				</Hidden>
			</div>

			<StyledContent
				className="flex min-h-0 flex-1 flex-col"
				option={{ suppressScrollX: true, wheelPropagation: false }}
			>
				<Navigation layout="vertical" />
			</StyledContent>

			<Divider />

			<div className="p-4 md:p-10 w-full">
				<UserMenu className="w-full" />
			</div>
		</Root>
	);
}

export default memo(NavbarStyle2Content);
