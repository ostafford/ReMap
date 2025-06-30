import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, signOut as authSignOut } from '@/app/services/auth';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const userInfo = await getCurrentUser();
				setUser(userInfo.user);
			} catch (error) {
				console.error('Auth check failed:', error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Refresh auth state (useful after login/logout)
	const refreshAuth = useCallback(async () => {
		setIsLoading(true);
		try {
			const userInfo = await getCurrentUser();
			setUser(userInfo.user);
		} catch (error) {
			console.error('Auth refresh failed:', error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Sign out with state cleanup
	const signOut = useCallback(async () => {
		try {
			await authSignOut();
			setUser(null);
			return true;
		} catch (error) {
			console.error('Sign out error:', error);
			return false;
		}
	}, []);

	return {
		user,
		isLoading,
		isAuthenticated: !!user,
		signOut,
		refreshAuth,
		userEmail: user?.email,
		userDisplayName: user?.email?.split('@')[0] || 'User',
	};
};
