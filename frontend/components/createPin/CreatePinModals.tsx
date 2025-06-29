// ========================
//   REACT NATIVE IMPORTS
// ========================
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';

// ================
//   UI IMPORTS
// ================
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
	HeaderText,
	SubheaderText,
	CaptionText,
	ErrorText,
} from '@/components/ui/Typography';

// ================
//   MODAL IMPORTS
// ================
import { PreviewModal } from './PreviewModal';

// =====================
//   CONSTANTS IMPORTS
// =====================
import { ReMapColors } from '@/constants/Colors';

// ========================
//   TYPE DEFINITIONS
// ========================
interface MemoryData {
	id: string;
	timestamp: string;
	location: { query: string };
	content: { name: string; description: string };
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
	isUploading: boolean;
	saveError: string | null;

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
	isUploading,
	saveError,
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

						{/* ==================== */}
						{/*    ERROR DISPLAY     */}
						{/* ==================== */}
						{saveError && (
							<View style={styles.errorContainer}>
								<View style={styles.errorHeader}>
									<HeaderText style={styles.errorIcon}>
										⚠️
									</HeaderText>
									<SubheaderText style={styles.errorTitle}>
										Save Failed
									</SubheaderText>
								</View>
								<CaptionText style={styles.errorMessage}>
									{saveError}
								</CaptionText>
								<ErrorText style={styles.errorHint}>
									Please check your connection and try again,
									or edit your memory if needed.
								</ErrorText>
							</View>
						)}
					</Modal.Body>

					<Modal.Footer>
						<Button onPress={onClosePreview} variant="secondary">
							{saveError ? 'Edit & Try Again' : 'Edit'}
						</Button>
						<Button
							onPress={handleConfirmAndPost}
							variant="primary"
							disabled={!!saveError}
						>
							{saveError ? 'Fix Error First' : 'Confirm & Post'}
						</Button>
					</Modal.Footer>
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

	// Error Display Styles
	errorContainer: {
		marginTop: 16,
		padding: 16,
		backgroundColor: '#FEF2F2',
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: '#EF4444',
	},
	errorHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	errorIcon: {
		fontSize: 18,
		marginRight: 8,
	},
	errorTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#991B1B',
	},
	errorMessage: {
		fontSize: 14,
		color: '#7F1D1D',
		marginBottom: 8,
		lineHeight: 20,
	},
	errorHint: {
		fontSize: 12,
		color: '#991B1B',
		fontStyle: 'italic',
		opacity: 0.8,
	},
});
