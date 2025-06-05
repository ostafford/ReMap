// components/createPin/SocialCircleSelector.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LabelText, BodyText, CaptionText } from '@/components/ui/Typography';
import { ReMapColors } from '@/constants/Colors';
import type { SocialCircle } from '@/hooks/createPin/usePrivacySettings';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface SocialCircleSelectorProps {
	// Core state
	userSocialCircles: SocialCircle[];
	selectedSocialCircles: string[];
	onToggle: (circleId: string) => void;

	// Visibility
	visible: boolean;

	// Customization
	title?: string;
	disabled?: boolean;
	maxSelection?: number;

	// Styling
	style?: any;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================
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
	// ==========================================
	// HELPER FUNCTIONS
	// ==========================================
	const isSelected = (circleId: string): boolean => {
		return selectedSocialCircles.includes(circleId);
	};

	const canSelect = (circleId: string): boolean => {
		if (isSelected(circleId)) return true; // Can always deselect
		if (!maxSelection) return true; // No limit
		return selectedSocialCircles.length < maxSelection;
	};

	const handleCirclePress = (circleId: string) => {
		if (disabled || !canSelect(circleId)) return;
		onToggle(circleId);
	};

	const getSelectedCircles = (): SocialCircle[] => {
		return userSocialCircles.filter((circle) =>
			selectedSocialCircles.includes(circle.id)
		);
	};

	const getTotalMemberCount = (): number => {
		return getSelectedCircles().reduce(
			(total, circle) => total + circle.memberCount,
			0
		);
	};

	// Don't render if not visible
	if (!visible) return null;

	// ==========================================
	// RENDER COMPONENT
	// ==========================================
	return (
		<View style={[styles.container, style]}>
			{/* Header */}
			<View style={styles.header}>
				<LabelText style={styles.title}>
					{title} ({selectedSocialCircles.length} selected):
				</LabelText>

				{/* Selection Summary */}
				{selectedSocialCircles.length > 0 && (
					<View style={styles.selectionSummary}>
						<CaptionText style={styles.summaryText}>
							{getTotalMemberCount()} total members across{' '}
							{selectedSocialCircles.length} circle
							{selectedSocialCircles.length !== 1 ? 's' : ''}
						</CaptionText>
					</View>
				)}
			</View>

			{/* Social Circles Grid */}
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
							{/* Circle Color Indicator */}
							<View
								style={[
									styles.colorIndicator,
									{ backgroundColor: circle.color },
								]}
							/>

							{/* Circle Info */}
							<View style={styles.circleInfo}>
								<BodyText
									style={[
										styles.circleName,
										isSelected(circle.id) &&
											styles.selectedCircleText,
									]}
								>
									{circle.name}
									{isSelected(circle.id) && ' ✓'}
								</BodyText>

								<CaptionText style={styles.memberCount}>
									{circle.memberCount} member
									{circle.memberCount !== 1 ? 's' : ''}
								</CaptionText>

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
				/* Empty State */
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

			{/* Selection Limit Warning */}
			{maxSelection && selectedSocialCircles.length >= maxSelection && (
				<View style={styles.limitWarning}>
					<CaptionText style={styles.warningText}>
						Maximum {maxSelection} circle
						{maxSelection !== 1 ? 's' : ''} can be selected
					</CaptionText>
				</View>
			)}

			{/* Selected Circles Preview */}
			{selectedSocialCircles.length > 0 && (
				<View style={styles.selectedPreview}>
					<LabelText style={styles.previewTitle}>
						Sharing with:
					</LabelText>
					<View style={styles.selectedCirclesList}>
						{getSelectedCircles().map((circle) => (
							<View
								key={circle.id}
								style={[
									styles.selectedCircleChip,
									{ borderLeftColor: circle.color },
								]}
							>
								<BodyText style={styles.selectedChipText}>
									{circle.name}
								</BodyText>
								<CaptionText style={styles.selectedChipMembers}>
									{circle.memberCount} members
								</CaptionText>
							</View>
						))}
					</View>
				</View>
			)}
		</View>
	);
}

// ==========================================
// COMPONENT STYLES
// ==========================================
const styles = StyleSheet.create({
	container: {
		marginTop: 12,
		marginBottom: 8,
	},

	// Header
	header: {
		marginBottom: 12,
	},
	title: {
		color: ReMapColors.primary.blue,
		fontSize: 13,
		marginBottom: 4,
	},
	selectionSummary: {
		backgroundColor: ReMapColors.ui.background,
		padding: 6,
		borderRadius: 4,
	},
	summaryText: {
		color: ReMapColors.primary.black,
		fontWeight: '500',
	},

	// Circles Grid
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

	// Circle Content
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

	// Limit Warning
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

	// Selected Preview
	selectedPreview: {
		marginTop: 12,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.lavender,
	},
	previewTitle: {
		marginBottom: 8,
		color: ReMapColors.primary.black,
		fontSize: 12,
	},
	selectedCirclesList: {
		gap: 6,
	},
	selectedCircleChip: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 8,
		borderRadius: 6,
		borderLeftWidth: 3,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	selectedChipText: {
		fontSize: 12,
		fontWeight: '500',
	},
	selectedChipMembers: {
		fontSize: 10,
		color: ReMapColors.ui.textSecondary,
	},
});

// ==========================================
// DEFAULT EXPORT
// ==========================================
export default SocialCircleSelector;
