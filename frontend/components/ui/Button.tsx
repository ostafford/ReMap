// ================
//   CORE IMPORTS
// ================
import React from 'react';
import {
	Pressable,
	Text,
	StyleSheet,
	ViewStyle,
	ActivityIndicator,
} from 'react-native';
import { StyleProp } from 'react-native';

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
}: CustomButtonProps) => {
	// ==================
	//   BUTTON STATE LOGIC
	// ==================
	// WHY: Handle different button states (normal, loading, disabled)
	// NOTE: We'll use this for the signing in and or Sign-Ups

	const isInteractionDisabled = disabled || loading;
	const displayText = loading && loadingText ? loadingText : children;

	const handlePress = () => {
		if (!isInteractionDisabled && onPress) {
			onPress();
		}
	};

	return (
		<Pressable
			onPress={handlePress}
			style={({ pressed }) => [
				styles.button,
				isInteractionDisabled && styles.disabledButton,
				pressed && !isInteractionDisabled && styles.pressedButton,
				style,
			]}
			disabled={isInteractionDisabled}
		>
			{loading && (
				<ActivityIndicator
					size="small"
					color="white"
					style={styles.loadingSpinner}
				/>
			)}
			<Text
				style={[
					styles.buttonText,
					isInteractionDisabled && styles.disabledText,
				]}
			>
				{displayText}
			</Text>
		</Pressable>
	);
};

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	button: {
		backgroundColor: ReMapColors.primary.cadet,
		padding: 10,
		borderRadius: 25,
		margin: 0,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		minHeight: 44,
	},
	buttonText: {
		color: 'white',
		fontSize: 15,
		fontWeight: '500',
	},
	disabledButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		opacity: 0.6,
	},
	pressedButton: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
	},
	disabledText: {
		color: '#fff',
		opacity: 0.7,
	},
	loadingSpinner: {
		marginRight: 8,
	},
});
