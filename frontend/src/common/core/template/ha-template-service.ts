/**
 * Home Assistant Template Service (Jinja2 via WebSocket)
 *
 * Centralized subscription manager for template rendering.
 */

import type { HomeAssistant } from 'custom-card-helpers';
import type { HassEntity } from 'home-assistant-js-websocket';

export interface TemplateKeywordDefinition {
    key: string;
    description: string;
}

export interface TemplateKeywordValue {
    key: string;
    value: unknown;
}

export interface TemplateListeners {
    all: boolean;
    domains: string[];
    entities: string[];
    time: boolean;
}

export interface RenderTemplateResult {
    result: string;
    listeners: TemplateListeners;
}

export interface RenderTemplateError {
    error: string;
    level: 'ERROR' | 'WARNING';
}

export const TEMPLATE_GENERIC_ERROR = 'Template error';

export const DEFAULT_ENTITY_TEMPLATE_KEYWORDS: TemplateKeywordDefinition[] = [
    {key: 'value', description: 'Current value (state or attribute)'},
    {key: 'state', description: 'Entity state string'},
    {key: 'attributes', description: 'Entity attributes object'},
    {key: 'entity', description: 'Entity ID'},
    {key: 'last_changed', description: 'Last changed timestamp'},
    {key: 'last_updated', description: 'Last updated timestamp'},
];

export const ENTITY_NAME_TEMPLATE_KEYWORDS: TemplateKeywordDefinition[] = [
    ...DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
    {key: 'name', description: 'Entity friendly name'},
];

export function buildTemplateVariables(keywords?: TemplateKeywordValue[]): Record<string, unknown> {
    if (!keywords || keywords.length === 0) {
        return {};
    }

    const variables: Record<string, unknown> = {};
    for (const keyword of keywords) {
        variables[keyword.key] = keyword.value;
    }
    return variables;
}

export function buildEntityTemplateVariables(
    state: HassEntity | null | undefined,
    valueOverride?: unknown,
    extra?: TemplateKeywordValue[]
): Record<string, unknown> {
    const variables: Record<string, unknown> = {};

    if (state) {
        variables.value = valueOverride !== undefined ? valueOverride : state.state;
        variables.state = state.state;
        variables.attributes = state.attributes || {};
        variables.entity = state.entity_id;
        variables.last_changed = state.last_changed;
        variables.last_updated = state.last_updated;
    } else {
        variables.value = valueOverride;
    }

    if (extra && extra.length > 0) {
        Object.assign(variables, buildTemplateVariables(extra));
    }

    return variables;
}

export function hasDynamicListeners(listeners: TemplateListeners): boolean {
    return Boolean(
        listeners.all ||
        listeners.time ||
        (listeners.entities && listeners.entities.length > 0) ||
        (listeners.domains && listeners.domains.length > 0)
    );
}

function isRenderTemplateError(
    msg: RenderTemplateResult | RenderTemplateError
): msg is RenderTemplateError {
    return (msg as RenderTemplateError).error !== undefined;
}

export interface HaTemplateSessionUpdate {
    template: string;
    variables?: Record<string, unknown>;
    entityIds?: string | string[];
    strict?: boolean;
    reportErrors?: boolean;
    debounceMs?: number;
}

export interface HaTemplateSessionCallbacks {
    onResult?: (result: RenderTemplateResult) => void;
    onError?: (error: RenderTemplateError) => void;
}

export class HaTemplateSession {
    private unsubscribe?: () => void;
    private debounceId?: number;
    private requestId = 0;
    private lastResult?: RenderTemplateResult;
    private lastError?: RenderTemplateError;
    private lastKey?: string;

    constructor(
        private hass: HomeAssistant,
        private callbacks: HaTemplateSessionCallbacks = {}
    ) {}

    update(params: HaTemplateSessionUpdate): void {
        const template = params.template?.trim();
        if (!template) {
            this.lastResult = undefined;
            this.lastError = undefined;
            this.lastKey = undefined;
            this._cleanup();
            return;
        }

        const key = this._buildKey({...params, template});
        if (this.lastKey === key) {
            return;
        }

        this.lastKey = key;
        this.lastError = undefined;

        const debounceMs = params.debounceMs ?? 0;
        if (this.debounceId) {
            window.clearTimeout(this.debounceId);
            this.debounceId = undefined;
        }

        if (debounceMs > 0) {
            this.debounceId = window.setTimeout(() => {
                this.debounceId = undefined;
                void this._subscribe({...params, template});
            }, debounceMs);
            return;
        }

        void this._subscribe({...params, template});
    }

    dispose(): void {
        if (this.debounceId) {
            window.clearTimeout(this.debounceId);
            this.debounceId = undefined;
        }
        this._cleanup();
    }

    getResult(): RenderTemplateResult | undefined {
        return this.lastResult;
    }

    getError(): RenderTemplateError | undefined {
        return this.lastError;
    }

    private async _subscribe(params: HaTemplateSessionUpdate): Promise<void> {
        this.requestId += 1;
        const requestId = this.requestId;

        this._cleanup();

        try {
            this.unsubscribe = await this.hass.connection.subscribeMessage(
                (msg: RenderTemplateResult | RenderTemplateError) => {
                    if (requestId !== this.requestId) {
                        return;
                    }

                    if (isRenderTemplateError(msg)) {
                        this.lastError = msg;
                        this.lastResult = undefined;
                        this.callbacks.onError?.(msg);
                        this._cleanup();
                        return;
                    }

                    this.lastResult = msg;
                    this.lastError = undefined;
                    this.callbacks.onResult?.(msg);

                    if (!hasDynamicListeners(msg.listeners)) {
                        this._cleanup();
                    }
                },
                {
                    type: 'render_template',
                    template: params.template,
                    variables: params.variables,
                    entity_ids: params.entityIds,
                    strict: params.strict,
                    report_errors: params.reportErrors ?? true,
                }
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Template render failed';
            const err: RenderTemplateError = {error: message, level: 'ERROR'};
            this.lastError = err;
            this.lastResult = undefined;
            this.callbacks.onError?.(err);
            this._cleanup();
        }
    }

    private _cleanup(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    private _buildKey(params: HaTemplateSessionUpdate): string {
        const variables = params.variables ? safeStableStringify(params.variables) : '';
        const entityIds = Array.isArray(params.entityIds)
            ? params.entityIds.join(',')
            : (params.entityIds ?? '');
        return [params.template, variables, entityIds, params.strict ? '1' : '0', params.reportErrors === false ? '0' : '1'].join('::');
    }
}

function safeStableStringify(value: unknown): string {
    try {
        return stableStringify(value);
    } catch {
        return '';
    }
}

function stableStringify(value: unknown): string {
    if (value === null || value === undefined) {
        return String(value);
    }

    if (typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
    }

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`);
    return '{' + entries.join(',') + '}';
}
