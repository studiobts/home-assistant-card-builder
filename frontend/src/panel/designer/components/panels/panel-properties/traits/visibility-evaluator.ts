/**
 * Visibility Evaluator
 *
 * Valuta le condizioni di visibilità per i property traits.
 * Supporta condizioni semplici (eq, neq, in, exists) e composte (and, or, not).
 */

import type {
    AndCondition,
    NotCondition,
    OrCondition,
    PropEqualCondition,
    PropertyVisibilityCondition,
    PropExistsCondition,
    PropInCondition,
    PropNotEqualCondition
} from '@/common/blocks/core/properties';

/**
 * Contesto per la valutazione delle condizioni
 */
export interface VisibilityEvaluationContext {
    /** Props correnti del blocco */
    props: Record<string, unknown>;
    /** Dati aggiuntivi del blocco */
    blockContext?: Record<string, unknown>;
}

// ============================================================================
// Type Guards
// ============================================================================

function isPropEqualCondition(condition: PropertyVisibilityCondition): condition is PropEqualCondition {
    return 'prop' in condition && 'eq' in condition;
}

function isPropNotEqualCondition(condition: PropertyVisibilityCondition): condition is PropNotEqualCondition {
    return 'prop' in condition && 'neq' in condition;
}

function isPropInCondition(condition: PropertyVisibilityCondition): condition is PropInCondition {
    return 'prop' in condition && 'in' in condition;
}

function isPropExistsCondition(condition: PropertyVisibilityCondition): condition is PropExistsCondition {
    return 'prop' in condition && 'exists' in condition;
}

function isAndCondition(condition: PropertyVisibilityCondition): condition is AndCondition {
    return 'and' in condition;
}

function isOrCondition(condition: PropertyVisibilityCondition): condition is OrCondition {
    return 'or' in condition;
}

function isNotCondition(condition: PropertyVisibilityCondition): condition is NotCondition {
    return 'not' in condition;
}

// ============================================================================
// Visibility Evaluator Class
// ============================================================================

export class VisibilityEvaluator {
    /**
     * Valuta se una condizione di visibilità è soddisfatta
     *
     * @param condition - La condizione da valutare (undefined = sempre visibile)
     * @param context - Il contesto di valutazione con props e valutatori custom
     * @returns true se la condizione è soddisfatta (o undefined), false altrimenti
     */
    static evaluate(
        condition: PropertyVisibilityCondition | undefined,
        context: VisibilityEvaluationContext
    ): boolean {
        // Nessuna condizione = sempre visibile
        if (condition === undefined) {
            return true;
        }

        return this._evaluateCondition(condition, context);
    }

    /**
     * Valuta ricorsivamente una condizione
     */
    private static _evaluateCondition(
        condition: PropertyVisibilityCondition,
        context: VisibilityEvaluationContext
    ): boolean {
        const {props} = context;

        // Condizione prop === value
        if (isPropEqualCondition(condition)) {
            const value = this._getNestedValue(props, condition.prop);
            return value === condition.eq;
        }

        // Condizione prop !== value
        if (isPropNotEqualCondition(condition)) {
            const value = this._getNestedValue(props, condition.prop);
            return value !== condition.neq;
        }

        // Condizione prop in [values]
        if (isPropInCondition(condition)) {
            const value = this._getNestedValue(props, condition.prop);
            return condition.in.includes(value);
        }

        // Condizione prop exists
        if (isPropExistsCondition(condition)) {
            const value = this._getNestedValue(props, condition.prop);
            const exists = value !== undefined && value !== null && value !== '';
            return condition.exists ? exists : !exists;
        }

        // Condizione AND
        if (isAndCondition(condition)) {
            return condition.and.every(c => this._evaluateCondition(c, context));
        }

        // Condizione OR
        if (isOrCondition(condition)) {
            return condition.or.some(c => this._evaluateCondition(c, context));
        }

        // Condizione NOT
        if (isNotCondition(condition)) {
            return !this._evaluateCondition(condition.not, context);
        }

        // Condizione non riconosciuta
        console.warn('[VisibilityEvaluator] Unknown condition type:', condition);
        return true;
    }

    /**
     * Ottiene un valore da un oggetto usando una path con dot notation
     * Es: "entity.state" -> obj.entity.state
     */
    private static _getNestedValue(obj: Record<string, unknown>, path: string): unknown {
        const keys = path.split('.');
        let value: unknown = obj;

        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = (value as Record<string, unknown>)[key];
        }

        return value;
    }
}
