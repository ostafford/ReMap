// >>>>> IGNORE THIS FILE FOR NOW <<<<<

// =====================================
//   NOTIFICATION MODAL COMPONENT
// =====================================
// Purpose: Handles success, error, info, and warning messages
// Replaces: Most of the current renderModal() complexity

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
	InfoMessage,
} from '@/components/ui/Messages';

// ===================
// TYPE DEFINITIONS
// ===================
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationAction {
	text: string;
	onPress: () => void;
	style?: 'primary' | 'secondary' | 'danger';
	variant?: 'primary' | 'secondary' | 'danger';
}

interface NotificationModalProps {
	visible: boolean;
	type: NotificationType;
	title: string;
	message: string;
	actions?: NotificationAction[];
	onClose: () => void;
}

// ===========================
// COMPONENT IMPLEMENTATION
// ===========================
export const NotificationModal: React.FC<NotificationModalProps> = ({
	visible,
	type,
	title,
	message,
	actions,
	onClose,
}) => {
	// Default action if none provided
	const defaultActions: NotificationAction[] = [
		{ text: 'OK', onPress: onClose, style: 'primary', variant: 'primary' },
	];

	const finalActions = actions || defaultActions;

	// Render the appropriate message component based on type
	const renderMessageComponent = () => {
		switch (type) {
			case 'success':
				return (
					<SuccessMessage title={title} onDismiss={onClose}>
						{message}
					</SuccessMessage>
				);
			case 'error':
				return (
					<ErrorMessage title={title} onDismiss={onClose}>
						{message}
					</ErrorMessage>
				);
			case 'warning':
				return (
					<WarningMessage title={title} onDismiss={onClose}>
						{message}
					</WarningMessage>
				);
			case 'info':
				return (
					<InfoMessage title={title} onDismiss={onClose}>
						{message}
					</InfoMessage>
				);
			default:
				return (
					<InfoMessage title={title} onDismiss={onClose}>
						{message}
					</InfoMessage>
				);
		}
	};

	return (
		<Modal isVisible={visible} onBackdropPress={onClose}>
			<Modal.Container>
				<Modal.Header title={title} />
				<Modal.Body>{renderMessageComponent()}</Modal.Body>

				{finalActions.length > 0 && (
					<Modal.Footer>
						{finalActions.map((action, index) => (
							<Button
								key={index}
								onPress={action.onPress}
								variant={action.variant || 'primary'}
							>
								{action.text}
							</Button>
						))}
					</Modal.Footer>
				)}
			</Modal.Container>
		</Modal>
	);
};

// ===============================
//   USAGE EXAMPLES
// ===============================

/*
// Simple success notification
<NotificationModal 
	visible={showSuccess}
	type="success"
	title="Photo Added!"
	message="Your photo has been successfully added."
	onClose={hideModal}
/>

// Error with custom action
<NotificationModal 
	visible={showError}
	type="error"
	title="Save Failed"
	message="Could not save your memory. Please try again."
	actions={[
		{ text: 'Retry', onPress: retryFunction, variant: 'primary' },
		{ text: 'Cancel', onPress: hideModal, variant: 'secondary' }
	]}
	onClose={hideModal}
/>

// Permission warning
<NotificationModal 
	visible={showPermission}
	type="warning"
	title="Permission Required"
	message="Please enable camera access in settings."
	onClose={hideModal}
/>
*/
