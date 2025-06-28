// ========================
//   REACT NATIVE IMPORTS
// ========================
import { useState, useCallback, useRef } from 'react';

// ======================
//   TYPE DEFINITIONS
// ======================

export type VisibilityOption = 'public' | 'social' | 'private';

interface PinFormData {
	// Memory Content
	title: string;
	description: string;
	locationQuery: string;
	coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	} | null;

	// Privacy Settings
	selectedVisibility: VisibilityOption[];
	selectedSocialCircles: string[];
}

interface UsePinFormProps {
	showModal: (
		type: 'error' | 'success' | 'info',
		title: string,
		message: string
	) => void;
}

interface UsePinFormReturn {
	// Form Data
	formData: PinFormData;

	// Memory Content Getters/Setters
	memoryTitle: string;
	setMemoryTitle: (title: string) => void;
	memoryDescription: string;
	setMemoryDescription: (description: string) => void;
	locationQuery: string;
	setLocationQuery: (query: string) => void;
	coordinates: PinFormData['coordinates'];
	updateCoordinatesFromLocationSelector: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;

	// Privacy Settings Getters/Setters
	selectedVisibility: VisibilityOption[];
	selectedSocialCircles: string[];
	showSocialDropdown: boolean;
	userSocialCircles: Array<{
		id: string;
		name: string;
		color: string;
		memberCount: number;
		description: string;
	}>;

	// Form Refs
	locationInputRef: React.RefObject<any>;
	titleInputRef: React.RefObject<any>;
	descriptionInputRef: React.RefObject<any>;

	// Validation & Actions
	validateMemoryContent: () => boolean;
	validateForm: () => boolean;
	resetForm: () => void;
	hasValidMemoryContent: boolean;
	hasValidForm: boolean;

	// Privacy Actions
	toggleVisibilityOption: (option: VisibilityOption) => void;
	toggleSocialCircleSelection: (circleId: string) => void;
	isVisibilitySelected: (option: VisibilityOption) => boolean;
	getSelectedSocialCirclesData: () => Array<{
		id: string;
		name: string;
		color: string;
		memberCount: number;
		description: string;
	}>;
	getVisibilityDescription: () => string;
	resetPrivacySettings: () => void;
}

// ======================
//   CUSTOM HOOK
// ======================

export function usePinForm({ showModal }: UsePinFormProps): UsePinFormReturn {
	// =========================
	// STATE MANAGEMENT
	// =========================
	const [formData, setFormData] = useState<PinFormData>({
		title: '',
		description: '',
		locationQuery: '',
		coordinates: null,
		selectedVisibility: ['public'], // Default to public
		selectedSocialCircles: [],
	});

	// =========================
	// FORM REFS
	// =========================
	const locationInputRef = useRef<any>(null);
	const titleInputRef = useRef<any>(null);
	const descriptionInputRef = useRef<any>(null);

	// =========================
	// MOCK SOCIAL CIRCLES DATA
	// =========================
	const userSocialCircles = [
		{
			id: '1',
			name: 'Family',
			color: '#FF6B6B',
			memberCount: 8,
			description: 'Close family members and relatives',
		},
		{
			id: '2',
			name: 'Friends',
			color: '#4ECDC4',
			memberCount: 12,
			description: 'Close friends and buddies',
		},
		{
			id: '3',
			name: 'Work Team',
			color: '#45B7D1',
			memberCount: 6,
			description: 'Colleagues from work',
		},
	];

	// =========================
	// UPDATE FUNCTIONS
	// =========================

	const updateFormField = useCallback(
		<Field extends keyof PinFormData>(
			field: Field,
			value: PinFormData[Field]
		) => {
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));
		},
		[]
	);

	// =========================
	// MEMORY CONTENT ACTIONS
	// =========================

	const setMemoryTitle = useCallback(
		(title: string) => {
			updateFormField('title', title);
		},
		[updateFormField]
	);

	const setMemoryDescription = useCallback(
		(description: string) => {
			updateFormField('description', description);
		},
		[updateFormField]
	);

	const setLocationQuery = useCallback(
		(query: string) => {
			updateFormField('locationQuery', query);
		},
		[updateFormField]
	);

	const updateCoordinatesFromLocationSelector = useCallback(
		(coords: { latitude: number; longitude: number; address: string }) => {
			updateFormField('coordinates', coords);
		},
		[updateFormField]
	);

	// =========================
	// PRIVACY SETTINGS ACTIONS
	// =========================

	const toggleVisibilityOption = useCallback((option: VisibilityOption) => {
		setFormData((prev) => {
			const currentVisibility = prev.selectedVisibility;

			// Handle special logic for visibility options
			if (option === 'public') {
				// If public is selected, remove all others
				return {
					...prev,
					selectedVisibility: ['public'],
					selectedSocialCircles: [], // Clear social circles when public
				};
			} else {
				// If private or social is selected, remove public
				const newVisibility = currentVisibility.filter(
					(v) => v !== 'public'
				);

				if (currentVisibility.includes(option)) {
					// Remove the option if already selected
					const filtered = newVisibility.filter((v) => v !== option);
					// Ensure at least one option is selected
					return {
						...prev,
						selectedVisibility:
							filtered.length > 0 ? filtered : ['public'],
						selectedSocialCircles:
							option === 'social'
								? []
								: prev.selectedSocialCircles,
					};
				} else {
					// Add the option
					return {
						...prev,
						selectedVisibility: [...newVisibility, option],
					};
				}
			}
		});
	}, []);

	const toggleSocialCircleSelection = useCallback((circleId: string) => {
		setFormData((prev) => {
			const currentCircles = prev.selectedSocialCircles;
			const isSelected = currentCircles.includes(circleId);

			if (isSelected) {
				return {
					...prev,
					selectedSocialCircles: currentCircles.filter(
						(id) => id !== circleId
					),
				};
			} else {
				return {
					...prev,
					selectedSocialCircles: [...currentCircles, circleId],
				};
			}
		});
	}, []);

	const isVisibilitySelected = useCallback(
		(option: VisibilityOption) => {
			return formData.selectedVisibility.includes(option);
		},
		[formData.selectedVisibility]
	);

	const getSelectedSocialCirclesData = useCallback(() => {
		return userSocialCircles.filter((circle) =>
			formData.selectedSocialCircles.includes(circle.id)
		);
	}, [formData.selectedSocialCircles]);

	const getVisibilityDescription = useCallback(() => {
		const visibility = formData.selectedVisibility;

		if (visibility.includes('public')) {
			return 'This memory will be visible to everyone on the map.';
		} else if (visibility.includes('private')) {
			return 'This memory will only be visible to you.';
		} else if (visibility.includes('social')) {
			const selectedCircles = getSelectedSocialCirclesData();
			if (selectedCircles.length > 0) {
				const circleNames = selectedCircles
					.map((c) => c.name)
					.join(', ');
				return `This memory will be visible to members of: ${circleNames}`;
			} else {
				return 'Select social circles to share this memory with.';
			}
		}

		return 'Please select a visibility option.';
	}, [formData.selectedVisibility, getSelectedSocialCirclesData]);

	const resetPrivacySettings = useCallback(() => {
		setFormData((prev) => ({
			...prev,
			selectedVisibility: ['public'],
			selectedSocialCircles: [],
		}));
	}, []);

	// =========================
	// VALIDATION FUNCTIONS
	// =========================

	const validateMemoryContent = useCallback(() => {
		const hasTitle = formData.title.trim().length > 0;
		const hasDescription = formData.description.trim().length > 0;
		const hasLocation =
			formData.locationQuery.trim().length > 0 && formData.coordinates;

		if (!hasTitle) {
			showModal(
				'error',
				'Missing Title',
				'Please add a title for your memory.'
			);
			titleInputRef.current?.focus();
			return false;
		}

		if (!hasDescription) {
			showModal(
				'error',
				'Missing Description',
				'Please add a description for your memory.'
			);
			descriptionInputRef.current?.focus();
			return false;
		}

		if (!hasLocation) {
			showModal(
				'error',
				'Missing Location',
				'Please select a location for your memory.'
			);
			locationInputRef.current?.focus();
			return false;
		}

		return true;
	}, [
		formData.title,
		formData.description,
		formData.locationQuery,
		formData.coordinates,
		showModal,
	]);

	const validateForm = useCallback(() => {
		const hasValidContent = validateMemoryContent();
		const hasValidPrivacy = formData.selectedVisibility.length > 0;

		if (!hasValidPrivacy) {
			showModal(
				'error',
				'Privacy Settings',
				'Please select who can see this memory.'
			);
			return false;
		}

		return hasValidContent && hasValidPrivacy;
	}, [validateMemoryContent, formData.selectedVisibility, showModal]);

	// =========================
	// RESET FUNCTIONS
	// =========================

	const resetForm = useCallback(() => {
		setFormData({
			title: '',
			description: '',
			locationQuery: '',
			coordinates: null,
			selectedVisibility: ['public'],
			selectedSocialCircles: [],
		});
	}, []);

	// =========================
	// COMPUTED VALUES
	// =========================

	const hasValidMemoryContent =
		formData.title.trim().length > 0 &&
		formData.description.trim().length > 0 &&
		formData.locationQuery.trim().length > 0 &&
		!!formData.coordinates;

	const hasValidForm =
		hasValidMemoryContent && formData.selectedVisibility.length > 0;

	const showSocialDropdown = formData.selectedVisibility.includes('social');

	// =========================
	// RETURN INTERFACE
	// =========================
	return {
		// Form Data
		formData,

		// Memory Content Getters/Setters
		memoryTitle: formData.title,
		setMemoryTitle,
		memoryDescription: formData.description,
		setMemoryDescription,
		locationQuery: formData.locationQuery,
		setLocationQuery,
		coordinates: formData.coordinates,
		updateCoordinatesFromLocationSelector,

		// Privacy Settings Getters/Setters
		selectedVisibility: formData.selectedVisibility,
		selectedSocialCircles: formData.selectedSocialCircles,
		showSocialDropdown,
		userSocialCircles,

		// Form Refs
		locationInputRef,
		titleInputRef,
		descriptionInputRef,

		// Validation & Actions
		validateMemoryContent,
		validateForm,
		resetForm,
		hasValidMemoryContent,
		hasValidForm,

		// Privacy Actions
		toggleVisibilityOption,
		toggleSocialCircleSelection,
		isVisibilitySelected,
		getSelectedSocialCirclesData,
		getVisibilityDescription,
		resetPrivacySettings,
	};
}
