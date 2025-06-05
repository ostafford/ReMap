// components/createPin/VisibilitySelector.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { LabelText, CaptionText } from '@/components/ui/Typography';
import { ReMapColors } from '@/constants/Colors';
import type { VisibilityOption as VisibilityOptionType } from '@/hooks/createPin/usePrivacySettings';

// ==========================================
// TYPE DEFINITIONS - FIXED
// ==========================================
interface VisibilityOptionConfig {
	key: VisibilityOptionType;
	label: string;
	description: string;
}

interface VisibilitySelectorProps {
	// Core state
	selectedVisibility: VisibilityOptionType[];
	onSelect: (option: VisibilityOptionType) => void;
	isSelected: (option: VisibilityOptionType) => boolean;

	// Description
	description: string;

	// Customization
	title?: string;
	disabled?: boolean;
	allowMultiple?: boolean;

	// Styling
	style?: any;
}

// ==========================================
// VISIBILITY OPTIONS CONFIGURATION - FIXED
// ==========================================
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

// ==========================================
// COMPONENT IMPLEMENTATION - UNCOMMENT BUTTONS
// ==========================================
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
	// ==========================================
	// HELPER FUNCTIONS
	// ==========================================
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

	// ==========================================
	// RENDER COMPONENT - UNCOMMENT THE BUTTONS
	// ==========================================
	return (
		<View style={[styles.section, style]}>
			<LabelText style={styles.sectionLabel}>{title}</LabelText>

			{/* Visibility Options */}
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
						{isSelected(option.key) && ' ✓'}
					</Button>
				))}
			</View>

			{allowMultiple && (
				<CaptionText style={styles.helpText}>
					You can select multiple visibility options
				</CaptionText>
			)}
		</View>
	);
}

// ==========================================
// COMPONENT STYLES
// ==========================================
const styles = StyleSheet.create({
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},

	// Visibility Options
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

	// Privacy Summary
	privacySummary: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		padding: 12,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.violet,
	},
	privacyDescription: {
		marginBottom: 8,
		lineHeight: 18,
	},
	privacyIndicators: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	privacyIndicator: {
		backgroundColor: ReMapColors.ui.background,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	indicatorText: {
		fontSize: 12,
		color: ReMapColors.primary.violet,
		fontWeight: '500',
	},

	// Help Text
	helpText: {
		marginTop: 8,
		paddingHorizontal: 4,
		fontStyle: 'italic',
		opacity: 0.7,
	},
});

// ==========================================
// DEFAULT EXPORT
// ==========================================
export default VisibilitySelector;
