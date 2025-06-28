// ================
//   CORE IMPORTS
// ================
import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Button } from '@/components/ui/Button';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	BodyText,
	CaptionText,
	LabelText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ================================
//   TYPE IMPORTS
// ================================
import type { DummyPin } from '@/assets/dummyPinData';

// ==================
// TYPE DEFINITIONS
// ==================

interface PinBottomSheetProps {
	isVisible: boolean;
	onClose: () => void;
	pinData: DummyPin | null;
}

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

export function PinBottomSheet({
	isVisible,
	onClose,
	pinData,
}: PinBottomSheetProps) {
	// ========================
	// BOTTOMSHEET SETUP
	// ========================

	const bottomSheetRef = useRef<BottomSheet>(null);

	// Snap points: 20% (peek), 50% (partial), 90% (full content)
	const snapPoints = useMemo(() => ['26%', '50%', '90%'], []);

	// ========================
	// EVENT HANDLERS
	// ========================

	const handleSheetChanges = useCallback(
		(index: number) => {
			console.log('BottomSheet snap index:', index);

			// If user drags to close position (-1), trigger onClose
			if (index === -1) {
				onClose();
			}
		},
		[onClose]
	);

	// ========================
	// DATA HELPERS
	// ========================

	const getFormattedDate = useCallback((timestamp: string) => {
		try {
			return new Date(timestamp).toLocaleDateString('en-AU', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
		} catch {
			return 'Unknown date';
		}
	}, []);

	const getMediaSummary = useCallback((pinData: DummyPin) => {
		const parts = [];

		if (pinData.imageUrls && pinData.imageUrls.length > 0)
			parts.push(
				`${pinData.imageUrls.length} photo${
					pinData.imageUrls.length > 1 ? 's' : ''
				}`
			);
		if (pinData.audioUrl) parts.push('1 audio note');

		return parts.length > 0 ? parts.join(', ') : 'No media';
	}, []);

	// Don't render if not visible or no data
	if (!isVisible || !pinData) {
		return null;
	}

	// ========================
	// RENDER COMPONENT
	// ========================

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={0}
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			enablePanDownToClose={true}
			backgroundStyle={styles.bottomSheetBackground}
			handleStyle={styles.bottomSheetHandle}
		>
			<BottomSheetView style={styles.contentContainer}>
				{/* ==================== */}
				{/*   HEADER SECTION     */}
				{/* ==================== */}
				<View style={styles.header}>
					<View style={styles.headerMain}>
						<HeaderText style={styles.memoryTitle}>
							{pinData.name}
						</HeaderText>

						<View style={styles.locationRow}>
							<CaptionText style={styles.locationIcon}>
								📍
							</CaptionText>
							<BodyText style={styles.locationName}>
								{pinData.address}
							</BodyText>
						</View>
					</View>

					<TouchableOpacity
						style={styles.closeButton}
						onPress={onClose}
					>
						<CaptionText style={styles.closeButtonText}>
							✕
						</CaptionText>
					</TouchableOpacity>
				</View>

				{/* ==================== */}
				{/*   METADATA SECTION   */}
				{/* ==================== */}
				<View style={styles.metadataRow}>
					<View style={styles.metadataItem}>
						<CaptionText style={styles.metadataLabel}>
							By
						</CaptionText>
						<CaptionText style={styles.metadataValue}>
							{pinData.author}
						</CaptionText>
					</View>

					<View style={styles.metadataItem}>
						<CaptionText style={styles.metadataLabel}>
							Date
						</CaptionText>
						<CaptionText style={styles.metadataValue}>
							{getFormattedDate(pinData.createdAt)}
						</CaptionText>
					</View>

					<View style={styles.metadataItem}>
						<CaptionText style={styles.metadataLabel}>
							Media
						</CaptionText>
						<CaptionText style={styles.metadataValue}>
							{getMediaSummary(pinData)}
						</CaptionText>
					</View>
				</View>

				{/* ==================== */}
				{/*   DESCRIPTION        */}
				{/* ==================== */}
				{pinData.description && (
					<View style={styles.section}>
						<LabelText style={styles.sectionLabel}>
							Memory Description
						</LabelText>
						<BodyText style={styles.description}>
							{pinData.description}
						</BodyText>
					</View>
				)}

				{/* ==================== */}
				{/*   LOCATION DETAILS   */}
				{/* ==================== */}
				<View style={styles.section}>
					<LabelText style={styles.sectionLabel}>
						Location Details
					</LabelText>
					<BodyText style={styles.locationDetails}>
						{pinData.address}
					</BodyText>
					<CaptionText style={styles.coordinates}>
						{pinData.latitude.toFixed(6)},{' '}
						{pinData.longitude.toFixed(6)}
					</CaptionText>
				</View>

				{/* ==================== */}
				{/*   PRIVACY INFO       */}
				{/* ==================== */}
				<View style={styles.section}>
					<LabelText style={styles.sectionLabel}>
						Visibility
					</LabelText>
					<View style={styles.visibilityContainer}>
						<View style={styles.visibilityTag}>
							<CaptionText style={styles.visibilityText}>
								{pinData.visibility}
							</CaptionText>
						</View>
					</View>
				</View>

				{/* ==================== */}
				{/*   MEDIA PREVIEW      */}
				{/* ==================== */}
				{pinData.imageUrls &&
					pinData.imageUrls.slice(0, 3).map((imageUrl, index) => (
						<TouchableOpacity
							key={index}
							style={styles.mediaThumbnail}
							onPress={() => {
								// TODO: Open full image view
								console.log('Opening image:', imageUrl);
							}}
						>
							<Image
								source={{ uri: imageUrl }}
								style={styles.thumbnailImage}
								resizeMode="cover"
							/>
						</TouchableOpacity>
					))}

				{/* ==================== */}
				{/*   AUDIO INDICATOR    */}
				{/* ==================== */}
				{pinData.audioUrl && (
					<View style={styles.section}>
						<LabelText style={styles.sectionLabel}>
							Audio Recording
						</LabelText>
						<View style={styles.audioContainer}>
							<CaptionText style={styles.audioText}>
								🎵 Voice note available
							</CaptionText>
						</View>
					</View>
				)}

				{/* ==================== */}
				{/*   ACTION BUTTONS     */}
				{/* ==================== */}
				<View style={styles.actionsContainer}>
					<Button
						style={styles.actionButton}
						variant="secondary"
						onPress={onClose}
					>
						Close
					</Button>

					<Button
						style={styles.actionButton}
						variant="primary"
						onPress={() => {
							// TODO: Navigate to full memory view
							console.log('View full memory:', pinData.id);
						}}
					>
						View Full Memory
					</Button>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
}

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	bottomSheetBackground: {
		backgroundColor: ReMapColors.primary.testing,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},
	bottomSheetHandle: {
		backgroundColor: ReMapColors.primary.testing,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	contentContainer: {
		flex: 1,
		padding: 20,
		paddingTop: 10,
	},

	// Header Section
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: ReMapColors.ui.border,
	},
	headerMain: {
		flex: 1,
		marginRight: 12,
	},
	memoryTitle: {
		marginBottom: 6,
		color: ReMapColors.ui.text,
	},
	locationRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	locationIcon: {
		marginRight: 4,
		color: ReMapColors.primary.blue,
	},
	locationName: {
		color: ReMapColors.ui.textSecondary,
		flex: 1,
	},
	closeButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: ReMapColors.ui.background,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	closeButtonText: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 14,
		lineHeight: 16,
	},

	// Metadata Section
	metadataRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		paddingVertical: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		paddingHorizontal: 12,
	},
	metadataItem: {
		flex: 1,
		alignItems: 'center',
	},
	metadataLabel: {
		color: ReMapColors.ui.textSecondary,
		marginBottom: 2,
		fontSize: 10,
	},
	metadataValue: {
		color: ReMapColors.ui.text,
		fontSize: 11,
		fontWeight: '500',
		textAlign: 'center',
	},

	// Content Sections
	section: {
		marginBottom: 20,
	},
	sectionLabel: {
		marginBottom: 8,
		color: ReMapColors.primary.violet,
		fontSize: 13,
	},
	description: {
		lineHeight: 22,
		color: ReMapColors.ui.text,
	},
	locationDetails: {
		color: ReMapColors.ui.text,
		marginBottom: 4,
	},
	coordinates: {
		color: ReMapColors.ui.textSecondary,
		fontFamily: 'monospace',
		fontSize: 10,
	},

	// Visibility Tags
	visibilityContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	visibilityTag: {
		backgroundColor: ReMapColors.primary.violet,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	visibilityText: {
		color: ReMapColors.ui.cardBackground,
		fontSize: 10,
		fontWeight: '500',
	},

	// Media Section
	mediaGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	mediaThumbnail: {
		width: 80,
		height: 60,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	mediaPlaceholder: {
		fontSize: 9,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
	},
	thumbnailImage: {
		width: '100%',
		height: '100%',
		borderRadius: 6,
	},

	// Audio Section
	audioContainer: {
		backgroundColor: ReMapColors.ui.background,
		padding: 12,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.blue,
	},
	audioText: {
		color: ReMapColors.ui.text,
	},

	// Actions
	actionsContainer: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 20,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: ReMapColors.ui.border,
	},
	actionButton: {
		flex: 1,
	},
});

export default PinBottomSheet;
