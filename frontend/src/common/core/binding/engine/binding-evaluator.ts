/**
 * Binding Evaluator
 *
 * Adapter that uses the shared binding module to evaluate style bindings.
 * Provides a bridge between Home Assistant states and the binding resolution system.
 */

import { type ResolverContext, resolveValue, type ValueBinding } from '@/common/core/binding';
import {
    buildEntityTemplateVariables,
    HaTemplateSession,
    TEMPLATE_GENERIC_ERROR,
    type RenderTemplateError
} from '@/common/core/template/ha-template-service';
import type { HomeAssistant } from 'custom-card-helpers';
import type { HassEntity } from "home-assistant-js-websocket";


// ============================================================================
// Types
// ============================================================================

/**
 * Result of binding evaluation
 */
export interface BindingEvaluationResult {
    /** The evaluated value */
    value: unknown;
    /** Whether evaluation was successful */
    success: boolean;
    /** Error message if evaluation failed */
    error?: string;
}

/**
 * Options for binding evaluation
 */
export interface BindingEvaluateOptions {
    /** Default value if binding cannot be resolved */
    defaultValue?: unknown;
    /**
     * Default entity ID to use if binding doesn't specify one.
     * Binding's entity.entityId takes precedence over this.
     */
    defaultEntityId?: string;
}

export interface BindingEvaluatorOptions {
    resolveSlotEntity?: (slotId: string) => string | undefined;
    onTemplateResult?: (data: { key: string; value?: string; error?: RenderTemplateError }) => void;
}

// ============================================================================
// Binding Evaluator
// ============================================================================

/**
 * Evaluates style bindings against Home Assistant entity states
 */
// FIXME: add a method to update data instead of creating a new instance every time
export class BindingEvaluator {
    constructor(
        private hass: HomeAssistant,
        private options: BindingEvaluatorOptions = {}
    ) {
    }

    private templateSessions = new Map<string, HaTemplateSession>();
    private bindingTemplateKeys = new WeakMap<object, string>();

    /**
     * Evaluate a binding and return the resolved value
     *
     * The entity and attribute are resolved in this order:
     * 1. binding.entity.entityId (if specified)
     * 2. options.defaultEntityId (fallback)
     *
     * The value source is determined by:
     * 1. binding.entity.source (if 'state', uses entity.state; otherwise uses entity.attributes[source])
     * 2. Falls back to 'state' if not specified
     *
     * @param binding - The binding configuration
     * @param options - Evaluation options
     * @returns The evaluation result
     */
    evaluate(binding: ValueBinding, options: BindingEvaluateOptions = {}): BindingEvaluationResult {
        const {defaultValue, defaultEntityId} = options;

        const slotId = binding.entity?.slotId ?? undefined;
        const slotEntityId = slotId ? this.options.resolveSlotEntity?.(slotId) : undefined;

        // Resolve entity ID: slot > binding.entity.entityId > defaultEntityId
        const entityId = slotId ? slotEntityId : (binding.entity?.entityId || defaultEntityId);

        // Resolve value source: binding.entity.source or default to 'state'
        const source = binding.entity?.source || 'state';
        const attribute = source === 'state' ? undefined : source;

        // If no entity specified, return default
        if (!entityId) {
            return {
                value: defaultValue ?? binding.default,
                success: true,
            };
        }

        try {
            // Build resolver context
            const context: ResolverContext = {
                state: this._getEntityState(entityId),
                attribute,
                entityId,
                getState: (id) => this._getEntityState(id),
            };

            // Template mode is handled via HA template service (async)
            if (binding.mode === 'template') {
                const value = this._evaluateTemplateBinding(binding, context, defaultValue);
                return {
                    value,
                    success: true,
                };
            }

            // Resolve the binding
            const value = resolveValue(binding, context);

            // If resolution returned undefined, use default
            if (value === undefined) {
                return {
                    value: defaultValue ?? binding.default,
                    success: true,
                };
            }

            return {
                value,
                success: true,
            };
        } catch (error) {
            console.warn('[BindingEvaluator] Evaluation failed:', error);
            return {
                value: defaultValue ?? binding.default,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    private _evaluateTemplateBinding(
        binding: ValueBinding,
        context: ResolverContext,
        defaultValue?: unknown
    ): unknown {
        const templateBinding = binding as { template: string };
        const template = templateBinding.template?.trim();
        const state = context.state;
        if (!template || !state) {
            this._clearBindingTemplateSession(binding as object);
            return defaultValue ?? binding.default;
        }

        const value = this._extractValue(state, context.attribute);
        const variables = buildEntityTemplateVariables(state, value);
        const key = this._getTemplateSessionKey(template, context);
        this._trackBindingTemplateKey(binding as object, key);
        const session = this._getTemplateSession(key);

        session.update({
            template,
            variables,
            reportErrors: true,
        });

        const error = session.getError();
        if (error) {
            return TEMPLATE_GENERIC_ERROR;
        }

        const result = session.getResult()?.result;
        if (result !== undefined) {
            return result;
        }

        return defaultValue ?? binding.default;
    }

    private _trackBindingTemplateKey(binding: object, key: string): void {
        const previous = this.bindingTemplateKeys.get(binding);
        if (previous && previous !== key) {
            const oldSession = this.templateSessions.get(previous);
            if (oldSession) {
                oldSession.dispose();
                this.templateSessions.delete(previous);
            }
        }
        this.bindingTemplateKeys.set(binding, key);
    }

    private _clearBindingTemplateSession(binding: object): void {
        const previous = this.bindingTemplateKeys.get(binding);
        if (!previous) return;
        const session = this.templateSessions.get(previous);
        if (session) {
            session.dispose();
            this.templateSessions.delete(previous);
        }
        this.bindingTemplateKeys.delete(binding);
    }

    private _getTemplateSession(key: string): HaTemplateSession {
        let session = this.templateSessions.get(key);
        if (!session) {
            session = new HaTemplateSession(this.hass, {
                onResult: (result) => this.options.onTemplateResult?.({key, value: result.result}),
                onError: (error) => this.options.onTemplateResult?.({key, error}),
            });
            this.templateSessions.set(key, session);
        }
        return session;
    }

    private _getTemplateSessionKey(template: string, context: ResolverContext): string {
        const entity = context.entityId ?? '';
        const attribute = context.attribute ?? 'state';
        return `${entity}::${attribute}::${template}`;
    }

    private _extractValue(state: HassEntity, attribute?: string): unknown {
        if (!attribute || attribute === 'state') {
            return state.state;
        }

        if (attribute === 'last_changed') {
            return state.last_changed;
        }
        if (attribute === 'last_updated') {
            return state.last_updated;
        }

        if (attribute.includes('.')) {
            const parts = attribute.split('.');
            let current: unknown = state.attributes as Record<string, unknown>;
            for (const part of parts) {
                if (current === null || current === undefined) return undefined;
                if (typeof current !== 'object') return undefined;
                current = (current as Record<string, unknown>)[part];
            }
            return current;
        }

        return state.attributes?.[attribute];
    }

    /**
     * Get entity state in the format expected by the binding resolver
     */
    private _getEntityState(entityId: string): HassEntity | undefined {
        const state = this.hass.states[entityId];
        if (!state) return undefined;

        return {
            entity_id: state.entity_id,
            state: state.state,
            attributes: state.attributes || {},
            last_changed: state.last_changed,
            last_updated: state.last_updated,
            context: state.context
        };
    }
}
