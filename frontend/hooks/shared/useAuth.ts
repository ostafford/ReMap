import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentUser, signOut as authSignOut } from '@/app/services/auth';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Memoized computed values
	const isAuthenticated = useMemo(() => !!user, [user]);
	const userEmail = useMemo(() => user?.email, [user?.email]);
	const userDisplayName = useMemo(
		() => user?.email?.split('@')[0] || 'User',
		[user?.email]
	);

	// Auth check function
	const checkAuth = useCallback(async () => {
		try {
			const userInfo = await getCurrentUser();
			setUser(userInfo.user);
		} catch (error) {
			console.error('Auth check failed:', error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Initial auth check
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// Refresh auth state (useful after login/logout)
	const refreshAuth = useCallback(async () => {
		setIsLoading(true);
		await checkAuth();
	}, [checkAuth]);

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
		isAuthenticated,
		signOut,
		refreshAuth,
		userEmail,
		userDisplayName,
	};
};
