import * as Sentry from '@sentry/react';
import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import { SnackbarProvider } from 'notistack';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache, { Options } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { selectCurrentLanguageDirection } from 'app/store/i18nSlice';
import themeLayouts from 'app/theme-layouts/themeLayouts';
import { selectMainTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import MockAdapterProvider from '@mock-api/MockAdapterProvider';
import { useAppSelector } from 'app/store/hooks';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import AuthenticationProvider from './auth/AuthenticationProvider';
import withAppProviders from './withAppProviders';
import { ModalProvider } from './context/dashboardmodelcontext';

Sentry.init({
	dsn: 'https://11d7ede021fda5d9ef5448ded0a7f88e@o1064605.ingest.us.sentry.io/4508641995390976',
	integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
	// Tracing
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
	// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
	tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const emotionCacheOptions = {
	rtl: {
		key: 'muirtl',
		stylisPlugins: [rtlPlugin],
		insertionPoint: document.getElementById('emotion-insertion-point')
	},
	ltr: {
		key: 'muiltr',
		stylisPlugins: [],
		insertionPoint: document.getElementById('emotion-insertion-point')
	}
};

/**
 * The main App component.
 */
function App() {
	const langDirection = useAppSelector(selectCurrentLanguageDirection);
	const mainTheme = useSelector(selectMainTheme);

	const cacheProviderValue = useMemo(
		() => createCache(emotionCacheOptions[langDirection] as Options),
		[langDirection]
	);

	return (
		<ModalProvider>
		<MockAdapterProvider>
			<CacheProvider value={cacheProviderValue}>
				<FuseTheme
					theme={mainTheme}
					root
				>
					<AuthenticationProvider>
						<SnackbarProvider
							maxSnack={5}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right'
							}}
							classes={{
								containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99'
							}}
						>
							<FuseLayout layouts={themeLayouts} />
						</SnackbarProvider>
					</AuthenticationProvider>
				</FuseTheme>
			</CacheProvider>
		</MockAdapterProvider>
		</ModalProvider>
	);
}

const AppWithProviders = withAppProviders(App);

export default AppWithProviders;
