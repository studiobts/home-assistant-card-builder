/**
 * PropertyBindingEditor - Binding configuration editor for style properties
 *
 * Allows configuring entity bindings for style properties.
 * Reuses types from @/common/core/binding module.
 */

import type { BindingValueInputConfig } from "@/common/blocks/core/properties";
import type {
    BindingEntitySource,
    BindingMode,
    DirectBinding,
    MapBinding,
    TemplateBinding,
    Threshold,
    ThresholdBinding,
    ValueBinding
} from '@/common/core/binding';
import type { DocumentSlot, BlockEntityConfig, BlockData } from '@/common/core/model/types';
import type { ResolvedEntityInfo } from '@/common/core/model';
import type { CSSUnit } from '@/common/types/css-units';
import type { HomeAssistant } from 'custom-card-helpers';
import type { SpacingValue } from '@/panel/common/ui/style-property-editors/spacing-input';
import '@/panel/common/ui/style-property-editors/number-input';
import '@/panel/common/ui/style-property-editors/slider-input';
import '@/panel/common/ui/style-property-editors/color-input';
import '@/panel/common/ui/style-property-editors/select-input';
import '@/panel/designer/components/editors/entity-config-editor/entity-config-editor';
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@/panel/common/ui/style-property-editors/spacing-input';
import { buildEntityTemplateVariables, DEFAULT_ENTITY_TEMPLATE_KEYWORDS, HaTemplateSession } from '@/common/core/template/ha-template-service';

/**
 * Event detail for binding changes
 */
export interface BindingChangeDetail {
    binding: ValueBinding | null;
    unit?: CSSUnit;
}

const AVAILABILITY_STATES = ['unavailable', 'unknown'];

const DOMAIN_STATE_OPTIONS: Record<string, string[]> = {
    alarm_control_panel: [
        'disarmed',
        'armed_home',
        'armed_away',
        'armed_night',
        'armed_vacation',
        'armed_custom_bypass',
        'arming',
        'disarming',
        'pending',
        'triggered',
    ],
    automation: ['on', 'off'],
    binary_sensor: ['on', 'off'],
    cover: ['open', 'closed', 'opening', 'closing', 'stopped'],
    device_tracker: ['home', 'not_home'],
    fan: ['on', 'off'],
    input_boolean: ['on', 'off'],
    light: ['on', 'off'],
    lock: ['locked', 'unlocked', 'locking', 'unlocking', 'jammed'],
    media_player: ['off', 'idle', 'playing', 'paused', 'standby', 'buffering'],
    person: ['home', 'not_home'],
    script: ['on', 'off'],
    siren: ['on', 'off'],
    sun: ['above_horizon', 'below_horizon'],
    switch: ['on', 'off'],
    timer: ['idle', 'active', 'paused'],
    update: ['on', 'off'],
    vacuum: ['idle', 'cleaning', 'paused', 'returning', 'docked', 'error'],
    weather: [
        'clear-night',
        'cloudy',
        'exceptional',
        'fog',
        'hail',
        'lightning',
        'lightning-rainy',
        'partlycloudy',
        'pouring',
        'rainy',
        'snowy',
        'snowy-rainy',
        'sunny',
        'windy',
        'windy-variant',
    ],
};

const NON_NUMERIC_STATE_DOMAINS = new Set([
    'alarm_control_panel',
    'automation',
    'binary_sensor',
    'climate',
    'cover',
    'device_tracker',
    'fan',
    'input_boolean',
    'input_select',
    'light',
    'lock',
    'media_player',
    'person',
    'script',
    'select',
    'siren',
    'sun',
    'switch',
    'timer',
    'update',
    'vacuum',
    'water_heater',
    'weather',
]);

const LIKELY_NUMERIC_STATE_DOMAINS = new Set([
    'counter',
    'input_number',
    'number',
    'proximity',
    'sensor',
]);

/**
 * Property binding editor component
 */
@customElement('property-binding-editor')
export class PropertyBindingEditor extends LitElement {
    static styles = css`
        .section {
            margin-bottom: 25px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary, #666);
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
        }

        .row {
            display: flex;
            gap: 8px;
            align-items: stretch;
            margin-bottom: 8px;
        }
        
        .row > label {
            align-self: center;
        }

        .row:last-child {
            margin-bottom: 0;
        }

        label {
            font-size: 13px;
            color: var(--text-primary, #333);
            min-width: 70px;
        }

        input, select, textarea {
            flex: 1;
            box-sizing: border-box;
            padding: 6px 8px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 13px;
            font-family: inherit;
            min-width: 0;
        }

        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--accent-color, #0078d4);
        }

        textarea {
            font-size: 13px;
            min-height: 60px;
            resize: vertical;
            width: 100%;
        }

        .mode-selector {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }

        .mode-btn {
            flex: 1;
            padding: 4px 10px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 13px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .mode-btn:hover {
            background: var(--bg-secondary, #f5f5f5);
        }

        .mode-btn.active {
            background: var(--accent-color, #0078d4);
            border-color: var(--accent-color, #0078d4);
            color: white;
            font-weight: bold;
        }

        .entries-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .entry-row {
            display: flex;
            gap: 6px;
            align-items: stretch;
        }

        .entry-row input {
            flex: 1;
        }

        .entry-row select {
            flex: 1;
        }
        
        .entry-row-value-input {
            min-width: initial;
        }
        .entry-row-map-separator,
        .entry-row-threshold-separator,
        .entry-row-threshold-minmax-separator {
            align-self: center;
        }
        .entry-row-threshold-minmax-separator {
            white-space: nowrap;
        }
        .entry-row-value-output {
            min-width: 0;
        }

        .entry-row sm-number-input,
        .entry-row sm-slider-input,
        .entry-row sm-color-input,
        .entry-row sm-select-input,
        .entry-row sm-spacing-input,
        .default-input sm-number-input,
        .default-input sm-slider-input,
        .default-input sm-color-input,
        .default-input sm-select-input,
        .default-input sm-spacing-input {
            flex: 1;
        }

        .default-input {
            flex: 1;
        }

        .icon-btn {
            padding: 4px 8px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: var(--bg-primary, #fff);
            color: var(--text-secondary, #666);
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
        }

        .icon-btn:hover {
            background: var(--bg-secondary, #f5f5f5);
        }

        .icon-btn.danger:hover {
            background: #fee;
            border-color: #f88;
            color: #c00;
        }

        .icon-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .add-btn {
            align-items: center;
            padding: 6px 10px;
            border: 1px dashed var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: transparent;
            color: var(--text-secondary, #666);
            font-size: 12px;
            cursor: pointer;
        }

        .add-btn:hover {
            border-color: var(--accent-color, #0078d4);
            color: var(--accent-color, #0078d4);
        }

        .checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .checkbox-row input[type="checkbox"] {
            width: auto;
            flex: none;
        }

        .range-inputs {
            gap: 8px;
            display: flex;
            flex-direction: column;
        }

        .range-group label {
            display: block;
            margin-bottom: 4px;
        }


        .attribute-select {
            margin-top: 4px;
        }

        .template-legend {
            margin-top: 6px;
            padding: 6px 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 4px;
            font-size: 10px;
            color: var(--text-secondary, #666);
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .template-legend-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .template-legend-row code {
            font-family: monospace;
            font-size: 10px;
            color: var(--primary-text-color, #333);
        }

        .template-error {
            margin-top: 4px;
            font-size: 10px;
            color: var(--error-color, #d32f2f);
            white-space: pre-wrap;
        }
    `;
    /** Home Assistant instance */
    @property({attribute: false}) hass?: HomeAssistant;
    /** Block data */
    @property({type: Object}) block!: BlockData;
    /** Current binding configuration */
    @property({attribute: false}) binding?: ValueBinding;
    /** Default entity ID (from block or panel) */
    @property({type: String}) defaultEntityId?: string;
    /** Available slot definitions */
    @property({attribute: false}) slots: DocumentSlot[] = [];
    /** Whether editor is disabled */
    @property({type: Boolean}) disabled = false;
    /** Value input configuration */
    @property({attribute: false})
    valueInputConfig?: BindingValueInputConfig;

    // Entity Source state
    /** Entity configuration for binding */
    @state() private _entityConfig: BlockEntityConfig = { mode: 'inherited' };
    /** Resolved entity info for display */
    @state() private _resolvedEntityInfo: ResolvedEntityInfo | null = null;
    // Value source: 'state' or attribute name
    @state() private _valueSource: 'state' | string = 'state';
    /** Available attributes for selected entity */
    @state() private _availableAttributes: string[] = [];
    /** Known state options for current entity */
    @state() private _stateOptions: string[] | null = null;
    /** Whether threshold mode is supported */
    @state() private _thresholdSupported = true;
    /** Current unit for value inputs */
    @state() private _valueUnit?: CSSUnit;
    /** Current binding mode */
    @state() private _mode: BindingMode = 'direct';
    /** Map entries for map mode */
    @state() private _mapEntries: Array<{ key: string; value: unknown }> = [];
    /** Thresholds for threshold mode */
    @state() private _thresholds: Threshold[] = [];
    /** Template string for template mode */
    @state() private _template = '';
    @state() private _templateError?: string;

    private _templateSession?: HaTemplateSession;
    /** Default value */
    @state() private _defaultValue: unknown = undefined;
    @state() private _defaultHasValue = false;
    /** Input/output ranges for direct mode */
    @state() private _inputRange: [number, number] = [0, 100];
    @state() private _outputRange: [number, number] = [0, 100];
    @state() private _useRangeMapping = false;

    /** Get the effective entity ID for display */
    private get _effectiveEntityId(): string | undefined {
        if (this._entityConfig.mode === 'inherited') {
            return this.defaultEntityId;
        }
        if (this._entityConfig.mode === 'slot') {
            return this._getSlotEntityId(this._entityConfig.slotId!);
        }
        if (this._entityConfig.mode === 'fixed') {
            return this._entityConfig.entityId;
        }
        return undefined;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._syncFromBinding();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this._disposeTemplateSession();
    }

    shouldUpdate(changedProps: PropertyValues): boolean {
        // Sync from binding if changed
        if (changedProps.has('binding')) {
            this._syncFromBinding();
        }
        if (changedProps.has('valueInputConfig')) {
            this._syncValueInputConfig();
        }
        if (changedProps.has('defaultEntityId') && !changedProps.has('binding')) {
            this._updateEntityOptions();
            this._updateTemplatePreview();
        }
        if (changedProps.has('slots') && !changedProps.has('binding')) {
            this._loadAvailableAttributes();
            this._updateEntityOptions();
            this._updateTemplatePreview();
        }
        if (changedProps.has('hass')) {
            this._updateTemplatePreview();
        }
        // No need to update if only hass changed
        if (changedProps.has('hass') && changedProps.size === 1) {
            return false;
        }

        return super.shouldUpdate(changedProps);
    }

    render() {
        if (!this.hass) return html``;

        return html`
            ${this._renderEntitySourceSection()}
            ${this._renderValueSourceSection()}

            <div class="section">
                <div class="section-title">Binding Mode</div>
                <div class="mode-selector">
                    ${this._renderModeButton('direct', 'Direct')}
                    ${this._renderModeButton('map', 'Map')}
                    ${this._thresholdSupported ? this._renderModeButton('threshold', 'Threshold') : nothing}
                    ${this._renderModeButton('template', 'Template')}
                </div>
            </div>

            ${this._renderModeConfig()}

            <div class="section">
                <div class="row">
                    <label>Default</label>
                    <div class="default-input">
                        ${this._renderValueInput(
                                this._defaultValue,
                                (value, unit) => this._handleDefaultValueChange(value, unit),
                                'Fallback value'
                        )}
                    </div>
                    <button
                            class="icon-btn"
                            @click=${this._clearDefaultValue}
                            ?disabled=${this.disabled || !this._defaultHasValue}
                    >×
                    </button>
                </div>
            </div>
        `;
    }

    private _syncFromBinding(): void {
        if (!this.binding) {
            this._mode = 'direct';
            this._defaultValue = undefined;
            this._defaultHasValue = false;
            this._mapEntries = [];
            this._thresholds = [];
            this._template = '';
            this._useRangeMapping = false;
            this._entityConfig = { mode: 'inherited' };
            this._valueSource = 'state';
            this._syncValueInputConfig();
            this._updateEntityOptions();
            this._updateResolvedEntityInfo();
            return;
        }

        this._mode = this.binding.mode;
        this._defaultHasValue = this.binding.default !== undefined;
        this._defaultValue = this._defaultHasValue
            ? this.binding.default
            : this._getDefaultValueForInput();

        // Sync entity source
        if (this.binding.entity) {
            if (this.binding.entity.slotId !== undefined) {
                this._entityConfig = {
                    mode: 'slot',
                    slotId: this.binding.entity.slotId || undefined,
                };
            } else if (this.binding.entity.entityId !== undefined) {
                this._entityConfig = {
                    mode: 'fixed',
                    entityId: this.binding.entity.entityId || undefined,
                };
            } else {
                this._entityConfig = { mode: 'inherited' };
            }
            this._valueSource = this.binding.entity.source || 'state';
            // Load attributes for the entity
            this._loadAvailableAttributes();
        } else {
            this._entityConfig = { mode: 'inherited' };
            this._valueSource = 'state';
        }

        switch (this.binding.mode) {
            case 'direct': {
                const b = this.binding as DirectBinding;
                this._useRangeMapping = !!(b.inputRange || b.outputRange);
                this._inputRange = b.inputRange ?? [0, 100];
                this._outputRange = b.outputRange ?? [0, 100];
                break;
            }
            case 'map': {
                const b = this.binding as MapBinding;
                this._mapEntries = Object.entries(b.map).map(([key, value]) => ({
                    key,
                    value,
                }));
                break;
            }
            case 'threshold': {
                const b = this.binding as ThresholdBinding;
                this._thresholds = [...b.thresholds];
                break;
            }
            case 'template': {
                const b = this.binding as TemplateBinding;
                this._template = b.template;
                break;
            }
        }
        this._syncValueInputConfig();
        this._updateEntityOptions();
        this._updateResolvedEntityInfo();
        this._updateTemplatePreview();
    }

    private _buildBinding(): ValueBinding {
        // Build entity source if not using inherited with state
        const entitySource: BindingEntitySource | undefined =
            (this._entityConfig.mode === 'inherited' && this._valueSource === 'state')
                ? undefined
                : {
                    entityId: this._entityConfig.mode === 'fixed' ? this._entityConfig.entityId || null : undefined,
                    slotId: this._entityConfig.mode === 'slot' ? this._entityConfig.slotId || null : undefined,
                    source: this._valueSource,
                };

        const defaultValue = this._defaultHasValue
            ? this._normalizeDefaultValue(this._defaultValue)
            : undefined;
        const base = {
            default: defaultValue,
            entity: entitySource,
        };

        switch (this._mode) {
            case 'direct': {
                const binding: DirectBinding = {...base, mode: 'direct'};
                if (this._useRangeMapping) {
                    binding.inputRange = this._inputRange;
                    binding.outputRange = this._outputRange;
                }
                return binding;
            }
            case 'map': {
                const map: Record<string, unknown> = {};
                for (const entry of this._mapEntries) {
                    if (entry.key) {
                        map[entry.key] = entry.value;
                    }
                }
                return {...base, mode: 'map', map};
            }
            case 'threshold': {
                return {...base, mode: 'threshold', thresholds: this._thresholds};
            }
            case 'condition': {
                return {...base, mode: 'condition', conditions: []};
            }
            case 'template': {
                return {...base, mode: 'template', template: this._template};
            }
        }
    }

    private _emitChange(): void {
        const binding = this._buildBinding();
        this.dispatchEvent(
            new CustomEvent<BindingChangeDetail>('binding-change', {
                detail: {
                    binding,
                    unit: this._valueUnit,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleModeChange(mode: BindingMode): void {
        this._mode = mode;
        this._emitChange();
        this._updateTemplatePreview();
    }

    private _handleDefaultValueChange(value: unknown, unit?: CSSUnit): void {
        this._defaultValue = value;
        this._defaultHasValue = !this._isEmptyDefaultValue(value);
        this._setValueUnit(unit);
        this._emitChange();
    }

    private _clearDefaultValue(): void {
        this._defaultValue = this._getDefaultValueForInput();
        this._defaultHasValue = false;
        this._emitChange();
    }

    // Map mode handlers
    private _addMapEntry(): void {
        this._mapEntries = [
            ...this._mapEntries,
            {key: '', value: this._getDefaultValueForInput()},
        ];
    }

    private _updateMapEntryKey(index: number, value: string): void {
        this._mapEntries = this._mapEntries.map((entry, i) =>
            i === index ? {...entry, key: value} : entry
        );
        this._emitChange();
    }

    private _updateMapEntryValue(index: number, value: unknown, unit?: CSSUnit): void {
        this._mapEntries = this._mapEntries.map((entry, i) =>
            i === index ? {...entry, value} : entry
        );
        this._setValueUnit(unit);
        this._emitChange();
    }

    private _removeMapEntry(index: number): void {
        this._mapEntries = this._mapEntries.filter((_, i) => i !== index);
        this._emitChange();
    }

    // Threshold mode handlers
    private _addThreshold(): void {
        this._thresholds = [
            ...this._thresholds,
            {
                min: 0,
                max: 100,
                value: this._getDefaultValueForInput(),
            },
        ];
    }

    private _updateThreshold(index: number, field: keyof Threshold, value: unknown): void {
        this._thresholds = this._thresholds.map((t, i) =>
            i === index ? {...t, [field]: value} : t
        );
        this._emitChange();
    }

    private _updateThresholdValue(index: number, value: unknown, unit?: CSSUnit): void {
        this._thresholds = this._thresholds.map((t, i) =>
            i === index ? {...t, value} : t
        );
        this._setValueUnit(unit);
        this._emitChange();
    }

    private _removeThreshold(index: number): void {
        this._thresholds = this._thresholds.filter((_, i) => i !== index);
        this._emitChange();
    }

    // Direct mode handlers
    private _toggleRangeMapping(e: Event): void {
        this._useRangeMapping = (e.target as HTMLInputElement).checked;
        this._emitChange();
    }

    private _updateRange(type: 'input' | 'output', index: 0 | 1, value: number): void {
        if (type === 'input') {
            this._inputRange = index === 0
                ? [value, this._inputRange[1]]
                : [this._inputRange[0], value];
        } else {
            this._outputRange = index === 0
                ? [value, this._outputRange[1]]
                : [this._outputRange[0], value];
        }
        this._emitChange();
    }

    // Entity source handlers
    private _handleEntityConfigChange(e: CustomEvent<BlockEntityConfig>): void {
        this._entityConfig = e.detail;
        this._updateResolvedEntityInfo();
        this._loadAvailableAttributes();
        this._updateEntityOptions();
        this._emitChange();
        this._updateTemplatePreview();
    }

    private _updateResolvedEntityInfo(): void {
        // Build resolved entity info manually based on entity config
        const entityId = this._effectiveEntityId;

        if (!entityId) {
            this._resolvedEntityInfo = {
                source: 'none',
                entityId: undefined,
            };
            return;
        }

        if (this._entityConfig.mode === 'inherited') {
            this._resolvedEntityInfo = {
                source: 'inherited',
                entityId: entityId,
            };
        } else if (this._entityConfig.mode === 'fixed') {
            this._resolvedEntityInfo = {
                source: 'fixed',
                entityId: entityId,
            };
        } else if (this._entityConfig.mode === 'slot') {
            this._resolvedEntityInfo = {
                source: 'slot',
                entityId: entityId,
                slotId: this._entityConfig.slotId,
            };
        } else {
            this._resolvedEntityInfo = {
                source: 'none',
                entityId: undefined,
            };
        }
    }

    private _handleManageSlots(): void {
        this.dispatchEvent(new CustomEvent('manage-entities-slots', {
            bubbles: true,
            composed: true,
        }));
    }

    private _handleValueSourceTypeChange(e: Event): void {
        const type = (e.target as HTMLSelectElement).value;
        if (type === 'state') {
            this._valueSource = 'state';
        } else {
            // Switch to attribute mode - use first available attribute or a default
            this._valueSource = this._availableAttributes[0] || '';
        }
        this._updateEntityOptions();
        this._emitChange();
        this._updateTemplatePreview();
    }

    private _handleAttributeChange(e: Event): void {
        const value = (e.target as HTMLSelectElement).value;
        if (value === '__custom__') {
            // Switch to custom mode - keep current value if already custom, otherwise use a default
            if (!this._availableAttributes.includes(this._valueSource) && this._valueSource !== 'state') {
                // Already custom, keep it
                return;
            }
            // Set to a default custom attribute name
            this._valueSource = 'custom_attribute';
        } else {
            this._valueSource = value || 'state';
        }
        this._updateEntityOptions();
        this._emitChange();
        this._updateTemplatePreview();
    }

    private _handleCustomAttributeInput(e: Event): void {
        const newValue = (e.target as HTMLInputElement).value;
        // Don't allow empty or 'state' as custom attribute
        if (newValue && newValue !== 'state') {
            this._valueSource = newValue;
            this._updateEntityOptions();
            this._emitChange();
            this._updateTemplatePreview();
        }
    }

    private _loadAvailableAttributes(): void {
        const entityId = this._effectiveEntityId;
        if (!entityId || !this.hass?.states?.[entityId]) {
            this._availableAttributes = [];
            return;
        }

        const state = this.hass.states[entityId];
        const entityAttributes = Object.keys(state.attributes || {}).sort();

        // Add special attributes that are in the state object but not in attributes
        this._availableAttributes = [
            'last_changed',
            'last_updated',
            ...entityAttributes
        ];
    }

    private _getSlotEntityId(slotId: string): string | undefined {
        if (!slotId) return undefined;
        return this.slots.find((slot) => slot.id === slotId)?.entityId;
    }

    private _syncValueInputConfig(): void {
        const config = this.valueInputConfig;
        if (!config) {
            this._valueUnit = undefined;
            return;
        }

        if (config.type === 'number' || config.type === 'slider' || config.type === 'spacing') {
            const nextUnit = config.unit ?? config.units?.[0];
            if (!nextUnit) {
                this._valueUnit = undefined;
                return;
            }
            if (!this._valueUnit || (config.units && !config.units.includes(this._valueUnit))) {
                this._valueUnit = nextUnit;
            }
            return;
        }

        this._valueUnit = undefined;
    }

    private _setValueUnit(unit?: CSSUnit): void {
        if (!unit || unit === this._valueUnit) return;
        this._valueUnit = unit;
    }

    private _normalizeDefaultValue(value: unknown): unknown {
        if (typeof value === 'string' && value.trim() === '') {
            return undefined;
        }
        return value;
    }

    private _isEmptyDefaultValue(value: unknown): boolean {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        return false;
    }

    private _getDefaultValueForInput(): unknown {
        const config = this.valueInputConfig;
        if (!config) return '';

        switch (config.type) {
            case 'color':
                return '#000000';
            case 'number':
            case 'slider':
                return config.min ?? 0;
            case 'select':
                return config.options[0]?.value ?? '';
            case 'spacing':
                return {top: 0, right: 0, bottom: 0, left: 0};
            case 'icon-picker':
            case 'text':
            default:
                return '';
        }
    }

    private _getEntityState(): any {
        const entityId = this._effectiveEntityId;
        if (!entityId || !this.hass?.states?.[entityId]) return undefined;
        return this.hass.states[entityId];
    }

    private _getEntityDomain(entityId?: string): string | undefined {
        if (!entityId) return undefined;
        const [domain] = entityId.split('.');
        return domain || undefined;
    }

    private _buildStateOptions(options: unknown[], currentState: unknown): string[] {
        const result: string[] = [];
        const pushUnique = (value: string) => {
            if (!result.includes(value)) {
                result.push(value);
            }
        };

        for (const option of options) {
            if (typeof option === 'string' && option) {
                pushUnique(option);
            }
        }

        if (currentState !== undefined && currentState !== null) {
            pushUnique(String(currentState));
        }

        for (const option of AVAILABILITY_STATES) {
            pushUnique(option);
        }

        return result;
    }

    private _getAttributeStateOptions(
        domain: string,
        attributes: Record<string, unknown>
    ): string[] | null {
        if (domain === 'input_select' || domain === 'select') {
            const options = attributes.options;
            if (Array.isArray(options)) {
                return options;
            }
        }

        if (domain === 'climate') {
            const options = attributes.hvac_modes;
            if (Array.isArray(options)) {
                return options;
            }
        }

        if (domain === 'water_heater') {
            const options = attributes.operation_list ?? attributes.available_modes;
            if (Array.isArray(options)) {
                return options;
            }
        }

        return null;
    }

    private _getStateOptions(): string[] | null {
        if (this._valueSource !== 'state') return null;

        const entity = this._getEntityState();
        if (!entity) return null;

        const domain = this._getEntityDomain(entity.entity_id);
        if (!domain) return null;

        const attributeOptions = this._getAttributeStateOptions(domain, entity.attributes || {});
        if (attributeOptions) {
            return this._buildStateOptions(attributeOptions, entity.state);
        }

        const domainOptions = DOMAIN_STATE_OPTIONS[domain];
        if (domainOptions) {
            return this._buildStateOptions(domainOptions, entity.state);
        }

        return null;
    }

    private _isNumericValue(value: unknown): boolean {
        if (typeof value === 'number') return !Number.isNaN(value);
        if (typeof value === 'string' && value.trim() !== '') {
            return !Number.isNaN(Number(value));
        }
        return false;
    }

    private _isThresholdSupported(): boolean {
        if (this._valueSource === 'state') {
            if (this._stateOptions && this._stateOptions.length > 0) {
                return false;
            }

            const domain = this._getEntityDomain(this._effectiveEntityId);
            if (domain && NON_NUMERIC_STATE_DOMAINS.has(domain)) {
                return false;
            }

            const entity = this._getEntityState();
            if (entity && this._isNumericValue(entity.state)) {
                return true;
            }

            if (domain && LIKELY_NUMERIC_STATE_DOMAINS.has(domain)) {
                return true;
            }

            return true;
        }

        const entity = this._getEntityState();
        if (!entity) return true;
        const attrValue = (entity.attributes || {})[this._valueSource];
        if (attrValue === undefined || attrValue === null || attrValue === '') {
            return true;
        }
        return this._isNumericValue(attrValue);
    }

    private _updateEntityOptions(): void {
        this._stateOptions = this._getStateOptions();
        this._thresholdSupported = this._isThresholdSupported();
    }

    private _coerceSpacing(value: unknown): SpacingValue | undefined {
        if (value && typeof value === 'object') {
            const spacing = value as Partial<SpacingValue>;
            return {
                top: Number(spacing.top ?? 0),
                right: Number(spacing.right ?? 0),
                bottom: Number(spacing.bottom ?? 0),
                left: Number(spacing.left ?? 0),
            };
        }
        return undefined;
    }

    private _coerceNumber(value: unknown, fallback: number): number {
        const num = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    private _renderValueInput(
        value: unknown,
        onChange: (value: unknown, unit?: CSSUnit) => void,
        placeholder?: string
    ) {
        const config = this.valueInputConfig;
        if (!config || config.type === 'text') {
            const placeholderValue =
                (config && config.type === 'text' && config.placeholder)
                    ? config.placeholder
                    : (placeholder ?? '');
            return html`
                <input
                    type="text"
                    class="entry-row-value-output"
                    .value=${typeof value === 'string' ? value : value === undefined ? '' : String(value)}
                    @input=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
                    placeholder=${placeholderValue}
                    ?disabled=${this.disabled}
                />
            `;
        }

        switch (config.type) {
            case 'icon-picker': {
                const iconValue = typeof value === 'string' ? value : '';
                if (!this.hass) return nothing;
                return html`
                    <ha-icon-picker
                        class="entry-row-value-output"   
                        .hass=${this.hass}
                        .value=${iconValue}
                        .placeholder=${config.placeholder}
                        @value-changed=${(e: CustomEvent) => onChange(e.detail.value)}
                    ></ha-icon-picker>
                `;
            }
            case 'color': {
                const colorValue = typeof value === 'string' && value ? value : '#000000';
                return html`
                    <sm-color-input
                        class="entry-row-value-output"
                        .value=${colorValue}
                        @change=${(e: CustomEvent) => onChange(e.detail.value)}
                    ></sm-color-input>
                `;
            }
            case 'select': {
                const selectedValue = value !== undefined ? String(value) : (config.options[0]?.value ?? '');
                return html`
                    <sm-select-input
                        class="entry-row-value-output"
                        .value=${selectedValue}
                        .options=${config.options}
                        @change=${(e: CustomEvent) => onChange(e.detail.value)}
                    ></sm-select-input>
                `;
            }
            case 'spacing': {
                const unit = this._valueUnit ?? config.unit ?? config.units?.[0] ?? 'px';
                const units = config.units ?? (config.unit ? [config.unit] : ['px']);
                return html`
                    <sm-spacing-input
                        class="entry-row-value-output"
                        .value=${this._coerceSpacing(value)}
                        .unit=${unit}
                        .units=${units}
                        @change=${(e: CustomEvent) => onChange(e.detail.value, e.detail.unit)}
                    ></sm-spacing-input>
                `;
            }
            case 'slider': {
                const unit = this._valueUnit ?? config.unit ?? config.units?.[0];
                const units = config.units ?? (config.unit ? [config.unit] : []);
                return html`
                    <sm-slider-input
                        class="entry-row-value-output"
                        .value=${this._coerceNumber(value, config.min)}
                        min=${config.min}
                        max=${config.max}
                        step=${config.step ?? 1}
                        .unit=${unit}
                        .units=${units}
                        @change=${(e: CustomEvent) => onChange(e.detail.value, e.detail.unit)}
                    ></sm-slider-input>
                `;
            }
            case 'number': {
                const hasUnits = Boolean(config.unit || (config.units && config.units.length > 0));
                if (!hasUnits) {
                    return html`
                        <input
                            class="entry-row-value-output"    
                            type="number"
                            .value=${String(this._coerceNumber(value, config.min ?? 0))}
                            min=${config.min ?? ''}
                            max=${config.max ?? ''}
                            step=${config.step ?? 1}
                            @input=${(e: Event) => onChange(Number((e.target as HTMLInputElement).value))}
                            ?disabled=${this.disabled}
                        />
                    `;
                }

                const unit = this._valueUnit ?? config.unit ?? config.units?.[0] ?? 'px';
                const units = config.units ?? (config.unit ? [config.unit] : ['px']);
                return html`
                    <sm-number-input
                        class="entry-row-value-output"    
                        .value=${this._coerceNumber(value, config.min ?? 0)}
                        min=${config.min ?? ''}
                        max=${config.max ?? ''}
                        step=${config.step ?? 1}
                        .unit=${unit}
                        .units=${units}
                        @change=${(e: CustomEvent) => onChange(e.detail.value, e.detail.unit)}
                    ></sm-number-input>
                `;
            }
            default:
                return nothing;
        }
    }

    // Template mode handlers
    private _handleTemplateChange(e: Event): void {
        this._template = (e.target as HTMLTextAreaElement).value;
        this._emitChange();
        this._updateTemplatePreview();
    }

    private _updateTemplatePreview(): void {
        if (!this.hass || this._mode !== 'template') {
            this._templateError = undefined;
            this._disposeTemplateSession();
            return;
        }

        const template = this._template?.trim();
        if (!template) {
            this._templateError = undefined;
            this._disposeTemplateSession();
            return;
        }

        const variables = this._buildTemplateVariables();
        const session = this._getTemplateSession();
        session.update({
            template,
            variables,
            reportErrors: true,
            debounceMs: 250,
        });
    }

    private _buildTemplateVariables(): Record<string, unknown> {
        const state = this._getEntityState();
        const value = this._getTemplateValue(state);
        return buildEntityTemplateVariables(state as any, value);
    }

    private _getTemplateValue(state: any): unknown {
        if (!state) return undefined;

        if (this._valueSource === 'state') {
            return state.state;
        }

        if (this._valueSource === 'last_changed') {
            return state.last_changed;
        }

        if (this._valueSource === 'last_updated') {
            return state.last_updated;
        }

        return (state.attributes || {})[this._valueSource];
    }

    private _getTemplateSession(): HaTemplateSession {
        if (!this._templateSession) {
            this._templateSession = new HaTemplateSession(this.hass!, {
                onResult: () => {
                    this._templateError = undefined;
                    this.requestUpdate();
                },
                onError: (error) => {
                    this._templateError = error.error;
                    this.requestUpdate();
                },
            });
        }
        return this._templateSession;
    }

    private _disposeTemplateSession(): void {
        if (this._templateSession) {
            this._templateSession.dispose();
            this._templateSession = undefined;
        }
    }

    private _renderEntitySourceSection() {
        return html`
            <div class="section">
                <div class="section-title">Entity Source</div>
                <entity-config-editor
                    .config=${this._entityConfig}
                    .hass=${this.hass}
                    .block=${this.block}
                    .resolvedInfo=${this._resolvedEntityInfo}
                    .slots=${this.slots}
                    ?disabled=${this.disabled}
                    @config-changed=${this._handleEntityConfigChange}
                    @manage-entities-slots=${this._handleManageSlots}
                ></entity-config-editor>
            </div>
        `;
    }

    private _renderValueSourceSection() {
        const hasEntity = !!this._effectiveEntityId;
        const isAttributeMode = this._valueSource !== 'state';

        // Check if current value source is in available attributes or if it's custom
        const isCustomAttribute = isAttributeMode &&
            this._availableAttributes.length > 0 &&
            !this._availableAttributes.includes(this._valueSource);

        const attributeSelectValue = isCustomAttribute ? '__custom__' : this._valueSource;

        return html`
            <div class="section">
                <div class="section-title">Value Source</div>
                <div class="row">
                    <label>Source</label>
                    <select
                        .value=${isAttributeMode ? 'attribute' : 'state'}
                        @change=${this._handleValueSourceTypeChange}
                        ?disabled=${this.disabled || !hasEntity}
                    >
                        <option value="state">State</option>
                        <option value="attribute">Attribute</option>
                    </select>
                </div>
                ${isAttributeMode ? html`
                    <div class="row" style="margin-top: 8px;">
                        <label>Attribute</label>
                        <select
                            .value=${attributeSelectValue}
                            @change=${this._handleAttributeChange}
                            ?disabled=${this.disabled}
                        >
                            ${this._availableAttributes.length > 0
                                ? this._availableAttributes.map(attr => html`
                                    <option value=${attr} ?selected=${this._valueSource === attr}>${attr}</option>
                                `)
                                : nothing
                            }
                            <option value="__custom__" ?selected=${isCustomAttribute}>Custom...</option>
                        </select>
                    </div>
                    ${isCustomAttribute ? html`
                        <div class="row" style="margin-top: 8px;">
                            <label>Custom</label>
                            <input
                                type="text"
                                .value=${this._valueSource}
                                @input=${this._handleCustomAttributeInput}
                                placeholder="Enter attribute name"
                                ?disabled=${this.disabled}
                            />
                        </div>
                    ` : nothing}
                ` : nothing}
            </div>
        `;
    }

    private _renderModeButton(mode: BindingMode, label: string) {
        return html`
            <button
                    class="mode-btn ${this._mode === mode ? 'active' : ''}"
                    @click=${() => this._handleModeChange(mode)}
                    ?disabled=${this.disabled}
            >
                ${label}
            </button>
        `;
    }

    private _renderModeConfig() {
        switch (this._mode) {
            case 'direct':
                return this._renderDirectConfig();
            case 'map':
                return this._renderMapConfig();
            case 'threshold':
                return this._renderThresholdConfig();
            case 'template':
                return this._renderTemplateConfig();
            default:
                return nothing;
        }
    }

    private _renderDirectConfig() {
        return html`
            <div class="section">
                <div class="section-title">Range Mapping</div>
                <div class="checkbox-row">
                    <input
                            type="checkbox"
                            id="range-toggle"
                            .checked=${this._useRangeMapping}
                            @change=${this._toggleRangeMapping}
                            ?disabled=${this.disabled}
                    />
                    <label for="range-toggle">Enable range mapping</label>
                </div>
                ${this._useRangeMapping ? html`
                    <div class="range-inputs" style="margin-top: 8px;">
                        <div class="range-group">
                            <label>Input Range</label>
                            <div class="row">
                                <input
                                        type="number"
                                        .value=${String(this._inputRange[0])}
                                        @input=${(e: Event) => this._updateRange('input', 0, Number((e.target as HTMLInputElement).value))}
                                        ?disabled=${this.disabled}
                                />
                                <span>to</span>
                                <input
                                        type="number"
                                        .value=${String(this._inputRange[1])}
                                        @input=${(e: Event) => this._updateRange('input', 1, Number((e.target as HTMLInputElement).value))}
                                        ?disabled=${this.disabled}
                                />
                            </div>
                        </div>
                        <div class="range-group">
                            <label>Output Range</label>
                            <div class="row">
                                <input
                                        type="number"
                                        .value=${String(this._outputRange[0])}
                                        @input=${(e: Event) => this._updateRange('output', 0, Number((e.target as HTMLInputElement).value))}
                                        ?disabled=${this.disabled}
                                />
                                <span>to</span>
                                <input
                                        type="number"
                                        .value=${String(this._outputRange[1])}
                                        @input=${(e: Event) => this._updateRange('output', 1, Number((e.target as HTMLInputElement).value))}
                                        ?disabled=${this.disabled}
                                />
                            </div>
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _renderMapConfig() {
        const stateOptions = this._stateOptions;

        return html`
            <div class="section section-map">
                <div class="section-title">Value Mapping</div>
                <div class="entries-list">
                    ${this._mapEntries.map((entry, index) => html`
                        <div class="entry-row">
                            ${stateOptions && stateOptions.length > 0 ? html`
                                <select
                                    class="entry-row-value-input entry-row-map-input"    
                                    .value=${entry.key}
                                    @change=${(e: Event) => this._updateMapEntryKey(index, (e.target as HTMLSelectElement).value)}
                                    ?disabled=${this.disabled}
                                >
                                    <option value="" ?selected=${entry.key === ''} disabled>Select state</option>
                                    ${stateOptions.map(option => html`
                                        <option value=${option} ?selected=${entry.key === option}>${option}</option>
                                    `)}
                                </select>
                            ` : html`
                                <input
                                    type="text"
                                    class="entry-row-value-input entry-row-map-input"
                                    .value=${entry.key}
                                    @input=${(e: Event) => this._updateMapEntryKey(index, (e.target as HTMLInputElement).value)}
                                    placeholder="State value"
                                    ?disabled=${this.disabled}
                                />
                            `}
                            <span class="entry-row-map-separator">→</span>
                            ${this._renderValueInput(
                                    entry.value,
                                    (value, unit) => this._updateMapEntryValue(index, value, unit),
                                    'Output value'
                            )}
                            <button
                                class="entry-row-delete icon-btn danger"
                                @click=${() => this._removeMapEntry(index)}
                                ?disabled=${this.disabled}
                            >×
                            </button>
                        </div>
                    `)}
                    <button class="add-btn entry-row-add" @click=${this._addMapEntry} ?disabled=${this.disabled}>
                        + Add Mapping
                    </button>
                </div>
            </div>
        `;
    }

    private _renderThresholdConfig() {
        return html`
            <div class="section section-thresholds">
                <div class="section-title">Thresholds</div>
                <div class="entries-list">
                    ${this._thresholds.map((threshold, index) => html`
                        <div class="entry-row">
                            <input
                                type="number"
                                class="entry-row-value-input entry-row-threshold-input entry-row-threshold-input-min"
                                .value=${String(threshold.min ?? '')}
                                @input=${(e: Event) => this._updateThreshold(index, 'min', Number((e.target as HTMLInputElement).value))}
                                placeholder="Min"
                                style="width: 60px; flex: none;"
                                ?disabled=${this.disabled}
                            />
                            <span class="entry-row-threshold-minmax-separator">≤ X <</span>
                            <input
                                type="number"
                                class="entry-row-value-input entry-row-threshold-input entry-row-threshold-input-max"
                                .value=${String(threshold.max ?? '')}
                                @input=${(e: Event) => this._updateThreshold(index, 'max', Number((e.target as HTMLInputElement).value))}
                                placeholder="Max"
                                style="width: 60px; flex: none;"
                                ?disabled=${this.disabled}
                            />
                            <span class="entry-row-threshold-separator">→</span>
                            ${this._renderValueInput(
                                threshold.value,
                                (value, unit) => this._updateThresholdValue(index, value, unit),
                                'Output'
                            )}
                            <button
                                class="icon-btn danger entry-row-delete"
                                @click=${() => this._removeThreshold(index)}
                                ?disabled=${this.disabled}
                            >×
                            </button>
                        </div>
                    `)}
                    <button class="add-btn entry-row-add" @click=${this._addThreshold} ?disabled=${this.disabled}>
                        + Add Threshold
                    </button>
                </div>
            </div>
        `;
    }

    private _renderTemplateConfig() {
        return html`
            <div class="section section-template">
                <div class="section-title">Template</div>
                <textarea
                        .value=${this._template}
                        @input=${this._handleTemplateChange}
                        placeholder="{{value | round(2)}}px"
                        ?disabled=${this.disabled}
                ></textarea>
                <div class="template-legend">
                    ${DEFAULT_ENTITY_TEMPLATE_KEYWORDS.map((keyword) => html`
                        <div class="template-legend-row">
                            <code>{{${keyword.key}}}</code>
                            <span>${keyword.description}</span>
                        </div>
                    `)}
                </div>
                ${this._templateError ? html`<div class="template-error">${this._templateError}</div>` : nothing}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'property-binding-editor': PropertyBindingEditor;
    }
}
