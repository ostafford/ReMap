// ================
//   CORE IMPORTS
// ================
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
	Modal,
} from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	BodyText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ==================
// TYPE DEFINITIONS
// ==================

interface MemoryData {
	id: string;
	timestamp: string;
	location: {
		query: string;
	};
	content: {
		title: string;
		description: string;
	};
	visibility: string[];
	socialCircles: string[];
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: {
			uri: string;
			recorded: string;
		} | null;
	};
	metadata: {
		totalMediaItems: number;
		hasDescription: boolean;
		createdAt: string;
	};
}

interface PreviewBottomSheetProps {
	isVisible: boolean;
	onClose: () => void;
	previewData: MemoryData | null;
	onImagePreview: (imageUri: string) => void;
	getVisibilityDescription: () => string;
	getSelectedSocialCirclesData: () => Array<{
		id: string;
		name: string;
		color: string;
		memberCount: number;
	}>;
	getMediaSummary: () => {
		photoCount: number;
		videoCount: number;
		hasAudio: boolean;
	};
	selectedSocialCircles: string[];
	onConfirmSave: () => void;
	onResetForm: () => void;
	isUploading: boolean;
	// Audio playback props
	onPlayAudio?: () => Promise<void>;
	onStopAudio?: () => Promise<void>;
	isPlayingAudio?: boolean;
}

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

export function PreviewBottomSheet({
	isVisible,
	onClose,
	previewData,
	onImagePreview,
	getVisibilityDescription,
	getSelectedSocialCirclesData,
	getMediaSummary,
	selectedSocialCircles,
	onConfirmSave,
	onResetForm,
	isUploading,
	onPlayAudio,
	onStopAudio,
	isPlayingAudio = false,
}: PreviewBottomSheetProps) {
	// ========================
	// BOTTOMSHEET SETUP
	// ========================
	const bottomSheetRef = useRef<BottomSheet>(null);
	// Use 95% height to give more space for content
	const snapPoints = useMemo(() => ['95%'], []);

	// ========================
	// STATE MANAGEMENT
	// ========================
	const [fullImageModal, setFullImageModal] = useState<{
		visible: boolean;
		imageUri: string | null;
	}>({
		visible: false,
		imageUri: null,
	});

	// ========================
	// EVENT HANDLERS
	// ========================
	const handleSheetChanges = useCallback(
		(index: number) => {
			console.log('Preview BottomSheet snap index:', index);
			if (index === -1) {
				onClose();
			}
		},
		[onClose]
	);

	const handleImagePress = useCallback((imageUri: string) => {
		setFullImageModal({
			visible: true,
			imageUri,
		});
	}, []);

	const handleCloseFullImage = useCallback(() => {
		setFullImageModal({
			visible: false,
			imageUri: null,
		});
	}, []);

	const handleEditPress = useCallback(() => {
		// Just close the preview - don't reset form
		onClose();
	}, [onClose]);

	const handleAudioPress = useCallback(() => {
		if (isPlayingAudio) {
			onStopAudio?.();
		} else {
			onPlayAudio?.();
		}
	}, [isPlayingAudio, onPlayAudio, onStopAudio]);

	// ========================
	// EARLY RETURN
	// ========================
	if (!isVisible || !previewData) {
		return null;
	}

	// ========================
	// RENDER COMPONENT
	// ========================
	return (
		<>
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
							<HeaderText style={styles.previewTitle}>
								{previewData?.content?.title ||
									'Untitled Memory'}
							</HeaderText>
							<CaptionText style={styles.previewLocation}>
								📍{' '}
								{previewData?.location?.query ||
									'Unknown Location'}
							</CaptionText>
							<CaptionText style={styles.previewTimestamp}>
								{previewData?.timestamp
									? new Date(
											previewData.timestamp
									  ).toLocaleString()
									: 'Now'}
							</CaptionText>
						</View>
						{/* Removed X button - user can drag down or tap outside */}
					</View>

					{/* ==================== */}
					{/*   SCROLLABLE CONTENT  */}
					{/* ==================== */}
					<ScrollView
						style={styles.scrollContent}
						contentContainerStyle={styles.scrollContentContainer}
						showsVerticalScrollIndicator={false}
					>
						{/* ==================== */}
						{/*   MEDIA PREVIEW      */}
						{/* ==================== */}
						{previewData.media.photos.length > 0 && (
							<View style={styles.mediaSection}>
								<LabelText style={styles.sectionLabel}>
									Photos ({previewData.media.photos.length})
								</LabelText>
								<View style={styles.mediaGrid}>
									{previewData.media.photos.map(
										(photo, index) => (
											<TouchableOpacity
												key={index}
												style={styles.mediaThumbnail}
												onPress={() =>
													handleImagePress(photo.uri)
												}
											>
												<Image
													source={{ uri: photo.uri }}
													style={
														styles.thumbnailImage
													}
													resizeMode="cover"
												/>
											</TouchableOpacity>
										)
									)}
								</View>
							</View>
						)}

						{/* ==================== */}
						{/*   AUDIO PREVIEW      */}
						{/* ==================== */}
						{previewData.media.audio && (
							<View style={styles.mediaSection}>
								<LabelText style={styles.sectionLabel}>
									Audio Recording
								</LabelText>
								<View style={styles.audioPreviewContainer}>
									<View style={styles.audioVisualizer}>
										<BodyText style={styles.audioIcon}>
											🎶
										</BodyText>
										<View style={styles.audioWaveform}>
											{[1, 2, 3, 4, 5].map((bar) => (
												<View
													key={bar}
													style={[
														styles.waveformBar,
														isPlayingAudio &&
															styles.waveformBarActive,
													]}
												/>
											))}
										</View>
									</View>
									<View style={styles.audioControls}>
										<IconButton
											icon={
												isPlayingAudio ? 'stop' : 'play'
											}
											onPress={handleAudioPress}
											backgroundColor={
												ReMapColors.primary.blue
											}
											size={24}
											style={styles.audioButton}
										/>
										<CaptionText style={styles.audioStatus}>
											{isPlayingAudio
												? 'Playing...'
												: 'Tap to play'}
										</CaptionText>
									</View>
								</View>
							</View>
						)}

						{/* ==================== */}
						{/*   MEDIA SUMMARY      */}
						{/* ==================== */}
						{previewData.metadata.totalMediaItems > 0 && (
							<View style={styles.previewSection}>
								<LabelText style={styles.sectionLabel}>
									Media Summary
								</LabelText>
								<BodyText style={styles.mediaCount}>
									{getMediaSummary().photoCount} photo(s),{' '}
									{getMediaSummary().videoCount} video(s)
									{getMediaSummary().hasAudio &&
										', 1 audio recording'}
								</BodyText>
							</View>
						)}

						{/* ==================== */}
						{/*   DESCRIPTION        */}
						{/* ==================== */}
						{previewData?.content?.description && (
							<View style={styles.previewSection}>
								<LabelText style={styles.sectionLabel}>
									Description
								</LabelText>
								<BodyText style={styles.previewDescription}>
									{previewData.content.description}
								</BodyText>
							</View>
						)}

						{/* ==================== */}
						{/*   PRIVACY SUMMARY    */}
						{/* ==================== */}
						<View style={styles.previewSection}>
							<LabelText style={styles.sectionLabel}>
								Privacy Settings
							</LabelText>
							<BodyText style={styles.previewPrivacy}>
								{getVisibilityDescription()}
							</BodyText>

							{selectedSocialCircles.length > 0 && (
								<View style={styles.socialCirclesPreview}>
									<LabelText
										style={styles.socialCirclesLabel}
									>
										Selected Social Circles:
									</LabelText>
									{getSelectedSocialCirclesData().map(
										(circle) => (
											<View
												key={circle.id}
												style={[
													styles.socialCirclePreviewItem,
													{
														borderLeftColor:
															circle.color,
													},
												]}
											>
												<BodyText
													style={
														styles.socialCircleName
													}
												>
													{circle.name}
												</BodyText>
												<CaptionText
													style={
														styles.socialCircleMembers
													}
												>
													{circle.memberCount} members
												</CaptionText>
											</View>
										)
									)}
								</View>
							)}
						</View>

						{/* ==================== */}
						{/*   PREVIEW FOOTER     */}
						{/* ==================== */}
						<CaptionText style={styles.previewFooter}>
							Review your memory above, then choose to edit or
							confirm posting.
						</CaptionText>
					</ScrollView>

					{/* ==================== */}
					{/*   ACTION BUTTONS     */}
					{/* ==================== */}
					<View style={styles.actionsContainer}>
						<Button
							onPress={handleEditPress}
							style={styles.actionButton}
							variant="secondary"
							disabled={isUploading}
						>
							Edit
						</Button>
						<Button
							onPress={onConfirmSave}
							style={styles.actionButton}
							variant="primary"
							disabled={isUploading}
						>
							{isUploading ? 'Posting...' : 'Confirm & Post'}
						</Button>
					</View>
				</BottomSheetView>
			</BottomSheet>

			{/* ==================== */}
			{/*   FULL IMAGE MODAL   */}
			{/* ==================== */}
			<Modal
				visible={fullImageModal.visible}
				transparent={true}
				animationType="fade"
				onRequestClose={handleCloseFullImage}
			>
				<View style={styles.fullImageModalOverlay}>
					<TouchableOpacity
						style={styles.fullImageModalContent}
						onPress={handleCloseFullImage}
						activeOpacity={1}
					>
						<TouchableOpacity
							style={styles.fullImageContainer}
							onPress={() => {}} // Prevent closing when tapping image
							activeOpacity={1}
						>
							{fullImageModal.imageUri && (
								<Image
									source={{ uri: fullImageModal.imageUri }}
									style={styles.fullImage}
									resizeMode="contain"
								/>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.closeFullImageButton}
							onPress={handleCloseFullImage}
						>
							<CaptionText style={styles.closeFullImageText}>
								✕
							</CaptionText>
						</TouchableOpacity>
					</TouchableOpacity>
				</View>
			</Modal>
		</>
	);
}

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	bottomSheetBackground: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 8,
	},
	bottomSheetHandle: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	contentContainer: {
		flex: 1,
		padding: 20,
		paddingTop: 10,
	},

	// Header Section
	header: {
		marginBottom: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: ReMapColors.ui.border,
	},
	headerMain: {
		flex: 1,
	},
	previewTitle: {
		marginBottom: 8,
		color: ReMapColors.ui.text,
	},
	previewLocation: {
		marginBottom: 4,
		color: ReMapColors.primary.blue,
	},
	previewTimestamp: {
		opacity: 0.7,
	},

	// Scrollable Content
	scrollContent: {
		flex: 1,
	},
	scrollContentContainer: {
		flexGrow: 1,
		paddingBottom: 20,
	},

	// Media Section
	mediaSection: {
		marginBottom: 20,
	},
	sectionLabel: {
		marginBottom: 12,
		color: ReMapColors.primary.violet,
		fontSize: 14,
		fontWeight: '600',
	},
	mediaGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	mediaThumbnail: {
		width: 100,
		height: 100,
		borderRadius: 12,
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: ReMapColors.ui.border,
		backgroundColor: ReMapColors.ui.background,
	},
	thumbnailImage: {
		width: '100%',
		height: '100%',
	},

	// Audio Preview
	audioPreviewContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		borderColor: ReMapColors.ui.border,
	},
	audioVisualizer: {
		width: 60,
		height: 60,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		marginRight: 16,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	audioIcon: {
		fontSize: 24,
		marginBottom: 4,
	},
	audioWaveform: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 2,
	},
	waveformBar: {
		width: 3,
		height: 8,
		backgroundColor: ReMapColors.ui.textSecondary,
		borderRadius: 1,
	},
	waveformBarActive: {
		backgroundColor: ReMapColors.primary.blue,
		height: 12,
	},
	audioControls: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	audioButton: {
		width: 40,
		height: 40,
	},
	audioStatus: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 14,
	},

	// Content Sections
	previewSection: {
		marginBottom: 20,
	},
	previewDescription: {
		marginTop: 8,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		lineHeight: 20,
	},
	previewPrivacy: {
		marginTop: 8,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
	},
	mediaCount: {
		marginTop: 8,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
	},

	// Social Circles
	socialCirclesPreview: {
		marginTop: 12,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.blue,
	},
	socialCirclesLabel: {
		marginBottom: 8,
		color: ReMapColors.primary.blue,
	},
	socialCirclePreviewItem: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 8,
		borderRadius: 6,
		marginBottom: 6,
		borderLeftWidth: 3,
	},
	socialCircleName: {
		fontWeight: '500',
	},
	socialCircleMembers: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 11,
	},

	// Preview Footer
	previewFooter: {
		marginTop: 16,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		opacity: 0.8,
		textAlign: 'center',
	},

	// Actions
	actionsContainer: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 16,
		paddingTop: 16,
		paddingHorizontal: 8,
		borderTopWidth: 1,
		borderTopColor: ReMapColors.ui.border,
		backgroundColor: ReMapColors.ui.cardBackground,
	},
	actionButton: {
		flex: 1,
	},

	// Full Image Modal
	fullImageModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullImageModalContent: {
		flex: 1,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullImageContainer: {
		flex: 1,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullImage: {
		width: '100%',
		height: '100%',
	},
	closeFullImageButton: {
		position: 'absolute',
		top: 50,
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeFullImageText: {
		color: 'white',
		fontSize: 20,
		lineHeight: 22,
	},
});

export default PreviewBottomSheet;
