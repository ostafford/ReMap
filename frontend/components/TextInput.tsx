import React, { useState } from "react";
import {
	TextInput,
	View,
	Text,
	StyleSheet,
	StyleProp,
	TextStyle,
	ViewStyle,
	TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
	label?: string;
	secureToggle?: boolean; // incase users wanna see their password! 
	style?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
}

export const Input = ({
	label,
	secureTextEntry,
	secureToggle = false,
	style,
	inputStyle,
	...props
}: InputProps) => {
	const [isSecure, setIsSecure] = useState(secureTextEntry);

	const toggleSecure = () => {
		if (secureToggle) {
			setIsSecure((prev) => !prev);
		}
	};

	return (
		<View style={[styles.container, style]}>
			{label && <Text style={styles.label}>{label}</Text>}
			<View style={styles.inputWrapper}>
				<TextInput
					style={[styles.input, inputStyle]}
					secureTextEntry={isSecure}
					{...props}
				/>
				{secureToggle && (
					<Text onPress={toggleSecure} style={styles.toggle}>
						{isSecure ? "Show" : "Hide"}
					</Text>
				)}
			</View>
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
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderColor: "#ccc",
		borderRadius: 15,
		backgroundColor: "#D9D9D9",
	},
	input: {
		borderRadius: 15,
		flex: 1,
		fontSize: 12,
		padding: 12
	},
	toggle: {
		marginLeft: 10,
		color: "#1E1E1E",
		fontWeight: "bold",
	},
});
