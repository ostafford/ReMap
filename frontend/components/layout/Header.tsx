import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReMapColors } from '@/constants/Colors';

interface HeaderProps {
	title: string;
	subtitle?: string; // Optional subtitle
	showBackButton?: boolean; // We'll add this functionality later
}

export const Header = ({ title, subtitle }: HeaderProps) => {
	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>{title}</Text>
				{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: ReMapColors.primary.violet,
		paddingTop: 10,
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
