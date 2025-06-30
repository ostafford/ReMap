// ================================
//   UI COMPONENTS INDEX
// ================================
// Centralized exports for all UI components
// This provides a single source of truth for component imports

// Core UI Components
export { Button } from './Button';
export { Input } from './TextInput';
export { Modal } from './Modal';
export { IconButton } from './IconButton';

// Typography System
export {
	DisplayText,
	HeaderText,
	SubheaderText,
	BodyText,
	BodyLargeText,
	BodySmallText,
	LabelText,
	CaptionText,
	ButtonText,
	LinkText,
	ErrorText,
	SuccessText,
} from './Typography';

// Message Components
export {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
	InfoMessage,
	ToastMessage,
} from './Messages';

// Specialized Components
export { AuthModal } from './AuthModal';
export { SplashUI } from './SplashUI';
export { PinBottomSheet } from './PinBottomSheet';
export { TopNotificationSheet } from './TopNotificationSheet';
export { NominatimSearch } from './NominatimSearch';
export { FoursquareSearch } from './FourSquareSearch';
export { SpinningGlobe } from './Globe';

// Type Exports
export type { CustomButtonProps } from './Button';
export type { InputProps, InputRef } from './TextInput';
export type { BaseTextProps } from './Typography';
