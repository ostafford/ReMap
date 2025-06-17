// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useEffect } from 'react';

// ================================
//   SERVICE IMPORTS (API LAYER)
// ================================
// TODO: Replace with actual API service once backend is ready
// import { fetchUserSocialCircles } from '@/services/api/socialCircleService';

// ==================
// TYPE DEFINITIONS
// ==================

// Privacy visibility options that user can select
type VisibilityOption = 'public' | 'social' | 'private';

// Social circle data structure matching backend API response
interface SocialCircle {
	id: string;
	name: string;
	memberCount: number;
	description: string;
	color: string;
	members?: Array<{
		id: string;
		name: string;
	}>;
}

// Main state structure for privacy settings - "empty canvas" approach
type PrivacySettingsState = {
	selectedVisibility: VisibilityOption[];
	selectedSocialCircles: string[];
	showSocialDropdown: boolean;
	userSocialCircles: SocialCircle[];
	isLoading: boolean;
	error: string | null;
};

// Hook return interface - public API
interface UsePrivacySettingsReturn {
	// Current state
	selectedVisibility: VisibilityOption[];
	selectedSocialCircles: string[];
	showSocialDropdown: boolean;
	userSocialCircles: SocialCircle[];
	isLoading: boolean;
	error: string | null;

	// Action handlers with descriptive names
	toggleVisibilityOption: (option: VisibilityOption) => void;
	toggleSocialCircleSelection: (circleId: string) => void;

	// Utility functions
	isVisibilitySelected: (option: VisibilityOption) => boolean;
	getSelectedSocialCirclesData: () => SocialCircle[];
	getVisibilityDescription: () => string;
	resetAllPrivacySettings: () => void;

	// Computed summary
	privacySummary: {
		isPublic: boolean;
		isSocial: boolean;
		isPrivate: boolean;
		socialCircleCount: number;
		totalSelected: string;
	};
}

// =============================
// PLACEHOLDER API FUNCTIONS
// =============================
const fetchUserSocialCircles = async (): Promise<SocialCircle[]> => {
	// TODO: Replace with actual API call
	// Example: const response = await apiClient.get('/user/social-circles');
	// return response.data;

	// Temporary placeholder - simulates API delay
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(
				'📡 API Placeholder: Would fetch user social circles here'
			);
			resolve([]); // Empty array until backend is connected
		}, 500);
	});
};

// ============================
// CUSTOM HOOK IMPLEMENTATION
// ============================

export function usePrivacySettings(): UsePrivacySettingsReturn {
	// ===========================
	// STATE MANAGEMENT: Initial empty canvas with defaults
	// ===========================
	const [privacyState, setPrivacyState] = useState<PrivacySettingsState>({
		selectedVisibility: ['public'],
		selectedSocialCircles: [],
		showSocialDropdown: false,
		userSocialCircles: [],
		isLoading: false,
		error: null,
	});

	// ===========================
	// UPDATE FUNCTION: Generic state updater following team template
	// ===========================
	const updatePrivacyField = <Field extends keyof PrivacySettingsState>(
		field: Field,
		value: PrivacySettingsState[Field]
	) => {
		setPrivacyState((prev) => ({
			...prev, // Spread operator: preserve existing values
			[field]: value, // Dynamic property assignment
		}));
	};

	// =============================
	// API INTEGRATION: Load user's social circles
	// =============================
	useEffect(() => {
		const loadUserSocialCircles = async () => {
			updatePrivacyField('isLoading', true);
			updatePrivacyField('error', null);

			try {
				// API call placeholder - ready for backend integration
				const socialCircles = await fetchUserSocialCircles();
				updatePrivacyField('userSocialCircles', socialCircles);
			} catch (error) {
				console.error('Failed to load social circles:', error);
				updatePrivacyField('error', 'Failed to load social circles');
				updatePrivacyField('userSocialCircles', []);
			} finally {
				updatePrivacyField('isLoading', false);
			}
		};

		loadUserSocialCircles();
	}, []);

	// ===============================
	// VISIBILITY SELECTION LOGIC: Handles mutual exclusivity rules
	// ===============================
	const toggleVisibilityOption = useCallback((option: VisibilityOption) => {
		setPrivacyState((prev) => {
			// If option is already selected, remove it (but keep at least one)
			if (prev.selectedVisibility.includes(option)) {
				if (prev.selectedVisibility.length > 1) {
					const newVisibility = prev.selectedVisibility.filter(
						(item) => item !== option
					);

					// If removing social, hide dropdown and clear selections
					if (option === 'social') {
						return {
							...prev,
							selectedVisibility: newVisibility,
							showSocialDropdown: false,
							selectedSocialCircles: [],
						};
					}

					return {
						...prev,
						selectedVisibility: newVisibility,
					};
				}
				return prev; // Don't allow removing last option
			}

			// Adding new option
			let newVisibility = [...prev.selectedVisibility, option];

			// Handle mutual exclusivity: public cannot coexist with others
			if (option === 'public') {
				newVisibility = ['public'];
				return {
					...prev,
					selectedVisibility: newVisibility,
					showSocialDropdown: false,
					selectedSocialCircles: [],
				};
			}

			// If adding social/private, remove public
			if (prev.selectedVisibility.includes('public')) {
				newVisibility = newVisibility.filter(
					(item) => item !== 'public'
				);
			}

			// Show social dropdown when social is selected
			const shouldShowDropdown = newVisibility.includes('social');

			return {
				...prev,
				selectedVisibility: newVisibility,
				showSocialDropdown: shouldShowDropdown,
			};
		});
	}, []);

	// ===============================
	// SOCIAL CIRCLE SELECTION LOGIC: Toggle individual circles
	// ===============================
	const toggleSocialCircleSelection = useCallback((circleId: string) => {
		setPrivacyState((prev) => {
			const isCurrentlySelected =
				prev.selectedSocialCircles.includes(circleId);

			const newSelectedCircles = isCurrentlySelected
				? prev.selectedSocialCircles.filter((id) => id !== circleId)
				: [...prev.selectedSocialCircles, circleId];

			return {
				...prev,
				selectedSocialCircles: newSelectedCircles,
			};
		});
	}, []);

	// ===============================
	// UTILITY FUNCTIONS: Helper functions for components
	// ===============================

	const isVisibilitySelected = useCallback(
		(option: VisibilityOption): boolean => {
			return privacyState.selectedVisibility.includes(option);
		},
		[privacyState.selectedVisibility]
	);

	const getSelectedSocialCirclesData = useCallback((): SocialCircle[] => {
		return privacyState.userSocialCircles.filter((circle) =>
			privacyState.selectedSocialCircles.includes(circle.id)
		);
	}, [privacyState.userSocialCircles, privacyState.selectedSocialCircles]);

	const getVisibilityDescription = useCallback((): string => {
		let description = '';

		if (privacyState.selectedVisibility.includes('public')) {
			description += 'Visible to everyone in the ReMap community';
		}

		if (privacyState.selectedVisibility.includes('social')) {
			if (description) description += ' and ';
			if (privacyState.selectedSocialCircles.length > 0) {
				description += `visible to ${privacyState.selectedSocialCircles.length} selected social circle(s)`;
			} else {
				description +=
					'visible to your social circles (none selected yet)';
			}
		}

		if (privacyState.selectedVisibility.includes('private')) {
			if (description) description += ' and ';
			description += 'kept private to you';
		}

		return description || 'Select your visibility preferences';
	}, [privacyState.selectedVisibility, privacyState.selectedSocialCircles]);

	const resetAllPrivacySettings = useCallback(() => {
		setPrivacyState((prev) => ({
			...prev,
			selectedVisibility: ['public'],
			selectedSocialCircles: [],
			showSocialDropdown: false,
		}));
	}, []);

	// ===============================
	// COMPUTED PROPERTIES: Summary data for parent components
	// ===============================
	const privacySummary = {
		isPublic: privacyState.selectedVisibility.includes('public'),
		isSocial: privacyState.selectedVisibility.includes('social'),
		isPrivate: privacyState.selectedVisibility.includes('private'),
		socialCircleCount: privacyState.selectedSocialCircles.length,
		totalSelected: (() => {
			if (privacyState.selectedVisibility.includes('public'))
				return 'Public';

			const parts = [];
			if (
				privacyState.selectedVisibility.includes('social') &&
				privacyState.selectedSocialCircles.length > 0
			) {
				parts.push(
					`${privacyState.selectedSocialCircles.length} Social Circle(s)`
				);
			}
			if (privacyState.selectedVisibility.includes('private')) {
				parts.push('Private');
			}

			return parts.join(' + ') || 'No selection';
		})(),
	};

	// ===============================
	// RETURN INTERFACE: Public API for components
	// ===============================
	return {
		// Current state
		selectedVisibility: privacyState.selectedVisibility,
		selectedSocialCircles: privacyState.selectedSocialCircles,
		showSocialDropdown: privacyState.showSocialDropdown,
		userSocialCircles: privacyState.userSocialCircles,
		isLoading: privacyState.isLoading,
		error: privacyState.error,

		// Action handlers with descriptive names
		toggleVisibilityOption,
		toggleSocialCircleSelection,

		// Utility functions
		isVisibilitySelected,
		getSelectedSocialCirclesData,
		getVisibilityDescription,
		resetAllPrivacySettings,

		// Computed properties
		privacySummary,
	};
}

// ===============================
// HELPER TYPES FOR EXTERNAL USE
// ===============================
export type { VisibilityOption, SocialCircle };

export default usePrivacySettings;
