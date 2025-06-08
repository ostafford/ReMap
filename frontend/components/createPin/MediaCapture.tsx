// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { LabelText, BodyText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ================================
//   TYPE IMPORTS
// ================================
import type { MediaItem } from '@/hooks/createPin/useMediaCapture';

// ===================
// TYPE DEFINITIONS
// ===================

/**
 * Props interface for MediaCapture component
 *
 * LAYMAN TERMS: "Everything this component needs from the parent (createPin.tsx)
 * to display the media interface. Includes current media state, all the functions
 * to handle user actions, and customization options."
 *
 * TECHNICAL: Comprehensive props interface for multimedia capture and management
 * component with full integration to useMediaCapture hook functionality
 *
 * @interface MediaCaptureProps
 */
interface MediaCaptureProps {
	selectedMedia: MediaItem[];
	audioUri: string | null;
	isRecording: boolean;
	isPlayingAudio: boolean;
	onCameraPress: () => Promise<void>;
	onAudioPress: () => Promise<void>;
	onRemoveMedia: (index: number) => void;
	onRemoveAudio: () => void;
	onPlayAudio: () => Promise<void>;
	onStopAudio: () => Promise<void>;
	onImagePreview?: (uri: string) => void;
	title?: string;
	helperText?: string;
	disabled?: boolean;
	mediaSummary: {
		totalItems: number;
		photoCount: number;
		videoCount: number;
		hasAudio: boolean;
	};
}

// ===========================
// COMPONENT IMPLEMENTATION
// ===========================

/**
 * MediaCapture - Comprehensive multimedia interface for memory creation
 *
 * LAYMAN TERMS: "This component provides the complete media studio interface
 * for creating memories. Users see camera and microphone buttons to add content,
 * thumbnails of photos they've added, a cool audio visualizer for recordings,
 * and controls to play/remove everything. It's like having a mini multimedia
 * editor built into the memory creation form."
 *
 * Key features:
 * - Camera button with photo capture integration
 * - Microphone button with visual recording feedback
 * - Photo/video thumbnails with preview and removal
 * - Audio visualizer with waveform animation during playback
 * - Play/stop audio controls with status indicators
 * - Conditional rendering (only shows media when user has added some)
 * - Dynamic helper text based on current state
 * - Disabled state support for all interactions
 *
 * TECHNICAL: React component providing complete multimedia capture interface
 * with sophisticated visual feedback, state-driven conditional rendering,
 * and full integration with useMediaCapture hook for state management.
 *
 * @component MediaCapture
 * @param {MediaCaptureProps} props - Component configuration object
 * @returns {JSX.Element} Complete multimedia capture and management interface
 *
 * @example
 * In createPin.tsx:
 * const {
 *   selectedMedia,
 *   audioUri,
 *   isRecording,
 *   isPlayingAudio,
 *   handleCameraPress,
 *   handleAudioPress,
 *   removeMedia,
 *   removeAudio,
 *   playRecording,
 *   stopPlayback,
 *   getMediaSummary
 * } = useMediaCapture({ showModal });
 *
 * <MediaCapture
 *   selectedMedia={selectedMedia}           // Current photos/videos
 *   audioUri={audioUri}                    // Audio recording
 *   isRecording={isRecording}              // Recording state
 *   isPlayingAudio={isPlayingAudio}        // Playback state
 *   onCameraPress={handleCameraPress}      // Camera functionality
 *   onAudioPress={handleAudioPress}        // Recording toggle
 *   onRemoveMedia={removeMedia}            // Remove photos/videos
 *   onRemoveAudio={removeAudio}            // Remove audio
 *   onPlayAudio={playRecording}            // Play audio
 *   onStopAudio={stopPlayback}             // Stop audio
 *   onImagePreview={showImagePreview}      // Full-screen photo view
 *   mediaSummary={getMediaSummary()}       // Media statistics
 * />
 *
 * Results in:
 * - Camera and microphone buttons at bottom
 * - Photo thumbnails with "Tap to preview" and Remove buttons
 * - Audio visualizer with play/stop controls and Remove button
 * - Dynamic helper text explaining current state
 * - Conditional sections that only appear when relevant
 *
 * @see {@link useMediaCapture} for state management and business logic
 * @see {@link MediaItem} for individual media item structure
 */
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
	// ================================
	// DYNAMIC HELPER TEXT GENERATION
	// ================================

	/**
	 * Generate context-aware helper text based on current state
	 *
	 * LAYMAN TERMS: "Create helpful instructions that change based on what's
	 * happening. If user is recording, show 'Recording... tap to stop'.
	 * Otherwise, show basic instructions about camera and microphone."
	 *
	 * TECHNICAL: Dynamic helper text generator with state-driven messaging
	 *
	 * @function getDefaultHelperText
	 * @returns {string} Context-appropriate helper text
	 */
	const getDefaultHelperText = () => {
		if (isRecording) {
			return '🔴 Recording... Tap microphone to stop';
		}
		return 'Tap camera to add photos or microphone to record audio';
	};

	// ======================
	// MEDIA ITEM RENDERERS
	// ======================

	/**
	 * Render individual photo or video item with thumbnail and controls
	 *
	 * LAYMAN TERMS: "Create the display for each photo or video. Shows a
	 * thumbnail image, the file name with an icon, 'Tap to preview' text
	 * for photos, and a Remove button."
	 *
	 * TECHNICAL: Individual media item renderer with thumbnail, metadata,
	 * preview interaction, and removal controls
	 *
	 * @function renderMediaItem
	 * @param {MediaItem} media - The media item to render
	 * @param {number} index - Array index for removal handling
	 * @returns {JSX.Element} Complete media item display with controls
	 */
	const renderMediaItem = (media: MediaItem, index: number) => (
		<View key={index} style={styles.mediaItem}>
			{/* Thumbnail and details section */}
			<TouchableOpacity
				onPress={() =>
					media.type === 'photo' && onImagePreview?.(media.uri)
				}
				style={styles.mediaItemContent}
			>
				{/* Thumbnail image */}
				<Image
					source={{ uri: media.uri }}
					style={styles.mediaItemThumbnail}
					resizeMode="cover"
				/>

				{/* Media details */}
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

			{/* Remove button */}
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

	/**
	 * Render audio recording item with visualizer and playback controls
	 *
	 * LAYMAN TERMS: "Create the display for audio recordings. Shows a cool
	 * visualizer with waveform bars that animate during playback, play/stop
	 * button, status text, and a Remove button."
	 *
	 * TECHNICAL: Audio item renderer with animated visualizer, playback controls,
	 * state indicators, and removal functionality
	 *
	 * @function renderAudioItem
	 * @returns {JSX.Element} Complete audio item display with controls and visualizer
	 */
	const renderAudioItem = () => (
		<View style={styles.mediaItem}>
			<View style={styles.audioItemContent}>
				<View style={styles.audioVisualizer}>
					<BodyText style={styles.audioIcon}>🎶</BodyText>

					{/* Animated waveform bars */}
					<View style={styles.audioWaveform}>
						{[1, 2, 3, 4, 5].map((bar) => (
							<View
								key={bar}
								style={[
									styles.waveformBar,
									isPlayingAudio && styles.waveformBarActive, // Animate during playback
								]}
							/>
						))}
					</View>
				</View>

				<View style={styles.audioItemDetails}>
					<BodyText style={styles.mediaItemText}>
						Audio recording
					</BodyText>

					{/* Playback controls */}
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

			{/* Remove button */}
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

	// ==================
	// RENDER COMPONENT
	// ==================

	return (
		<View style={styles.section}>
			{/* ==================== */}
			{/*   SECTION HEADER     */}
			{/* ==================== */}

			<LabelText style={styles.sectionLabel}>{title}</LabelText>
			{/* ==================== */}
			{/*   MEDIA PREVIEW      */}
			{/* ==================== */}

			{(selectedMedia.length > 0 || audioUri) && (
				<View style={styles.mediaPreview}>
					{/* Photos and Videos */}
					{selectedMedia.map((media, index) =>
						renderMediaItem(media, index)
					)}

					{/* Audio Recording */}
					{audioUri && renderAudioItem()}
				</View>
			)}
			{/* ==================== */}
			{/*   ACTION BUTTONS     */}
			{/* ==================== */}

			<View style={styles.mediaButtons}>
				{/* Camera button */}
				<IconButton
					style={styles.mediaAddButton}
					icon="camera"
					onPress={onCameraPress}
					label="Camera"
					variant="filled"
					backgroundColor={ReMapColors.primary.blue}
					disabled={disabled}
				/>

				{/* Microphone button with dynamic state */}
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
			{/* ==================== */}
			{/*   HELPER TEXT        */}
			{/* ==================== */}

			<CaptionText style={styles.helperText}>
				{helperText || getDefaultHelperText()}
			</CaptionText>
		</View>
	);
}

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},

	// Media Preview Container
	mediaPreview: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.black,
	},

	// Individual Media Items
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

	// Audio Visualization
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

	// Action Buttons
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

export default MediaCapture;
