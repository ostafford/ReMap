// ================
//   CORE IMPORTS
// ================
import { useState } from 'react';

// =========================
//   TYPE DEFINITIONS
// =========================
type StarterPackState = {
	selectedMemoryTypes: string[];
};

// ==================
//    CUSTOM HOOK
// ==================
export const useStarterPack = () => {
	const [starterPackState, setStarterPackState] = useState<StarterPackState>({
		selectedMemoryTypes: [],
	});

	// PACK SELECTION MANAGEMENT: Handle user pack choices
	// In a nutshell this essentially creates an empty array when navigated to the page.
	const togglePackSelection = (packId: string) => {
		setStarterPackState((prev) => ({
			...prev,
			selectedMemoryTypes: prev.selectedMemoryTypes.includes(packId)
				? prev.selectedMemoryTypes.filter((id) => id !== packId) // Remove if selected
				: [...prev.selectedMemoryTypes, packId], // Add if not selected
		}));
	};

	const userHasSelectedPacks = () =>
		starterPackState.selectedMemoryTypes.length > 0;

	const getNumberOfSelectedPacks = () =>
		starterPackState.selectedMemoryTypes.length;

	const isPackSelected = (packId: string) => {
		return starterPackState.selectedMemoryTypes.includes(packId);
	};

	return {
		starterPackState,
		selectedPacks: starterPackState.selectedMemoryTypes,

		togglePackSelection,
		userHasSelectedPacks,
		getNumberOfSelectedPacks,
		isPackSelected,
	};
};
