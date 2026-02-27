/**
 * Style Preset Types
 *
 * Types for style presets with container-specific support.
 * Presets are container-specific to enable responsive design.
 */

import type { ValueBinding } from '@/common/core/binding';
import type { CSSUnit } from '@/common/types/css-units';

// ============================================================================
// Base Types
// ============================================================================

/**
 * Single style property value - can be static value or binding
 */
export interface StylePropertyValue {
    /** Static value */
    value?: unknown;
    /** Unit for numeric values */
    unit?: CSSUnit;
    /** Dynamic binding configuration */
    binding?: ValueBinding;
}

/**
 * Style category data - properties within a category (typography, spacing, etc.)
 */
export type StyleCategoryData = Record<string, StylePropertyValue>;

/**
 * Container style data - all style categories for a single container
 */
export interface ContainerStyleData {
    layout?: StyleCategoryData;
    typography?: StyleCategoryData;
    spacing?: StyleCategoryData;
    size?: StyleCategoryData;
    background?: StyleCategoryData;
    border?: StyleCategoryData;
    effects?: StyleCategoryData;
    flex?: StyleCategoryData;

    [category: string]: StyleCategoryData | undefined;
}

// ============================================================================
// Preset Types
// ============================================================================

/**
 * Style preset data - organized by container
 * Each container has its own set of styles with fallback
 */
export interface StylePresetData {
    containers: {
        [containerId: string]: ContainerStyleData | undefined;
    };
}

/**
 * Complete style preset definition
 */
export interface StylePreset {
    /** Unique identifier */
    id: string;
    /** Display name */
    name: string;
    /** Optional description */
    description?: string;
    /** Parent preset ID for inheritance */
    extendsPresetId?: string;
    /** Container-specific style data */
    data: StylePresetData;
    /** Creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

// ============================================================================
// Input Types for CRUD Operations
// ============================================================================

/**
 * Input for creating a new preset
 */
export interface CreateStylePresetInput {
    name: string;
    description?: string;
    extendsPresetId?: string;
    data: StylePresetData;
}

/**
 * Input for updating an existing preset
 */
export interface UpdateStylePresetInput {
    name?: string;
    description?: string;
    extendsPresetId?: string;
    data?: StylePresetData;
}

/**
 * Deep merge two ContainerStyleData objects
 * Target values override base values
 *
 * @param base - Base style data
 * @param target - Target style data (takes precedence)
 * @returns Merged style data
 */
export function mergeContainerStyleData(
    base: ContainerStyleData | undefined,
    target: ContainerStyleData | undefined
): ContainerStyleData {
    if (!base) return target || {};
    if (!target) return base;

    const result: ContainerStyleData = {...base};

    for (const category of Object.keys(target)) {
        const baseCategory = base[category];
        const targetCategory = target[category];

        if (!targetCategory) continue;

        if (!baseCategory) {
            result[category] = {...targetCategory};
        } else {
            result[category] = {...baseCategory, ...targetCategory};
        }
    }

    return result;
}

/**
 * Deep merge two StylePresetData objects (merges each container separately)
 *
 * @param base - Base preset data
 * @param target - Target preset data (takes precedence)
 * @returns Merged preset data
 */
export function mergePresetData(
    base: StylePresetData | undefined,
    target: StylePresetData | undefined
): StylePresetData {
    if (!base) return target || {containers: {}};
    if (!target) return base;

    const result: StylePresetData = {containers: {}};

    // Get all container IDs from both
    const allContainerIds = new Set([
        ...Object.keys(base.containers),
        ...Object.keys(target.containers),
    ]);

    for (const containerId of allContainerIds) {
        result.containers[containerId] = mergeContainerStyleData(
            base.containers[containerId],
            target.containers[containerId]
        );
    }

    return result;
}
