// ===================
//   SERVICES IMPORT
// ===================
import { getCurrentUser } from '@/services/auth';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

// ==================
// TYPE DEFINITIONS
// ==================

export interface CreateMemoryRequest {
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string;
	visibility: string[];
	social_circle_ids: string[];
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string } | null;
	};
}

interface ApiResponse {
	success: boolean;
	data?: any;
	error?: string;
}

// ==================
// CONFIGURATION
// ==================

const API_BASE_URL = __DEV__
	? 'http://192.168.1.22:3000'
	: 'https://your-production-api.com'; // TODO: Replace with actual production URL

const API_ENDPOINTS = {
	CREATE_PIN: '/api/pins/user',
	HEALTH_CHECK: '/api/profiles',
} as const;

// ==================
// AUTHENTICATION HELPER
// ==================

/**
 * Gets the JWT token from Supabase auth for backend API calls
 * Pattern: "Add JWT to headers as 'Authorization': 'Bearer {token}'"
 */
const getAuthToken = async (): Promise<string> => {
	try {
		const { user } = await getCurrentUser();
		if (!user) {
			throw new Error('User not authenticated');
		}
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error || !session?.access_token) {
			throw new Error('Could not retrieve authentication token');
		}

		return session.access_token;
	} catch (error) {
		console.error('[M.SERVICE] Failed to get auth token:', error);
		throw new Error('Authentication failed');
	}
};

// ======================
// DATA TRANSFORMATION
// ======================

/**
 * Converts frontend data format to FormData for backend API
 * Handles the separation of regular data vs files
 */
const buildFormDataForBackend = async (
	memoryData: CreateMemoryRequest
): Promise<FormData> => {
	const formData = new FormData();

	// Add regular text data
	formData.append('name', memoryData.name);
	formData.append('description', memoryData.description);
	formData.append('latitude', memoryData.latitude.toString());
	formData.append('longitude', memoryData.longitude.toString());

	// Add visibility as JSON string (since FormData doesn't handle arrays well)
	formData.append('visibility', JSON.stringify(memoryData.visibility));
	formData.append(
		'social_circle_ids',
		JSON.stringify(memoryData.social_circle_ids)
	);
	formData.append('location_query', memoryData.location_query);

	// Add image files
	for (const photo of memoryData.media.photos) {
		try {
			// Convert URI to blob for upload
			const response = await fetch(photo.uri);
			const blob = await response.blob();

			formData.append('image', blob, photo.name);
		} catch (error) {
			console.error(
				`[M.SERVICE] Failed to process photo ${photo.name}:`,
				error
			);
			throw new Error(`Could not process photo: ${photo.name}`);
		}
	}

	// Add video files
	for (const video of memoryData.media.videos) {
		try {
			const response = await fetch(video.uri);
			const blob = await response.blob();

			formData.append('video', blob, video.name);
		} catch (error) {
			console.error(
				`[M.SERVICE] Failed to process video ${video.name}:`,
				error
			);
			throw new Error(`Could not process video: ${video.name}`);
		}
	}

	// Add audio file
	if (memoryData.media.audio) {
		try {
			console.log(
				'[M.SERVICE] Processing audio file:',
				memoryData.media.audio.uri
			);

			const response = await fetch(memoryData.media.audio.uri);
			const originalBlob = await response.blob();

			// Determine correct MIME type based on platform/file extension
			let mimeType = 'audio/m4a'; // Default for iOS

			if (Platform.OS === 'android') {
				mimeType = 'audio/mpeg4'; // Android HIGH_QUALITY format
			} else if (Platform.OS === 'web') {
				mimeType = 'audio/webm'; // Web format
			}

			// Create blob with correct MIME type
			const audioBlob = new Blob([originalBlob], { type: mimeType });

			console.log('[M.SERVICE] Audio blob details:', {
				originalType: originalBlob.type,
				correctedType: audioBlob.type,
				size: audioBlob.size,
				platform: Platform.OS,
				filename: 'audio_recording.m4a',
			});

			formData.append('audio', audioBlob, 'audio_recording.m4a');
		} catch (error) {
			console.error('[M.SERVICE] Failed to process audio:', error);
			throw new Error('Could not process audio recording');
		}
	}

	return formData;
};

// ==================
// VALIDATION
// ==================

/**
 * Client-side validation before sending to backend
 * Backend will also validate, but this provides immediate feedback
 */
const validateMemoryData = (data: CreateMemoryRequest): string[] => {
	const errors: string[] = [];

	if (!data.name.trim()) {
		errors.push('Memory title is required');
	}

	if (data.name.trim().length > 100) {
		errors.push('Memory title must be less than 100 characters');
	}

	if (!data.description.trim()) {
		errors.push('Memory description is required');
	}

	if (data.description.trim().length > 500) {
		errors.push('Memory description must be less than 500 characters');
	}

	if (!data.latitude || !data.longitude) {
		errors.push('Valid location coordinates are required');
	}

	if (!data.location_query.trim()) {
		errors.push('Location description is required');
	}

	if (data.visibility.length === 0) {
		errors.push('Please select at least one visibility option');
	}

	return errors;
};

// ==================
// MAIN API FUNCTION
// ==================
export const createMemoryPin = async (
	memoryData: CreateMemoryRequest
): Promise<ApiResponse> => {
	try {
		console.log('[M.SERVICE] Starting memory pin creation');

		// Validate data before sending
		const validationErrors = validateMemoryData(memoryData);
		if (validationErrors.length > 0) {
			throw new Error(
				`Validation failed: ${validationErrors.join(', ')}`
			);
		}

		// Get authentication token
		const authToken = await getAuthToken();

		// Build FormData for backend
		const formData = await buildFormDataForBackend(memoryData);

		// Make API call to backend
		console.log(
			'[M.SERVICE] Making API call to:',
			`${API_BASE_URL}${API_ENDPOINTS.CREATE_PIN}`
		);

		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.CREATE_PIN}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				body: formData,
			}
		);

		// Handle response
		if (!response.ok) {
			const errorText = await response.text();
			console.error('[M.SERVICE] Backend API error:', {
				status: response.status,
				statusText: response.statusText,
				body: errorText,
			});

			throw new Error(`Backend error (${response.status}): ${errorText}`);
		}

		// Parse successful response
		const result = await response.json();
		console.log('[M.SERVICE] Memory created successfully:', result);

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('[M.SERVICE] Memory creation failed:', error);

		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown error occurred',
		};
	}
};

// ================================
// EXPORT ALL TYPES AND FUNCTIONS
// ================================

export type { ApiResponse };
export default createMemoryPin;
