// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';

// ==================
// TYPE DEFINITIONS
// ==================

interface UseMemoryContentReturn {
	memoryTitle: string;
	setMemoryTitle: (title: string) => void;

	locationQuery: string;
	setLocationQuery: (query: string) => void;

	memoryDescription: string;
	setMemoryDescription: (description: string) => void;

	locationInputRef: React.RefObject<any>;
	titleInputRef: React.RefObject<any>;
	descriptionInputRef: React.RefObject<any>;

	validateContent: () => boolean;
	resetContent: () => void;

	hasValidContent: boolean;

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

// =============================
// CUSTOM HOOK IMPLEMENTATION
// =============================

export function useMemoryContent({
	showModal,
}: UseMemoryContentProps): UseMemoryContentReturn {
	// ==================
	// STATE MANAGEMENT
	// ==================
	const [memoryTitle, setMemoryTitle] = useState('');
	const [locationQuery, setLocationQuery] = useState('');
	const [coordinates, setCoordinates] = useState<{
		latitude: number;
		longitude: number;
		address: string;
	} | null>(null);
	const [memoryDescription, setMemoryDescription] = useState('');

	// ===========================
	// REFS FOR INPUT MANAGEMENT
	// ===========================

	const titleInputRef = useRef<any>(null);
	const locationInputRef = useRef<any>(null);
	const descriptionInputRef = useRef<any>(null);

	// ======================
	// COORDINATE HANDLERS
	// ======================

	const handleCoordinateChange = useCallback(
		(coords: { latitude: number; longitude: number; address: string }) => {
			setCoordinates(coords);
			console.log('📍 Coordinates updated:', coords); // Debug log for development
		},
		[]
	);

	// ===================
	// VALIDATION LOGIC
	// ===================

	const validateContent = useCallback((): boolean => {
		if (!memoryTitle.trim()) {
			showModal(
				'error',
				'Missing Title',
				'Please add a title for your memory before previewing.'
			);
			return false;
		}

		if (!locationQuery.trim()) {
			showModal(
				'error',
				'Missing Location',
				'Please add a location for your memory before previewing.'
			);
			return false;
		}

		if (!memoryDescription.trim()) {
			showModal(
				'error',
				'Missing Location',
				'Please add a description for your memory before previewing.'
			);
			return false;
		}

		return true;
	}, [memoryTitle, locationQuery, memoryDescription, showModal]);

	// ====================
	// UTILITY FUNCTIONS
	// ====================

	const resetContent = useCallback(() => {
		setMemoryTitle('');
		setMemoryDescription('');
		setLocationQuery('');
		setCoordinates(null);
	}, []);

	// ======================
	// COMPUTED PROPERTIES
	// ======================

	const hasValidContent =
		memoryTitle.trim() !== '' &&
		locationQuery.trim() !== '' &&
		memoryDescription.trim() !== '';

	// =======================
	// RETURN HOOK INTERFACE
	// =======================

	return {
		// Core content state
		memoryTitle,
		setMemoryTitle,
		memoryDescription,
		setMemoryDescription,
		locationQuery,
		setLocationQuery,

		// Coordinates for the minimap
		coordinates,
		handleCoordinateChange,

		// Input management (refs for focusing)
		locationInputRef,
		titleInputRef,
		descriptionInputRef,

		// Validation & utility functions
		validateContent,
		resetContent,

		// Computed properties
		hasValidContent,
	};
}

// ================================
// HELPER TYPES FOR EXTERNAL USE
// ================================

export type MemoryContentHook = ReturnType<typeof useMemoryContent>;

export default useMemoryContent;
