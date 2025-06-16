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

	const isSelected = (circleId: string): boolean => {
		return selectedSocialCircles.includes(circleId);
	};

	const canSelect = (circleId: string): boolean => {
		if (isSelected(circleId)) return true;
		if (!maxSelection) return true;
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
