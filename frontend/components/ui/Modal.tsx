// ================
//   CORE IMPORTS
// ================
import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ViewStyle,
} from 'react-native';
import RNModal from 'react-native-modal';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   TYPE DEFINITIONS
// ====================
type ModalProps = {
	isVisible: boolean;
	children: React.ReactNode;
	[x: string]: any;
	onBackdropPress?: () => void;
	onBackButtonPress?: () => void;
	avoidKeyboard?: boolean;
	animationIn?: string;
	animationOut?: string;
};

// ========================
//   MAIN MODAL COMPONENT
// ========================
export const Modal = ({
	isVisible = false,
	children,
	onBackdropPress,
	onBackButtonPress,
	avoidKeyboard = true,
	animationIn = 'slideInUp',
	animationOut = 'slideOutDown',
	...props
}: ModalProps) => {
	return (
		<RNModal
			isVisible={isVisible}
			animationIn={animationIn}
			animationOut={animationOut}
			animationInTiming={800}
			animationOutTiming={800}
			backdropTransitionInTiming={800}
			backdropTransitionOutTiming={800}
			onBackdropPress={onBackdropPress}
			onBackButtonPress={onBackButtonPress}
			avoidKeyboard={avoidKeyboard}
			backdropColor="rgba(0, 0, 0, .7)"
			backdropOpacity={1.2}
			{...props}
		>
			{children}
		</RNModal>
	);
};

// ===================
//   MODAL CONTAINER
// ===================
const ModalContainer = ({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: ViewStyle | ViewStyle[];
}) => <View style={[styles.container, style]}>{children}</View>;

// ================
//   MODAL HEADER
// ================
const ModalHeader = ({
	title,
	onClose,
	showCloseButton = false,
}: {
	title: string;
	onClose?: () => void;
	showClosedButton?: boolean;
}) => (
	<View style={styles.header}>
		<Text style={styles.headerText}>{title}</Text>
	</View>
);

// ==============
//   MODAL BODY
// ==============
const ModalBody = ({
	children,
	style,
}: {
	children?: React.ReactNode;
	style?: ViewStyle | ViewStyle[];
}) => <View style={[styles.body, style]}>{children}</View>;

// ================
//   MODAL FOOTER
// ================
const ModalFooter = ({
	children,
	style,
}: {
	children?: React.ReactNode;
	style?: ViewStyle | ViewStyle[];
}) => <View style={[styles.footer, style]}>{children}</View>;

const styles = StyleSheet.create({
	container: {
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 20,
		// height: 500,
		maxHeight: '90%',
		minHeight: 200,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 10,
		shadowRadius: 20,
		elevation: 20,
	},
	closeButton: {
		position: 'absolute',
		right: 16,
		top: 16,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: ReMapColors.ui.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeButtonText: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
		fontWeight: '500',
	},
	header: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		// borderBottomWidth: 0,
		borderBottomColor: ReMapColors.ui.border,
		paddingVertical: 10,
		paddingHorizontal: 10,
	},
	headerText: {
		textAlign: 'center',
		fontSize: 25,
		fontWeight: '600',
		color: ReMapColors.ui.text,
	},
	text: {
		paddingTop: 10,
		textAlign: 'center',
		fontSize: 24,
	},
	body: {
		justifyContent: 'center',
		paddingHorizontal: 25,
		paddingVertical: 15,
		// flex: 1,
		// minHeight: 100,
	},
	footer: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 25,
		// padding: 10,
		flexDirection: 'row',
		// borderTopWidth: 1,
		borderTopColor: ReMapColors.ui.border,
		gap: 30,
	},
});

Modal.Header = ModalHeader;
Modal.Container = ModalContainer;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
