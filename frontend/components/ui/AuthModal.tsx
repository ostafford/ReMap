import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useAuthModal } from '@/hooks/shared/useAuthModal';

interface AuthModalProps {
	isVisible: boolean;
	onToggle: () => void;
	onSignInSuccess?: () => void;
	styles?: any;
}

export const AuthModal = ({
	isVisible,
	onToggle,
	onSignInSuccess,
	styles,
}: AuthModalProps) => {
	const authModal = useAuthModal(onSignInSuccess);

	// Override the hook's visibility with the prop
	React.useEffect(() => {
		if (isVisible !== authModal.isVisible) {
			if (isVisible) {
			} else {
				authModal.toggle();
			}
		}
	}, [isVisible]);

	const handleBackdropPress = () => {
		authModal.toggle();
		onToggle();
	};

	return (
		<Modal isVisible={isVisible} onBackdropPress={handleBackdropPress}>
			<Modal.Container>
				<Modal.Header title="Welcome Back!" />
				<Modal.Body>
					{/* Form Inputs */}
					<Input
						value={authModal.email}
						onChangeText={authModal.handleEmailChange}
						error={authModal.emailError}
						label="Email"
						placeholder="Enter your email"
						keyboardType="email-address"
						autoCapitalize="none"
					/>
					<Input
						value={authModal.password}
						onChangeText={authModal.setPassword}
						label="Password"
						placeholder="Enter your password"
						secureTextEntry
						secureToggle
					/>
				</Modal.Body>

				<Modal.Footer>
					<Button
						onPress={authModal.handleSignIn}
						style={
							styles
								? [styles.modalButton, styles.signInButton]
								: undefined
						}
						disabled={authModal.isLoading}
					>
						{authModal.isLoading ? 'Signing In...' : 'Sign In'}
					</Button>
					<Button
						onPress={handleBackdropPress}
						style={
							styles
								? [styles.modalButton, styles.cancelButton]
								: undefined
						}
						disabled={authModal.isLoading}
					>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal.Container>
		</Modal>
	);
};
