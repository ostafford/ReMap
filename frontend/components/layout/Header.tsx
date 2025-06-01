// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { HeaderText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   TYPE DEFINITIONS
// ====================
interface HeaderProps {
	title: string;
	subtitle?: string;
	showBackButton?: boolean;
	style?: any;
	backgroundColor?: string;
	titleColor?: string;
	subtitleColor?: string;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const Header = ({
	title,
	subtitle,
	style,
	backgroundColor = ReMapColors.primary.violet,
	titleColor = ReMapColors.ui.cardBackground, // NOTE: White text on colored background
	subtitleColor = ReMapColors.ui.cardBackground,
}: HeaderProps) => {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor,
					paddingTop: Math.max(insets.top, 50), // Respect safe area
				},
				style,
			]}
		>
			<View style={styles.content}>
				<HeaderText
					align="center"
					style={styles.title}
					color={titleColor}
				>
					{title}
				</HeaderText>

				{subtitle && (
					<CaptionText
						align="center"
						style={styles.subtitle}
						color={subtitleColor}
					>
						{subtitle}
					</CaptionText>
				)}
			</View>
		</View>
	);
};

// ================
//	STYLE SECTION
// ================
const styles = StyleSheet.create({
	container: {
		paddingBottom: 15,
		paddingHorizontal: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	content: {
		alignItems: 'center',
	},
	title: {
		// Typography component handles all text styling
		opacity: 0.95,
	},
	subtitle: {
		// Typography component handles all text styling
		marginTop: 4,
		opacity: 0.9,
	},
});
