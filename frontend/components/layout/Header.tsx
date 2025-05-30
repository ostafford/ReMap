// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   TYPE DEFINITIONS
// ====================
interface HeaderProps {
	title: string;
	subtitle?: String;
	showBackButton?: boolean;
	style?: any;
	backgroundColor?: string;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const Header = ({
	title,
	subtitle,
	style,
	backgroundColor = ReMapColors.primary.violet,
}: HeaderProps) => {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor,
					paddingTop: 10,
				},
				style,
			]}
		>
			<View style={styles.content}>
				<Text style={styles.title}>{title}</Text>
				{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
			</View>
		</View>
	);
};

// ================
//	STYLE SECTION
// ================
const styles = StyleSheet.create({
	container: {
		paddingBottom: 10,
		paddingHorizontal: 10,
	},
	content: {
		alignItems: 'center',
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
		color: ReMapColors.ui.text,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 14,
		color: ReMapColors.ui.text,
		textAlign: 'center',
		marginTop: 5,
		opacity: 0.9,
	},
});
