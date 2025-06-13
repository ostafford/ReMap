import { useState } from 'react';

// ============================
//  TYPE DEFINITIONS
// ============================
type SplashState = {
	messageShow: boolean;
	messageText: string;
	messageType: 'success' | 'error' | 'warning' | 'info';

	// Modal states
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

	const updateField = <Field extends keyof SplashState>(
		field: Field,
		value: SplashState[Field]
	) => {
		setSplashState((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const showMessage = (
		message: string,
		type: SplashState['messageType'] = 'info'
	) => {
		setSplashState((prev) => ({
			...prev,
			messageShow: true,
			messageText: message,
			messageType: type,
		}));
	};

	const hideMessage = () => {
		setSplashState((prev) => ({
			...prev,
			messageShow: false,
		}));
	};

	const toggleSignInModal = () => {
		setSplashState((prev) => ({
			...prev,
			isSignInModalVisible: !prev.isSignInModalVisible,
		}));
	};

	const closeSignInModal = () => {
		setSplashState((prev) => ({
			...prev,
			isSignInModalVisible: false,
		}));
	};

	// ============================
	//  CUSTOM HOOK
	// ============================
	return {
		splashState,
		updateField,
		showMessage,
		hideMessage,
		toggleSignInModal,
		closeSignInModal,
	};
};
