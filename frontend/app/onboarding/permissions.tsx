// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

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
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
	InfoMessage,
} from '@/components/ui/Messages';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	BodyText,
	SubheaderText,
	BodySmallText,
	CaptionText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
type LocationStatus = 'checking' | 'granted' | 'denied' | 'not_requested';

interface MessageState {
	show: boolean;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	title?: string;
	duration?: number;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingPermissionsScreen() {
	// ====================
	//   STATE MANAGEMENT
	// ====================
	const [locationStatus, setLocationStatus] =
		useState<LocationStatus>('not_requested');
	const [isRequesting, setIsRequesting] = useState(false);
	const [messageState, setMessageState] = useState<MessageState>({
		show: false,
		message: '',
		type: 'info',
	});
	const [ToastMessage, setToastMessage] = useState<MessageState>({
		show: false,
		message: '',
		type: 'info',
	});

	// ====================
	//   MESSAGE HELPERS
	// ====================
	const showMessage = (
		message: string,
		type: MessageState['type'] = 'info',
		title?: string
	) => {
		setMessageState({ show: true, message, type, title });
	};

	const hideMessage = () => {
		setMessageState((prev) => ({ ...prev, show: false }));
	};

	// ====================
	//   LIFECYCLE EFFECTS
	// ====================
	useEffect(() => {
		checkCurrentPermissions();
	}, []);

	// NOTE: Auto-hide (moves on) success messages and navigate
	useEffect(() => {
		if (locationStatus === 'granted' && messageState.type === 'success') {
			hideMessage();
			continueToAccount();
		}
	}, [locationStatus, messageState.type]);

	// ====================
	//   PERMISSION LOGIC
	// ====================
	const checkCurrentPermissions = async () => {
		setLocationStatus('checking');
		showMessage('Checking your current location permissions...', 'info');

		try {
			const { status } = await Location.getForegroundPermissionsAsync();

			if (status === 'granted') {
				setLocationStatus('granted');
				showMessage(
					"Great! Location access is already enabled. You're all set to pin memories to specific places.",
					'success',
					'Location Already Enabled'
				);
			} else {
				setLocationStatus('not_requested');
				hideMessage(); // NOTE: Clear the checking message
			}
		} catch (error) {
			console.error('Error checking permissions:', error);
			setLocationStatus('not_requested');
			showMessage(
				'Could not check current permissions. Please try requesting location access.',
				'error',
				'Permission Check Failed'
			);
		}
	};

	const requestLocationPermission = async () => {
		setIsRequesting(true);
		showMessage('Requesting location permission...', 'info');

		try {
			// NOTE: Statement to check if location services are enabled on device
			const serviceEnabled = await Location.hasServicesEnabledAsync();
			if (!serviceEnabled) {
				setLocationStatus('denied');
				showMessage(
					"Location services are disabled on your device. Please enable them in Settings to use ReMap's location features.",
					'warning',
					'Location Services Disabled'
				);
				setIsRequesting(false);
				return;
			}

			// Request permission
			const { status } =
				await Location.requestForegroundPermissionsAsync();

			if (status === 'granted') {
				setLocationStatus('granted');
				showMessage(
					'Perfect! Location access granted. ReMap can now help you pin memories to specific places and discover stories around you.',
					'success',
					'Location Access Granted!'
				);
				// Navigation happens automatically via useEffect
			} else {
				setLocationStatus('denied');
				showMessage(
					'Location access was denied. You can still use ReMap, but some features will be limited. You can enable this later in your device Settings.',
					'warning',
					'Location Access Denied'
				);
			}
		} catch (error) {
			console.error('Error requesting location permission:', error);
			setLocationStatus('not_requested');
			showMessage(
				'Failed to request location permission. Please try again or continue without location access.',
				'error',
				'Permission Request Failed'
			);
		} finally {
			setIsRequesting(false);
		}
	};

	// ====================
	//   NAVIGATION LOGIC
	// ====================
	const validRoutes = ['/onboarding', '/onboarding/account'];

	const continueToAccount = () => {
		const route = '/onboarding/account';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: Account setup page is not available.',
				'error'
			);
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not navigate to account setup. Please try again.',
				'error'
			);
		}
	};

	const skipPermissions = () => {
		showMessage(
			"You can enable location services later in Settings, but you'll miss out on ReMap's core location-based features like automatic memory pinning and discovering nearby stories.",
			'warning',
			'Skip Location Access?'
		);

		continueToAccount();
	};

	const goBack = () => {
		const route = '/onboarding';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: Previous page is not available.',
				'error'
			);
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage('Could not go back. Please try again.', 'error');
		}
	};

	// ==================
	//   COMPUTED VALUES
	// ==================
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
					buttonText: 'Next →',
					buttonDisabled: false,
				};
			case 'denied':
				return {
					icon: '❌',
					title: 'Enable Location Later',
					description:
						'You can still use ReMap without location access. Enable it later in Settings to unlock all features.',
					buttonText: 'Continue to Account Setup →',
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
					{messageState.show && (
						<View style={styles.messageContainer}>
							{messageState.type === 'success' && (
								<SuccessMessage
									title={messageState.title}
									onDismiss={hideMessage}
								>
									{messageState.message}
								</SuccessMessage>
							)}

							{messageState.type === 'error' && (
								<ErrorMessage
									title={messageState.title}
									onDismiss={hideMessage}
								>
									{messageState.message}
								</ErrorMessage>
							)}

							{messageState.type === 'warning' && (
								<WarningMessage
									title={messageState.title}
									onDismiss={hideMessage}
								>
									{messageState.message}
								</WarningMessage>
							)}

							{messageState.type === 'info' && (
								<InfoMessage
									title={messageState.title}
									onDismiss={hideMessage}
								>
									{messageState.message}
								</InfoMessage>
							)}
						</View>
					)}

					<View style={styles.iconContainer}>
						<BodyText style={styles.statusIcon}>
							{statusInfo.icon}
						</BodyText>
					</View>

					<View style={styles.textContent}>
						<HeaderText align="center" style={styles.title}>
							{statusInfo.title}
						</HeaderText>

						<BodyText align="center" style={styles.description}>
							{statusInfo.description}
						</BodyText>
					</View>

					<View style={styles.benefitsContainer}>
						<SubheaderText
							align="center"
							style={styles.benefitsTitle}
						>
							With location access, you can:
						</SubheaderText>

						<View style={styles.benefitItem}>
							<BodyText style={styles.benefitIcon}>🗺️</BodyText>

							<BodySmallText style={styles.benefitText}>
								Automatically pin memories to your exact
								location
							</BodySmallText>
						</View>

						<View style={styles.benefitItem}>
							<BodyText style={styles.benefitIcon}>🌟</BodyText>
							<BodySmallText style={styles.benefitText}>
								Discover authentic stories from people nearby
							</BodySmallText>
						</View>

						<View style={styles.benefitItem}>
							<BodyText style={styles.benefitIcon}>🎯</BodyText>
							<BodySmallText style={styles.benefitText}>
								Find relevant memories when visiting new places
							</BodySmallText>
						</View>
					</View>

					<View style={styles.privacyNote}>
						<BodyText style={styles.privacyIcon}>🔒</BodyText>

						<CaptionText style={styles.privacyText}>
							Your location is only used to enhance your
							experience. You control what gets shared.
						</CaptionText>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					{locationStatus === 'not_requested' && (
						<Button
							style={styles.primaryButton}
							onPress={requestLocationPermission}
							disabled={isRequesting}
						>
							{isRequesting
								? 'Requesting...'
								: statusInfo.buttonText}
						</Button>
					)}
					<Button style={styles.secondaryButton} onPress={goBack}>
						← Previous
					</Button>

					{(locationStatus === 'granted' ||
						locationStatus === 'denied') && (
						<Button
							style={styles.primaryButton}
							onPress={continueToAccount}
						>
							{statusInfo.buttonText}
						</Button>
					)}

					<View style={styles.secondaryActions}>
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
	messageContainer: {
		width: '100%',
		marginBottom: 20,
	},
	iconContainer: {
		marginBottom: 30,
	},
	statusIcon: {
		fontSize: 80,
		textAlign: 'center',
		paddingTop: 80,
	},
	textContent: {
		alignItems: 'center',
		marginBottom: 30,
	},
	title: {
		marginBottom: 16,
	},
	description: {
		paddingHorizontal: 10,
	},
	benefitsContainer: {
		width: '100%',
		marginBottom: 30,
	},
	benefitsTitle: {
		marginBottom: 16,
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
		flex: 1,
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
		flex: 1,
	},
	buttonContainer: {
		width: '100%',
		flexDirection: 'row',
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: '50%',
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
