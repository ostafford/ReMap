// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, StyleSheet } from 'react-native';

// ============================
//   INTERNAL 'UI' COMPONENTS
// ============================
import { Button } from '@/components/ui/Button';
import { LabelText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ===============
//   TYPE IMPORTS
// ===============
import type { VisibilityOption as VisibilityOptionType } from '@/hooks/createPin/usePrivacySettings';

// ==================
// TYPE DEFINITIONS
// ==================

interface VisibilityOptionConfig {
	key: VisibilityOptionType;
	label: string;
	description: string;
}

interface VisibilitySelectorProps {
	selectedVisibility: VisibilityOptionType[];
	onSelect: (option: VisibilityOptionType) => void;
	isSelected: (option: VisibilityOptionType) => boolean;
	description: string;
	title?: string;
	disabled?: boolean;
	allowMultiple?: boolean;
	style?: any;
}

// ======================
// STATIC CONFIGURATION
// ======================

const VISIBILITY_OPTIONS: VisibilityOptionConfig[] = [
	{
		key: 'public',
		label: 'Public',
		description: 'Everyone can see this memory',
	},
	{
		key: 'social',
		label: 'Social',
		description: 'Only your social circles can see this',
	},
	{
		key: 'private',
		label: 'Private',
		description: 'Only you can see this memory',
	},
];

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

export function VisibilitySelector({
	selectedVisibility,
	onSelect,
	isSelected,
	description,
	title = 'Who can see this memory?',
	disabled = false,
	allowMultiple = true,
	style,
}: VisibilitySelectorProps) {
	// ========================
	// BUTTON STYLING HELPERS
	// ========================

	const getButtonVariant = (
		option: VisibilityOptionConfig
	): 'primary' | 'secondary' => {
		return isSelected(option.key) ? 'primary' : 'secondary';
	};

	const getButtonStyle = (option: VisibilityOptionConfig) => {
		return [
			styles.visibilityButton,
			isSelected(option.key) && styles.selectedVisibilityButton,
		];
	};

	const handleOptionPress = (option: VisibilityOptionConfig) => {
		if (disabled) return;
		onSelect(option.key);
	};

	// ==================
	// RENDER COMPONENT
	// ==================

	return (
		<View style={[styles.section, style]}>
			{/* ==================== */}
			{/*   SECTION HEADER     */}
			{/* ==================== */}
			<LabelText style={styles.sectionLabel}>{title}</LabelText>
			{/* ==================== */}
			{/*   PRIVACY BUTTONS    */}
			{/* ==================== */}
			<View style={styles.visibilityContainer}>
				{VISIBILITY_OPTIONS.map((option) => (
					<Button
						key={option.key}
						onPress={() => handleOptionPress(option)}
						style={getButtonStyle(option)}
						variant={getButtonVariant(option)}
						disabled={disabled}
					>
						{option.label}
						{isSelected(option.key) && ' ✓'}{' '}
					</Button>
				))}
			</View>
			{/* =============== */}
			{/*   HELP TEXT    */}
			{/* =============== */}
			{allowMultiple && (
				<CaptionText style={styles.helpText}>
					You can select multiple visibility options
				</CaptionText>
			)}
		</View>
	);
}

// ==================
// COMPONENT STYLES
// ==================

const styles = StyleSheet.create({
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},

	// Visibility Button Grid
	visibilityContainer: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 12,
		flexWrap: 'wrap',
	},
	visibilityButton: {
		flex: 1,
		minHeight: 44,
		minWidth: 100,
	},
	selectedVisibilityButton: {
		borderWidth: 2,
		borderColor: ReMapColors.primary.violet,
	},

	// Help Text
	helpText: {
		marginTop: 8,
		paddingHorizontal: 4,
		fontStyle: 'italic',
		opacity: 0.7,
	},
});

export default VisibilitySelector;
