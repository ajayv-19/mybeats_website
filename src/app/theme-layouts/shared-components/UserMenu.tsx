import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import useAuth from 'src/app/auth/useAuth';
import { darken } from '@mui/material/styles';
import { useAppSelector } from 'app/store/hooks';
import { alpha } from '@mui/system/colorManipulator';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import Popover, { PopoverProps } from '@mui/material/Popover/Popover';
import { Partial } from 'react-spring';

type UserMenuProps = {
	className?: string;
	popoverProps?: Partial<PopoverProps>;
	arrowIcon?: string;
};

/**
 * The user menu.
 */
function UserMenu(props: UserMenuProps) {
	const { className, popoverProps, arrowIcon = 'heroicons-outline:chevron-up' } = props;
	const user = useAppSelector(selectUser);
	const { signOut } = useAuth();
	const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);

	const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	if (!user) {
		return null;
	}

	return (
		<>
			<Button
				className={clsx(
					'user-menu flex justify-start shrink-0  min-h-56 h-56 rounded-lg p-8 space-x-12',
					className
				)}
				sx={{
					borderColor: (theme) => theme.palette.divider,
					'&:hover, &:focus': {
						backgroundColor: (theme) =>
							theme.palette.mode === 'dark'
								? alpha(theme.palette.divider, 0.1)
								: alpha(theme.palette.divider, 0.6)
					}
				}}
				onClick={userMenuClick}
				color="inherit"
			>
				{user.data.photoURL ? (
					<Avatar
						sx={{
							background: (theme) => theme.palette.background.default,
							color: (theme) => theme.palette.text.secondary
						}}
						className="avatar w-40 h-40 rounded-lg"
						alt="user photo"
						src={user.data.photoURL}
						variant="rounded"
					/>
				) : (
					<Avatar
						sx={{
							background: (theme) => darken(theme.palette.background.default, 0.05),
							color: (theme) => theme.palette.text.secondary
						}}
						className="avatar md:mx-4"
					>
						{user?.data?.displayName?.[0]}
					</Avatar>
				)}
				<div className="flex flex-col flex-auto space-y-8">
					<Typography
						component="span"
						className="title flex font-semibold text-base capitalize truncate  tracking-tight leading-none"
					>
						{user.data.displayName}
					</Typography>
					<Typography
						className="subtitle flex text-md font-medium tracking-tighter leading-none"
						color="text.secondary"
					>
						{user.data.email}
					</Typography>
				</div>
				<div className="flex flex-shrink-0 items-center space-x-8">
					<Tooltip
						title={
							<>
								{user.role?.toString()}
								{(!user.role || (Array.isArray(user.role) && user.role.length === 0)) && 'Guest'}
							</>
						}
					>
						<FuseSvgIcon
							className="info-icon"
							size={20}
						>
							heroicons-outline:information-circle
						</FuseSvgIcon>
					</Tooltip>
					<FuseSvgIcon
						className="arrow"
						size={13}
					>
						{arrowIcon}
					</FuseSvgIcon>
				</div>
			</Button>

			<Popover
				open={Boolean(userMenu)}
				anchorEl={userMenu}
				onClose={userMenuClose}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				classes={{
					paper: 'py-8 min-w-256'
				}}
				{...popoverProps}
			>
				{!user.role || user.role.length === 0 ? (
					<>
						<MenuItem
							component={Link}
							to="/sign-in"
							role="button"
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:lock-closed</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Sign In" />
						</MenuItem>
						<MenuItem
							component={Link}
							to="/sign-up"
							role="button"
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:user-plus</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Sign up" />
						</MenuItem>
					</>
				) : (
					<>
						<MenuItem
							component={Link}
							to="/apps/profile"
							onClick={userMenuClose}
							role="button"
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:user-circle</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="My Profile" />
						</MenuItem>
						<MenuItem
							component={Link}
							to="/apps/mailbox"
							onClick={userMenuClose}
							role="button"
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:envelope</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Inbox" />
						</MenuItem>
						<MenuItem
							onClick={() => {
								signOut();
							}}
						>
							<ListItemIcon className="min-w-36">
								<FuseSvgIcon>heroicons-outline:arrow-right-on-rectangle</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Sign out" />
						</MenuItem>
					</>
				)}
			</Popover>
		</>
	);
}

export default UserMenu;
