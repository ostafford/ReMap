// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { LabelText, BodyText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ================================
//   TYPE IMPORTS
// ================================
import type { SocialCircle } from '@/hooks/createPin/usePrivacySettings';

// ==================
// TYPE DEFINITIONS
// ==================

/**
 * Props interface for SocialCircleSelector component
 *
 * LAYMAN TERMS: "Everything this component needs from its parent to show
 * the friend group selection interface. Includes the list of available
 * friend groups, which ones are selected, and functions to handle changes."
 *
 * TECHNICAL: Comprehensive props interface for social circle multi-select
 * component with conditional visibility and selection limit support
 *
 * @interface SocialCircleSelectorProps
 */
interface SocialCircleSelectorProps {
	userSocialCircles: SocialCircle[];
	selectedSocialCircles: string[];
	onToggle: (circleId: string) => void;
	visible: boolean;
	title?: string;
	disabled?: boolean;
	maxSelection?: number;
	style?: any;
}

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

/**
 * SocialCircleSelector - Friend group multi-select interface
 *
 * LAYMAN TERMS: "This component shows a grid of friend group cards that users
 * can tap to select which groups should see their memory. Each card shows the
 * group name, member count, description, and a color dot for easy recognition.
 * Selected groups get highlighted and show a checkmark."
 *
 * Key features:
 * - Grid layout of colorful friend group cards
 * - Visual feedback (selected cards change background and show ✓)
 * - Selection limits with warnings (if maxSelection provided)
 * - Empty state handling (when user has no friend groups)
 * - Conditional visibility (only shows when 'social' privacy is selected)
 * - Disabled state support (can gray out all cards)
 *
 * TECHNICAL: React component providing multi-select social circle interface
 * with grid layout, conditional rendering, selection validation, and
 * integration with usePrivacySettings hook for state management.
 *
 * @component SocialCircleSelector
 * @param {SocialCircleSelectorProps} props - Component configuration object
 * @returns {JSX.Element | null} Friend group selection grid or null if not visible
 *
 * @example
 * In createPin.tsx:
 * const {
 *   userSocialCircles,
 *   selectedSocialCircles,
 *   handleSocialCircleToggle,
 *   showSocialDropdown,
 *   isVisibilitySelected
 * } = usePrivacySettings();
 *
 * <SocialCircleSelector
 *   userSocialCircles={userSocialCircles}           // Available friend groups
 *   selectedSocialCircles={selectedSocialCircles}   // Currently selected IDs
 *   onToggle={handleSocialCircleToggle}             // Handle card taps
 *   visible={showSocialDropdown && isVisibilitySelected('social')} // Show conditionally
 * />
 *
 * Results in:
 * Grid of friend group cards when 'social' privacy is selected
 * Each card shows: [Color Dot] Group Name ✓, Member count, Description
 * Tapping cards toggles selection with visual feedback
 *
 * @see {@link usePrivacySettings} for state management integration
 * @see {@link VisibilitySelector} for privacy option selection UI
 */
export function SocialCircleSelector({
	userSocialCircles,
	selectedSocialCircles,
	onToggle,
	visible,
	title = 'Select Social Circles',
	disabled = false,
	maxSelection,
	style,
}: SocialCircleSelectorProps) {
	// =========================
	// SELECTION LOGIC HELPERS
	// =========================

	/**
	 * Check if a specific social circle is currently selected
	 *
	 * LAYMAN TERMS: "Quick way to check if a friend group is currently
	 * selected. Used to show checkmarks and highlight selected cards."
	 *
	 * TECHNICAL: Selection state checker for conditional rendering and styling
	 *
	 * @function isSelected
	 * @param {string} circleId - The social circle ID to check
	 * @returns {boolean} True if the circle is currently selected
	 */
	const isSelected = (circleId: string): boolean => {
		return selectedSocialCircles.includes(circleId);
	};

	/**
	 * Check if a specific social circle can be selected (considering limits)
	 *
	 * LAYMAN TERMS: "Figure out if user is allowed to select this friend group.
	 * They can always deselect something they've already picked, but they might
	 * hit a maximum limit when trying to select new ones."
	 *
	 * TECHNICAL: Selection validation with limit checking for UI state management
	 *
	 * @function canSelect
	 * @param {string} circleId - The social circle ID to check
	 * @returns {boolean} True if the circle can be selected/deselected
	 *
	 * @example
	 * maxSelection = 3, selectedSocialCircles = ['family', 'work']
	 * canSelect('family');     // true (can always deselect)
	 * canSelect('university'); // true (under limit)
	 *
	 * selectedSocialCircles = ['family', 'work', 'friends'] (at limit)
	 * canSelect('university'); // false (would exceed limit)
	 * canSelect('family');     // true (can always deselect)
	 */
	const canSelect = (circleId: string): boolean => {
		if (isSelected(circleId)) return true;
		if (!maxSelection) return true;
		return selectedSocialCircles.length < maxSelection;
	};

	/**
	 * Handle social circle card press with validation
	 *
	 * LAYMAN TERMS: "When user taps a friend group card, check if they're
	 * allowed to select it (not disabled, not over limit), then call the
	 * hook's toggle function to update the selection."
	 *
	 * TECHNICAL: Card press handler with disabled state and selection limit validation
	 *
	 * @function handleCirclePress
	 * @param {string} circleId - The social circle ID that was pressed
	 */
	const handleCirclePress = (circleId: string) => {
		if (disabled || !canSelect(circleId)) return;
		onToggle(circleId);
	};

	/**
	 * Get full social circle objects for currently selected IDs
	 *
	 * LAYMAN TERMS: "Convert the list of selected IDs into the full friend
	 * group information (name, color, member count, etc.) for display purposes."
	 *
	 * TECHNICAL: Utility function resolving selected IDs to full objects
	 * (Note: Currently unused in render but kept for potential future features)
	 *
	 * @function getSelectedCircles
	 * @returns {SocialCircle[]} Array of full social circle objects for selected IDs
	 */
	const getSelectedCircles = (): SocialCircle[] => {
		return userSocialCircles.filter((circle) =>
			selectedSocialCircles.includes(circle.id)
		);
	};

	/**
	 * Calculate total member count across all selected social circles
	 *
	 * LAYMAN TERMS: "Add up how many people total are in all the selected
	 * friend groups. Like if Family has 5 people and Work Friends has 8,
	 * this would return 13."
	 *
	 * TECHNICAL: Aggregate member count calculator for selected circles
	 * (Note: Currently unused in render but kept for potential future features)
	 *
	 * @function getTotalMemberCount
	 * @returns {number} Total member count across selected social circles
	 */
	const getTotalMemberCount = (): number => {
		return getSelectedCircles().reduce(
			(total, circle) => total + circle.memberCount,
			0
		);
	};

	if (!visible) return null;

	// ==================
	// RENDER COMPONENT
	// ==================
	return (
		<View style={[styles.container, style]}>
			{/* ==================== */}
			{/*   SECTION HEADER     */}
			{/* ==================== */}
			<View style={styles.header}>
				<LabelText style={styles.title}>
					{title} ({selectedSocialCircles.length} selected):
				</LabelText>
			</View>
			{/* ==================== */}
			{/*   MAIN CONTENT       */}
			{/* ==================== */}
			{userSocialCircles.length > 0 ? (
				<View style={styles.circlesGrid}>
					{userSocialCircles.map((circle) => (
						<TouchableOpacity
							key={circle.id}
							style={[
								styles.circleItem,
								isSelected(circle.id) &&
									styles.selectedCircleItem,
								!canSelect(circle.id) &&
									styles.disabledCircleItem,
								{ borderColor: circle.color },
							]}
							onPress={() => handleCirclePress(circle.id)}
							disabled={disabled || !canSelect(circle.id)}
							activeOpacity={0.7}
						>
							{/* Color indicator dot */}
							<View
								style={[
									styles.colorIndicator,
									{ backgroundColor: circle.color },
								]}
							/>

							{/* Circle information */}
							<View style={styles.circleInfo}>
								<BodyText
									style={[
										styles.circleName,
										...(isSelected(circle.id)
											? [styles.selectedCircleText]
											: []),
									]}
								>
									{circle.name}
									{isSelected(circle.id) && ' ✓'}{' '}
								</BodyText>

								{/* Member count */}
								<CaptionText style={styles.memberCount}>
									{circle.memberCount} member
									{circle.memberCount !== 1 ? 's' : ''}
								</CaptionText>

								{/* Optional description */}
								{circle.description && (
									<CaptionText
										style={styles.circleDescription}
									>
										{circle.description}
									</CaptionText>
								)}
							</View>
						</TouchableOpacity>
					))}
				</View>
			) : (
				<View style={styles.emptyState}>
					<BodyText style={styles.emptyStateText}>
						No social circles available
					</BodyText>
					<CaptionText style={styles.emptyStateSubtext}>
						Create social circles to share memories with specific
						groups
					</CaptionText>
				</View>
			)}
			{/* ========================== */}
			{/*   SELECTION LIMIT WARNING */}
			{/* ========================== */}
			{maxSelection && selectedSocialCircles.length >= maxSelection && (
				<View style={styles.limitWarning}>
					<CaptionText style={styles.warningText}>
						Maximum {maxSelection} circle
						{maxSelection !== 1 ? 's' : ''} can be selected
					</CaptionText>
				</View>
			)}
		</View>
	);
}

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	container: {
		marginTop: 12,
		marginBottom: 8,
	},

	// Header Section
	header: {
		marginBottom: 12,
	},
	title: {
		color: ReMapColors.primary.blue,
		fontSize: 13,
		marginBottom: 4,
	},

	// Social Circle Grid
	circlesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	circleItem: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		minWidth: '45%',
		maxWidth: '48%',
		flexDirection: 'row',
		alignItems: 'center',
	},
	selectedCircleItem: {
		backgroundColor: '#F0F8FF',
		borderWidth: 2,
	},
	disabledCircleItem: {
		opacity: 0.5,
	},

	// Circle Card Content
	colorIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 8,
	},
	circleInfo: {
		flex: 1,
	},
	circleName: {
		fontSize: 12,
		fontWeight: '500',
		marginBottom: 2,
	},
	selectedCircleText: {
		color: ReMapColors.primary.blue,
		fontWeight: '600',
	},
	memberCount: {
		fontSize: 10,
		color: ReMapColors.ui.textSecondary,
		marginBottom: 2,
	},
	circleDescription: {
		fontSize: 9,
		color: ReMapColors.ui.textSecondary,
		lineHeight: 12,
	},

	// Empty State
	emptyState: {
		padding: 20,
		alignItems: 'center',
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
		borderStyle: 'dashed',
	},
	emptyStateText: {
		color: ReMapColors.ui.textSecondary,
		marginBottom: 4,
	},
	emptyStateSubtext: {
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		lineHeight: 16,
	},

	// Selection Limit Warning
	limitWarning: {
		marginTop: 8,
		padding: 8,
		backgroundColor: ReMapColors.semantic.warning + '20',
		borderRadius: 6,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.semantic.warning,
	},
	warningText: {
		color: ReMapColors.semantic.warning,
		fontWeight: '500',
	},
});

export default SocialCircleSelector;

/**
 * COMPONENT ARCHITECTURE ANALYSIS
 * ================================
 *
 * LAYMAN TERMS: "This component is like a smart friend group picker that shows
 * colorful cards representing each friend group. Users can tap cards to select
 * which groups should see their memory. The genius is in the visual design -
 * each group has its own color, shows member count, and gives clear feedback
 * when selected. It's intuitive and doesn't overwhelm users with too much info."
 *
 * TECHNICAL: Sophisticated multi-select component demonstrating:
 * - Responsive grid layout with flexbox (2-column responsive design)
 * - Rich visual feedback (color indicators, selection highlighting, checkmarks)
 * - Selection validation with limits and disabled states
 * - Conditional rendering (empty state vs populated grid)
 *
 */
