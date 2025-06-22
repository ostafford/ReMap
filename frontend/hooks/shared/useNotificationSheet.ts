/**
 * USE NOTIFICATION SHEET - CUSTOM HOOK FOR TOP NOTIFICATION MANAGEMENT
 * Purpose: Manages state and logic for the TopNotificationSheet component
 * Follows team standard hook pattern with type definitions and update functions
 * Pattern: Encapsulates notification state with clear public API
 */

import { useState, useCallback } from 'react';

// ========================
//   TYPE DEFINITIONS
// ========================

/**
 * Notification data structure
 * Contains all information needed to display a notification
 */
type NotificationData = {
	title: string;
	message?: string;
	autoCloseDelay?: number;
	visible: boolean;
};

/**
 * Hook configuration options
 * Allows customization of default behavior
 */
interface UseNotificationSheetConfig {
	defaultAutoCloseDelay?: number;
}

// ========================
//   CUSTOM HOOK
// ========================

/**
 * Custom hook for managing TopNotificationSheet state and actions
 * Provides a clean interface for showing/hiding notifications
 *
 * @param config - Optional configuration for default behavior
 * @returns Object with notification state and control functions
 */
export const useNotificationSheet = (config?: UseNotificationSheetConfig) => {
	// ==================
	//   STATE MANAGEMENT
	// ==================

	/**
	 * Main notification state - empty canvas with initial values
	 * Following team pattern of setting up "blank canvas" for update function
	 */
	const [notificationData, setNotificationData] = useState<NotificationData>({
		title: '',
		message: undefined,
		autoCloseDelay: config?.defaultAutoCloseDelay || 3000,
		visible: false,
	});

	// ==================
	//   UPDATE FUNCTIONS
	// ==================

	/**
	 * Generic update function with type inference
	 * Following team pattern - detects data type per field
	 * '...prev' preserves previous values while updating specific field
	 */
	const updateNotificationField = <Field extends keyof NotificationData>(
		field: Field,
		value: NotificationData[Field]
	) => {
		setNotificationData((prev) => ({
			...prev, // Spread operator: preserve existing values
			[field]: value, // Dynamic property assignment
		}));
	};

	// ==================
	//   ACTION FUNCTIONS
	// ==================

	/**
	 * Shows a notification with the provided data
	 * Combines title, optional message, and timing configuration
	 *
	 * @param title - Main notification text (required)
	 * @param message - Optional secondary message
	 * @param autoCloseDelay - Custom auto-close timing (optional)
	 */
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

	/**
	 * Hides the currently visible notification
	 * Resets the visible state while preserving other data
	 */
	const hideNotification = useCallback(() => {
		console.log('🔔 [NOTIFICATION] Hiding notification');

		updateNotificationField('visible', false);
	}, []);

	/**
	 * Shows a success notification with pre-configured styling
	 * Convenience method for common use case
	 *
	 * @param title - Success message title
	 * @param message - Optional additional details
	 */
	const showSuccessNotification = useCallback(
		(title: string, message?: string) => {
			showNotification(title, message);
		},
		[showNotification]
	);

	/**
	 * Quick method to show pin creation success
	 * Specific to the pin creation feature
	 */
	const showPinCreatedNotification = useCallback(() => {
		showSuccessNotification('Pin created successfully! 🎉');
	}, [showSuccessNotification]);

	/**
	 * Resets all notification data to initial state
	 * Useful for cleanup or testing scenarios
	 */
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

	/**
	 * Helper to check if notification is currently visible
	 * Useful for conditional rendering or logic
	 */
	const isVisible = notificationData.visible;

	/**
	 * Helper to check if notification has a message
	 * Useful for layout decisions
	 */
	const hasMessage = !!notificationData.message;

	// ==================
	//   RETURN INTERFACE
	// ==================

	/**
	 * Public API for components
	 * Returns the notification state and all control functions
	 * Following team pattern of returning data and functions
	 */
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

		// Low-level update function (for advanced use cases)
		updateNotificationField,
	};
};
