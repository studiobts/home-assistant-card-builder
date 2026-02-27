import type { GridArea, GridConfig, GridDimension, GridUnit } from "@/common/blocks/types";

/**
 * Grid Layout Editor Types
 */

export interface CellSelection {
    rowStart: number;
    rowEnd: number;
    columnStart: number;
    columnEnd: number;
}

/**
 * Grid constraints
 */
export const GRID_CONSTRAINTS = {
    MIN_ROWS: 1,
    MAX_ROWS: 12,
    MIN_COLUMNS: 1,
    MAX_COLUMNS: 12,
    MIN_GAP: 0,
    MAX_GAP: 100,
};

/**
 * Color palette for grid areas (distinct, accessible colors)
 */
export const AREA_COLOR_PALETTE = [
    '#4caf50', // Green
    '#2196f3', // Blue
    '#ff9800', // Orange
    '#9c27b0', // Purple
    '#f44336', // Red
    '#00bcd4', // Cyan
    '#ff5722', // Deep Orange
    '#3f51b5', // Indigo
    '#8bc34a', // Light Green
    '#e91e63', // Pink
    '#009688', // Teal
    '#ffc107', // Amber
    '#673ab7', // Deep Purple
    '#cddc39', // Lime
    '#ff6f00', // Orange Dark
    '#03a9f4', // Light Blue
];

/**
 * Get color for an area by index
 */
export function getAreaColor(index: number): string {
    return AREA_COLOR_PALETTE[index % AREA_COLOR_PALETTE.length];
}

/**
 * Helper to create a grid dimension
 */
export function createGridDimension(
    value: number,
    unit: GridUnit = 'fr',
    minValue?: number,
    maxValue?: number
): GridDimension {
    return {value, unit, minValue, maxValue};
}

/**
 * Check if a cell is part of any area
 */
export function getCellArea(row: number, column: number, areas: GridArea[]): GridArea | null {
    return areas.find(area =>
        row >= area.rowStart && row < area.rowEnd &&
        column >= area.columnStart && column < area.columnEnd
    ) || null;
}

/**
 * Validate grid configuration
 */
export function validateGridConfig(config: GridConfig): string[] {
    const errors: string[] = [];

    if (config.rows < GRID_CONSTRAINTS.MIN_ROWS || config.rows > GRID_CONSTRAINTS.MAX_ROWS) {
        errors.push(`Rows must be between ${GRID_CONSTRAINTS.MIN_ROWS} and ${GRID_CONSTRAINTS.MAX_ROWS}`);
    }

    if (config.columns < GRID_CONSTRAINTS.MIN_COLUMNS || config.columns > GRID_CONSTRAINTS.MAX_COLUMNS) {
        errors.push(`Columns must be between ${GRID_CONSTRAINTS.MIN_COLUMNS} and ${GRID_CONSTRAINTS.MAX_COLUMNS}`);
    }

    if (config.rowSizes.length !== config.rows) {
        errors.push('Row sizes array length must match rows count');
    }

    if (config.columnSizes.length !== config.columns) {
        errors.push('Column sizes array length must match columns count');
    }

    // Validate areas are within bounds
    config.areas.forEach((area, index) => {
        if (area.rowStart < 0 || area.rowEnd > config.rows) {
            errors.push(`Area ${index + 1} (${area.name}) has invalid row range`);
        }
        if (area.columnStart < 0 || area.columnEnd > config.columns) {
            errors.push(`Area ${index + 1} (${area.name}) has invalid column range`);
        }
        if (area.rowStart >= area.rowEnd || area.columnStart >= area.columnEnd) {
            errors.push(`Area ${index + 1} (${area.name}) has invalid dimensions`);
        }
    });

    return errors;
}

