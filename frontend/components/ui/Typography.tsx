import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { ReMapColors } from '@/constants/Colors';

// Base text component interface
interface BaseTextProps {
	children: React.ReactNode;
	style?: any;
	color?: string;
	align?: 'left' | 'center' | 'right';
	numberOfLines?: number;
}

// Header Text - Large titles and main headings
export const HeaderText = ({
	children,
	style,
	color = ReMapColors.ui.text,
	align = 'left',
	numberOfLines,
}: BaseTextProps) => (
	<Text
		style={[styles.headerText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
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
}: BaseTextProps) => (
	<Text
		style={[styles.subheaderText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
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
}: BaseTextProps) => (
	<Text
		style={[styles.bodyText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
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
}: BaseTextProps) => (
	<Text
		style={[styles.captionText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
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
	numberOfLines,
}: BaseTextProps) => (
	<Text
		style={[styles.buttonText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
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
}: BaseTextProps) => (
	<Text
		style={[styles.linkText, { color, textAlign: align }, style]}
		numberOfLines={numberOfLines}
	>
		{children}
	</Text>
);

const styles = StyleSheet.create({
	headerText: {
		fontSize: 28,
		fontWeight: 'bold',
		lineHeight: 34,
		marginBottom: 8,
	},
	subheaderText: {
		fontSize: 20,
		fontWeight: '600',
		lineHeight: 26,
		marginBottom: 6,
	},
	bodyText: {
		fontSize: 16,
		fontWeight: '400',
		lineHeight: 24,
		marginBottom: 4,
	},
	captionText: {
		fontSize: 12,
		fontWeight: '400',
		lineHeight: 16,
		marginBottom: 2,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: '600',
		lineHeight: 20,
	},
	linkText: {
		fontSize: 16,
		fontWeight: '500',
		lineHeight: 24,
		textDecorationLine: 'underline',
	},
});
