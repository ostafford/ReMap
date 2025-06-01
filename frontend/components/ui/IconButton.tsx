// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

interface IconButtonProps {
	icon: React.ComponentProps<typeof FontAwesome>['name'];
	onPress?: () => void;
	size?: number;
	color?: string;
	backgroundColor?: string;
	style?: ViewStyle;
	disabled?: boolean;
	variant?: 'filled' | 'outline' | 'ghost';
}

export const IconButton = ({
  icon,
  onPress,
  size = 24,
  color = ReMapColors.ui.cardBackground,
  backgroundColor = ReMapColors.primary.accent,
  style,
  disabled = false,
  variant = 'filled',
}: IconButtonProps) => {
	const getButtonStyle = () => {
		const baseStyle = [styles.button, style];

		switch (variant) {
			case 'filled':
				return [
					...baseStyle,
					styles.filledButton,
					{
						backgroundColor: disabled
							? ReMapColors.ui.textSecondary
							: backgroundColor,
					},
				];
			case 'outline':
				return [
					...baseStyle,
					styles.outlineButton,
					{
						borderColor: disabled
							? ReMapColors.ui.textSecondary
							: backgroundColor,
						backgroundColor: 'transparent',
					},
				];
			case 'ghost':
				return [
					...baseStyle,
					styles.ghostButton,
					{ backgroundColor: 'transparent' },
				];
			default:
				return baseStyle;
		}
	};

	const getIconColor = () => {
		if (disabled) return ReMapColors.ui.textSecondary;

		switch (variant) {
			case 'filled':
				return color;
			case 'outline':
			case 'ghost':
				return backgroundColor;
			default:
				return color;
		}
	};

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				...getButtonStyle(),
				pressed && !disabled && styles.pressed,
			]}
		>
			<FontAwesome name={icon} size={size} color={getIconColor()} />
		</Pressable>
	);
};

// Pre-made common icon buttons
export const BackButton = ({
	onPress,
	style,
}: {
	onPress: () => void;
	style?: ViewStyle;
}) => (
	<IconButton
		icon="arrow-left"
		onPress={onPress}
		style={style}
		variant="ghost"
		backgroundColor={ReMapColors.ui.text}
	/>
);
export const ForwardButton = ({
	onPress,
	style,
}: {
	onPress: () => void;
	style?: ViewStyle;
}) => (
	<IconButton
		icon="arrow-right"
		onPress={onPress}
		style={style}
		variant="ghost"
		backgroundColor={ReMapColors.ui.text}
	/>
);

export const CloseButton = ({
	onPress,
	style,
}: {
	onPress: () => void;
	style?: ViewStyle;
}) => (
	<IconButton
		icon="times"
		onPress={onPress}
		style={style}
		variant="ghost"
		backgroundColor={ReMapColors.ui.textSecondary}
	/>
);

export const InfoButton = ({
	onPress,
	style,
}: {
	onPress: () => void;
	style?: ViewStyle;
}) => (
	<IconButton
		icon="info-circle"
		onPress={onPress}
		style={style}
		variant="ghost"
		backgroundColor={ReMapColors.semantic.info}
	/>
);

export const SettingsButton = ({
	onPress,
	style,
}: {
	onPress: () => void;
	style?: ViewStyle;
}) => (
	<IconButton
		icon="cog"
		onPress={onPress}
		style={style}
		variant="ghost"
		backgroundColor={ReMapColors.ui.text}
	/>
);

export const EditButton = ({
	onPress,
	style,
}: {
	onPress: () => void;
	style?: ViewStyle;
}) => (
	<IconButton
		icon="edit"
		onPress={onPress}
		style={style}
		backgroundColor={ReMapColors.primary.blue}
	/>
);

export const DeleteButton = ({
	onPress,
	style,
}: {
	onPress: () => void;
	style?: ViewStyle;
}) => (
	<IconButton
		icon="trash"
		onPress={onPress}
		style={style}
		backgroundColor={ReMapColors.semantic.error}
	/>
);

const styles = StyleSheet.create({
	button: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 4,
	},
	filledButton: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	outlineButton: {
		borderWidth: 2,
	},
	ghostButton: {
		// No additional styling needed
	},
	pressed: {
		opacity: 0.7,
		transform: [{ scale: 0.95 }],
	},
});
