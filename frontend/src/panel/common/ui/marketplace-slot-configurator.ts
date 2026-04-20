import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';

import type { ActionConfig, ActionSlot, DocumentSlot } from '@/common/core/model';

const TRIGGER_LABELS: Record<string, string> = {
    tap: 'Tap',
    double_tap: 'Double Tap',
    hold: 'Hold',
};

const ACTION_LABELS: Record<string, string> = {
    'none': 'None',
    'toggle': 'Toggle',
    'call-service': 'Call Service',
    'perform-action': 'Perform Action',
    'navigate': 'Navigate',
    'more-info': 'More Info',
    'url': 'Open URL',
    'fire-dom-event': 'Fire Event',
    'toggle-menu': 'Toggle Menu',
};

@customElement('marketplace-slot-configurator')
export class MarketplaceSlotConfigurator extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .section-title {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: var(--text-secondary, #666);
            font-weight: 600;
        }

        .slots-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .slot-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 12px;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 8px;
            background: var(--bg-secondary, #f7f7f7);
        }

        .slot-label {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .slot-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary, #333);
        }

        .slot-id {
            font-size: 12px;
            color: var(--text-secondary, #666);
        }

        .slot-helper {
            font-size: 12px;
            color: var(--text-secondary, #666);
        }

        .slot-warning {
            font-size: 12px;
            color: #e65100;
            font-style: italic;
        }

        .empty-message {
            font-size: 13px;
            color: var(--text-secondary, #666);
            padding: 12px;
            text-align: center;
        }
    `;

    @property({ attribute: false })
    hass?: HomeAssistant;

    @property({ attribute: false })
    entitySlots: DocumentSlot[] = [];

    @property({ attribute: false })
    actionSlots: ActionSlot[] = [];

    @property({ attribute: false })
    slotEntities: Record<string, string> = {};

    @property({ attribute: false })
    slotActions: Record<string, ActionConfig> = {};

    @property({ type: String })
    mode: 'entities' | 'actions' | 'both' = 'both';

    @property({ type: Boolean })
    validateEntities = false;

    renderEntities(): TemplateResult {
        if (this.entitySlots.length === 0) {
            return html`<div class="empty-message">No entity slots to configure.</div>`;
        }
        return html`
            <div class="slots-list">
                ${this.entitySlots.map((slot) => this._renderEntitySlot(slot))}
            </div>
        `;
    }

    renderActions(): TemplateResult {
        if (this.actionSlots.length === 0) {
            return html`<div class="empty-message">No action slots to configure.</div>`;
        }
        return html`
            <div class="slots-list">
                ${this.actionSlots.map((slot) => this._renderActionSlot(slot))}
            </div>
        `;
    }

    protected render(): TemplateResult {
        const showEntities = this.mode === 'entities' || this.mode === 'both';
        const showActions = this.mode === 'actions' || this.mode === 'both';

        return html`
            ${showEntities && this.entitySlots.length ? html`
                <div class="section-title">Entity slots</div>
                ${this.renderEntities()}
            ` : nothing}
            ${showActions && this.actionSlots.length ? html`
                <div class="section-title">Action slots</div>
                ${this.renderActions()}
            ` : nothing}
        `;
    }

    private _renderEntitySlot(slot: DocumentSlot): TemplateResult {
        const currentValue = this.slotEntities[slot.id] ?? '';
        const entityExists = !this.validateEntities || !currentValue || Boolean(this.hass?.states?.[currentValue]);
        const helperParts = [
            slot.description || '',
            slot.domains?.length ? `Domains: ${slot.domains.join(', ')}` : '',
            slot.entityId?.trim() ? `Default: ${slot.entityId}` : '',
        ].filter(Boolean);
        const helper = helperParts.join(' · ');

        return html`
            <div class="slot-row">
                <div class="slot-label">
                    <div class="slot-name">${slot.name || slot.id}</div>
                    <div class="slot-id">${slot.id}</div>
                </div>
                <ha-selector
                    .hass=${this.hass}
                    .selector=${{
                        entity: {
                            multiple: false,
                            domain: slot.domains?.length ? slot.domains : undefined,
                        }
                    }}
                    .value=${currentValue}
                    @value-changed=${(e: CustomEvent) => this._handleEntityChanged(e, slot)}
                    allow-custom-entity
                ></ha-selector>
                ${helper ? html`<div class="slot-helper">${helper}</div>` : nothing}
                ${!entityExists ? html`
                    <div class="slot-warning">Entity "${currentValue}" not found in this Home Assistant instance.</div>
                ` : nothing}
            </div>
        `;
    }

    private _renderActionSlot(slot: ActionSlot): TemplateResult {
        const currentValue = this.slotActions[slot.id] ?? slot.action ?? { action: 'none' };
        const helperParts = [
            slot.description || '',
            `Trigger: ${TRIGGER_LABELS[slot.trigger] ?? slot.trigger}`,
            slot.action ? `Default: ${this._formatActionSummary(slot.action)}` : '',
        ].filter(Boolean);
        const helper = helperParts.join(' · ');

        return html`
            <div class="slot-row">
                <div class="slot-label">
                    <div class="slot-name">${slot.name || slot.id}</div>
                    <div class="slot-id">${slot.id}</div>
                </div>
                <ha-selector
                    .hass=${this.hass}
                    .selector=${{ ui_action: { default_action: 'none' } }}
                    .value=${currentValue}
                    @value-changed=${(e: CustomEvent) => this._handleActionChanged(e, slot)}
                ></ha-selector>
                ${helper ? html`<div class="slot-helper">${helper}</div>` : nothing}
            </div>
        `;
    }

    private _handleEntityChanged(ev: CustomEvent, slot: DocumentSlot): void {
        let value = ev.detail?.value ?? '';
        value = typeof value === 'string' ? value.trim() : '';
        const updated = { ...this.slotEntities };
        if (value) {
            updated[slot.id] = value;
        } else {
            delete updated[slot.id];
        }
        this.slotEntities = updated;
        this.dispatchEvent(new CustomEvent('slot-entities-changed', {
            detail: { slotEntities: this.slotEntities },
            bubbles: true,
            composed: true,
        }));
    }

    private _handleActionChanged(ev: CustomEvent, slot: ActionSlot): void {
        const value = ev.detail?.value || null;
        const updated = { ...this.slotActions };
        if (value && value.action !== 'none') {
            updated[slot.id] = value as ActionConfig;
        } else {
            delete updated[slot.id];
        }
        this.slotActions = updated;
        this.dispatchEvent(new CustomEvent('slot-actions-changed', {
            detail: { slotActions: this.slotActions },
            bubbles: true,
            composed: true,
        }));
    }

    private _formatActionSummary(config: ActionConfig): string {
        const label = ACTION_LABELS[config.action] ?? config.action;
        if ((config.action === 'call-service' || config.action === 'perform-action') && 'service' in config) {
            return `${label}: ${(config as any).service || ''}`;
        }
        if (config.action === 'navigate' && 'navigation_path' in config) {
            return `${label}: ${(config as any).navigation_path || ''}`;
        }
        if (config.action === 'url' && 'url_path' in config) {
            return `${label}: ${(config as any).url_path || ''}`;
        }
        return label;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'marketplace-slot-configurator': MarketplaceSlotConfigurator;
    }
}


