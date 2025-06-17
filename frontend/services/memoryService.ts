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
		const totalSteps =
			memoryData.media.photos.length +
			memoryData.media.videos.length +
			(memoryData.media.audio ? 1 : 0) +
			1;

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
		const allMediaFiles = [
			...memoryData.media.photos.map((photo) => ({
				...photo,
				folder: 'images' as const,
			})),
			...memoryData.media.videos.map((video) => ({
				...video,
				folder: 'videos' as const,
			})),
		];

		const mediaUrls = await uploadWithConcurrency(
			allMediaFiles,
			async (file) => {
				const url = await uploadMediaFile(
					file.uri,
					file.folder,
					user.id
				);
				updateProgress(file.name);
				return url;
			},
			3 // Max 3 concurrent uploads
		);

		// Upload audio
		let audioUrl: string | null = null;
		if (memoryData.media.audio) {
			audioUrl = await uploadMediaFile(
				memoryData.media.audio.uri,
				'audio',
				user.id
			);
			updateProgress('Audio recording');
		}

		// Insert pin
		const { data: pinData, error: pinError } = await supabase
			.from('pins')
			.insert([
				{
					name: memoryData.name,
					description: memoryData.description,
					latitude: memoryData.latitude,
					longitude: memoryData.longitude,
					image_urls: mediaUrls.length ? mediaUrls : null,
					audio_url: audioUrl,
					owner_id: user.id,
				},
			])
			.select()
			.single();

		if (pinError)
			throw new Error(`Failed to create pin: ${pinError.message}`);

		updateProgress('Pin created successfully');
		callbacks?.onComplete?.();
		console.log('Memory pin created:', pinData.id);

		return { success: true, data: pinData };
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
