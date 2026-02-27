/**
 * Value Resolver
 *
 * Resolves binding values based on mode (direct, map, threshold, condition, template).
 * This is the core resolution logic shared by all binding consumers.
 */

import type { HassEntity } from "home-assistant-js-websocket";
import type {
    ConditionBinding,
    DirectBinding,
    MapBinding,
    TemplateBinding,
    Threshold,
    ThresholdBinding,
    ValueBinding
} from '../types';
import { evaluateCondition, type StateGetter } from './condition-evaluator';
import { parseTemplate, type TemplateContext } from './template-parser';

// ============================================================================
// Types
// ============================================================================

/**
 * Context for value resolution
 */
export interface ResolverContext {
    /** Current entity state */
    state: HassEntity | undefined;
    /** Attribute to read from state */
    attribute?: string;
    /** Function to get other entity states */
    getState: StateGetter;
    /** Current entity ID */
    entityId?: string;
}

// ============================================================================
// Main Resolver Function
// ============================================================================

/**
 * Resolve a binding value based on its mode
 *
 * @param binding - Binding configuration
 * @param context - Resolution context
 * @returns Resolved value
 */
export function resolveValue(
    binding: ValueBinding,
    context: ResolverContext
): unknown {
    // If no state available, return default
    if (!context.state) {
        return binding.default;
    }

    switch (binding.mode) {
        case 'direct':
            return resolveDirectBinding(binding as DirectBinding, context);

        case 'map':
            return resolveMapBinding(binding as MapBinding, context);

        case 'threshold':
            return resolveThresholdBinding(binding as ThresholdBinding, context);

        case 'condition':
            return resolveConditionBinding(binding as ConditionBinding, context);

        case 'template':
            return resolveTemplateBinding(binding as TemplateBinding, context);

        default:
            console.warn(`[ValueResolver] Unknown binding mode: ${(binding as ValueBinding).mode}`);
            return (binding as ValueBinding).default;
    }
}

// ============================================================================
// Direct Mode
// ============================================================================

/**
 * Resolve direct binding - uses value directly, optionally with range mapping
 */
function resolveDirectBinding(
    binding: DirectBinding,
    context: ResolverContext
): unknown {
    const rawValue = extractValue(context.state!, context.attribute);

    // If no range mapping, return raw value
    if (!binding.inputRange && !binding.outputRange) {
        return rawValue ?? binding.default;
    }

    // Apply range mapping
    const numValue = toNumber(rawValue);
    if (numValue === null) {
        return binding.default;
    }

    const inputRange = binding.inputRange ?? [0, 100];
    const outputRange = binding.outputRange ?? [0, 100];

    return mapRange(
        numValue,
        inputRange[0],
        inputRange[1],
        outputRange[0],
        outputRange[1]
    );
}

// ============================================================================
// Map Mode
// ============================================================================

/**
 * Resolve map binding - maps state values to output values
 */
function resolveMapBinding(
    binding: MapBinding,
    context: ResolverContext
): unknown {
    const rawValue = extractValue(context.state!, context.attribute);
    const key = String(rawValue);

    // Check exact match first
    if (key in binding.map) {
        return binding.map[key];
    }

    // Check case-insensitive match
    const lowerKey = key.toLowerCase();
    for (const [mapKey, mapValue] of Object.entries(binding.map)) {
        if (mapKey.toLowerCase() === lowerKey) {
            return mapValue;
        }
    }

    // No match found
    return binding.default;
}

// ============================================================================
// Threshold Mode
// ============================================================================

/**
 * Resolve threshold binding - uses numeric thresholds
 */
function resolveThresholdBinding(
    binding: ThresholdBinding,
    context: ResolverContext
): unknown {
    const rawValue = extractValue(context.state!, context.attribute);
    const numValue = toNumber(rawValue);

    if (numValue === null) {
        return binding.default;
    }

    // Find matching threshold
    const matchedThreshold = findMatchingThreshold(numValue, binding.thresholds);

    if (matchedThreshold) {
        return matchedThreshold.value;
    }

    return binding.default;
}

/**
 * Find the first matching threshold for a value
 */
function findMatchingThreshold(value: number, thresholds: Threshold[]): Threshold | null {
    for (const threshold of thresholds) {
        const minOk = threshold.min === undefined || value >= threshold.min;
        const maxOk = threshold.max === undefined || value < threshold.max;

        if (minOk && maxOk) {
            return threshold;
        }
    }
    return null;
}

// ============================================================================
// Condition Mode
// ============================================================================

/**
 * Resolve condition binding - evaluates conditions to determine value
 */
function resolveConditionBinding(
    binding: ConditionBinding,
    context: ResolverContext
): unknown {
    for (const condCase of binding.conditions) {
        const result = evaluateCondition(
            condCase.condition,
            context.getState,
            context.entityId
        );

        if (result) {
            return condCase.value;
        }
    }

    return binding.default;
}

// ============================================================================
// Template Mode
// ============================================================================

/**
 * Resolve template binding - parses template string
 */
function resolveTemplateBinding(
    binding: TemplateBinding,
    context: ResolverContext
): unknown {
    const state = context.state!;

    const templateContext: TemplateContext = {
        value: extractValue(state, context.attribute),
        state: state.state,
        attributes: state.attributes as Record<string, unknown>,
        entity: state.entity_id,
        last_changed: state.last_changed,
        last_updated: state.last_updated,
    };

    const result = parseTemplate(binding.template, templateContext);

    // If template evaluation results in empty string, use default
    return result || binding.default;
}

// ============================================================================
// Exported Utility Functions
// ============================================================================

/**
 * Extract value from entity state
 *
 * @param state - Entity state object
 * @param attribute - Attribute name (defaults to "state")
 * @returns The extracted value
 */
export function extractValue(state: HassEntity, attribute?: string): unknown {
    if (!attribute || attribute === 'state') {
        return state.state;
    }

    // Handle special attributes that are in the state object but not in attributes
    if (attribute === 'last_changed') {
        return state.last_changed;
    }
    if (attribute === 'last_updated') {
        return state.last_updated;
    }

    // Handle nested attributes
    if (attribute.includes('.')) {
        return getNestedValue(state.attributes as Record<string, unknown>, attribute);
    }

    return state.attributes[attribute];
}

/**
 * Get nested value from object using dot notation
 *
 * @param obj - Object to extract from
 * @param path - Dot-separated path (e.g., "nested.value")
 * @returns The nested value or undefined
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

/**
 * Convert value to number
 *
 * @param value - Value to convert
 * @returns Number or null if conversion fails
 */
export function toNumber(value: unknown): number | null {
    if (typeof value === 'number') {
        return isNaN(value) ? null : value;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
}

/**
 * Map a value from one range to another
 *
 * @param value - Input value
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    // Clamp input value to input range
    const clampedValue = Math.max(inMin, Math.min(inMax, value));

    // Calculate normalized position (0-1)
    const normalized = (clampedValue - inMin) / (inMax - inMin);

    // Map to output range
    return outMin + normalized * (outMax - outMin);
}
