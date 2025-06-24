// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { Pressable, StyleSheet, ViewStyle, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { ButtonText, CaptionText } from './Typography';

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
	label?: string; // New: Optional text label
	helper?: string; // New: Optional helper text
	showLabel?: boolean; // New: Control label visibility
}

export const IconButton = ({
	icon,
	onPress,
	size = 16,
	color = ReMapColors.ui.cardBackground,
	backgroundColor = ReMapColors.primary.black,
	style,
	disabled = false,
	variant = 'filled',
	label,
	helper,
	showLabel = true,
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

	// New: Determine if this should be a column layout (icon + label)
	const hasTextContent = (label && showLabel) || helper;
	const isColumnLayout = hasTextContent;

	return (
		<View style={isColumnLayout ? styles.columnContainer : undefined}>
			<Pressable
				onPress={onPress}
				disabled={disabled}
				style={({ pressed }) => [
					...getButtonStyle(),
					pressed && !disabled && styles.pressed,
				]}
			>
				<FontAwesome name={icon} size={size} color={getIconColor()} />

				{/* Inline label for filled buttons when space allows */}
				{label && showLabel && variant === 'filled' && (
					<ButtonText
						style={styles.inlineLabel}
						color={getIconColor()}
						numberOfLines={1}
					>
						{label}
					</ButtonText>
				)}
			</Pressable>

			{/* Column layout text content */}
			{isColumnLayout && (
				<View style={styles.textContainer}>
					{label && showLabel && variant !== 'filled' && (
						<ButtonText
							style={styles.columnLabel}
							color={
								disabled
									? ReMapColors.ui.textSecondary
									: ReMapColors.ui.text
							}
							align="center"
							numberOfLines={1}
						>
							{label}
						</ButtonText>
					)}

					{helper && (
						<CaptionText
							style={styles.helperText}
							color={
								disabled
									? ReMapColors.ui.textSecondary
									: ReMapColors.ui.textSecondary
							}
							align="center"
						>
							{helper}
						</CaptionText>
					)}
				</View>
			)}
		</View>
	);
};

// Pre-made common icon buttons with Typography integration
export const BackButton = ({
	onPress,
	style,
	label,
}: {
	onPress: () => void;
	style?: ViewStyle;
	label?: string;
}) => (
	<IconButton
		icon="arrow-left"
		onPress={onPress}
		style={style}
		variant="ghost"
		backgroundColor={ReMapColors.ui.text}
		label={label}
		helper="Go back"
	/>
);

export const ForwardButton = ({
	onPress,
	style,
	label,
}: {
	onPress: () => void;
	style?: ViewStyle;
	label?: string;
}) => (
	<IconButton
		icon="arrow-right"
		onPress={onPress}
		style={style}
		variant="ghost"
		backgroundColor={ReMapColors.ui.text}
		label={label}
		helper="Continue"
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
		label="Settings"
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
		label="Edit"
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
		label="Delete"
	/>
);

const styles = StyleSheet.create({
	button: {
		width: 40,
		height: 40,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		margin: 4,
		flexDirection: 'row', // Allow for inline labels
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

	// New: Typography integration styles
	columnContainer: {
		alignItems: 'center',
		minWidth: 60,
	},
	textContainer: {
		marginTop: 4,
		alignItems: 'center',
	},
	inlineLabel: {
		marginLeft: 8,
		flex: 0, // Don't grow
	},
	columnLabel: {
		marginBottom: 2,
	},
	helperText: {
		// Typography handles all styling
	},
});
