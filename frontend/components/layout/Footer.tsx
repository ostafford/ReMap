// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   TYPE DEFINITIONS
// ====================
interface FooterProps {
	children: React.ReactNode;
	style?: any;
	backgroundColor?: String;
	padding?: number;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const Footer = ({
	children,
	style,
	backgroundColor = ReMapColors.ui.cardBackground,
	padding = 5,
}: FooterProps) => {
	// NOTE: Allowing space for iphones navigation bar
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor,
					padding,
					paddingBottom: Math.max(padding, insets.bottom - 10),
				},
				style,
			]}
		>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: ReMapColors.ui.border,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 3,
	},
});
