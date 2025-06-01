// ================
//   CORE IMPORTS
// ================
import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ================================
//   INTERNAL 'COMPONENT' IMPORTS
// ================================
import {
	LabelText,
	BodyText,
	CaptionText,
	ErrorText,
	SuccessText,
} from './Typography';

// ====================
//   TYPE DEFINITIONS
// ====================
interface MessageProps {
	children: React.ReactNode;
	title?: string;
	onDismiss?: () => void;
	style?: ViewStyle | ViewStyle[];
}

interface ToastProps extends MessageProps {
	type?: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
	autoHide?: boolean;
}

// =============================
//   SUCCESS MESSAGE COMPONENT
// =============================
export const SuccessMessage = ({
	children,
	title = 'Success',
	onDismiss,
	style,
}: MessageProps) => (
	<View style={[styles.messageContainer, styles.successContainer, style]}>
		<View style={styles.messageContent}>
			<LabelText
				color={ReMapColors.semantic.success}
				style={styles.messageTitle}
			>
				✅ {title}
			</LabelText>
			<SuccessText style={styles.messageText}>{children}</SuccessText>
		</View>
		{onDismiss && (
			<TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
				<LabelText color={ReMapColors.semantic.success}>✕</LabelText>
			</TouchableOpacity>
		)}
	</View>
);

// ===========================
//   ERROR MESSAGE COMPONENT
// ===========================
export const ErrorMessage = ({
	children,
	title = 'Error',
	onDismiss,
	style,
}: MessageProps) => (
	<View style={[styles.messageContainer, styles.errorContainer, style]}>
		<View style={styles.messageContent}>
			<LabelText
				color={ReMapColors.semantic.error}
				style={styles.messageTitle}
			>
				❌ {title}
			</LabelText>
			<ErrorText style={styles.messageText}>{children}</ErrorText>
		</View>
		{onDismiss && (
			<TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
				<LabelText color={ReMapColors.semantic.error}>✕</LabelText>
			</TouchableOpacity>
		)}
	</View>
);

// =============================
//   WARNING MESSAGE COMPONENT
// =============================
export const WarningMessage = ({
	children,
	title = 'Warning',
	onDismiss,
	style,
}: MessageProps) => (
	<View style={[styles.messageContainer, styles.warningContainer, style]}>
		<View style={styles.messageContent}>
			<LabelText
				color={ReMapColors.semantic.warning}
				style={styles.messageTitle}
			>
				⚠️ {title}
			</LabelText>
			<BodyText
				color={ReMapColors.semantic.warning}
				style={styles.messageText}
			>
				{children}
			</BodyText>
		</View>
		{onDismiss && (
			<TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
				<LabelText color={ReMapColors.semantic.warning}>✕</LabelText>
			</TouchableOpacity>
		)}
	</View>
);

// ==========================
//   INFO MESSAGE COMPONENT
// ==========================
export const InfoMessage = ({
	children,
	title = 'Info',
	onDismiss,
	style,
}: MessageProps) => (
	<View style={[styles.messageContainer, styles.infoContainer, style]}>
		<View style={styles.messageContent}>
			<LabelText
				color={ReMapColors.semantic.info}
				style={styles.messageTitle}
			>
				ℹ️ {title}
			</LabelText>
			<BodyText
				color={ReMapColors.semantic.info}
				style={styles.messageText}
			>
				{children}
			</BodyText>
		</View>
		{onDismiss && (
			<TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
				<LabelText color={ReMapColors.semantic.info}>✕</LabelText>
			</TouchableOpacity>
		)}
	</View>
);

// ===========================
//   TOAST MESSAGE COMPONENT
// ===========================
// NOTE: Notifications that auto-dismiss (No user interaction required)
export const ToastMessage = ({
	children,
	type = 'info',
	onDismiss,
	style,
	duration = 5,
	autoHide = true,
}: ToastProps) => {
	// ==========================================
	//   AUTO-DISMISS FUNCTIONALITY
	// ==========================================
	useEffect(() => {
		if (autoHide && onDismiss && duration > 0) {
			const timer = setTimeout(() => {
				onDismiss();
			}, duration * 1000);

			// NOTE: Cleanup timer on unmount or dependency change
			return () => clearTimeout(timer);
		}
	}, [autoHide, onDismiss, duration]);

	// ==========================================
	//   DYNAMIC STYLING BASED ON TYPE
	// ==========================================
	const getToastStyle = () => {
		switch (type) {
			case 'success':
				return styles.successContainer;
			case 'error':
				return styles.errorContainer;
			case 'warning':
				return styles.warningContainer;
			default:
				return styles.infoContainer;
		}
	};

	const getToastColor = () => {
		switch (type) {
			case 'success':
				return ReMapColors.semantic.success;
			case 'error':
				return ReMapColors.semantic.error;
			case 'warning':
				return ReMapColors.semantic.warning;
			default:
				return ReMapColors.semantic.info;
		}
	};

	const getToastIcon = () => {
		switch (type) {
			case 'success':
				return '✅';
			case 'error':
				return '❌';
			case 'warning':
				return '⚠️';
			default:
				return 'ℹ️';
		}
	};

	return (
		<View style={[styles.toastContainer, getToastStyle(), style]}>
			{/* NOTE: Using CaptionText for toast content (smaller, less in UX face) */}
			<CaptionText color={getToastColor()} style={styles.toastText}>
				{getToastIcon()} {children}
			</CaptionText>
			{onDismiss && (
				<TouchableOpacity
					onPress={onDismiss}
					style={styles.toastDismiss}
				>
					<CaptionText color={getToastColor()}>✕</CaptionText>
				</TouchableOpacity>
			)}
		</View>
	);
};

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: 16,
		borderRadius: 8,
		borderLeftWidth: 4,
		marginVertical: 8,
		backgroundColor: ReMapColors.ui.cardBackground,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	successContainer: {
		borderLeftColor: ReMapColors.semantic.success,
		backgroundColor: '#F0FDF2',
	},
	errorContainer: {
		borderLeftColor: ReMapColors.semantic.error,
		backgroundColor: '#FEF2F2',
	},
	warningContainer: {
		borderLeftColor: ReMapColors.semantic.warning,
		backgroundColor: '#FFFBEB',
	},
	infoContainer: {
		borderLeftColor: ReMapColors.semantic.info,
		backgroundColor: '#EFF6FF',
	},

	messageContent: {
		flex: 1,
	},
	messageTitle: {
		marginBottom: 4,
	},
	messageText: {},

	dismissButton: {
		marginLeft: 12,
		padding: 4,
		minWidth: 24,
		minHeight: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},

	toastContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		marginVertical: 4,
		marginHorizontal: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
		position: 'relative',
	},
	toastText: {
		flex: 1,
	},
	toastDismiss: {
		marginLeft: 8,
		padding: 4,
		minWidth: 24,
		minHeight: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
