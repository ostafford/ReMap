// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
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
interface InputProps extends TextInputProps {
	label?: string;
	secureToggle?: boolean; // in case users wanna see their password!
	style?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	helperText?: string;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const Input = ({
	label,
	secureTextEntry,
	secureToggle = false,
	style,
	inputStyle,
	error = '',
	required = false,
	disabled = false,
	helperText,
	...props
}: InputProps) => {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	// NOTE: This is password related
	const [isSecure, setIsSecure] = useState(secureTextEntry);
	const [isFocused, setIsFocused] = useState(false);

	const toggleSecure = () => {
		if (secureToggle && !disabled) {
			setIsSecure((prev) => !prev);
		}
	};

	const handleFocus = (e: any) => {
		setIsFocused(true);
		props.onFocus?.(e);
	};

	const handleBlur = (e: any) => {
		setIsFocused(false);
		props.onBlur?.(e);
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
		<View style={[styles.container, style]}>
			{/* ================ */}
			{/* LABEL SECTION	 */}
			{/* ================ */}
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

			{/* ======================= */}
			{/* INPUT WRAPPER SECTION 	*/}
			{/* ======================= */}
			<View style={getInputWrapperStyle()}>
				<TextInput
					style={[
						styles.input,
						inputStyle,
						disabled && styles.disabledInput,
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

			{/* ========================== 	*/}
			{/*   FEEDBACK SECTION 	*/}
			{/* ========================== 	*/}

			{error && <ErrorText style={styles.errorText}>{error}</ErrorText>}

			{!error && helperText && (
				<CaptionText style={styles.helperText}>
					{helperText}
				</CaptionText>
			)}
		</View>
	);
};

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
		alignItems: 'center',
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
		textAlignVertical: 'center',
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
