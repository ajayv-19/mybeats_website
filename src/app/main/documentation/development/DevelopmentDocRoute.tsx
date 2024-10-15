import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Navigate } from 'react-router-dom';
import TsFileRenamingMigrationDoc from './ts-migration/TsFileRenamingMigrationDoc';
import CodeSplittingDoc from './code-splitting/CodeSplittingDoc';
import MultiLanguageDoc from './multi-language/MultiLanguageDoc';
import DocumentationPageLayout from '../DocumentationPageLayout';

const DevelopmentServerDoc = lazy(() => import('./development-server/DevelopmentServerDoc'));
const ProductionDoc = lazy(() => import('./production/ProductionDoc'));
const DeploymentDoc = lazy(() => import('./deployment/DeploymentDoc'));
const DirectoryStructureDoc = lazy(() => import('./directory-structure/DirectoryStructureDoc'));
const ApiCallsDoc = lazy(() => import('./api-calls/ApiCallsDoc'));
const UpdatingFuseReactDoc = lazy(() => import('./updating-fuse-react/UpdatingFuseReactDoc'));
const IDEsDoc = lazy(() => import('./ides-vscode-webstorm/IDEsDoc'));

/**
 * Development Doc Route
 */
const DevelopmentDocRoute: FuseRouteItemType = {
	path: 'documentation/development',
	element: <DocumentationPageLayout />,
	children: [
		{
			path: '',
			element: <Navigate to="development-server" />
		},
		{
			path: 'development-server',
			element: <DevelopmentServerDoc />
		},
		{
			path: 'production',
			element: <ProductionDoc />
		},
		{
			path: 'deployment',
			element: <DeploymentDoc />
		},
		{
			path: 'directory-structure',
			element: <DirectoryStructureDoc />
		},
		{
			path: 'api-calls',
			element: <ApiCallsDoc />
		},
		{
			path: 'code-splitting',
			element: <CodeSplittingDoc />
		},
		{
			path: 'multi-language',
			element: <MultiLanguageDoc />
		},
		{
			path: 'updating-fuse-react',
			element: <UpdatingFuseReactDoc />
		},
		{
			path: 'ts-file-rename-migration',
			element: <TsFileRenamingMigrationDoc />
		},
		{
			path: 'ides-vscode-webstorm',
			element: <IDEsDoc />
		}
	]
};

export default DevelopmentDocRoute;
