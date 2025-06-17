// hooks/createPin/useCreatePin.ts
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import {
	createMemoryPin,
	type CreateMemoryRequest,
	type UploadProgress,
} from '@/services/memoryService';
import { MediaItem } from './useMediaCapture';

// ========================
//   TYPE DEFINITIONS
// ========================
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
		photos: any[];
		videos: any[];
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

interface UseCreatePinProps {
	// Content data
	memoryTitle: string;
	memoryDescription: string;
	locationQuery: string;
	coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	} | null;

	// Privacy data
	selectedVisibility: string[];
	selectedSocialCircles: string[];

	// Media data
	selectedMedia: MediaItem[];
	audioUri: string | null;

	// Validation function
	validateMemoryContent: () => boolean;

	// Reset functions
	resetMemoryContent: () => void;
	resetMedia: () => void;
	resetPrivacySettings: () => void;
	setMemoryTitle: (title: string) => void;
	setMemoryDescription: (description: string) => void;

	// Modal system
	showModal: (
		type: string,
		title: string,
		message: string,
		actions?: any[]
	) => void;
	hideModal: () => void;
}

export const useCreatePin = (props: UseCreatePinProps) => {
	const {
		memoryTitle,
		memoryDescription,
		locationQuery,
		coordinates,
		selectedVisibility,
		selectedSocialCircles,
		selectedMedia,
		audioUri,
		validateMemoryContent,
		resetMemoryContent,
		resetMedia,
		resetPrivacySettings,
		setMemoryTitle,
		setMemoryDescription,
		showModal,
		hideModal,
	} = props;

	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [previewData, setPreviewData] = useState<MemoryData | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
		null
	);

	// =======================
	//  DATA TRANSFORMATION
	// =======================
	const createMemoryData = useCallback((): MemoryData => {
		return {
			id: Date.now().toString(),
			timestamp: new Date().toISOString(),
			location: {
				query: coordinates?.address || locationQuery.trim(),
			},
			content: {
				title: memoryTitle.trim(),
				description: memoryDescription.trim(),
			},
			visibility: selectedVisibility,
			socialCircles: selectedSocialCircles,
			media: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri
					? {
							uri: audioUri,
							recorded: new Date().toISOString(),
					  }
					: null,
			},
			metadata: {
				totalMediaItems: selectedMedia.length + (audioUri ? 1 : 0),
				hasDescription: !!memoryDescription.trim(),
				createdAt: new Date().toISOString(),
			},
		};
	}, [
		memoryTitle,
		memoryDescription,
		locationQuery,
		coordinates,
		selectedVisibility,
		selectedSocialCircles,
		selectedMedia,
		audioUri,
	]);

	const createBackendMemoryData = useCallback((): CreateMemoryRequest => {
		console.log('Creating backend data with coordinates:', coordinates);

		if (!coordinates) {
			throw new Error('Location coordinates are required');
		}

		return {
			name: memoryTitle.trim(),
			description: memoryDescription.trim(),
			latitude: coordinates.latitude,
			longitude: coordinates.longitude,
			location_query: locationQuery.trim(),
			visibility: selectedVisibility,
			social_circle_ids: selectedSocialCircles,
			media: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri ? { uri: audioUri } : null,
			},
		};
	}, [
		memoryTitle,
		memoryDescription,
		coordinates,
		locationQuery,
		selectedVisibility,
		selectedSocialCircles,
		selectedMedia,
		audioUri,
	]);

	// ===========================
	//   PREVIEW FUNCTIONALITY
	// ===========================
	const handlePreviewMemory = useCallback(() => {
		if (!validateMemoryContent()) {
			return; // Hook handles showing the error modal
		}

		const memoryData = createMemoryData();
		setPreviewData(memoryData);

		showModal('preview', 'Preview Your Memory', '', [
			{
				text: 'Edit',
				onPress: hidePreviewModal,
				style: 'secondary',
			},
			{
				text: 'Confirm & Post',
				onPress: handleConfirmSave,
				style: 'primary',
			},
		]);
	}, [validateMemoryContent, createMemoryData, showModal]);

	const hidePreviewModal = useCallback(() => {
		hideModal();
		setPreviewData(null);
	}, [hideModal]);

	// ===========================
	//   SAVE FUNCTIONALITY
	// ===========================
	const handleConfirmSave = useCallback(async () => {
		const TESTING_MODE = __DEV__ || process.env.NODE_ENV === 'development';

		setIsSaving(true);
		setUploadProgress({
			total: 0,
			completed: 0,
			currentFile: 'Preparing...',
			percentage: 0,
		});

		try {
			const memoryData = createMemoryData();
			const backendData = createBackendMemoryData();

			if (TESTING_MODE) {
				console.log('Testing mode: Simulating save...');

				const totalFiles = selectedMedia.length + (audioUri ? 1 : 0);
				setUploadProgress({
					total: totalFiles,
					completed: totalFiles,
					currentFile: 'Complete',
					percentage: 100,
				});

				await new Promise((resolve) => setTimeout(resolve, 1000));

				console.log('Frontend data:', memoryData);
				console.log('Backend payload:', backendData);
				console.log('✅ Test save completed');

				const result = {
					success: true,
					data: {
						id: `test-${Date.now()}`,
						name: backendData.name,
					},
				};

				handleSaveSuccess(memoryData, result);
			} else {
				const result = await createMemoryPin(backendData, {
					onStart: () => {
						console.log('Upload started');
					},
					onProgress: setUploadProgress,
					onFileComplete: (fileName) => {
						console.log(`File completed: ${fileName}`);
					},
					onComplete: () => {
						console.log('All uploads completed');
					},
					onError: (error) => {
						console.error('Upload error:', error);
					},
				});

				if (result.success) {
					console.log('Memory saved:', result.data);
					handleSaveSuccess(memoryData, result);
				} else {
					handleSaveError(result.error || 'Unknown error occurred'); // ✅ Fixed
				}
			}
		} catch (error) {
			console.error('Save error:', error);
			handleSaveError('Unexpected error occurred');
		} finally {
			setIsSaving(false);
			setUploadProgress(null);
		}
	}, [createMemoryData, createBackendMemoryData, selectedMedia, audioUri]);

	const handleSaveSuccess = useCallback(
		(memoryData: MemoryData, result: any) => {
			hideModal();
			showModal(
				'success',
				'Memory Posted!',
				`"${memoryData.content.title}" posted to ${memoryData.location.query}`,
				[
					{
						text: 'View on Map',
						onPress: () => {
							hideModal();
							router.replace('/worldmap');
						},
						style: 'primary',
					},
					{
						text: 'Create Another',
						onPress: resetForm,
						style: 'secondary',
					},
				]
			);
		},
		[hideModal, showModal]
	);

	const handleSaveError = useCallback(
		(error: string) => {
			showModal(
				'error',
				'Save Failed',
				error || 'Something went wrong. Please try again.',
				[{ text: 'Try Again', onPress: hideModal, style: 'primary' }]
			);
		},
		[showModal, hideModal]
	);

	const resetForm = useCallback(() => {
		hideModal();
		setMemoryTitle('');
		setMemoryDescription('');
		resetMemoryContent();
		resetMedia();
		resetPrivacySettings();
		setPreviewData(null);
	}, [
		hideModal,
		setMemoryTitle,
		setMemoryDescription,
		resetMemoryContent,
		resetMedia,
		resetPrivacySettings,
	]);

	// ==================
	//   RETURN INTERFACE
	// ==================
	return {
		// State
		previewData,
		isSaving,
		uploadProgress,

		// Actions
		handlePreviewMemory,
		hidePreviewModal,
		handleConfirmSave,
		resetForm,

		// Data creators (in case you need them elsewhere)
		createMemoryData,
		createBackendMemoryData,
	};
};
