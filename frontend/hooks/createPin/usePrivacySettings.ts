// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useEffect } from 'react';

// ================================
//   SERVICE IMPORTS
// ================================
import { getUserSocialCircles } from '@/services/memoryService';
import { getTestSocialCircles } from '@/assets/dummySocialCircleData';

const USE_TEST_DATA = true;

// ==================
// TYPE DEFINITIONS
// ==================

type VisibilityOption = 'public' | 'social' | 'private';

interface SocialCircle {
	id: string;
	name: string;
	memberCount: number;
	description: string;
	color: string;
}

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

	const isVisibilitySelected = useCallback(
		(option: VisibilityOption): boolean => {
			return selectedVisibility.includes(option);
		},
		[selectedVisibility]
	);

	// ========================
	// SOCIAL CIRCLE HANDLERS
	// ========================

	const handleSocialCircleToggle = useCallback((circleId: string) => {
		setSelectedSocialCircles((prev) => {
			if (prev.includes(circleId)) {
				return prev.filter((id) => id !== circleId);
			} else {
				return [...prev, circleId];
			}
		});
	}, []);

	const getSelectedSocialCircles = useCallback((): SocialCircle[] => {
		return userSocialCircles.filter((circle) =>
			selectedSocialCircles.includes(circle.id)
		);
	}, [userSocialCircles, selectedSocialCircles]);

	// =======================
	// DESCRIPTION GENERATOR
	// =======================

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

	const resetPrivacySettings = useCallback(() => {
		setSelectedVisibility(['public']);
		setSelectedSocialCircles([]);
		setShowSocialDropdown(false);
	}, []);

	// =====================
	// COMPUTED PROPERTIES
	// =====================

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
