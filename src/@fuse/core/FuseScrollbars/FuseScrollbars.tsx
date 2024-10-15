import { styled } from '@mui/material/styles';
import MobileDetect from 'mobile-detect';
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import React, { forwardRef, useEffect, useRef, ReactNode, useCallback, useState } from 'react';
import { selectCustomScrollbarsEnabled } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import { useAppSelector } from 'app/store/hooks';
import { useLocation } from 'react-router-dom';

const Root = styled('div')(() => ({
	overscrollBehavior: 'contain',
	minHeight: '100%'
}));

const md = new MobileDetect(window.navigator.userAgent);
const isMobile = md.mobile();

const handlerNameByEvent = Object.freeze({
	'ps-scroll-y': 'onScrollY',
	'ps-scroll-x': 'onScrollX',
	'ps-scroll-up': 'onScrollUp',
	'ps-scroll-down': 'onScrollDown',
	'ps-scroll-left': 'onScrollLeft',
	'ps-scroll-right': 'onScrollRight',
	'ps-y-reach-start': 'onYReachStart',
	'ps-y-reach-end': 'onYReachEnd',
	'ps-x-reach-start': 'onXReachStart',
	'ps-x-reach-end': 'onXReachEnd'
});

type FuseScrollbarsProps = {
	id?: string;
	className?: string;
	children: ReactNode;
	enable?: boolean;
	scrollToTopOnChildChange?: boolean;
	scrollToTopOnRouteChange?: boolean;
	option?: {
		wheelPropagation?: boolean;
		suppressScrollX?: boolean;
	};
};

const FuseScrollbars = forwardRef<HTMLDivElement, FuseScrollbarsProps>((props, ref) => {
	const {
		className = '',
		children,
		id = '',
		scrollToTopOnChildChange = true,
		scrollToTopOnRouteChange = false,
		enable = true,
		option = {
			wheelPropagation: true
		}
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const psRef = useRef<PerfectScrollbar | null>(null);
	const handlerByEvent = useRef<Map<string, EventListener>>(new Map());
	const [style, setStyle] = useState({});
	const customScrollbars = useAppSelector(selectCustomScrollbarsEnabled);
	const location = useLocation();
	const { pathname } = location;

	const hookUpEvents = useCallback(() => {
		Object.keys(handlerNameByEvent).forEach((key) => {
			const callback = props[handlerNameByEvent[key] as keyof FuseScrollbarsProps] as (T: HTMLDivElement) => void;

			if (callback) {
				const handler: EventListener = () => callback(containerRef.current);
				handlerByEvent.current.set(key, handler);

				if (containerRef.current) {
					containerRef.current.addEventListener(key, handler, false);
				}
			}
		});
	}, [props]);

	const unHookUpEvents = useCallback(() => {
		handlerByEvent.current.forEach((value, key) => {
			if (containerRef.current) {
				containerRef.current.removeEventListener(key, value, false);
			}
		});
		handlerByEvent.current.clear();
	}, []);

	useEffect(() => {
		if (customScrollbars && containerRef.current && !isMobile) {
			psRef.current = new PerfectScrollbar(containerRef.current, option);
			hookUpEvents();
		}

		return () => {
			if (psRef.current) {
				psRef.current.destroy();
				psRef.current = null;
				unHookUpEvents();
			}
		};
	}, [customScrollbars, hookUpEvents, option, unHookUpEvents]);

	const scrollToTop = useCallback(() => {
		if (containerRef.current) {
			containerRef.current.scrollTop = 0;
		}
	}, []);

	useEffect(() => {
		if (scrollToTopOnChildChange) {
			scrollToTop();
		}
	}, [scrollToTop, children, scrollToTopOnChildChange]);

	useEffect(() => {
		if (scrollToTopOnRouteChange) {
			scrollToTop();
		}
	}, [pathname, scrollToTop, scrollToTopOnRouteChange]);

	useEffect(() => {
		if (customScrollbars && enable && !isMobile) {
			setStyle({
				position: 'relative',
				overflow: 'hidden!important'
			});
		} else {
			setStyle({});
		}
	}, [customScrollbars, enable]);

	return (
		<Root
			id={id}
			className={className}
			style={style}
			ref={(el) => {
				containerRef.current = el;

				if (typeof ref === 'function') {
					ref(el);
				} else if (ref) {
					ref.current = el;
				}
			}}
		>
			{children}
		</Root>
	);
});

export default FuseScrollbars;
