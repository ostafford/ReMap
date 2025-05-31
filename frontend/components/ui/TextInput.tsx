// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import {
	TextInput,
	View,
	Text,
	StyleSheet,
	StyleProp,
	TextStyle,
	ViewStyle,
	TextInputProps,
	TouchableOpacity,
} from 'react-native';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   TYPE DEFINITIONS
// ====================
interface InputProps extends TextInputProps {
	label?: string;
	secureToggle?: boolean; // incase users wanna see their password!
	style?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
	error?: string;
	required?: boolean;
	disabled?: boolean;
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
	error,
	required = false,
	disabled = false,
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

	const getLabelStyle = () => ({
		...styles.label,
		color: error ? ReMapColors.semantic.error : ReMapColors.ui.text,
		...(required && { fontWeight: '500' as const }),
	});

	return (
		<View style={[styles.container, style]}>
			{/* ================ */}
			{/* LABEL SECTION	 */}
			{/* ================ */}
			{label && (
				<Text style={getLabelStyle()}>
					{label}
					{required && (
						<Text style={styles.requiredIndicator}> *</Text>
					)}
				</Text>
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

				{/* Security Toggle Button */}
				{secureToggle && !disabled && (
					<TouchableOpacity
						onPress={toggleSecure}
						style={styles.toggleButton}
					>
						<Text style={styles.toggleText}>
							{isSecure ? 'Show' : 'Hide'}{' '}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* ========================== 	*/}
			{/*   ERROR MESSAGE SECTION 	*/}
			{/* ========================== 	*/}

			{error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
	},
	label: {
		marginBottom: 6,
		fontSize: 14,
		color: ReMapColors.ui.text,
	},
	requiredIndicator: {
		color: ReMapColors.semantic.error,
		fontSize: 14,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 15,
		borderWidth: 1,
		minHeight: 44,
	},
	input: {
		borderRadius: 15,
		flex: 1,
		fontSize: 14,
		padding: 12,
		color: ReMapColors.ui.text,
	},
	disabledInput: {
		color: ReMapColors.ui.textSecondary,
	},
	toggleButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginRight: 4,
	},
	toggleText: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
	},
	errorText: {
		marginTop: 4,
		fontSize: 12,
		color: ReMapColors.semantic.error,
		marginLeft: 2,
	},
});
