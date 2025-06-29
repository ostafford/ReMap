// ================
//   CORE IMPORTS
// ================
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
	TextInput,
	View,
	StyleSheet,
	StyleProp,
	TextStyle,
	ViewStyle,
	TextInputProps,
	TouchableOpacity,
} from 'react-native';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { LabelText, ErrorText, CaptionText } from './Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   TYPE DEFINITIONS
// ====================
export interface InputProps {
	label?: string;
	secureToggle?: boolean;
	style?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	helperText?: string;
	// TextInput props
	value?: string;
	onChangeText?: (text: string) => void;
	placeholder?: string;
	placeholderTextColor?: string;
	secureTextEntry?: boolean;
	keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
	multiline?: boolean;
	numberOfLines?: number;
	onFocus?: (e: any) => void;
	onBlur?: (e: any) => void;
	editable?: boolean;
	ref?: any;
}

// ====================
//   REF INTERFACE
// ====================
export interface InputRef {
	focus: () => void;
	blur: () => void;
	measureInWindow: (
		callback: (x: number, y: number, width: number, height: number) => void
	) => void;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const Input = forwardRef<InputRef, InputProps>(
	(
		{
			label,
			secureTextEntry,
			secureToggle = false,
			style,
			inputStyle,
			error = '',
			required = false,
			disabled = false,
			helperText,
			onFocus,
			onBlur,
			...props
		},
		ref
	) => {
		// ==================
		//   STATE MANAGEMENT
		// ==================
		const [isSecure, setIsSecure] = useState(secureTextEntry);
		const [isFocused, setIsFocused] = useState(false);

		// Internal ref for the TextInput
		const textInputRef = React.useRef<TextInput>(null);
		const containerRef = React.useRef<View>(null);

		// ==================
		//   REF IMPLEMENTATION
		// ==================
		useImperativeHandle(ref, () => ({
			focus: () => {
				textInputRef.current?.focus();
			},
			blur: () => {
				textInputRef.current?.blur();
			},
			measureInWindow: (callback) => {
				containerRef.current?.measureInWindow(callback);
			},
		}));

		// ==================
		//   EVENT HANDLERS
		// ==================
		const toggleSecure = () => {
			if (secureToggle && !disabled) {
				setIsSecure((prev) => !prev);
			}
		};

		const handleFocus = (e: any) => {
			setIsFocused(true);
			onFocus?.(e);
		};

		const handleBlur = (e: any) => {
			setIsFocused(false);
			onBlur?.(e);
		};

		// ==================
		//   DYNAMIC STYLING
		// ==================
		const getInputWrapperStyle = () => {
			let borderColor = ReMapColors.ui.border;
			let backgroundColor = ReMapColors.ui.background;

			if (disabled) {
				backgroundColor = ReMapColors.ui.cardBackground;
				borderColor = ReMapColors.ui.border;
			} else if (error) {
				borderColor = ReMapColors.semantic.error;
			} else if (isFocused) {
				borderColor = ReMapColors.primary.violet;
			}

			return {
				...styles.inputWrapper,
				borderColor,
				backgroundColor,
				borderWidth: isFocused ? 2 : 1,
				opacity: disabled ? 0.6 : 1,
			};
		};

		return (
			<View ref={containerRef} style={[styles.container, style]}>
				{/* Label Section */}
				{label && (
					<View style={styles.labelContainer}>
						<LabelText
							style={[
								styles.label,
								error && styles.labelError,
								required && styles.labelRequired,
							]}
						>
							{label}
							{required && (
								<ErrorText style={styles.requiredIndicator}>
									{' '}
									*
								</ErrorText>
							)}
						</LabelText>
					</View>
				)}

				{/* Input Wrapper Section */}
				<View style={getInputWrapperStyle()}>
					<TextInput
						ref={textInputRef}
						style={[
							styles.input,
							inputStyle,
							disabled && styles.disabledInput,
							props.multiline && styles.multilineInput,
						]}
						secureTextEntry={isSecure}
						onFocus={handleFocus}
						onBlur={handleBlur}
						editable={!disabled}
						placeholderTextColor={
							ReMapColors.ui.textSecondary || '#888'
						}
						{...props}
					/>

					{secureToggle && !disabled && (
						<TouchableOpacity
							onPress={toggleSecure}
							style={styles.toggleButton}
						>
							<CaptionText style={styles.toggleText}>
								{isSecure ? 'Show' : 'Hide'}
							</CaptionText>
						</TouchableOpacity>
					)}
				</View>

				{/* Feedback Section */}
				{error && (
					<ErrorText style={styles.errorText}>{error}</ErrorText>
				)}

				{!error && helperText && (
					<CaptionText style={styles.helperText}>
						{helperText}
					</CaptionText>
				)}
			</View>
		);
	}
);

// NOTE: Add display name for debugging
Input.displayName = 'Input';

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
	},
	labelContainer: {
		marginBottom: 6,
	},
	label: {},
	labelError: {
		color: ReMapColors.semantic.error,
	},
	labelRequired: {
		fontWeight: '600',
	},
	requiredIndicator: {},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-start', // NOTE: This allows multiline text input
		borderRadius: 15,
		borderWidth: 1,
		minHeight: 44,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	input: {
		borderRadius: 15,
		flex: 1,
		fontSize: 14,
		padding: 12,
		color: ReMapColors.ui.text,
		includeFontPadding: false,
		textAlignVertical: 'top',
	},
	multilineInput: {
		minHeight: 100,
		paddingTop: 12,
	},
	disabledInput: {
		color: ReMapColors.ui.textSecondary,
	},
	toggleButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginRight: 4,
		minWidth: 44,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		alignSelf: 'flex-start', // Align to top for multiline
		marginTop: 4,
	},
	toggleText: {},
	errorText: {
		marginTop: 4,
		marginLeft: 2,
	},
	helperText: {
		marginTop: 4,
		marginLeft: 2,
	},
});
