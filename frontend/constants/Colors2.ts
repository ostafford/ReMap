/**
 * ReMap Earth-Inspired Adventure Color Palette
 * Creating memories as natural as the earth itself
 */

/**
 * Color usage Doc String:
 *
 * import { ReMapColors, BrandColors } from '@/constants/Colors';
 *
 * // Quick usage:
 * backgroundColor: BrandColors.primary
 *
 * // Specific earth color:
 * backgroundColor: ReMapColors.earth.forestGreen
 *
 * // Adventure colors:
 * color: ReMapColors.adventure.sunsetOrange
 */

const tintColorLight = '#8B7355'; // Warm earth tone
const tintColorDark = '#F5E6D3'; // Cream

export default {
	light: {
		text: '#2D2A26', // Deep earth brown
		background: '#F5F2ED', // Warm cream
		tint: tintColorLight,
		tabIconDefault: '#A0956B', // Muted sage
		tabIconSelected: tintColorLight,
	},
	dark: {
		text: '#F5E6D3', // Cream
		background: '#2D2A26', // Deep earth brown
		tint: tintColorDark,
		tabIconDefault: '#8B7355', // Warm earth
		tabIconSelected: tintColorDark,
	},
};

export const ReMapColors = {
	// Earth-Inspired Primary Colors
	earth: {
		deepForest: '#2D4A3E', // Deep forest green - primary dark
		forestGreen: '#4A6B5C', // Forest canopy - primary
		sageGreen: '#7A8B73', // Sage brush - secondary
		warmBrown: '#8B7355', // Tree bark - accent
		richSoil: '#6B5B47', // Rich earth - deep accent
		sandstone: '#B8A082', // Desert stone - light accent
	},

	// Adventure & Memory Colors
	adventure: {
		sunsetOrange: '#CC7A37', // Canyon sunset
		goldenHour: '#D4A574', // Golden hour light
		oceanBlue: '#4A6B7C', // Deep ocean
		skyBlue: '#7A9BB5', // Adventure sky
		campfireRed: '#A0524D', // Campfire ember
		mountainPurple: '#6B5B7A', // Mountain shadow
	},

	// Scrapbook Paper & Vintage Colors
	vintage: {
		parchment: '#F5E6D3', // Old paper
		sepia: '#E6D7C3', // Sepia photo tone
		vintageBlue: '#6B7A8B', // Faded denim
		antiqueGold: '#B8A082', // Antique brass
		dustyRose: '#B8848A', // Faded rose
		charcoal: '#4A4A4A', // Charcoal sketch
	},

	// UI Colors (Earth-Inspired)
	ui: {
		background: '#F5F2ED', // Warm cream background
		cardBackground: '#FFFFFF', // Pure white for contrast
		surface: '#FAFAF9', // Soft white surface
		text: '#2D2A26', // Deep earth brown text
		textSecondary: '#6B6B68', // Muted earth gray
		textLight: '#8B8B88', // Light gray for captions
		border: '#E6E1D8', // Soft earth border
		divider: '#D4CFC4', // Subtle divider
	},

	// Semantic Colors (Nature-Inspired)
	semantic: {
		success: '#5A8C6B', // Growth green
		error: '#B85C57', // Autumn red
		warning: '#CC8B37', // Amber warning
		info: '#6B8BA3', // Sky blue info
	},

	// Memory & Pin Types
	memory: {
		personal: '#7A8B73', // Sage green - personal memories
		shared: '#6B8BA3', // Sky blue - shared memories
		adventure: '#CC7A37', // Sunset orange - adventures
		peaceful: '#8B7355', // Warm brown - peaceful moments
		exciting: '#A0524D', // Campfire red - exciting times
	},

	// Map & Location Colors
	location: {
		current: '#CC7A37', // Sunset orange - current location
		visited: '#5A8C6B', // Success green - visited places
		planned: '#6B8BA3', // Info blue - planned visits
		favorite: '#B85C57', // Warm red - favorite places
	},
};

// Quick access brand colors for consistent theming
export const BrandColors = {
	// Main brand identity
	primary: ReMapColors.earth.forestGreen, // Main brand color
	secondary: ReMapColors.adventure.sunsetOrange, // Accent color
	tertiary: ReMapColors.earth.sageGreen, // Supporting color

	// Backgrounds
	background: ReMapColors.ui.background,
	surface: ReMapColors.ui.surface,
	card: ReMapColors.ui.cardBackground,

	// Text
	text: ReMapColors.ui.text,
	textSecondary: ReMapColors.ui.textSecondary,
	textLight: ReMapColors.ui.textLight,

	// Interactive elements
	interactive: ReMapColors.adventure.oceanBlue,
	accent: ReMapColors.adventure.goldenHour,

	// Status colors
	success: ReMapColors.semantic.success,
	error: ReMapColors.semantic.error,
	warning: ReMapColors.semantic.warning,
	info: ReMapColors.semantic.info,
};

// Color combinations for different memory types
export const MemoryThemes = {
	adventure: {
		primary: ReMapColors.adventure.sunsetOrange,
		secondary: ReMapColors.adventure.goldenHour,
		background: ReMapColors.vintage.parchment,
		text: ReMapColors.earth.deepForest,
	},
	nature: {
		primary: ReMapColors.earth.forestGreen,
		secondary: ReMapColors.earth.sageGreen,
		background: ReMapColors.ui.surface,
		text: ReMapColors.earth.deepForest,
	},
	vintage: {
		primary: ReMapColors.vintage.sepia,
		secondary: ReMapColors.vintage.antiqueGold,
		background: ReMapColors.vintage.parchment,
		text: ReMapColors.vintage.charcoal,
	},
	peaceful: {
		primary: ReMapColors.earth.warmBrown,
		secondary: ReMapColors.adventure.skyBlue,
		background: ReMapColors.ui.background,
		text: ReMapColors.ui.text,
	},
};

// Accessibility helpers
export const AccessibleColors = {
	// High contrast combinations for accessibility
	highContrast: {
		text: ReMapColors.earth.deepForest,
		background: ReMapColors.ui.cardBackground,
	},
	// Focus states
	focus: {
		border: ReMapColors.adventure.oceanBlue,
		background: ReMapColors.adventure.skyBlue + '20', // 20% opacity
	},
	// Interactive states
	hover: {
		background: ReMapColors.ui.surface,
	},
	pressed: {
		background: ReMapColors.ui.border,
	},
};
