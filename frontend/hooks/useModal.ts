import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
	const [isVisible, setIsVisible] = useState(initialState);

	const open = useCallback(() => {
		setIsVisible(true);
	}, []);

	const close = useCallback(() => {
		setIsVisible(false);
	}, []);

	const toggle = useCallback(() => {
		setIsVisible((prev) => !prev);
	}, []);

	return {
		isVisible,
		open,
		close,
		toggle,
		show: open,
		hide: close,
	};
};
