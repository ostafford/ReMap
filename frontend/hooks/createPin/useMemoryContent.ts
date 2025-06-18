// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useRef } from 'react';

// ==================
// TYPE DEFINITIONS
// ==================

interface UseMemoryContentReturn {
	// Memory content fields
	memoryTitle: string;
	setMemoryTitle: (title: string) => void;
	memoryDescription: string;
	setMemoryDescription: (description: string) => void;

	// Location fields
	locationQuery: string;
	setLocationQuery: (query: string) => void;
	coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	} | null;
	updateCoordinatesFromLocationSelector: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;

	// Input management references
	locationInputRef: React.RefObject<any>;
	titleInputRef: React.RefObject<any>;
	descriptionInputRef: React.RefObject<any>;

	// Form validation and utilities
	validateMemoryContent: () => boolean;
	resetMemoryContent: () => void;
	hasValidMemoryContent: boolean;
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
	// STATE MANAGEMENT:
	// ==================
	const [memoryTitle, setMemoryTitle] = useState('');
	const [memoryDescription, setMemoryDescription] = useState('');

	// Location state: Only store final results
	const [locationQuery, setLocationQuery] = useState('');
	const [coordinates, setCoordinates] = useState<{
		latitude: number;
		longitude: number;
		address: string;
	} | null>(null);

	// ===========================
	// REFS FOR INPUT MANAGEMENT
	// ===========================
	const titleInputRef = useRef<any>(null);
	const locationInputRef = useRef<any>(null);
	const descriptionInputRef = useRef<any>(null);

	// ======================
	// COORDINATE HANDLERS:
	// ======================

	// Receive final coordinates from LocationSelector (which gets them from useLocationManager)
	const updateCoordinatesFromLocationSelector = useCallback(
		(coords: { latitude: number; longitude: number; address: string }) => {
			setCoordinates(coords);
			console.log('📍 Final coordinates for memory:', coords);
		},
		[]
	);

	// ===================
	// VALIDATION LOGIC:
	// ===================

	// just returns true/false (for button disabled state)
	const checkValidation = useCallback((): boolean => {
		return (
			memoryTitle.trim() !== '' &&
			locationQuery.trim() !== '' &&
			coordinates !== null &&
			memoryDescription.trim() !== ''
		);
	}, [memoryTitle, locationQuery, coordinates, memoryDescription]);

	// only call when user tries to submit
	const validateMemoryContent = useCallback((): boolean => {
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

		// Check coordinates (ensure location was properly geocoded)
		if (!coordinates) {
			showModal(
				'error',
				'Location Not Found',
				'Please select a valid location or try a different search term.'
			);
			return false;
		}

		if (!memoryDescription.trim()) {
			showModal(
				'error',
				'Missing Description',
				'Please add a description for your memory before previewing.'
			);
			return false;
		}

		return true;
	}, [memoryTitle, locationQuery, coordinates, memoryDescription, showModal]);

	// ====================
	// UTILITY FUNCTIONS
	// ====================

	const resetMemoryContent = useCallback(() => {
		setMemoryTitle('');
		setMemoryDescription('');
		setLocationQuery('');
		setCoordinates(null);
	}, []);

	// ======================
	// COMPUTED PROPERTIES:
	// ======================

	// const hasValidMemoryContent =
	// 	memoryTitle.trim() !== '' &&
	// 	locationQuery.trim() !== '' &&
	// 	coordinates !== null &&
	// 	memoryDescription.trim() !== '';

	// console.log('Memory validation check:', {
	// 	title: !!memoryTitle.trim(),
	// 	location: !!locationQuery.trim(),
	// 	coordinates: !!coordinates,
	// 	description: !!memoryDescription.trim(),
	// });

	// =======================
	// RETURN HOOK INTERFACE:
	// =======================

	return {
		// Memory content state
		memoryTitle,
		setMemoryTitle,
		memoryDescription,
		setMemoryDescription,

		// Location state
		locationQuery,
		setLocationQuery,
		coordinates,
		updateCoordinatesFromLocationSelector,

		// Input management (refs for focusing)
		locationInputRef,
		titleInputRef,
		descriptionInputRef,

		// Validation & utility functions
		validateMemoryContent,
		resetMemoryContent,

		// Computed properties
		hasValidMemoryContent: checkValidation(),
	};
}

// ================================
// HELPER TYPES FOR EXTERNAL USE
// ================================

export type MemoryContentHook = ReturnType<typeof useMemoryContent>;

export default useMemoryContent;
