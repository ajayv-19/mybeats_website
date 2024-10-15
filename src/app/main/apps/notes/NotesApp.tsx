import { useEffect, useState } from 'react';
import { lighten, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import LabelsDialog from './dialogs/labels/LabelsDialog';
import NoteDialog from './dialogs/note/NoteDialog';
import NewNote from './NewNote';
import NoteList from './NoteList';
import NotesHeader from './NotesHeader';
import NotesSidebarContent from './NotesSidebarContent';

const Root = styled(FusePageCarded)(() => ({
	'& .FusePageCarded-header': {},
	'& .FusePageCarded-sidebar': {},
	'& .FusePageCarded-leftSidebar': {}
}));

/**
 * The notes app.
 */
function NotesApp() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);

	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
	}, [isMobile]);

	return (
		<Root
			header={<NotesHeader onSetSidebarOpen={setLeftSidebarOpen} />}
			content={
				<div className="flex flex-col w-full items-center p-0 md:p-24">
					<Box
						className="w-full rounded-lg border p-12 flex flex-col items-center"
						sx={{
							backgroundColor: (theme) =>
								theme.palette.mode === 'light'
									? lighten(theme.palette.background.default, 0.4)
									: lighten(theme.palette.background.default, 0.02)
						}}
					>
						<div className="flex justify-center p-8 pb-16 w-full">
							<NewNote />
						</div>
						<NoteList />
					</Box>
					<NoteDialog />
					<LabelsDialog />
				</div>
			}
			leftSidebarOpen={leftSidebarOpen}
			leftSidebarOnClose={() => {
				setLeftSidebarOpen(false);
			}}
			leftSidebarContent={<NotesSidebarContent />}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default NotesApp;
