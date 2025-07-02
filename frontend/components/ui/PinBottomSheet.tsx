// ================
//   CORE IMPORTS
// ================
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	Dimensions,
	Text,
} from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import BottomSheet, {
	BottomSheetView,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { HeaderText, BodyText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ================================
//   INTERNAL 'SERVICES' IMPORTS
// ================================
import RemapClient from '@/app/services/remap';

// ==================
// TYPE DEFINITIONS
// ==================

interface PinData {
	id: string;
	name: string;
	description: string;
	location: {
		location_query: string;
		latitude: number;
		longitude: number;
	};
	media: {
		photos: Array<{ uri: string; name?: string }>;
		videos: Array<{ uri: string; name?: string }>;
		audio?: { uri: string; name?: string } | null;
	};
	owner: {
		username: string;
		avatar_url?: string;
		display_name?: string;
	};
	created_at: string;
}

interface PinBottomSheetProps {
	pinData: PinData | null;
	allPinsAtLocation?: PinData[];
	currentPinIndex?: number;
	onClose: () => void;
	onNextPin?: () => void;
}

// ===========================
// COMPONENT IMPLEMENTATION
// ===========================

export function PinBottomSheet({
	pinData,
	allPinsAtLocation = [],
	currentPinIndex = 0,
	onClose,
	onNextPin,
}: PinBottomSheetProps) {
	// ==================
	// STATE MANAGEMENT
	// ==================
	const [imagePreviewState, setImagePreviewState] = useState<{
		visible: boolean;
		imageUri: string | null;
	}>({
		visible: false,
		imageUri: null,
	});

	// ==================
	// REFS
	// ==================
	const bottomSheetRef = useRef<BottomSheet>(null);

	// ==================
	// UTILITY FUNCTIONS
	// ==================

	const getDisplayName = (owner: PinData['owner']) => {
		return owner.display_name || owner.username || 'Unknown User';
	};

	const formatCreatedAt = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			const hours = Math.floor(diffInHours);
			return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		} else {
			const days = Math.floor(diffInHours / 24);
			return `${days} day${days > 1 ? 's' : ''} ago`;
		}
	};

	// ==================
	// MEDIA HANDLERS
	// ==================

	const handleImagePreview = useCallback((imageUri: string) => {
		setImagePreviewState({
			visible: true,
			imageUri: imageUri,
		});
	}, []);

	const handleCloseImagePreview = useCallback(() => {
		setImagePreviewState({
			visible: false,
			imageUri: null,
		});
	}, []);

	// ==================
	// SNAP POINTS CALCULATION
	// ==================

	const snapPoints = useMemo(() => {
		if (!pinData) return ['20%'];

		// Calculate content height based on content
		let contentHeight = 280; // Increased base height for header + footer + padding

		// Add height for media grid
		const mediaCount =
			(pinData.media?.photos?.length || 0) +
			(pinData.media?.videos?.length || 0) +
			(pinData.media?.audio ? 1 : 0);
		if (mediaCount > 0) {
			contentHeight += 120; // Media grid height
		}

		// Add height for description
		if (pinData.description) {
			const lines = Math.ceil(pinData.description.length / 40); // Rough estimate
			const descriptionHeight = Math.min(lines * 20, 200); // Max 200px for description
			contentHeight += descriptionHeight;
		}

		// Add height for created date
		contentHeight += 40;

		// Convert to percentage of screen height
		const screenHeight = Dimensions.get('window').height;
		const contentPercentage = Math.min(
			(contentHeight / screenHeight) * 100,
			80
		); // Increased max to 80%

		return [`20%`, `${contentPercentage}%`];
	}, [pinData]);

	// ==================
	// RENDER FUNCTIONS
	// ==================

	const renderMediaGrid = () => {
		if (!pinData?.media) return null;

		const allMedia = [
			...(pinData.media.photos || []).map((photo) => ({
				...photo,
				type: 'photo' as const,
			})),
			...(pinData.media.videos || []).map((video) => ({
				...video,
				type: 'video' as const,
			})),
			...(pinData.media.audio
				? [{ ...pinData.media.audio, type: 'audio' as const }]
				: []),
		];

		if (allMedia.length === 0) return null;

		return (
			<View style={styles.mediaSection}>
				<BodyText style={styles.sectionTitle}>Media</BodyText>
				<View style={styles.mediaGrid}>
					{allMedia.map((media, index) => (
						<TouchableOpacity
							key={index}
							style={styles.mediaThumbnail}
							onPress={() => {
								if (media.type === 'photo') {
									handleImagePreview(media.uri);
								}
								// TODO: Add video/audio playback functionality
							}}
						>
							{media.type === 'photo' && (
								<Image
									source={{ uri: media.uri }}
									style={styles.mediaImage}
									resizeMode="cover"
								/>
							)}
							{media.type === 'video' && (
								<View style={styles.mediaPlaceholder}>
									<Text style={styles.mediaIcon}>🎥</Text>
								</View>
							)}
							{media.type === 'audio' && (
								<View style={styles.mediaPlaceholder}>
									<Text style={styles.mediaIcon}>🎵</Text>
								</View>
							)}
						</TouchableOpacity>
					))}
				</View>
			</View>
		);
	};

	// ==================
	// MAIN RENDER
	// ==================

	// Don't render if no pin data
	if (!pinData) return null;

	return (
		<>
			<BottomSheet
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				enablePanDownToClose={true}
				onClose={onClose}
				backgroundStyle={styles.bottomSheetBackground}
				handleIndicatorStyle={styles.handleIndicator}
			>
				<BottomSheetView style={styles.container}>
					{/* Header Section */}
					<View style={styles.header}>
						<View style={styles.headerContent}>
							<View style={styles.titleSection}>
								<HeaderText
									style={styles.memoryName}
									numberOfLines={2}
								>
									{pinData.name}
								</HeaderText>
								<CaptionText
									style={styles.location}
									numberOfLines={1}
								>
									📍 {pinData.location.location_query}
								</CaptionText>
							</View>
							<View style={styles.userInfo}>
								<Image
									source={
										pinData.owner?.avatar_url
											? { uri: pinData.owner.avatar_url }
											: {
													uri: 'https://via.placeholder.com/40x40/cccccc/666666?text=U',
											  }
									}
									style={styles.userAvatar}
									resizeMode="cover"
								/>
								<CaptionText
									style={styles.username}
									numberOfLines={1}
								>
									{getDisplayName(pinData.owner)}
								</CaptionText>
							</View>
						</View>
					</View>

					{/* Scrollable Content */}
					<BottomSheetScrollView
						style={styles.scrollContent}
						contentContainerStyle={styles.scrollContentContainer}
						showsVerticalScrollIndicator={false}
					>
						{/* Media Grid */}
						{renderMediaGrid()}

						{/* Description */}
						{pinData.description && (
							<View style={styles.descriptionSection}>
								<BodyText style={styles.description}>
									{pinData.description}
								</BodyText>
							</View>
						)}

						{/* Created Date */}
						<View style={styles.dateSection}>
							<CaptionText style={styles.createdAt}>
								Created {formatCreatedAt(pinData.created_at)}
							</CaptionText>
						</View>
					</BottomSheetScrollView>

					{/* Footer */}
					<View style={styles.footer}>
						{/* Show "Next Memory" if there are multiple pins at this location */}
						{allPinsAtLocation.length > 1 && onNextPin ? (
							<View style={styles.footerButtonsContainer}>
								<Button
									onPress={onClose}
									style={styles.footerButtonSecondary}
									variant="secondary"
								>
									Close
								</Button>
								<Button
									onPress={onNextPin}
									style={styles.footerButtonPrimary}
									variant="primary"
								>
									Next Memory
								</Button>
							</View>
						) : (
							<Button
								onPress={onClose}
								style={styles.footerButton}
								variant="primary"
							>
								Close
							</Button>
						)}
					</View>
				</BottomSheetView>
			</BottomSheet>

			{/* Image Preview Modal */}
			<Modal
				isVisible={imagePreviewState.visible}
				onBackdropPress={handleCloseImagePreview}
			>
				<Modal.Container>
					<Modal.Header title="Memory Photo" />
					<Modal.Body>
						<View style={styles.imagePreviewContainer}>
							{imagePreviewState.imageUri && (
								<Image
									source={{ uri: imagePreviewState.imageUri }}
									style={styles.fullImagePreview}
									resizeMode="contain"
								/>
							)}
						</View>
					</Modal.Body>
					<Modal.Footer>
						<Button
							onPress={handleCloseImagePreview}
							variant="primary"
						>
							Close
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>
		</>
	);
}

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	bottomSheetBackground: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	handleIndicator: {
		backgroundColor: '#CCCCCC',
		width: 40,
		height: 4,
	},
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	headerContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	titleSection: {
		flex: 1,
		marginRight: 12,
	},
	memoryName: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 4,
		color: '#1A1A1A',
	},
	location: {
		fontSize: 14,
		color: '#666666',
	},
	userInfo: {
		alignItems: 'center',
		minWidth: 60,
	},
	userAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginBottom: 4,
	},
	username: {
		fontSize: 12,
		color: '#666666',
		textAlign: 'center',
	},
	scrollContent: {
		flex: 1,
	},
	scrollContentContainer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	mediaSection: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 12,
		color: '#1A1A1A',
	},
	mediaGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 8,
	},
	mediaThumbnail: {
		width: 80,
		height: 80,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: '#F5F5F5',
	},
	mediaImage: {
		width: '100%',
		height: '100%',
	},
	mediaPlaceholder: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F0F0F0',
	},
	mediaIcon: {
		fontSize: 24,
	},
	descriptionSection: {
		marginBottom: 20,
	},
	description: {
		fontSize: 16,
		lineHeight: 24,
		color: '#333333',
	},
	dateSection: {
		marginBottom: 20,
		alignItems: 'center',
	},
	createdAt: {
		fontSize: 14,
		color: '#999999',
		fontStyle: 'italic',
	},
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: '#F0F0F0',
	},
	footerButton: {
		width: '100%',
	},
	footerButtonsContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	footerButtonSecondary: {
		flex: 1,
	},
	footerButtonPrimary: {
		flex: 2,
	},
	imagePreviewContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 300,
		maxHeight: 500,
	},
	fullImagePreview: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
	},
});

export default PinBottomSheet;
