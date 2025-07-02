// ================
//   CORE IMPORTS
// ================
import React, { useEffect, useCallback, useMemo } from 'react';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';

// ============================
//   INTERNAL 'UI' COMPONENTS
// ============================
import { SplashUI } from '@/components/ui/SplashUI';

// ================================
//   INTERNAL 'HOOKS' IMPORTS
// ================================
import { useSplashState } from '@/hooks/useSplashState';
import { useAuth } from '@/hooks/shared/useAuth';

// ========================
//   MEMOIZED COMPONENT
// ========================
// Wrap SplashUI with React.memo for performance optimization
// This prevents unnecessary re-renders when props haven't changed
const MemoizedSplashUI = React.memo(SplashUI, (prevProps, nextProps) => {
	// Custom comparison function for optimal performance
	return (
		prevProps.isCheckingAuth === nextProps.isCheckingAuth &&
		prevProps.splashState.messageShow ===
			nextProps.splashState.messageShow &&
		prevProps.splashState.messageText ===
			nextProps.splashState.messageText &&
		prevProps.splashState.messageType ===
			nextProps.splashState.messageType &&
		prevProps.splashState.isSignInModalVisible ===
			nextProps.splashState.isSignInModalVisible
	);
});

// ========================
//   COMPONENT DEFINITION
// ========================
export default function SplashScreen() {
	const {
		splashState,
		showMessage,
		hideMessage,
		toggleSignInModal,
		closeSignInModal,
	} = useSplashState();

	// ==================
	//   AUTH STATE
	// ==================
	const { user: currentUser, isLoading: isCheckingAuth } = useAuth();

	// ==================
	//   MEMOIZED VALUES
	// ==================
	const validRoutes = useMemo(() => ['/worldmap', '/onboarding'], []);

	// ==================
	//   EVENT HANDLERS
	// ==================
	const navigateToRoute = useCallback(
		(route: '/worldmap' | '/onboarding', errorMessage: string) => {
			if (!validRoutes.includes(route)) {
				showMessage(
					'Navigation error: This page is not available',
					'error'
				);
				return;
			}

			router.replace(route);
		},
		[validRoutes, showMessage]
	);

	const navigateToWorldMap = useCallback(() => {
		navigateToRoute(
			'/worldmap',
			'Could not navigate to world map. Please try again.'
		);
	}, [navigateToRoute]);

	const navigateToOnboarding = useCallback(() => {
		navigateToRoute(
			'/onboarding',
			'Could not start onboarding. Please try again.'
		);
	}, [navigateToRoute]);

	// ==================
	//   STABLE PROPS
	// ==================
	// Memoize handlers object to prevent SplashUI re-renders
	const handlers = useMemo(
		() => ({
			onNavigateToWorldMap: navigateToWorldMap,
			onNavigateToOnboarding: navigateToOnboarding,
			onToggleSignInModal: toggleSignInModal,
			onCloseSignInModal: closeSignInModal,
			onHideMessage: hideMessage,
		}),
		[
			navigateToWorldMap,
			navigateToOnboarding,
			toggleSignInModal,
			closeSignInModal,
			hideMessage,
		]
	);

	// Memoize splashState to prevent unnecessary re-renders
	const stableSplashState = useMemo(
		() => splashState,
		[
			splashState.messageShow,
			splashState.messageText,
			splashState.messageType,
			splashState.isSignInModalVisible,
		]
	);

	// Handle navigation after auth check
	useEffect(() => {
		if (!isCheckingAuth && currentUser) {
			console.log('✅ User is already signed in:', currentUser.email);
			navigateToWorldMap();
		}
	}, [isCheckingAuth, currentUser, navigateToWorldMap]);

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<MemoizedSplashUI
			splashState={stableSplashState}
			isCheckingAuth={isCheckingAuth}
			handlers={handlers}
		/>
	);
}
