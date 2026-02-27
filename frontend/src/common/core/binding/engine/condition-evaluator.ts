/**
 * Condition Evaluator
 *
 * Evaluates condition rules and groups against entity states.
 */

import type { HassEntity } from "home-assistant-js-websocket";
import { type ComparisonOperator, type ConditionGroup, type ConditionRule, isConditionGroup } from '../types';

export type StateGetter = (entityId: string) => HassEntity | undefined;

// ============================================================================
// Main Evaluation Functions
// ============================================================================

/**
 * Evaluate a condition (rule or group) against current states
 *
 * @param condition - Condition rule or group to evaluate
 * @param getState - Function to get entity state by ID
 * @param currentEntityId - Default entity ID if not specified in condition
 * @returns Boolean result of condition evaluation
 */
export function evaluateCondition(
    condition: ConditionRule | ConditionGroup,
    getState: StateGetter,
    currentEntityId?: string
): boolean {
    if (isConditionGroup(condition)) {
        return evaluateConditionGroup(condition, getState, currentEntityId);
    }

    return evaluateConditionRule(condition, getState, currentEntityId);
}

/**
 * Evaluate a condition group (AND/OR)
 *
 * @param group - Condition group to evaluate
 * @param getState - Function to get entity state by ID
 * @param currentEntityId - Default entity ID if not specified in rules
 * @returns Boolean result of group evaluation
 */
export function evaluateConditionGroup(
    group: ConditionGroup,
    getState: StateGetter,
    currentEntityId?: string
): boolean {
    if (!group.rules || group.rules.length === 0) {
        return true; // Empty group is truthy
    }

    if (group.operator === 'and') {
        return group.rules.every((rule) =>
            evaluateCondition(rule, getState, currentEntityId)
        );
    }

    if (group.operator === 'or') {
        return group.rules.some((rule) =>
            evaluateCondition(rule, getState, currentEntityId)
        );
    }

    // Unknown operator, return false
    return false;
}

/**
 * Evaluate a single condition rule
 *
 * @param rule - Condition rule to evaluate
 * @param getState - Function to get entity state by ID
 * @param currentEntityId - Default entity ID if not specified in rule
 * @returns Boolean result of rule evaluation
 */
export function evaluateConditionRule(
    rule: ConditionRule,
    getState: StateGetter,
    currentEntityId?: string
): boolean {
    // Determine which entity to check
    const entityId = rule.entity || currentEntityId;

    if (!entityId) {
        console.warn('[ConditionEvaluator] No entity specified for condition rule');
        return false;
    }

    // Get entity state
    const state = getState(entityId);

    if (!state) {
        // Entity not found, condition is false
        return false;
    }

    // Get the value to compare
    const actualValue = getValueFromState(state, rule.attribute);

    // Evaluate based on operator
    return compareValues(actualValue, rule.operator, rule.value);
}

// ============================================================================
// Value Extraction
// ============================================================================

/**
 * Extract value from entity state
 *
 * @param state - Entity state object
 * @param attribute - Attribute name (defaults to "state")
 * @returns The extracted value
 */
function getValueFromState(state: HassEntity, attribute?: string): unknown {
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

    // Handle nested attributes with dot notation
    if (attribute.includes('.')) {
        return getNestedValue(state.attributes, attribute);
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
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        if (typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

// ============================================================================
// Comparison Functions
// ============================================================================

/**
 * Compare two values using the specified operator
 *
 * @param actual - Actual value from state
 * @param operator - Comparison operator
 * @param expected - Expected value from condition
 * @returns Boolean result of comparison
 */
function compareValues(
    actual: unknown,
    operator: ComparisonOperator,
    expected: unknown
): boolean {
    switch (operator) {
        case '==':
            return looseEqual(actual, expected);

        case '!=':
            return !looseEqual(actual, expected);

        case '>':
            return compareNumeric(actual, expected, (a, b) => a > b);

        case '<':
            return compareNumeric(actual, expected, (a, b) => a < b);

        case '>=':
            return compareNumeric(actual, expected, (a, b) => a >= b);

        case '<=':
            return compareNumeric(actual, expected, (a, b) => a <= b);

        case 'contains':
            return containsValue(actual, expected);

        case 'in':
            return isInArray(actual, expected);

        default:
            console.warn(`[ConditionEvaluator] Unknown operator: ${operator}`);
            return false;
    }
}

/**
 * Loose equality comparison (handles type coercion)
 */
function looseEqual(actual: unknown, expected: unknown): boolean {
    // Direct equality
    if (actual === expected) {
        return true;
    }

    // String comparison (case-insensitive for common HA states)
    if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.toLowerCase() === expected.toLowerCase();
    }

    // Number/string comparison
    if (typeof actual === 'string' && typeof expected === 'number') {
        return parseFloat(actual) === expected;
    }
    if (typeof actual === 'number' && typeof expected === 'string') {
        return actual === parseFloat(expected);
    }

    // Boolean handling
    if (typeof expected === 'boolean') {
        if (typeof actual === 'boolean') {
            return actual === expected;
        }
        if (typeof actual === 'string') {
            const normalized = actual.toLowerCase();
            if (expected === true) {
                return normalized === 'true' || normalized === 'on' || normalized === 'yes' || normalized === '1';
            } else {
                return normalized === 'false' || normalized === 'off' || normalized === 'no' || normalized === '0';
            }
        }
    }

    return false;
}

/**
 * Numeric comparison with type coercion
 */
function compareNumeric(
    actual: unknown,
    expected: unknown,
    compareFn: (a: number, b: number) => boolean
): boolean {
    const numActual = toNumber(actual);
    const numExpected = toNumber(expected);

    if (numActual === null || numExpected === null) {
        return false;
    }

    return compareFn(numActual, numExpected);
}

/**
 * Convert value to number
 */
function toNumber(value: unknown): number | null {
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
 * Check if actual contains expected (string)
 */
function containsValue(actual: unknown, expected: unknown): boolean {
    if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.toLowerCase().includes(expected.toLowerCase());
    }

    // Array contains
    if (Array.isArray(actual)) {
        return actual.some((item) => looseEqual(item, expected));
    }

    return false;
}

/**
 * Check if actual is in expected array
 */
function isInArray(actual: unknown, expected: unknown): boolean {
    if (!Array.isArray(expected)) {
        return false;
    }

    return expected.some((item) => looseEqual(actual, item));
}
