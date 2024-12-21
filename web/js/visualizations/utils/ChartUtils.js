// utils/ChartUtils.js

/**
 * Normalizes an array of values to a 0-1 scale
 * Handles special cases like all zeros or single values
 */
export function normalizeValues(values) {
    const validValues = values.filter(v => isFinite(v) && v !== null);
    if (validValues.length === 0) return values.map(() => 0);
    
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    
    // If all values are the same, return 1 for valid values
    if (max === min) {
        return values.map(v => (isFinite(v) && v !== null) ? 1 : 0);
    }
    
    // Normalize to 0-1 range
    return values.map(v => {
        if (!isFinite(v) || v === null) return 0;
        return (v - min) / (max - min);
    });
}

/**
 * Generates an array of colors for chart elements
 * Creates visually distinct colors that work well together
 */
export function generateColorScale(n) {
    return Array(n).fill().map((_, i) => {
        // Use HSL for more controlled color generation
        const hue = (i * 360) / n;  // Spread colors evenly around the color wheel
        const saturation = 70;       // Moderate saturation
        const lightness = 50;        // Medium brightness
        return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
    });
}

/**
 * Fades a color by reducing its opacity
 */
export function fadeColor(color) {
    // If it's already an hsla color, modify its alpha
    if (color.startsWith('hsla')) {
        return color.replace(/[\d.]+\)$/, '0.2)');
    }
    // If it's an hsl color, convert to hsla
    if (color.startsWith('hsl')) {
        return color.replace('hsl', 'hsla').replace(')', ', 0.2)');
    }
    // Default fallback
    return color.replace(/[\d.]+\)$/, '0.2)');
}

/**
 * Determines if a value needs logarithmic scaling
 */
export function shouldUseLogScale(values) {
    const validValues = values.filter(v => v > 0);
    if (validValues.length < 2) return false;
    
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    return max / min > 100; // Use log scale if range spans more than 2 orders of magnitude
}

/**
 * Formats a number for display, using scientific notation for very large/small numbers
 */
export function formatNumber(value) {
    if (!isFinite(value)) return 'N/A';
    if (value === 0) return '0';
    
    const abs = Math.abs(value);
    if (abs < 0.01 || abs > 10000) {
        return value.toExponential(2);
    }
    return value.toPrecision(4);
}

/**
 * Generates a range of values for axis ticks
 */
export function generateAxisTicks(min, max, count = 5) {
    if (min === max) return [min];
    
    const range = max - min;
    const step = range / (count - 1);
    return Array(count).fill().map((_, i) => min + step * i);
}

/**
 * Creates a consistent color scheme for equation variables
 */
export const variableColors = {
    R_star: 'hsla(200, 70%, 50%, 0.6)',
    f_p: 'hsla(150, 70%, 50%, 0.6)',
    n_e: 'hsla(100, 70%, 50%, 0.6)',
    f_l: 'hsla(50, 70%, 50%, 0.6)',
    f_i: 'hsla(0, 70%, 50%, 0.6)',
    f_c: 'hsla(300, 70%, 50%, 0.6)',
    L: 'hsla(250, 70%, 50%, 0.6)',
    // Rare Earth additional variables
    f_pm: 'hsla(175, 70%, 50%, 0.6)',
    f_g: 'hsla(125, 70%, 50%, 0.6)',
    f_t: 'hsla(75, 70%, 50%, 0.6)',
    f_m: 'hsla(25, 70%, 50%, 0.6)',
    f_j: 'hsla(325, 70%, 50%, 0.6)',
};