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
 * Home Assistant theme mode for per-property overrides.
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Editor mode for choosing whether color inputs edit the base value or a mode override.
 */
export type ThemeModeSelection = 'auto' | ThemeMode;

/**
 * Shared property fields. These fields are also used by theme-mode overrides.
 */
export interface StylePropertyValueBase {
    /** Static value */
    value?: unknown;
    /** Unit for numeric values */
    unit?: CSSUnit;
    /** Dynamic binding configuration */
    binding?: ValueBinding;
}

/**
 * Theme-mode override. It intentionally cannot contain nested themeModes.
 */
export type ThemeModeOverride = StylePropertyValueBase;

/**
 * Single style property value - can be static value or binding.
 *
 * value/unit/binding are the mode-independent base. themeModes contains optional
 * per-mode overrides layered on top of that base.
 */
export interface StylePropertyValue extends StylePropertyValueBase {
    themeModes?: Partial<Record<ThemeMode, ThemeModeOverride>>;
}

const THEME_MODE_STYLE_PROPERTIES = new Set([
    'typography.color',
    'background.backgroundColor',
    'background.backgroundImage',
    'background.boxShadow',
    'border.borderColor',
    'effects.boxShadow',
    'echart.lineColor',
    'echart.areaColor',
    'echart.barColor',
    'echart.pieSliceColor',
    'echart.pieLabelLineColor',
    'svg.stroke',
    'svg.fill',
]);

export function isThemeModeStyleProperty(category: string, property: string): boolean {
    const propertyKey = `${category}.${property}`;
    return THEME_MODE_STYLE_PROPERTIES.has(propertyKey)
        || property === 'color'
        || property === 'fill'
        || property === 'stroke'
        || property.endsWith('Color');
}

export function hasThemeModeOverrideValue(override: ThemeModeOverride | undefined): boolean {
    return Boolean(override && (override.value !== undefined || override.binding !== undefined));
}

export function hasStylePropertyBaseValue(value: StylePropertyValue | undefined): boolean {
    return Boolean(value && (value.value !== undefined || value.binding !== undefined));
}

export function hasStylePropertyValueForMode(
    value: StylePropertyValue | undefined,
    themeMode: ThemeMode | undefined,
    category: string,
    property: string
): boolean {
    if (!value) return false;
    if (themeMode && isThemeModeStyleProperty(category, property)) {
        return hasThemeModeOverrideValue(value.themeModes?.[themeMode])
            || hasStylePropertyBaseValue(value);
    }
    return hasStylePropertyBaseValue(value);
}

function cloneStyleField<T>(value: T): T {
    if (value === undefined || value === null) return value;
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as T;
}

export function cloneStylePropertyValue(value: StylePropertyValue): StylePropertyValue {
    const clone: StylePropertyValue = {};
    if ('value' in value) clone.value = cloneStyleField(value.value);
    if ('unit' in value) clone.unit = value.unit;
    if ('binding' in value) clone.binding = cloneStyleField(value.binding);

    if (value.themeModes) {
        clone.themeModes = {};
        for (const [mode, override] of Object.entries(value.themeModes) as Array<[ThemeMode, ThemeModeOverride | undefined]>) {
            if (!override) continue;
            clone.themeModes[mode] = {};
            if ('value' in override) clone.themeModes[mode]!.value = cloneStyleField(override.value);
            if ('unit' in override) clone.themeModes[mode]!.unit = override.unit;
            if ('binding' in override) clone.themeModes[mode]!.binding = cloneStyleField(override.binding);
        }
    }

    return clone;
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
