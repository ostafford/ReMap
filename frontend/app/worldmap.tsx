// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';

// ================================
//   INTERNAL 'LAYOUT' COMPONENTS
// ================================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';

// ============================
//   INTERNAL 'UI' COMPONENTS
// ============================
import { Button } from '@/components/ui/Button';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ========================
//   COMPONENT DEFINITION
// ========================
// NOTE: '/' is index.tsx
export default function WorldMapScreen() {
	const validRoutes = ['/', '...'];

	const goBack = () => {
		const route = '/';

		if (!validRoutes.includes(route)) {
			Alert.alert('Error', 'This page is not available');
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Route Failed:', error);
		}
	};

	// ==================
	//   EVENT HANDLERS
	// ==================
	// ENABLE DOCS.FOURSQUARE.COM

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="World Map" />
			<MainContent>
				<Text style={styles.title}>🗺️ World Map</Text>
				<Text style={styles.subtitle}>Coming Soon!</Text>

				<Button onPress={goBack} style={styles.backButton}>
					← Back to Home
				</Button>
			</MainContent>
		</View>
	);
}

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	MainContent: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: ReMapColors.ui.text,
		marginBottom: 8,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		marginBottom: 30,
	},
	backButton: {
		backgroundColor: ReMapColors.primary.violet,
		marginTop: 20,
	},
});
