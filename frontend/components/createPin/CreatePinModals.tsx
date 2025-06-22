/**
 * CREATEPIN MODALS - CENTRALIZED MODAL MANAGEMENT
 * Purpose: Handles all modal states and transitions for the CreatePin feature
 * Owns: Preview, Upload, Success, and Image preview modal states
 * Pattern: Single component manages related modal states with clear callbacks
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

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
	//   LOCAL STATE MANAGEMENT
	// ==================

	// Success Modal State
	const [successModal, setSuccessModal] = useState<{
		visible: boolean;
		title: string;
		message: string;
	}>({
		visible: false,
		title: '',
		message: '',
	});

	// ==================
	//   MODAL ACTIONS
	// ==================

	const hidePreviewModal = useCallback(() => {
		console.log('🎯 [MODAL] Preview modal close requested');
	}, []);

	const showSuccessModal = useCallback((title: string, message: string) => {
		console.log('🎯 [MODAL] Showing success modal:', title);
		setSuccessModal({
			visible: true,
			title,
			message,
		});
	}, []);

	const hideSuccessModal = useCallback(() => {
		console.log('🎯 [MODAL] Hiding success modal');
		setSuccessModal({
			visible: false,
			title: '',
			message: '',
		});
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
		console.log('🎯 [MODAL] Confirm & Post pressed');
		onConfirmSave();
	}, [onConfirmSave]);

	const handleSuccessNavigation = useCallback(() => {
		hideSuccessModal();

		// Add a small delay to ensure smooth transition
		setTimeout(() => {
			onNavigateToMap();
			onResetForm();
		}, 500);
	}, [hideSuccessModal, onNavigateToMap, onResetForm]);

	// ==================
	//   EFFECT HANDLERS
	// ==================

	// IMPROVED: Better success modal timing
	useEffect(() => {
		// Show success modal when upload completes successfully
		if (!isUploading && uploadProgress?.percentage === 100) {
			console.log(
				'🎯 [MODAL] Upload completed, showing success in 500ms'
			);

			// Small delay to ensure upload modal is visible for a moment
			setTimeout(() => {
				showSuccessModal(
					'Memory Created! 🎉',
					'Your memory has been successfully saved and is now live on the map!'
				);
			}, 500);
		}
	}, [isUploading, uploadProgress, showSuccessModal]);

	// Auto-close success modal and navigate after 4 seconds
	useEffect(() => {
		if (successModal.visible) {
			const timer = setTimeout(() => {
				console.log('🎯 [MODAL] Auto-navigating after success modal');
				handleSuccessNavigation();
			}, 4000); // 4 seconds to read the success message

			return () => clearTimeout(timer);
		}
	}, [successModal.visible, handleSuccessNavigation]);

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

							{/* ADDED: Visual feedback for completion */}
							{uploadProgress?.percentage === 100 && (
								<CaptionText style={styles.completionMessage}>
									✅ Upload complete! Preparing success
									confirmation...
								</CaptionText>
							)}
						</View>
					</Modal.Body>
				</Modal.Container>
			</Modal>

			{/* ============= */}
			{/* SUCCESS MODAL */}
			{/* ============= */}
			<Modal
				isVisible={successModal.visible}
				onBackdropPress={() => {}} // Prevent closing by tapping outside
			>
				<Modal.Container>
					<Modal.Header title={successModal.title} />
					<Modal.Body>
						<View style={styles.successModalContent}>
							<BodyText style={styles.successIcon}>🎉</BodyText>
							<BodyText style={styles.successMessage}>
								{successModal.message}
							</BodyText>
							<CaptionText style={styles.successSubtext}>
								Redirecting to world map in a few seconds...
							</CaptionText>
						</View>
					</Modal.Body>
					<Modal.Footer>
						<Button
							onPress={handleSuccessNavigation}
							variant="primary"
						>
							View on Map Now
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>

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
	// SUCCESS MODAL STYLES
	successModalContent: {
		alignItems: 'center',
		padding: 20,
	},
	successIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	successMessage: {
		textAlign: 'center',
		marginBottom: 12,
		lineHeight: 24,
	},
	successSubtext: {
		textAlign: 'center',
		opacity: 0.7,
		fontStyle: 'italic',
	},

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
	// ADDED: Completion message styling
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
