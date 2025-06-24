import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { StyleProp, ButtonProps } from "react-native";

interface CustomButtonProps {
	children: React.ReactNode;
	onPress: () => void;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<any>;
}

export const CustomButton = ({ children, onPress, style, textStyle }: CustomButtonProps) => {
	return (
		<Pressable onPress={onPress} style={[styles.button, style]}>
			<Text style={[styles.buttonText, textStyle]}>{children}</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create ({
	button: {
		backgroundColor: "#1E1E1E",
		padding: 20,
		borderRadius: 25,
		margin: 10,
		alignItems: 'center',
    	justifyContent: 'center', 
	},
	buttonText: {
		color: "white",
		fontSize: 20,
		fontWeight: '500',
	}
});
