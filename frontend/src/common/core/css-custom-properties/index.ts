/**
 * CSS custom properties utilities.
 */

export { getCSSCustomPropertyRegistry, type CSSCustomProperty } from './css-custom-property-registry';

/**
 * Helpers for custom CSS property registration.
 */

export const CUSTOM_PROPERTY_SYNTAX_OPTIONS = [
    '<number>',
    '<length>',
    '<length-percentage>',
    '<percentage>',
    '<angle>',
    '<time>',
    '<color>',
    '<integer>',
    '<string>',
    '<transform-function>',
    '<transform-list>',
    '<url>',
];

export const COLOR_SYNTAX = '<color>';

export function getDefaultInitialValueForSyntax(syntax: string): string {
    if (syntax === COLOR_SYNTAX) {
        return '#000000';
    }
    return '0';
}

export function getColorInputValue(value: string | undefined): string {
    if (!value) return '#000000';
    const trimmed = value.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
        return trimmed;
    }
    return '#000000';
}