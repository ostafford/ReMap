/**
 * NOTIFICATION CONTEXT - CENTRALIZED NOTIFICATION MANAGEMENT
 * Purpose: Provides notification state and functions across the app
 * Pattern: React Context with useContext hook for global notification handling
 * Replaces: URL parameter passing for success notifications
 * Reference: https://react.dev/reference/react/createContext
 */

// ========================
//   REACT NATIVE IMPORTS
// ========================
import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from 'react';

// ========================
//   TYPE DEFINITIONS
// ========================

interface NotificationData {
	title: string;
	message?: string;
	type?: 'success' | 'error' | 'info' | 'warning';
	autoCloseDelay?: number;
	onPress?: () => void;
}

interface NotificationContextType {
	// Current notification state
	notification: NotificationData | null;
	isVisible: boolean;

	// Notification actions
	showNotification: (
		title: string,
		message?: string,
		type?: NotificationData['type'],
		autoCloseDelay?: number,
		onPress?: () => void
	) => void;
	showSuccess: (title: string, message?: string) => void;
	showError: (title: string, message?: string) => void;
	hideNotification: () => void;
	clearNotification: () => void;
}

// ========================
//   CONTEXT CREATION
// ========================

// Create context with null default (no meaningful default for notifications)
const NotificationContext = createContext<NotificationContextType | null>(null);

// ========================
//   CONTEXT PROVIDER
// ========================

interface NotificationProviderProps {
	children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [notification, setNotification] = useState<NotificationData | null>(
		null
	);
	const [isVisible, setIsVisible] = useState(false);

	// ==================
	//   NOTIFICATION ACTIONS
	// ==================

	const showNotification = useCallback(
		(
			title: string,
			message?: string,
			type: NotificationData['type'] = 'info',
			autoCloseDelay: number = 3000,
			onPress?: () => void
		) => {
			console.log('🔔 [CONTEXT] Showing notification:', {
				title,
				message,
				type,
			});

			setNotification({
				title,
				message,
				type,
				autoCloseDelay,
				onPress,
			});
			setIsVisible(true);
		},
		[]
	);

	const showSuccess = useCallback(
		(title: string, message?: string) => {
			showNotification(title, message, 'success', 3000);
		},
		[showNotification]
	);

	const showError = useCallback(
		(title: string, message?: string) => {
			showNotification(title, message, 'error', 5000);
		},
		[showNotification]
	);

	const hideNotification = useCallback(() => {
		console.log('🔔 [CONTEXT] Hiding notification');
		setIsVisible(false);
	}, []);

	const clearNotification = useCallback(() => {
		console.log('🔔 [CONTEXT] Clearing notification');
		setNotification(null);
		setIsVisible(false);
	}, []);

	// ==================
	//   CONTEXT VALUE
	// ==================
	const contextValue: NotificationContextType = {
		// State
		notification,
		isVisible,

		// Actions
		showNotification,
		showSuccess,
		showError,
		hideNotification,
		clearNotification,
	};

	// ==================
	//   PROVIDER RENDER
	// ==================
	return (
		<NotificationContext value={contextValue}>
			{children}
		</NotificationContext>
	);
}

// ========================
//   CONTEXT HOOK
// ========================

/**
 * Custom hook to use notification context
 * Throws error if used outside NotificationProvider
 */
export function useNotification(): NotificationContextType {
	const context = useContext(NotificationContext);

	if (!context) {
		throw new Error(
			'useNotification must be used within a NotificationProvider'
		);
	}

	return context;
}

// ========================
//   EXPORTS
// ========================
export { NotificationContext };
export type { NotificationData, NotificationContextType };
