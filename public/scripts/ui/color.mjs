export const Color = Object.freeze({
	// Base Colors
	BLUE: 'blue',
	AZURE: 'azure',
	INDIGO: 'indigo',
	PURPLE: 'purple',
	PINK: 'pink',
	RED: 'red',
	ORANGE: 'orange',
	YELLOW: 'yellow',
	LIME: 'lime',
	GREEN: 'green',
	TEAL: 'teal',
	CYAN: 'cyan',

	// Status and Semantic Colors
	PRIMARY: 'primary',
	SECONDARY: 'secondary',
	SUCCESS: 'success',
	INFO: 'info',
	WARNING: 'warning',
	DANGER: 'danger',
	LIGHT: 'light',
	DARK: 'dark',
	MUTED: 'muted',

	// Grayscale
	GRAY_50: 'gray-50',
	GRAY_100: 'gray-100',
	GRAY_200: 'gray-200',
	GRAY_300: 'gray-300',
	GRAY_400: 'gray-400',
	GRAY_500: 'gray-500',
	GRAY_600: 'gray-600',
	GRAY_700: 'gray-700',
	GRAY_800: 'gray-800',
	GRAY_900: 'gray-900',
	GRAY_950: 'gray-950',

	// Special
	BLACK: 'black',
	WHITE: 'white',
	TRANSPARENT: 'transparent'
})

export const getColorHex = (colorName, lighten = false) => {
	// Tabler prefixes its color variables with --tblr-
	const variableName = `--tblr-${colorName}${lighten ? '-lt' : ''}`

	const color = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
	return color;
}

export const getColorVariant = (colorName, variant = null) => {
	// Tabler prefixes its color variables with --tblr-
	let variableName = `--tblr-${colorName}`
	if (variant) {
		variableName += `-${variant}`
	}

	const color = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
	return color;
}
