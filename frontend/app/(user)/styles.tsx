import { StyleSheet } from "react-native";
import { ReMapColors } from '@/constants/Colors';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},

	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 8,
	},

	backButton: {
		padding: 8,
		borderRadius: 8,
	},

	backButtonText: {
		fontSize: 16,
		color: ReMapColors.primary.black,
	},

	tabContent: {
		flex: 1,
		padding: 24,
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	username: {
		fontSize: 20,
	},

	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginTop: 32,
		paddingBottom: 24,
	},

	circleButton: {
		backgroundColor: ReMapColors.primary.black,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 18,
	},

	buttonText: {
		fontWeight: '600',
		fontSize: 10,
		color: 'black',
	},

	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 20,
	},

	profileImagePlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},

	profileImagePlaceholderText: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#666',
		textAlign: 'center',
	},
});
