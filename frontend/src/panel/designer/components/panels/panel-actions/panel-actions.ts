import type { BlockRegistry } from '@/common/blocks/core/registry/block-registry';
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import type {
    ActionConfig,
    ActionSlot,
    ActionTrigger,
    BlockActionsConfig,
    BlockData,
    BlockEntityConfig,
    BlockSelectionChangedDetail,
    BlockUpdatedDetail,
    DocumentModel,
} from '@/common/core/model';
import { documentModelContext } from '@/common/core/model';
import type { HomeAssistant } from 'custom-card-helpers';
import { consume } from '@lit/context';
import { css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { PanelBase } from '@/panel/designer/components/panels/panel-base';

import '@/panel/designer/components/editors/entity-config-editor/entity-config-editor';
import '@/panel/common/ui/block-target-selector';
import '@/panel/common/ui/action-slot-selector';

const TRIGGER_LABELS: Record<ActionTrigger, string> = {
    tap: 'Tap',
    double_tap: 'Double Tap',
    hold: 'Hold',
};

export class PanelActions extends PanelBase {
    static styles = [
        ...PanelBase.styles,
        css`
            .panel-content {
                padding: 0;
            }

            .section-title {
                display: block;
                margin-bottom: 12px;
                font-size: 11px;
                font-weight: 600;
                color: var(--text-primary, #333);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            .panel-section {
                padding: 12px;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
                background: var(--bg-primary, #fff);
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .panel-section:last-child {
                border-bottom: none;
            }

            .info-text {
                font-size: 11px;
                color: var(--text-secondary, #666);
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

            .add-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .action-summary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 8px 10px;
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 6px;
                background: var(--bg-secondary, #f9f9f9);
            }

            .action-summary-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 0;
            }

            .action-summary-title {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .action-summary-detail {
                font-size: 11px;
                color: var(--text-secondary, #666);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .action-summary-controls {
                display: flex;
                gap: 6px;
            }

            .icon-btn {
                padding: 4px 6px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                background: var(--bg-primary, #fff);
                color: var(--text-secondary, #666);
                cursor: pointer;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .icon-btn:hover {
                background: var(--bg-secondary, #f5f5f5);
            }

            .icon-btn.danger:hover {
                background: #fee;
                border-color: #f88;
                color: #c00;
            }

            .empty-message {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .no-targets {
                font-size: 13px;
                color: var(--text-secondary, #666);
            }

            .add-action-picker {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
        `,
    ];

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;

    @property({attribute: false})
    hass?: HomeAssistant;

    @state() protected selectedBlock: BlockData | null = null;
    @state() protected activeTargetId = 'block';
    @state() protected actionSlots: ActionSlot[] = [];
    @state() protected isAddOpen = false;

    connectedCallback(): void {
        super.connectedCallback();

        this._refreshActionSlots();

        this.documentModel.addEventListener('selection-changed', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
            this.selectedBlock = detail.selectedBlock || null;
            this.activeTargetId = 'block';
            this.isAddOpen = false;
        });

        this.documentModel.addEventListener('block-updated', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockUpdatedDetail;
            if (this.selectedBlock && detail.block.id === this.selectedBlock.id) {
                this.selectedBlock = {...detail.block};
                this._ensureActiveTargetAvailable();
            }
        });

        this.documentModel.addEventListener('slot-actions-changed', () => {
            this._refreshActionSlots();
        });
    }

    render() {
        if (!this.selectedBlock) {
            return html`
                <div class="empty-state">
                    <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
                    <div>Select an element to edit its actions</div>
                </div>
            `;
        }

        return html`
            <div class="panel-content">
                ${this._renderTargetSection()}
                ${this._renderActionsSection()}
            </div>
        `;
    }

    protected _renderTargetSection() {
        if (!this.selectedBlock) return nothing;

        const targets = this._getActionTargets();
        const options = Object.entries(targets)
            .filter(([targetId]) => targetId !== 'block')
            .map(([targetId, target]) => ({
                label: target.label,
                value: targetId,
                description: target.description,
            }));

        if (options.length === 0) {
            return nothing;
        }

        return html`
            <div class="panel-section">
                <span class="section-title">Action Target</span>
                <block-target-selector
                    .value=${this.activeTargetId}
                    .options=${options}
                    @change=${this._onTargetChanged}
                ></block-target-selector>
            </div>
        `;
    }

    protected _renderActionsSection() {
        if (!this.selectedBlock) return nothing;

        const targets = this._getActionTargets();
        const hasTargets = Object.keys(targets).length > 0;
        if (!hasTargets) {
            return html`
                <div class="panel-section">
                    <span class="section-title">Actions</span>
                    <div class="no-targets">
                        This block does not expose any action targets.
                    </div>
                </div>
            `;
        }

        const assignedSlots = this._getAssignedActionSlots();
        const canAdd = this.actionSlots.length > 0;

        return html`
            <div class="panel-section">
                <span class="section-title">Actions</span>

                ${assignedSlots.length === 0 ? html`
                    <div class="empty-message">No actions configured for this target.</div>
                ` : html`
                    ${assignedSlots.map((entry, index) => this._renderActionSummary(entry.slotId, entry.slot, index))}
                `}

                <button class="add-btn" @click=${this._toggleAddAction} ?disabled=${!canAdd}>
                    + Add Action
                </button>

                ${!canAdd ? html`
                    <div class="info-text">No action slots defined. Use the header “Action Slots” to create one.</div>
                ` : nothing}

                ${this.isAddOpen && canAdd ? html`
                    <div class="add-action-picker">
                        <action-slot-selector
                            .slots=${this.actionSlots}
                            @action-slot-selected=${this._onActionSlotSelected}
                        ></action-slot-selector>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    protected _renderActionSummary(slotId: string, slot: ActionSlot | null, index: number) {
        const title = slot ? (slot.name || slot.id) : `Missing slot: ${slotId}`;
        const detail = slot ? this._formatActionSlotSummary(slot) : 'Slot not found';

        return html`
            <div class="action-summary">
                <div class="action-summary-info">
                    <div class="action-summary-title">${title}</div>
                    <div class="action-summary-detail">${detail}</div>
                </div>
                <div class="action-summary-controls">
                    <button class="icon-btn danger" @click=${() => this._removeActionSlot(slotId, index)}>
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>
            </div>
        `;
    }

    protected _getActionTargets() {
        if (!this.selectedBlock) return {block: {label: 'Block'}};
        return this.blockRegistry.getBlockActionTargetsForBlock(this.selectedBlock);
    }

    protected _getAssignedActionSlots(): Array<{slotId: string; slot: ActionSlot | null}> {
        if (!this.selectedBlock) return [];
        const slotIds = this.selectedBlock.actions?.targets?.[this.activeTargetId] ?? [];
        return slotIds.map((slotId) => ({
            slotId,
            slot: this.actionSlots.find((slot) => slot.id === slotId) || null,
        }));
    }

    protected _ensureActiveTargetAvailable(): void {
        if (!this.selectedBlock) return;
        const targets = this._getActionTargets();
        if (Object.keys(targets).length === 0) {
            this.activeTargetId = '';
            return;
        }
        if (targets[this.activeTargetId]) return;

        const nextTarget = Object.keys(targets)[0];
        this.activeTargetId = nextTarget ?? '';
    }

    protected _toggleAddAction = (): void => {
        this.isAddOpen = !this.isAddOpen;
    };

    protected _onActionSlotSelected = (e: CustomEvent): void => {
        const slotId = e.detail.slotId as string | null;
        if (!slotId || !this.selectedBlock) {
            this.isAddOpen = false;
            return;
        }
        if (!this.activeTargetId) {
            this.isAddOpen = false;
            return;
        }

        const actions: BlockActionsConfig = {
            targets: {...(this.selectedBlock.actions?.targets || {})},
        };

        const targetSlots = [...(actions.targets[this.activeTargetId] || [])];
        if (!targetSlots.includes(slotId)) {
            targetSlots.push(slotId);
        }
        actions.targets[this.activeTargetId] = targetSlots;

        this.documentModel.updateBlock(this.selectedBlock.id, {actions});
        this.isAddOpen = false;
    };

    protected _removeActionSlot(slotId: string, index: number): void {
        if (!this.selectedBlock) return;

        const actions: BlockActionsConfig = {
            targets: {...(this.selectedBlock.actions?.targets || {})},
        };

        const targetSlots = [...(actions.targets[this.activeTargetId] || [])];
        if (targetSlots.length === 0) return;

        if (targetSlots[index] === slotId) {
            targetSlots.splice(index, 1);
        } else {
            const idx = targetSlots.indexOf(slotId);
            if (idx >= 0) {
                targetSlots.splice(idx, 1);
            }
        }

        if (targetSlots.length === 0) {
            delete actions.targets[this.activeTargetId];
        } else {
            actions.targets[this.activeTargetId] = targetSlots;
        }

        const hasTargets = Object.keys(actions.targets).length > 0;
        this.documentModel.updateBlock(this.selectedBlock.id, {actions: hasTargets ? actions : undefined});
    }

    protected _onTargetChanged(e: CustomEvent): void {
        const value = e.detail.value as string;
        this.activeTargetId = value || 'block';
        this.isAddOpen = false;
    }

    protected _formatActionSlotSummary(slot: ActionSlot): string {
        const triggerLabel = TRIGGER_LABELS[slot.trigger] ?? slot.trigger;
        const actionLabel = this._formatActionSummary(slot.action);
        return `${triggerLabel} • ${actionLabel}`;
    }

    protected _formatActionSummary(config: ActionConfig): string {
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

    protected _getActionLabel(actionType: string): string {
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

    protected _getServiceValue(action: ActionConfig): string | undefined {
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

    protected _refreshActionSlots(): void {
        this.actionSlots = this.documentModel.getSlotActions();
    }

    protected _onEntityConfigChanged(e: CustomEvent<BlockEntityConfig>): void {
        if (!this.selectedBlock) return;

        this.documentModel.updateBlock(this.selectedBlock.id, {
            entityConfig: e.detail,
        });
    }

    protected _onSelectSourceBlock(e: CustomEvent<{ blockId: string }>): void {
        const {blockId} = e.detail;
        this.documentModel.select(blockId);
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('panel-actions', PanelActions);

declare global {
    interface HTMLElementTagNameMap {
        'panel-actions': PanelActions;
    }
}
