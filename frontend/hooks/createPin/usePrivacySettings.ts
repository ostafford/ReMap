// ========================
//   REACT NATIVE IMPORTS
// ========================
import { useState, useCallback, useEffect, useMemo } from 'react';

// ================================
//   SERVICE IMPORTS
// ================================
import { getTestSocialCircles } from '@/constants/socialCircleData';

const USE_TEST_DATA = true;

// ======================
//   TYPE DEFINITIONS
// ======================
type VisibilityOption = 'public' | 'social' | 'private';

type SocialCircle = {
	id: string;
	name: string;
	memberCount: number;
	description: string;
	color: string;
	members?: Array<{
		id: string;
		name: string;
		avatar?: string;
	}>;
};

type PrivacySettingsData = {
	selectedVisibility: VisibilityOption[];
	selectedSocialCircles: string[];
	showSocialDropdown: boolean;
	userSocialCircles: SocialCircle[];
	isLoadingSocialCircles: boolean;
};

// ===============================
//   CUSTOM HOOK: Privacy Logic
// ===============================
export const usePrivacySettings = () => {
	// Empty canvas with initial values
	const [privacyData, setPrivacyData] = useState<PrivacySettingsData>({
		selectedVisibility: ['public'],
		selectedSocialCircles: [],
		showSocialDropdown: false,
		userSocialCircles: [],
		isLoadingSocialCircles: false,
	});

	const updatePrivacyField = <Field extends keyof PrivacySettingsData>(
		field: Field,
		value: PrivacySettingsData[Field]
	) => {
		setPrivacyData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// DUMMY DATA @CONSTANTS
	const loadUserSocialCircles = useCallback(async () => {
		updatePrivacyField('isLoadingSocialCircles', true);

		try {
			let circles: SocialCircle[];

			if (USE_TEST_DATA) {
				circles = await getTestSocialCircles();
			} else {
				return;
			}

			updatePrivacyField('userSocialCircles', circles);
		} catch (error) {
			console.error('Failed to load social circles:', error);
			updatePrivacyField('userSocialCircles', []);
		} finally {
			updatePrivacyField('isLoadingSocialCircles', false);
		}
	}, []);

	const handleVisibilitySelection = useCallback(
		(option: VisibilityOption) => {
			const currentVisibility = privacyData.selectedVisibility;

			if (currentVisibility.includes(option)) {
				// User wants to deselect this option
				if (currentVisibility.length > 1) {
					const newVisibility = currentVisibility.filter(
						(item) => item !== option
					);
					updatePrivacyField('selectedVisibility', newVisibility);

					if (option === 'social') {
						updatePrivacyField('showSocialDropdown', false);
						updatePrivacyField('selectedSocialCircles', []);
					}
				}
				//(always have at least one)
			} else {
				const newVisibility = [...currentVisibility, option];
				updatePrivacyField('selectedVisibility', newVisibility);

				// dropdown
				if (option === 'social') {
					updatePrivacyField('showSocialDropdown', true);
				}
			}
		},
		[privacyData.selectedVisibility]
	);

	const handleSocialCircleToggle = useCallback(
		(circleId: string) => {
			const currentCircles = privacyData.selectedSocialCircles;

			if (currentCircles.includes(circleId)) {
				// Remove from selection
				const newCircles = currentCircles.filter(
					(id) => id !== circleId
				);
				updatePrivacyField('selectedSocialCircles', newCircles);
			} else {
				// Add to selection
				const newCircles = [...currentCircles, circleId];
				updatePrivacyField('selectedSocialCircles', newCircles);
			}
		},
		[privacyData.selectedSocialCircles]
	);

	const checkVisibilitySelection = useCallback(
		(option: VisibilityOption): boolean => {
			return privacyData.selectedVisibility.includes(option);
		},
		[privacyData.selectedVisibility]
	);

	const getSelectedSocialCircles = useCallback((): SocialCircle[] => {
		return privacyData.userSocialCircles.filter((circle) =>
			privacyData.selectedSocialCircles.includes(circle.id)
		);
	}, [privacyData.userSocialCircles, privacyData.selectedSocialCircles]);

	const getTotalSelectedMembers = useCallback((): number => {
		return getSelectedSocialCircles().reduce(
			(total, circle) => total + circle.memberCount,
			0
		);
	}, [getSelectedSocialCircles]);

	const generateVisibilityDescription = useCallback((): string => {
		let description = '';
		const { selectedVisibility, selectedSocialCircles } = privacyData;

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
	}, [privacyData.selectedVisibility, privacyData.selectedSocialCircles]);

	const resetAllPrivacySettings = useCallback(() => {
		setPrivacyData({
			selectedVisibility: ['public'],
			selectedSocialCircles: [],
			showSocialDropdown: false,
			userSocialCircles: privacyData.userSocialCircles, // Keep loaded circles
			isLoadingSocialCircles: false,
		});
	}, [privacyData.userSocialCircles]);

	const privacySummary = useMemo(
		() => ({
			isPublic: privacyData.selectedVisibility.includes('public'),
			isSocial: privacyData.selectedVisibility.includes('social'),
			isPrivate: privacyData.selectedVisibility.includes('private'),
			socialCircleCount: privacyData.selectedSocialCircles.length,
			totalMemberCount: getTotalSelectedMembers(),
			hasValidSelection: privacyData.selectedVisibility.length > 0,
			visibilityDescription: generateVisibilityDescription(),
		}),
		[
			privacyData.selectedVisibility,
			privacyData.selectedSocialCircles,
			getTotalSelectedMembers,
			generateVisibilityDescription,
		]
	);

	// when the page loads
	useEffect(() => {
		loadUserSocialCircles();
	}, [loadUserSocialCircles]);

	return {
		privacyData,

		updatePrivacyField,

		handleVisibilitySelection,
		handleSocialCircleToggle,
		checkVisibilitySelection,
		getSelectedSocialCircles,
		getTotalSelectedMembers,
		generateVisibilityDescription,
		resetAllPrivacySettings,
		loadUserSocialCircles,

		privacySummary,
	};
};

// ===============================
// HELPER TYPES FOR EXTERNAL USE
// ===============================
export type { VisibilityOption, SocialCircle };

export default usePrivacySettings;
