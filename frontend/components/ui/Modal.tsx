// ================
//   CORE IMPORTS
// ================
import React from 'react';
import {
	StyleSheet,
	View,
	TouchableOpacity,
	ViewStyle,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import RNModal from 'react-native-modal';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { HeaderText, CaptionText } from './Typography';

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
	scrollable?: boolean;
	maxHeight?: number;
	autoScrollable?: boolean;
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
	scrollable = true,
	maxHeight,
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
			<KeyboardAvoidingView
				style={styles.keyboardAvoidingView}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
			>
				{children}
			</KeyboardAvoidingView>
		</RNModal>
	);
};

// ===================
//   MODAL CONTAINER
// ===================
const ModalContainer = ({
	children,
	style,
	scrollable = true,
	maxHeight,
	autoScrollable = false,
}: {
	children: React.ReactNode;
	style?: ViewStyle | ViewStyle[];
	scrollable?: boolean;
	maxHeight?: number;
	autoScrollable?: boolean;
}) => {
	const scrollViewStyle = [
		styles.containerScrollView,
		maxHeight && { maxHeight },
		style,
	];

	const contentContainerStyle = [styles.container, styles.scrollContent];

	if (scrollable) {
		return (
			<ScrollView
				style={scrollViewStyle}
				contentContainerStyle={contentContainerStyle}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{children}
			</ScrollView>
		);
	}

	const containerStyle = [
		styles.container,
		maxHeight && { maxHeight },
		style,
	];

	return <View style={containerStyle}>{children}</View>;
};

// ================
//   MODAL HEADER
// ================
const ModalHeader = ({
	title,
	onClose,
	showCloseButton = false,
	sticky = false,
}: {
	title: string;
	onClose?: () => void;
	showCloseButton?: boolean;
	testID?: string;
	sticky?: boolean;
}) => (
	<View style={[styles.header, sticky && styles.stickyHeader]}>
		<HeaderText align="center" style={styles.headerText}>
			{title}
		</HeaderText>

		{showCloseButton && onClose && (
			<TouchableOpacity style={styles.closeButton} onPress={onClose}>
				<CaptionText style={styles.closeButtonText}>✕</CaptionText>
			</TouchableOpacity>
		)}
	</View>
);

// ==============
//   MODAL BODY
// ==============
const ModalBody = ({
	children,
	style,
	scrollable = true,
	contentPadding = true,
}: {
	children?: React.ReactNode;
	style?: ViewStyle | ViewStyle[];
	scrollable?: boolean;
	contentPadding?: boolean;
}) => {
	const scrollViewStyle = [styles.bodyScrollView, style];

	const contentContainerStyle = [
		contentPadding ? styles.body : styles.bodyNoPadding,
		styles.bodyScrollContent,
	];

	if (scrollable) {
		return (
			<ScrollView
				style={scrollViewStyle}
				contentContainerStyle={contentContainerStyle}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				nestedScrollEnabled={true}
			>
				{children}
			</ScrollView>
		);
	}

	const bodyStyle = [
		contentPadding ? styles.body : styles.bodyNoPadding,
		style,
	];

	return <View style={bodyStyle}>{children}</View>;
};

// ================
//   MODAL FOOTER
// ================
const ModalFooter = ({
	children,
	style,
	sticky = false,
}: {
	children?: React.ReactNode;
	style?: ViewStyle | ViewStyle[];
	sticky?: boolean;
}) => (
	<View style={[styles.footer, sticky && styles.stickyFooter, style]}>
		{children}
	</View>
);

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	keyboardAvoidingView: {
		// NOTE: Keyboard avoiding container
		flex: 1,
		justifyContent: 'center',
	},
	containerScrollView: {
		// NOTE: This is the scrollable window (The modal sits infront of this allowing it to be scrollable)
		maxHeight: '95%',
		flexGrow: 0,
	},
	container: {
		// NOTE: #contentContainerStyle)
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 20,
		minHeight: 100,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 10,
		shadowRadius: 50,
		elevation: 20,
	},
	scrollContent: {
		// flexGrow: 1,
		justifyContent: 'center',
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
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	closeButtonText: {
		// NOTE: Typography handled by CaptionText
	},
	header: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		borderBottomColor: ReMapColors.ui.border,
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
	},
	stickyHeader: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
		backgroundColor: ReMapColors.ui.background,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},
	headerText: {
		// NOTE: Typography handled by HeaderText
	},
	bodyScrollView: {
		flex: 1,
	},
	body: {
		paddingHorizontal: 25,
		paddingVertical: 15,
		minHeight: 100,
	},
	bodyNoPadding: {
		minHeight: 100,
	},
	bodyScrollContent: {
		paddingBottom: 20,
		// flexGrow: 1,
	},
	footer: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 25,
		flexDirection: 'row',
		borderTopColor: ReMapColors.ui.border,
		borderTopWidth: 1,
		gap: 30,
		backgroundColor: ReMapColors.ui.background,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
	},
	stickyFooter: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},
});

// ===================
//   COMPOUND EXPORTS
// ===================
Modal.Header = ModalHeader;
Modal.Container = ModalContainer;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
