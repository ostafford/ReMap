// ========================
//   REACT NATIVE IMPORTS
// ========================
import { useState, useCallback } from 'react';

// ========================
//   TYPE DEFINITIONS
// ========================
type NotificationData = {
	title: string;
	message?: string;
	autoCloseDelay?: number;
	visible: boolean;
};

interface UseNotificationSheetConfig {
	defaultAutoCloseDelay?: number;
}

// ========================
//   CUSTOM HOOK
// ========================

export const useNotificationSheet = (config?: UseNotificationSheetConfig) => {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [notificationData, setNotificationData] = useState<NotificationData>({
		title: '',
		message: undefined,
		autoCloseDelay: config?.defaultAutoCloseDelay || 3000,
		visible: false,
	});

	// ==================
	//   UPDATE FUNCTIONS
	// ==================

	const updateNotificationField = <Field extends keyof NotificationData>(
		field: Field,
		value: NotificationData[Field]
	) => {
		setNotificationData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// ==================
	//   ACTION FUNCTIONS
	// ==================

	const showNotification = useCallback(
		(title: string, message?: string, autoCloseDelay?: number) => {
			console.log('🔔 [NOTIFICATION] Showing notification:', title);

			setNotificationData({
				title,
				message,
				autoCloseDelay:
					autoCloseDelay || config?.defaultAutoCloseDelay || 3000,
				visible: true,
			});
		},
		[config?.defaultAutoCloseDelay]
	);

	const hideNotification = useCallback(() => {
		console.log('🔔 [NOTIFICATION] Hiding notification');

		updateNotificationField('visible', false);
	}, []);

	const showSuccessNotification = useCallback(
		(title: string, message?: string) => {
			showNotification(title, message);
		},
		[showNotification]
	);

	const showPinCreatedNotification = useCallback(() => {
		showSuccessNotification('Pin created successfully! 🎉');
	}, [showSuccessNotification]);

	const resetNotification = useCallback(() => {
		console.log('🔔 [NOTIFICATION] Resetting notification state');

		setNotificationData({
			title: '',
			message: undefined,
			autoCloseDelay: config?.defaultAutoCloseDelay || 3000,
			visible: false,
		});
	}, [config?.defaultAutoCloseDelay]);

	// ==================
	//   COMPUTED PROPERTIES
	// ==================

	const isVisible = notificationData.visible;

	const hasMessage = !!notificationData.message;

	// ==================
	//   RETURN INTERFACE
	// ==================

	return {
		// State data
		notificationData,
		isVisible,
		hasMessage,

		// Control functions
		showNotification,
		hideNotification,
		showSuccessNotification,
		showPinCreatedNotification,
		resetNotification,

		// Low-level update function
		updateNotificationField,
	};
};
