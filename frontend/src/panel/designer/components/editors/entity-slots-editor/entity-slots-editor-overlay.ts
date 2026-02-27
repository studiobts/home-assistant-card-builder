/**
 * Slot Manager Overlay
 *
 * Wide modal for managing document-level entity slots.
 */

import type { SlotReference } from '@/common/core/model/document-model';
import type { DocumentSlot } from '@/common/core/model/types';
import { HOME_ASSISTANT_ENTITY_DOMAINS } from '@/common/types';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SlotsEditorOverlayBase, type SlotSaveResult } from '@/panel/designer/components/editors/slots-editor-overlay-base';

@customElement('entity-slots-editor-overlay')
export class EntitySlotsEditorOverlay extends SlotsEditorOverlayBase<DocumentSlot> {

    @state() private formSlotEntityId = '';
    @state() private formSlotDomains: string[] = [];

    protected get slotsChangedEventName(): string {
        return 'slots-changed';
    }

    protected get dialogTitle(): string {
        return 'Entity slots';
    }

    protected get emptyListMessage(): string {
        return 'No slots defined yet';
    }

    protected getSlots(): DocumentSlot[] {
        return this.documentModel.getSlotEntities();
    }

    protected getSlotId(slot: DocumentSlot): string {
        return slot.id;
    }

    protected getSlotName(slot: DocumentSlot): string {
        return slot.name || slot.id;
    }

    protected getSlotDescription(slot: DocumentSlot): string | undefined {
        return slot.description;
    }

    protected renderSlotMeta(slot: DocumentSlot) {
        const domains = slot.domains && slot.domains.length > 0
            ? slot.domains.join(', ')
            : 'Any';
        const entity = slot.entityId ? slot.entityId : 'None';
        return html`Domains: ${domains} • Default: ${entity}`;
    }

    protected renderFormFields() {
        return html`
          <div class="form-group">
            <span class="form-label">Domains filter</span>
            <ha-selector
              .hass=${this.hass}
              .placeholder="Domains Filter (optional)"
              .selector=${{
                  select: {
                      multiple: true,
                      options: this._getAvailableDomains(),
                  },
              }}
              .value=${this.formSlotDomains}
              @value-changed=${(e: CustomEvent) => {this.formSlotDomains = e.detail.value || []}}
            ></ha-selector>
          </div>
          <div class="form-group">
            <span class="form-label">Default entity</span>
            <ha-selector
              .hass=${this.hass}
              .label="Default Entity (optional)"
              .selector=${{
                  entity: {
                      multiple: false,
                      domain: this.formSlotDomains.length > 0 ? this.formSlotDomains : undefined,
                  },
              }}
              .value=${this.formSlotEntityId}
              @value-changed=${(e: CustomEvent) => {this.formSlotEntityId = e.detail.value || ''}}
              allow-custom-entity
            ></ha-selector>
          </div>
        `;
    }

    protected createSlot(payload: Record<string, unknown>): SlotSaveResult<DocumentSlot> {
        return this.documentModel.createSlotEntity(payload as DocumentSlot);
    }

    protected updateSlot(slotId: string, payload: Record<string, unknown>): SlotSaveResult<DocumentSlot> {
        return this.documentModel.updateSlotEntity(slotId, payload as Partial<DocumentSlot>);
    }

    protected deleteSlot(slotId: string): void {
        this.documentModel.deleteSlotEntity(slotId);
    }

    protected getReferences(slotId: string): SlotReference[] {
        return this.documentModel.findSlotEntityReferences(slotId);
    }

    protected formatReference(reference: SlotReference): string {
        const targetSuffix = reference.styleTargetId ? ` (target ${reference.styleTargetId})` : '';
        switch (reference.kind) {
            case 'block-entity':
                return 'Entity configuration';
            case 'style-binding':
                return `Styles: ${reference.category}.${reference.property}${targetSuffix}`;
            case 'style-animation':
                return `Animation binding: ${reference.category}.${reference.property}${targetSuffix}`;
            case 'trait-binding':
                return `Property binding: ${reference.propName}`;
            case 'trait-slot':
                return `Property slot: ${reference.propName}`;
            default:
                return 'Reference';
        }
    }

    protected loadSpecificFields(slot: DocumentSlot): void {
        this.formSlotEntityId = slot.entityId || '';
        this.formSlotDomains = slot.domains ? [...slot.domains] : [];
    }

    protected resetSpecificFields(): void {
        this.formSlotEntityId = '';
        this.formSlotDomains = [];
    }

    protected buildSpecificPayload(): Record<string, unknown> {
        return {
            entityId: this.formSlotEntityId,
            domains: this.formSlotDomains,
        };
    }

    private _getAvailableDomains(): Array<{value: string; label: string}> {
        return Array.from(HOME_ASSISTANT_ENTITY_DOMAINS)
            .sort()
            .map(({id, label}) => ({
                label: label,
                value: id,
            }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'entity-slots-editor-overlay': EntitySlotsEditorOverlay;
    }
}
