import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FuseThemeOption } from '@fuse/core/FuseThemeSelector/ThemePreview';
import { changeFuseTheme, selectMainTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

type LightDarkModeToggleProps = {
	className?: string;
	lightTheme: FuseThemeOption;
	darkTheme: FuseThemeOption;
};

function LightDarkModeToggle(props: LightDarkModeToggleProps) {
	const { className = '', lightTheme, darkTheme } = props;
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const dispatch = useAppDispatch();

	const mainTheme = useSelector(selectMainTheme);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelectionChange = (selection: 'light' | 'dark') => {
		if (selection === 'light') {
			handleThemeSelect(lightTheme);
		} else {
			handleThemeSelect(darkTheme);
		}

		handleClose();
	};

	function handleThemeSelect(_theme: FuseThemeOption) {
		dispatch(changeFuseTheme(_theme?.section)).then(() => {});
	}

	return (
		<>
			<IconButton
				aria-controls="light-dark-toggle-menu"
				aria-haspopup="true"
				onClick={handleClick}
				className={clsx('border border-divider', className)}
			>
				{mainTheme.palette.mode === 'light' && <FuseSvgIcon>heroicons-outline:sun</FuseSvgIcon>}
				{mainTheme.palette.mode === 'dark' && <FuseSvgIcon>heroicons-outline:moon</FuseSvgIcon>}
			</IconButton>
			<Menu
				id="light-dark-toggle-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				<MenuItem
					selected={mainTheme.palette.mode === 'light'}
					onClick={() => handleSelectionChange('light')}
				>
					Light
				</MenuItem>
				<MenuItem
					selected={mainTheme.palette.mode === 'dark'}
					onClick={() => handleSelectionChange('dark')}
				>
					Dark
				</MenuItem>
			</Menu>
		</>
	);
}

export default LightDarkModeToggle;
