// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';

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
import { ErrorMessage, InfoMessage } from '@/components/ui/Messages';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	BodyText,
	SubheaderText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
interface StarterPack {
	id: string;
	name: string;
	icon: string;
	description: string;
	category: string;
	color: string;
}

interface MessageState {
	show: boolean;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	title?: string;
}

// =========================
//   STARTER PACK DATA
// =========================
const STARTER_PACKS: StarterPack[] = [
	{
		id: 'cafes',
		name: 'Cafe Explorer',
		icon: '☕',
		description: 'Discover cozy cafes and coffee culture',
		category: 'food_drink',
		color: '#8B4513',
	},
	{
		id: 'nightlife',
		name: 'Nightlife Guide',
		icon: '🍺',
		description: 'Bars, clubs, and entertainment venues',
		category: 'nightlife',
		color: '#4A148C',
	},
	{
		id: 'foodie',
		name: 'Foodie Adventures',
		icon: '🍽️',
		description: 'Restaurants, food trucks, and culinary experiences',
		category: 'food_drink',
		color: '#FF5722',
	},
	{
		id: 'culture',
		name: 'Culture Seeker',
		icon: '🎨',
		description: 'Museums, galleries, and cultural landmarks',
		category: 'arts_entertainment',
		color: '#9C27B0',
	},
	{
		id: 'nature',
		name: 'Nature Lover',
		icon: '🌳',
		description: 'Parks, trails, and outdoor adventures',
		category: 'outdoor_recreation',
		color: '#4CAF50',
	},
	{
		id: 'urban',
		name: 'Urban Explorer',
		icon: '🛍️',
		description: 'Shopping, landmarks, and city life',
		category: 'retail',
		color: '#2196F3',
	},
];

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingStarterPackScreen() {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
	const [messageState, setMessageState] = useState<MessageState>({
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

	// ==================
	//   SELECTION LOGIC
	// ==================
	const toggleStarterPack = (packId: string) => {
		setSelectedPacks((prev) => {
			if (prev.includes(packId)) {
				// Remove if already selected
				return prev.filter((id) => id !== packId);
			} else {
				// Add if not selected
				return [...prev, packId];
			}
		});
	};

	const isPackSelected = (packId: string) => {
		return selectedPacks.includes(packId);
	};

	const getSelectedPacksData = () => {
		return STARTER_PACKS.filter((pack) => selectedPacks.includes(pack.id));
	};

	// ====================
	//   NAVIGATION LOGIC
	// ====================
	const validRoutes = ['/onboarding/permissions', '/onboarding/account'];

	const navigateToAccount = () => {
		const route = '/onboarding/account';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: Account setup page is not available.',
				'error'
			);
			return;
		}

		try {
			// Create the selections data to pass to account page
			const selectionsData = {
				starterPacks: getSelectedPacksData(),
				selectedIds: selectedPacks,
				timestamp: new Date().toISOString(),
			};

			console.log('Starter pack selections:', selectionsData);

			// Navigate with selections data
			router.navigate({
				pathname: route,
				params: {
					starterPackSelections: JSON.stringify(selectionsData),
				},
			});
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not navigate to account setup. Please try again.',
				'error'
			);
		}
	};

	const skipStarterPacks = () => {
		try {
			// Navigate without any selections
			router.navigate({
				pathname: '/onboarding/account',
				params: {
					starterPackSelections: JSON.stringify({
						starterPacks: [],
						selectedIds: [],
						timestamp: new Date().toISOString(),
						skipped: true,
					}),
				},
			});
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not skip starter packs. Please try again.',
				'error'
			);
		}
	};

	const goBack = () => {
		const route = '/onboarding/permissions';

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
	const hasSelections = selectedPacks.length > 0;
	const selectionCount = selectedPacks.length;

	// NEW: Use memory colors for different pin types
	const getMemoryTypeColor = (
		memoryType:
			| 'personal'
			| 'shared'
			| 'adventure'
			| 'peaceful'
			| 'exciting'
	) => {
		return ReMapColors.memory[memoryType];
	};

	// NEW: Use location colors for location status
	const getLocationStatusColor = (
		status: 'current' | 'visited' | 'planned' | 'favorite'
	) => {
		return ReMapColors.location[status];
	};

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Choose Your Interests" subtitle="Step 3 of 4" />

			<MainContent>
				<View style={styles.content}>
					{messageState.show && (
						<View style={styles.messageContainer}>
							{messageState.type === 'error' && (
								<ErrorMessage
									title={messageState.title}
									onDismiss={hideMessage}
								>
									{messageState.message}
								</ErrorMessage>
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

					<View style={styles.introSection}>
						<HeaderText align="center" style={styles.introTitle}>
							🎯 Personalize Your Experience
						</HeaderText>

						<BodyText
							align="center"
							style={styles.introDescription}
						>
							Select the types of places you'd love to discover.
							We'll show you relevant memories and recommendations
							on your map.
						</BodyText>
					</View>
					<CaptionText align="center" style={styles.helpText}>
						💡 You can select multiple packs and change your
						preferences later in your profile settings.
					</CaptionText>

					<View style={styles.packsContainer}>
						<SubheaderText style={styles.packsTitle}>
							Choose Your Starter Packs:
						</SubheaderText>

						<View style={styles.packsGrid}>
							{STARTER_PACKS.map((pack) => (
								<TouchableOpacity
									key={pack.id}
									style={[
										styles.packCard,
										isPackSelected(pack.id) &&
											styles.packCardSelected,
										{
											borderColor: isPackSelected(pack.id)
												? pack.color
												: ReMapColors.ui.border,
										},
									]}
									onPress={() => toggleStarterPack(pack.id)}
									activeOpacity={0.7}
								>
									<View style={styles.packHeader}>
										<BodyText style={styles.packIcon}>
											{pack.icon}
										</BodyText>
										{isPackSelected(pack.id) && (
											<BodyText style={styles.checkmark}>
												✓
											</BodyText>
										)}
									</View>

									<LabelText
										style={[
											styles.packName,
											isPackSelected(pack.id) &&
												styles.packNameSelected,
										]}
									>
										{pack.name}
									</LabelText>

									<CaptionText
										style={[
											styles.packDescription,
											isPackSelected(pack.id) &&
												styles.packDescriptionSelected,
										]}
									>
										{pack.description}
									</CaptionText>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View style={styles.helpSection}>
						{hasSelections && (
							<View style={styles.selectionFeedback}>
								<LabelText
									align="center"
									style={styles.selectionCount}
								>
									{selectionCount} starter pack
									{selectionCount !== 1 ? 's' : ''} selected
									✨
								</LabelText>
							</View>
						)}
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					{hasSelections ? (
						<Button
							style={styles.primaryButton}
							onPress={navigateToAccount}
						>
							Continue with {selectionCount} pack
							{selectionCount !== 1 ? 's' : ''} →
						</Button>
					) : (
						<Button
							style={styles.primaryButton}
							onPress={navigateToAccount}
						>
							Continue Without Selections →
						</Button>
					)}

					<View style={styles.secondaryActions}>
						<Button style={styles.secondaryButton} onPress={goBack}>
							← Previous
						</Button>

						<Button
							style={styles.tertiaryButton}
							onPress={skipStarterPacks}
						>
							Skip for Now
						</Button>
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
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	messageContainer: {
		width: '100%',
		marginBottom: 20,
	},
	introSection: {
		alignItems: 'center',
		marginBottom: 30,
	},
	introTitle: {
		marginBottom: 12,
		color: ReMapColors.primary.violet,
	},
	introDescription: {
		paddingHorizontal: 10,
		// marginBottom: 16,
	},
	selectionFeedback: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 12,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: ReMapColors.semantic.success,
	},
	selectionCount: {
		color: ReMapColors.semantic.success,
	},
	packsContainer: {
		flex: 1,
		// marginBottom: 20,
	},
	packsTitle: {
		marginBottom: 16,
	},
	packsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 12,
	},
	packCard: {
		width: '48%',
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 12,
		borderWidth: 2,
		padding: 16,
		alignItems: 'center',
		// marginBottom: 12,
		minHeight: 140,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	packCardSelected: {
		backgroundColor: '#F8F9FF',
		borderWidth: 3,
		shadowOpacity: 0.2,
		elevation: 4,
	},
	packHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		marginBottom: 8,
	},
	packIcon: {
		fontSize: 32,
		lineHeight: 38,
		marginBottom: 0,
	},
	checkmark: {
		position: 'absolute',
		right: -8,
		top: -8,
		fontSize: 20,
		color: ReMapColors.semantic.success,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 12,
		width: 24,
		height: 24,
		textAlign: 'center',
		lineHeight: 24,
	},
	packName: {
		marginBottom: 8,
		textAlign: 'center',
	},
	packNameSelected: {
		color: ReMapColors.primary.violet,
		fontWeight: '600',
	},
	packDescription: {
		textAlign: 'center',
		lineHeight: 16,
	},
	packDescriptionSelected: {
		color: ReMapColors.ui.text,
	},
	helpSection: {
		marginTop: 20,
		paddingHorizontal: 10,
	},
	helpText: {
		lineHeight: 18,
		paddingBottom: 10,
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
