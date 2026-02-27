/**
 * Entity Configuration Editor Component
 *
 * Provides UI for configuring block entity settings:
 * - Mode selection: Inherited, Slot, or Fixed
 * - Entity picker when fixed mode
 * - Slot selection when slot mode
 * - Inherited info display with link to source block
 */

import { DocumentModel, documentModelContext, type ResolvedEntityInfo } from '@/common/core/model';
import type { BlockData, BlockEntityConfig, DocumentSlot, EntityConfigMode } from '@/common/core/model/types';
import type { HomeAssistant } from 'custom-card-helpers';
import { consume } from "@lit/context";
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@/panel/common/ui/slot-selector';

@customElement('entity-config-editor')
export class EntityConfigEditor extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .entity-config-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .config-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .section-label {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary, #666);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        /* Mode Selector */

        .mode-selector {
            display: flex;
            background: var(--bg-tertiary, #f5f5f5);
            border-radius: 6px;
            padding: 2px;
            height: 32px;
        }

        .mode-option {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-secondary, #666);
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
            user-select: none;
        }

        .mode-option ha-icon {
            --mdc-icon-size: 14px;
        }

        .mode-option:hover {
            color: var(--text-primary, #333);
        }

        .mode-option.active {
            background: var(--accent-color, #2196f3);
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .entity-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            box-sizing: border-box;
        }

        .entity-input:focus {
            outline: none;
            border-color: var(--accent-color, #2196f3);
        }

        /* Inherited Info */

        .inherited-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 10px 12px;
            background: var(--bg-secondary, #f9f9f9);
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 6px;
        }

        .inherited-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-secondary, #666);
            --mdc-icon-size: 16px;
        }

        .inherited-icon {
            font-size: 14px;
        }

        .inherited-entity {
            font-family: monospace;
            font-size: 12px;
            color: var(--text-primary, #333);
            font-weight: 500;
            text-overflow: ellipsis;
            display: inline-block;
            overflow: hidden;
        }

        .inherited-source {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        .source-link {
            color: var(--accent-color, #2196f3);
            cursor: pointer;
            text-decoration: underline;
            font-weight: 500;
        }

        .source-link:hover {
            color: var(--accent-dark, #1976d2);
        }

        .no-entity-warning {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid rgba(255, 152, 0, 0.3);
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            color: var(--warning-color, #ff9800);
        }

        .warning-icon {
            font-size: 16px;
        }

        /* Slot Configuration */

        .slot-config {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px solid var(--border-color, #e0e0e0);
        }

        .slot-info {
            padding: 8px 10px;
            background: var(--bg-secondary, #f9f9f9);
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            font-size: 11px;
        }

        .slot-info-entity {
            font-size: 12px;
            margin-bottom: 4px;
        }

        .slot-info-entity-label {
            color: var(--text-secondary, #666);
        }

        .slot-info-entity-id {
            font-weight: bold;
            font-family: monospace;
            color: var(--text-primary, #333);
        }

        .slot-info-description {
            color: var(--text-secondary, #666);
            font-style: italic;
        }
    `;

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @property({attribute: false})
    block!: BlockData;

    /** Current entity configuration */
    @property({attribute: false})
    config?: BlockEntityConfig;

    /** Resolved entity info (includes inheritance details) */
    @property({attribute: false})
    resolvedInfo?: ResolvedEntityInfo;

    /** Home Assistant instance for entity picker */
    @property({attribute: false})
    hass?: HomeAssistant;

    @state() private slots: DocumentSlot[] = [];
    @state() private slotError: string | null = null;

    connectedCallback(): void {
        super.connectedCallback();
        this._refreshSlots();
        this.documentModel.addEventListener('slots-changed', this._handleSlotsChanged);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.documentModel.removeEventListener('slots-changed', this._handleSlotsChanged);
    }

    render() {
        const currentMode = this.config?.mode || 'inherited';

        return html`
            <div class="entity-config-container">
                <!-- Mode Selector -->
                <div class="config-section">
                    <span class="section-label">Entity Mode</span>
                    <div class="mode-selector">
                        <div
                            class="mode-option ${currentMode === 'inherited' ? 'active' : ''}"
                            @click=${() => this._setMode('inherited')}
                        >
                            <ha-icon icon="mdi:arrow-down-right-bold"></ha-icon>
                            Inherited
                        </div>
                        <div
                            class="mode-option ${currentMode === 'slot' ? 'active' : ''}"
                            @click=${() => this._setMode('slot')}
                        >
                            <ha-icon icon="mdi:select-drag"></ha-icon>
                            Slot
                        </div>
                        <div
                            class="mode-option ${currentMode === 'fixed' ? 'active' : ''}"
                            @click=${() => this._setMode('fixed')}
                        >
                            <ha-icon icon="mdi:pin"></ha-icon>
                            Fixed
                        </div>
                    </div>
                </div>

                <!-- Entity Selection / Info based on mode -->
                <div class="config-section">
                    ${currentMode === 'fixed'
                            ? this._renderFixedEntityPicker()
                            : currentMode === 'slot'
                                    ? this._renderSlotConfig()
                                    : this._renderInheritedInfo()}
                </div>
            </div>
        `;
    }

    private _handleSlotsChanged = (): void => {
        this._refreshSlots();
    };

    private _refreshSlots(): void {
        this.slots = this.documentModel.getSlotEntities();
    }

    private _renderFixedEntityPicker() {
        const entityId = this.config?.entityId || '';

        return html`
            <span class="section-label">Entity</span>
            <ha-selector
                    .hass=${this.hass}
                    .selector=${{entity: {multiple: false}}}
                    .value=${entityId}
                    @value-changed=${this._onEntityChanged}
                    allow-custom-entity
                    label="Select entity"
            ></ha-selector>
        `;
    }

    private _renderInheritedInfo() {
        const resolved = this.resolvedInfo;

        if ((!resolved || resolved.source === 'none')) {
            if (this.documentModel.isEntityRequired(this.block.id)) {
                return html`
                    <div class="no-entity-warning">
                        <ha-icon icon="mdi:alert"></ha-icon>
                        <span>No parent entity found. Set an entity on a parent block or switch to static mode.</span>
                    </div>
                `;
            }

            return html`
                <div class="inherited-info">
                    <div class="inherited-header">
                        <ha-icon icon="mdi:arrow-down-right-bold"></ha-icon>
                        <span>Inherited Entity</span>
                    </div>
                    <div class="inherited-entity">
                        No Entity Inherited from Parents
                    </div>
                </div>
            `;
        }

        return html`
            <div class="inherited-info">
                <div class="inherited-header">
                    <ha-icon icon="mdi:arrow-down-right-bold"></ha-icon>
                    <span>Inherited Entity</span>
                </div>
                <div class="inherited-entity" title="${resolved.entityId}">
                    ${resolved.entityId}
                </div>
                ${resolved.inheritedFromId ? html`
                    <div class="inherited-source">
                        <span>From:</span>
                        <span
                                class="source-link"
                                @click=${() => this._selectSourceBlock(resolved.inheritedFromId!)}
                        >
                            ${resolved.inheritedFromDisplayName || resolved.inheritedFromType}
                        </span>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _renderSlotConfig() {
        const slotId = this.config?.slotId || '';
        const slot = slotId ? this.slots.find((entry) => entry.id === slotId) : undefined;
        const slotMissing = slotId && !slot;

        return html`
            <div class="slot-config">
                ${!slotId ? html`
                    <div class="no-entity-warning">
                        <ha-icon icon="mdi:alert"></ha-icon>
                        <span>No Slot ID. Please, select a Slot for the entity.</span>
                    </div>
                ` : nothing}
                ${slotMissing ? html`
                    <div class="no-entity-warning">
                        <ha-icon icon="mdi:alert"></ha-icon>
                        <span>Slot not found. Select a valid slot or create a new one.</span>
                    </div>
                ` : nothing}
                <span class="section-label">Slot</span>
                <slot-selector
                    .slots=${this.slots}
                    .selectedSlotId=${slotId || undefined}
                    .showManagement=${true}
                    @slot-selected=${this._onSlotSelected}
                    @manage-entities-slots=${this._onManageSlots}
                ></slot-selector>
                ${slot ? html`
                    <div class="slot-info">
                        <div class="slot-info-entity">
                            <span class="slot-info-entity-label">Slot entity:</span>
                            <span class="slot-info-entity-id">${slot.entityId || 'not set'}</span>
                        </div>
                        ${slot.domains && slot.domains.length > 0 ? html`
                            <div class="slot-info-entity">
                                <span class="slot-info-entity-label">Allowed domains:</span>
                                <span class="slot-info-entity-id">${slot.domains.join(', ')}</span>
                            </div>
                        ` : nothing}
                        ${slot.description ? html`
                            <div class="slot-info-description">${slot.description}</div>
                        ` : nothing}
                    </div>
                ` : nothing}
                ${this.slotError ? html`<span class="slot-id-hint">${this.slotError}</span>` : nothing}
            </div>
        `;
    }

    // =========================================================================
    // Event Handlers
    // =========================================================================

    private _setMode(mode: EntityConfigMode): void {
        const newConfig: BlockEntityConfig = {
            mode,
        };

        // Preserve relevant data based on mode
        if (mode === 'fixed') {
            newConfig.entityId = this.config?.entityId;
        } else if (mode === 'slot') {
            newConfig.slotId = this.config?.slotId;
        }
        // 'inherited' mode doesn't need entityId or slotId

        this._emitConfigChanged(newConfig);
    }

    private _onEntityChanged(e: CustomEvent): void {
        const entityId = e.detail.value || '';
        const newConfig: BlockEntityConfig = {
            mode: 'fixed',
            entityId: entityId || undefined,
        };
        this._emitConfigChanged(newConfig);
    }

    private _onSlotSelected(e: CustomEvent): void {
        const slotId = e.detail.slotId;
        this.slotError = null;

        const newConfig: BlockEntityConfig = {
            mode: 'slot',
            slotId: slotId || undefined,
        };

        this._emitConfigChanged(newConfig);
    }

    private _onManageSlots(): void {
        this.dispatchEvent(new CustomEvent('manage-entities-slots', {
            bubbles: true,
            composed: true,
        }));
    }

    private _selectSourceBlock(blockId: string): void {
        this.dispatchEvent(new CustomEvent('select-source-block', {
            detail: {blockId},
            bubbles: true,
            composed: true,
        }));
    }

    private _emitConfigChanged(config: BlockEntityConfig): void {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: config,
            bubbles: true,
            composed: true,
        }));
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'entity-config-editor': EntityConfigEditor;
    }
}
