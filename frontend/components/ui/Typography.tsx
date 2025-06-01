// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
interface BaseTextProps {
	children: React.ReactNode;
	style?: TextStyle | TextStyle[];
	color?: string;
	align?: 'left' | 'center' | 'right' | 'justify';
	numberOfLines?: number;
	onPress?: () => void;
}

// Enhanced text style variants
interface TextVariant {
	fontSize: number;
	fontWeight: TextStyle['fontWeight'];
	lineHeight: number;
	marginBottom?: number;
}

// =========================
//   TYPOGRAPHY SYSTEM
// =========================
// NOTE: Centralized typography definitions
const typographySystem: Record<string, TextVariant> = {
	header: {
		fontSize: 28,
		fontWeight: 'bold',
		lineHeight: 34,
		marginBottom: 8,
	},
	subheader: {
		fontSize: 20,
		fontWeight: '600',
		lineHeight: 26,
		marginBottom: 6,
	},
	body: {
		fontSize: 16,
		fontWeight: '400',
		lineHeight: 24,
		marginBottom: 4,
	},
	bodyLarge: {
		fontSize: 18,
		fontWeight: '400',
		lineHeight: 26,
		marginBottom: 6,
	},
	bodySmall: {
		fontSize: 14,
		fontWeight: '400',
		lineHeight: 20,
		marginBottom: 4,
	},
	caption: {
		fontSize: 12,
		fontWeight: '400',
		lineHeight: 16,
		marginBottom: 2,
	},
	button: {
		fontSize: 16,
		fontWeight: '600',
		lineHeight: 20,
	},
	link: {
		fontSize: 16,
		fontWeight: '500',
		lineHeight: 24,
	},
	display: {
		fontSize: 32,
		fontWeight: 'bold',
		lineHeight: 38,
		marginBottom: 12,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		lineHeight: 18,
		marginBottom: 4,
	},
};

// =========================
//   COMPONENT DEFINITIONS
// =========================

// Display Text - Extra large text for splash screens and major headings
export const DisplayText = ({
	children,
	style,
	color = ReMapColors.ui.text,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.displayText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Header Text - Large titles and main headings
export const HeaderText = ({
	children,
	style,
	color = ReMapColors.ui.text,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.headerText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Subheader Text - Section titles and important headings
export const SubheaderText = ({
	children,
	style,
	color = ReMapColors.ui.text,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.subheaderText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Body Text - Main content and descriptions
export const BodyText = ({
	children,
	style,
	color = ReMapColors.ui.text,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.bodyText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Body Large Text - Emphasized body content
export const BodyLargeText = ({
	children,
	style,
	color = ReMapColors.ui.text,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.bodyLargeText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Body Small Text - De-emphasized body content
export const BodySmallText = ({
	children,
	style,
	color = ReMapColors.ui.textSecondary,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.bodySmallText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Label Text - Form labels and small headings
export const LabelText = ({
	children,
	style,
	color = ReMapColors.ui.text,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.labelText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Caption Text - Small text for metadata and secondary info
export const CaptionText = ({
	children,
	style,
	color = ReMapColors.ui.textSecondary,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.captionText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Button Text - Specifically for buttons and interactive elements
export const ButtonText = ({
	children,
	style,
	color = ReMapColors.ui.cardBackground,
	align = 'center',
	numberOfLines = 1, //NOTE: << Use single line for buttons >>
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.buttonText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// Link Text - For clickable text links
export const LinkText = ({
	children,
	style,
	color = ReMapColors.primary.blue,
	align = 'left',
	numberOfLines,
	onPress,
}: BaseTextProps) => (
	<Text
		style={[styles.linkText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
		onPress={onPress}
	>
		{children}
	</Text>
);

// =========================
//   UTILITY COMPONENTS
// =========================

// Error Text - For form validation and error messages
export const ErrorText = ({
	children,
	style,
	align = 'left',
	numberOfLines,
}: Omit<BaseTextProps, 'color' | 'onPress' | 'accessibilityLabel'>) => (
	<Text
		style={[styles.errorText, { textAlign: align }, style]}
		numberOfLines={numberOfLines}
	>
		{children}
	</Text>
);

// Success Text - For positive feedback messages
export const SuccessText = ({
	children,
	style,
	align = 'left',
	numberOfLines,
}: Omit<BaseTextProps, 'color' | 'onPress' | 'accessibilityLabel'>) => (
	<Text
		style={[styles.successText, { textAlign: align }, style]}
		numberOfLines={numberOfLines}
	>
		{children}
	</Text>
);

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	displayText: {
		...typographySystem.display,
	},
	headerText: {
		...typographySystem.header,
	},
	subheaderText: {
		...typographySystem.subheader,
	},
	bodyText: {
		...typographySystem.body,
	},
	bodyLargeText: {
		...typographySystem.bodyLarge,
	},
	bodySmallText: {
		...typographySystem.bodySmall,
	},
	labelText: {
		...typographySystem.label,
	},
	captionText: {
		...typographySystem.caption,
	},
	buttonText: {
		...typographySystem.button,
	},
	linkText: {
		...typographySystem.link,
		textDecorationLine: 'underline',
	},
	linkInteractive: {
		// 🔧 Visual feedback for interactive links
		opacity: 0.8,
	},
	errorText: {
		...typographySystem.caption,
		color: ReMapColors.semantic.error,
		fontWeight: '500',
	},
	successText: {
		...typographySystem.caption,
		color: ReMapColors.semantic.success,
		fontWeight: '500',
	},
});

// =========================
//   EXPORT TYPOGRAPHY SYSTEM
// =========================
export { typographySystem };
