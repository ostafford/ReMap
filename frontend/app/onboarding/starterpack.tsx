// ================
//   CORE IMPORTS
// ================
// import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// ================================
//   LAYOUT COMPONENTS
// ================================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// ============================
//   UI COMPONENTS
// ============================
import { Button } from '@/components/ui/Button';

// ================================
//   TYPOGRAPHY IMPORTS
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

// ====================
//   HOOK IMPORTS
// ====================
import {
	STARTER_PACKS,
	type StarterPack,
} from '@/constants/onboardingStaticData';
import { useStarterPack } from '@/hooks/onboarding/useStarterPack';

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingStarterPackScreen() {
	const {
		selectedPacks,
		togglePackSelection,
		userHasSelectedPacks,
		getNumberOfSelectedPacks,
		isPackSelected,
	} = useStarterPack();

	// This essentially saves the selected packs in an array to the next page
	const navigateToAccount = () => {
		console.log('Starter pack selections:', selectedPacks);
		router.push('/onboarding/account');
	};

	const goBack = () => router.push('/onboarding');

	const hasSelected = userHasSelectedPacks();
	const selectionCount = getNumberOfSelectedPacks();

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Choose Your Interests" />

			<MainContent>
				{/* ======================== */}
				{/*   STARTER PACK HEADING   */}
				{/* ======================== */}
				<View style={styles.content}>
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

					{/* I've commented this out to see if you want it or not. 
Uncomment and refresh to test it out to see if you want it or not */}

					{/* <CaptionText align="center" style={styles.helpText}>
						💡 You can select multiple packs and change your
						preferences later in your profile settings.
					</CaptionText> */}

					{/* ======================== */}
					{/*   STARTER PACK GRID      */}
					{/* ======================== */}
					<View style={styles.packsContainer}>
						<SubheaderText style={styles.packsTitle}>
							Choose Your Starter Packs:
						</SubheaderText>

						{/* =========================== */}
						{/*   STARTER PACK COUNTER      */}
						{/* =========================== */}
						<View style={styles.helpSection}>
							{hasSelected && (
								<View style={styles.selectionFeedback}>
									<LabelText
										align="center"
										style={styles.selectionCount}
									>
										{selectionCount} starter pack
										{selectionCount !== 1 ? 's' : ''}{' '}
										selected ✨
									</LabelText>
								</View>
							)}
						</View>

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
									onPress={() => togglePackSelection(pack.id)}
									activeOpacity={0.7}
								>
									{/* =================================== */}
									{/*   STARTER PACK SELECTOR STYLE  ✓    */}
									{/* =================================== */}
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
											isPackSelected(pack.id)
												? styles.packNameSelected
												: {},
										]}
									>
										{pack.name}
									</LabelText>

									<CaptionText
										style={[
											styles.packName,
											isPackSelected(pack.id)
												? styles.packNameSelected
												: {},
										]}
									>
										{pack.description}
									</CaptionText>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>
			</MainContent>

			{/* ============ */}
			{/*   FOOTER     */}
			{/* ============ */}
			<Footer>
				<View style={styles.buttonContainer}>
					<View style={styles.secondaryActions}>
						<Button style={styles.secondaryButton} onPress={goBack}>
							← Previous
						</Button>
						{hasSelected ? (
							<Button
								style={styles.packButton}
								onPress={navigateToAccount}
							>
								Continue with {selectionCount} pack
								{selectionCount !== 1 ? 's' : ''} →
							</Button>
						) : (
							<Button
								style={styles.packButton}
								onPress={navigateToAccount}
							>
								Continue Without Selections →
							</Button>
						)}
					</View>
					<Button
						style={styles.primaryButton}
						onPress={navigateToAccount}
					>
						Skip for Now
					</Button>
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
		marginBottom: 20,
		paddingHorizontal: 20,
	},
	helpText: {
		lineHeight: 18,
		paddingBottom: 10,
	},
	buttonContainer: {
		width: '100%',
		gap: 10,
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.testing,
		width: '100%',
	},
	secondaryActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	secondaryButton: {
		backgroundColor: ReMapColors.primary.cadet,
		flex: 1,
	},
	packButton: {
		backgroundColor: ReMapColors.primary.cadet,
		width: 'auto',
	},
});
