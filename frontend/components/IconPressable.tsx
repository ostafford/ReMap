import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { StyleProp, ButtonProps } from "react-native";

interface IconPressableProps {
	children: React.ReactNode;
	onPress: () => void;
	style?: StyleProp<ButtonProps>;
}

export const IconPressable = ({ children, onPress, style }: IconPressableProps) => {
	return (
		<Pressable onPress={onPress} style={[styles.iconPressable, style]}> {/* ignore this error - sthen 2nd styles gives us the ability to override the default style here */}
			<Text style={styles.iconPressableText}>{children}</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create ({
	iconPressable: {
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderRadius: 25,
		borderWidth: 3,
		borderColor: "#1E1E1E",
		margin: 10,
		alignItems: 'center',
		justifyContent: 'center', 
		width: 100,
		height: 100,
	},
	iconPressableText: {
		color: "black",
		fontSize: 10
	}
});
