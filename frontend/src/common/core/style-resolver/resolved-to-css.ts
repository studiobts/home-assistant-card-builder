/**
 * Resolved to CSS Utilities
 *
 * Functions to convert ResolvedStyleData to CSS properties.
 */

import { shouldIncludeCategory, shouldIncludeProperty, type StyleFilter } from "@/common/core/style-resolver/style-resolver";
import type { ResolvedCategoryData, ResolvedStyleData, ResolvedValue } from '@/common/core/style-resolver/style-resolution-types';
import { getDefaultUnitForProperty, getDefaultUnitForPropertyName } from '@/common/core/style-resolver/style-units';
import { isManagedMediaReference, mediaContentIdToPublicUrl } from '@/common/media';
import type { CSSUnit } from '@/common/types/css-units';

// ============================================================================
// Types
// ============================================================================

export type StyleOutputMode = 'properties' | 'vars';

export interface StyleOutputConfig {
    /** Base output mode */
    mode: StyleOutputMode;
    /** Filter to decide which properties use the base output mode */
    filter?: StyleFilter;
    /** Optional CSS variable prefix override */
    varPrefix?: string;
}

/**
 * Options for CSS conversion
 */
export interface CSSConversionOptions {
    /** Use CSS variables instead of direct values */
    useCSSVars?: boolean;
    /** Prefix for CSS variable names (e.g., 'block' -> --block-spacing-margin) */
    varPrefix?: string;
    /** Output mode configuration for mixed property/variable output */
    outputMode?: StyleOutputConfig;
    /** Filter for controlling what to convert */
    filter?: StyleFilter;
    /** Additional CSS properties to append to the result */
    append?: Record<string, string>;
}

/**
 * Options for single value conversion
 */
export interface ValueConversionOptions {
    /** Use CSS variable */
    useCSSVar?: boolean;
    /** Custom CSS variable name */
    varName?: string;
}

// ============================================================================
// Spacing Value Types
// ============================================================================

interface SpacingValue {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

interface BorderRadiusValue {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
}

// ============================================================================
// Main Conversion Functions
// ============================================================================

/**
 * Convert ResolvedStyleData to CSS properties
 */
export function resolvedToCSSProperties(
    resolved: ResolvedStyleData,
    options: CSSConversionOptions = {}
): Record<string, string> {
    const {filter, append} = options;
    const result: Record<string, string> = {};

    // Process each category
    for (const [category, data] of Object.entries(resolved)) {
        if (!data) continue;
        if (category === '_internal') continue;
        if (!shouldIncludeCategory(category, filter)) continue;

        const categoryCSS = categoryToCSSProperties(category, data, options);
        Object.assign(result, categoryCSS);
    }

    // Append additional properties if provided
    if (append) {
        Object.assign(result, append);
    }

    return result;
}

/**
 * Convert a single category to CSS properties
 */
export function categoryToCSSProperties(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions = {}
): Record<string, string> {
    const result: Record<string, string> = {};

    switch (category) {
        case 'layout':
            Object.assign(result, layoutToCss(category, data, options));
            break;
        case 'size':
            Object.assign(result, sizeToCss(category, data, options));
            break;
        case 'spacing':
            Object.assign(result, spacingToCss(category, data, options));
            break;
        case 'typography':
            Object.assign(result, typographyToCss(category, data, options));
            break;
        case 'background':
            Object.assign(result, backgroundToCss(category, data, options));
            break;
        case 'border':
            Object.assign(result, borderToCss(category, data, options));
            break;
        case 'svg':
            Object.assign(result, svgToCss(category, data, options));
            break;
        case 'flex':
            Object.assign(result, flexToCss(category, data, options));
            break;
        case 'effects':
            Object.assign(result, effectsToCss(category, data, options));
            break;
        default:
            // Generic handling for unknown categories
            Object.assign(result, genericCategoryToCss(category, data, options));
    }

    return result;
}

/**
 * Convert a single resolved value to CSS string
 */
export function valueToCSSString(
    property: string,
    resolved: ResolvedValue | undefined,
    options: ValueConversionOptions = {}
): string | undefined {
    if (!resolved || resolved.value === undefined) {
        return undefined;
    }

    const cssValue = valueToRawCSS(property, resolved.value, resolved.unit);
    if (cssValue === undefined) return undefined;

    if (options.useCSSVar && options.varName) {
        return `var(${options.varName}, ${cssValue})`;
    }

    return cssValue;
}

// ============================================================================
// Output Mode Helpers
// ============================================================================

function getOutputModeForProperty(
    category: string,
    property: string,
    options: CSSConversionOptions
): StyleOutputMode | null {
    const outputMode = options.outputMode;
    if (!outputMode) return null;

    const useBaseMode = shouldIncludeProperty(category, property, outputMode.filter);
    if (useBaseMode) return outputMode.mode;

    return outputMode.mode === 'properties' ? 'vars' : 'properties';
}

function createOutputWriter(
    category: string,
    result: Record<string, string>,
    options: CSSConversionOptions
) {
    const outputMode = options.outputMode;
    const outputVarPrefix = outputMode
        ? (outputMode.varPrefix ?? options.varPrefix ?? 'block')
        : options.varPrefix;

    return (property: string, cssProperty: string, value: string, varKey: string) => {
        const mode = getOutputModeForProperty(category, property, options);

        if (mode === 'vars') {
            if (!outputVarPrefix) {
                result[cssProperty] = value;
                return;
            }
            result[`--${outputVarPrefix}-${varKey}`] = value;
            return;
        }

        if (mode === 'properties') {
            result[cssProperty] = value;
            return;
        }

        if (options.useCSSVars) {
            result[cssProperty] = `var(--${options.varPrefix}-${varKey}, ${value})`;
            return;
        }

        result[cssProperty] = value;
    };
}

// ============================================================================
// Category-specific Converters
// ============================================================================

function layoutToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.display?.value !== undefined && shouldIncludeProperty(category, 'display', filter)) {
        const value = `${data.display.value}`;
        write('display', 'display', value, 'layout-display');
    }
    if (data.show?.value !== undefined && shouldIncludeProperty(category, 'show', filter)) {
        if (data.show.value === 'no') {
            const value = 'none';
            write('show', 'display', value, 'layout-show');
        }
    }
    if (data.positionX?.value !== undefined && shouldIncludeProperty(category, 'positionX', filter)) {
        const value = `${data.positionX.value}px`;
        write('positionX', 'top', value, 'layout-position-x');
    }
    if (data.positionY?.value !== undefined && shouldIncludeProperty(category, 'positionY', filter)) {
        const value = `${data.positionY?.value}px`;
        write('positionY', 'left', value, 'layout-position-y');
    }
    if (data.zIndex?.value !== undefined && shouldIncludeProperty(category, 'zIndex', filter)) {
        const value = `${data.zIndex.value}`;
        write('zIndex', 'zIndex', value, 'layout-z-index');
    }

    return result;
}

function sizeToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.width?.value !== undefined && shouldIncludeProperty(category, 'width', filter)) {
        const value = formatLengthValue(
            data.width.value,
            data.width.unit,
            getDefaultUnitForProperty('size', 'width')
        );
        if (value !== undefined) {
            write('width', 'width', value, 'size-width');
        }
    }

    if (data.height?.value !== undefined && shouldIncludeProperty(category, 'height', filter)) {
        const value = formatLengthValue(
            data.height.value,
            data.height.unit,
            getDefaultUnitForProperty('size', 'height')
        );
        if (value !== undefined) {
            write('height', 'height', value, 'size-height');
        }
    }

    if (data.minWidth?.value !== undefined && shouldIncludeProperty(category, 'minWidth', filter)) {
        const value = formatLengthValue(
            data.minWidth.value,
            data.minWidth.unit,
            getDefaultUnitForProperty('size', 'minWidth')
        );
        if (value !== undefined) {
            write('minWidth', 'minWidth', value, 'size-min-width');
        }
    }

    if (data.maxWidth?.value !== undefined && shouldIncludeProperty(category, 'maxWidth', filter)) {
        const value = formatLengthValue(
            data.maxWidth.value,
            data.maxWidth.unit,
            getDefaultUnitForProperty('size', 'maxWidth')
        );
        if (value !== undefined) {
            write('maxWidth', 'maxWidth', value, 'size-max-width');
        }
    }

    if (data.minHeight?.value !== undefined && shouldIncludeProperty(category, 'minHeight', filter)) {
        const value = formatLengthValue(
            data.minHeight.value,
            data.minHeight.unit,
            getDefaultUnitForProperty('size', 'minHeight')
        );
        if (value !== undefined) {
            write('minHeight', 'minHeight', value, 'size-min-height');
        }
    }

    if (data.maxHeight?.value !== undefined && shouldIncludeProperty(category, 'maxHeight', filter)) {
        const value = formatLengthValue(
            data.maxHeight.value,
            data.maxHeight.unit,
            getDefaultUnitForProperty('size', 'maxHeight')
        );
        if (value !== undefined) {
            write('maxHeight', 'maxHeight', value, 'size-max-height');
        }
    }

    return result;
}

function spacingToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.margin?.value !== undefined && shouldIncludeProperty(category, 'margin', filter)) {
        const value = formatSpacingValue(
            data.margin.value as SpacingValue | number,
            data.margin.unit,
            getDefaultUnitForProperty('spacing', 'margin') ?? 'px'
        );
        write('margin', 'margin', value, 'spacing-margin');
    }

    if (data.padding?.value !== undefined && shouldIncludeProperty(category, 'padding', filter)) {
        const value = formatSpacingValue(
            data.padding.value as SpacingValue | number,
            data.padding.unit,
            getDefaultUnitForProperty('spacing', 'padding') ?? 'px'
        );
        write('padding', 'padding', value, 'spacing-padding');
    }

    // Individual margin properties
    for (const side of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']) {
        if (data[side]?.value !== undefined && shouldIncludeProperty(category, side, filter)) {
            const value = formatLengthValue(
                data[side].value,
                data[side].unit,
                getDefaultUnitForProperty('spacing', side)
            );
            if (value !== undefined) {
                write(side, side, value, `spacing-${side}`);
            }
        }
    }

    // Individual padding properties
    for (const side of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
        if (data[side]?.value !== undefined && shouldIncludeProperty(category, side, filter)) {
            const value = formatLengthValue(
                data[side].value,
                data[side].unit,
                getDefaultUnitForProperty('spacing', side)
            );
            if (value !== undefined) {
                write(side, side, value, `spacing-${side}`);
            }
        }
    }

    return result;
}

function typographyToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.fontFamily?.value !== undefined && shouldIncludeProperty(category, 'fontFamily', filter)) {
        const value = String(data.fontFamily.value);
        write('fontFamily', 'fontFamily', value, 'typography-fontFamily');
    }

    if (data.fontSize?.value !== undefined && shouldIncludeProperty(category, 'fontSize', filter)) {
        const value = formatLengthValue(
            data.fontSize.value,
            data.fontSize.unit,
            getDefaultUnitForProperty('typography', 'fontSize')
        );
        if (value !== undefined) {
            write('fontSize', 'fontSize', value, 'typography-fontSize');
        }
    }

    if (data.fontWeight?.value !== undefined && shouldIncludeProperty(category, 'fontWeight', filter)) {
        const value = String(data.fontWeight.value);
        write('fontWeight', 'fontWeight', value, 'typography-fontWeight');
    }

    if (data.fontStyle?.value !== undefined && shouldIncludeProperty(category, 'fontStyle', filter)) {
        const value = String(data.fontStyle.value);
        write('fontStyle', 'fontStyle', value, 'typography-fontStyle');
    }

    if (data.lineHeight?.value !== undefined && shouldIncludeProperty(category, 'lineHeight', filter)) {
        const value = String(data.lineHeight.value);
        write('lineHeight', 'lineHeight', value, 'typography-lineHeight');
    }

    if (data.letterSpacing?.value !== undefined && shouldIncludeProperty(category, 'letterSpacing', filter)) {
        const value = formatLengthValue(
            data.letterSpacing.value,
            data.letterSpacing.unit,
            getDefaultUnitForProperty('typography', 'letterSpacing')
        );
        if (value !== undefined) {
            write('letterSpacing', 'letterSpacing', value, 'typography-letterSpacing');
        }
    }

    if (data.textAlign?.value !== undefined && shouldIncludeProperty(category, 'textAlign', filter)) {
        const value = String(data.textAlign.value);
        write('textAlign', 'textAlign', value, 'typography-textAlign');
    }

    if (data.textDecoration?.value !== undefined && shouldIncludeProperty(category, 'textDecoration', filter)) {
        const value = String(data.textDecoration.value);
        write('textDecoration', 'textDecoration', value, 'typography-textDecoration');
    }

    if (data.textTransform?.value !== undefined && shouldIncludeProperty(category, 'textTransform', filter)) {
        const value = String(data.textTransform.value);
        write('textTransform', 'textTransform', value, 'typography-textTransform');
    }

    if (data.textShadow?.value !== undefined && shouldIncludeProperty(category, 'textShadow', filter)) {
        const value = String(data.textShadow.value);
        write('textShadow', 'textShadow', value, 'typography-textShadow');
    }

    if (data.whiteSpace?.value !== undefined && shouldIncludeProperty(category, 'whiteSpace', filter)) {
        const value = String(data.whiteSpace.value);
        write('whiteSpace', 'whiteSpace', value, 'typography-whiteSpace');
    }

    if (data.color?.value !== undefined && shouldIncludeProperty(category, 'color', filter)) {
        const value = String(data.color.value);
        write('color', 'color', value, 'typography-color');
    }

    return result;
}

function backgroundToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.backgroundColor?.value !== undefined && shouldIncludeProperty(category, 'backgroundColor', filter)) {
        const value = String(data.backgroundColor.value);
        write('backgroundColor', 'backgroundColor', value, 'background-color');
    }

    // Legacy support for 'color' property in background
    if (data.color?.value !== undefined && shouldIncludeProperty(category, 'color', filter)) {
        const value = String(data.color.value);
        write('color', 'backgroundColor', value, 'background-color');
    }

    if (data.backgroundImage?.value !== undefined && shouldIncludeProperty(category, 'backgroundImage', filter)) {
        const value = formatBackgroundImageValue(data.backgroundImage.value);
        if (value !== undefined) {
            write('backgroundImage', 'backgroundImage', value, 'background-image');
        }
    }

    // Legacy support for 'image' property
    if (data.image?.value !== undefined && shouldIncludeProperty(category, 'image', filter)) {
        const value = formatBackgroundImageValue(data.image.value);
        if (value !== undefined) {
            write('image', 'backgroundImage', value, 'background-image');
        }
    }

    if (data.backgroundSize?.value !== undefined && shouldIncludeProperty(category, 'backgroundSize', filter)) {
        const value = String(data.backgroundSize.value);
        write('backgroundSize', 'backgroundSize', value, 'background-size');
    }

    // Legacy support
    if (data.size?.value !== undefined && shouldIncludeProperty(category, 'size', filter)) {
        const value = String(data.size.value);
        write('size', 'backgroundSize', value, 'background-size');
    }

    if (data.backgroundRepeat?.value !== undefined && shouldIncludeProperty(category, 'backgroundRepeat', filter)) {
        const value = String(data.backgroundRepeat.value);
        write('backgroundRepeat', 'backgroundRepeat', value, 'background-repeat');
    }

    // Legacy support
    if (data.repeat?.value !== undefined && shouldIncludeProperty(category, 'repeat', filter)) {
        const value = String(data.repeat.value);
        write('repeat', 'backgroundRepeat', value, 'background-repeat');
    }

    if (data.backgroundPosition?.value !== undefined && shouldIncludeProperty(category, 'backgroundPosition', filter)) {
        const value = String(data.backgroundPosition.value);
        write('backgroundPosition', 'backgroundPosition', value, 'background-position');
    }

    // Legacy support
    if (data.position?.value !== undefined && shouldIncludeProperty(category, 'position', filter)) {
        const value = String(data.position.value);
        write('position', 'backgroundPosition', value, 'background-position');
    }

    if (data.boxShadow?.value !== undefined && shouldIncludeProperty(category, 'boxShadow', filter)) {
        const value = String(data.boxShadow.value);
        write('boxShadow', 'boxShadow', value, 'background-box-shadow');
    }

    if (data.backgroundBlendMode?.value !== undefined && shouldIncludeProperty(category, 'backgroundBlendMode', filter)) {
        const value = String(data.backgroundBlendMode.value);
        write('backgroundBlendMode', 'backgroundBlendMode', value, 'background-blend-mode');
    }

    return result;
}

function borderToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.borderWidth?.value !== undefined && shouldIncludeProperty(category, 'borderWidth', filter)) {
        const value = formatLengthValue(
            data.borderWidth.value,
            data.borderWidth.unit,
            getDefaultUnitForProperty('border', 'borderWidth')
        );
        if (value !== undefined) {
            write('borderWidth', 'borderWidth', value, 'border-width');
        }
    }

    // Legacy support for 'width'
    if (data.width?.value !== undefined && shouldIncludeProperty(category, 'width', filter)) {
        const value = formatLengthValue(
            data.width.value,
            data.width.unit,
            getDefaultUnitForProperty('border', 'borderWidth')
        );
        if (value !== undefined) {
            write('width', 'borderWidth', value, 'border-width');
        }
    }

    if (data.borderStyle?.value !== undefined && shouldIncludeProperty(category, 'borderStyle', filter)) {
        const value = String(data.borderStyle.value);
        write('borderStyle', 'borderStyle', value, 'border-style');
    }

    // Legacy support for 'style'
    if (data.style?.value !== undefined && shouldIncludeProperty(category, 'style', filter)) {
        const value = String(data.style.value);
        write('style', 'borderStyle', value, 'border-style');
    }

    if (data.borderColor?.value !== undefined && shouldIncludeProperty(category, 'borderColor', filter)) {
        const value = String(data.borderColor.value);
        write('borderColor', 'borderColor', value, 'border-color');
    }

    // Legacy support for 'color'
    if (data.color?.value !== undefined && shouldIncludeProperty(category, 'color', filter)) {
        const value = String(data.color.value);
        write('color', 'borderColor', value, 'border-color');
    }

    if (data.borderRadius?.value !== undefined && shouldIncludeProperty(category, 'borderRadius', filter)) {
        const value = formatBorderRadius(
            data.borderRadius.value!,
            data.borderRadius.unit,
            getDefaultUnitForProperty('border', 'borderRadius') ?? 'px'
        );
        write('borderRadius', 'borderRadius', value, 'border-radius');
    }

    // Legacy support for 'radius'
    if (data.radius?.value !== undefined && shouldIncludeProperty(category, 'radius', filter)) {
        const value = formatBorderRadius(
            data.radius.value!,
            data.radius.unit,
            getDefaultUnitForProperty('border', 'borderRadius') ?? 'px'
        );
        write('radius', 'borderRadius', value, 'border-radius');
    }

    for (const side of ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth']) {
        if (data[side]?.value !== undefined && shouldIncludeProperty(category, side, filter)) {
            const value = formatLengthValue(
                data[side].value,
                data[side].unit,
                getDefaultUnitForProperty('border', side)
            );
            if (value !== undefined) {
                write(side, side, value, `border-${side}`);
            }
        }
    }

    for (const corner of [
        'borderTopLeftRadius',
        'borderTopRightRadius',
        'borderBottomRightRadius',
        'borderBottomLeftRadius',
    ]) {
        if (data[corner]?.value !== undefined && shouldIncludeProperty(category, corner, filter)) {
            const value = formatBorderRadius(
                data[corner].value as BorderRadiusValue | number,
                data[corner].unit,
                getDefaultUnitForProperty('border', corner) ?? 'px'
            );
            write(corner, corner, value, `border-${corner}`);
        }
    }

    return result;
}

function flexToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    // Don't automatically set display: flex here - let the component decide

    if (data.flexDirection?.value !== undefined && shouldIncludeProperty(category, 'flexDirection', filter)) {
        const value = String(data.flexDirection.value);
        write('flexDirection', 'flexDirection', value, 'flex-direction');
    }

    // Legacy support for 'direction'
    if (data.direction?.value !== undefined && shouldIncludeProperty(category, 'direction', filter)) {
        const value = String(data.direction.value);
        write('direction', 'flexDirection', value, 'flex-direction');
    }

    if (data.justifyContent?.value !== undefined && shouldIncludeProperty(category, 'justifyContent', filter)) {
        const value = String(data.justifyContent.value);
        write('justifyContent', 'justifyContent', value, 'flex-justify');
    }

    // Legacy support for 'justify'
    if (data.justify?.value !== undefined && shouldIncludeProperty(category, 'justify', filter)) {
        const value = String(data.justify.value);
        write('justify', 'justifyContent', value, 'flex-justify');
    }

    if (data.alignItems?.value !== undefined && shouldIncludeProperty(category, 'alignItems', filter)) {
        const value = String(data.alignItems.value);
        write('alignItems', 'alignItems', value, 'flex-align');
    }

    // Legacy support for 'align'
    if (data.align?.value !== undefined && shouldIncludeProperty(category, 'align', filter)) {
        const value = String(data.align.value);
        write('align', 'alignItems', value, 'flex-align');
    }

    if (data.flexWrap?.value !== undefined && shouldIncludeProperty(category, 'flexWrap', filter)) {
        const value = String(data.flexWrap.value);
        write('flexWrap', 'flexWrap', value, 'flex-wrap');
    }

    // Legacy support for 'wrap'
    if (data.wrap?.value !== undefined && shouldIncludeProperty(category, 'wrap', filter)) {
        const value = String(data.wrap.value);
        write('wrap', 'flexWrap', value, 'flex-wrap');
    }

    if (data.gap?.value !== undefined && shouldIncludeProperty(category, 'gap', filter)) {
        const value = formatLengthValue(
            data.gap.value,
            data.gap.unit,
            getDefaultUnitForProperty('flex', 'gap')
        );
        if (value !== undefined) {
            write('gap', 'gap', value, 'flex-gap');
        }
    }

    if (data.rowGap?.value !== undefined && shouldIncludeProperty(category, 'rowGap', filter)) {
        const value = formatLengthValue(
            data.rowGap.value,
            data.rowGap.unit,
            getDefaultUnitForProperty('flex', 'rowGap')
        );
        if (value !== undefined) {
            write('rowGap', 'rowGap', value, 'flex-rowGap');
        }
    }

    if (data.columnGap?.value !== undefined && shouldIncludeProperty(category, 'columnGap', filter)) {
        const value = formatLengthValue(
            data.columnGap.value,
            data.columnGap.unit,
            getDefaultUnitForProperty('flex', 'columnGap')
        );
        if (value !== undefined) {
            write('columnGap', 'columnGap', value, 'flex-columnGap');
        }
    }

    return result;
}

function effectsToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.opacity?.value !== undefined && shouldIncludeProperty(category, 'opacity', filter)) {
        const value = String(data.opacity.value);
        write('opacity', 'opacity', value, 'effects-opacity');
    }

    if (data.boxShadow?.value !== undefined && shouldIncludeProperty(category, 'boxShadow', filter)) {
        const value = String(data.boxShadow.value);
        write('boxShadow', 'boxShadow', value, 'effects-boxShadow');
    }

    if (data.transform?.value !== undefined && shouldIncludeProperty(category, 'transform', filter)) {
        const value = String(data.transform.value);
        write('transform', 'transform', value, 'effects-transform');
    }

    if (data.filter?.value !== undefined && shouldIncludeProperty(category, 'filter', filter)) {
        const value = String(data.filter.value);
        write('filter', 'filter', value, 'effects-filter');
    }

    if (data.rotate?.value !== undefined && shouldIncludeProperty(category, 'rotate', filter)) {
        const value = formatLengthValue(
            data.rotate.value,
            data.rotate.unit,
            getDefaultUnitForProperty('effects', 'rotate')
        );
        if (value !== undefined) {
            write('rotate', 'rotate', value, 'effects-rotate');
        }
    }

    return result;
}

function svgToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    if (data.stroke?.value !== undefined && shouldIncludeProperty(category, 'stroke', filter)) {
        const value = String(data.stroke.value);
        write('stroke', 'stroke', value, 'svg-stroke');
    }
    if (data.strokeWidth?.value !== undefined && shouldIncludeProperty(category, 'strokeWidth', filter)) {
        const value = formatLengthValue(
            data.strokeWidth.value,
            data.strokeWidth.unit,
            getDefaultUnitForProperty('svg', 'strokeWidth')
        );
        if (value !== undefined) {
            write('strokeWidth', 'strokeWidth', value, 'svg-stroke-width');
        }
    }
    if (data.strokeLinecap?.value !== undefined && shouldIncludeProperty(category, 'strokeLinecap', filter)) {
        const value = String(data.strokeLinecap.value);
        write('strokeLinecap', 'strokeLinecap', value, 'svg-stroke-linecap');
    }
    if (data.strokeLinejoin?.value !== undefined && shouldIncludeProperty(category, 'strokeLinejoin', filter)) {
        const value = String(data.strokeLinejoin.value);
        write('strokeLinejoin', 'strokeLinejoin', value, 'svg-stroke-linejoin');
    }
    if (data.strokeDasharray?.value !== undefined && shouldIncludeProperty(category, 'strokeDasharray', filter)) {
        const value = String(data.strokeDasharray.value);
        write('strokeDasharray', 'strokeDasharray', value, 'svg-stroke-dasharray');
    }
    if (data.strokeDashoffset?.value !== undefined && shouldIncludeProperty(category, 'strokeDashoffset', filter)) {
        const value = formatLengthValue(
            data.strokeDashoffset.value,
            data.strokeDashoffset.unit,
            getDefaultUnitForProperty('svg', 'strokeDashoffset')
        );
        if (value !== undefined) {
            write('strokeDashoffset', 'strokeDashoffset', value, 'svg-stroke-dashoffset');
        }
    }
    if (data.strokeMiterlimit?.value !== undefined && shouldIncludeProperty(category, 'strokeMiterlimit', filter)) {
        const value = String(data.strokeMiterlimit.value);
        write('strokeMiterlimit', 'strokeMiterlimit', value, 'svg-stroke-miterlimit');
    }
    if (data.strokeOpacity?.value !== undefined && shouldIncludeProperty(category, 'strokeOpacity', filter)) {
        const value = String(data.strokeOpacity.value);
        write('strokeOpacity', 'strokeOpacity', value, 'svg-stroke-opacity');
    }
    if (data.fill?.value !== undefined && shouldIncludeProperty(category, 'fill', filter)) {
        const value = String(data.fill.value);
        write('fill', 'fill', value, 'svg-fill');
    }
    if (data.fillOpacity?.value !== undefined && shouldIncludeProperty(category, 'fillOpacity', filter)) {
        const value = String(data.fillOpacity.value);
        write('fillOpacity', 'fillOpacity', value, 'svg-fill-opacity');
    }

    return result;
}

function genericCategoryToCss(
    category: string,
    data: ResolvedCategoryData,
    options: CSSConversionOptions
): Record<string, string> {
    const result: Record<string, string> = {};
    const {filter} = options;
    const write = createOutputWriter(category, result, options);

    for (const [prop, resolved] of Object.entries(data)) {
        if (resolved?.value === undefined) continue;
        if (!shouldIncludeProperty(category, prop, filter)) continue;

        const value = String(resolved.value);
        write(prop, prop, value, `${category}-${prop}`);
    }

    return result;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatLengthValue(
    value: unknown,
    unit?: CSSUnit,
    fallbackUnit?: CSSUnit
): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') return value;

    const effectiveUnit = unit ?? fallbackUnit;
    if (!effectiveUnit) return String(value);
    if (effectiveUnit === 'auto' || effectiveUnit === 'none') return effectiveUnit;

    return `${value}${effectiveUnit}`;
}

function formatSpacingValue(
    spacing: SpacingValue | string | number,
    unit?: CSSUnit,
    fallbackUnit: CSSUnit = 'px'
): string {
    if (typeof spacing === 'string') {
        return spacing;
    }

    const effectiveUnit = unit ?? fallbackUnit;
    if (effectiveUnit === 'auto' || effectiveUnit === 'none') {
        return effectiveUnit;
    }

    if (typeof spacing === 'number') {
        return `${spacing}${effectiveUnit}`;
    }

    return `${spacing.top || 0}${effectiveUnit} ${spacing.right || 0}${effectiveUnit} ${spacing.bottom || 0}${effectiveUnit} ${spacing.left || 0}${effectiveUnit}`;
}

function formatBorderRadius(
    radius: BorderRadiusValue | string | number,
    unit?: CSSUnit,
    fallbackUnit: CSSUnit = 'px'
): string {
    if (typeof radius === 'string') {
        return radius;
    }

    const effectiveUnit = unit ?? fallbackUnit;
    if (effectiveUnit === 'auto' || effectiveUnit === 'none') {
        return effectiveUnit;
    }

    if (typeof radius === 'number') {
        return `${radius}${effectiveUnit}`;
    }
    if (typeof radius === 'object') {
        return `${radius.topLeft || 0}${effectiveUnit} ${radius.topRight || 0}${effectiveUnit} ${radius.bottomRight || 0}${effectiveUnit} ${radius.bottomLeft || 0}${effectiveUnit}`;
    }
    return String(radius);
}

function valueToRawCSS(property: string, value: unknown, unit?: CSSUnit): string | undefined {
    if (value === undefined || value === null) return undefined;
    const fallbackUnit = getDefaultUnitForPropertyName(property);

    // Handle special properties
    switch (property) {
        case 'margin':
        case 'padding':
            return formatSpacingValue(value as SpacingValue | number, unit, fallbackUnit ?? 'px');
        case 'borderRadius':
        case 'radius':
            return formatBorderRadius(value as BorderRadiusValue | number, unit, fallbackUnit ?? 'px');
        case 'fontSize':
        case 'letterSpacing':
        case 'borderWidth':
        case 'borderTopWidth':
        case 'borderRightWidth':
        case 'borderBottomWidth':
        case 'borderLeftWidth':
        case 'width':
        case 'height':
        case 'minWidth':
        case 'maxWidth':
        case 'minHeight':
        case 'maxHeight':
        case 'rowGap':
        case 'columnGap':
        case 'gap':
        case 'rotate':
            return formatLengthValue(value, unit, fallbackUnit) ?? String(value);
        case 'backgroundImage':
        case 'image':
            return formatBackgroundImageValue(value);
        default:
            return String(value);
    }
}

function formatBackgroundImageValue(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    const raw = String(value).trim();
    if (!raw) return undefined;

    const urlMatch = raw.match(/^url\((.*)\)$/i);
    let candidate = raw;
    if (urlMatch) {
        candidate = urlMatch[1].trim();
        if (
            (candidate.startsWith('"') && candidate.endsWith('"'))
            || (candidate.startsWith("'") && candidate.endsWith("'"))
        ) {
            candidate = candidate.slice(1, -1);
        }
    }

    if (isManagedMediaReference(candidate)) {
        const localUrl = mediaContentIdToPublicUrl(candidate);
        if (localUrl) {
            return `url(${localUrl})`;
        }
        return urlMatch ? raw : `url(${candidate})`;
    }

    const lower = raw.toLowerCase();
    if (
        lower === 'none'
        || lower.startsWith('url(')
        || lower.startsWith('var(')
        || lower.startsWith('image-set(')
        || lower.includes('gradient(')
    ) {
        return raw;
    }

    return `url(${raw})`;
}
