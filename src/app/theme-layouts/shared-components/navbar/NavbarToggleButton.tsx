import IconButton from '@mui/material/IconButton';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { selectFuseCurrentSettings, setDefaultSettings } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import _ from '@lodash';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import clsx from 'clsx';
import { IconButtonProps } from '@mui/material/IconButton/IconButton';
import { navbarToggle, navbarToggleMobile } from './navbarSlice';

export type NavbarToggleButtonProps = IconButtonProps;

/**
 * The navbar toggle button.
 */
function NavbarToggleButton(props: NavbarToggleButtonProps) {
	const {
		className = '',
		children = (
			<FuseSvgIcon
				size={20}
				color="action"
			>
				heroicons-outline:bars-3
			</FuseSvgIcon>
		),
		...rest
	} = props;

	const dispatch = useAppDispatch();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const settings: FuseSettingsConfigType = useAppSelector(selectFuseCurrentSettings);
	const { config } = settings.layout;

	return (
		<IconButton
			onClick={() => {
				if (isMobile) {
					dispatch(navbarToggleMobile());
				} else if (config?.navbar?.style === 'style-2') {
					dispatch(
						setDefaultSettings(
							_.set({}, 'layout.config.navbar.folded', !settings?.layout?.config?.navbar?.folded)
						)
					);
				} else {
					dispatch(navbarToggle());
				}
			}}
			{...rest}
			className={clsx('border border-divider', className)}
		>
			{children}
		</IconButton>
	);
}

export default NavbarToggleButton;
