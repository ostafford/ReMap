// ========================
//   PIN TYPE DEFINITIONS
// ========================

import type { Tables } from './database';

// ========================
//   BASE PIN TYPES
// ========================

// Raw pin data from database
export type DatabasePin = Tables<'pins'>;

// Pin with user profile data (for BottomSheet)
export type PinWithUser = DatabasePin & {
	owner: {
		id: string;
		username: string | null;
		full_name: string | null;
		avatar_url: string | null;
	};
};

// Pin with location data for map display
export type MapPin = {
	id: string;
	name: string;
	description: string;
	coordinate: {
		latitude: number;
		longitude: number;
	};
	location_query: string | null;
	owner: {
		id: string;
		username: string | null;
		full_name: string | null;
		avatar_url: string | null;
	};
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string; recorded: string } | null;
	};
	visibility: string | null;
	social_circle_ids: string[] | null;
	created_at: string;
};

// ========================
//   VISIBILITY TYPES
// ========================

export type PinVisibility = 'public' | 'private' | 'social';

// ========================
//   API RESPONSE TYPES
// ========================

// Backend API response format
export type PinApiResponse = {
	'User Pin'?: PinWithUser;
	'List user pins'?: PinWithUser[];
	'List pins'?: PinWithUser[];
	Pin?: PinWithUser;
};

// ========================
//   BOTTOMSHEET TYPES
// ========================

// Data structure for BottomSheet display
export type BottomSheetPin = {
	id: string;
	title: string; // Same as 'name' field
	description: string;
	location: {
		address: string; // From location_query
		latitude: number;
		longitude: number;
	};
	owner: {
		id: string;
		username: string | null;
		full_name: string | null;
		avatar_url: string | null;
	};
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string; recorded: string } | null;
	};
	visibility: PinVisibility;
	social_circle_ids: string[] | null;
	created_at: string;
};

// Multiple pins at same location (for "Next Memory" feature)
export type LocationPins = {
	location: {
		latitude: number;
		longitude: number;
		address: string;
	};
	pins: BottomSheetPin[];
	currentIndex: number;
};

// ========================
//   UTILITY TYPES
// ========================

// Pin filtering options
export type PinFilter = {
	visibility?: PinVisibility[];
	socialCircles?: string[];
	dateRange?: {
		start: string;
		end: string;
	};
	location?: {
		latitude: number;
		longitude: number;
		radius: number; // in meters
	};
};

// Pin creation data (from frontend)
export type CreatePinData = {
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string;
	visibility: PinVisibility[];
	social_circle_ids: string[];
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string } | null;
	};
};

// ========================
//   TYPE GUARDS
// ========================

export const isPinVisibility = (value: string): value is PinVisibility => {
	return ['public', 'private', 'social'].includes(value);
};

export const isPinWithUser = (data: any): data is PinWithUser => {
	return (
		data &&
		typeof data.id === 'string' &&
		typeof data.name === 'string' &&
		typeof data.description === 'string' &&
		typeof data.latitude === 'number' &&
		typeof data.longitude === 'number' &&
		data.owner &&
		typeof data.owner.id === 'string'
	);
};

// ========================
//   TRANSFORM FUNCTIONS
// ========================

// Transform database pin to map pin
export const transformToMapPin = (pin: PinWithUser): MapPin => {
	return {
		id: pin.id,
		name: pin.name,
		description: pin.description,
		coordinate: {
			latitude: pin.latitude,
			longitude: pin.longitude,
		},
		location_query: pin.location_query,
		owner: pin.owner,
		media: {
			photos: (pin.image_urls || [])
				.filter((url: string) => url && url !== null)
				.map((url: string, index: number) => ({
					name: `photo_${index + 1}`,
					uri: url,
				})),
			videos: [], // TODO: Add video support when implemented
			audio: pin.audio_url
				? { uri: pin.audio_url, recorded: pin.created_at }
				: null,
		},
		visibility: pin.visibility,
		social_circle_ids: pin.social_circle_ids,
		created_at: pin.created_at,
	};
};

// Transform database pin to BottomSheet pin
export const transformToBottomSheetPin = (pin: PinWithUser): BottomSheetPin => {
	return {
		id: pin.id,
		title: pin.name,
		description: pin.description,
		location: {
			address: pin.location_query || 'Unknown location',
			latitude: pin.latitude,
			longitude: pin.longitude,
		},
		owner: pin.owner,
		media: {
			photos: (pin.image_urls || [])
				.filter((url: string) => url && url !== null)
				.map((url: string, index: number) => ({
					name: `photo_${index + 1}`,
					uri: url,
				})),
			videos: [], // TODO: Add video support when implemented
			audio: pin.audio_url
				? { uri: pin.audio_url, recorded: pin.created_at }
				: null,
		},
		visibility: (pin.visibility as PinVisibility) || 'public',
		social_circle_ids: pin.social_circle_ids,
		created_at: pin.created_at,
	};
};
