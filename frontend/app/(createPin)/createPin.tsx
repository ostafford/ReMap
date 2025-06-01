// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';

// ================================
//   INTERNAL 'LAYOUT' COMPONENTS
// ================================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// ============================
//   INTERNAL 'UI' COMPONENTS
// ============================
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	SubheaderText,
	BodyText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
type VisibilityOption = 'public' | 'social' | 'private';

export default function CreatePinScreen() {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
	const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
	const [selectedVisibility, setSelectedVisibility] = useState<
		VisibilityOption[]
	>(['public']);
	const [locationQuery, setLocationQuery] = useState('');
	const [memoryTitle, setMemoryTitle] = useState('');
	const [memoryDescription, setMemoryDescription] = useState('');

	// ==================
	//   EVENT HANDLERS
	// ==================
	const toggleLoginModal = () => setIsLoginModalVisible(!isLoginModalVisible);
	const toggleSignupModal = () =>
		setIsSignupModalVisible(!isSignupModalVisible);

	const goBack = () => {
		router.back();
	};

	const navigateToWorldMap = () => {
		router.navigate('/worldmap');
	};

	const handleVisibilitySelect = (option: VisibilityOption) => {
		setSelectedVisibility((prev) => {
			if (prev.includes(option)) {
				if (prev.length > 1) {
					return prev.filter((item) => item !== option);
				}
				return prev;
			} else {
				return [...prev, option];
			}
		});
	};

	const handleSavePin = () => {
		console.log('Saving pin with data:', {
			location: locationQuery,
			title: memoryTitle,
			description: memoryDescription,
			visibility: selectedVisibility,
		});

		navigateToWorldMap();
	};

	// ==================
	//   HELPER FUNCTIONS
	// ==================
	const isVisibilitySelected = (option: VisibilityOption) => {
		return selectedVisibility.includes(option);
	};

	const getVisibilityDescription = () => {
		if (selectedVisibility.length === 1) {
			switch (selectedVisibility[0]) {
				case 'public':
					return 'Visible to everyone in the ReMap community';
				case 'social':
					return 'Visible to your friends and followers';
				case 'private':
					return 'Only visible to you';
			}
		} else if (selectedVisibility.length === 2) {
			const options = selectedVisibility.sort();
			if (options.includes('public') && options.includes('social')) {
				return 'Visible to everyone and your social circle';
			} else if (
				options.includes('public') &&
				options.includes('private')
			) {
				return 'Visible to everyone, but you control the details';
			} else if (
				options.includes('social') &&
				options.includes('private')
			) {
				return 'Visible to your friends, with private elements';
			}
		} else if (selectedVisibility.length === 3) {
			return 'Multiple visibility layers - maximum flexibility';
		}
		return 'Select your visibility preferences';
	};

	const getVisibilityIcon = (option: VisibilityOption) => {
		// NOTE: Left these empty incase we want to use ICONS instead of text
		switch (option) {
			case 'public':
				return '';
			case 'social':
				return '';
			case 'private':
				return '';
		}
	};

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header
				title="Create Memory Pin"
				subtitle="Capture this moment forever"
			/>

			<MainContent>
				<View style={styles.content}>
					{/* Location Selection Section */}
					<View style={styles.section}>
						<LabelText style={styles.sectionLabel}>
							Where are you?
						</LabelText>
						<Input
							label="Search Location"
							placeholder="Search for a location..."
							value={locationQuery}
							onChangeText={setLocationQuery}
							style={styles.fullWidth}
						/>
						<CaptionText style={styles.helperText}>
							We'll pin your memory to this exact location
						</CaptionText>
					</View>

					{/* Privacy Selection Section */}
					<View style={styles.section}>
						<LabelText style={styles.sectionLabel}>
							Who can see this memory?
						</LabelText>

						<View style={styles.visibilityContainer}>
							{(
								[
									'public',
									'social',
									'private',
								] as VisibilityOption[]
							).map((option) => (
								<Button
									key={option}
									onPress={() =>
										handleVisibilitySelect(option)
									}
									style={[
										styles.visibilityButton,
										isVisibilitySelected(option) &&
											styles.selectedVisibilityButton,
									]}
									variant={
										isVisibilitySelected(option)
											? 'primary'
											: 'secondary'
									}
								>
									{getVisibilityIcon(option)}{' '}
									{option.charAt(0).toUpperCase() +
										option.slice(1)}
									{isVisibilitySelected(option) && ' ✓'}
								</Button>
							))}
						</View>

						<CaptionText style={styles.visibilityDescription}>
							{getVisibilityDescription()}
						</CaptionText>
					</View>

					{/* Memory Content Section */}
					<View style={styles.section}>
						<LabelText style={styles.sectionLabel}>
							💭 What happened here?
						</LabelText>

						<Input
							label="Memory Title"
							placeholder="Give this memory a title..."
							value={memoryTitle}
							onChangeText={setMemoryTitle}
							style={styles.fullWidth}
						/>

						<Input
							label="Tell the story"
							placeholder="Describe what made this moment special..."
							value={memoryDescription}
							onChangeText={setMemoryDescription}
							style={styles.fullWidth}
							multiline={true}
							numberOfLines={50}
						/>
					</View>

					{/* Media Capture Section */}
					<View style={styles.section}>
						<LabelText style={styles.sectionLabel}>
							📸 Add media to your memory
						</LabelText>

						<View style={styles.mediaRow}>
							<View style={styles.mediaInputContainer}>
								<Input
									label="Photo/Video"
									placeholder="Add photos or videos..."
									style={styles.mediaInput}
									editable={false} // For now, just a placeholder
								/>
							</View>

							<View style={styles.mediaButtons}>
								<IconButton
									icon="camera"
									onPress={() => console.log('Open camera')}
									label="Camera"
									variant="filled"
									backgroundColor={ReMapColors.primary.blue}
								/>
								<IconButton
									icon="microphone"
									onPress={() => console.log('Record audio')}
									label="Audio"
									variant="filled"
									backgroundColor={ReMapColors.primary.violet}
								/>
							</View>
						</View>

						<CaptionText style={styles.helperText}>
							Tap camera to take a photo or microphone to record
							audio
						</CaptionText>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					<View style={styles.navigationRow}>
						<Button
							onPress={goBack}
							style={styles.backButton}
							variant="secondary"
						>
							← Back
						</Button>

						<Button
							onPress={handleSavePin}
							style={styles.saveButton}
							variant="primary"
							disabled={
								!memoryTitle.trim() || !locationQuery.trim()
							}
						>
							Save Memory
						</Button>
					</View>
				</View>
			</Footer>
		</View>
	);
}

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	content: {
		paddingHorizontal: 20,
		paddingVertical: 10,
	},

	// Section Styling
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16, // Slightly larger for section headers
	},

	// Form Styling
	fullWidth: {
		width: '100%',
	},
	helperText: {
		marginTop: 8,
		paddingHorizontal: 4,
	},

	// Visibility Selection
	visibilityContainer: {
		flexDirection: 'row',
		gap: 5,
		marginBottom: 5,
	},
	visibilityButton: {
		flex: 1,
		minHeight: 44,
	},
	selectedVisibilityButton: {
		// Additional styling handled by variant prop
	},
	visibilityDescription: {
		marginTop: 8,
		padding: 12,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.violet,
	},

	// Media Section
	mediaRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 12,
		marginBottom: 8,
	},
	mediaInputContainer: {
		flex: 1,
	},
	mediaInput: {
		flex: 1,
	},
	mediaButtons: {
		flexDirection: 'row',
		gap: 8,
		paddingBottom: 10,
	},

	// Footer Styling
	buttonContainer: {
		width: '100%',
	},
	navigationRow: {
		flexDirection: 'row',
		gap: 12,
		padding: 10,
	},
	backButton: {
		flex: 1,
	},
	saveButton: {
		flex: 4,
	},
});
