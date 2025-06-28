// ================
//   CORE IMPORTS
// ================
import React, {
	useCallback,
	useMemo,
	useRef,
	useState,
	useEffect,
} from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	runOnJS,
} from 'react-native-reanimated';
import { useAudioPlayer } from 'expo-audio';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Button } from '@/components/ui/Button';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	BodyText,
	CaptionText,
	LabelText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ================================
//   TYPE IMPORTS
// ================================
import type { MapPin } from '@/app/services/remap';

// ==================
// TYPE DEFINITIONS
// ==================

interface ViewPinBottomSheetProps {
	isVisible: boolean;
	onClose: () => void;
	pins: MapPin[];
	currentIndex: number;
	onChangeIndex: (newIndex: number) => void;
}

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

export function ViewPinBottomSheet({
	isVisible,
	onClose,
	pins,
	currentIndex,
	onChangeIndex,
}: ViewPinBottomSheetProps) {
	// ========================
	// BOTTOMSHEET SETUP
	// ========================

	const bottomSheetRef = useRef<BottomSheet>(null);

	// Snap points: 20% (peek), 50% (partial), 90% (full content)
	const snapPoints = useMemo(() => ['26%', '50%', '90%'], []);

	// ========================
	// AUDIO PLAYBACK STATE
	// ========================
	const [isPlaying, setIsPlaying] = useState(false);
	const audioPlayer = useAudioPlayer();

	// ========================
	// IMAGE GALLERY STATE
	// ========================
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
		null
	);
	const [isImageModalVisible, setIsImageModalVisible] = useState(false);

	// ========================
	// SWIPE GESTURE SETUP
	// ========================
	const translateX = useSharedValue(0);
	const context = useSharedValue({ x: 0 });

	const panGesture = Gesture.Pan()
		.onStart(() => {
			context.value = { x: translateX.value };
		})
		.onUpdate((event) => {
			translateX.value = event.translationX + context.value.x;
		})
		.onEnd((event) => {
			const threshold = 100; // Minimum distance to trigger swipe

			if (event.translationX > threshold && totalPins > 1) {
				// Swipe right - go to previous pin
				const prevIndex =
					currentIndex === 0 ? totalPins - 1 : currentIndex - 1;
				runOnJS(onChangeIndex)(prevIndex);
			} else if (event.translationX < -threshold && totalPins > 1) {
				// Swipe left - go to next pin
				const nextIndex = (currentIndex + 1) % totalPins;
				runOnJS(onChangeIndex)(nextIndex);
			}

			// Reset position
			translateX.value = withSpring(0);
		});

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		};
	});

	// ========================
	// EVENT HANDLERS
	// ========================

	const handleSheetChanges = useCallback(
		(index: number) => {
			console.log('BottomSheet snap index:', index);

			// If user drags to close position (-1), trigger onClose
			if (index === -1) {
				onClose();
			}
		},
		[onClose]
	);

	// ========================
	// PIN DATA
	// ========================
	const pinData = pins[currentIndex];
	const totalPins = pins.length;

	// ========================
	// DEFENSIVE CHECK
	// ========================
	if (
		!Array.isArray(pins) ||
		pins.length === 0 ||
		!Number.isFinite(currentIndex) ||
		!pins[currentIndex]
	) {
		return null;
	}

	// ========================
	// BOTTOMSHEET INDEX
	// ========================
	// Use -1 to hide, 0 to show at first snap point
	const bottomSheetIndex = isVisible ? 0 : -1;

	// ========================
	// DOT INDICATOR
	// ========================
	const renderDotIndicator = () => {
		if (totalPins <= 1) return null;
		return (
			<View style={styles.dotIndicatorRow}>
				{pins.map((_, idx) => (
					<View
						key={idx}
						style={[
							styles.dot,
							idx === currentIndex
								? styles.dotActive
								: styles.dotInactive,
						]}
					/>
				))}
			</View>
		);
	};

	// ========================
	// DATA HELPERS
	// ========================
	const getFormattedDate = (timestamp: string) => {
		try {
			return new Date(timestamp).toLocaleDateString('en-AU', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
		} catch {
			return 'Unknown date';
		}
	};

	const getMediaSummary = (pinData: MapPin) => {
		const parts = [];
		if (pinData.imageUrls && pinData.imageUrls.length > 0)
			parts.push(
				`${pinData.imageUrls.length} photo${
					pinData.imageUrls.length > 1 ? 's' : ''
				}`
			);
		if (pinData.audioUrl) parts.push('1 audio note');
		return parts.length > 0 ? parts.join(', ') : 'No media';
	};

	// ========================
	// NEXT MEMORY BUTTON
	// ========================
	const handleNextMemory = () => {
		if (totalPins <= 1) return;
		const nextIndex = (currentIndex + 1) % totalPins;
		onChangeIndex(nextIndex);
	};

	// ========================
	// AUDIO CONTROLS
	// ========================
	const loadAudio = async (audioUrl: string) => {
		try {
			// Use the expo-audio player hook
			audioPlayer.replace({ uri: audioUrl });
		} catch (error) {
			console.error('Error loading audio:', error);
		}
	};

	const togglePlayPause = async () => {
		if (!audioPlayer) return;

		try {
			if (isPlaying) {
				await audioPlayer.pause();
				setIsPlaying(false);
			} else {
				await audioPlayer.play();
				setIsPlaying(true);
			}
		} catch (error) {
			console.error('Error toggling audio:', error);
		}
	};

	const formatTime = (milliseconds: number) => {
		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	// Load audio when pin changes
	useEffect(() => {
		if (pinData?.audioUrl) {
			loadAudio(pinData.audioUrl);
		}

		return () => {
			if (audioPlayer) {
				audioPlayer.pause();
				setIsPlaying(false);
			}
		};
	}, [pinData?.audioUrl]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioPlayer) {
				audioPlayer.remove();
			}
		};
	}, [audioPlayer]);

	// ========================
	// RENDER COMPONENT
	// ========================

	return (
		<>
			<BottomSheet
				ref={bottomSheetRef}
				index={bottomSheetIndex}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				enablePanDownToClose={true}
				backgroundStyle={styles.bottomSheetBackground}
				handleStyle={styles.bottomSheetHandle}
			>
				<BottomSheetView style={styles.contentContainer}>
					{/* Swipe indicator for multiple pins */}
					{totalPins > 1 && (
						<View style={styles.swipeIndicator}>
							<CaptionText style={styles.swipeText}>
								← Swipe to navigate between memories →
							</CaptionText>
						</View>
					)}

					<GestureDetector gesture={panGesture}>
						<Animated.View
							style={[styles.swipeableContent, animatedStyle]}
						>
							{/* ==================== */}
							{/*   HEADER SECTION     */}
							{/* ==================== */}
							<View style={styles.header}>
								<View style={styles.headerMain}>
									<HeaderText style={styles.memoryTitle}>
										{pinData.name}
									</HeaderText>

									<View style={styles.locationRow}>
										<CaptionText
											style={styles.locationIcon}
										>
											📍
										</CaptionText>
										<BodyText style={styles.locationName}>
											{pinData.address}
										</BodyText>
									</View>
									{renderDotIndicator()}
								</View>
							</View>

							{/* ==================== */}
							{/*   METADATA SECTION   */}
							{/* ==================== */}
							<View style={styles.metadataRow}>
								<View style={styles.metadataItem}>
									<CaptionText style={styles.metadataLabel}>
										By
									</CaptionText>
									<CaptionText style={styles.metadataValue}>
										{pinData.author}
									</CaptionText>
								</View>

								<View style={styles.metadataItem}>
									<CaptionText style={styles.metadataLabel}>
										Date
									</CaptionText>
									<CaptionText style={styles.metadataValue}>
										{getFormattedDate(pinData.createdAt)}
									</CaptionText>
								</View>

								<View style={styles.metadataItem}>
									<CaptionText style={styles.metadataLabel}>
										Media
									</CaptionText>
									<CaptionText style={styles.metadataValue}>
										{getMediaSummary(pinData)}
									</CaptionText>
								</View>
							</View>

							{/* ==================== */}
							{/*   DESCRIPTION        */}
							{/* ==================== */}
							{pinData.description && (
								<View style={styles.section}>
									<LabelText style={styles.sectionLabel}>
										Memory Description
									</LabelText>
									<BodyText style={styles.description}>
										{pinData.description}
									</BodyText>
								</View>
							)}

							{/* ==================== */}
							{/*   LOCATION DETAILS   */}
							{/* ==================== */}
							<View style={styles.section}>
								<LabelText style={styles.sectionLabel}>
									Location Details
								</LabelText>
								<BodyText style={styles.locationDetails}>
									{pinData.address}
								</BodyText>
								<CaptionText style={styles.coordinates}>
									{pinData.latitude.toFixed(6)},{' '}
									{pinData.longitude.toFixed(6)}
								</CaptionText>
							</View>

							{/* ==================== */}
							{/*   PRIVACY INFO       */}
							{/* ==================== */}
							<View style={styles.section}>
								<LabelText style={styles.sectionLabel}>
									Visibility
								</LabelText>
								<View style={styles.visibilityContainer}>
									<View style={styles.visibilityTag}>
										<CaptionText
											style={styles.visibilityText}
										>
											{pinData.visibility}
										</CaptionText>
									</View>
								</View>
							</View>

							{/* ==================== */}
							{/*   MEDIA PREVIEW      */}
							{/* ==================== */}
							{pinData.imageUrls &&
								pinData.imageUrls
									.slice(0, 3)
									.map((imageUrl, index) => (
										<TouchableOpacity
											key={index}
											style={styles.mediaThumbnail}
											onPress={() => {
												setSelectedImageIndex(index);
												setIsImageModalVisible(true);
											}}
										>
											<Image
												source={{ uri: imageUrl }}
												style={styles.thumbnailImage}
												resizeMode="cover"
											/>
										</TouchableOpacity>
									))}

							{/* ==================== */}
							{/*   AUDIO INDICATOR    */}
							{/* ==================== */}
							{pinData.audioUrl && (
								<View style={styles.section}>
									<LabelText style={styles.sectionLabel}>
										Audio Recording
									</LabelText>
									<View style={styles.audioContainer}>
										<View style={styles.audioControls}>
											<TouchableOpacity
												onPress={togglePlayPause}
												style={styles.playButton}
											>
												<Text
													style={
														styles.playButtonText
													}
												>
													{isPlaying ? '⏸️' : '▶️'}
												</Text>
											</TouchableOpacity>

											<View style={styles.audioInfo}>
												<CaptionText
													style={styles.audioText}
												>
													Voice note
												</CaptionText>
												<CaptionText
													style={styles.audioTime}
												>
													Tap to play
												</CaptionText>
											</View>
										</View>
									</View>
								</View>
							)}

							{/* ==================== */}
							{/*   FOOTER SECTION     */}
							{/* ==================== */}
							{totalPins > 1 && (
								<View style={styles.actionsContainer}>
									<Button
										onPress={handleNextMemory}
										style={styles.actionButton}
									>
										Next Memory
									</Button>
								</View>
							)}
						</Animated.View>
					</GestureDetector>
				</BottomSheetView>
			</BottomSheet>

			{/* Image Modal */}
			{isImageModalVisible &&
				selectedImageIndex !== null &&
				pinData.imageUrls && (
					<View style={styles.imageModalOverlay}>
						<TouchableOpacity
							style={styles.imageModalBackground}
							onPress={() => setIsImageModalVisible(false)}
						>
							<View style={styles.imageModalContent}>
								<TouchableOpacity
									style={styles.closeImageButton}
									onPress={() =>
										setIsImageModalVisible(false)
									}
								>
									<Text style={styles.closeImageButtonText}>
										✕
									</Text>
								</TouchableOpacity>

								<Image
									source={{
										uri: pinData.imageUrls[
											selectedImageIndex
										],
									}}
									style={styles.fullScreenImage}
									resizeMode="contain"
								/>

								{/* Image navigation */}
								{pinData.imageUrls &&
									pinData.imageUrls.length > 1 && (
										<View style={styles.imageNavigation}>
											<TouchableOpacity
												style={styles.navButton}
												onPress={() => {
													if (
														selectedImageIndex !==
															null &&
														pinData.imageUrls
													) {
														const prevIndex =
															selectedImageIndex ===
															0
																? pinData
																		.imageUrls
																		.length -
																  1
																: selectedImageIndex -
																  1;
														setSelectedImageIndex(
															prevIndex
														);
													}
												}}
											>
												<Text
													style={styles.navButtonText}
												>
													‹
												</Text>
											</TouchableOpacity>

											<Text style={styles.imageCounter}>
												{selectedImageIndex !== null
													? selectedImageIndex + 1
													: 0}{' '}
												/{' '}
												{pinData.imageUrls?.length || 0}
											</Text>

											<TouchableOpacity
												style={styles.navButton}
												onPress={() => {
													if (
														selectedImageIndex !==
															null &&
														pinData.imageUrls
													) {
														const nextIndex =
															(selectedImageIndex +
																1) %
															pinData.imageUrls
																.length;
														setSelectedImageIndex(
															nextIndex
														);
													}
												}}
											>
												<Text
													style={styles.navButtonText}
												>
													›
												</Text>
											</TouchableOpacity>
										</View>
									)}
							</View>
						</TouchableOpacity>
					</View>
				)}
		</>
	);
}

export default ViewPinBottomSheet;

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	bottomSheetBackground: {
		backgroundColor: ReMapColors.primary.testing,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},
	bottomSheetHandle: {
		backgroundColor: ReMapColors.primary.testing,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	contentContainer: {
		flex: 1,
		padding: 20,
		paddingTop: 10,
	},

	// Header Section
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: ReMapColors.ui.border,
	},
	headerMain: {
		flex: 1,
		marginRight: 12,
	},
	memoryTitle: {
		marginBottom: 6,
		color: ReMapColors.ui.text,
	},
	locationRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	locationIcon: {
		marginRight: 4,
		color: ReMapColors.primary.blue,
	},
	locationName: {
		color: ReMapColors.ui.textSecondary,
		flex: 1,
	},

	// Metadata Section
	metadataRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		paddingVertical: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		paddingHorizontal: 12,
	},
	metadataItem: {
		flex: 1,
		alignItems: 'center',
	},
	metadataLabel: {
		color: ReMapColors.ui.textSecondary,
		marginBottom: 2,
		fontSize: 10,
	},
	metadataValue: {
		color: ReMapColors.ui.text,
		fontSize: 11,
		fontWeight: '500',
		textAlign: 'center',
	},

	// Content Sections
	section: {
		marginBottom: 20,
	},
	sectionLabel: {
		marginBottom: 8,
		color: ReMapColors.primary.violet,
		fontSize: 13,
	},
	description: {
		lineHeight: 22,
		color: ReMapColors.ui.text,
	},
	locationDetails: {
		color: ReMapColors.ui.text,
		marginBottom: 4,
	},
	coordinates: {
		color: ReMapColors.ui.textSecondary,
		fontFamily: 'monospace',
		fontSize: 10,
	},

	// Visibility Tags
	visibilityContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	visibilityTag: {
		backgroundColor: ReMapColors.primary.violet,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	visibilityText: {
		color: ReMapColors.ui.cardBackground,
		fontSize: 10,
		fontWeight: '500',
	},

	// Media Section
	mediaGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	mediaThumbnail: {
		width: 80,
		height: 60,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	mediaPlaceholder: {
		fontSize: 9,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
	},
	thumbnailImage: {
		width: '100%',
		height: '100%',
		borderRadius: 6,
	},

	// Audio Section
	audioContainer: {
		backgroundColor: ReMapColors.ui.background,
		padding: 12,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.blue,
	},
	audioControls: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	playButton: {
		padding: 8,
	},
	playButtonText: {
		fontSize: 20,
		color: ReMapColors.primary.blue,
	},
	audioInfo: {
		marginLeft: 12,
	},
	audioText: {
		color: ReMapColors.ui.text,
	},
	audioTime: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 10,
	},
	progressContainer: {
		height: 4,
		backgroundColor: ReMapColors.ui.border,
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		width: '100%',
		position: 'relative',
	},
	progressFill: {
		height: '100%',
		backgroundColor: ReMapColors.primary.blue,
		borderRadius: 2,
	},

	// Actions
	actionsContainer: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 20,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: ReMapColors.ui.border,
	},
	actionButton: {
		flex: 1,
	},

	// Dot Indicator
	dotIndicatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 4,
		gap: 4,
		justifyContent: 'center',
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginHorizontal: 2,
	},
	dotActive: {
		backgroundColor: ReMapColors.primary.violet,
	},
	dotInactive: {
		backgroundColor: ReMapColors.ui.border,
	},

	// Swipe Navigation
	swipeIndicator: {
		alignItems: 'center',
		marginBottom: 16,
		paddingVertical: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
	},
	swipeText: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 12,
		fontStyle: 'italic',
	},
	swipeableContent: {
		flex: 1,
	},

	// Image Modal
	imageModalOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	imageModalBackground: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imageModalContent: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 10,
		padding: 20,
		maxWidth: '90%',
		maxHeight: '90%',
	},
	closeImageButton: {
		position: 'absolute',
		top: 10,
		right: 10,
		padding: 5,
	},
	closeImageButtonText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: ReMapColors.primary.violet,
	},
	fullScreenImage: {
		width: '100%',
		height: '100%',
	},
	imageNavigation: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
	},
	navButton: {
		padding: 10,
	},
	navButtonText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: ReMapColors.primary.violet,
	},
	imageCounter: {
		fontSize: 16,
		fontWeight: 'bold',
		color: ReMapColors.primary.violet,
	},
});
