// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';
import * as Location from 'expo-location';

// ================================
//   INTERNAL 'LAYOUT' COMPONENTS
// ================================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// ============================
//   INTERNAL 'UI' COMPONENTS
// ============================
import { Button } from '@/components/ui/Button';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
// Type safety:
type LocationStatus = 'checking' | 'granted' | 'denied' | 'not_requested';

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingPermissionsScreen() {
	// ====================
	//   STATE & EVENT MANAGEMENT
	// ====================
	const [locationStatus, setLocationStatus] =
		useState<LocationStatus>('not_requested');
	const [isRequesting, setIsRequesting] = useState(false);

	useEffect(() => {
		checkCurrentPermissions();
	}, []);

	const checkCurrentPermissions = async () => {
		setLocationStatus('checking');

		try {
			const { status } = await Location.getForegroundPermissionsAsync();

			if (status === 'granted') {
				setLocationStatus('granted');
			} else {
				setLocationStatus('not_requested');
			}
		} catch (error) {
			console.error('Error checking permissions:', error);

			setLocationStatus('not_requested');
		}
	};

	const requestLocationPermission = async () => {
		setIsRequesting(true);

		try {
			// First check if location services are enabled
			const serviceEnabled = await Location.hasServicesEnabledAsync();
			if (!serviceEnabled) {
				Alert.alert(
					'Location Services Disabled',
					"Please enable location services in your device settings to use ReMap's location-based features.",
					[{ text: 'OK', style: 'default' }]
				);
				setIsRequesting(false);
				return;
			}

			// Request permission
			const { status } =
				await Location.requestForegroundPermissionsAsync();

			if (status === 'granted') {
				setLocationStatus('granted');

				// Show success and auto-continue after a moment
				setTimeout(() => {
					continueToAccount();
				}, 1500);
			} else {
				setLocationStatus('denied');
			}
		} catch (error) {
			console.error('Error requesting location permission:', error);

			Alert.alert(
				'Permission Error',
				'Failed to request location permission. Please try again or continue without location access.',
				[
					{
						text: 'Try Again',
						onPress: () => requestLocationPermission(),
					},
					{
						text: 'Continue Anyway',
						onPress: () => continueToAccount(),
					},
				]
			);
		} finally {
			setIsRequesting(false);
		}
	};

	const validroute = ['/', '/onboarding/account'];

	const continueToAccount = () => {
		const route = '/onboarding/account';

		if (!validroute.includes(route)) {
			Alert.alert('Error', 'This page is not available');
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigate failed:', error);
		}
	};

	const skipPermissions = () => {
		const route = '/onboarding/account';

		if (!validroute.includes(route)) {
			Alert.alert(
				'Skip Location?',
				"You can enable location services later in Settings, but you'll miss out on ReMap's core location-based features.",
				[
					{ text: 'Go Back', style: 'cancel' },
					{ text: 'Skip Anyway', onPress: continueToAccount },
				]
			);
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigate Failed:', error);
		}
	};

	const goBack = () => {
		const route = '/';

		if (!validroute.includes(route)) {
			Alert.alert('Error', 'This page is not available');
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
		}
	};

	// ==================
	//   COMPUTED VALUES
	// ==================
	// Dynamic content based on permission status
	const getStatusInfo = () => {
		switch (locationStatus) {
			case 'checking':
				return {
					icon: '🔍',
					title: 'Checking Permissions...',
					description:
						"We're checking your current location settings.",
					buttonText: 'Checking...',
					buttonDisabled: true,
				};
			case 'granted':
				return {
					icon: '✅',
					title: 'Location Access Granted!',
					description:
						'Perfect! ReMap can now help you pin memories to specific places and discover stories around you.',
					buttonText: 'Continue to Account Setup →',
					buttonDisabled: false,
				};
			case 'denied':
				return {
					icon: '❌',
					title: 'Location Access Denied',
					description:
						'ReMap works best with location access, but you can still use the app. You can enable this later in Settings.',
					buttonText: 'Continue Anyway →',
					buttonDisabled: false,
				};
			default:
				return {
					icon: '📍',
					title: 'Enable Location Services',
					description:
						'ReMap uses your location to help you pin memories to specific places and discover authentic stories from others nearby.',
					buttonText: 'Grant Location Access',
					buttonDisabled: false,
				};
		}
	};

	const statusInfo = getStatusInfo();

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Location Permissions" subtitle="Step 2 of 3" />

			<MainContent>
				<View style={styles.content}>
					{/* Status Icon */}
					<View style={styles.iconContainer}>
						<Text style={styles.statusIcon}>{statusInfo.icon}</Text>
					</View>

					{/* Title and Description */}
					<View style={styles.textContent}>
						<Text style={styles.title}>{statusInfo.title}</Text>
						<Text style={styles.description}>
							{statusInfo.description}
						</Text>
					</View>

					{/* Permission Benefits */}
					<View style={styles.benefitsContainer}>
						<Text style={styles.benefitsTitle}>
							With location access, you can:
						</Text>

						<View style={styles.benefitItem}>
							<Text style={styles.benefitIcon}>🗺️</Text>
							<Text style={styles.benefitText}>
								Automatically pin memories to your exact
								location
							</Text>
						</View>

						<View style={styles.benefitItem}>
							<Text style={styles.benefitIcon}>🌟</Text>
							<Text style={styles.benefitText}>
								Discover authentic stories from people nearby
							</Text>
						</View>

						<View style={styles.benefitItem}>
							<Text style={styles.benefitIcon}>🎯</Text>
							<Text style={styles.benefitText}>
								Find relevant memories when visiting new places
							</Text>
						</View>
					</View>

					{/* Privacy Note */}
					<View style={styles.privacyNote}>
						<Text style={styles.privacyIcon}>🔒</Text>
						<Text style={styles.privacyText}>
							Your location is only used to enhance your
							experience. You control what gets shared.
						</Text>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					{/* Primary Action */}
					{locationStatus === 'not_requested' && (
						<Button
							style={styles.primaryButton}
							onPress={requestLocationPermission}
							// disabled={isRequesting}
						>
							{isRequesting
								? 'Requesting...'
								: statusInfo.buttonText}
						</Button>
					)}

					{(locationStatus === 'granted' ||
						locationStatus === 'denied') && (
						<Button
							style={styles.primaryButton}
							onPress={continueToAccount}
						>
							{statusInfo.buttonText}
						</Button>
					)}

					{/* Secondary Actions */}
					<View style={styles.secondaryActions}>
						<Button style={styles.secondaryButton} onPress={goBack}>
							← Previous
						</Button>

						{locationStatus === 'not_requested' && (
							<Button
								style={styles.tertiaryButton}
								onPress={skipPermissions}
							>
								Skip for Now
							</Button>
						)}
					</View>
				</View>
			</Footer>
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
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	iconContainer: {
		marginBottom: 30,
	},
	statusIcon: {
		fontSize: 80,
		textAlign: 'center',
	},
	textContent: {
		alignItems: 'center',
		marginBottom: 30,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: ReMapColors.ui.text,
		textAlign: 'center',
		marginBottom: 16,
	},
	description: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		lineHeight: 24,
		paddingHorizontal: 10,
	},
	benefitsContainer: {
		width: '100%',
		marginBottom: 30,
	},
	benefitsTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: ReMapColors.ui.text,
		marginBottom: 16,
		textAlign: 'center',
	},
	benefitItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		paddingHorizontal: 10,
	},
	benefitIcon: {
		fontSize: 20,
		marginRight: 12,
		width: 30,
	},
	benefitText: {
		fontSize: 14,
		color: ReMapColors.ui.text,
		flex: 1,
		lineHeight: 20,
	},
	privacyNote: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 16,
		borderRadius: 12,
		borderLeftWidth: 4,
		borderLeftColor: ReMapColors.semantic.info,
		marginBottom: 20,
	},
	privacyIcon: {
		fontSize: 16,
		marginRight: 8,
	},
	privacyText: {
		fontSize: 12,
		color: ReMapColors.ui.textSecondary,
		flex: 1,
		lineHeight: 18,
	},
	buttonContainer: {
		width: '100%',
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: '100%',
		marginBottom: 10,
	},
	secondaryActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	secondaryButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		flex: 1,
	},
	tertiaryButton: {
		backgroundColor: ReMapColors.primary.blue,
		flex: 1,
	},
});
