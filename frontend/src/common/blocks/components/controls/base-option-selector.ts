import { BaseEntity } from '@/common/blocks/components/entities/base-entity';
import { dispatchBlockAction } from "@/common/blocks/core/actions/action-dispatcher";
import type { SelectOption } from '@/common/blocks/core/properties';
import type { ActionConfig } from "@/common/core/model";
import { stateIcon } from "custom-card-helpers";
import { css, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { HassEntity } from 'home-assistant-js-websocket';

// =============================================================================
// Types
// =============================================================================

export interface FeatureDefinition {
    id: string;
    label: string;
    domain: string;
    listAttributes?: string[];
    staticOptions?: string[];
    valueAttribute?: string;
    valueSource?: 'state' | 'attribute';
    service?: string;
    serviceField?: string;
    serviceMap?: Record<string, ServiceMapEntry>;
    iconAttribute?: string;
    iconType?: 'attribute' | 'state';
}

export interface ResolvedFeature extends FeatureDefinition {
    listAttribute?: string;
    options: string[];
    currentValue?: string;
}

export interface SelectorOption {
    value: string;
    label: string;
}

export interface ServiceMapEntry {
    service: string;
    data?: Record<string, unknown>;
}

// =============================================================================
// Feature Definitions
// =============================================================================

const FEATURE_DEFINITIONS: Record<string, FeatureDefinition[]> = {
    climate: [
        {
            id: 'climate_hvac_mode',
            label: 'HVAC Mode',
            domain: 'climate',
            listAttributes: ['hvac_modes'],
            valueAttribute: 'hvac_mode',
            service: 'set_hvac_mode',
            serviceField: 'hvac_mode',
            iconAttribute: 'hvac_mode',
        },
        {
            id: 'climate_fan_mode',
            label: 'Fan Mode',
            domain: 'climate',
            listAttributes: ['fan_modes'],
            valueAttribute: 'fan_mode',
            service: 'set_fan_mode',
            serviceField: 'fan_mode',
            iconAttribute: 'fan_mode',
        },
        {
            id: 'climate_swing_mode',
            label: 'Swing Mode',
            domain: 'climate',
            listAttributes: ['swing_modes'],
            valueAttribute: 'swing_mode',
            service: 'set_swing_mode',
            serviceField: 'swing_mode',
            iconAttribute: 'swing_mode',
        },
        {
            id: 'climate_preset_mode',
            label: 'Preset Mode',
            domain: 'climate',
            listAttributes: ['preset_modes'],
            valueAttribute: 'preset_mode',
            service: 'set_preset_mode',
            serviceField: 'preset_mode',
            iconAttribute: 'preset_mode',
        },
    ],
    automation: [
        {
            id: 'automation_enabled',
            label: 'Enabled',
            domain: 'automation',
            staticOptions: ['on', 'off'],
            valueSource: 'state',
            serviceMap: {
                on: {service: 'turn_on'},
                off: {service: 'turn_off'},
            },
            iconType: 'state',
        },
    ],
    water_heater: [
        {
            id: 'water_heater_operation_mode',
            label: 'Operation Mode',
            domain: 'water_heater',
            listAttributes: ['operation_list', 'available_modes'],
            valueAttribute: 'operation_mode',
            service: 'set_operation_mode',
            serviceField: 'operation_mode',
            iconAttribute: 'operation_mode',
        },
    ],
    humidifier: [
        {
            id: 'humidifier_mode',
            label: 'Mode',
            domain: 'humidifier',
            listAttributes: ['available_modes'],
            valueAttribute: 'mode',
            service: 'set_mode',
            serviceField: 'mode',
            iconAttribute: 'mode',
        },
    ],
    media_player: [
        {
            id: 'media_player_source',
            label: 'Source',
            domain: 'media_player',
            listAttributes: ['source_list'],
            valueAttribute: 'source',
            service: 'select_source',
            serviceField: 'source',
            iconAttribute: 'source',
        },
        {
            id: 'media_player_sound_mode',
            label: 'Sound Mode',
            domain: 'media_player',
            listAttributes: ['sound_mode_list'],
            valueAttribute: 'sound_mode',
            service: 'select_sound_mode',
            serviceField: 'sound_mode',
            iconAttribute: 'sound_mode',
        },
    ],
    fan: [
        {
            id: 'fan_power',
            label: 'Power',
            domain: 'fan',
            staticOptions: ['on', 'off'],
            valueSource: 'state',
            serviceMap: {
                on: {service: 'turn_on'},
                off: {service: 'turn_off'},
            },
            iconType: 'state',
        },
        {
            id: 'fan_preset_mode',
            label: 'Preset Mode',
            domain: 'fan',
            listAttributes: ['preset_modes'],
            valueAttribute: 'preset_mode',
            service: 'set_preset_mode',
            serviceField: 'preset_mode',
            iconAttribute: 'preset_mode',
        },
        {
            id: 'fan_speed',
            label: 'Speed',
            domain: 'fan',
            listAttributes: ['speed_list'],
            valueAttribute: 'speed',
            service: 'set_speed',
            serviceField: 'speed',
            iconAttribute: 'speed',
        },
    ],
    vacuum: [
        {
            id: 'vacuum_fan_speed',
            label: 'Fan Speed',
            domain: 'vacuum',
            listAttributes: ['fan_speed_list'],
            valueAttribute: 'fan_speed',
            service: 'set_fan_speed',
            serviceField: 'fan_speed',
            iconAttribute: 'fan_speed',
        },
    ],
    cover: [
        {
            id: 'cover_state',
            label: 'Open/Close',
            domain: 'cover',
            staticOptions: ['open', 'closed'],
            valueSource: 'state',
            serviceMap: {
                open: {service: 'open_cover'},
                closed: {service: 'close_cover'},
            },
            iconType: 'state',
        },
    ],
    lock: [
        {
            id: 'lock_state',
            label: 'Lock',
            domain: 'lock',
            staticOptions: ['locked', 'unlocked'],
            valueSource: 'state',
            serviceMap: {
                locked: {service: 'lock'},
                unlocked: {service: 'unlock'},
            },
            iconType: 'state',
        },
    ],
    light: [
        {
            id: 'light_power',
            label: 'Power',
            domain: 'light',
            staticOptions: ['on', 'off'],
            valueSource: 'state',
            serviceMap: {
                on: {service: 'turn_on'},
                off: {service: 'turn_off'},
            },
            iconType: 'state',
        },
        {
            id: 'light_effect',
            label: 'Effect',
            domain: 'light',
            listAttributes: ['effect_list'],
            valueAttribute: 'effect',
            service: 'turn_on',
            serviceField: 'effect',
            iconAttribute: 'effect',
        },
    ],
    switch: [
        {
            id: 'switch_power',
            label: 'Power',
            domain: 'switch',
            staticOptions: ['on', 'off'],
            valueSource: 'state',
            serviceMap: {
                on: {service: 'turn_on'},
                off: {service: 'turn_off'},
            },
            iconType: 'state',
        },
    ],
    input_boolean: [
        {
            id: 'input_boolean_state',
            label: 'State',
            domain: 'input_boolean',
            staticOptions: ['on', 'off'],
            valueSource: 'state',
            serviceMap: {
                on: {service: 'turn_on'},
                off: {service: 'turn_off'},
            },
            iconType: 'state',
        },
    ],
    siren: [
        {
            id: 'siren_state',
            label: 'State',
            domain: 'siren',
            staticOptions: ['on', 'off'],
            valueSource: 'state',
            serviceMap: {
                on: {service: 'turn_on'},
                off: {service: 'turn_off'},
            },
            iconType: 'state',
        },
    ],
    select: [
        {
            id: 'select_option',
            label: 'Option',
            domain: 'select',
            listAttributes: ['options'],
            valueSource: 'state',
            service: 'select_option',
            serviceField: 'option',
            iconAttribute: 'option',
        },
    ],
    input_select: [
        {
            id: 'input_select_option',
            label: 'Option',
            domain: 'input_select',
            listAttributes: ['options'],
            valueSource: 'state',
            service: 'select_option',
            serviceField: 'option',
            iconAttribute: 'option',
        },
    ],
};

const DEFAULT_SYNC_TIMEOUT_MS = 1500;

const normalizeOptions = (raw: unknown[]): string[] => raw
    .map((item) => (item === undefined || item === null ? '' : String(item)))
    .filter((item) => item !== '');

const uniqueOptions = (options: string[]): string[] =>
    options.filter((item, index) => options.indexOf(item) === index);

const hasService = (
    hass: { services?: Record<string, Record<string, unknown>> } | undefined,
    domain: string,
    service: string
): boolean => Boolean(hass?.services?.[domain]?.[service]);

const filterOptionsByServices = (
    definition: FeatureDefinition,
    options: string[],
    hass: { services?: Record<string, Record<string, unknown>> } | undefined
): string[] => {
    if (!hass?.services) return options;
    if (definition.serviceMap) {
        return options.filter((option) => {
            const entry = definition.serviceMap?.[option];
            if (!entry) return false;
            return hasService(hass, definition.domain, entry.service);
        });
    }
    if (definition.service) {
        return hasService(hass, definition.domain, definition.service) ? options : [];
    }
    return options;
};

const resolveDefinitionOptions = (
    definition: FeatureDefinition,
    attributes: Record<string, unknown> | undefined,
    hass: { services?: Record<string, Record<string, unknown>> } | undefined
): { listAttribute?: string; options: string[] } | null => {
    if (definition.listAttributes?.length && attributes) {
        const listAttribute = definition.listAttributes.find((name) => Array.isArray(attributes[name]));
        if (!listAttribute) return null;
        const raw = attributes[listAttribute];
        if (!Array.isArray(raw)) return null;
        const options = uniqueOptions(normalizeOptions(raw));
        const filtered = filterOptionsByServices(definition, options, hass);
        return filtered.length >= 2 ? {listAttribute, options: filtered} : null;
    }

    if (definition.staticOptions?.length) {
        const options = uniqueOptions(normalizeOptions(definition.staticOptions));
        const filtered = filterOptionsByServices(definition, options, hass);
        return filtered.length >= 2 ? {options: filtered} : null;
    }

    return null;
};

export abstract class BaseOptionSelector extends BaseEntity {
    static styles = [
        ...BaseEntity.styles,
        css`
            .option-icon ha-icon,
            .option-icon ha-attribute-icon,
            .option-icon ha-svg-icon {
                --mdc-icon-size: 16px;
            }
        `,
    ];

    @state() protected _localValue: string | null = null;

    protected _pendingValueAt = 0;
    protected _pendingTimeoutId: number | null = null;

    disconnectedCallback(): void {
        this._clearPendingTimeout();
        super.disconnectedCallback();
    }

    protected abstract _emitServiceError(error: unknown, payload: Record<string, unknown>): void;

    protected _resolveAvailableFeatures(state: HassEntity, domain: string): ResolvedFeature[] {
        const definitions = FEATURE_DEFINITIONS[domain] ?? [];
        const attributes = state.attributes as Record<string, unknown> | undefined;

        return definitions
            .map((definition) => {
                const resolved = resolveDefinitionOptions(definition, attributes, this.hass);
                if (!resolved) return null;

                const currentValue = this._getCurrentValue(state, definition);

                return {
                    ...definition,
                    listAttribute: resolved.listAttribute,
                    options: resolved.options,
                    currentValue,
                } as ResolvedFeature;
            })
            .filter((item): item is ResolvedFeature => Boolean(item));
    }

    protected _resolveSelectedFeature(available: ResolvedFeature[]): ResolvedFeature | null {
        const selected = String(this.resolveProperty('feature', 'auto') ?? 'auto');
        if (selected === 'auto') {
            return available.length === 1 ? available[0] : null;
        }
        return available.find((feature) => feature.id === selected) ?? null;
    }

    protected _getCurrentValue(state: HassEntity, definition: FeatureDefinition): string | undefined {
        const source = definition.valueSource ?? (definition.valueAttribute ? 'attribute' : 'state');
        if (source === 'state') {
            return state.state !== undefined && state.state !== null ? String(state.state) : undefined;
        }
        if (definition.valueAttribute && state.attributes) {
            const raw = (state.attributes as Record<string, unknown>)[definition.valueAttribute];
            return raw !== undefined && raw !== null ? String(raw) : undefined;
        }
        return undefined;
    }

    protected _buildOptions(feature: ResolvedFeature, state: HassEntity): SelectorOption[] {
        return feature.options.map((option) => ({
            value: option,
            label: this._formatOptionLabel(option, feature, state),
        }));
    }

    protected _formatOptionLabel(option: string, feature: ResolvedFeature, state: HassEntity): string {
        if (this.hass?.formatEntityAttributeValue && feature.valueAttribute) {
            try {
                return this.hass.formatEntityAttributeValue(state, feature.valueAttribute, option);
            } catch {
                // ignore formatting errors
            }
        }
        if (feature.staticOptions) {
            return this._formatStaticOptionLabel(option);
        }
        return option;
    }

    protected _renderOptionIcon(
        feature: ResolvedFeature,
        value: string,
        style: Record<string, string>,
        targetId: string
    ) {
        const iconType = feature.iconType ?? (feature.staticOptions ? 'state' : 'attribute');
        if (!this.hass) return nothing;

        if (iconType === 'state') {
            const stateObj = this.getEntityState();
            if (!stateObj) return nothing;
            const icon = stateIcon({...stateObj, state: value} as HassEntity);
            if (!icon) return nothing;

            return html`
                <span
                    class="option-icon ${this.isStyleTargetActive(targetId) ? 'style-target-active' : ''}"
                    style=${styleMap(style)}
                    data-style-target=${targetId}
                >
                    <ha-icon .icon=${icon}></ha-icon>
                </span>
            `;
        }

        const attribute = feature.iconAttribute ?? feature.valueAttribute ?? feature.serviceField;
        if (!attribute) return nothing;

        return html`
            <span
                class="option-icon ${this.isStyleTargetActive(targetId) ? 'style-target-active' : ''}"
                style=${styleMap(style)}
                data-style-target=${targetId}
            >
                <ha-attribute-icon
                    .hass=${this.hass}
                    .stateObj=${this.getEntityState()}
                    .attribute=${attribute}
                    .attributeValue=${value}
                ></ha-attribute-icon>
            </span>
        `;
    }

    protected _renderOptionLabel(
        label: string,
        style: Record<string, string>,
        targetId: string
    ) {
        return html`
            <span
                class="option-label ${this.isStyleTargetActive(targetId) ? 'style-target-active' : ''}"
                style=${styleMap(style)}
                data-style-target=${targetId}
            >${label}</span>
        `;
    }

    protected _getEffectiveValue(feature: ResolvedFeature, state: HassEntity): string | undefined {
        const actual = this._getCurrentValue(state, feature);
        if (!this._localValue) return actual;

        if (actual === this._localValue) {
            this._clearPendingValue();
            return actual;
        }

        const now = Date.now();
        if (now - this._pendingValueAt < DEFAULT_SYNC_TIMEOUT_MS) {
            return this._localValue;
        }

        this._clearPendingValue();
        return actual;
    }

    protected async _dispatchBlockAction(feature: ResolvedFeature, value: string) {
        if (!this.entity) return;
        const resolved = this._resolveServiceCall(feature, value);
        if (!resolved) return;

        const payload = {
            ...(resolved.data ?? {}),
            entity_id: this.entity,
        };
        const action: ActionConfig = {
            action: 'call-service',
            service: `${feature.domain}.${resolved.service}`,
            data: payload,
        };

        try {
            await dispatchBlockAction({
                hass: this.hass,
                element: this,
                action,
                trigger: 'tap',
                entityId: this.entity,
                eventBus: this.eventBus,
                blockId: this.block?.id,
                targetId: 'block',
                slotId: undefined,
                throwOnError: true,
            });
        } catch (error) {
            this._clearPendingValue();
            this._emitServiceError(error, payload);
        }
    }

    protected _resolveServiceCall(
        feature: ResolvedFeature,
        value: string
    ): { service: string; data?: Record<string, unknown> } | null {
        if (feature.serviceMap) {
            return feature.serviceMap[value] ?? null;
        }

        if (feature.service) {
            if (feature.serviceField) {
                return {
                    service: feature.service,
                    data: {[feature.serviceField]: value},
                };
            }

            return {service: feature.service};
        }

        return null;
    }

    private _formatStaticOptionLabel(value: string): string {
        return value
            .split('_')
            .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
            .join(' ');
    }

    protected _setPendingValue(value: string): void {
        this._localValue = value;
        this._pendingValueAt = Date.now();
        this._schedulePendingTimeout();
    }

    protected _clearPendingValue(): void {
        this._localValue = null;
        this._pendingValueAt = 0;
        this._clearPendingTimeout();
    }

    protected _schedulePendingTimeout(): void {
        this._clearPendingTimeout();
        this._pendingTimeoutId = window.setTimeout(() => {
            this._pendingTimeoutId = null;
            this._clearPendingValue();
            this.requestUpdate();
        }, DEFAULT_SYNC_TIMEOUT_MS);
    }

    protected _clearPendingTimeout(): void {
        if (this._pendingTimeoutId !== null) {
            window.clearTimeout(this._pendingTimeoutId);
            this._pendingTimeoutId = null;
        }
    }
}

export const buildFeatureTraitOptions = (context: unknown): SelectOption[] => {
    const safeContext = context as {
        hass?: { states?: Record<string, HassEntity>; services?: Record<string, Record<string, unknown>> };
        block?: { id?: string };
        documentModel?: { resolveEntityForBlock: (id: string) => { entityId?: string } | undefined };
    };
    const entityId = safeContext.documentModel?.resolveEntityForBlock?.(safeContext.block?.id ?? '')?.entityId;
    const state = entityId && safeContext.hass?.states?.[entityId] ? safeContext.hass.states[entityId] : undefined;
    if (!state) {
        return [{value: 'auto', label: 'Auto'}];
    }
    const domain = state.entity_id.split('.')[0];
    const definitions = FEATURE_DEFINITIONS[domain] ?? [];
    const attributes = state.attributes as Record<string, unknown> | undefined;
    const available = definitions
        .map((definition) => {
            const resolved = resolveDefinitionOptions(definition, attributes, safeContext.hass);
            if (!resolved) return null;
            return definition;
        })
        .filter((item): item is FeatureDefinition => Boolean(item));

    return [
        {value: 'auto', label: 'Auto'},
        ...available.map((feature) => ({value: feature.id, label: feature.label})),
    ];
};
