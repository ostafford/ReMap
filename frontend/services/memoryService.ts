import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/services/auth';

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

export interface UploadProgress {
	total: number;
	completed: number;
	currentFile: string;
	percentage: number;
}

export interface UploadProgressCallbacks {
	onStart?: () => void;
	onProgress?: (progress: UploadProgress) => void;
	onFileComplete?: (fileName: string) => void;
	onComplete?: () => void;
	onError?: (error: Error) => void;
}

interface UserSocialCircle {
	id: string;
	name: string;
	visibility: string[];
	isOwner: boolean;
}

const MEDIA_BUCKET = 'memory-media';

const uploadWithConcurrency = async <T>(
	items: T[],
	uploadFn: (item: T) => Promise<string>,
	maxConcurrent: number = 3
): Promise<string[]> => {
	const results: string[] = [];

	for (let i = 0; i < items.length; i += maxConcurrent) {
		const batch = items.slice(i, i + maxConcurrent);
		const batchResults = await Promise.all(
			batch.map((item) => uploadFn(item))
		);
		results.push(...batchResults);
	}

	return results;
};

const validateMemoryData = (data: CreateMemoryRequest): string[] => {
	const errors: string[] = [];

	if (!data.name.trim()) {
		errors.push('Title is required');
	}

	if (data.name.trim().length > 100) {
		errors.push('Title must be less than 100 characters');
	}

	if (data.description.trim().length > 500) {
		errors.push('Description must be less than 500 characters');
	}

	if (!data.latitude || !data.longitude) {
		errors.push('Valid location coordinates are required');
	}

	if (!data.location_query.trim()) {
		errors.push('Location description is required');
	}

	return errors;
};

export const createMemoryPin = async (
	memoryData: CreateMemoryRequest,
	callbacks?: UploadProgressCallbacks
): Promise<{ success: boolean; data?: any; error?: string }> => {
	try {
		const { user } = await getCurrentUser();
		if (!user) throw new Error('User not authenticated');
		callbacks?.onStart?.();
		const validationErrors = validateMemoryData(memoryData);
		if (validationErrors.length > 0) {
			throw new Error(
				`Validation failed: ${validationErrors.join(', ')}`
			);
		}
		const totalSteps = 1;

		let completedSteps = 0;
		const updateProgress = (currentFile: string) => {
			completedSteps++;
			const percentage = Math.round((completedSteps / totalSteps) * 100);
			callbacks?.onProgress?.({
				total: totalSteps,
				completed: completedSteps,
				currentFile,
				percentage,
			});
		};

		// Upload all media with concurrency control
		// const allMediaFiles = [
		// 	...memoryData.media.photos.map((photo) => ({
		// 		...photo,
		// 		folder: 'images' as const,
		// 	})),
		// 	...memoryData.media.videos.map((video) => ({
		// 		...video,
		// 		folder: 'videos' as const,
		// 	})),
		// ];

		// const mediaUrls = await uploadWithConcurrency(
		// 	allMediaFiles,
		// 	async (file) => {
		// 		const url = await uploadMediaFile(
		// 			file.uri,
		// 			file.folder,
		// 			user.id
		// 		);
		// 		updateProgress(file.name);
		// 		return url;
		// 	},
		// 	3 // Max 3 concurrent uploads
		// );

		// Upload audio
		// let audioUrl: string | null = null;
		// if (memoryData.media.audio) {
		// 	audioUrl = await uploadMediaFile(
		// 		memoryData.media.audio.uri,
		// 		'audio',
		// 		user.id
		// 	);
		// 	updateProgress('Audio recording');
		// }

		// New Express backend approach
		const API_BASE_URL = 'http://localhost:3000/api'; // Your backend URL

		// Get JWT token for backend authentication
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const token = session?.access_token;

		if (!token) {
			throw new Error('No authentication token found');
		}

		// Create FormData for file uploads
		const formData = new FormData();

		// Add text fields
		formData.append('name', memoryData.name);
		formData.append('description', memoryData.description);
		formData.append('latitude', memoryData.latitude.toString());
		formData.append('longitude', memoryData.longitude.toString());
		formData.append('location_query', memoryData.location_query);
		formData.append('visibility', memoryData.visibility[0] || 'public'); // Take first item from array
		formData.append(
			'social_circle_ids',
			JSON.stringify(memoryData.social_circle_ids)
		);

		// Add image files
		memoryData.media.photos.forEach((photo, index) => {
			formData.append('image', {
				uri: photo.uri,
				type: 'image/jpeg',
				name: `photo_${index}.jpg`,
			} as any);
		});

		// Add audio file
		if (memoryData.media.audio) {
			formData.append('audio', {
				uri: memoryData.media.audio.uri,
				type: 'audio/m4a',
				name: 'audio.m4a',
			} as any);
		}

		// Send to backend using fetch
		const response = await fetch(`${API_BASE_URL}/pins/user`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				// Don't set Content-Type - let fetch set it automatically for FormData
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to create pin');
		}

		const result = await response.json();

		return { success: true, data: result };
	} catch (error) {
		console.error('Memory creation failed:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown error occurred',
		};
	}
};

// Media upload helper
const RANDOM_SUFFIX_LENGTH = 7;

const uploadMediaFile = async (
	fileUri: string,
	folder: 'images' | 'videos' | 'audio',
	userId: string
): Promise<string> => {
	const timestamp = Date.now();
	const randomSuffix = Math.random()
		.toString(36)
		.substring(2, 2 + RANDOM_SUFFIX_LENGTH);
	const fileName = `${userId}/${folder}/${timestamp}-${randomSuffix}`;

	let response: Response | null = null;
	let blob: Blob | null = null;

	try {
		response = await fetch(fileUri);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch file: ${response.status} ${response.statusText}`
			);
		}

		blob = await response.blob();

		const { error } = await supabase.storage
			.from(MEDIA_BUCKET)
			.upload(fileName, blob);
		if (error)
			throw new Error(`Failed to upload ${folder}: ${error.message}`);

		const { data: publicUrlData } = supabase.storage
			.from(MEDIA_BUCKET)
			.getPublicUrl(fileName);
		if (!publicUrlData?.publicUrl)
			throw new Error(`Failed to retrieve ${folder} public URL`);

		return publicUrlData.publicUrl;
	} catch (error) {
		// Clean up resources on error
		blob = null;
		response = null;
		throw error;
	}
};

// Social circles
export const getUserSocialCircles = async (): Promise<UserSocialCircle[]> => {
	try {
		const { user } = await getCurrentUser();
		if (!user) return [];

		console.log('🔍 Fetching user social circles...');
		const { data, error } = await supabase
			.from('members')
			.select(
				`
				circle_id,
				circles (
					id,
					name,
					visibility,
					owner_id
				)
			`
			)
			.eq('user_id', user.id);

		if (error) throw error;

		return data.map((member) => ({
			id: member.circles.id,
			name: member.circles.name,
			visibility: member.circles.visibility,
			isOwner: member.circles.owner_id === user.id,
		}));
	} catch (error) {
		console.error('Failed to fetch social circles:', error);
		return [];
	}
};
