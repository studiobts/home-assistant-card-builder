/**
 * SlotSelector - Dropdown to select and manage document slots
 *
 * Provides UI for selecting slots and accessing slot management.
 */

import type { DocumentSlot } from '@/common/core/model/types';
import { DropdownSelectorBase } from '@/panel/common/ui/dropdown-selector-base';
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Event detail for slot selection
 */
export interface SlotSelectedDetail {
    slotId: string | null;
}

/**
 * Slot selector component
 */
@customElement('slot-selector')
export class SlotSelector extends DropdownSelectorBase {
    /** Available slots */
    @property({ attribute: false }) slots: DocumentSlot[] = [];

    /** Currently selected slot ID */
    @property({ type: String }) selectedSlotId?: string;

    /** Whether to show management options */
    @property({ type: Boolean }) showManagement = true;

    protected get showSearch(): boolean {
        return this.slots.length > 5;
    }

    protected get searchPlaceholder(): string {
        return 'Search slots...';
    }

    protected renderTriggerIcon() {
        return html`<ha-icon icon="mdi:select-drag"></ha-icon>`;
    }

    protected renderTriggerLabel() {
        const selectedSlot = this._getSelectedSlot();

        return html`
            ${selectedSlot
                ? html`${selectedSlot.name || selectedSlot.id}`
                : html`<span class="placeholder">Select slot</span>`
            }
        `;
    }

    protected renderDropdownContent() {
        const filteredSlots = this._getFilteredSlots();

        return html`
            <div class="option-list">
                <!-- None option -->
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
                                <ha-icon icon="mdi:select-drag"></ha-icon>
                            </span>
                            <div class="info">
                                <div class="name">${slot.name || slot.id}</div>
                                ${slot.description ? html`
                                    <div class="description">${slot.description}</div>
                                ` : nothing}
                                ${slot.entityId ? html`
                                    <div class="meta">Entity: ${slot.entityId}</div>
                                ` : html`
                                    <div class="meta">No entity set</div>
                                `}
                            </div>
                            ${slot.id === this.selectedSlotId ? html`<span class="check">✓</span>` : nothing}
                        </div>
                    `)}
                ` : this._searchFilter ? html`
                    <div class="empty-message">No slots match "${this._searchFilter}"</div>
                ` : html`
                    <div class="empty-message">No slots available</div>
                `}
            </div>

            ${this.showManagement ? html`
                <div class="divider"></div>
                <div class="action-item" @click=${this._handleManageSlots}>
                    <span class="icon">
                        <ha-icon icon="mdi:cog"></ha-icon>
                    </span>
                    <span>Manage slots...</span>
                </div>
            ` : nothing}
        `;
    }

    private _selectSlot(slotId: string | null): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent<SlotSelectedDetail>('slot-selected', {
                detail: { slotId },
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleManageSlots(): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent('manage-entities-slots', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private _getSelectedSlot(): DocumentSlot | undefined {
        if (!this.selectedSlotId) return undefined;
        return this.slots.find((s) => s.id === this.selectedSlotId);
    }

    private _getFilteredSlots(): DocumentSlot[] {
        if (!this._searchFilter) return this.slots;

        return this.slots.filter(
            (s) =>
                s.id.toLowerCase().includes(this._searchFilter) ||
                s.name?.toLowerCase().includes(this._searchFilter) ||
                s.description?.toLowerCase().includes(this._searchFilter) ||
                s.entityId?.toLowerCase().includes(this._searchFilter)
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'slot-selector': SlotSelector;
    }
}
