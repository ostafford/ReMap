import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { StyleProp, ButtonProps } from "react-native";
import { ReMapColors, BrandColors } from '@/constants/Colors';

interface CustomButtonProps {
	children: React.ReactNode;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
}

export const Button = ({ children, onPress, style }: CustomButtonProps) => {
	return (
		<Pressable onPress={onPress} style={[styles.button, style]}> {/* ignore this error - sthen 2nd styles gives us the ability to override the default style here */}
			<Text style={styles.buttonText}>{children}</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create ({
	button: {
		backgroundColor: ReMapColors.primary.cadet,
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
