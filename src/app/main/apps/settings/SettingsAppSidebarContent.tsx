import FuseNavigation from '@fuse/core/FuseNavigation/FuseNavigation';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import SettingsAppNavigation from './SettingsAppNavigation';

const Root = styled('div')(({ theme }) => ({
	'&  .navigation': {
		padding: 0,
		borderTop: `1px solid ${theme.palette.divider}`
	},
	'&  .fuse-list-item': {
		padding: '20px 32px',
		margin: 0,
		borderRadius: 0,
		alignItems: 'start',
		borderBottom: `1px solid ${theme.palette.divider}`,
		'&.active': {
			backgroundColor: `${alpha(theme.palette.primary.main, 0.1)}!important`,
			'&  .fuse-list-item-icon': {
				color: `${theme.palette.primary.main}!important`
			},
			'&  .fuse-list-item-text-primary': {
				color: `${theme.palette.primary.main}!important`
			}
		}
	},
	'&  .fuse-list-item-text-primary': {
		fontSize: 13,
		fontWeight: '500'
	},
	'&  .fuse-list-item-text-secondary': {
		fontSize: 12,
		whiteSpace: 'normal',
		fontWeight: '400'
	}
}));

type SettingsAppSidebarContentProps = {
	className?: string;
	onSetSidebarOpen: (open: boolean) => void;
};

function SettingsAppSidebarContent(props: SettingsAppSidebarContentProps) {
	const { className, onSetSidebarOpen } = props;

	return (
		<Root>
			<div className={clsx('m-32 mr-24 flex items-center justify-between sm:my-40', className)}>
				<Typography className="text-4xl font-extrabold leading-none tracking-tight"> Settings</Typography>
				<Hidden lgUp>
					<IconButton
						onClick={() => onSetSidebarOpen(false)}
						aria-label="close left sidebar"
						size="small"
					>
						<FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
					</IconButton>
				</Hidden>
			</div>
			<FuseNavigation navigation={SettingsAppNavigation.children} />
		</Root>
	);
}

export default SettingsAppSidebarContent;
