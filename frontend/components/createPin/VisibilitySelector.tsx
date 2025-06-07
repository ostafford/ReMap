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

/**
 * Configuration object for individual visibility options
 *
 * LAYMAN TERMS: "Template that defines how each privacy button should look
 * and behave. Like a recipe card that says 'Public button should say Public,
 * have key public, and description Everyone can see this memory'."
 *
 * TECHNICAL: Static configuration interface for visibility option rendering
 * and behavior definition
 *
 * @interface VisibilityOptionConfig
 */
interface VisibilityOptionConfig {
	key: VisibilityOptionType;
	label: string;
	description: string;
}

/**
 * Props interface for VisibilitySelector component
 *
 * LAYMAN TERMS: "Everything this component needs from its parent (createPin.tsx)
 * to work properly. Includes the current selections, functions to handle changes,
 * and customization options."
 *
 * TECHNICAL: Comprehensive props interface for privacy visibility selection
 * component with hook integration and customization support
 *
 * @interface VisibilitySelectorProps
 */
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

/**
 * Static configuration for all available visibility options
 *
 * LAYMAN TERMS: "The master list of all privacy options available in the app.
 * Defines what buttons to show, what they say, and what they do. Easy to
 * modify if we want to add new privacy levels or change wording."
 *
 * TECHNICAL: Static configuration array defining visibility option metadata
 * for consistent rendering and behavior across the component
 */
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

/**
 * VisibilitySelector - Multi-select privacy option interface
 *
 * LAYMAN TERMS: "This component shows three buttons (Public, Social, Private)
 * that users can tap to control who sees their memory. Users can select multiple
 * options at once - like both Public AND Social if they want. Selected buttons
 * turn purple and get a checkmark."
 *
 * Key features:
 * - Multi-select capability (can pick multiple privacy levels)
 * - Visual feedback (selected buttons change color and show ✓)
 * - Real-time description updates (shows human-readable privacy summary)
 * - Flexible configuration (title and behavior can be customized)
 * - Disabled state support (can gray out all buttons)
 *
 * TECHNICAL: React component providing multi-select privacy interface with
 * integration to usePrivacySettings hook. Handles button state management,
 * visual feedback, and user interaction forwarding to parent state.
 *
 * @component VisibilitySelector
 * @param {VisibilitySelectorProps} props - Component configuration object
 * @returns {JSX.Element} Multi-select privacy button interface
 *
 * @example
 * In createPin.tsx:
 * const {
 *   selectedVisibility,
 *   handleVisibilitySelect,
 *   isVisibilitySelected,
 *   getVisibilityDescription
 * } = usePrivacySettings();
 *
 * <VisibilitySelector
 *   selectedVisibility={selectedVisibility}        // Current selections
 *   onSelect={handleVisibilitySelect}              // Handle button taps
 *   isSelected={isVisibilitySelected}              // Check if option selected
 *   description={getVisibilityDescription()}       // Show current settings
 * />
 *
 * Results in:
 * [Public] [Social] [Private] buttons
 * Selected buttons are purple with ✓
 * Description updates in real-time below buttons
 *
 * @see {@link usePrivacySettings} for state management integration
 * @see {@link SocialCircleSelector} for friend group selection UI
 */
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

	/**
	 * Determine button variant based on selection state
	 *
	 * LAYMAN TERMS: "Figure out if this button should look selected (purple)
	 * or unselected (gray) based on current privacy settings"
	 *
	 * TECHNICAL: Button variant resolver for consistent visual state representation
	 *
	 * @function getButtonVariant
	 * @param {VisibilityOptionConfig} option - The visibility option to check
	 * @returns {'primary' | 'secondary'} Button variant for styling
	 */
	const getButtonVariant = (
		option: VisibilityOptionConfig
	): 'primary' | 'secondary' => {
		return isSelected(option.key) ? 'primary' : 'secondary';
	};

	/**
	 * Generate button style array based on selection state
	 *
	 * LAYMAN TERMS: "Create the style list for this button, adding extra
	 * border styling if it's currently selected"
	 *
	 * TECHNICAL: Style array generator combining base styles with conditional selection styles
	 *
	 * @function getButtonStyle
	 * @param {VisibilityOptionConfig} option - The visibility option to style
	 * @returns {any[]} Array of styles for button component
	 */
	const getButtonStyle = (option: VisibilityOptionConfig) => {
		return [
			styles.visibilityButton,
			isSelected(option.key) && styles.selectedVisibilityButton,
		];
	};

	/**
	 * Handle button press events with disabled state checking
	 *
	 * LAYMAN TERMS: "When user taps a privacy button, call the hook's handler
	 * function unless the whole component is disabled"
	 *
	 * TECHNICAL: Button press handler with disabled state validation
	 *
	 * @function handleOptionPress
	 * @param {VisibilityOptionConfig} option - The visibility option that was pressed
	 */
	const handleOptionPress = (option: VisibilityOptionConfig) => {
		if (disabled) return;
		onSelect(option.key);
	};

	// ==================
	// RENDER COMPONENT
	// ==================

	/**
	 * LAYMAN TERMS: "Build the complete privacy selection interface"
	 * TECHNICAL: Render method combining section header, button grid, and help text
	 */
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
