import { useState, useCallback } from 'react';

// ============================
//  TYPE DEFINITIONS
// ============================
type MessageType = 'success' | 'error' | 'warning' | 'info';

type SplashState = {
	messageShow: boolean;
	messageText: string;
	messageType: MessageType;
	isSignInModalVisible: boolean;
};

// ============================
//  CUSTOM HOOK
// ============================
export const useSplashState = () => {
	const [splashState, setSplashState] = useState<SplashState>({
		messageShow: false,
		messageText: '',
		messageType: 'info',
		isSignInModalVisible: false,
	});

	const showMessage = useCallback(
		(message: string, type: MessageType = 'info') => {
			setSplashState((prev) => ({
				...prev,
				messageShow: true,
				messageText: message,
				messageType: type,
			}));
		},
		[]
	);

	const hideMessage = useCallback(() => {
		setSplashState((prev) => ({
			...prev,
			messageShow: false,
		}));
	}, []);

	const toggleSignInModal = useCallback(() => {
		setSplashState((prev) => ({
			...prev,
			isSignInModalVisible: !prev.isSignInModalVisible,
		}));
	}, []);

	const closeSignInModal = useCallback(() => {
		setSplashState((prev) => ({
			...prev,
			isSignInModalVisible: false,
		}));
	}, []);

	return {
		splashState,
		showMessage,
		hideMessage,
		toggleSignInModal,
		closeSignInModal,
	};
};
