/**
 * Action Slot Manager Overlay
 *
 * Wide modal for managing document-level action slots.
 */

import { type ActionConfig, type ActionSlot, type ActionTrigger } from '@/common/core/model';
import type { SlotReference } from '@/common/core/model/document-model';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SlotsEditorOverlayBase, type SlotSaveResult } from '@/panel/designer/components/editors/slots-editor-overlay-base';

const TRIGGER_OPTIONS: Array<{label: string; value: ActionTrigger}> = [
    {label: 'Tap', value: 'tap'},
    {label: 'Double Tap', value: 'double_tap'},
    {label: 'Hold', value: 'hold'},
];

const TRIGGER_LABELS: Record<ActionTrigger, string> = {
    tap: 'Tap',
    double_tap: 'Double Tap',
    hold: 'Hold',
};

@customElement('action-slots-editor-overlay')
export class ActionSlotsEditorOverlay extends SlotsEditorOverlayBase<ActionSlot> {

    @state() private formSlotTrigger: ActionTrigger = 'tap';
    @state() private formSlotAction: ActionConfig | null = {action: 'none'};

    protected get slotsChangedEventName(): string {
        return 'slot-actions-changed';
    }

    protected get dialogTitle(): string {
        return 'Action slots';
    }

    protected get emptyListMessage(): string {
        return 'No action slots defined yet';
    }

    protected getSlots(): ActionSlot[] {
        return this.documentModel.getSlotActions();
    }

    protected getSlotId(slot: ActionSlot): string {
        return slot.id;
    }

    protected getSlotName(slot: ActionSlot): string {
        return slot.name || slot.id;
    }

    protected getSlotDescription(slot: ActionSlot): string | undefined {
        return slot.description;
    }

    protected renderSlotMeta(slot: ActionSlot) {
        return html`${this._formatActionSlotSummary(slot)}`;
    }

    protected renderFormFields() {
        return html`
          <div class="form-group">
            <span class="form-label">Trigger</span>
            <select
              .value=${this.formSlotTrigger}
              @change=${(e: Event) => {this.formSlotTrigger = (e.target as HTMLSelectElement).value as ActionTrigger}}
            >
              ${TRIGGER_OPTIONS.map((option) => html`
                  <option value=${option.value}>${option.label}</option>
              `)}
            </select>
          </div>
          <div class="form-group">
            <span class="form-label">Action</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ui_action: {default_action: 'none'}}}
              .value=${this.formSlotAction ?? {action: 'none'}}
              @value-changed=${(e: CustomEvent) => {this.formSlotAction = e.detail.value}}
            ></ha-selector>
          </div>
        `;
    }

    protected createSlot(payload: Record<string, unknown>): SlotSaveResult<ActionSlot> {
        return this.documentModel.createSlotAction(payload as ActionSlot);
    }

    protected updateSlot(slotId: string, payload: Record<string, unknown>): SlotSaveResult<ActionSlot> {
        return this.documentModel.updateSlotAction(slotId, payload as Partial<ActionSlot>);
    }

    protected deleteSlot(slotId: string): void {
        this.documentModel.deleteSlotAction(slotId);
    }

    protected getReferences(slotId: string): SlotReference[] {
        return this.documentModel.findSlotActionReferences(slotId);
    }

    protected formatReference(reference: SlotReference): string {
        return `Action slot (${reference.actionTrigger || 'trigger'}) on target ${reference.propName || 'block'}`;
    }

    protected loadSpecificFields(slot: ActionSlot): void {
        this.formSlotTrigger = slot.trigger;
        this.formSlotAction = slot.action;
    }

    protected resetSpecificFields(): void {
        this.formSlotTrigger = 'tap';
        this.formSlotAction = {action: 'none'};
    }

    protected buildSpecificPayload(): Record<string, unknown> {
        return {
            trigger: this.formSlotTrigger,
            action: this.formSlotAction ?? {action: 'none'},
        };
    }

    protected handleSaveSuccess(mode: 'create' | 'edit'): void {
        if (mode === 'edit') {
            this.showToast('Slot updated');
            return;
        }
        this.showToast('Slot created');
    }

    private _formatActionSlotSummary(slot: ActionSlot): string {
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
        'action-slots-editor-overlay': ActionSlotsEditorOverlay;
    }
}
