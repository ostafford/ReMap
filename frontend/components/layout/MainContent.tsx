// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';
import { string } from 'three/tsl';

// ====================
//   TYPE DEFINITIONS
// ====================
interface MainContentProps {
	children: React.ReactNode;
	scrollable?: boolean;
	style?: ViewStyle | ViewStyle[];
	contentStyle?: ViewStyle | ViewStyle[];
	keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const MainContent = ({
	children,
	scrollable = true,
	style,
	contentStyle,
	keyboardShouldPersistTaps = 'handled',
}: MainContentProps) => {
	if (scrollable) {
		return (
			<ScrollView
				style={[styles.scrollContainer, style]}
				contentContainerStyle={[styles.scrollContent, contentStyle]}
				showsVerticalScrollIndicator={false} // Clean look **Only appears when scrolling**
				keyboardShouldPersistTaps={keyboardShouldPersistTaps}
				keyboardDismissMode="interactive"
			>
				{children}
			</ScrollView>
		);
	}

	// ==================
	//   FIXED VERSION
	// ==================
	// NOTE: This essentially fills out the space
	return (
		<View style={[styles.container, style]}>
			<View style={[styles.content, contentStyle]}>{children}</View>
		</View>
	);
};

// ==================
//   STYLE SECTION
// ==================
const styles = StyleSheet.create({
	scrollContainer: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	scrollContent: {
		flexGrow: 1,
		// padding: 20,
	},
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	content: {
		flex: 1,
		padding: 20,
	},
});
