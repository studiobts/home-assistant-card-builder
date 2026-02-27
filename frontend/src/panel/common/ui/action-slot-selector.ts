/**
 * ActionSlotSelector - Dropdown to select and manage action slots
 */

import type { ActionConfig, ActionSlot, ActionTrigger } from '@/common/core/model/types';
import { DropdownSelectorBase } from '@/panel/common/ui/dropdown-selector-base';
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const TRIGGER_LABELS: Record<ActionTrigger, string> = {
    tap: 'Tap',
    double_tap: 'Double Tap',
    hold: 'Hold',
};

export interface ActionSlotSelectedDetail {
    slotId: string | null;
}

@customElement('action-slot-selector')
export class ActionSlotSelector extends DropdownSelectorBase {
    @property({ attribute: false }) slots: ActionSlot[] = [];
    @property({ type: String }) selectedSlotId?: string;
    @property({ type: Boolean }) showManagement = true;

    protected get showSearch(): boolean {
        return this.slots.length > 5;
    }

    protected get searchPlaceholder(): string {
        return 'Search action slots...';
    }

    protected renderTriggerIcon() {
        return html`<ha-icon icon="mdi:flash"></ha-icon>`;
    }

    protected renderTriggerLabel() {
        const selectedSlot = this._getSelectedSlot();

        return html`
            ${selectedSlot
                ? html`${selectedSlot.name || selectedSlot.id} (${TRIGGER_LABELS[selectedSlot.trigger]})`
                : html`<span class="placeholder">Select action slot</span>`
            }
        `;
    }

    protected renderDropdownContent() {
        const filteredSlots = this._getFilteredSlots();

        return html`
            <div class="option-list">
                <div
                    class="option-item ${!this.selectedSlotId ? 'selected' : ''}"
                    @click=${() => this._selectSlot(null)}
                >
                    <span class="icon">
                        <ha-icon icon="mdi:close-circle-outline"></ha-icon>
                    </span>
                    <div class="info">
                        <div class="name">No slot</div>
                        <div class="description">Clear slot selection</div>
                    </div>
                    ${!this.selectedSlotId ? html`<span class="check">✓</span>` : nothing}
                </div>

                ${filteredSlots.length > 0 ? html`
                    <div class="divider"></div>
                    ${filteredSlots.map((slot) => html`
                        <div
                            class="option-item ${slot.id === this.selectedSlotId ? 'selected' : ''}"
                            @click=${() => this._selectSlot(slot.id)}
                        >
                            <span class="icon">
                                <ha-icon icon="mdi:flash"></ha-icon>
                            </span>
                            <div class="info">
                                <div class="name">${slot.name || slot.id}</div>
                                ${slot.description ? html`
                                    <div class="description">${slot.description}</div>
                                ` : nothing}
                                <div class="meta">${this._formatAction(slot)}</div>
                            </div>
                            ${slot.id === this.selectedSlotId ? html`<span class="check">✓</span>` : nothing}
                        </div>
                    `)}
                ` : this._searchFilter ? html`
                    <div class="empty-message">No slots match "${this._searchFilter}"</div>
                ` : html`
                    <div class="empty-message">No action slots available</div>
                `}
            </div>

            ${this.showManagement ? html`
                <div class="divider"></div>
                <div class="action-item" @click=${this._handleManageSlots}>
                    <span class="icon">
                        <ha-icon icon="mdi:cog"></ha-icon>
                    </span>
                    <span>Manage action slots...</span>
                </div>
            ` : nothing}
        `;
    }

    private _selectSlot(slotId: string | null): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent<ActionSlotSelectedDetail>('action-slot-selected', {
                detail: { slotId },
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleManageSlots(): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent('manage-action-slots', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private _getSelectedSlot(): ActionSlot | undefined {
        if (!this.selectedSlotId) return undefined;
        return this.slots.find((s) => s.id === this.selectedSlotId);
    }

    private _getFilteredSlots(): ActionSlot[] {
        if (!this._searchFilter) return this.slots;

        return this.slots.filter(
            (s) =>
                s.id.toLowerCase().includes(this._searchFilter) ||
                s.name?.toLowerCase().includes(this._searchFilter) ||
                s.description?.toLowerCase().includes(this._searchFilter)
        );
    }

    private _formatAction(slot: ActionSlot): string {
        const triggerLabel = TRIGGER_LABELS[slot.trigger] ?? slot.trigger;
        const actionLabel = this._formatActionSummary(slot.action);
        return `${triggerLabel} • ${actionLabel}`;
    }

    private _formatActionSummary(action: ActionConfig): string {
        const label = this._getActionLabel(action.action);
        if (action.action === 'call-service' || action.action === 'perform-action') {
            const serviceValue = this._getServiceValue(action);
            return serviceValue ? `${label}: ${serviceValue}` : label;
        }
        if (action.action === 'navigate' && 'navigation_path' in action) {
            return `${label}: ${(action as { navigation_path?: string }).navigation_path || ''}`;
        }
        if (action.action === 'url' && 'url_path' in action) {
            return `${label}: ${(action as { url_path?: string }).url_path || ''}`;
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
        'action-slot-selector': ActionSlotSelector;
    }
}
