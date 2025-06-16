import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/services/auth';

export interface CreateMemoryRequest {
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	// location_query: string;
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

interface UserSocialCircle {
	id: string;
	name: string;
	visibility: string[];
	isOwner: boolean;
}

const MEDIA_BUCKET = 'memory-media';

export const createMemoryPin = async (
	memoryData: CreateMemoryRequest,
	onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; data?: any; error?: string }> => {
	try {
		const { user } = await getCurrentUser();
		if (!user) throw new Error('User not authenticated');

		const totalSteps =
			memoryData.media.photos.length +
			memoryData.media.videos.length +
			(memoryData.media.audio ? 1 : 0) +
			1;

		let completedSteps = 0;
		const updateProgress = (currentFile: string) => {
			completedSteps++;
			const percentage = Math.round((completedSteps / totalSteps) * 100);
			onProgress?.({
				total: totalSteps,
				completed: completedSteps,
				currentFile,
				percentage,
			});
		};

		// Upload photos and videos in parallel
		const uploadGroup = async (
			files: Array<{ uri: string; name: string }>,
			folder: 'images' | 'videos'
		): Promise<string[]> => {
			return Promise.all(
				files.map(async (file) => {
					const url = await uploadMediaFile(
						file.uri,
						folder,
						user.id
					);
					updateProgress(file.name);
					return url;
				})
			);
		};

		const [photoUrls, videoUrls] = await Promise.all([
			uploadGroup(memoryData.media.photos, 'images'),
			uploadGroup(memoryData.media.videos, 'videos'),
		]);

		const mediaUrls = [...photoUrls, ...videoUrls];

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
const uploadMediaFile = async (
	fileUri: string,
	folder: 'images' | 'videos' | 'audio',
	userId: string
): Promise<string> => {
	const fileName = `${userId}/${folder}/${Date.now()}-${Math.random()
		.toString(36)
		.substring(7)}`;
	const response = await fetch(fileUri);
	const blob = await response.blob();

	const { error } = await supabase.storage
		.from(MEDIA_BUCKET)
		.upload(fileName, blob);
	if (error) throw new Error(`Failed to upload ${folder}: ${error.message}`);

	const { data: publicUrlData } = supabase.storage
		.from(MEDIA_BUCKET)
		.getPublicUrl(fileName);
	if (!publicUrlData?.publicUrl)
		throw new Error(`Failed to retrieve ${folder} public URL`);

	return publicUrlData.publicUrl;
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
