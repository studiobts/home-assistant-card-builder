/**
 * Template Parser
 *
 * Parses template strings with {{placeholders}} and applies filters.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Context available within templates
 */
export interface TemplateContext {
    /** Raw value from entity (state or attribute) */
    value: unknown;
    /** Entity state string */
    state: string;
    /** Entity attributes object */
    attributes: Record<string, unknown>;
    /** Entity ID */
    entity: string;
    /** Last changed timestamp */
    last_changed?: string;
    /** Last updated timestamp */
    last_updated?: string;
}

/**
 * Filter function signature
 */
type FilterFn = (value: unknown, ...args: string[]) => unknown;

// ============================================================================
// Filter Registry
// ============================================================================

/**
 * Available template filters
 */
const FILTERS: Record<string, FilterFn> = {
    /**
     * Round number to specified decimals
     * Usage: {{value | round(2)}}
     */
    round: (value: unknown, decimals = '0'): unknown => {
        const num = toNumber(value);
        if (num === null) return value;
        const d = parseInt(decimals, 10) || 0;
        return num.toFixed(d);
    },

    /**
     * Convert to integer
     * Usage: {{value | int}}
     */
    int: (value: unknown): unknown => {
        const num = toNumber(value);
        if (num === null) return value;
        return Math.floor(num);
    },

    /**
     * Convert to float with optional decimals
     * Usage: {{value | float}} or {{value | float(2)}}
     */
    float: (value: unknown, decimals?: string): unknown => {
        const num = toNumber(value);
        if (num === null) return value;
        if (decimals !== undefined) {
            const d = parseInt(decimals, 10) || 0;
            return parseFloat(num.toFixed(d));
        }
        return num;
    },

    /**
     * Convert to uppercase
     * Usage: {{value | upper}}
     */
    upper: (value: unknown): unknown => {
        return String(value).toUpperCase();
    },

    /**
     * Convert to lowercase
     * Usage: {{value | lower}}
     */
    lower: (value: unknown): unknown => {
        return String(value).toLowerCase();
    },

    /**
     * Capitalize first letter
     * Usage: {{value | capitalize}}
     */
    capitalize: (value: unknown): unknown => {
        const str = String(value);
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Title case
     * Usage: {{value | title}}
     */
    title: (value: unknown): unknown => {
        return String(value)
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    },

    /**
     * Provide default if value is empty/undefined
     * Usage: {{value | default('N/A')}}
     */
    default: (value: unknown, defaultValue = ''): unknown => {
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }
        return value;
    },

    /**
     * Replace text
     * Usage: {{value | replace('_', ' ')}}
     */
    replace: (value: unknown, search = '', replacement = ''): unknown => {
        return String(value).split(search).join(replacement);
    },

    /**
     * Truncate string to length
     * Usage: {{value | truncate(10)}} or {{value | truncate(10, '...')}}
     */
    truncate: (value: unknown, length = '20', suffix = '...'): unknown => {
        const str = String(value);
        const maxLen = parseInt(length, 10) || 20;
        if (str.length <= maxLen) return str;
        return str.slice(0, maxLen - suffix.length) + suffix;
    },

    /**
     * Absolute value
     * Usage: {{value | abs}}
     */
    abs: (value: unknown): unknown => {
        const num = toNumber(value);
        if (num === null) return value;
        return Math.abs(num);
    },

    /**
     * Multiply by factor
     * Usage: {{value | multiply(100)}}
     */
    multiply: (value: unknown, factor = '1'): unknown => {
        const num = toNumber(value);
        const f = toNumber(factor);
        if (num === null || f === null) return value;
        return num * f;
    },

    /**
     * Divide by factor
     * Usage: {{value | divide(100)}}
     */
    divide: (value: unknown, factor = '1'): unknown => {
        const num = toNumber(value);
        const f = toNumber(factor);
        if (num === null || f === null || f === 0) return value;
        return num / f;
    },

    /**
     * Add value
     * Usage: {{value | add(10)}}
     */
    add: (value: unknown, addend = '0'): unknown => {
        const num = toNumber(value);
        const a = toNumber(addend);
        if (num === null || a === null) return value;
        return num + a;
    },

    /**
     * Subtract value
     * Usage: {{value | subtract(10)}}
     */
    subtract: (value: unknown, subtrahend = '0'): unknown => {
        const num = toNumber(value);
        const s = toNumber(subtrahend);
        if (num === null || s === null) return value;
        return num - s;
    },

    /**
     * Format as percentage
     * Usage: {{value | percentage}} or {{value | percentage(1)}}
     */
    percentage: (value: unknown, decimals = '0'): unknown => {
        const num = toNumber(value);
        if (num === null) return value;
        const d = parseInt(decimals, 10) || 0;
        return num.toFixed(d) + '%';
    },

    /**
     * Timestamp to relative time (simplified)
     * Usage: {{last_changed | relative_time}}
     */
    relative_time: (value: unknown): unknown => {
        if (typeof value !== 'string') return value;

        try {
            const date = new Date(value);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);

            if (diffDay > 0) return `${diffDay}d ago`;
            if (diffHour > 0) return `${diffHour}h ago`;
            if (diffMin > 0) return `${diffMin}m ago`;
            return `${diffSec}s ago`;
        } catch {
            return value;
        }
    },

    /**
     * Format timestamp
     * Usage: {{last_changed | timestamp('HH:mm')}}
     */
    timestamp: (value: unknown, format = 'HH:mm'): unknown => {
        if (typeof value !== 'string') return value;

        try {
            const date = new Date(value);

            // Simple format replacement
            return format
                .replace('YYYY', String(date.getFullYear()))
                .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
                .replace('DD', String(date.getDate()).padStart(2, '0'))
                .replace('HH', String(date.getHours()).padStart(2, '0'))
                .replace('mm', String(date.getMinutes()).padStart(2, '0'))
                .replace('ss', String(date.getSeconds()).padStart(2, '0'));
        } catch {
            return value;
        }
    },
};

// ============================================================================
// Main Parser Function
// ============================================================================

/**
 * Parse a template string and substitute placeholders
 *
 * @param template - Template string with {{placeholders}}
 * @param context - Context object with available values
 * @returns Parsed string with substitutions
 */
export function parseTemplate(template: string, context: TemplateContext): string {
    if (!template) return '';

    // Match {{...}} patterns
    const pattern = /\{\{(.+?)\}\}/g;

    return template.replace(pattern, (_match, expression: string) => {
        const result = evaluateExpression(expression.trim(), context);
        return result !== undefined && result !== null ? String(result) : '';
    });
}

/**
 * Evaluate a single expression (variable with optional filters)
 *
 * @param expression - Expression like "value | round(2)"
 * @param context - Template context
 * @returns Evaluated result
 */
function evaluateExpression(expression: string, context: TemplateContext): unknown {
    // Split by pipe for filters
    const parts = expression.split('|').map((p) => p.trim());

    // First part is the variable name
    const variableName = parts[0];
    let value = getVariableValue(variableName, context);

    // Apply filters in order
    for (let i = 1; i < parts.length; i++) {
        const filterExpr = parts[i];
        value = applyFilter(filterExpr, value);
    }

    return value;
}

/**
 * Get value from context by variable name
 *
 * @param name - Variable name (e.g., "value", "state", "attributes.temperature")
 * @param context - Template context
 * @returns Variable value
 */
function getVariableValue(name: string, context: TemplateContext): unknown {
    // Direct context properties
    switch (name) {
        case 'value':
            return context.value;
        case 'state':
            return context.state;
        case 'entity':
            return context.entity;
        case 'last_changed':
            return context.last_changed;
        case 'last_updated':
            return context.last_updated;
    }

    // Handle attributes.xxx
    if (name.startsWith('attributes.')) {
        const attrPath = name.slice('attributes.'.length);
        return getNestedValue(context.attributes, attrPath);
    }

    // Direct attribute access
    if (name in context.attributes) {
        return context.attributes[name];
    }

    // Unknown variable
    return undefined;
}

/**
 * Get nested value from object
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
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
 * Apply a filter to a value
 *
 * @param filterExpr - Filter expression like "round(2)" or "upper"
 * @param value - Value to filter
 * @returns Filtered value
 */
function applyFilter(filterExpr: string, value: unknown): unknown {
    // Parse filter name and arguments
    const match = filterExpr.match(/^(\w+)(?:\((.+)\))?$/);

    if (!match) {
        console.warn(`[TemplateParser] Invalid filter expression: ${filterExpr}`);
        return value;
    }

    const filterName = match[1];
    const argsStr = match[2];

    // Get filter function
    const filterFn = FILTERS[filterName];
    if (!filterFn) {
        console.warn(`[TemplateParser] Unknown filter: ${filterName}`);
        return value;
    }

    // Parse arguments
    const args = argsStr ? parseFilterArgs(argsStr) : [];

    // Apply filter
    try {
        return filterFn(value, ...args);
    } catch (error) {
        console.warn(`[TemplateParser] Error applying filter ${filterName}:`, error);
        return value;
    }
}

/**
 * Parse filter arguments
 * Handles: round(2), replace('_', ' '), truncate(10, '...')
 */
function parseFilterArgs(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (const char of argsStr) {
        if ((char === '"' || char === "'") && !inQuote) {
            inQuote = true;
            quoteChar = char;
        } else if (char === quoteChar && inQuote) {
            inQuote = false;
            quoteChar = '';
        } else if (char === ',' && !inQuote) {
            args.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    if (current.trim()) {
        args.push(current.trim());
    }

    // Remove quotes from string arguments
    return args.map((arg) => {
        if ((arg.startsWith('"') && arg.endsWith('"')) ||
            (arg.startsWith("'") && arg.endsWith("'"))) {
            return arg.slice(1, -1);
        }
        return arg;
    });
}

// ============================================================================
// Utility Functions
// ============================================================================

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
 * Check if a string is a template (contains {{...}})
 */
export function isTemplate(str: string): boolean {
    return /\{\{.+?\}\}/.test(str);
}

/**
 * Extract variable names from template
 * Useful for dependency tracking
 */
export function extractTemplateVariables(template: string): string[] {
    const variables: string[] = [];
    const pattern = /\{\{(.+?)\}\}/g;
    let match;

    while ((match = pattern.exec(template)) !== null) {
        const expression = match[1].trim();
        // Get variable name (before any filters)
        const variableName = expression.split('|')[0].trim();
        if (!variables.includes(variableName)) {
            variables.push(variableName);
        }
    }

    return variables;
}
