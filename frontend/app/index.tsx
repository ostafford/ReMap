// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

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
import { useSplashState } from '@/hooks/onboarding/useSplashState';
import { useAuth } from '@/hooks/shared/useAuth';

// ========================
//   COMPONENT DEFINITION
// ========================
export default function SplashScreen() {
	const {
		splashState,
		updateField,
		showMessage,
		hideMessage,
		toggleSignInModal,
		closeSignInModal,
	} = useSplashState();

	// ==================
	//   AUTH STATE
	// ==================
	const { user: currentUser, isLoading: isCheckingAuth } = useAuth();

	// Handle navigation after auth check (Debugging purposes)
	useEffect(() => {
		if (!isCheckingAuth && currentUser) {
			console.log('✅ User is already signed in:', currentUser.email);
			navigateToWorldMap();
		}
	}, [isCheckingAuth, currentUser]);

	// ==================
	//   EVENT HANDLERS
	// ==================
	const validRoutes = ['/worldmap', '/onboarding'];

	const navigateToWorldMap = () => {
		const route = '/worldmap';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: This page is not available',
				'error'
			);
			return;
		}

		try {
			router.replace(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not navigate to world map. Please try again.',
				'error'
			);
		}
	};

	const navigateToOnboarding = () => {
		const route = '/onboarding';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: This page is not available',
				'error'
			);
			return;
		}

		try {
			router.replace(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not start onboarding. Please try again.',
				'error'
			);
		}
	};

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<SplashUI
			splashState={splashState}
			isCheckingAuth={isCheckingAuth}
			handlers={{
				onNavigateToWorldMap: navigateToWorldMap,
				onNavigateToOnboarding: navigateToOnboarding,
				onToggleSignInModal: toggleSignInModal,
				onCloseSignInModal: closeSignInModal,
				onHideMessage: hideMessage,
			}}
		/>
	);
}
