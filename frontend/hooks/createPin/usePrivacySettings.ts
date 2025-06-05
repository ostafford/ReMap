import { useState, useCallback, useEffect } from 'react';
import { getUserSocialCircles } from '@/services/memoryService';
import { getTestSocialCircles } from '@/assets/dummySocialCircleData';

const USE_TEST_DATA = true; // ATTN: Set to 'false' when backend is ready

// ==========================================
// TYPE DEFINITIONS
// ==========================================
type VisibilityOption = 'public' | 'social' | 'private';

interface SocialCircle {
	id: string;
	name: string;
	memberCount: number;
	description: string;
	color: string;
}

interface UsePrivacySettingsReturn {
	// Visibility state
	selectedVisibility: VisibilityOption[];

	// Social circle state
	selectedSocialCircles: string[];
	showSocialDropdown: boolean;
	userSocialCircles: SocialCircle[];

	// Handlers
	handleVisibilitySelect: (option: VisibilityOption) => void;
	handleSocialCircleToggle: (circleId: string) => void;

	// Utility functions
	isVisibilitySelected: (option: VisibilityOption) => boolean;
	getSelectedSocialCircles: () => SocialCircle[];
	getVisibilityDescription: () => string;
	resetPrivacySettings: () => void;

	// Computed properties
	privacySummary: {
		isPublic: boolean;
		isSocial: boolean;
		isPrivate: boolean;
		socialCircleCount: number;
		totalAudience: string;
	};
}

// ==========================================
// CUSTOM HOOK IMPLEMENTATION
// ==========================================
export function usePrivacySettings(): UsePrivacySettingsReturn {
	// ==========================================
	// STATE MANAGEMENT
	// ==========================================
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

	// ==========================================
	// LOAD USER'S SOCIAL CIRCLES
	// ==========================================
	// useEffect(() => {
	// 	const loadUserSocialCircles = async () => {
	// 		const circles = await getUserSocialCircles();
	// 		setUserSocialCircles(circles);
	// 		console.log('👥 Loaded user social circles:', circles);
	// 	};
	// 	loadUserSocialCircles();
	// }, []);

	useEffect(() => {
		const loadUserSocialCircles = async () => {
			try {
				if (USE_TEST_DATA) {
					const circles = await getTestSocialCircles();
					setUserSocialCircles(circles);
				} else {
					const circles = await getUserSocialCircles();
					return Error;
				}
			} catch (error) {
				console.error('Failed to load social circles:', error);
				setUserSocialCircles([]);
			}
		};

		loadUserSocialCircles();
	}, []);

	// ==========================================
	// VISIBILITY HANDLERS
	// ==========================================
	const handleVisibilitySelect = useCallback((option: VisibilityOption) => {
		setSelectedVisibility((prev) => {
			if (prev.includes(option)) {
				// If trying to deselect and it's the only option, keep it
				if (prev.length > 1) {
					const newVisibility = prev.filter(
						(item) => item !== option
					);

					// Hide social dropdown if social is deselected
					if (option === 'social') {
						setShowSocialDropdown(false);
						setSelectedSocialCircles([]);
					}

					return newVisibility;
				}
				return prev; // Don't allow deselecting if it's the only option
			} else {
				const newVisibility = [...prev, option];

				// Show social dropdown if social is selected
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

	// ==========================================
	// SOCIAL CIRCLE HANDLERS
	// ==========================================
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

	// ==========================================
	// DESCRIPTION GENERATOR
	// ==========================================
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

	// ==========================================
	// UTILITY FUNCTIONS
	// ==========================================
	const resetPrivacySettings = useCallback(() => {
		setSelectedVisibility(['public']);
		setSelectedSocialCircles([]);
		setShowSocialDropdown(false);
	}, []);

	// ==========================================
	// COMPUTED PROPERTIES
	// ==========================================
	const privacySummary = {
		isPublic: selectedVisibility.includes('public'),
		isSocial: selectedVisibility.includes('social'),
		isPrivate: selectedVisibility.includes('private'),
		socialCircleCount: selectedSocialCircles.length,
		totalAudience: (() => {
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

	// ==========================================
	// RETURN HOOK INTERFACE
	// ==========================================
	return {
		// State
		selectedVisibility,
		selectedSocialCircles,
		showSocialDropdown,
		userSocialCircles,

		// Handlers
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

// ==========================================
// HELPER TYPES FOR EXTERNAL USE
// ==========================================
export type { VisibilityOption, SocialCircle };

// Default export
export default usePrivacySettings;
