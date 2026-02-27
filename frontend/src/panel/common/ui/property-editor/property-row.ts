/**
 * PropertyRow - Wrapper for property with origin badge, binding toggle, and reset button
 *
 * Provides a consistent layout for all style properties with metadata display.
 */

import { BindingEvaluator, type ValueBinding } from '@/common/core/binding';
import { type DocumentModel, documentModelContext } from '@/common/core/model';
import { type ResolvedValue, type ValueOrigin, valueToCSSString } from '@/common/core/style-resolver';
import type { CSSUnit } from '@/common/types/css-units';
import type { HomeAssistant } from 'custom-card-helpers';
import { consume } from '@lit/context';
import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import '@/panel/common/ui/style-property-editors/property-origin-badge';

/**
 * Event detail for property binding changes
 */
export interface PropertyBindingChangeDetail {
    property: string;
    category: string;
    binding: ValueBinding | null;
}

/**
 * Event detail for binding editor open request
 */
export interface PropertyBindingEditDetail {
    property: string;
    category: string;
    label: string;
}

/**
 * Event detail for animation editor open request
 */
export interface PropertyAnimationEditDetail {
    property: string;
    category: string;
    label: string;
}

/**
 * Event detail for property reset
 */
export interface PropertyResetDetail {
    property: string;
    category: string;
}

/**
 * Property row component
 */
export class PropertyRow extends LitElement {
    static styles = css`
        :host {
            display: block;
            margin-bottom: 12px;
        }

        .property-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
        }

        .label-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            min-width: 0;
        }

        .label {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary, #333);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .controls {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            --mdc-icon-size: 18px;
        }

        .control-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px 5px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 5px;
            background: transparent;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .control-toggle:has(+ .control-toggle) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        
        .control-toggle + .control-toggle {
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }

        .control-toggle:hover:not(:disabled) {
            background: var(--bg-secondary, #f5f5f5);
            border-color: var(--border-color, #d4d4d4);
            color: var(--text-primary, #333);
        }

        .control-toggle.active {
            background: rgba(0, 120, 212, 0.1);
            outline: 1px solid var(--accent-color);
            outline-offset: -1px;
            color: var(--accent-color, #0078d4);
        }

        .control-toggle:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .property-content {
            /* Slot for the actual input */
        }

        .helper-text {
            margin-top: 6px;
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        /* Tooltip for binding toggle */

        .control-toggle[data-tooltip] {
            position: relative;
        }

        .control-toggle[data-tooltip]::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 4px 8px;
            background: #333;
            color: white;
            font-size: 10px;
            font-weight: normal;
            border-radius: 4px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.15s ease, visibility 0.15s ease;
            pointer-events: none;
            z-index: 100;
            margin-bottom: 4px;
        }

        .control-toggle[data-tooltip]:hover::after {
            opacity: 1;
            visibility: visible;
        }

        .binding-summary {
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-secondary, #f5f5f5);
            border-radius: 4px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .binding-value {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .binding-value-label {
            font-size: 9px;
            font-weight: 600;
            color: var(--text-secondary, #666);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .binding-value-field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 8px;
            background: var(--bg-primary, #fff);
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            font-size: 11px;
            color: var(--text-primary, #333);
            font-weight: 600;
            min-height: 28px;
            box-sizing: border-box;
        }

        .binding-value-field span {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .binding-actions {
            display: flex;
            gap: 6px;
        }

        .binding-action {
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            border-radius: 3px;
            padding: 4px 8px;
            font-size: 10px;
            cursor: pointer;
            white-space: nowrap;
        }

        .binding-action:hover {
            border-color: var(--accent-color, #0078d4);
            color: var(--accent-color, #0078d4);
        }

        .binding-action.danger:hover {
            border-color: #d32f2f;
            color: #d32f2f;
        }

        .binding-action:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .binding-details {
            display: grid;
            gap: 2px;
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        .binding-detail {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    /** Home Assistant instance */
    @property({attribute: false}) hass?: HomeAssistant;
    @consume({context: documentModelContext})
    documentModel?: DocumentModel;
    /** Property label */
    @property({type: String}) label = '';
    /** Property name (e.g., "fontSize") */
    @property({type: String}) property = '';
    /** Category name (e.g., "typography") */
    @property({type: String}) category = '';
    /** Value origin */
    @property({type: String}) origin: ValueOrigin = 'default';
    /** Preset name (when origin is preset) */
    @property({type: String}) presetName?: string;
    /** Origin container (for fallback) */
    @property({type: String}) originContainer?: string;
    /** Whether property has local override (can reset) */
    @property({type: Boolean}) hasLocalOverride = false;
    /** Current binding (if any) */
    @property({attribute: false}) binding?: ValueBinding;
    /** Resolved value for fallback display */
    @property({attribute: false}) resolvedValue?: unknown;
    /** Resolved unit for formatting */
    @property({type: String}) resolvedUnit?: CSSUnit;
    /** Helper text displayed under the input */
    @property({type: String}) helperText?: string;
    /** Whether binding is enabled for this property */
    @property({type: Boolean}) bindingEnabled = false;
    /** Whether to show binding toggle */
    @property({type: Boolean}) showBindingToggle = true;
    /** Whether to show animation toggle */
    @property({type: Boolean}) showAnimationToggle = true;
    /** Whether to show origin badge */
    @property({type: Boolean}) showOriginBadge = true;
    /** Whether component is disabled */
    @property({type: Boolean}) disabled = false;
    /** Default entity ID for bindings (from block or panel selection) */
    @property({type: String}) defaultEntityId?: string;


    private _bindingEvaluator?: BindingEvaluator;
    protected showSlot: boolean = true;
    protected controls: Map<string, () => TemplateResult | typeof nothing> = new Map();
    protected contents: Map<string, () => TemplateResult | typeof nothing> = new Map();


    constructor() {
        super();

        this.controls.set('binding', () => this._renderControlBinding());
        this.controls.set('animation', () => this._renderControlAnimation());

        this.contents.set('binding', () => this._renderBindingSummary());
    }

    render() {
        return html`
          <div class="property-header">
            <div class="label-group">
              <span class="label">${this.label}</span>
              ${this.showOriginBadge ? html`
                <property-origin-badge
                  .origin=${this.origin}
                  .presetName=${this.presetName}
                  .originContainer=${this.originContainer}
                  compact
                ></property-origin-badge>
              ` : nothing}
            </div>
            
            <div class="controls">
                ${this.hasLocalOverride ? html`
                    <button
                        class="control-toggle"
                        @click=${this._handleReset}
                        ?disabled=${this.disabled}
                        data-tooltip="Reset to inherited value"
                        aria-label="Reset to inherited value"
                    >
                        <ha-icon icon="mdi:backup-restore"></ha-icon>
                    </button>
                ` : nothing}
                ${Array.from(this.controls.values()).map((control) => control())}
            </div>
          </div>
    
          <div class="property-content">
              ${Array.from(this.contents.values()).map((content) => content())}
              ${this.showSlot ? html`<slot></slot>` : nothing}
              ${this.helperText ? html`<div class="helper-text">${this.helperText}</div>` : nothing}
          </div>
        `;
    }

    protected _renderControlBinding(): TemplateResult {
        const hasBinding = !!this.binding;
        this.showSlot = !hasBinding;

        return html`
            ${this.showBindingToggle ? html`
            <button
              class="control-toggle ${hasBinding ? 'active' : ''}"
              @click=${this._requestBindingEdit}
              ?disabled=${this.disabled}
              data-tooltip=${hasBinding ? 'Edit binding' : 'Add binding'}
              aria-label=${hasBinding ? 'Edit binding' : 'Add binding'}
            >
              <ha-icon icon="mdi:link-plus"></ha-icon>
            </button>
          ` : nothing}
        `;
    }

    protected _renderControlAnimation(): TemplateResult {
        return html`
            ${this.showAnimationToggle ? html`
            <button
              class="control-toggle"
              @click=${this._requestAnimationEdit}
              ?disabled=${this.disabled}
              data-tooltip='Edit animation'
              aria-label='Edit animation'
            >
                <ha-icon icon="mdi:movie-open-play-outline"></ha-icon>
            </button>
          ` : nothing}
        `;
    }

    protected willUpdate(changedProps: PropertyValues): void {
        if (changedProps.has('hass')) {
            this._bindingEvaluator = this.hass
                ? new BindingEvaluator(this.hass, {
                    resolveSlotEntity: (slotId) => this.documentModel?.resolveSlotEntity(slotId),
                    onTemplateResult: () => this.requestUpdate(),
                })
                : undefined;
        }
    }

    protected _requestBindingEdit(): void {
        if (this.disabled) return;

        this.dispatchEvent(
            new CustomEvent<PropertyBindingEditDetail>('property-binding-edit', {
                detail: {
                    property: this.property,
                    category: this.category,
                    label: this.label,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    protected _emitBindingChange(binding: ValueBinding | null): void {
        this.dispatchEvent(
            new CustomEvent<PropertyBindingChangeDetail>('property-binding-change', {
                detail: {
                    property: this.property,
                    category: this.category,
                    binding,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    protected _requestAnimationEdit(): void {
        if (this.disabled) return;

        this.dispatchEvent(
            new CustomEvent<PropertyAnimationEditDetail>('property-animation-edit', {
                detail: {
                    property: this.property,
                    category: this.category,
                    label: this.label,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    protected _handleReset(e: Event): void {
        e.stopPropagation();

        this.dispatchEvent(
            new CustomEvent<PropertyResetDetail>('property-reset', {
                detail: {
                    property: this.property,
                    category: this.category,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    protected _handleRemoveBinding(e: Event): void {
        e.stopPropagation();
        this._emitBindingChange(null);
    }

    protected _evaluateBindingValue(): { value: unknown; success: boolean } {
        if (!this.binding) {
            return {value: this.resolvedValue, success: true};
        }

        const fallbackValue = this.resolvedValue ?? this.binding.default;
        if (!this._bindingEvaluator || !this.hass) {
            return {value: fallbackValue, success: false};
        }

        return this._bindingEvaluator.evaluate(this.binding, {
            defaultEntityId: this.defaultEntityId,
            defaultValue: fallbackValue,
        });
    }

    protected _formatResolvedValue(value: unknown): string {
        if (value === undefined || value === null || value === '') {
            return '--';
        }

        const resolved: ResolvedValue = {
            value,
            unit: this.resolvedUnit,
            origin: 'default',
            hasLocalOverride: false,
        };

        return valueToCSSString(this.property, resolved) ?? String(value);
    }

    protected _formatBindingMode(mode: ValueBinding['mode']): string {
        return `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;
    }

    protected _truncate(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return `${text.slice(0, maxLength - 3)}...`;
    }

    protected _stringifyValue(value: unknown): string {
        if (value === undefined || value === null) return 'unset';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
    }

    protected _getBindingSummaryLines(binding: ValueBinding): string[] {
        const lines: string[] = [];
        const slotId = binding.entity?.slotId ?? undefined;
        const resolvedSlotEntity = slotId
            ? this.documentModel?.resolveSlotEntity(slotId)
            : undefined;
        const entityId = slotId ? resolvedSlotEntity : (binding.entity?.entityId ?? undefined);
        const source = binding.entity?.source ?? 'state';

        if (slotId) {
            lines.push(`Slot: ${slotId}`);
            if (entityId) {
                lines.push(`Entity: ${entityId}`);
            } else {
                lines.push('Entity: slot not set');
            }
        } else if (entityId) {
            lines.push(`Entity: ${entityId}`);
        } else if (this.defaultEntityId) {
            lines.push(`Entity: default (${this.defaultEntityId})`);
        } else {
            lines.push('Entity: default (not set)');
        }

        lines.push(`Source: ${source === 'state' ? 'state' : `attribute ${source}`}`);
        lines.push(`Mode: ${this._formatBindingMode(binding.mode)}`);

        switch (binding.mode) {
            case 'direct': {
                if (binding.inputRange || binding.outputRange) {
                    const inputRange = binding.inputRange
                        ? `${binding.inputRange[0]}-${binding.inputRange[1]}`
                        : 'auto';
                    const outputRange = binding.outputRange
                        ? `${binding.outputRange[0]}-${binding.outputRange[1]}`
                        : 'auto';
                    lines.push(`Range: ${inputRange} -> ${outputRange}`);
                }
                break;
            }
            case 'map':
                lines.push(`Mappings: ${Object.keys(binding.map ?? {}).length}`);
                break;
            case 'threshold':
                lines.push(`Thresholds: ${binding.thresholds?.length ?? 0}`);
                break;
            case 'template':
                if (binding.template) {
                    lines.push(`Template: ${this._truncate(binding.template, 48)}`);
                }
                break;
            case 'condition':
                lines.push(`Conditions: ${binding.conditions?.length ?? 0}`);
                break;
        }

        if (binding.default !== undefined && binding.default !== '') {
            lines.push(`Default: ${this._stringifyValue(binding.default)}`);
        }

        return lines;
    }

    protected _renderBindingSummary() {
        if (!this.binding) return nothing;

        const evaluation = this._evaluateBindingValue();
        const resolvedValue = this._formatResolvedValue(evaluation.value);
        const summaryLines = this._getBindingSummaryLines(this.binding);

        return html`
      <div class="binding-summary">
        <div class="binding-value">
          <span class="binding-value-label">Resolved value</span>
          <div class="binding-value-field">
            <span title=${resolvedValue}>${resolvedValue}</span>
            <div class="binding-actions">
              <button class="binding-action" @click=${this._requestBindingEdit} ?disabled=${this.disabled}>Edit</button>
              <button class="binding-action danger" @click=${this._handleRemoveBinding} ?disabled=${this.disabled}>Remove</button>
            </div>
          </div>
        </div>
        <div class="binding-details">
          ${summaryLines.map((line) => html`<div class="binding-detail">${line}</div>`)}
        </div>
      </div>
    `;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('property-row', PropertyRow);

declare global {
    interface HTMLElementTagNameMap {
        'property-row': PropertyRow;
    }
}
