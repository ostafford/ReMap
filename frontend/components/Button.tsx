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
		backgroundColor: "#1E1E1E",
		padding: 20,
		borderRadius: 25,
		margin: 10,
		alignItems: 'center',
    	justifyContent: 'center', 
	},
	buttonText: {
		color: "white",
		fontSize: 20
	}
});
