import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import TaskForm from './task/TaskForm';

const TasksApp = lazy(() => import('./TasksApp'));

/**
 * The Tasks App Route
 */
const TasksAppRoute: FuseRouteItemType = {
	path: 'apps/tasks',
	element: <TasksApp />,
	children: [
		{
			path: ':id',
			element: <TaskForm />
		},
		{
			path: ':id/:type',
			element: <TaskForm />
		}
	]
};

export default TasksAppRoute;
