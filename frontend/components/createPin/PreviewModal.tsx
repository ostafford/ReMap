import React from 'react';
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
} from 'react-native';

// UI Components
import {
	HeaderText,
	BodyText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// Constants
import { ReMapColors } from '@/constants/Colors';

// Types
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

interface PreviewModalProps {
	previewData: MemoryData;
	onImagePreview: (imageUri: string) => void;
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
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
	previewData,
	onImagePreview,
	getVisibilityDescription,
	getSelectedSocialCirclesData,
	getMediaSummary,
	selectedSocialCircles,
}) => {
	if (!previewData) return null;

	return (
		<ScrollView style={styles.previewScrollView}>
			<View style={styles.previewContainer}>
				{/* Header */}
				<View style={styles.previewHeader}>
					<HeaderText align="center" style={styles.previewTitle}>
						{previewData?.content?.title || 'Untitled Memory'}
					</HeaderText>
					<CaptionText align="center" style={styles.previewLocation}>
						📍 {previewData?.location?.query || 'Unknown Location'}
					</CaptionText>
					<CaptionText align="center" style={styles.previewTimestamp}>
						{previewData?.timestamp
							? new Date(previewData.timestamp).toLocaleString()
							: 'Now'}
					</CaptionText>
				</View>

				{/* Description */}
				{previewData?.content?.description && (
					<View style={styles.previewSection}>
						<LabelText>Description:</LabelText>
						<BodyText style={styles.previewDescription}>
							{previewData.content.description}
						</BodyText>
					</View>
				)}

				{/* Privacy Summary */}
				<View style={styles.previewSection}>
					<LabelText>Privacy Settings:</LabelText>
					<BodyText style={styles.previewPrivacy}>
						{getVisibilityDescription()}
					</BodyText>

					{selectedSocialCircles.length > 0 && (
						<View style={styles.socialCirclesPreview}>
							<LabelText style={styles.socialCirclesLabel}>
								Selected Social Circles:
							</LabelText>
							{getSelectedSocialCirclesData().map((circle) => (
								<View
									key={circle.id}
									style={[
										styles.socialCirclePreviewItem,
										{ borderLeftColor: circle.color },
									]}
								>
									<BodyText style={styles.socialCircleName}>
										{circle.name}
									</BodyText>
									<CaptionText
										style={styles.socialCircleMembers}
									>
										{circle.memberCount} members
									</CaptionText>
								</View>
							))}
						</View>
					)}
				</View>

				{/* Media Preview */}
				{previewData.metadata.totalMediaItems > 0 && (
					<View style={styles.previewSection}>
						<LabelText>Attached Media:</LabelText>
						<BodyText style={styles.mediaCount}>
							{getMediaSummary().photoCount} photo(s),{' '}
							{getMediaSummary().videoCount} video(s)
							{getMediaSummary().hasAudio &&
								', 1 audio recording'}
						</BodyText>

						{/* Simple Photo Preview */}
						{previewData.media.photos.length > 0 && (
							<View style={styles.simplePhotoPreview}>
								{previewData.media.photos
									.slice(0, 3)
									.map((photo, index) => (
										<TouchableOpacity
											key={index}
											style={styles.simplePhotoThumbnail}
											onPress={() =>
												onImagePreview(photo.uri)
											}
										>
											<Image
												source={{ uri: photo.uri }}
												style={styles.simpleThumbImage}
												resizeMode="cover"
											/>
										</TouchableOpacity>
									))}
								{previewData.media.photos.length > 3 && (
									<View style={styles.morePhotosIndicator}>
										<CaptionText
											style={styles.morePhotosText}
										>
											+
											{previewData.media.photos.length -
												3}
										</CaptionText>
									</View>
								)}
							</View>
						)}
					</View>
				)}

				<CaptionText align="center" style={styles.previewFooter}>
					Review your memory above, then choose to edit or confirm
					posting.
				</CaptionText>
			</View>
		</ScrollView>
	);
};

// ===============
//   STYLE SHEET
// ===============
const styles = StyleSheet.create({
	previewScrollView: {
		maxHeight: 400,
	},
	previewContainer: {
		padding: 16,
	},
	previewHeader: {
		marginBottom: 20,
		alignItems: 'center',
	},
	previewTitle: {
		marginBottom: 8,
	},
	previewLocation: {
		marginBottom: 4,
		color: ReMapColors.primary.blue,
	},
	previewTimestamp: {
		opacity: 0.7,
	},
	previewSection: {
		marginBottom: 16,
	},
	previewDescription: {
		marginTop: 4,
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
	},
	previewPrivacy: {
		marginTop: 4,
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
	},
	socialCirclesPreview: {
		marginTop: 12,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.blue,
	},
	socialCirclesLabel: {
		marginBottom: 8,
		color: ReMapColors.primary.blue,
	},
	socialCirclePreviewItem: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 8,
		borderRadius: 6,
		marginBottom: 6,
		borderLeftWidth: 3,
	},
	socialCircleName: {
		fontWeight: '500',
	},
	socialCircleMembers: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 11,
	},
	mediaCount: {
		marginTop: 4,
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
	},
	previewFooter: {
		marginTop: 16,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		opacity: 0.8,
	},
	simplePhotoPreview: {
		flexDirection: 'row',
		marginTop: 8,
		gap: 4,
	},
	simplePhotoThumbnail: {
		width: 40,
		height: 40,
		borderRadius: 6,
		overflow: 'hidden',
	},
	simpleThumbImage: {
		width: '100%',
		height: '100%',
	},
	morePhotosIndicator: {
		width: 40,
		height: 40,
		borderRadius: 6,
		backgroundColor: ReMapColors.ui.cardBackground,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	morePhotosText: {
		fontSize: 10,
		color: ReMapColors.ui.textSecondary,
	},
});
