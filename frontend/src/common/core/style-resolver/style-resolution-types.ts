/**
 * Style Resolution Types
 *
 * Types for the style resolution system with container-specific support.
 */

import type { ValueBinding } from '@/common/core/binding';
import type { CSSUnit } from '@/common/types/css-units';

// ============================================================================
// Value Origin Types
// ============================================================================

/**
 * Where a resolved value comes from in the resolution chain
 */
export type ValueOrigin =
    | 'default'            // Default value
    | 'block-type-default' // From block type defaults
    | 'canvas-default'     // From canvas defaults
    | 'parent-inherited'   // Inherited from parent block (not implemented)
    | 'preset'             // From applied preset (current or fallback container)
    | 'preset-fallback'    // From applied preset's fallback container (e.g., responsive)
    | 'inline'             // From block's container styles (current container)
    | 'inline-fallback';   // From block's container styles (fallback container)

// ============================================================================
// Resolved Value Types
// ============================================================================

/**
 * A resolved style value with metadata about its origin
 */
export interface ResolvedValue<T = unknown> {
    /** The resolved value */
    value: T;
    /** Unit for numeric values */
    unit?: CSSUnit;
    /** Where the value came from */
    origin: ValueOrigin;
    /** Which container provided the value (for fallback tracking) */
    originContainer?: string;
    /** Preset ID if origin is 'preset' or 'preset-fallback' */
    presetId?: string;
    /** Binding configuration if the value has a binding */
    binding?: ValueBinding;
    /** Animation configuration for this property */
    animation?: unknown;
    /** Whether this value has an override on the current container */
    hasLocalOverride: boolean;
}

/**
 * Resolved style data for a category (typography, spacing, etc.)
 */
export type ResolvedCategoryData = Record<string, ResolvedValue>;

/**
 * Complete resolved styles for a block on a specific container
 */
export interface ResolvedStyleData {
    layout?: ResolvedCategoryData;
    typography?: ResolvedCategoryData;
    spacing?: ResolvedCategoryData;
    size?: ResolvedCategoryData;
    background?: ResolvedCategoryData;
    border?: ResolvedCategoryData;
    effects?: ResolvedCategoryData;
    flex?: ResolvedCategoryData;

    [category: string]: ResolvedCategoryData | undefined;
}

// ============================================================================
// Resolution Context
// ============================================================================

/**
 * Context for style resolution
 */
export interface ResolutionContext {
    /** Block ID being resolved */
    blockId: string;
    /** Target ID if resolving a specific style target */
    targetId?: string;
    /** Target container ID */
    containerId: string;
    /** Block type */
    blockType: string;
    /** Applied preset ID (if any) */
    presetId?: string;
    /** Whether to apply fallback styles to the result */
    applyFallbacks?: boolean;
}
