/*
 * PRIVACY SETTINGS TEST COMPONENT
 * Test component to verify the refactored usePrivacySettings hook
 * Shows how to integrate the hook with the updated UI components
 */

// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

// ================================
//   INTERNAL HOOK IMPORTS
// ================================
import { usePrivacySettings } from '@/hooks/createPin/usePrivacySettings';

// ================================
//   INTERNAL UI COMPONENTS
// ================================
import { VisibilitySelector } from './VisibilitySelector';
import { SocialCircleSelector } from './SocialCircleSelector';
import { LabelText, BodyText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL CONSTANTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

export function PrivacySettingsTest() {
	// ===========================
	// HOOK CONSUMPTION: Updated function names
	// ===========================
	const {
		// Current state
		selectedVisibility,
		selectedSocialCircles,
		showSocialDropdown,
		userSocialCircles,
		isLoading,
		error,

		// Action handlers (updated names)
		toggleVisibilityOption, // was: handleVisibilitySelect
		toggleSocialCircleSelection, // was: handleSocialCircleToggle

		// Utility functions (updated names)
		isVisibilitySelected,
		getSelectedSocialCirclesData, // was: getSelectedSocialCircles
		getVisibilityDescription,
		resetAllPrivacySettings, // was: resetPrivacySettings

		// Computed summary
		privacySummary,
	} = usePrivacySettings();

	// ==================
	// RENDER COMPONENT
	// ==================
	return (
		<ScrollView style={styles.container}>
			<View style={styles.content}>
				{/* ==================== */}
				{/*   SECTION HEADER     */}
				{/* ==================== */}
				<LabelText style={styles.mainTitle}>
					Privacy Settings Test
				</LabelText>
				<CaptionText style={styles.subtitle}>
					Testing refactored usePrivacySettings hook
				</CaptionText>

				{/* ======================== */}
				{/*   VISIBILITY SELECTOR   */}
				{/* ======================== */}
				<VisibilitySelector
					selectedVisibility={selectedVisibility}
					onSelect={toggleVisibilityOption} // Updated function name
					isSelected={isVisibilitySelected}
					description={getVisibilityDescription()}
					title="Who can see this memory?"
					allowMultiple={true}
				/>

				{/* ========================== */}
				{/*   SOCIAL CIRCLE SELECTOR   */}
				{/* ========================== */}
				<SocialCircleSelector
					userSocialCircles={userSocialCircles}
					selectedSocialCircles={selectedSocialCircles}
					onToggle={toggleSocialCircleSelection} // Updated function name
					visible={showSocialDropdown}
					isLoading={isLoading} // New loading state
					error={error} // New error handling
					title="Select Social Circles"
				/>

				{/* ==================== */}
				{/*   DEBUG INFORMATION  */}
				{/* ==================== */}
				<View style={styles.debugSection}>
					<LabelText style={styles.debugTitle}>
						Debug Information
					</LabelText>

					{/* Current Selections */}
					<View style={styles.debugItem}>
						<BodyText style={styles.debugLabel}>
							Selected Visibility:
						</BodyText>
						<CaptionText style={styles.debugValue}>
							{selectedVisibility.join(', ') || 'None'}
						</CaptionText>
					</View>

					<View style={styles.debugItem}>
						<BodyText style={styles.debugLabel}>
							Selected Social Circles:
						</BodyText>
						<CaptionText style={styles.debugValue}>
							{selectedSocialCircles.length > 0
								? `${
										selectedSocialCircles.length
								  } selected: ${selectedSocialCircles.join(
										', '
								  )}`
								: 'None selected'}
						</CaptionText>
					</View>

					<View style={styles.debugItem}>
						<BodyText style={styles.debugLabel}>
							Show Social Dropdown:
						</BodyText>
						<CaptionText style={styles.debugValue}>
							{showSocialDropdown ? 'Yes' : 'No'}
						</CaptionText>
					</View>

					<View style={styles.debugItem}>
						<BodyText style={styles.debugLabel}>
							Loading State:
						</BodyText>
						<CaptionText style={styles.debugValue}>
							{isLoading ? 'Loading...' : 'Loaded'}
						</CaptionText>
					</View>

					{error && (
						<View style={styles.debugItem}>
							<BodyText style={styles.debugLabel}>
								Error:
							</BodyText>
							<CaptionText
								style={[styles.debugValue, styles.errorText]}
							>
								{error}
							</CaptionText>
						</View>
					)}

					{/* Privacy Summary */}
					<View style={styles.debugItem}>
						<BodyText style={styles.debugLabel}>
							Privacy Summary:
						</BodyText>
						<CaptionText style={styles.debugValue}>
							Public: {privacySummary.isPublic ? 'Yes' : 'No'} |
							Social: {privacySummary.isSocial ? 'Yes' : 'No'} |
							Private: {privacySummary.isPrivate ? 'Yes' : 'No'}
						</CaptionText>
						<CaptionText style={styles.debugValue}>
							Total: {privacySummary.totalSelected}
						</CaptionText>
					</View>

					{/* Selected Social Circles Data */}
					{getSelectedSocialCirclesData().length > 0 && (
						<View style={styles.debugItem}>
							<BodyText style={styles.debugLabel}>
								Selected Circles Data:
							</BodyText>
							{getSelectedSocialCirclesData().map((circle) => (
								<CaptionText
									key={circle.id}
									style={styles.debugValue}
								>
									• {circle.name} ({circle.memberCount}{' '}
									members)
								</CaptionText>
							))}
						</View>
					)}
				</View>

				{/* ================== */}
				{/*   RESET BUTTON     */}
				{/* ================== */}
				<View style={styles.resetSection}>
					<TouchableOpacity
						style={styles.resetButton}
						onPress={resetAllPrivacySettings} // Updated function name
					>
						<BodyText style={styles.resetButtonText}>
							Reset All Settings
						</BodyText>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	content: {
		padding: 20,
	},

	// Headers
	mainTitle: {
		fontSize: 20,
		marginBottom: 8,
		color: ReMapColors.primary.blue,
	},
	subtitle: {
		marginBottom: 24,
		color: ReMapColors.ui.textSecondary,
	},

	// Debug Section
	debugSection: {
		marginTop: 24,
		padding: 16,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	debugTitle: {
		fontSize: 14,
		marginBottom: 12,
		color: ReMapColors.primary.blue,
	},
	debugItem: {
		marginBottom: 8,
	},
	debugLabel: {
		fontSize: 12,
		fontWeight: '500',
		marginBottom: 2,
	},
	debugValue: {
		fontSize: 11,
		color: ReMapColors.ui.textSecondary,
		marginLeft: 8,
	},
	errorText: {
		color: ReMapColors.semantic.error,
	},

	// Reset Button
	resetSection: {
		marginTop: 24,
		alignItems: 'center',
	},
	resetButton: {
		backgroundColor: ReMapColors.semantic.warning,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	resetButtonText: {
		color: 'white',
		fontWeight: '500',
	},
});

export default PrivacySettingsTest;
