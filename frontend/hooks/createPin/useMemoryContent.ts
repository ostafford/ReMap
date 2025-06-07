// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';

// ==================
// TYPE DEFINITIONS
// ==================

/**
 * Return interface for useMemoryContent hook
 *
 * LAYMAN TERMS: "This is the contract that defines everything this hook
 * gives back to the component that uses it. Like a receipt that lists
 * all the functions and data you get when you 'buy' this hook."
 *
 * TECHNICAL: Comprehensive interface defining all state, handlers, refs,
 * and computed properties returned by the useMemoryContent hook
 *
 * @interface UseMemoryContentReturn
 */
interface UseMemoryContentReturn {
	memoryTitle: string;
	setMemoryTitle: (title: string) => void;

	locationQuery: string;
	setLocationQuery: (query: string) => void;

	memoryDescription: string;
	setMemoryDescription: (description: string) => void;

	/**
	 * LAYMAN TERMS: "References to the actual input fields for focusing"
	 *
	 * TECHNICAL: React refs for programmatic input focus management
	 */
	locationInputRef: React.RefObject<any>;
	titleInputRef: React.RefObject<any>;
	descriptionInputRef: React.RefObject<any>;

	validateContent: () => boolean;
	resetContent: () => void;

	/**
	 * LAYMAN TERMS: "Quick check: is the form ready to submit?"
	 *
	 * TECHNICAL: Computed boolean indicating minimum required content completion
	 */
	hasValidContent: boolean;

	/**
	 * LAYMAN TERMS: "GPS coordinates from the mini-map (or null if none yet)"
	 *
	 * TECHNICAL: Coordinate state object with latitude, longitude, and address
	 */
	coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	} | null;

	/**
	 * LAYMAN TERMS: "Function called when user moves the map pin"
	 *
	 * TECHNICAL: Coordinate update handler for map interaction
	 */
	handleCoordinateChange: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

/**
 * Props interface for useMemoryContent hook
 *
 * LAYMAN TERMS: "What the hook needs from the component to work properly.
 * In this case, just a function to show error popups."
 *
 * TECHNICAL: Hook dependency interface defining required external functions
 *
 * @interface UseMemoryContentProps
 */
interface UseMemoryContentProps {
	/**
	 * LAYMAN TERMS: "Function to show popups for errors, info, or success messages"
	 *
	 * TECHNICAL: Modal display function for user feedback
	 */
	showModal: (
		type: 'error' | 'info' | 'success',
		title: string,
		message: string
	) => void;
}

// =============================
// CUSTOM HOOK IMPLEMENTATION
// =============================

/**
 * Custom hook for managing memory content state and validation
 *
 * LAYMAN TERMS: "This hook is like a smart assistant for handling everything
 * related to the memory's text content (title, description, location) and
 * the mini-map coordinates. It keeps track of what the user types, validates
 * that they filled out the required stuff, and provides functions to reset
 * everything."
 *
 * Think of it as the "content manager" - it doesn't care about photos or
 * privacy settings, just the core text content and location of the memory.
 *
 * TECHNICAL: Custom React hook encapsulating memory content state management,
 * validation logic, coordinate handling, and form completion tracking.
 * Provides clean interface for text input management and location integration.
 *
 * @hook useMemoryContent
 * @param {UseMemoryContentProps} props - Hook configuration object
 * @param {Function} props.showModal - Modal display function for error handling
 * @returns {UseMemoryContentReturn} Complete content management interface
 *
 * @example
 * In CreatePin component:
 * const memoryContent = useMemoryContent({ showModal });
 *
 * const {
 *   memoryTitle,
 *   setMemoryTitle,
 *   validateContent,
 *   hasValidContent,
 *   coordinates
 * } = memoryContent;
 *
 * In JSX:
 * <Input
 *   value={memoryTitle}
 *   onChangeText={setMemoryTitle}
 *   placeholder="Enter memory title..."
 * />
 *
 * Before saving:
 * if (!validateContent()) {
 *   return; // Hook shows error modal automatically
 * }
 *
 * @see {@link LocationSelector} for location input component integration
 * @see {@link MiniMap} for coordinate selection functionality
 */
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
	/**
	 * LAYMAN TERMS: "References to the actual input fields so we can focus them"
	 *
	 * TECHNICAL: React refs for programmatic input field focus management
	 */
	const titleInputRef = useRef<any>(null);
	const locationInputRef = useRef<any>(null);
	const descriptionInputRef = useRef<any>(null);

	// ======================
	// COORDINATE HANDLERS
	// ======================

	/**
	 * Handle coordinate updates from mini-map interaction
	 *
	 * LAYMAN TERMS: "When the user drags the pin on the mini-map, this function
	 * saves the new GPS coordinates and logs them for debugging"
	 *
	 * TECHNICAL: Memoized coordinate update handler with debug logging
	 *
	 * @function handleCoordinateChange
	 * @param {Object} coords - Coordinate object from map interaction
	 * @param {number} coords.latitude - GPS latitude value
	 * @param {number} coords.longitude - GPS longitude value
	 * @param {string} coords.address - Human-readable address string
	 *
	 * @example
	 * Called by MiniMap component when user drags pin:
	 * handleCoordinateChange({
	 *   latitude: -37.8154,
	 *   longitude: 144.9636,
	 *   address: "Patricia Coffee Brewers, Melbourne"
	 * });
	 */
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

	/**
	 * Validate that required content fields are completed
	 *
	 * LAYMAN TERMS: "Check if the user filled out the required stuff (title and
	 * location). If not, show them a red error popup explaining what's missing.
	 * Returns true if everything is good, false if something is missing."
	 *
	 * TECHNICAL: Content validation function with modal error feedback.
	 * Checks required fields and displays user-friendly error messages.
	 *
	 * @function validateContent
	 * @returns {boolean} True if validation passes, false if required fields missing
	 *
	 * @example
	 * Before showing preview:
	 * if (!validateContent()) {
	 *   return; // Hook automatically shows error modal
	 * }
	 *
	 * If we get here, validation passed
	 * showPreviewModal();
	 */
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

	/**
	 * Reset all content fields to empty state
	 *
	 * LAYMAN TERMS: "Clear out all the text fields and coordinates like hitting
	 * a 'Clear All' button. Used when starting a new memory or canceling."
	 *
	 * TECHNICAL: Complete content state reset function for form cleanup
	 *
	 * @function resetContent
	 *
	 * @example
	 * When user taps "Create Another" after successful save:
	 * resetContent();
	 *
	 * Result: All text fields empty, no coordinates, ready for new memory
	 */
	const resetContent = useCallback(() => {
		setMemoryTitle('');
		setMemoryDescription('');
		setLocationQuery('');
		setCoordinates(null);
	}, []);

	// ======================
	// COMPUTED PROPERTIES
	// ======================

	/**
	 * LAYMAN TERMS: "Quick check: did they fill out the minimum required stuff?"
	 *
	 * TECHNICAL: Computed boolean for minimum form completion (title + location)
	 */
	const hasValidContent =
		memoryTitle.trim() !== '' &&
		locationQuery.trim() !== '' &&
		memoryDescription.trim() !== '';

	// =======================
	// RETURN HOOK INTERFACE
	// =======================

	/**
	 * LAYMAN TERMS: "Give back everything the component needs to work with content"
	 *
	 * TECHNICAL: Return all state, handlers, refs, and computed properties
	 */
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

/**
 * Type alias for the complete hook return type
 *
 * LAYMAN TERMS: "Shortcut type name for other files that want to reference
 * what this hook returns"
 *
 * TECHNICAL: Type alias for external type definitions and component props
 */
export type MemoryContentHook = ReturnType<typeof useMemoryContent>;

/**
 * Default export for easier importing
 *
 * LAYMAN TERMS: "Make it easy to import this hook with different syntax"
 *
 * TECHNICAL: Default export enabling both named and default import patterns
 */
export default useMemoryContent;
