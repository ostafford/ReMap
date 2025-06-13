// hooks/useSlideAnimation.ts
import { useRef, useState, useCallback } from 'react';
import { Animated } from 'react-native';

type AnimationType = 'timing' | 'spring';

interface SlideAnimationConfig {
	initialValue?: number;
	animationType?: AnimationType;
	duration?: number;
	springConfig?: {
		damping?: number;
		stiffness?: number;
		mass?: number;
	};
}

export const useSlideAnimation = ({
	initialValue = -100,
	animationType = 'timing',
	duration = 300,
	springConfig = {
		damping: 15,
		stiffness: 120,
		mass: 1,
	},
}: SlideAnimationConfig = {}) => {
	const [isVisible, setIsVisible] = useState(false);
	const animatedValue = useRef(new Animated.Value(initialValue)).current;

	const slideIn = useCallback(
		(customDuration?: number) => {
			setIsVisible(true);

			if (animationType === 'spring') {
				Animated.spring(animatedValue, {
					toValue: 0,
					useNativeDriver: true,
					...springConfig,
				}).start();
			} else {
				Animated.timing(animatedValue, {
					toValue: 0,
					duration: customDuration || duration,
					useNativeDriver: true,
				}).start();
			}
		},
		[animatedValue, animationType, duration, springConfig]
	);

	const slideOut = useCallback(
		(customDuration?: number, onComplete?: () => void) => {
			// Only call onComplete if it's actually a function
			const safeOnComplete =
				typeof onComplete === 'function' ? onComplete : undefined;

			if (animationType === 'spring') {
				Animated.spring(animatedValue, {
					toValue: initialValue,
					useNativeDriver: true,
					...springConfig,
				}).start(() => {
					setIsVisible(false);
					safeOnComplete?.();
				});
			} else {
				Animated.timing(animatedValue, {
					toValue: initialValue,
					duration: customDuration || duration,
					useNativeDriver: true,
				}).start(() => {
					setIsVisible(false);
					safeOnComplete?.();
				});
			}
		},
		[animatedValue, animationType, duration, initialValue, springConfig]
	);

	const toggle = useCallback(
		(onComplete?: () => void) => {
			// Only call onComplete if it's actually a function
			const safeOnComplete =
				typeof onComplete === 'function' ? onComplete : undefined;

			if (isVisible) {
				slideOut(undefined, safeOnComplete);
			} else {
				slideIn();
			}
		},
		[isVisible, slideIn, slideOut]
	);

	return {
		isVisible,
		animatedValue,
		slideIn,
		slideOut,
		toggle,
		// Convenience aliases
		show: () => slideIn(),
		hide: () => slideOut(),
		toggleSimple: () => toggle(),
	};
};
