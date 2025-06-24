// IN TESTING STILL!!!

/**
 * TOP NOTIFICATION SHEET - REVERSE BOTTOMSHEET COMPONENT
 * Purpose: Displays success notifications sliding down from the top of the screen
 * Used for: Pin creation confirmations and other success messages
 * Pattern: Animated notification banner with auto-dismiss and gesture controls
 */

// ================
//   CORE IMPORTS
// ================
import React, { useEffect, useRef } from 'react';
import {
	View,
	StyleSheet,
	Animated,
	Dimensions,
	TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { BodyText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ========================
//   TYPE DEFINITIONS
// ========================
interface TopNotificationSheetProps {
	isVisible: boolean;
	title: string;
	message?: string;
	onClose: () => void;
	autoCloseDelay?: number;
	onPress?: () => void;
}

// ========================
//   MAIN COMPONENT
// ========================
export const TopNotificationSheet: React.FC<TopNotificationSheetProps> = ({
	isVisible,
	title,
	message,
	onClose,
	autoCloseDelay = 3000, // Default 3 seconds
	onPress,
}) => {
	// ==================
	//   CONSTANTS & REFS
	// ==================
	const { height } = Dimensions.get('window');
	const insets = useSafeAreaInsets();
	const slideAnim = useRef(new Animated.Value(-200)).current;
	const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ==================
	//   ANIMATION FUNCTIONS
	// ==================

	const slideDown = () => {
		Animated.spring(slideAnim, {
			toValue: 0, // Final position at top of screen
			useNativeDriver: true,
			damping: 15,
			stiffness: 150,
			mass: 1,
		}).start();
	};

	const slideUp = () => {
		Animated.timing(slideAnim, {
			toValue: -200, // Move back above screen
			duration: 300,
			useNativeDriver: true,
		}).start(() => {
			onClose();
		});
	};

	// ==================
	//   GESTURE HANDLING
	// ==================

	const handleGestureEvent = Animated.event(
		[{ nativeEvent: { translationY: slideAnim } }],
		{ useNativeDriver: true }
	);

	const handleGestureStateChange = (event: any) => {
		if (event.nativeEvent.state === State.END) {
			const { translationY, velocityY } = event.nativeEvent;

			// If user dragged up significantly or with high velocity, dismiss
			if (translationY < -50 || velocityY < -500) {
				slideUp();
			} else {
				// Otherwise, spring back to original position
				slideDown();
			}
		}
	};

	// ==================
	//   LIFECYCLE EFFECTS
	// ==================

	// Main visibility effect - handles show/hide animations and auto-close timer
	// THIS FUNCTION IS STILL UNDERGOING FINAL TESTING (IT WORKS OTHERWISE BUT THROW A RANDOM ERROR)
	useEffect(() => {
		// Clear any existing timer first
		if (autoCloseTimer.current) {
			clearTimeout(autoCloseTimer.current);
			autoCloseTimer.current = null;
		}

		if (isVisible) {
			// Use requestAnimationFrame instead of setTimeout
			const animationFrame = requestAnimationFrame(() => {
				slideDown();
			});

			// Set up auto-close timer
			autoCloseTimer.current = setTimeout(() => {
				slideUp();
			}, autoCloseDelay);

			// Cleanup animation frame if component unmounts
			return () => {
				cancelAnimationFrame(animationFrame);
				if (autoCloseTimer.current) {
					clearTimeout(autoCloseTimer.current);
					autoCloseTimer.current = null;
				}
			};
		}

		// Cleanup function
		return () => {
			if (autoCloseTimer.current) {
				clearTimeout(autoCloseTimer.current);
				autoCloseTimer.current = null;
			}
		};
	}, [isVisible, autoCloseDelay]);

	// Reset animation position when visibility changes
	useEffect(() => {
		if (!isVisible) {
			slideAnim.setValue(-200);
		}
	}, [isVisible, slideAnim]);

	// ==================
	//   EVENT HANDLERS
	// ==================

	const handleBackdropPress = () => {
		slideUp();
	};

	const handleNotificationPress = () => {
		if (onPress) {
			onPress();
		}
		slideUp();
	};

	// ==================
	//   RENDER GUARD
	// ==================
	if (!isVisible) {
		return null;
	}

	// ==================
	//   MAIN RENDER
	// ==================
	return (
		<View style={styles.container}>
			{/* BACKDROP: Handles outside taps */}
			<TouchableOpacity
				style={styles.backdrop}
				activeOpacity={1}
				onPress={handleBackdropPress}
			>
				{/* ANIMATED NOTIFICATION SHEET */}
				<PanGestureHandler
					onGestureEvent={handleGestureEvent}
					onHandlerStateChange={handleGestureStateChange}
				>
					<Animated.View
						style={[
							styles.notificationSheet,
							{
								paddingTop: insets.top + 16,
								transform: [{ translateY: slideAnim }],
							},
						]}
					>
						<TouchableOpacity
							style={styles.notificationContent}
							onPress={handleNotificationPress}
							activeOpacity={0.8}
						>
							{/* SUCCESS ICON */}
							<View style={styles.iconContainer}>
								<BodyText style={styles.successIcon}>
									✅
								</BodyText>
							</View>

							{/* NOTIFICATION TEXT */}
							<View style={styles.textContainer}>
								<BodyText style={styles.notificationTitle}>
									{title}
								</BodyText>
								{message && (
									<CaptionText
										style={styles.notificationMessage}
									>
										{message}
									</CaptionText>
								)}
							</View>

							{/* DRAG INDICATOR */}
							<View style={styles.dragIndicator} />
						</TouchableOpacity>
					</Animated.View>
				</PanGestureHandler>
			</TouchableOpacity>
		</View>
	);
};

// ===============
//   STYLE SHEET
// ===============
const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1000,
	},

	backdrop: {
		flex: 1,
		backgroundColor: 'transparent',
	},

	notificationSheet: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		shadowColor: ReMapColors.primary.black,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
	},

	notificationContent: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		paddingBottom: 20,
	},

	iconContainer: {
		marginRight: 12,
	},

	successIcon: {
		fontSize: 24,
	},

	textContainer: {
		flex: 1,
	},

	notificationTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: ReMapColors.ui.text,
		marginBottom: 2,
	},

	notificationMessage: {
		fontSize: 13,
		color: ReMapColors.ui.textSecondary,
		lineHeight: 18,
	},

	// DRAG INDICATOR: Visual hint for swipe gesture
	dragIndicator: {
		width: 4,
		height: 20,
		backgroundColor: ReMapColors.ui.textSecondary,
		borderRadius: 2,
		opacity: 0.3,
		marginLeft: 8,
	},
});

export default TopNotificationSheet;
