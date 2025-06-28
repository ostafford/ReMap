/** Handles logic to communicate to backend */

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';
import { Platform } from 'react-native';

// ==================
// TYPE DEFINITIONS
// ==================

export interface CreateMemoryRequest {
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string; // Human readable location (What the user typed in, or what the GPS button returns)
	visibility: string[];
	social_circle_ids: string[];
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string } | null;
	};
}

// Frontend pin structure for map display
export interface MapPin {
	id: string;
	coordinate: {
		latitude: number;
		longitude: number;
	};
	title: string;
	description: string;
	pinData: {
		memory: {
			title: string;
			description: string;
			author: string;
			createdAt: string;
			media: {
				photos: Array<{ name: string; uri: string }>;
				videos: any[];
				audio: {
					recorded: string;
				} | null;
			};
			visibility: string[];
		};
		name: string;
		location: {
			address: string;
			latitude: number;
			longitude: number;
		};
	};
}

// ==================
// UTILITY FUNCTIONS
// ==================

const getApiBaseUrl = (): string => {
	const url = process.env.EXPO_PUBLIC_BACKEND_URL;

	if (!url) {
		throw new Error('Backend url not defined');
	}

	return url;
};

// Put ip address here
const API_BASE_URL = getApiBaseUrl();

export default class RemapClient {
	private baseUrl;

	constructor() {
		if (!API_BASE_URL) {
			throw new Error('api base not defined');
		}

		this.baseUrl = API_BASE_URL;
	}

	// ==================
	// AUTHENTICATION METHODS
	// ==================

	/**
	 * Core HTTP request handler with authentication
	 * Example: makeRequest('pins/user', 'POST', { body: formData, isFormData: true })
	 */
	private async makeRequest(
		endpoint: string,
		method: string,
		options: {
			body?: any;
			isFormData?: boolean;
		} = {}
	) {
		// Get auth token
		const { data, error: authError } = await supabase.auth.getSession();
		const token = data.session?.access_token;

		const headers: Record<string, string> = {
			Authorization: `Bearer ${token}`,
		};

		// Add content type header if not form data
		if (!options.isFormData) {
			headers['Content-Type'] = 'application/json';
		}

		// Make HTTP request
		const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
			headers,
			method,
			body: options.body,
		});

		// Handle errors
		if (response.status === 403) {
			throw new Error('Protected endpoint');
		}

		if (!response.ok) {
			throw new Error('API error');
		}

		return await response.json();
	}

	/**
	 * Public method for JSON requests
	 * Flow: remap.ts → makeRequest() → backend
	 * Example: makeAuthRequest('profiles/123', 'GET')
	 */
	async makeAuthRequest(endpoint: string, method: string, body?: any) {
		return this.makeRequest(endpoint, method, { body });
	}

	/**
	 * Makes authenticated FormData requests
	 */
	async makeFormDataRequest(
		endpoint: string,
		method: string,
		formData: FormData
	) {
		return this.makeRequest(endpoint, method, {
			body: formData,
			isFormData: true,
		});
	}

	async getUserId() {
		const { data, error } = await supabase.auth.getUser();

		return data.user?.id;
	}

	// ==================
	// PROFILE METHODS
	// ==================

	async getProfile(): Promise<Tables<'profiles'> & { pins: number }> {
		const userId = await this.getUserId();

		if (!userId) {
			throw new Error('No user id found');
		}

		const response = await this.makeAuthRequest(
			`profiles/${userId}`,
			'GET'
		);

		return response;
	}

	// ==================
	// PIN CREATION METHODS
	// ==================
	/**
    1. User fills form in createPin.tsx
    ↓
    2. useCreatePin.ts validates and prepares data
    ↓
    3. createMemoryPin() called with CreateMemoryRequest
    ↓
    4. buildFormDataForBackend() converts to FormData
    ↓
    5. makeFormDataRequest() sends HTTP POST
    ↓
    6. makeRequest() adds authentication headers
    ↓
    7. Backend receives at POST /api/pins/user
    ↓
    8. pinsController.ts processes and saves to database
    ↓
    9. Backend returns success response
    ↓
    10. Frontend shows success notification
    */

	/**
	 * Purpose: Converts frontend data structure to FormData for file uploads
	 * Flow: CreateMemoryRequest → FormData → backend
	 * Why FormData: Backend expects multipart/form-data for file uploads
	 */
	private async buildFormDataForBackend(
		memoryData: CreateMemoryRequest
	): Promise<FormData> {
		const formData = new FormData();

		// Add regular text data
		formData.append('name', memoryData.name);
		formData.append('description', memoryData.description);
		formData.append('latitude', memoryData.latitude.toString());
		formData.append('longitude', memoryData.longitude.toString());
		formData.append('visibility', JSON.stringify(memoryData.visibility));
		formData.append(
			'social_circle_ids',
			JSON.stringify(memoryData.social_circle_ids)
		);
		formData.append('location_query', memoryData.location_query);

		// Add image files
		for (const photo of memoryData.media.photos) {
			try {
				const response = await fetch(photo.uri);
				const blob = await response.blob();
				formData.append('image', blob, photo.name);
			} catch (error) {
				console.error(
					`[REMAP] Failed to process photo ${photo.name}:`,
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
					`[REMAP] Failed to process video ${video.name}:`,
					error
				);
				throw new Error(`Could not process video: ${video.name}`);
			}
		}

		// Add audio file
		if (memoryData.media.audio) {
			try {
				const response = await fetch(memoryData.media.audio.uri);
				const originalBlob = await response.blob();

				// Determine correct MIME type based on platform
				let mimeType = 'audio/m4a'; // Default for iOS
				if (Platform.OS === 'android') {
					mimeType = 'audio/mpeg4';
				} else if (Platform.OS === 'web') {
					mimeType = 'audio/webm';
				}

				const audioBlob = new Blob([originalBlob], { type: mimeType });
				formData.append('audio', audioBlob, 'audio_recording.m4a');
			} catch (error) {
				console.error('[REMAP] Failed to process audio:', error);
				throw new Error('Could not process audio recording');
			}
		}

		return formData;
	}

	/**
	 * Purpose: Main method for creating new memory pins
	 * Flow: useCreatePin.ts → createMemoryPin() → buildFormDataForBackend() → makeFormDataRequest() → backend
	 * Example: Called when user clicks "Save Memory" in createPin.tsx
	 */
	async createMemoryPin(
		memoryData: CreateMemoryRequest
	): Promise<{ success: boolean; data?: any; error?: string }> {
		try {
			console.log('[REMAP] Starting memory pin creation');

			// Build FormData for backend
			const formData = await this.buildFormDataForBackend(memoryData);

			// Make API call to backend
			const response = await this.makeFormDataRequest(
				'pins/user',
				'POST',
				formData
			);

			console.log('[REMAP] Memory created successfully:', response);
			// Return Sucess response
			return {
				success: true,
				data: response,
			};
		} catch (error) {
			console.error('[REMAP] Memory creation failed:', error);
			// Return Error response
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Unknown error occurred',
			};
		}
	}

	// ==================
	// LEGACY METHODS (for backward compatibility)
	// ==================

	/**
	 * Purpose: Get all circles
	 * Flow: useCreatePin.ts → getCircles() → makeAuthRequest() → backend
	 * Example: Called when user clicks "Save Memory" in createPin.tsx
	 */
	async getCircles(): Promise<{ id: string; name: string }[]> {
		return await this.makeAuthRequest('circles', 'GET');
	}
}
