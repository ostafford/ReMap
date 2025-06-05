import { useState, useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface UseMemoryContentReturn {
	// Core content state
	memoryTitle: string;
	setMemoryTitle: (title: string) => void;
	memoryDescription: string;
	setMemoryDescription: (description: string) => void;
	locationQuery: string;
	setLocationQuery: (query: string) => void;

	// Input focus management
	activeInputId: string | null;

	// Input refs for scroll management
	locationInputRef: React.RefObject<any>;
	titleInputRef: React.RefObject<any>;
	descriptionInputRef: React.RefObject<any>;

	// Validation and utility functions
	validateContent: () => boolean;
	resetContent: () => void;

	// Computed properties
	hasValidContent: boolean;
	contentSummary: {
		hasTitle: boolean;
		hasDescription: boolean;
		hasLocation: boolean;
		completionPercentage: number;
	};

	// Coordinates for the minimap
	coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	} | null;
	handleCoordinateChange: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

interface UseMemoryContentProps {
	showModal: (
		type: 'error' | 'info' | 'success',
		title: string,
		message: string
	) => void;
}

// ==========================================
// CUSTOM HOOK IMPLEMENTATION
// ==========================================
export function useMemoryContent({
	showModal,
}: UseMemoryContentProps): UseMemoryContentReturn {
	// ==========================================
	// STATE MANAGEMENT
	// ==========================================
	const [memoryTitle, setMemoryTitle] = useState('');
	const [memoryDescription, setMemoryDescription] = useState('');
	const [locationQuery, setLocationQuery] = useState('');
	const [activeInputId, setActiveInputId] = useState<string | null>(null);
	const [coordinates, setCoordinates] = useState<{
		latitude: number;
		longitude: number;
		address: string;
	} | null>(null);

	// ==========================================
	// REFS FOR INPUT MANAGEMENT
	// ==========================================
	const locationInputRef = useRef<any>(null);
	const titleInputRef = useRef<any>(null);
	const descriptionInputRef = useRef<any>(null);

	// ==========================================
	// INPUT FOCUS HANDLERS
	// ==========================================

	const handleCoordinateChange = useCallback(
		(coords: { latitude: number; longitude: number; address: string }) => {
			setCoordinates(coords);
			console.log('📍 Coordinates updated:', coords); // Debug log
		},
		[]
	);

	const handleInputFocus = useCallback(
		(inputRef: React.RefObject<any>, inputId: string) => {
			setActiveInputId(inputId);
			// MainContent handles scrolling automatically
		},
		[]
	);

	const handleInputBlur = useCallback(() => {
		setActiveInputId(null);
	}, []);

	// ==========================================
	// VALIDATION LOGIC
	// ==========================================
	const validateContent = useCallback((): boolean => {
		// Check for title
		if (!memoryTitle.trim()) {
			showModal(
				'error',
				'Missing Title',
				'Please add a title for your memory before previewing.'
			);
			return false;
		}

		// Check for location
		if (!locationQuery.trim()) {
			showModal(
				'error',
				'Missing Location',
				'Please add a location for your memory before previewing.'
			);
			return false;
		}

		return true;
	}, [memoryTitle, locationQuery, showModal]);

	// ==========================================
	// UTILITY FUNCTIONS
	// ==========================================
	const resetContent = useCallback(() => {
		setMemoryTitle('');
		setMemoryDescription('');
		setLocationQuery('');
		setCoordinates(null);
		setActiveInputId(null);
	}, []);

	// ==========================================
	// COMPUTED PROPERTIES
	// ==========================================
	const hasValidContent =
		memoryTitle.trim() !== '' && locationQuery.trim() !== '';

	const contentSummary = {
		hasTitle: memoryTitle.trim() !== '',
		hasDescription: memoryDescription.trim() !== '',
		hasLocation: locationQuery.trim() !== '',
		completionPercentage: Math.round(
			([
				memoryTitle.trim() !== '',
				memoryDescription.trim() !== '',
				locationQuery.trim() !== '',
			].filter(Boolean).length /
				3) *
				100
		),
	};

	// ==========================================
	// RETURN HOOK INTERFACE
	// ==========================================
	return {
		// Core state
		memoryTitle,
		setMemoryTitle,
		memoryDescription,
		setMemoryDescription,
		locationQuery,
		setLocationQuery,

		// Coordinates for the minimap
		coordinates,
		handleCoordinateChange,

		// Input management
		activeInputId,
		locationInputRef,
		titleInputRef,
		descriptionInputRef,

		// Validation & utility
		validateContent,
		resetContent,

		// Computed properties
		hasValidContent,
		contentSummary,
	};
}

// ==========================================
// HELPER TYPES FOR EXTERNAL USE
// ==========================================
export type MemoryContentHook = ReturnType<typeof useMemoryContent>;

// Default export for easier importing
export default useMemoryContent;
