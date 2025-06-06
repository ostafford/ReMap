// ========================
//   REACT NATIVE IMPORTS
// ========================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
} from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';

// =====================
//   LAYOUT COMPONENTS
// =====================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// =================
//   UI COMPONENTS
// =================
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
	InfoMessage,
} from '@/components/ui/Messages';

// ======================
//   TYPOGRAPHY IMPORTS
// ======================
import {
	HeaderText,
	BodyText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// ======================
//   CONSTANTS IMPORTS
// ======================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   SERVICE IMPORTS
// ====================
import {
	createMemoryPin,
	type CreateMemoryRequest,
	type UploadProgress,
} from '@/services/memoryService';

// =================
//   CUSTOM HOOKS
// =================
import { useMemoryContent } from '@/hooks/createPin/useMemoryContent';
import { useMediaCapture } from '@/hooks/createPin/useMediaCapture';
import { usePrivacySettings } from '@/hooks/createPin/usePrivacySettings';

// =======================
//   FEATURE COMPONENTS
// =======================
import { LocationSelector } from '@/components/createPin/LocationSelector';
import { MediaCapture } from '@/components/createPin/MediaCapture';
import { VisibilitySelector } from '@/components/createPin/VisibilitySelector';
import { SocialCircleSelector } from '@/components/createPin/SocialCircleSelector';

// =========================
//   TYPE DEFINITIONS
// =========================
/**
 * Modal Recipe Card - tells the app how to build any modal popup
 *
 * Think of this like a form you fill out to create a modal:
 * - What should it look like? (error = red, success = green)
 * - What text goes in it?
 * - What buttons does it need?
 *
 *	LAYMAN TERMS: "I want to show a red error popup with 'Oops!' as the title,
 * 'You forgot to add a title' as the message, and an OK button"
 *
 * TECHNICAL: Interface defining modal state configuration for consistent
 * popup behavior across the CreatePin component
 *
 * @interface ModalState
 * @since 1.0.0
 *
 * @example
 * "Show me a red error popup"
 * const errorModal: ModalState = {
 *   show: true,                    // "Display it now"
 *   type: 'error',                 // "Make it red/scary"
 *   title: 'Oops!',               // "Big text at top"
 *   message: 'You forgot the title', // "Explanation text"
 *   actions: [                     // "What buttons to show"
 *     { text: 'OK', onPress: hideModal, style: 'primary' }
 *   ]
 * };
 *
 * "Show me a simple info popup with just an OK button"
 * const infoModal: ModalState = {
 *   show: true,
 *   type: 'info',                  // "Make it blue/informational"
 *   title: 'Recording Started',
 *   message: 'Tap microphone again to stop'
 *   // No actions = automatic OK button
 * };
 */
interface ModalState {
	show: boolean;
	type:
		| 'error'
		| 'permission'
		| 'photoChoice'
		| 'success'
		| 'info'
		| 'preview'
		| 'imagePreview';
	title: string;
	message: string;
	actions?: Array<{
		text: string;
		onPress: () => void;
		style?: 'primary' | 'secondary' | 'danger';
	}>;
}

/**
 * Complete Memory Package - everything about one memory location
 *
 * LAYMAN TERMS: When someone creates a memory pin, ALL the information
 * gets packaged into this format:
 * - Where it happened
 * - What the person wrote about it
 * - Who can see it
 * - Any photos/videos/audio they attached
 * - Some extra info the app calculated
 *
 * This same package gets used in 3 different ways:
 * 1. PREVIEW: Show it in the preview popup
 * 2. WORLDMAP: Display it as a pin on the map (future feature)
 * 3. BACKEND: Transform it and send to database
 *
 * TECHNICAL: Frontend memory data structure for display, processing,
 * and API transformation. Maintains separation from backend schema
 * for UI flexibility.
 *
 * @interface MemoryData
 * @since 1.0.0
 *
 * @example
 * A real memory someone might create
 * const someoneMemory: MemoryData = {
 *   id: '1642890123456',                           // Unique ID number
 *   timestamp: '2024-01-22T14:30:00.000Z',        // When they created it
 *   location: {
 *     query: 'That cool cafe on Collins Street'    // Where they said it happened
 *   },
 *   content: {
 *     title: 'Best coffee discovery',              // What they named it
 *     description: 'Found this hidden gem...'     // Their story about it
 *   },
 *   visibility: ['public', 'social'],             // Everyone + friends can see it
 *   socialCircles: ['coffee_lovers', 'work_friends'], // Which friend groups
 *   media: {
 *     photos: [photo of the latte art],     // Pictures they took
 *     videos: [],                                 // No videos this time
 *     audio: null                                 // No voice recording
 *   },
 *   metadata: {
 *     totalMediaItems: 1,                         // 1 photo total
 *     hasDescription: true,                       // They wrote a story
 *     createdAt: '2024-01-22T14:30:00.000Z'      // When the app saved it
 *   }
 * };
 *
 * @see {@link createBackendMemoryData} for converting to database format
 * @see {@link MemoryPreviewModal} for how this gets displayed
 */
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

// ========================
//   COMPONENT DEFINITION
// ========================
/**
 * CreatePin Screen - Main component for creating location-based memory pins
 *
 * LAYMAN TERMS: This is the main function that builds the entire "Create Memory Pin"
 * screen. When someone taps "Create Pin" from the world map, this function runs and
 * shows them the form to fill out (location, title, description, photos, etc.)
 *
 * TECHNICAL: Main React component handling complete memory creation workflow
 * from initial form display through final API submission and navigation
 *
 * @component CreatePinScreen
 * @returns {JSX.Element} Complete create pin form interface with modal system
 *
 * @example
 * Used in app routing
 * <Stack.Screen name="createPin" component={CreatePinScreen} />
 */
export default function CreatePinScreen() {
	// ====================
	//   STATE MANAGEMENT
	// ====================
	/**
	 * LAYMAN TERMS: "Is the app currently saving the memory to the server?"
	 * Shows loading spinner and disables buttons while saving
	 * TECHNICAL: Boolean state for save operation progress indication
	 */
	const [isSaving, setIsSaving] = useState(false);
	/**
	 * LAYMAN TERMS: "How much of the save process is done? (for progress bar)"
	 * Shows user how many photos/videos have uploaded so far
	 * TECHNICAL: Upload progress tracking state for user feedback
	 */
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
		null
	);
	/**
	 * LAYMAN TERMS: "What popup should I show right now?"
	 * Controls all popups: errors, success messages, preview window, etc.
	 * TECHNICAL: Modal state management using ModalState interface
	 */
	const [modalState, setModalState] = useState<ModalState>({
		show: false,
		type: 'info',
		title: '',
		message: '',
		actions: [],
	});
	/**
	 * LAYMAN TERMS: "The complete memory package for the preview popup"
	 * When user taps "Preview Memory", this holds all their entered data
	 * TECHNICAL: Preview modal data state using MemoryData interface
	 */
	const [previewData, setPreviewData] = useState<MemoryData | null>(null);
	/**
	 * LAYMAN TERMS: "Which photo should I show full-screen right now?"
	 * When user taps a photo thumbnail, this holds the photo URL
	 * TECHNICAL: Image preview modal state for full-screen photo display
	 */
	const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

	// ===================
	// 	HELPER FUNCTIONS
	// ===================
	/**
	 * Universal popup display function - shows any type of modal
	 *
	 * LAYMAN TERMS: "Show a popup with specific text and buttons"
	 * Like calling: showModal('error', 'Oops!', 'You forgot the title')
	 *
	 * TECHNICAL: Centralized modal state setter with type safety and default actions
	 *
	 * @param {ModalState['type']} type - What kind of popup (error=red, success=green, etc.)
	 * @param {string} title - Big text at the top
	 * @param {string} message - Explanation text in the middle
	 * @param {ModalState['actions']} [actions] - Custom buttons (optional)
	 *
	 * @example
	 * // Simple error popup
	 * showModal('error', 'Missing Title', 'Please add a title for your memory');
	 *
	 * // Success popup with custom buttons
	 * showModal('success', 'Saved!', 'Your memory was posted', [
	 *   { text: 'View Map', onPress: goToMap, style: 'primary' },
	 *   { text: 'Create Another', onPress: resetForm, style: 'secondary' }
	 * ]);
	 */
	const showModal = useCallback(
		(
			type: ModalState['type'],
			title: string,
			message: string,
			actions?: ModalState['actions']
		) => {
			setModalState({
				show: true,
				type,
				title,
				message,
				actions: actions || [
					{ text: 'OK', onPress: hideModal, style: 'primary' },
				],
			});
		},
		[]
	);
	/**
	 * Hide any currently visible popup and clean up related data
	 *
	 * LAYMAN TERMS: "Close whatever popup is showing and clean up"
	 * Also clears preview data if it was a preview popup
	 *
	 * TECHNICAL: Modal state reset with conditional cleanup based on modal type
	 */
	const hideModal = useCallback(() => {
		const currentType = modalState.type;
		setModalState((prev) => ({ ...prev, show: false }));
		if (currentType === 'preview') {
			setPreviewData(null);
		}
		if (currentType === 'imagePreview') {
			setPreviewImageUri(null);
		}
	}, [modalState.type]);

	// ================
	//   CUSTOM HOOKS
	// ================
	/**
	 * LAYMAN TERMS: "Manages everything about the memory content (title, description, location)"
	 *
	 * TECHNICAL: Custom hook for memory content state and validation logic
	 */
	const memoryContent = useMemoryContent({
		showModal,
	});
	/**
	 * LAYMAN TERMS: "Manages everything about photos, videos, and audio recording"
	 *
	 * TECHNICAL: Custom hook for media capture, storage, and playback functionality
	 */
	const mediaCapture = useMediaCapture({
		showModal,
	});
	/**
	 * LAYMAN TERMS: "Manages everything about privacy settings and social circles"
	 *
	 * TECHNICAL: Custom hook for visibility and social circle selection logic
	 */
	const privacySettings = usePrivacySettings();

	// ===============================================
	//   DESTRUCTURING [Clean Variable Extraction]
	// ===============================================
	/**
	 * LAYMAN TERMS: "Get all the memory content functions and data from the hook"
	 * Instead of typing memoryContent.memoryTitle every time, just use memoryTitle
	 * TECHNICAL: Destructured hook return values for cleaner code access
	 *  const {
		memoryTitle,              // Current title text
		setMemoryTitle,           // Function to update title
		memoryDescription,        // Current description text
		setMemoryDescription,     // Function to update description
		locationQuery,            // Current location search text
		setLocationQuery,         // Function to update location
		coordinates,              // Lat/lng coordinates from map
		handleCoordinateChange,   // Function when user moves map pin
		activeInputId,            // Which input field is currently focused
		locationInputRef,         // Reference to location input for focusing
		titleInputRef,           // Reference to title input for focusing
		descriptionInputRef,     // Reference to description input for focusing
		validateContent,         // Function to check if form is valid
		resetContent,            // Function to clear all content
		hasValidContent,         // Boolean: is form ready to submit?
		contentSummary,          // Object with completion stats
	  } = memoryContent; */
	const {
		memoryTitle,
		setMemoryTitle,
		memoryDescription,
		setMemoryDescription,
		locationQuery,
		setLocationQuery,
		coordinates,
		handleCoordinateChange,
		locationInputRef,
		titleInputRef,
		descriptionInputRef,
		validateContent,
		resetContent,
		hasValidContent,
	} = memoryContent;
	/**
   * LAYMAN TERMS: "Get all the photo/video/audio functions and data from the hook"
   * TECHNICAL: Destructured media capture hook return values
   
	const {
    selectedMedia,        // Array of photos and videos user selected
    audioUri,            // URL of recorded audio (or null)
    isRecording,         // Boolean: is microphone recording right now?
    isPlayingAudio,      // Boolean: is audio playing right now?
    handleCameraPress,   // Function when user taps camera button
    handleAudioPress,    // Function when user taps microphone button
    removeMedia,         // Function to delete a photo/video
    removeAudio,         // Function to delete audio recording
    playRecording,       // Function to play the audio
    stopPlayback,        // Function to stop playing audio
    resetMedia,          // Function to clear all media
    getMediaSummary,     // Function that returns media count stats
  } = mediaCapture; */
	const {
		selectedMedia,
		audioUri,
		isRecording,
		isPlayingAudio,
		handleCameraPress,
		handleAudioPress,
		removeMedia,
		removeAudio,
		playRecording,
		stopPlayback,
		resetMedia,
		getMediaSummary,
	} = mediaCapture;
	/**
   * LAYMAN TERMS: "Get all the privacy/sharing functions and data from the hook"
   * TECHNICAL: Destructured privacy settings hook return values
   
	const {
    selectedVisibility,        // Array like ['public', 'social']
    selectedSocialCircles,     // Array of circle IDs like ['family', 'friends']
    showSocialDropdown,        // Boolean: should social circles section be visible?
    userSocialCircles,         // Array of all available social circles
    handleVisibilitySelect,    // Function when user taps public/social/private
    handleSocialCircleToggle,  // Function when user taps a social circle
    isVisibilitySelected,      // Function to check if option is selected
    getSelectedSocialCircles,  // Function that returns selected circle objects
    getVisibilityDescription,  // Function that returns description text
    resetPrivacySettings,      // Function to reset to default privacy
    privacySummary,           // Object with privacy stats
  } = privacySettings; */
	const {
		selectedVisibility,
		selectedSocialCircles,
		showSocialDropdown,
		userSocialCircles,
		handleVisibilitySelect,
		handleSocialCircleToggle,
		isVisibilitySelected,
		getSelectedSocialCircles,
		getVisibilityDescription,
		resetPrivacySettings,
	} = privacySettings;

	// ===================
	//   EVENT HANDLERS
	// ===================
	/**
	 * LAYMAN TERMS: "Go back to the world map (cancel creating memory)"
	 *
	 * TECHNICAL: Navigation handler for back button interaction
	 */
	const goBack = () => {
		router.replace('/worldmap');
	};
	/**
	 * LAYMAN TERMS: "Go to the world map (after successfully creating memory)"
	 *
	 * TECHNICAL: Navigation handler for post-creation workflow
	 */
	const navigateToWorldMap = () => {
		router.replace('/worldmap');
	};
	/**
	 * Show a photo in full-screen mode when user taps a thumbnail
	 *
	 * LAYMAN TERMS: "Make this photo fill the whole screen"
	 *
	 * TECHNICAL: Image preview modal trigger with URI state management
	 *
	 * @param {string} imageUri - URL of the photo to show full-screen
	 */
	const showImagePreview = (imageUri: string) => {
		setPreviewImageUri(imageUri);
		setModalState({
			show: true,
			type: 'imagePreview',
			title: 'Image Preview',
			message: '',
			actions: [
				{ text: 'Close', onPress: hideModal, style: 'secondary' },
			],
		});
	};

	// =======================
	//  DATA TRANSFORMATION
	// =======================
	/**
	 * Package all form data into the frontend memory format
	 *
	 * LAYMAN TERMS: "Take everything the user typed and selected in the form,
	 * and bundle it all together into one neat package that the app can use
	 * for showing previews and displaying on the map later."
	 *
	 * Think of it like packing a suitcase - you take all your clothes (user inputs)
	 * from different drawers (different form sections) and organize them neatly
	 * into one suitcase (MemoryData object) so you can travel with everything together.
	 *
	 * TECHNICAL: Frontend data aggregation function that creates a MemoryData
	 * interface instance from current component state. Used for preview display,
	 * future worldmap pin rendering, and as source for backend transformation.
	 *
	 * @function createMemoryData
	 * @returns {MemoryData} Complete memory object formatted for frontend usage
	 *
	 * @example
	 * User has filled out the form like this:
	 * Title: "Best coffee ever"
	 * Description: "Found this amazing cafe in a hidden laneway"
	 * Location: "Patricia Coffee Brewers, Melbourne"
	 * Privacy: Public + Social circles
	 * SocialCircles: ['friends', 'coffee_lovers']
	 * Photos: 2 photos of coffee and cafe
	 * Audio: 1 voice recording
	 *
	 * const memoryData = createMemoryData();
	 *
	 * Result will be:
	 * {
	 *   id: "1642890123456",
	 *   timestamp: "2024-01-22T14:30:00.000Z",
	 *   location: {
	 *     query: "Patricia Coffee Brewers, Melbourne"
	 *   },
	 *   content: {
	 *     title: "Best coffee ever",
	 *     description: "Found this amazing cafe in a hidden laneway"
	 *   },
	 *   visibility: ["public", "social"],
	 *   socialCircles: ["friends", "coffee_lovers"],
	 *   media: {
	 *     photos: [
	 *       { uri: "file://photo1.jpg", type: "photo", name: "Coffee art" },
	 *       { uri: "file://photo2.jpg", type: "photo", name: "Cafe exterior" }
	 *     ],
	 *     videos: [],
	 *     audio: {
	 *       uri: "file://recording.m4a",
	 *       recorded: "2024-01-22T14:35:00.000Z"
	 *     }
	 *   },
	 *   metadata: {
	 *     totalMediaItems: 3,        // 2 photos + 1 audio = 3 total
	 *     hasDescription: true,      // User wrote a description
	 *     createdAt: "2024-01-22T14:30:00.000Z"
	 *   }
	 * }
	 *
	 * @see {@link MemoryData} for complete interface documentation
	 * @see {@link handlePreviewMemory} for usage in preview functionality
	 * @see {@link createBackendMemoryData} for backend format conversion
	 */
	const createMemoryData = (): MemoryData => {
		return {
			id: Date.now().toString(),
			timestamp: new Date().toISOString(),
			location: {
				query: locationQuery.trim(),
			},
			content: {
				title: memoryTitle.trim(),
				description: memoryDescription.trim(),
			},
			visibility: selectedVisibility,
			socialCircles: selectedSocialCircles,
			media: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri
					? {
							uri: audioUri,
							recorded: new Date().toISOString(),
					  }
					: null,
			},
			metadata: {
				totalMediaItems: selectedMedia.length + (audioUri ? 1 : 0),
				hasDescription: !!memoryDescription.trim(),
				createdAt: new Date().toISOString(),
			},
		};
	};
	/**
	 * Transform form data into backend API format
	 *
	 * LAYMAN TERMS: "Take the user's form data and translate it into the special
	 * format that our database expects. It's like translating English to French -
	 * same information, but different words and structure."
	 *
	 * The database has specific requirements:
	 * - It wants "name" instead of "title"
	 * - It needs exact GPS coordinates (latitude/longitude numbers)
	 * - It expects "location_query" instead of just "query"
	 * - It wants "social_circle_ids" instead of "socialCircles"
	 *
	 * TECHNICAL: Backend data transformation function that maps frontend state
	 * to CreateMemoryRequest interface format for Supabase API submission.
	 * Handles field name mapping and coordinate integration.
	 *
	 * @function createBackendMemoryData
	 * @returns {CreateMemoryRequest} Backend-formatted memory object for API calls
	 *
	 * @example
	 * Starting with same user input as above:
	 * Title: "Best coffee ever"
	 * Location: "Patricia Coffee Brewers, Melbourne"
	 * Coordinates: { latitude: -37.8154, longitude: 144.9636 }
	 * etc.
	 *
	 * const backendData = createBackendMemoryData();
	 *
	 * Result will be (notice the different field names):
	 * {
	 *   name: "Best coffee ever",                    // ← "title" became "name"
	 *   description: "Found this amazing cafe...",
	 *   latitude: -37.8154,                         // ← GPS coordinate numbers
	 *   longitude: 144.9636,                        // ← GPS coordinate numbers
	 *   location_query: "Patricia Coffee Brewers, Melbourne", // ← Different name
	 *   visibility: ["public", "social"],           // ← Same format
	 *   social_circle_ids: ["friends", "coffee_lovers"], // ← Different name
	 *   media: {
	 *     photos: [same photo objects],
	 *     videos: [],
	 *     audio: { uri: "file://recording.m4a" }    // ← Simplified audio format
	 *   }
	 * }
	 *
	 * This gets sent to: await createMemoryPin(backendData, setUploadProgress);
	 *
	 * @throws {Error} Implicitly when coordinates are missing - latitude/longitude default to 0
	 * @see {@link CreateMemoryRequest} for complete backend interface
	 * @see {@link createMemoryPin} for API submission function
	 * @see {@link handleConfirmSave} for usage in save workflow
	 */
	const createBackendMemoryData = (): CreateMemoryRequest => {
		console.log('Creating backend data with coordinates:', coordinates);
		return {
			name: memoryTitle.trim(),
			description: memoryDescription.trim(),
			latitude: coordinates?.latitude || 0,
			longitude: coordinates?.longitude || 0,
			location_query: locationQuery.trim(),
			visibility: selectedVisibility,
			social_circle_ids: selectedSocialCircles,
			media: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri ? { uri: audioUri } : null,
			},
		};
	};

	// ==================================
	//   MEMORY PREVIEW & SAVE HANDLERS
	// ==================================
	/**
	 * Show the memory preview modal before final submission
	 *
	 * LAYMAN TERMS: "When user taps 'Preview Memory', check if they filled out
	 * the required stuff, then show them exactly how their memory will look
	 * before they post it for real."
	 *
	 * This is like a "final check" before submitting - shows them their title,
	 * location, description, photos, and who can see it.
	 *
	 * TECHNICAL: Validates form content and displays preview modal with complete
	 * memory data and confirmation actions
	 *
	 * @function handlePreviewMemory
	 *
	 * @example
	 * User taps "Preview Memory" button
	 * <Button onPress={handlePreviewMemory}>Preview Memory</Button>
	 *
	 * If validation fails:
	 * → Shows error popup: "Please add a title for your memory"
	 * → Function exits early, no preview shown
	 *
	 * If validation passes:
	 * → Creates complete memory package
	 * → Shows preview modal with "Edit" and "Confirm & Post" buttons
	 * → User can review everything before final submission
	 *
	 * @see {@link validateContent} for validation logic
	 * @see {@link createMemoryData} for memory package creation
	 * @see {@link handleConfirmSave} for final save workflow
	 */
	const handlePreviewMemory = () => {
		if (!validateContent()) {
			return; // Hook handles showing the error modal
		}

		const memoryData = createMemoryData();
		setPreviewData(memoryData);

		setModalState({
			show: true,
			type: 'preview',
			title: 'Preview Your Memory',
			message: '',
			actions: [
				{
					text: 'Edit',
					onPress: hideModal,
					style: 'secondary',
				},
				{
					text: 'Confirm & Post',
					onPress: handleConfirmSave,
					style: 'primary',
				},
			],
		});
	};
	/**
	 * Execute the final save workflow with backend submission
	 *
	 * LAYMAN TERMS: "When user taps 'Confirm & Post', this actually saves their
	 * memory to the database. Shows progress bar while uploading photos/videos,
	 * then shows success message when done."
	 *
	 * Currently in TESTING_MODE which means it just pretends to save and shows
	 * you what would be sent to the database without actually sending it.
	 *
	 * TECHNICAL: Async save handler managing upload progress, error states,
	 * and success/failure workflows. Includes testing mode for development.
	 *
	 * @async
	 * @function handleConfirmSave
	 *
	 * @example
	 * Save workflow progression:
	 *
	 * 1. User taps "Confirm & Post"
	 * 2. Shows loading state: "Saving..." with progress bar
	 * 3. Creates two data formats:
	 *     - Frontend format (for success message display)
	 *     - Backend format (for API submission)
	 *
	 * 4. If TESTING_MODE = true:
	 *     → Simulates 1-second delay
	 *     → Logs both data formats to console
	 *     → Shows success message
	 *
	 * 5. If TESTING_MODE = false:
	 *     → Actually calls createMemoryPin(backendData)
	 *     → Shows real upload progress
	 *     → Handles real API errors
	 *
	 * @throws {Error} Catches and handles all save errors via handleSaveError
	 * @see {@link createMemoryData} for frontend format creation
	 * @see {@link createBackendMemoryData} for API format creation
	 * @see {@link createMemoryPin} for actual API submission
	 * @see {@link handleSaveSuccess} for success workflow
	 * @see {@link handleSaveError} for error handling
	 */
	const handleConfirmSave = async () => {
		const TESTING_MODE = true;

		setIsSaving(true);
		setUploadProgress({
			total: 0,
			completed: 0,
			currentFile: 'Preparing...',
			percentage: 0,
		});

		try {
			const memoryData = createMemoryData();
			const backendData = createBackendMemoryData();

			if (TESTING_MODE) {
				console.log('Testing mode: Simulating save...');

				const totalFiles = selectedMedia.length + (audioUri ? 1 : 0);
				setUploadProgress({
					total: totalFiles,
					completed: totalFiles,
					currentFile: 'Complete',
					percentage: 100,
				});

				await new Promise((resolve) => setTimeout(resolve, 1000));

				console.log('Frontend data:', memoryData);
				console.log('Backend payload:', backendData);
				console.log('✅ Test save completed');

				const result = {
					success: true,
					data: {
						id: `test-${Date.now()}`,
						name: backendData.name,
					},
				};

				handleSaveSuccess(memoryData, result);
			} else {
				const result = await createMemoryPin(
					backendData,
					setUploadProgress
				);

				if (result.success) {
					console.log('Memory saved:', result.data);
					handleSaveSuccess(memoryData, result);
				} else {
					handleSaveError('result.error');
				}
			}
		} catch (error) {
			console.error('Save error:', error);
			handleSaveError('Unexpected error occurred');
		} finally {
			setIsSaving(false);
			setUploadProgress(null);
		}
	};
	/**
	 * Handle successful memory save with celebration and next actions
	 *
	 * LAYMAN TERMS: "When the memory successfully saves, hide the preview popup
	 * and show a green 'Success!' popup with options to view the memory on the
	 * map or create another one."
	 *
	 * TECHNICAL: Success handler managing modal transitions and user navigation
	 * options post-save
	 *
	 * @function handleSaveSuccess
	 * @param {MemoryData} memoryData - Frontend memory object for display info
	 * @param {any} result - API response object with save confirmation
	 *
	 * @example
	 * Called after successful save with:
	 * handleSaveSuccess(memoryData, { success: true, data: { id: "123" } });
	 *
	 * Shows success popup with:
	 * Title: "Memory Posted!"
	 * Message: '"Best coffee ever" posted to Patricia Coffee Brewers, Melbourne'
	 * Buttons: [View on Map] [Create Another]
	 */
	const handleSaveSuccess = (memoryData: MemoryData, result: any) => {
		hideModal();
		showModal(
			'success',
			'Memory Posted!',
			`"${memoryData.content.title}" posted to ${memoryData.location.query}`,
			[
				{
					text: 'View on Map',
					onPress: () => {
						hideModal();
						navigateToWorldMap();
					},
					style: 'primary',
				},
				{
					text: 'Create Another',
					onPress: resetForm,
					style: 'secondary',
				},
			]
		);
	};
	/**
	 * Handle save errors with user-friendly error messaging
	 *
	 * LAYMAN TERMS: "When something goes wrong saving the memory, show a red
	 * error popup explaining what happened and give them a 'Try Again' button."
	 *
	 * TECHNICAL: Error handler displaying user-friendly error modal with retry option
	 *
	 * @function handleSaveError
	 * @param {string} error - Error message to display to user
	 *
	 * @example
	 * Different error scenarios:
	 * handleSaveError('Network connection failed');
	 * handleSaveError('File too large to upload');
	 * handleSaveError('Something went wrong. Please try again.');
	 *
	 * All show red error popup with "Try Again" button
	 */
	const handleSaveError = (error: string) => {
		showModal(
			'error',
			'Save Failed',
			error || 'Something went wrong. Please try again.',
			[{ text: 'Try Again', onPress: hideModal, style: 'primary' }]
		);
	};
	/**
	 * Reset the entire form to start creating a new memory
	 *
	 * LAYMAN TERMS: "Clear out everything the user entered so they can start
	 * fresh on a new memory. Like hitting a 'Clear All' button that wipes
	 * the title, description, location, photos, privacy settings - everything."
	 *
	 * TECHNICAL: Complete form state reset function coordinating with all hooks
	 * to return component to initial state
	 *
	 * @function resetForm
	 *
	 * @example
	 *  Called when user taps "Create Another" after successful save
	 *  or when they want to start over
	 *
	 * resetForm();
	 *
	 *  Result: All fields empty, back to default privacy settings,
	 *  no photos/videos/audio, ready for new memory creation
	 *
	 * @see {@link resetContent} from useMemoryContent hook
	 * @see {@link resetMedia} from useMediaCapture hook
	 * @see {@link resetPrivacySettings} from usePrivacySettings hook
	 */
	const resetForm = () => {
		hideModal();
		setMemoryTitle('');
		setMemoryDescription('');
		resetContent();
		resetMedia();
		resetPrivacySettings();
		setPreviewData(null);
	};

	// ====================
	//   MODAL COMPONENTS
	// ====================
	/**
	 * Render full-screen image preview modal
	 *
	 * LAYMAN TERMS: "When user taps a photo thumbnail in the preview, show that
	 * photo full-screen so they can see it clearly. Just the photo with a Close button."
	 *
	 * TECHNICAL: Conditional render function for image preview modal using previewImageUri state
	 *
	 * @function renderImagePreviewModal
	 * @returns {JSX.Element | null} Image preview modal or null if no image selected
	 */
	const renderImagePreviewModal = () => {
		if (!previewImageUri) return null;

		return (
			<View style={styles.imagePreviewContainer}>
				<Image
					source={{ uri: previewImageUri }}
					style={styles.fullImagePreview}
					resizeMode="contain"
				/>
			</View>
		);
	};
	/**
	 * Render complete memory preview modal content
	 *
	 * LAYMAN TERMS: "Show the user exactly how their memory will look when posted.
	 * Displays the title, location, description, privacy settings, social circles,
	 * and media thumbnails all nicely formatted like a final preview."
	 *
	 * This is like a 'print preview' for their memory - they can see everything
	 * before deciding to actually post it.
	 *
	 * TECHNICAL: Complex preview modal render function displaying complete MemoryData
	 * with conditional sections and interactive media thumbnails
	 *
	 * @function renderPreviewModal
	 * @returns {JSX.Element | null} Preview modal content or null if no preview data
	 *
	 * @example
	 *  Shows structured preview with sections:
	 *  - Header: Title, location pin, timestamp
	 *  - Description: (if provided)
	 *  - PrivacySettings: Who can see it + social circles
	 *  - Media: Photo thumbnails, video count, audio indicator
	 *  - Footer: Instructions for user
	 */
	const renderPreviewModal = () => {
		if (!previewData) return null;

		return (
			<ScrollView style={styles.previewScrollView}>
				<View style={styles.previewContainer}>
					{/* Header */}
					<View style={styles.previewHeader}>
						<HeaderText align="center" style={styles.previewTitle}>
							{previewData?.content?.title || 'Untitled Memory'}
						</HeaderText>
						<CaptionText
							align="center"
							style={styles.previewLocation}
						>
							📍{' '}
							{previewData?.location?.query || 'Unknown Location'}
						</CaptionText>
						<CaptionText
							align="center"
							style={styles.previewTimestamp}
						>
							{previewData?.timestamp
								? new Date(
										previewData.timestamp
								  ).toLocaleString()
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
								{getSelectedSocialCircles().map((circle) => (
									<View
										key={circle.id}
										style={[
											styles.socialCirclePreviewItem,
											{ borderLeftColor: circle.color },
										]}
									>
										<BodyText
											style={styles.socialCircleName}
										>
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

							{/* OPTIONAL: Add just one thumbnail row for photos if you want minimal preview */}
							{previewData.media.photos.length > 0 && (
								<View style={styles.simplePhotoPreview}>
									{previewData.media.photos
										.slice(0, 3)
										.map((photo, index) => (
											<TouchableOpacity
												key={index}
												style={
													styles.simplePhotoThumbnail
												}
												onPress={() =>
													showImagePreview(photo.uri)
												}
											>
												<Image
													source={{ uri: photo.uri }}
													style={
														styles.simpleThumbImage
													}
													resizeMode="cover"
												/>
											</TouchableOpacity>
										))}
									{previewData.media.photos.length > 3 && (
										<View
											style={styles.morePhotosIndicator}
										>
											<CaptionText
												style={styles.morePhotosText}
											>
												+
												{previewData.media.photos
													.length - 3}
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
	/**
	 * Master modal renderer - shows the appropriate modal based on current state
	 *
	 * LAYMAN TERMS: "This is the 'modal controller' that looks at what type of
	 * popup should be showing and displays the right one. Could be an error popup,
	 * success popup, preview popup, image popup, etc."
	 *
	 * TECHNICAL: Centralized modal render function with conditional content
	 * based on modalState.type and comprehensive action button handling
	 *
	 * @function renderModal
	 * @returns {JSX.Element | null} Current modal or null if no modal should show
	 *
	 * @example
	 * Different modal types handled:
	 * - 'preview': Shows renderPreviewModal()
	 * - 'imagePreview': Shows renderImagePreviewModal()
	 * - 'success': Shows green SuccessMessage
	 * - 'error': Shows red ErrorMessage
	 * - 'permission': Shows yellow WarningMessage
	 * - 'info': Shows blue InfoMessage
	 */
	const renderModal = () => {
		if (!modalState.show) return null;

		return (
			<Modal isVisible={modalState.show} onBackdropPress={hideModal}>
				<Modal.Container>
					<Modal.Header title={modalState.title} />
					<Modal.Body>
						{modalState.type === 'preview' && renderPreviewModal()}
						{modalState.type === 'imagePreview' &&
							renderImagePreviewModal()}
						{modalState.type === 'success' && (
							<SuccessMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</SuccessMessage>
						)}
						{modalState.type === 'error' && (
							<ErrorMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</ErrorMessage>
						)}
						{modalState.type === 'permission' && (
							<WarningMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</WarningMessage>
						)}
						{modalState.type === 'info' && (
							<InfoMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</InfoMessage>
						)}
					</Modal.Body>

					{modalState.actions && modalState.actions.length > 0 && (
						<Modal.Footer>
							{modalState.actions.map((action, index) => (
								<Button
									key={index}
									onPress={action.onPress}
									style={[
										styles.modalButton,
										action.style === 'primary' &&
											styles.primaryModalButton,
										action.style === 'secondary' &&
											styles.secondaryModalButton,
										action.style === 'danger' &&
											styles.dangerModalButton,
									]}
									variant={
										action.style === 'primary'
											? 'primary'
											: action.style === 'danger'
											? 'danger'
											: 'secondary'
									}
								>
									{action.text}
								</Button>
							))}
						</Modal.Footer>
					)}
				</Modal.Container>
			</Modal>
		);
	};

	// ============================
	//   MAIN COMPONENT RENDER
	// ============================
	/**
	 * Main component render - builds the complete Create Memory Pin screen UI
	 *
	 * LAYMAN TERMS: "This is where we actually build the screen the user sees.
	 * It's like assembling a car - we take all the parts (components) we've
	 * prepared and put them together in the right order to make a complete
	 * working screen."
	 *
	 * The screen flows logically from top to bottom:
	 * 1. Header with title
	 * 2. Scrollable form content (location, privacy, title, description, media)
	 * 3. Footer with navigation buttons
	 * 4. Popup system (invisible until needed)
	 *
	 * TECHNICAL: JSX render return combining layout components, form sections,
	 * and modal system into complete user interface with proper data flow
	 *
	 * @returns {JSX.Element} Complete CreatePin screen interface
	 */
	return (
		<View style={styles.container}>
			{/* ==================== */}
			{/*   HEADER SECTION     */}
			{/* ==================== */}
			<Header
				title="Create Memory Pin"
				subtitle="Capture this moment forever"
			/>
			{/* ==================== */}
			{/*   MAIN FORM CONTENT  */}
			{/* ==================== */}
			<MainContent keyboardShouldPersistTaps="handled">
				{/* ======================== */}
				{/*   LOCATION SELECTION     */}
				{/* ======================== */}
				<LocationSelector
					value={locationQuery}
					onChange={setLocationQuery}
					inputRef={locationInputRef}
					onCoordinateChange={handleCoordinateChange}
					required={true}
				/>
				{/* ======================== */}
				{/*   PRIVACY SETTINGS       */}
				{/* ======================== */}
				<VisibilitySelector
					selectedVisibility={selectedVisibility}
					onSelect={handleVisibilitySelect}
					isSelected={isVisibilitySelected}
					description={getVisibilityDescription()}
				/>
				<SocialCircleSelector
					userSocialCircles={userSocialCircles}
					selectedSocialCircles={selectedSocialCircles}
					onToggle={handleSocialCircleToggle}
					visible={
						// NOTE: Show only when SOCIAL is selected
						showSocialDropdown && isVisibilitySelected('social')
					}
				/>
				{/* ======================== */}
				{/*   MEMORY CONTENT         */}
				{/* ======================== */}
				<View style={styles.section}>
					<LabelText style={styles.sectionLabel}>
						What happened here?
					</LabelText>

					<Input
						ref={titleInputRef}
						label="Memory Title"
						placeholder="Give this memory a title..."
						value={memoryTitle}
						onChangeText={setMemoryTitle}
						style={styles.fullWidth}
						required={true}
					/>

					<Input
						ref={descriptionInputRef}
						label="Tell the story"
						placeholder="Describe what made this moment special..."
						value={memoryDescription}
						onChangeText={setMemoryDescription}
						style={styles.fullWidth}
						multiline={true}
						numberOfLines={4}
						textAlignVertical="top"
						required={true}
					/>
				</View>

				{/* ======================== */}
				{/*   MEDIA CAPTURE          */}
				{/* ======================== */}
				<MediaCapture
					selectedMedia={selectedMedia}
					audioUri={audioUri}
					isRecording={isRecording}
					isPlayingAudio={isPlayingAudio}
					onCameraPress={handleCameraPress}
					onAudioPress={handleAudioPress}
					onRemoveMedia={removeMedia}
					onRemoveAudio={removeAudio}
					onPlayAudio={playRecording}
					onStopAudio={stopPlayback}
					onImagePreview={showImagePreview}
					mediaSummary={getMediaSummary()}
				/>
			</MainContent>

			{/* ==================== */}
			{/*   FOOTER SECTION     */}
			{/* ==================== */}
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
							onPress={handlePreviewMemory}
							style={styles.previewButton}
							variant="primary"
							disabled={!hasValidContent}
						>
							Preview Memory
						</Button>
					</View>
				</View>
			</Footer>
			{/* ==================== */}
			{/*   MODAL SYSTEM       */}
			{/* ==================== */}
			{renderModal()}
		</View>
	);
}

// ===============
//   STYLE SHEET
// ===============
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},
	fullWidth: {
		width: '100%',
	},
	buttonContainer: {
		width: '100%',
		gap: 10,
	},
	navigationRow: {
		flexDirection: 'row',
		gap: 12,
	},
	backButton: {
		flex: 1,
		backgroundColor: ReMapColors.primary.cadet,
	},
	previewButton: {
		backgroundColor: ReMapColors.primary.violet,
		flex: 3,
	},

	// Modal Styles
	modalButton: {
		width: 150,
	},
	primaryModalButton: {
		backgroundColor: ReMapColors.primary.violet,
	},
	secondaryModalButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},
	dangerModalButton: {
		backgroundColor: ReMapColors.semantic.error,
	},

	// Preview MODAL
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
