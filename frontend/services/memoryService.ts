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

export const createMemoryPin = async (
	memoryData: CreateMemoryRequest,
	onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; data?: any; error?: string }> => {
	try {
		console.log('🚀 Starting memory pin creation process...');

		// Get current user
		const { user } = await getCurrentUser();
		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log('👤 User authenticated:', user.id);

		// Calculate total upload steps
		const totalSteps =
			memoryData.media.photos.length +
			memoryData.media.videos.length +
			(memoryData.media.audio ? 1 : 0) +
			1; // +1 for pin creation

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

		// Upload media files
		const imageUrls: string[] = [];
		let audioUrl: string | null = null;

		// Upload photos
		for (const photo of memoryData.media.photos) {
			console.log(`📸 Uploading photo: ${photo.name}`);
			const url = await uploadMediaFile(photo.uri, 'images', user.id);
			imageUrls.push(url);
			updateProgress(photo.name);
		}

		// Upload videos (stored as image_urls in schema)
		for (const video of memoryData.media.videos) {
			console.log(`🎥 Uploading video: ${video.name}`);
			const url = await uploadMediaFile(video.uri, 'videos', user.id);
			imageUrls.push(url);
			updateProgress(video.name);
		}

		// Upload audio
		if (memoryData.media.audio) {
			console.log('🎤 Uploading audio recording...');
			audioUrl = await uploadMediaFile(
				memoryData.media.audio.uri,
				'audio',
				user.id
			);
			updateProgress('Audio recording');
		}

		// Create pin in database
		console.log('💾 Creating pin in database...');
		const { data: pinData, error: pinError } = await supabase
			.from('pins')
			.insert([
				{
					name: memoryData.name,
					description: memoryData.description,
					latitude: memoryData.latitude,
					longitude: memoryData.longitude,
					image_urls: imageUrls.length > 0 ? imageUrls : null,
					audio_url: audioUrl,
					owner_id: user.id,
				},
			])
			.select()
			.single();

		if (pinError) {
			console.error('❌ Database pin creation failed:', pinError);
			throw new Error(`Failed to create pin: ${pinError.message}`);
		}

		updateProgress('Pin created successfully');

		console.log('✅ Memory pin created successfully:', pinData.id);

		return {
			success: true,
			data: pinData,
		};
	} catch (error) {
		console.error('💥 Memory creation failed:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown error occurred',
		};
	}
};

// Helper function to upload media files
const uploadMediaFile = async (
	fileUri: string,
	folder: 'images' | 'videos' | 'audio',
	userId: string
): Promise<string> => {
	const fileName = `${userId}/${folder}/${Date.now()}-${Math.random()
		.toString(36)
		.substring(7)}`;

	// Convert URI to blob for upload
	const response = await fetch(fileUri);
	const blob = await response.blob();

	const { data, error } = await supabase.storage
		.from('memory-media')
		.upload(fileName, blob);

	if (error) {
		console.error(`❌ ${folder} upload failed:`, error);
		throw new Error(`Failed to upload ${folder}: ${error.message}`);
	}

	// Get public URL
	const { data: publicUrlData } = supabase.storage
		.from('memory-media')
		.getPublicUrl(fileName);

	return publicUrlData.publicUrl;
};

// Get user's social circles
export const getUserSocialCircles = async (): Promise<any[]> => {
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

		if (error) {
			console.error('❌ Failed to fetch social circles:', error);
			return [];
		}

		console.log(`✅ Found ${data.length} social circles for user`);

		return data.map((member) => ({
			id: member.circles.id,
			name: member.circles.name,
			visibility: member.circles.visibility,
			isOwner: member.circles.owner_id === user.id,
		}));
	} catch (error) {
		console.error('💥 Error fetching social circles:', error);
		return [];
	}
};
