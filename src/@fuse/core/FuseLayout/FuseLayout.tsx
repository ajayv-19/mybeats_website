import { useDeepCompareEffect } from '@fuse/hooks';
import _ from '@lodash';
import {
	generateSettings,
	selectFuseCurrentSettings,
	selectFuseDefaultSettings,
	setSettings
} from '@fuse/core/FuseSettings/fuseSettingsSlice';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { useLocation, RouteMatch, RouteObject } from 'react-router-dom';
import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import { themeLayoutsType } from 'app/theme-layouts/themeLayouts';
import { PartialDeep } from 'type-fest';
import { getFuseRouteParamUtil } from '@fuse/hooks/useFuseRouteParameter';
import FuseLoading from '../FuseLoading';

export type FuseRouteObjectType = RouteObject & {
	settings?: FuseSettingsConfigType;
	auth?: string[] | [] | null | undefined;
};

export type FuseRouteMatchType = RouteMatch & {
	route: FuseRouteObjectType;
};

type FuseLayoutProps = {
	layouts: themeLayoutsType;
	children?: React.ReactNode;
};

/**
 * FuseLayout
 * React frontend component in a React project that is used for layouting the user interface. The component
 * handles generating user interface settings related to current routes, merged with default settings, and uses
 * the new settings to generate layouts.
 */
function FuseLayout(props: FuseLayoutProps) {
	const { layouts, children } = props;
	const dispatch = useAppDispatch();
	const settings = useAppSelector(selectFuseCurrentSettings);
	const defaultSettings = useAppSelector(selectFuseDefaultSettings);

	const layoutStyle = settings.layout.style;
	const location = useLocation();
	const { pathname } = location;

	const newSettings = useRef<PartialDeep<FuseSettingsConfigType>>(settings);
	const matchedSettings = getFuseRouteParamUtil<FuseRouteObjectType['settings']>(pathname, 'settings', true);

	const shouldAwaitRender = useCallback(() => {
		let _newSettings: FuseSettingsConfigType;

		/**
		 * On Path changed
		 */
		// if (prevPathname !== pathname) {
		if (matchedSettings) {
			/**
			 * if matched route has settings
			 */

			_newSettings = generateSettings(defaultSettings, matchedSettings);
		} else if (!_.isEqual(newSettings.current, defaultSettings)) {
			/**
			 * Reset to default settings on the new path
			 */
			_newSettings = _.merge({}, defaultSettings);
		} else {
			_newSettings = newSettings.current as FuseSettingsConfigType;
		}

		if (!_.isEqual(newSettings.current, _newSettings)) {
			newSettings.current = _newSettings;
		}
	}, [defaultSettings, matchedSettings]);

	shouldAwaitRender();

	const currentSettings = useMemo(() => newSettings.current, [newSettings.current]);

	useDeepCompareEffect(() => {
		if (!_.isEqual(currentSettings, settings)) {
			dispatch(setSettings(currentSettings as FuseSettingsConfigType));
		}
	}, [dispatch, currentSettings, settings]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return useMemo(() => {
		if (!_.isEqual(currentSettings, settings)) {
			return <FuseLoading />;
		}

		return Object.entries(layouts).map(([key, Layout]) => {
			if (key === layoutStyle) {
				return (
					<React.Fragment key={key}>
						<Layout>{children}</Layout>
					</React.Fragment>
				);
			}

			return null;
		});
	}, [layouts, layoutStyle, children, currentSettings, settings]);
}

export default FuseLayout;
