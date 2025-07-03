// ================
//   CORE IMPORTS
// ================
import { useOnboardingContext } from '@/contexts/OnboardingContext';

// ==================
//    CUSTOM HOOK
// ==================
export const useStarterPack = () => {
	const { state, updateStarterPackSelections } = useOnboardingContext();
	const selectedPacks = state.starterPackSelections;

	// PACK SELECTION MANAGEMENT: Handle user pack choices
	const togglePackSelection = (packId: string) => {
		const newSelections = selectedPacks.includes(packId)
			? selectedPacks.filter((id) => id !== packId) // Remove if selected
			: [...selectedPacks, packId]; // Add if not selected

		updateStarterPackSelections(newSelections);
	};

	const userHasSelectedPacks = () => selectedPacks.length > 0;

	const getNumberOfSelectedPacks = () => selectedPacks.length;

	const isPackSelected = (packId: string) => {
		return selectedPacks.includes(packId);
	};

	return {
		selectedPacks,
		togglePackSelection,
		userHasSelectedPacks,
		getNumberOfSelectedPacks,
		isPackSelected,
	};
};
