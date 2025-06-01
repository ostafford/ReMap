// ================
//   CORE IMPORTS
// ================
import React from 'react';
import {
	Pressable,
	StyleSheet,
	ViewStyle,
	ActivityIndicator,
} from 'react-native';
import { StyleProp } from 'react-native';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { ButtonText } from './Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
interface CustomButtonProps {
	children: React.ReactNode;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	disabled?: boolean;
	loading?: boolean;
	loadingText?: string;
	variant?: 'primary' | 'secondary' | 'danger' | 'success';
	size?: 'small' | 'medium' | 'large';
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const Button = ({
	children,
	onPress,
	style,
	disabled = false,
	loading = false,
	loadingText,
	variant = 'primary',
	size = 'medium',
}: CustomButtonProps) => {
	// ==================
	//   BUTTON STATE LOGIC
	// ==================
	// NOTE: We'll use this for the signing in and or Sign-Ups

	const isInteractionDisabled = disabled || loading;
	const displayText = loading && loadingText ? loadingText : children;

	const handlePress = () => {
		if (!isInteractionDisabled && onPress) {
			onPress();
		}
	};

	// ==================
	//   DYNAMIC STYLING
	// ==================
	const getButtonStyle = () => {
		let backgroundColor = ReMapColors.primary.cadet;

		switch (variant) {
			case 'primary':
				backgroundColor = ReMapColors.primary.violet;
				break;
			case 'secondary':
				backgroundColor = ReMapColors.primary.blue;
				break;
			case 'danger':
				backgroundColor = ReMapColors.semantic.error;
				break;
			case 'success':
				backgroundColor = ReMapColors.semantic.success;
				break;
			default:
				backgroundColor = ReMapColors.primary.cadet;
		}

		return {
			...styles.button,
			...styles[`${size}Button`], // Apply size-specific styles
			backgroundColor,
		};
	};

	const getTextColor = () => {
		// NOTE: Most buttons use white text, but we can customize per variant if needed
		return ReMapColors.ui.cardBackground;
	};

	const getLoadingColor = () => {
		// NOTE: Spinner color based on text color
		return getTextColor();
	};

	return (
		<Pressable
			onPress={handlePress}
			style={({ pressed }) => [
				getButtonStyle(),
				isInteractionDisabled && styles.disabledButton,
				pressed && !isInteractionDisabled && styles.pressedButton,
				style,
			]}
			disabled={isInteractionDisabled}
		>
			{/* Loading Spinner */}
			{loading && (
				<ActivityIndicator
					size="small"
					color={getLoadingColor()}
					style={styles.loadingSpinner}
				/>
			)}

			<ButtonText
				color={getTextColor()}
				style={[
					styles.buttonText,
					isInteractionDisabled && styles.disabledText,
				]}
				numberOfLines={1}
			>
				{displayText}
			</ButtonText>
		</Pressable>
	);
};

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	button: {
		padding: 12,
		borderRadius: 25,
		margin: 0,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		minHeight: 44,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	smallButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		minHeight: 36,
		borderRadius: 18,
	},
	mediumButton: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		minHeight: 44,
		borderRadius: 22,
	},
	largeButton: {
		paddingHorizontal: 24,
		paddingVertical: 16,
		minHeight: 52,
		borderRadius: 26,
	},
	buttonText: {
		// NOTE: #ButtonText handles all typography properties
	},
	disabledButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		opacity: 0.6,
		shadowOpacity: 0,
		elevation: 0,
	},
	pressedButton: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
		shadowOpacity: 0.5,
		elevation: 1,
	},
	disabledText: {
		opacity: 0.7,
	},
	loadingSpinner: {
		marginRight: 8,
	},
});
