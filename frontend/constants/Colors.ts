/**
 * ReMap Color Migration Bridge
 * This file safely transitions from the old color system to the new earth-inspired palette
 * while maintaining backward compatibility for existing components.
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

	// BACKWARD COMPATIBILITY: Old primary colors mapped to new earth/adventure colors
	primary: {
		accent: '#CC7A37', // OLD: #4800E2 -> NEW: sunsetOrange (main interactive color)
		black: '#2D2A26', // OLD: #1E1E1E -> NEW: deep earth brown
		violet: '#6B5B7A', // OLD: #855988 -> NEW: mountainPurple (similar purple tone)
		lavender: '#7A8B73', // OLD: #6B4984 -> NEW: sageGreen (muted nature tone)
		regalia: '#7A8B73', // OLD: #6B4984 -> NEW: sageGreen (same as lavender)
		blue: '#4A6B7C', // OLD: #2B2F77 -> NEW: oceanBlue (nature-inspired blue)
		cadet: '#2D4A3E', // OLD: #141852 -> NEW: deepForest (dark accent)
		cetacean: '#2D4A3E', // OLD: #070B34 -> NEW: deepForest (darkest color)
	},

	// UI Colors (Earth-Inspired) - Enhanced from original
	ui: {
		background: '#F5F2ED', // Warm cream background (upgraded)
		cardBackground: '#FFFFFF', // Pure white for contrast (same)
		surface: '#FAFAF9', // NEW: Soft white surface
		text: '#2D2A26', // Deep earth brown text (upgraded)
		textSecondary: '#6B6B68', // Muted earth gray (upgraded)
		textLight: '#8B8B88', // NEW: Light gray for captions
		border: '#E6E1D8', // Soft earth border (upgraded)
		divider: '#D4CFC4', // NEW: Subtle divider
	},

	// Semantic Colors (Nature-Inspired) - Enhanced
	semantic: {
		success: '#5A8C6B', // Growth green (more natural)
		error: '#B85C57', // Autumn red (warmer than harsh red)
		warning: '#CC8B37', // Amber warning (earthier)
		info: '#6B8BA3', // Sky blue info (softer)
	},

	// NEW: Memory & Pin Types
	memory: {
		personal: '#7A8B73', // Sage green - personal memories
		shared: '#6B8BA3', // Sky blue - shared memories
		adventure: '#CC7A37', // Sunset orange - adventures
		peaceful: '#8B7355', // Warm brown - peaceful moments
		exciting: '#A0524D', // Campfire red - exciting times
	},

	// NEW: Map & Location Colors
	location: {
		current: '#CC7A37', // Sunset orange - current location
		visited: '#5A8C6B', // Success green - visited places
		planned: '#6B8BA3', // Info blue - planned visits
		favorite: '#B85C57', // Warm red - favorite places
	},
};

// Quick access brand colors for consistent theming (Updated)
export const BrandColors = {
	// Main brand identity - using new earth colors but keeping familiar names
	primary: ReMapColors.adventure.sunsetOrange, // More vibrant than old violet
	secondary: ReMapColors.earth.forestGreen, // Nature-inspired secondary
	tertiary: ReMapColors.earth.sageGreen, // Supporting color

	// Backgrounds
	background: ReMapColors.ui.background,
	surface: ReMapColors.ui.surface, // NEW
	card: ReMapColors.ui.cardBackground,

	// Text
	text: ReMapColors.ui.text,
	textSecondary: ReMapColors.ui.textSecondary,
	textLight: ReMapColors.ui.textLight, // NEW

	// Interactive elements
	interactive: ReMapColors.adventure.oceanBlue,
	accent: ReMapColors.adventure.goldenHour,

	// Status colors
	success: ReMapColors.semantic.success,
	error: ReMapColors.semantic.error,
	warning: ReMapColors.semantic.warning,
	info: ReMapColors.semantic.info,

	// BACKWARD COMPATIBILITY: Old brand color mappings
	white: ReMapColors.ui.cardBackground,
	dark: ReMapColors.primary.cadet, // Maps to deepForest now
};

// NEW: Color combinations for different memory types
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

// NEW: Accessibility helpers
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

// NEW: Starter Pack Category Colors (for worldmap.tsx)
export const StarterPackColors = {
	cafes: '#8B7355', // Warm brown
	nightlife: '#6B5B7A', // Mountain purple
	foodie: '#CC7A37', // Sunset orange
	culture: '#6B8BA3', // Sky blue
	nature: '#5A8C6B', // Forest green
	urban: '#4A6B7C', // Ocean blue
};
