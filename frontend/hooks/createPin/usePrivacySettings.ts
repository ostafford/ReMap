// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useEffect } from 'react';

// ================================
//   SERVICE IMPORTS
// ================================
import { getUserSocialCircles } from '@/services/memoryService';
import { getTestSocialCircles } from '@/assets/dummySocialCircleData';

/**
 * LAYMAN TERMS: "Switch to control whether we use fake test data or real backend data"
 *
 * TECHNICAL: Feature flag for development vs production data sources
 */
const USE_TEST_DATA = true;

// ==================
// TYPE DEFINITIONS
// ==================

/**
 * Privacy visibility options available to users
 *
 * LAYMAN TERMS: "The three ways users can control who sees their memories:
 * - 'public' = Everyone on ReMap can see it
 * - 'social' = Only people in my friend groups can see it
 * - 'private' = Only I can see it"
 *
 * TECHNICAL: Union type defining available privacy visibility levels
 *
 * @typedef {'public' | 'social' | 'private'} VisibilityOption
 */
type VisibilityOption = 'public' | 'social' | 'private';

/**
 * Social circle data structure
 *
 * LAYMAN TERMS: "A friend group that users can share memories with.
 * Like 'Family', 'Work Friends', 'University Buddies', etc. Each group
 * has a name, member count, description, and color for easy recognition."
 *
 * TECHNICAL: Interface defining social circle object structure for
 * privacy sharing and group management functionality
 *
 * @interface SocialCircle
 */
interface SocialCircle {
	id: string;
	name: string;
	memberCount: number;
	description: string;
	color: string;
}

/**
 * Return interface for usePrivacySettings hook
 *
 * LAYMAN TERMS: "Everything this privacy hook gives back to components that use it.
 * Includes the current privacy choices, functions to change them, and helper
 * functions to understand what's selected."
 *
 * TECHNICAL: Comprehensive interface defining all state, handlers, and utilities
 * returned by the usePrivacySettings hook for privacy management
 *
 * @interface UsePrivacySettingsReturn
 */
interface UsePrivacySettingsReturn {
	selectedVisibility: VisibilityOption[];
	selectedSocialCircles: string[];
	showSocialDropdown: boolean;
	userSocialCircles: SocialCircle[];
	handleVisibilitySelect: (option: VisibilityOption) => void;
	handleSocialCircleToggle: (circleId: string) => void;
	isVisibilitySelected: (option: VisibilityOption) => boolean;
	getSelectedSocialCircles: () => SocialCircle[];
	getVisibilityDescription: () => string;
	resetPrivacySettings: () => void;
	/**
	 * LAYMAN TERMS: "Computed stats about current privacy selections"
	 * TECHNICAL: Object containing derived privacy state for UI feedback
	 */
	privacySummary: {
		isPublic: boolean;
		isSocial: boolean;
		isPrivate: boolean;
		socialCircleCount: number;
		totalSelected: string;
	};
}

// ============================
// CUSTOM HOOK IMPLEMENTATION
// ============================

/**
 * Custom hook for managing privacy settings and social circle selection
 *
 * LAYMAN TERMS: "This hook is like a privacy manager for memories. It handles
 * all the logic around who can see a user's memory. Users can choose multiple
 * privacy levels at once (like public AND specific friend groups), and the hook
 * manages all the complexity of making those choices work together smoothly."
 *
 * Key features:
 * - Multi-select privacy options (can pick public + social + private)
 * - Friend group management (load from backend, select multiple)
 * - Smart UI logic (social dropdown only shows when 'social' is selected)
 * - Validation (always have at least one privacy option selected)
 * - Description generation (creates human-readable privacy summaries)
 *
 * TECHNICAL: Custom React hook encapsulating privacy state management,
 * social circle integration, multi-select validation, and computed properties
 * for privacy UI components. Integrates with backend services for social circle data.
 *
 * @hook usePrivacySettings
 * @returns {UsePrivacySettingsReturn} Complete privacy management interface
 *
 * @example
 * In CreatePin component:
 * const privacySettings = usePrivacySettings();
 *
 * const {
 *   selectedVisibility,
 *   handleVisibilitySelect,
 *   getVisibilityDescription,
 *   selectedSocialCircles,
 *   userSocialCircles
 * } = privacySettings;
 *
 * In JSX:
 * <VisibilitySelector
 *   selectedVisibility={selectedVisibility}
 *   onSelect={handleVisibilitySelect}
 *   description={getVisibilityDescription()}
 * />
 *
 * Show social circles when 'social' is selected
 * {selectedVisibility.includes('social') && (
 *   <SocialCircleSelector
 *     userSocialCircles={userSocialCircles}
 *     selectedSocialCircles={selectedSocialCircles}
 *   />
 * )}
 *
 * @see {@link VisibilitySelector} for privacy button interface
 * @see {@link SocialCircleSelector} for friend group selection
 */
export function usePrivacySettings(): UsePrivacySettingsReturn {
	// ==================
	// STATE MANAGEMENT
	// ==================

	const [selectedVisibility, setSelectedVisibility] = useState<
		VisibilityOption[]
	>(['public']);
	const [selectedSocialCircles, setSelectedSocialCircles] = useState<
		string[]
	>([]);
	const [showSocialDropdown, setShowSocialDropdown] = useState(false);
	const [userSocialCircles, setUserSocialCircles] = useState<SocialCircle[]>(
		[]
	);

	// =============================
	// LOAD USER'S SOCIAL CIRCLES
	// =============================

	/**
	 * Load user's social circles from backend or test data on component mount
	 *
	 * LAYMAN TERMS: "When the component first loads, go fetch all the friend groups
	 * this user has created (like 'Family', 'Work Friends', etc.) so they can
	 * choose which ones to share their memory with."
	 *
	 * TECHNICAL: Effect hook managing async social circle data loading with
	 * feature flag support for development vs production data sources
	 */
	useEffect(() => {
		const loadUserSocialCircles = async () => {
			try {
				if (USE_TEST_DATA) {
					const circles = await getTestSocialCircles();
					setUserSocialCircles(circles);
				} else {
					// ATNN: This `else` statement is for backend
					const circles = await getUserSocialCircles();
					// setUserSocialCircles(circles);
				}
			} catch (error) {
				console.error('Failed to load social circles:', error);
				setUserSocialCircles([]);
			}
		};

		loadUserSocialCircles();
	}, []);

	// =====================
	// VISIBILITY HANDLERS
	// =====================

	/**
	 * Handle privacy option selection with multi-select and validation logic
	 *
	 * LAYMAN TERMS: "When user taps a privacy button (public/social/private),
	 * this function decides what to do. If they tap something already selected,
	 * it deselects it (unless it's the only one selected). If they tap 'social',
	 * it shows the friend groups. If they deselect 'social', it hides friend groups."
	 *
	 * TECHNICAL: Multi-select handler with validation preventing empty selection
	 * and conditional UI state management for social circle dropdown
	 *
	 * @function handleVisibilitySelect
	 * @param {VisibilityOption} option - The privacy option that was tapped
	 *
	 * @example
	 * User has ['public'] selected and taps 'social'
	 * handleVisibilitySelect('social');
	 * Result: selectedVisibility becomes ['public', 'social']
	 *          showSocialDropdown becomes true
	 *
	 * User has ['public', 'social'] and taps 'public' to deselect
	 * handleVisibilitySelect('public');
	 * Result: selectedVisibility becomes ['social']
	 *          showSocialDropdown stays true
	 *
	 * User has ['public'] and taps 'public' to deselect
	 * handleVisibilitySelect('public');
	 * Result: selectedVisibility stays ['public'] (can't deselect the only option)
	 */
	const handleVisibilitySelect = useCallback((option: VisibilityOption) => {
		setSelectedVisibility((prev) => {
			if (prev.includes(option)) {
				if (prev.length > 1) {
					const newVisibility = prev.filter(
						(item) => item !== option
					);

					if (option === 'social') {
						setShowSocialDropdown(false);
						setSelectedSocialCircles([]);
					}

					return newVisibility;
				}

				return prev;
			} else {
				const newVisibility = [...prev, option];

				if (option === 'social') {
					setShowSocialDropdown(true);
				}

				return newVisibility;
			}
		});
	}, []);

	/**
	 * Check if a specific privacy option is currently selected
	 *
	 * LAYMAN TERMS: "Quick way to check if a specific privacy option (like 'public')
	 * is currently selected. Used by UI components to show which buttons are active."
	 *
	 * TECHNICAL: Utility function for conditional rendering and styling in components
	 *
	 * @function isVisibilitySelected
	 * @param {VisibilityOption} option - The privacy option to check
	 * @returns {boolean} True if the option is currently selected
	 */
	const isVisibilitySelected = useCallback(
		(option: VisibilityOption): boolean => {
			return selectedVisibility.includes(option);
		},
		[selectedVisibility]
	);

	// ========================
	// SOCIAL CIRCLE HANDLERS
	// ========================

	/**
	 * Toggle selection of a specific social circle
	 *
	 * LAYMAN TERMS: "When user checks/unchecks a friend group checkbox, this
	 * function adds it to or removes it from the selected list. Simple toggle -
	 * if it's selected, deselect it; if it's not selected, select it."
	 *
	 * TECHNICAL: Simple toggle handler for social circle multi-select state
	 *
	 * @function handleSocialCircleToggle
	 * @param {string} circleId - The ID of the social circle to toggle
	 *
	 * @example
	 * User has ['family'] selected and clicks 'work_friends'
	 * handleSocialCircleToggle('work_friends');
	 * Result: selectedSocialCircles becomes ['family', 'work_friends']
	 *
	 * User has ['family', 'work_friends'] and clicks 'family' to deselect
	 * handleSocialCircleToggle('family');
	 * Result: selectedSocialCircles becomes ['work_friends']
	 */
	const handleSocialCircleToggle = useCallback((circleId: string) => {
		setSelectedSocialCircles((prev) => {
			if (prev.includes(circleId)) {
				return prev.filter((id) => id !== circleId);
			} else {
				return [...prev, circleId];
			}
		});
	}, []);

	/**
	 * Get full social circle objects for currently selected circle IDs
	 *
	 * LAYMAN TERMS: "The selected circles are stored as just IDs (like 'family',
	 * 'work_friends'), but sometimes we need the full information (name, color,
	 * member count). This function looks up the full details for selected circles."
	 *
	 * TECHNICAL: Utility function resolving selected IDs to full SocialCircle objects
	 * for display and processing purposes
	 *
	 * @function getSelectedSocialCircles
	 * @returns {SocialCircle[]} Array of full social circle objects for selected IDs
	 *
	 * @example
	 * selectedSocialCircles = ['family', 'work_friends']
	 * userSocialCircles = [
	 *   { id: 'family', name: 'Family', color: '#FF6B6B', memberCount: 5 },
	 *   { id: 'work_friends', name: 'Work Friends', color: '#4ECDC4', memberCount: 8 },
	 *   { id: 'university', name: 'University', color: '#45B7D1', memberCount: 12 }
	 * ]
	 *
	 * const selected = getSelectedSocialCircles();
	 * Result: [
	 *   { id: 'family', name: 'Family', color: '#FF6B6B', memberCount: 5 },
	 *   { id: 'work_friends', name: 'Work Friends', color: '#4ECDC4', memberCount: 8 }
	 * ]
	 */
	const getSelectedSocialCircles = useCallback((): SocialCircle[] => {
		return userSocialCircles.filter((circle) =>
			selectedSocialCircles.includes(circle.id)
		);
	}, [userSocialCircles, selectedSocialCircles]);

	// =======================
	// DESCRIPTION GENERATOR
	// =======================

	/**
	 * Generate human-readable description of current privacy settings
	 *
	 * LAYMAN TERMS: "Create a sentence that explains who can see this memory based
	 * on current selections. Like 'Visible to everyone in the ReMap community and
	 * visible to 3 selected social circles' or 'Kept private to you'."
	 *
	 * TECHNICAL: Dynamic string generator for privacy selection summary with
	 * conditional logic for different combination scenarios
	 *
	 * @function getVisibilityDescription
	 * @returns {string} Human-readable privacy settings description
	 *
	 * @example
	 * selectedVisibility = ['public', 'social']
	 * selectedSocialCircles = ['family', 'work_friends']
	 * const description = getVisibilityDescription();
	 * Result: "Visible to everyone in the ReMap community and visible to 2 selected social circle(s)"
	 *
	 * selectedVisibility = ['private']
	 * const description = getVisibilityDescription();
	 * Result: "Kept private to you"
	 *
	 * selectedVisibility = ['social']
	 * selectedSocialCircles = []
	 * const description = getVisibilityDescription();
	 * Result: "Visible to your social circles (none selected yet)"
	 */
	const getVisibilityDescription = useCallback((): string => {
		let description = '';

		if (selectedVisibility.includes('public')) {
			description += 'Visible to everyone in the ReMap community';
		}

		if (selectedVisibility.includes('social')) {
			if (description) description += ' and ';
			if (selectedSocialCircles.length > 0) {
				description += `visible to ${selectedSocialCircles.length} selected social circle(s)`;
			} else {
				description +=
					'visible to your social circles (none selected yet)';
			}
		}

		if (selectedVisibility.includes('private')) {
			if (description) description += ' and ';
			description += 'kept private to you';
		}

		return description || 'Select your visibility preferences';
	}, [selectedVisibility, selectedSocialCircles]);

	// ====================
	// UTILITY FUNCTIONS
	// ====================

	/**
	 * Reset all privacy settings to default state
	 *
	 * LAYMAN TERMS: "Clear all privacy selections and go back to the default
	 * (public only). Used when creating a new memory or when user wants to
	 * start over with privacy settings."
	 *
	 * TECHNICAL: Complete privacy state reset utility for form cleanup
	 *
	 * @function resetPrivacySettings
	 *
	 * @example
	 * After user saves a memory and wants to create another
	 * resetPrivacySettings();
	 *
	 * Result:
	 * selectedVisibility = ['public']
	 * selectedSocialCircles = []
	 * showSocialDropdown = false
	 */
	const resetPrivacySettings = useCallback(() => {
		setSelectedVisibility(['public']);
		setSelectedSocialCircles([]);
		setShowSocialDropdown(false);
	}, []);

	// =====================
	// COMPUTED PROPERTIES
	// =====================

	/**
	 * LAYMAN TERMS: "Computed stats about current privacy selections for easy UI checking"
	 *
	 * TECHNICAL: Derived state object for conditional rendering and display logic
	 */
	const privacySummary = {
		isPublic: selectedVisibility.includes('public'),
		isSocial: selectedVisibility.includes('social'),
		isPrivate: selectedVisibility.includes('private'),
		socialCircleCount: selectedSocialCircles.length,
		totalSelected: (() => {
			if (selectedVisibility.includes('public')) return 'Public + Social';
			if (
				selectedVisibility.includes('social') &&
				selectedSocialCircles.length > 0
			) {
				return `${selectedSocialCircles.length} Social Circle(s)`;
			}
			if (selectedVisibility.includes('private')) return 'Private Only';
			return 'Unknown';
		})(),
	};

	// =======================
	// RETURN HOOK INTERFACE
	// =======================
	return {
		// Current state
		selectedVisibility,
		selectedSocialCircles,
		showSocialDropdown,
		userSocialCircles,

		// Action handlers
		handleVisibilitySelect,
		handleSocialCircleToggle,

		// Utility functions
		isVisibilitySelected,
		getSelectedSocialCircles,
		getVisibilityDescription,
		resetPrivacySettings,

		// Computed properties
		privacySummary,
	};
}

// ===============================
// HELPER TYPES FOR EXTERNAL USE
// ===============================
export type { VisibilityOption, SocialCircle };

export default usePrivacySettings;

/**
 *	PRIVACY HOOK ARCHITECTURE ANALYSIS
 *
 * 1. **MULTI-SELECT APPROACH**: Unlike typical radio buttons, users can select
 *    multiple privacy levels simultaneously. This provides maximum flexibility.
 *
 * 2. **CONDITIONAL UI LOGIC**: Social circle dropdown only appears when 'social'
 *    is selected, keeping the interface clean and contextual.
 *
 * 3. **VALIDATION RULES**: Always require at least one privacy option to prevent
 *    orphaned memories with no visibility settings.
 *
 * 4. **BACKEND INTEGRATION**: Async loading of social circles with graceful
 *    fallback to empty state if loading fails.
 *
 * 5. **COMPUTED DESCRIPTIONS**: Real-time generation of human-readable privacy
 *    summaries for user feedback.
 *
 * This architecture makes privacy settings both powerful and user-friendly!
 */
