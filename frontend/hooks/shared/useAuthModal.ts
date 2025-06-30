import { useState } from 'react';
import { signIn, getCurrentUser } from '@/app/services/auth';

interface MessageState {
	show: boolean;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
}

export const useAuthModal = (
	onSignInSuccess?: () => void,
	onAuthRefresh?: () => void
) => {
	const [isVisible, setIsVisible] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [messageState, setMessageState] = useState<MessageState>({
		show: false,
		message: '',
		type: 'info',
	});

	const validateEmail = (email: string) => {
		if (!email) return 'Email is required';
		if (!email.includes('@')) return 'Invalid email format';
		if (email.length < 5) return 'Email too short';
		return '';
	};

	const showMessage = (
		message: string,
		type: MessageState['type'] = 'info'
	) => {
		setMessageState({ show: true, message, type });
	};

	const hideMessage = () => {
		setMessageState((prev) => ({ ...prev, show: false }));
	};

	const resetForm = () => {
		setEmail('');
		setPassword('');
		setEmailError('');
		setIsLoading(false);
		hideMessage();
	};

	const toggle = () => {
		setIsVisible(!isVisible);
		resetForm();
	};

	const handleEmailChange = (text: string) => {
		setEmail(text);
		setEmailError(validateEmail(text));
	};

	const handleSignIn = async () => {
		if (!email || !password) {
			showMessage('Please fill out all required fields', 'warning');
			return;
		}

		const emailValidation = validateEmail(email);
		if (emailValidation) {
			setEmailError(emailValidation);
			showMessage('Please check your email format', 'error');
			return;
		}

		setIsLoading(true);

		setIsLoading(true);

		try {
			await signIn({ email, password });
			showMessage('Welcome back! Successfully signed in.', 'success');

			// NEW: Refresh global auth state
			onAuthRefresh?.();

			setIsVisible(false);
			resetForm();
			onSignInSuccess?.();
		} catch (error: any) {
			console.error('Login error:', error);
			const errorMessage =
				error?.message ||
				'Could not sign in. Please check your credentials.';
			showMessage(errorMessage, 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isVisible,
		email,
		password,
		emailError,
		isLoading,
		messageState,
		toggle,
		handleEmailChange,
		setPassword,
		handleSignIn,
		hideMessage,
	};
};
