import type { GridArea, GridDimension } from "@/common/blocks/types";

/**
 * Generate CSS grid template value from dimensions
 */
export function gridDimensionToCSS(dimension: GridDimension): string {
    if (dimension.unit === 'minmax' && dimension.minValue !== undefined && dimension.maxValue !== undefined) {
        return `minmax(${dimension.minValue}px, ${dimension.maxValue}px)`;
    }

    if (dimension.unit === 'auto') {
        return 'auto';
    }

    // Convert fr units to minmax(0, Nfr) to ensure equal column/row sizes
    // This prevents content from making some columns/rows larger than others
    if (dimension.unit === 'fr') {
        return `minmax(0, ${dimension.value}fr)`;
    }

    return `${dimension.value}${dimension.unit}`;
}

/**
 * Generate full grid-template-rows/columns CSS value
 */
export function gridDimensionsToCSS(dimensions: GridDimension[]): string {
    return dimensions.map(gridDimensionToCSS).join(' ');
}

/**
 * Generate grid-template-areas CSS value
 */
export function gridAreasToCSS(areas: GridArea[], rows: number, columns: number): string {
    if (areas.length === 0) {
        return '';
    }

    // Create a 2D grid to map areas
    const grid: string[][] = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < columns; c++) {
            grid[r][c] = '.'; // Empty cell
        }
    }

    // Fill in named areas
    areas.forEach(area => {
        for (let r = area.rowStart; r < area.rowEnd; r++) {
            for (let c = area.columnStart; c < area.columnEnd; c++) {
                if (r < rows && c < columns) {
                    grid[r][c] = area.id;
                }
            }
        }
    });

    // Convert to CSS string
    return grid.map(row => `"${row.join(' ')}"`).join('\n    ');
}

/**
 * Value Formatter Utility
 *
 * Provides reusable formatting functions for entity field blocks
 */

/**
 * Date format options
 */
export type DateFormatType = 'full' | 'long' | 'medium' | 'short' | 'time' | 'datetime' | 'relative' | 'iso';

export interface FormatValueContext {
    format: string;
    precision?: number;
    dateFormat?: DateFormatType;
}

/**
 * Format date value based on selected dateFormat
 */
export function formatDate(value: any, dateFormat: DateFormatType = 'full'): string {
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return String(value);
        }

        switch (dateFormat) {
            case 'full':
                return date.toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                });

            case 'long':
                return date.toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

            case 'medium':
                return date.toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

            case 'short':
                return date.toLocaleDateString(undefined, {
                    year: '2-digit',
                    month: 'numeric',
                    day: 'numeric'
                });

            case 'time':
                return date.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit'
                });

            case 'datetime':
                return date.toLocaleString(undefined, {
                    year: '2-digit',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                });

            case 'relative':
                return formatTimeAgo(date);

            case 'iso':
                return date.toISOString();

            default:
                return date.toLocaleString();
        }
    } catch (e) {
        return String(value);
    }
}

/**
 * Format time ago (relative time)
 */
export function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
        return diffSeconds === 1 ? '1 second ago' : `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
        return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffWeeks < 4) {
        return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    } else if (diffMonths < 12) {
        return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    } else {
        return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
    }
}

/**
 * Format numeric value with precision
 */
export function formatNumber(value: any, precision: number = 1): string {
    const num = parseFloat(value);

    if (!isNaN(num)) {
        if (precision !== undefined && precision >= 0) {
            return num.toFixed(precision);
        }
        return String(num);
    }

    return String(value);
}

/**
 * Format boolean value
 */
export function formatBoolean(value: any, trueLabel: string = 'Yes', falseLabel: string = 'No'): string {
    const boolValue = value === true || value === 'on' || value === 'true' || value === '1';
    return boolValue ? trueLabel : falseLabel;
}

export function formatValue(value: any, context: FormatValueContext, fallback: any = undefined): string {
    if (value === undefined || value === null) return fallback;

    const format = context.format;
    // Numeric formats
    if (format === 'numeric' || format === 'integer') {
        const precision = format === 'integer' ? 0 : (context.precision ?? 1);

        return formatNumber(value, precision);
    }

    // Date format
    if (format === 'date' && value) {
        return formatDate(value, context.dateFormat ?? 'full');
    }

    // Boolean format
    if (format === 'boolean') {
        return formatBoolean(value);
    }

    // Text format (default)
    return String(value);
}
