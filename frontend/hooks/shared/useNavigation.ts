import { router } from 'expo-router';

// Simple navigation helper - just handles the try/catch repetition
export const useNavigation = () => {
	const goToPage = (route: string) => {
		console.log('🧭 @useNavigation hook received route:', route);
		try {
			router.push(route as any);
		} catch (error) {
			console.error('@useNavigation failed:', error);
		}
	};

	return { goToPage };
};
