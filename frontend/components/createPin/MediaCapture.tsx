import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import {
	LabelText,
	SubheaderText,
	BodyText,
	CaptionText,
} from '@/components/ui/Typography';
import { ReMapColors } from '@/constants/Colors';
import type { MediaItem } from '@/hooks/createPin/useMediaCapture';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface MediaCaptureProps {
	// Media state
	selectedMedia: MediaItem[];
	audioUri: string | null;
	isRecording: boolean;
	isPlayingAudio: boolean;

	// Handlers
	onCameraPress: () => Promise<void>;
	onAudioPress: () => Promise<void>;
	onRemoveMedia: (index: number) => void;
	onRemoveAudio: () => void;
	onPlayAudio: () => Promise<void>;
	onStopAudio: () => Promise<void>;
	onImagePreview?: (uri: string) => void;

	// Customization
	title?: string;
	helperText?: string;
	disabled?: boolean;

	// Media summary
	mediaSummary: {
		totalItems: number;
		photoCount: number;
		videoCount: number;
		hasAudio: boolean;
	};
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================
export function MediaCapture({
	selectedMedia,
	audioUri,
	isRecording,
	isPlayingAudio,
	onCameraPress,
	onAudioPress,
	onRemoveMedia,
	onRemoveAudio,
	onPlayAudio,
	onStopAudio,
	onImagePreview,
	title = 'Add media to your memory',
	helperText,
	disabled = false,
	mediaSummary,
}: MediaCaptureProps) {
	// ==========================================
	// HELPER FUNCTIONS
	// ==========================================
	const getDefaultHelperText = () => {
		if (isRecording) {
			return '🔴 Recording... Tap microphone to stop';
		}
		return 'Tap camera to add photos or microphone to record audio';
	};

	const renderMediaItem = (media: MediaItem, index: number) => (
		<View key={index} style={styles.mediaItem}>
			<TouchableOpacity
				onPress={() =>
					media.type === 'photo' && onImagePreview?.(media.uri)
				}
				style={styles.mediaItemContent}
			>
				<Image
					source={{ uri: media.uri }}
					style={styles.mediaItemThumbnail}
					resizeMode="cover"
				/>
				<View style={styles.mediaItemDetails}>
					<BodyText style={styles.mediaItemText}>
						{media.type === 'photo' ? '📷' : '🎥'} {media.name}
					</BodyText>
					{media.type === 'photo' && (
						<CaptionText style={styles.tapToPreview}>
							Tap to preview
						</CaptionText>
					)}
					{media.type === 'video' && (
						<CaptionText style={styles.tapToPreview}>
							Video file
						</CaptionText>
					)}
				</View>
			</TouchableOpacity>
			<Button
				onPress={() => onRemoveMedia(index)}
				style={styles.removeButton}
				size="small"
				variant="danger"
				disabled={disabled}
			>
				Remove
			</Button>
		</View>
	);

	const renderAudioItem = () => (
		<View style={styles.mediaItem}>
			<View style={styles.audioItemContent}>
				<View style={styles.audioVisualizer}>
					<BodyText style={styles.audioIcon}>🎶</BodyText>
					<View style={styles.audioWaveform}>
						{[1, 2, 3, 4, 5].map((bar) => (
							<View
								key={bar}
								style={[
									styles.waveformBar,
									isPlayingAudio && styles.waveformBarActive,
								]}
							/>
						))}
					</View>
				</View>
				<View style={styles.audioItemDetails}>
					<BodyText style={styles.mediaItemText}>
						Audio recording
					</BodyText>
					<View style={styles.audioControls}>
						<IconButton
							icon={isPlayingAudio ? 'stop' : 'play'}
							onPress={isPlayingAudio ? onStopAudio : onPlayAudio}
							backgroundColor={ReMapColors.primary.blue}
							size={20}
							style={styles.audioButton}
							disabled={disabled}
						/>
						<CaptionText style={styles.audioStatus}>
							{isPlayingAudio ? 'Playing...' : 'Ready to play'}
						</CaptionText>
					</View>
				</View>
			</View>
			<Button
				onPress={onRemoveAudio}
				style={styles.removeButton}
				size="small"
				variant="danger"
				disabled={disabled}
			>
				Remove
			</Button>
		</View>
	);

	// ==========================================
	// RENDER COMPONENT
	// ==========================================
	return (
		<View style={styles.section}>
			<LabelText style={styles.sectionLabel}>{title}</LabelText>

			{/* DISABLED: Media Summary */}
			{/* {mediaSummary.totalItems > 0 && (
				<View style={styles.mediaSummary}>
					<SubheaderText style={styles.mediaSummaryTitle}>
						Attached Media ({mediaSummary.totalItems} items):
					</SubheaderText>
					<View style={styles.summaryStats}>
						{mediaSummary.photoCount > 0 && (
							<CaptionText style={styles.summaryItem}>
								📷 {mediaSummary.photoCount} photo
								{mediaSummary.photoCount !== 1 ? 's' : ''}
							</CaptionText>
						)}
						{mediaSummary.videoCount > 0 && (
							<CaptionText style={styles.summaryItem}>
								🎥 {mediaSummary.videoCount} video
								{mediaSummary.videoCount !== 1 ? 's' : ''}
							</CaptionText>
						)}
						{mediaSummary.hasAudio && (
							<CaptionText style={styles.summaryItem}>
								🎤 1 audio recording
							</CaptionText>
						)}
					</View>
				</View>
			)} */}

			{/* Media Preview */}
			{(selectedMedia.length > 0 || audioUri) && (
				<View style={styles.mediaPreview}>
					{/* Photos/Videos */}
					{selectedMedia.map((media, index) =>
						renderMediaItem(media, index)
					)}

					{/* Audio */}
					{audioUri && renderAudioItem()}
				</View>
			)}

			{/* Media Controls */}
			<View style={styles.mediaButtons}>
				<IconButton
					style={styles.mediaAddButton}
					icon="camera"
					onPress={onCameraPress}
					label="Camera"
					variant="filled"
					backgroundColor={ReMapColors.primary.blue}
					disabled={disabled}
				/>
				<IconButton
					style={styles.mediaAddButton}
					icon="microphone"
					onPress={onAudioPress}
					label={isRecording ? 'Stop' : 'Record'}
					variant="filled"
					backgroundColor={
						isRecording
							? ReMapColors.semantic.error
							: ReMapColors.primary.violet
					}
					disabled={disabled}
				/>
			</View>

			{/* Helper Text */}
			<CaptionText style={styles.helperText}>
				{helperText || getDefaultHelperText()}
			</CaptionText>
		</View>
	);
}

// ==========================================
// COMPONENT STYLES
// ==========================================
const styles = StyleSheet.create({
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},

	// Media Summary
	mediaSummary: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.blue,
	},
	mediaSummaryTitle: {
		marginBottom: 8,
	},
	summaryStats: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	summaryItem: {
		color: ReMapColors.ui.textSecondary,
	},

	// Media Preview
	mediaPreview: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.black,
	},

	// Media Items
	mediaItem: {
		flexDirection: 'column',
		marginBottom: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		padding: 8,
	},
	mediaItemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	mediaItemThumbnail: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	mediaItemDetails: {
		flex: 1,
	},
	mediaItemText: {
		marginBottom: 2,
	},
	tapToPreview: {
		color: ReMapColors.primary.blue,
		fontStyle: 'italic',
	},
	removeButton: {
		width: 'auto',
		alignSelf: 'flex-end',
	},

	// Audio Specific
	audioItemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	audioVisualizer: {
		width: 60,
		height: 60,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	audioIcon: {
		fontSize: 24,
		marginBottom: 4,
	},
	audioWaveform: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 2,
	},
	waveformBar: {
		width: 3,
		height: 8,
		backgroundColor: ReMapColors.ui.textSecondary,
		borderRadius: 1,
	},
	waveformBarActive: {
		backgroundColor: ReMapColors.primary.blue,
		height: 12,
	},
	audioItemDetails: {
		flex: 1,
	},
	audioControls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 4,
	},
	audioButton: {
		width: 32,
		height: 32,
	},
	audioStatus: {
		color: ReMapColors.ui.textSecondary,
	},

	// Media Controls
	mediaButtons: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
		paddingBottom: 10,
		marginBottom: 8,
	},
	mediaAddButton: {
		width: 'auto',
		height: 'auto',
		padding: 15,
	},

	// Helper Text
	helperText: {
		marginTop: 8,
		paddingHorizontal: 4,
	},
});

// ==========================================
// DEFAULT EXPORT
// ==========================================
export default MediaCapture;
