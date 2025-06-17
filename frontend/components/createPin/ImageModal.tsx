// =====================================
//   IMAGE MODAL COMPONENT
// =====================================
// Purpose: Handles image preview functionality
// Replaces: renderImagePreviewModal() and showImagePreview logic

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ReMapColors } from '@/constants/Colors';

// ===================
// TYPE DEFINITIONS
// ===================
interface ImageModalProps {
	visible: boolean;
	imageUri: string | null;
	onClose: () => void;
	title?: string;
}

// ===========================
// COMPONENT IMPLEMENTATION
// ===========================
export const ImageModal: React.FC<ImageModalProps> = ({
	visible,
	imageUri,
	onClose,
	title = 'Image Preview',
}) => {
	// Don't render if no image
	if (!imageUri) return null;

	return (
		<Modal isVisible={visible} onBackdropPress={onClose}>
			<Modal.Container>
				<Modal.Header title={title} />
				<Modal.Body contentPadding={false}>
					<View style={styles.imageContainer}>
						<Image
							source={{ uri: imageUri }}
							style={styles.previewImage}
							resizeMode="contain"
						/>
					</View>
				</Modal.Body>
				<Modal.Footer>
					<Button
						onPress={onClose}
						variant="secondary"
						style={styles.closeButton}
					>
						Close
					</Button>
				</Modal.Footer>
			</Modal.Container>
		</Modal>
	);
};

// ===================
// COMPONENT STYLES
// ===================
const styles = StyleSheet.create({
	imageContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 300,
		maxHeight: 500,
		padding: 20,
	},
	previewImage: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
	},
	closeButton: {
		flex: 1,
		backgroundColor: ReMapColors.ui.textSecondary,
	},
});

// ===============================
//   USAGE EXAMPLE
// ===============================

/*
// Simple image preview
<ImageModal 
	visible={showImagePreview}
	imageUri={selectedImageUri}
	onClose={hideImagePreview}
	title="Memory Photo"
/>
*/
