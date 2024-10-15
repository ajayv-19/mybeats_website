import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import DocumentationPageLayout from '../DocumentationPageLayout';

const Accordion = lazy(() => import('./pages/Accordion'));
const Alert = lazy(() => import('./pages/Alert'));
const AppBar = lazy(() => import('./pages/AppBar'));
const Autocomplete = lazy(() => import('./pages/Autocomplete'));
const Avatars = lazy(() => import('./pages/Avatars'));
const Backdrop = lazy(() => import('./pages/Backdrop'));
const Badges = lazy(() => import('./pages/Badges'));
const BottomNavigation = lazy(() => import('./pages/BottomNavigation'));
const Box = lazy(() => import('./pages/Box'));
const Breadcrumbs = lazy(() => import('./pages/Breadcrumbs'));
const ButtonGroup = lazy(() => import('./pages/ButtonGroup'));
const Buttons = lazy(() => import('./pages/Buttons'));
const Cards = lazy(() => import('./pages/Cards'));
const Checkboxes = lazy(() => import('./pages/Checkboxes'));
const Chips = lazy(() => import('./pages/Chips'));
const Container = lazy(() => import('./pages/Container'));
const CssBaseline = lazy(() => import('./pages/CssBaseline'));
const Dialogs = lazy(() => import('./pages/Dialogs'));
const Dividers = lazy(() => import('./pages/Dividers'));
const Drawers = lazy(() => import('./pages/Drawers'));
const FloatingActionButton = lazy(() => import('./pages/FloatingActionButton'));
const Grid = lazy(() => import('./pages/Grid'));
const Grid2 = lazy(() => import('./pages/Grid2'));
const ImageList = lazy(() => import('./pages/ImageList'));
const Links = lazy(() => import('./pages/Links'));
const Lists = lazy(() => import('./pages/Lists'));
const Masonry = lazy(() => import('./pages/Masonry'));
const Menus = lazy(() => import('./pages/Menus'));
const Modal = lazy(() => import('./pages/Modal'));
const Pagination = lazy(() => import('./pages/Pagination'));
const Paper = lazy(() => import('./pages/Paper'));
const Popover = lazy(() => import('./pages/Popover'));
const Popper = lazy(() => import('./pages/Popper'));
const Progress = lazy(() => import('./pages/Progress'));
const RadioButtons = lazy(() => import('./pages/RadioButtons'));
const Rating = lazy(() => import('./pages/Rating'));
const Selects = lazy(() => import('./pages/Selects'));
const Skeleton = lazy(() => import('./pages/Skeleton'));
const Slider = lazy(() => import('./pages/Slider'));
const Snackbars = lazy(() => import('./pages/Snackbars'));
const SpeedDial = lazy(() => import('./pages/SpeedDial'));
const Stack = lazy(() => import('./pages/Stack'));
const Steppers = lazy(() => import('./pages/Steppers'));
const Switches = lazy(() => import('./pages/Switches'));
const Table = lazy(() => import('./pages/Table'));
const Tabs = lazy(() => import('./pages/Tabs'));
const TextFields = lazy(() => import('./pages/TextFields'));
const Timeline = lazy(() => import('./pages/Timeline'));
const ToggleButton = lazy(() => import('./pages/ToggleButton'));
const Tooltips = lazy(() => import('./pages/Tooltips'));
const TransferList = lazy(() => import('./pages/TransferList'));
const Transitions = lazy(() => import('./pages/Transitions'));
const Typography = lazy(() => import('./pages/Typography'));

const MaterialUIComponentsRoute = {
	path: 'documentation/material-ui-components',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <Navigate to="accordion" />
		},
		{ path: 'accordion', element: <Accordion /> },
		{ path: 'alert', element: <Alert /> },
		{ path: 'app-bar', element: <AppBar /> },
		{ path: 'autocomplete', element: <Autocomplete /> },
		{ path: 'avatars', element: <Avatars /> },
		{ path: 'backdrop', element: <Backdrop /> },
		{ path: 'badges', element: <Badges /> },
		{ path: 'bottom-navigation', element: <BottomNavigation /> },
		{ path: 'box', element: <Box /> },
		{ path: 'breadcrumbs', element: <Breadcrumbs /> },
		{ path: 'button-group', element: <ButtonGroup /> },
		{ path: 'buttons', element: <Buttons /> },
		{ path: 'cards', element: <Cards /> },
		{ path: 'checkboxes', element: <Checkboxes /> },
		{ path: 'chips', element: <Chips /> },
		{ path: 'container', element: <Container /> },
		{ path: 'css-baseline', element: <CssBaseline /> },
		{ path: 'dialogs', element: <Dialogs /> },
		{ path: 'dividers', element: <Dividers /> },
		{ path: 'drawers', element: <Drawers /> },
		{ path: 'floating-action-button', element: <FloatingActionButton /> },
		{ path: 'grid', element: <Grid /> },
		{ path: 'grid2', element: <Grid2 /> },
		{ path: 'image-list', element: <ImageList /> },
		{ path: 'links', element: <Links /> },
		{ path: 'lists', element: <Lists /> },
		{ path: 'masonry', element: <Masonry /> },
		{ path: 'menus', element: <Menus /> },
		{ path: 'modal', element: <Modal /> },
		{ path: 'pagination', element: <Pagination /> },
		{ path: 'paper', element: <Paper /> },
		{ path: 'popover', element: <Popover /> },
		{ path: 'popper', element: <Popper /> },
		{ path: 'progress', element: <Progress /> },
		{ path: 'radio-buttons', element: <RadioButtons /> },
		{ path: 'rating', element: <Rating /> },
		{ path: 'selects', element: <Selects /> },
		{ path: 'skeleton', element: <Skeleton /> },
		{ path: 'slider', element: <Slider /> },
		{ path: 'snackbars', element: <Snackbars /> },
		{ path: 'speed-dial', element: <SpeedDial /> },
		{ path: 'stack', element: <Stack /> },
		{ path: 'steppers', element: <Steppers /> },
		{ path: 'switches', element: <Switches /> },
		{ path: 'table', element: <Table /> },
		{ path: 'tabs', element: <Tabs /> },
		{ path: 'text-fields', element: <TextFields /> },
		{ path: 'timeline', element: <Timeline /> },
		{ path: 'toggle-button', element: <ToggleButton /> },
		{ path: 'tooltips', element: <Tooltips /> },
		{ path: 'transfer-list', element: <TransferList /> },
		{ path: 'transitions', element: <Transitions /> },
		{ path: 'typography', element: <Typography /> }
	]
};

export default MaterialUIComponentsRoute;
