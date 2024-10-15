import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'app/shared-components/PageBreadcrumb';
import NotesSearch from './NotesSearch';
import { selectVariateDescSize, toggleVariateDescSize } from './notesAppSlice';

type NotesHeaderProps = {
	onSetSidebarOpen: (open: boolean) => void;
};

/**
 * The notes header.
 */
function NotesHeader(props: NotesHeaderProps) {
	const { onSetSidebarOpen } = props;

	const dispatch = useAppDispatch();
	const variateDescSize = useAppSelector(selectVariateDescSize);

	return (
		<div className="flex  flex-1 flex-col sm:flex-row sm:items-center justify-between py-8 sm:py-24 relative">
			<motion.span
				initial={{ x: -20 }}
				animate={{
					x: 0,
					transition: { delay: 0.2 }
				}}
			>
				<div className="flex flex-col mb-12 sm:mb-0">
					<PageBreadcrumb className="mb-4" />
					<Typography className="text-4xl font-extrabold leading-none tracking-tight">Notes</Typography>
				</div>
			</motion.span>

			<div className="flex flex-1 w-full sm:w-auto items-center justify-end space-x-8">
				<Hidden lgUp>
					<IconButton
						onClick={() => onSetSidebarOpen(true)}
						aria-label="open left sidebar"
						className="border border-divider"
					>
						<FuseSvgIcon>heroicons-outline:bars-3</FuseSvgIcon>
					</IconButton>
				</Hidden>
				<Tooltip title="Toggle Variate Description Size">
					<IconButton
						className="border border-divider"
						onClick={() => dispatch(toggleVariateDescSize())}
					>
						<FuseSvgIcon color={variateDescSize ? 'action' : 'disabled'}>
							heroicons-solid:arrows-up-down
						</FuseSvgIcon>
					</IconButton>
				</Tooltip>
				<NotesSearch />
			</div>
		</div>
	);
}

export default NotesHeader;
