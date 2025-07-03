// ================
//   CORE IMPORTS
// ================
import { useState } from 'react';

// ====================
//   TYPE DEFINITIONS
// ====================
export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface MessageState {
	messageShow: boolean;
	messageText: string;
	messageType: MessageType;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const useOnboardingMessages = () => {
	const [messageState, setMessageState] = useState<MessageState>({
		messageShow: false,
		messageText: '',
		messageType: 'info',
	});

	// Show message
	const showMessage = (message: string, type: MessageType = 'info') => {
		setMessageState({
			messageShow: true,
			messageText: message,
			messageType: type,
		});
	};

	// Hide message
	const hideMessage = () => {
		setMessageState((prev) => ({
			...prev,
			messageShow: false,
		}));
	};

	// Show success message
	const showSuccess = (message: string) => showMessage(message, 'success');

	// Show error message
	const showError = (message: string) => showMessage(message, 'error');

	// Show warning message
	const showWarning = (message: string) => showMessage(message, 'warning');

	// Show info message
	const showInfo = (message: string) => showMessage(message, 'info');

	return {
		messageState,
		showMessage,
		hideMessage,
		showSuccess,
		showError,
		showWarning,
		showInfo,
	};
};
