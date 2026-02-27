/**
 * Shared Binding Types
 *
 * Generic binding types that can be used by any binding consumer.
 * These types define how values are resolved from Home Assistant entity states.
 */

// ============================================================================
// Binding Modes
// ============================================================================

/**
 * Available binding modes that determine how values are resolved
 */
export type BindingMode =
    | 'direct'     // Use value directly from entity state/attribute
    | 'map'        // Map state values to output values
    | 'threshold'  // Use thresholds to determine output
    | 'condition'  // Use conditions to determine output
    | 'template';  // Use template string with placeholders

// ============================================================================
// Entity Source
// ============================================================================

/**
 * Entity source configuration for binding
 * Defines which entity and what value to read from it
 */
export interface BindingEntitySource {
    /**
     * Entity ID to use for this binding.
     * If not specified, uses block's default entity or panel's default entity.
     */
    entityId?: string | null;
    /**
     * Slot ID to use for this binding.
     * When provided, the slot resolves to its configured entity.
     */
    slotId?: string | null;

    /**
     * What to read from the entity:
     * - 'state': use entity.state value
     * - any other string: use entity.attributes[source]
     */
    source: 'state' | string;
}

// ============================================================================
// Base Value Binding
// ============================================================================

/**
 * Base binding configuration shared by all binding types
 */
export interface BaseBinding {
    /** How the value should be resolved */
    mode: BindingMode;
    /** Entity source configuration (entity ID and state/attribute) */
    entity?: BindingEntitySource;
    /** Default value when source is unavailable */
    default?: unknown;
}

// ============================================================================
// Direct Binding
// ============================================================================

/**
 * Direct binding - uses entity value directly
 * Optionally with input/output range mapping
 */
export interface DirectBinding extends BaseBinding {
    mode: 'direct';
    /** Optional input range for scaling [min, max] */
    inputRange?: [number, number];
    /** Optional output range for scaling [min, max] */
    outputRange?: [number, number];
}

// ============================================================================
// Map Binding
// ============================================================================

/**
 * Map binding - maps state values to output values
 */
export interface MapBinding extends BaseBinding {
    mode: 'map';
    /** Map of input values to output values */
    map: Record<string, unknown>;
}

// ============================================================================
// Threshold Binding
// ============================================================================

/**
 * Threshold definition for numeric ranges
 */
export interface Threshold {
    /** Minimum value (inclusive) */
    min?: number;
    /** Maximum value (exclusive) */
    max?: number;
    /** Value to use when threshold matches */
    value: unknown;
}

/**
 * Threshold binding - uses numeric thresholds
 */
export interface ThresholdBinding extends BaseBinding {
    mode: 'threshold';
    /** List of thresholds to evaluate */
    thresholds: Threshold[];
}

// ============================================================================
// Condition Types
// ============================================================================

/**
 * Comparison operators for condition rules
 */
export type ComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in';

/**
 * Logical operators for condition groups
 */
export type LogicalOperator = 'and' | 'or';

/**
 * Single condition rule
 */
export interface ConditionRule {
    /** Entity ID to check (optional, uses current entity if not specified) */
    entity?: string;
    /** Attribute to check (optional, uses state if not specified) */
    attribute?: string;
    /** Comparison operator */
    operator: ComparisonOperator;
    /** Value to compare against */
    value: unknown;
}

/**
 * Group of conditions with logical operator
 */
export interface ConditionGroup {
    /** Logical operator to combine rules */
    operator: LogicalOperator;
    /** List of rules or nested groups */
    rules: (ConditionRule | ConditionGroup)[];
}

/**
 * Type guard to check if object is a ConditionRule
 */
export function isConditionRule(obj: unknown): obj is ConditionRule {
    return typeof obj === 'object' && obj !== null && 'operator' in obj && !('rules' in obj);
}

/**
 * Type guard to check if object is a ConditionGroup
 */
export function isConditionGroup(obj: unknown): obj is ConditionGroup {
    return typeof obj === 'object' && obj !== null && 'rules' in obj;
}

// ============================================================================
// Condition Binding
// ============================================================================

/**
 * Single condition with its output value
 */
export interface ConditionCase {
    /** Condition to evaluate */
    condition: ConditionRule | ConditionGroup;
    /** Value to use if condition is true */
    value: unknown;
}

/**
 * Condition binding - uses conditional logic
 */
export interface ConditionBinding extends BaseBinding {
    mode: 'condition';
    /** List of condition cases to evaluate in order */
    conditions: ConditionCase[];
}

// ============================================================================
// Template Binding
// ============================================================================

/**
 * Template binding - uses template string with placeholders
 */
export interface TemplateBinding extends BaseBinding {
    mode: 'template';
    /** Template string with {{placeholders}} */
    template: string;
}

// ============================================================================
// Union Type
// ============================================================================

/**
 * Union type of all binding types
 */
export type ValueBinding =
    | DirectBinding
    | MapBinding
    | ThresholdBinding
    | ConditionBinding
    | TemplateBinding;
