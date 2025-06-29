// =====================================
//   PINS SERVICE - BACKEND PIN FETCHING
// =====================================
// Purpose: API service for fetching pins from backend
// Replaces dummy pin data with real backend integration
import { getCurrentUser } from '@/services/auth';
import { supabase } from '@/lib/supabase';

// ==================
// TYPE DEFINITIONS
// ==================

// Backend pin structure
export interface BackendPin {
	id: string;
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string;
	image_urls: string[];
	audio_url: string | null;
	owner_id: string;
	visibility: string;
	social_circle_ids: string[] | null;
	private_pin: boolean;
	created_at: string;
	updated_at: string;
}

// Frontend pin structure
export interface MapPin {
	id: string;
	coordinate: {
		latitude: number;
		longitude: number;
	};
	name: string;
	description: string;

	pinData: {
		memory: {
			name: string;
			description: string;
			owner_id: string;
			created_at: string;
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
			location_query: string;
			latitude: number;
			longitude: number;
		};
	};
}

// Map viewport bounds for filtering
// This is for when the pins are in 'view' it "kinda" works but also doesn't fully.
// Still in progress fix......
export interface MapViewport {
	northEast: {
		latitude: number;
		longitude: number;
	};
	southWest: {
		latitude: number;
		longitude: number;
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
	: 'https://your-production-api.com';

const API_ENDPOINTS = {
	PUBLIC_PINS: '/api/pins',
	USER_PINS: '/api/pins/user',
	SINGLE_PIN: '/api/pins',
} as const;

// ==================
// AUTHENTICATION HELPER
// ==================

// Gets the JWT token for authenticated requests
const getAuthToken = async (): Promise<string | null> => {
	try {
		const { user } = await getCurrentUser();
		if (!user) {
			return null; // Not authenticated, can still fetch public pins
		}

		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error || !session?.access_token) {
			return null;
		}
		// Do not comment out unless for testing.
		// This will show the JWT token via console.
		// console.log(
		// 	'🔑 [PINS-SERVICE] Using JWT token:',
		// 	session.access_token.substring(0, 50) + '...'
		// );
		return session.access_token;
	} catch (error) {
		console.warn(
			'⚠️ [PINS-SERVICE] Auth token failed, fetching public pins only'
		);
		return null;
	}
};

// ==================
// DATA TRANSFORMATION
// ==================

// Converts backend pin data to frontend map pin format
const transformBackendPinToMapPin = (backendPin: BackendPin): MapPin => {
	// Add validation at the start
	if (!backendPin || typeof backendPin !== 'object') {
		throw new Error('Invalid backend pin data');
	}

	// Ensure required fields exist
	if (
		!backendPin.id ||
		!backendPin.name ||
		typeof backendPin.latitude !== 'number' ||
		typeof backendPin.longitude !== 'number'
	) {
		throw new Error('Missing required pin fields');
	}

	// Safe property access with defaults
	const imageUrls = Array.isArray(backendPin.image_urls)
		? backendPin.image_urls
		: [];
	const validImageUrls = imageUrls.filter(
		(url) => url && typeof url === 'string'
	);

	return {
		id: backendPin.id,
		coordinate: {
			latitude: backendPin.latitude,
			longitude: backendPin.longitude,
		},
		name: backendPin.name,
		description: backendPin.description || '',
		pinData: {
			memory: {
				name: backendPin.name,
				description: backendPin.description || '',
				owner_id: 'User', // TODO: Get actual username from backend
				created_at: backendPin.created_at,
				media: {
					photos: validImageUrls.map((url, index) => ({
						name: `photo_${index + 1}`,
						uri: url,
					})),
					videos: [], // TODO: Add video support when backend supports it
					audio:
						backendPin.audio_url &&
						typeof backendPin.audio_url === 'string'
							? {
									recorded: backendPin.created_at,
							  }
							: null,
				},
				visibility: [backendPin.visibility || 'public'],
			},
			name: backendPin.name,
			location: {
				location_query: backendPin.location_query || 'Unknown location',
				latitude: backendPin.latitude,
				longitude: backendPin.longitude,
			},
		},
	};
};

// Filters pins by map viewport bounds
const filterPinsByViewport = (
	pins: MapPin[],
	viewport?: MapViewport
): MapPin[] => {
	if (!viewport) {
		return pins; // Return all pins if no viewport provided
	}

	const { northEast, southWest } = viewport;

	return pins.filter((pin) => {
		const { latitude, longitude } = pin.coordinate;

		return (
			latitude <= northEast.latitude &&
			latitude >= southWest.latitude &&
			longitude <= northEast.longitude &&
			longitude >= southWest.longitude
		);
	});
};

// ==================
// API FUNCTIONS
// ==================

// Fetches public pins from backend
export const fetchPublicPins = async (
	viewport?: MapViewport
): Promise<ApiResponse> => {
	try {
		console.log('[PINS-SERVICE] Fetching public pins');

		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.PUBLIC_PINS}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[PINS-SERVICE] Failed to fetch public pins:', {
				status: response.status,
				error: errorText,
			});

			throw new Error(
				`Failed to fetch pins (${response.status}): ${errorText}`
			);
		}

		const result = await response.json();
		console.log('✅ [PINS-SERVICE] Public pins response:', result);

		// We can change these steps if needed:
		// Extract pins from response (your backend returns { "List pins": [...] })
		const backendPins: BackendPin[] = result['List pins'] || [];

		// Transform to frontend format
		const mapPins = backendPins.map(transformBackendPinToMapPin);

		// Filter by viewport if provided
		const filteredPins = filterPinsByViewport(mapPins, viewport);

		console.log(
			`📍 [PINS-SERVICE] Transformed ${backendPins.length} pins, ${filteredPins.length} in viewport`
		);

		return {
			success: true,
			data: filteredPins,
		};
	} catch (error) {
		console.error('💥 [PINS-SERVICE] Error fetching public pins:', error);

		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown error occurred',
		};
	}
};

// Fetches user's private pins (requires authentication)
export const fetchUserPins = async (
	viewport?: MapViewport
): Promise<ApiResponse> => {
	try {
		console.log('[PINS-SERVICE] Fetching user pins');

		const authToken = await getAuthToken();
		if (!authToken) {
			console.log('[PINS-SERVICE] No auth token, skipping user pins');
			return {
				success: true,
				data: [],
			};
		}

		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.USER_PINS}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ [PINS-SERVICE] Failed to fetch user pins:', {
				status: response.status,
				error: errorText,
			});

			// Don't throw error for user pins - just return empty array
			return {
				success: true,
				data: [],
			};
		}

		const result = await response.json();
		console.log('✅ [PINS-SERVICE] User pins response:', result);

		// Extract pins from response (your backend returns { "List user pins": [...] })
		const backendPins: BackendPin[] = result['List user pins'] || [];

		// Transform to frontend format
		const mapPins = backendPins.map(transformBackendPinToMapPin);

		// Filter by viewport if provided
		const filteredPins = filterPinsByViewport(mapPins, viewport);

		return {
			success: true,
			data: filteredPins,
		};
	} catch (error) {
		console.error('[PINS-SERVICE] Error fetching user pins:', error);

		// Don't fail the entire operation if user pins fail
		return {
			success: true,
			data: [],
		};
	}
};

// Fetches all visible pins (public + user's private)
// TODO: Add social circle pins when backend supports it
export const fetchAllVisiblePins = async (
	viewport?: MapViewport
): Promise<ApiResponse> => {
	try {
		console.log('📍 [PINS-SERVICE] Fetching all visible pins');

		// Fetch both public and user pins in parallel
		const [publicResult, userResult] = await Promise.all([
			fetchPublicPins(viewport),
			fetchUserPins(viewport),
		]);

		// Combine successful results
		const allPins: MapPin[] = [
			...(publicResult.success ? publicResult.data : []),
			...(userResult.success ? userResult.data : []),
		];

		// Remove duplicates (in case user's public pins appear in both)
		const uniquePins = allPins.filter(
			(pin, index, array) =>
				array.findIndex((p) => p.id === pin.id) === index
		);

		return {
			success: true,
			data: uniquePins,
		};
	} catch (error) {
		console.error('[PINS-SERVICE] Error fetching all pins:', error);

		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to fetch pins',
		};
	}
};

// ==================
// UTILITY FUNCTIONS
// ==================

// Creates a map viewport from current map region
export const createViewportFromMapRegion = (region: {
	latitude: number;
	longitude: number;
	latitudeDelta: number;
	longitudeDelta: number;
}): MapViewport => {
	const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

	return {
		northEast: {
			latitude: latitude + latitudeDelta / 2,
			longitude: longitude + longitudeDelta / 2,
		},
		southWest: {
			latitude: latitude - latitudeDelta / 2,
			longitude: longitude - longitudeDelta / 2,
		},
	};
};

// ==================
// EXPORTS
// ==================

export type { ApiResponse };
export { transformBackendPinToMapPin };
