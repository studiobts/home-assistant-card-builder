import { type CardData, type CardsService, getCardsService } from "@/common/api";
import { type ActionConfig, type ActionSlot, type DocumentSlot, DocumentModel } from '@/common/core/model';
import { migrateDocumentData } from '@/common/core/model/migration';
import type { HomeAssistant, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';

export interface CardBuilderRendererCardConfig extends LovelaceCardConfig {
    type: 'custom:card-builder-renderer-card';
    card_id?: string;
    slot_entities?: Record<string, string>;
    slot_actions?: Record<string, ActionConfig>;
}

const TRIGGER_LABELS = {
    tap: 'Tap',
    double_tap: 'Double Tap',
    hold: 'Hold',
} as const;

export class CardBuilderRendererCardEditor extends LitElement implements LovelaceCardEditor {
    static styles = css`
        .card-config {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 24px;
        }

        .loading p {
            margin: 0;
            color: var(--secondary-text-color);
        }

        .select-label {
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-weight: 500;
            color: var(--primary-text-color);
        }

        select {
            width: 100%;
            padding: 8px 12px;
            font-size: 14px;
            background-color: var(--card-background-color);
            color: var(--primary-text-color);
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            cursor: pointer;
        }

        select:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .no-cards {
            margin: 0;
            padding: 16px;
            background-color: var(--warning-color);
            color: var(--text-primary-color);
            border-radius: 4px;
            font-size: 0.9em;
        }

        .info {
            margin: 0;
            padding: 12px;
            background-color: var(--secondary-background-color);
            border-radius: 4px;
            color: var(--secondary-text-color);
            font-size: 0.9em;
        }

        .info code {
            padding: 2px 6px;
            background-color: var(--primary-background-color);
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.95em;
        }

        .slots-config {
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-top: 1px solid var(--divider-color);
            padding-top: 12px;
        }

        .slots-title {
            font-weight: 600;
            color: var(--primary-text-color);
        }

        .slot-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 10px;
            border: 1px solid var(--divider-color);
            border-radius: 6px;
            background: var(--secondary-background-color);
        }

        .slot-label {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .slot-name {
            font-weight: 600;
        }

        .slot-id {
            font-size: 12px;
            color: var(--secondary-text-color);
        }

        .slot-helper {
            font-size: 12px;
            color: var(--secondary-text-color);
        }
    `;
    @property({attribute: false}) public hass!: HomeAssistant;
    @state() private _config?: CardBuilderRendererCardConfig;
    @state() private _cards: CardData[] = [];
    @state() private _loading = true;
    @state() private _slots: DocumentSlot[] = [];
    @state() private _actionSlots: ActionSlot[] = [];

    private _documentModel = new DocumentModel();

    private _cardsService?: CardsService;
    private unsubscribe?: () => void;

    async connectedCallback() {
        super.connectedCallback();

        if (this.hass) {
            await this._loadCards();
            await this._subscribeToCardsUpdates();
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    public setConfig(config: CardBuilderRendererCardConfig): void {
        this._config = config;
        if (config?.card_id) {
            void this._loadCardData(config.card_id);
        } else {
            this._slots = [];
            this._actionSlots = [];
        }
    }

    async updated(changedProps: PropertyValues) {
        if (changedProps.has('hass') && this.hass && !this._cardsService) {
            await this._loadCards();
            await this._subscribeToCardsUpdates();
        }
    }

    protected render() {
        if (!this._config) {
            return html``;
        }

        const slotEntities = this._config.slot_entities || {};
        const slotActions = this._config.slot_actions || {};

        return html`
            <div class="card-config">
                ${this._loading
            ? html`
                <div class="loading">
                    <ha-circular-progress active></ha-circular-progress>
                    <p>Loading cards...</p>
                </div>
            `
            : html`
                            <label class="select-label">
                                Select Card
                                ${this._cards.length === 0
                ? html`
                                            <p class="no-cards">
                                                No cards available. Create a card in the Card Builder panel first.
                                            </p>
                                        `
                : html`
                                            <select @change=${this._cardSelected}>
                                                <option value="">-- Select a card --</option>
                                                ${this._cards.map(
                    (card) => html`
                                                            <option
                                                                    value=${card.id}
                                                                    ?selected=${this._config?.card_id === card.id}
                                                            >
                                                                ${card.name}${card.description ? ` - ${card.description}` : ''}
                                                            </option>
                                                        `
                )}
                                            </select>
                                        `
            }
                            </label>
                        `
        }

                ${this._config.card_id
            ? html`
                            <p class="info">
                                Selected card ID: <code>${this._config.card_id}</code>
                            </p>
                        `
            : html``
        }

                ${this._config.card_id && this._slots.length
            ? html`
                            <div class="slots-config">
                                <div class="slots-title">Slot entities</div>
                                ${this._slots.map(
                (slot) => {
                    const helperParts = [
                        slot.description || '',
                        slot.domains && slot.domains.length > 0 ? `Domains: ${slot.domains.join(', ')}` : '',
                        slot.entityId?.trim() ? `Default: ${slot.entityId}` : ''
                    ].filter(Boolean);
                    const helper = helperParts.join(' • ');

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
                                        domain: slot.domains && slot.domains.length > 0 ? slot.domains : undefined
                                    }
                                }}
                                .value=${slotEntities[slot.id] ?? ''}
                                @value-changed=${(e: CustomEvent) =>this._slotEntityChanged(e, slot)}
                                allow-custom-entity
                            ></ha-selector>
                            ${helper ? html`<div class="slot-helper">${helper}</div>` : html``}
                        </div>
                    `;
                }
            )}
                            </div>
                        `
            : html``
        }

                ${this._config.card_id && this._actionSlots.length
            ? html`
                            <div class="slots-config">
                                <div class="slots-title">Action slots</div>
                                ${this._actionSlots.map(
                (slot) => {
                    const helperParts = [
                        slot.description || '',
                        `Trigger: ${TRIGGER_LABELS[slot.trigger] ?? slot.trigger}`,
                        slot.action ? `Default: ${this._formatActionSummary(slot.action)}` : ''
                    ].filter(Boolean);
                    const helper = helperParts.join(' • ');

                    return html`
                        <div class="slot-row">
                            <div class="slot-label">
                                <div class="slot-name">${slot.name || slot.id}</div>
                                <div class="slot-id">${slot.id}</div>
                            </div>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ui_action: {default_action: 'none'}}}
                                .value=${slotActions[slot.id] ?? slot.action ?? {action: 'none'}}
                                @value-changed=${(e: CustomEvent) => this._slotActionChanged(e, slot)}
                            ></ha-selector>
                            ${helper ? html`<div class="slot-helper">${helper}</div>` : html``}
                        </div>
                    `;
                }
            )}
                            </div>
                        `
            : html``
        }
            </div>
        `;
    }

    private async _loadCards() {
        if (!this.hass) return;

        this._cardsService = getCardsService(this.hass);
        this._loading = true;

        try {
            this._cards = await this._cardsService.listCards();
            if (this._config?.card_id) {
                await this._loadCardData(this._config.card_id);
            }
        } catch (err) {
            console.error('Failed to load cards:', err);
        } finally {
            this._loading = false;
        }
    }

    private async _subscribeToCardsUpdates(): Promise<void> {
        if (!this._cardsService) return;

        try {
            this.unsubscribe = await this._cardsService.subscribeToUpdates(() => {
                this._loadCards();
            });
        } catch (err) {
            console.error('Failed to subscribe to cards updates:', err);
        }
    }

    private async _loadCardData(cardId: string): Promise<void> {
        const cardData = this._cards?.find((card) => card.id === cardId);
        if (!cardData) {
            this._slots = [];
            return;
        }

        const {config: migratedConfig} = migrateDocumentData(cardData.config);
        this._documentModel.loadFromConfig(migratedConfig);
        this._slots = this._documentModel.getSlotEntities();
        this._actionSlots = this._documentModel.getSlotActions();
    }

    private _cardSelected(ev: Event): void {
        if (!this._config || !this.hass) {
            return;
        }

        const target = ev.target as HTMLSelectElement;
        const cardId = target.value;

        if (this._config.card_id === cardId) {
            return;
        }

        const newConfig = {
            ...this._config,
            card_id: cardId,
            slot_entities: {},
            slot_actions: {},
        };

        const messageEvent = new CustomEvent('config-changed', {
            detail: {config: newConfig},
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }

    private _slotEntityChanged(ev: CustomEvent, slot: DocumentSlot): void {
        if (!this._config || !this.hass) {
            return;
        }

        let value = (ev as CustomEvent).detail?.value ?? '';
        value = typeof value === 'string' ? value.trim() : '';
        const slotEntities = {...(this._config.slot_entities || {})};

        if (value) {
            slotEntities[slot.id] = value;
        } else {
            delete slotEntities[slot.id];
        }

        const newConfig = {
            ...this._config,
            slot_entities: slotEntities,
        };

        const messageEvent = new CustomEvent('config-changed', {
            detail: {config: newConfig},
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }

    private _slotActionChanged(ev: CustomEvent, slot: ActionSlot): void {
        if (!this._config || !this.hass) {
            return;
        }

        const value = (ev as CustomEvent).detail?.value || null;
        const slotActions = {...(this._config.slot_actions || {})};

        if (value && value.action !== 'none') {
            slotActions[slot.id] = value as ActionConfig;
        } else {
            delete slotActions[slot.id];
        }

        const newConfig = {
            ...this._config,
            slot_actions: slotActions,
        };

        const messageEvent = new CustomEvent('config-changed', {
            detail: {config: newConfig},
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(messageEvent);
    }

    private _formatActionSummary(config: ActionConfig): string {
        const label = this._getActionLabel(config.action);

        if (config.action === 'call-service' || config.action === 'perform-action') {
            const serviceValue = this._getServiceValue(config);
            const serviceLabel = serviceValue ? `: ${serviceValue}` : '';
            return `${label}${serviceLabel}`;
        }

        if (config.action === 'navigate' && 'navigation_path' in config) {
            return `${label}: ${(config as { navigation_path?: string }).navigation_path || ''}`;
        }

        if (config.action === 'url' && 'url_path' in config) {
            return `${label}: ${(config as { url_path?: string }).url_path || ''}`;
        }

        return label;
    }

    private _getActionLabel(actionType: string): string {
        const labels: Record<string, string> = {
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
        return labels[actionType] ?? actionType;
    }

    private _getServiceValue(action: ActionConfig): string | undefined {
        if ('perform_action' in action && typeof action.perform_action === 'string' && action.perform_action) {
            return action.perform_action;
        }
        if ('service' in action && typeof action.service === 'string' && action.service) {
            return action.service;
        }
        if (
            'domain' in action
            && typeof action.domain === 'string'
            && 'service' in action
            && typeof action.service === 'string'
        ) {
            return `${action.domain}.${action.service}`;
        }
        return undefined;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'card-builder-renderer-card-editor': CardBuilderRendererCardEditor;
    }
}

import { cardRendererComponentsRegistry } from '@/cards/renderer/registry';
cardRendererComponentsRegistry.define('card-builder-renderer-card-editor', CardBuilderRendererCardEditor);
