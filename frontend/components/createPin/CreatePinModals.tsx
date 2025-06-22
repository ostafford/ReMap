/**
 * CREATEPIN MODALS - CENTRALIZED MODAL MANAGEMENT (UPDATED FOR TOP NOTIFICATION)
 * Purpose: Handles all modal states and transitions for the CreatePin feature
 * Owns: Preview, Upload, and Image preview modal states
 * Pattern: Single component manages related modal states with clear callbacks
 * UPDATED: Removed success modal since we now use TopNotificationSheet on worldmap
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';

// Base UI Components
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BodyText, CaptionText } from '@/components/ui/Typography';

// Feature Components
import { PreviewModal } from './PreviewModal';

// Constants
import { ReMapColors } from '@/constants/Colors';

// ========================
//   TYPE DEFINITIONS
// ========================
interface MemoryData {
	id: string;
	timestamp: string;
	location: { query: string };
	content: { title: string; description: string };
	visibility: string[];
	socialCircles: string[];
	media: {
		photos: any[];
		videos: any[];
		audio: { uri: string; recorded: string } | null;
	};
	metadata: {
		totalMediaItems: number;
		hasDescription: boolean;
		createdAt: string;
	};
}

interface UploadProgress {
	total: number;
	completed: number;
	currentFile: string;
	percentage: number;
}

interface ImagePreviewState {
	visible: boolean;
	imageUri: string | null;
}

interface CreatePinModalsProps {
	// Data from hooks
	previewData: MemoryData | null;
	uploadProgress: UploadProgress | null;
	isUploading: boolean;

	// Callbacks to hook
	onConfirmSave: () => void;
	onNavigateToMap: () => void;
	onResetForm: () => void;

	// Helper functions from other hooks
	onImagePreview: (imageUri: string) => void;
	onClosePreview: () => void;
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

	// Image preview state management
	imagePreviewState: ImagePreviewState;
	onCloseImagePreview: () => void;
}

// ========================
//   MAIN COMPONENT
// ========================
export const CreatePinModals: React.FC<CreatePinModalsProps> = ({
	previewData,
	uploadProgress,
	isUploading,
	onConfirmSave,
	onNavigateToMap,
	onResetForm,
	getVisibilityDescription,
	getSelectedSocialCirclesData,
	getMediaSummary,
	onImagePreview,
	onClosePreview,
	selectedSocialCircles,
	imagePreviewState,
	onCloseImagePreview,
}) => {
	// ==================
	//   MODAL ACTIONS
	// ==================

	const hidePreviewModal = useCallback(() => {
		console.log('🎯 [MODAL] Preview modal close requested');
	}, []);

	const showImagePreview = useCallback(
		(imageUri: string) => {
			console.log('🎯 [MODAL] Showing image preview');
			onImagePreview(imageUri);
		},
		[onImagePreview]
	);

	const hideImagePreview = useCallback(() => {
		console.log('🎯 [MODAL] Hiding image preview');
		onCloseImagePreview();
	}, [onCloseImagePreview]);

	const handleConfirmAndPost = useCallback(() => {
		console.log(
			'🎯 [MODAL] Confirm & Post pressed - will navigate to map with notification'
		);
		onConfirmSave();
	}, [onConfirmSave]);

	// ==================
	//   RENDER MODALS
	// ==================

	return (
		<>
			{/* ===================== */}
			{/* PREVIEW MODAL */}
			{/* ===================== */}
			<Modal isVisible={!!previewData} onBackdropPress={hidePreviewModal}>
				<Modal.Container>
					<Modal.Header title="Preview Your Memory" />
					<Modal.Body>
						{previewData && (
							<PreviewModal
								previewData={previewData}
								onImagePreview={showImagePreview}
								getVisibilityDescription={
									getVisibilityDescription
								}
								getSelectedSocialCirclesData={
									getSelectedSocialCirclesData
								}
								getMediaSummary={getMediaSummary}
								selectedSocialCircles={selectedSocialCircles}
							/>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button onPress={onClosePreview} variant="secondary">
							Edit
						</Button>
						<Button
							onPress={handleConfirmAndPost}
							variant="primary"
						>
							Confirm & Post
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>

			{/* ============ */}
			{/* UPLOAD MODAL */}
			{/* ============ */}
			<Modal
				isVisible={isUploading}
				onBackdropPress={() => {}} // Prevent closing during upload
			>
				<Modal.Container>
					<Modal.Header title="Creating Your Memory" />
					<Modal.Body>
						<View style={styles.uploadProgressContent}>
							<BodyText style={styles.uploadIcon}>📤</BodyText>

							{uploadProgress && (
								<>
									<BodyText style={styles.uploadStatus}>
										{uploadProgress.currentFile}
									</BodyText>

									<View style={styles.progressBarContainer}>
										<View
											style={[
												styles.progressBar,
												{
													width: `${uploadProgress.percentage}%`,
												},
											]}
										/>
									</View>

									<CaptionText
										style={styles.uploadPercentage}
									>
										{uploadProgress.percentage}% Complete
									</CaptionText>

									<CaptionText style={styles.uploadDetails}>
										{uploadProgress.completed} of{' '}
										{uploadProgress.total} steps
									</CaptionText>
								</>
							)}

							{/* UPDATED: Changed completion message to indicate navigation */}
							{uploadProgress?.percentage === 100 && (
								<CaptionText style={styles.completionMessage}>
									✅ Upload complete! Navigating to map...
								</CaptionText>
							)}
						</View>
					</Modal.Body>
				</Modal.Container>
			</Modal>

			{/* REMOVED: Success modal - now handled by TopNotificationSheet on worldmap */}

			{/* ================= */}
			{/* IMAGE PREVIEW MODAL */}
			{/* ================= */}
			<Modal
				isVisible={imagePreviewState.visible}
				onBackdropPress={hideImagePreview}
			>
				<Modal.Container>
					<Modal.Header title="Memory Photo" />
					<Modal.Body>
						<View style={styles.imagePreviewContainer}>
							{imagePreviewState.imageUri && (
								<Image
									source={{ uri: imagePreviewState.imageUri }}
									style={styles.fullImagePreview}
									resizeMode="contain"
								/>
							)}
						</View>
					</Modal.Body>
					<Modal.Footer>
						<Button onPress={hideImagePreview} variant="primary">
							Close
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>
		</>
	);
};

// ===============
//   STYLE SHEET
// ===============
const styles = StyleSheet.create({
	// UPLOAD MODAL STYLES
	uploadProgressContent: {
		alignItems: 'center',
		padding: 20,
	},
	uploadIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	uploadStatus: {
		textAlign: 'center',
		marginBottom: 16,
		fontWeight: '500',
	},
	progressBarContainer: {
		width: '100%',
		height: 8,
		backgroundColor: '#E5E7EB',
		borderRadius: 4,
		marginBottom: 12,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		backgroundColor: ReMapColors.primary.violet,
		borderRadius: 4,
	},
	uploadPercentage: {
		fontWeight: '600',
		marginBottom: 4,
	},
	uploadDetails: {
		opacity: 0.7,
		marginBottom: 8,
	},
	// UPDATED: Completion message styling
	completionMessage: {
		color: ReMapColors.semantic?.success || '#10B981',
		fontStyle: 'italic',
		textAlign: 'center',
	},

	// IMAGE PREVIEW STYLES
	imagePreviewContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 300,
		maxHeight: 500,
	},
	fullImagePreview: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
	},
});
