import { Pressable, Text, StyleSheet } from "react-native";
import { StyleProp, ButtonProps } from "react-native";

interface CustomButtonProps {
	children: React.ReactNode;
	onPress: () => void;
	style?: StyleProp<ButtonProps>;
}

export const Button = ({ children, onPress,style }: CustomButtonProps) => {
	return (
		<Pressable onPress={onPress} style={[styles.button, style]}>
			<Text style={styles.buttonText}>{children}</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create ({
	button: {
		backgroundColor: "black",
		padding: 20,
		borderRadius: 25,
		margin: 10
	},
	buttonText: {
		color: "white",
		fontSize: 20
	}
});
