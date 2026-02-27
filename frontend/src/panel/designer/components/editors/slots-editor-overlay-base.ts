import { type DocumentModel, documentModelContext } from '@/common/core/model';
import type { SlotReference } from '@/common/core/model/document-model';
import type { HomeAssistant } from 'custom-card-helpers';
import { consume } from '@lit/context';
import { css, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import { OverlayDialogBase } from '@/panel/common/ui/overlay-dialog-base';

interface SlotReferenceState {
    references: SlotReference[];
}

export type SlotSaveResult<TSlot> = {
    success: boolean;
    error?: string;
    slot?: TSlot;
};

export abstract class SlotsEditorOverlayBase<TSlot> extends OverlayDialogBase {
    static styles = [
        ...OverlayDialogBase.styles,
        css`
            .dialog-body {
                flex: 1;
                padding: 16px 20px 24px;
                display: grid;
                grid-template-columns: minmax(220px, 1fr) minmax(0, 2fr);
                gap: 16px;
                overflow: hidden;
            }

            .slot-list-panel,
            .slot-form-panel {
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-height: 0;
                overflow: hidden;
            }

            .slot-list-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                color: var(--text-secondary, #666);
            }

            .slot-list {
                flex: 1;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding-right: 4px;
            }

            .slot-item {
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                background: var(--bg-primary, #fff);
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .slot-item.active {
                border-color: var(--accent-color, #2196f3);
                box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.2);
            }

            .slot-item-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }

            .slot-item-name {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .slot-item-id {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .slot-item-badge {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                padding: 2px 6px;
                border-radius: 10px;
                background: rgba(33, 150, 243, 0.1);
                color: var(--accent-color, #2196f3);
            }

            .slot-item-description {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .slot-item-meta {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .slot-item-actions {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }

            .slot-form-panel {
                overflow: auto;
                padding-left: 4px;
            }

            .form-card {
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                background: var(--bg-secondary, #f9f9f9);
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .form-title {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                color: var(--text-primary, #333);
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-label {
                font-size: 11px;
                font-weight: 600;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 6px 8px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
            }

            .form-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .error-text {
                font-size: 11px;
                color: var(--error-color, #d32f2f);
            }

            .empty-form {
                border: 1px dashed var(--border-color, #d4d4d4);
                border-radius: 8px;
                padding: 16px;
                font-size: 12px;
                color: var(--text-secondary, #666);
                text-align: center;
            }

            .references {
                margin-top: 8px;
                padding: 10px;
                border-radius: 6px;
                background: rgba(255, 152, 0, 0.1);
                border: 1px solid rgba(255, 152, 0, 0.3);
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .reference-item {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .reference-link {
                border: none;
                background: none;
                padding: 0;
                color: var(--accent-color, #2196f3);
                cursor: pointer;
                text-decoration: underline;
                font-size: 11px;
                text-align: left;
            }

            .reference-meta {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .toast {
                position: absolute;
                top: 12px;
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                background: rgba(46, 125, 50, 0.95);
                color: #fff;
                padding: 6px 12px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.3px;
                text-transform: uppercase;
                box-shadow: 0 6px 18px rgba(46, 125, 50, 0.25);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }

            .toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        `];

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @property({attribute: false})
    hass?: HomeAssistant;

    @state() protected slots: TSlot[] = [];

    @state() protected referencesStates: Record<string, SlotReferenceState> = {};

    @state() protected formMode: 'create' | 'edit' | null = null;

    @state() protected editingSlotId: string | null = null;

    @state() protected formSlotId = '';

    @state() protected formSlotName = '';

    @state() protected formSlotDescription = '';

    @state() protected formError: string | null = null;

    @state() protected toastMessage: string | null = null;

    private toastTimeoutId: number | null = null;

    protected abstract get slotsChangedEventName(): string;

    protected abstract get dialogTitle(): string;

    protected abstract get emptyListMessage(): string;

    protected abstract getSlots(): TSlot[];

    protected abstract getSlotId(slot: TSlot): string;

    protected abstract getSlotName(slot: TSlot): string;

    protected abstract getSlotDescription(slot: TSlot): string | undefined;

    protected abstract renderSlotMeta(slot: TSlot): TemplateResult;

    protected abstract renderFormFields(): TemplateResult;

    protected abstract createSlot(payload: Record<string, unknown>): SlotSaveResult<TSlot>;

    protected abstract updateSlot(slotId: string, payload: Record<string, unknown>): SlotSaveResult<TSlot>;

    protected abstract deleteSlot(slotId: string): void;

    protected abstract getReferences(slotId: string): SlotReference[];

    protected abstract formatReference(reference: SlotReference): string;

    protected abstract loadSpecificFields(slot: TSlot): void;

    protected abstract resetSpecificFields(): void;

    protected abstract buildSpecificPayload(): Record<string, unknown>;

    protected handleSaveSuccess(_mode: 'create' | 'edit', _slot?: TSlot): void {
        // no-op by default
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._refreshSlots();
        this.documentModel.addEventListener(this.slotsChangedEventName, this._handleSlotsChanged);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.documentModel.removeEventListener(this.slotsChangedEventName, this._handleSlotsChanged);
        if (this.toastTimeoutId !== null) {
            window.clearTimeout(this.toastTimeoutId);
            this.toastTimeoutId = null;
        }
    }

    protected renderDialogTop(): TemplateResult {
        return html`
            <div class="toast ${this.toastMessage ? 'show' : ''}">
                ${this.toastMessage ?? ''}
            </div>
        `;
    }

    protected renderDialogBody(): TemplateResult {
        return html`
            <div class="slot-list-panel">
                <div class="slot-list-header">
                    <span>Existing Slots</span>
                    <button class="primary-btn" @click=${this._handleNewSlot}>
                        <ha-icon icon="mdi:plus-circle"></ha-icon>
                        New Slot
                    </button>
                </div>
                <div class="slot-list">
                    ${this.slots.length === 0 ? html`
                        <div class="reference-meta">${this.emptyListMessage}</div>
                    ` : nothing}
                    ${this.slots.map((slot) => this._renderSlotItem(slot))}
                </div>
            </div>
            <div class="slot-form-panel">
                ${this.formMode ? this._renderForm() : html`
                    <div class="empty-form">Select a slot to edit or create a new one.</div>
                `}
            </div>
        `;
    }

    protected onBeforeClose(): void {
        this._resetFormState();
    }

    protected showToast(message: string): void {
        this.toastMessage = message;
        if (this.toastTimeoutId !== null) {
            window.clearTimeout(this.toastTimeoutId);
        }
        this.toastTimeoutId = window.setTimeout(() => {
            this.toastMessage = null;
            this.toastTimeoutId = null;
        }, 1400);
    }

    private _handleSlotsChanged = (): void => {
        this._refreshSlots();
    };

    private _refreshSlots(): void {
        this.slots = this.getSlots();
        const validIds = new Set(this.slots.map((slot) => this.getSlotId(slot)));
        this.referencesStates = Object.fromEntries(
            Object.entries(this.referencesStates).filter(([id]) => validIds.has(id))
        );
        if (this.formMode === 'edit' && this.editingSlotId && !validIds.has(this.editingSlotId)) {
            this._resetFormState();
        }
    }

    private _handleNewSlot = (): void => {
        this.formMode = 'create';
        this.editingSlotId = null;
        this.formError = null;
        this._resetFormFields();
    };

    private _openEditForm(slotId: string): void {
        const slot = this.slots.find((entry) => this.getSlotId(entry) === slotId);
        if (!slot) {
            return;
        }
        this.formMode = 'edit';
        this.editingSlotId = this.getSlotId(slot);
        this.formError = null;
        this._loadFormFromSlot(slot);
    }

    private _handleSaveForm = (): void => {
        const slotId = this.formSlotId.trim();
        if (!slotId) {
            this.formError = 'Slot ID cannot be empty';
            return;
        }

        const payload = {
            ...this._buildBasePayload(),
            ...this.buildSpecificPayload()
        };

        const result = this.formMode === 'edit' && this.editingSlotId
            ? this.updateSlot(this.editingSlotId, payload)
            : this.createSlot(payload);

        if (!result.success) {
            this.formError = result.error || 'Unable to save slot';
            return;
        }

        this.formError = null;

        if (this.formMode === 'edit') {
            if (result.slot) {
                this.editingSlotId = this.getSlotId(result.slot);
                this._loadFormFromSlot(result.slot);
            }
            this.handleSaveSuccess('edit', result.slot);
            return;
        }

        this.handleSaveSuccess('create', result.slot);
        this._resetFormFields();
    };

    private _handleCancelForm = (): void => {
        this._resetFormState();
    };

    private _resetFormState(): void {
        this.formMode = null;
        this.editingSlotId = null;
        this.formError = null;
        this._resetFormFields();
    }

    private _resetFormFields(): void {
        this.formSlotId = '';
        this.formSlotName = '';
        this.formSlotDescription = '';
        this.resetSpecificFields();
    }

    private _loadFormFromSlot(slot: TSlot): void {
        this.formSlotId = this.getSlotId(slot);
        this.formSlotName = this.getSlotName(slot);
        this.formSlotDescription = this.getSlotDescription(slot) || '';
        this.loadSpecificFields(slot);
    }

    private _buildBasePayload(): Record<string, unknown> {
        return {
            id: this.formSlotId.trim(),
            name: this.formSlotName.trim() || undefined,
            description: this.formSlotDescription.trim() || undefined
        };
    }

    private _renderSlotItem(slot: TSlot) {
        const slotId = this.getSlotId(slot);
        const description = this.getSlotDescription(slot);
        const referenceState = this.referencesStates[slotId];
        const isActive = this.formMode === 'edit' && this.editingSlotId === slotId;

        return html`
            <div class="slot-item ${isActive ? 'active' : ''}">
                <div class="slot-item-title">
                    <span class="slot-item-name">${this.getSlotName(slot)}</span>
                    ${isActive ? html`<span class="slot-item-badge">Editing</span>` : nothing}
                </div>
                <div class="slot-item-id">${slotId}</div>
                ${description ? html`
                    <div class="slot-item-description">${description}</div>
                ` : nothing}
                <div class="slot-item-meta">${this.renderSlotMeta(slot)}</div>
                <div class="slot-item-actions">
                    <button class="secondary-btn" @click=${() => this._openEditForm(slotId)}>
                        Edit
                    </button>
                    <button class="secondary-btn" @click=${() => this._handleFindReferences(slotId)}>
                        Find References
                    </button>
                    <button class="danger-btn" @click=${() => this._handleDeleteSlot(slotId)}>
                        Delete
                    </button>
                </div>
                ${referenceState ? html`
                    <div class="references">
                        <div class="reference-meta">References found (${referenceState.references.length})</div>
                        ${referenceState.references.map((reference) => html`
                            <div class="reference-item">
                                <button
                                        class="reference-link"
                                        @click=${() => this._handleReferenceNavigate(reference)}
                                >
                                    ${this._getBlockLabel(reference.blockId)} - ${this.formatReference(reference)}
                                </button>
                            </div>
                        `)}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _renderForm() {
        const isEdit = this.formMode === 'edit';
        const title = isEdit ? 'Edit slot' : 'New slot';
        const primaryLabel = isEdit ? 'Update slot' : 'Create slot';

        return html`
            <div class="form-card">
                <div class="form-title">${title}</div>
                <div class="form-group">
                    <span class="form-label">Slot ID</span>
                    <input
                            type="text"
                            .value=${this.formSlotId}
                            @input=${(e: Event) => {
                                this.formSlotId = (e.target as HTMLInputElement).value
                            }}
                    />
                </div>
                <div class="form-group">
                    <span class="form-label">Name</span>
                    <input
                            type="text"
                            .value=${this.formSlotName}
                            @input=${(e: Event) => {
                                this.formSlotName = (e.target as HTMLInputElement).value
                            }}
                    />
                </div>
                <div class="form-group">
                    <span class="form-label">Description</span>
                    <input
                            type="text"
                            .value=${this.formSlotDescription}
                            @input=${(e: Event) => {
                                this.formSlotDescription = (e.target as HTMLInputElement).value
                            }}
                    />
                </div>
                ${this.renderFormFields()}
                <div class="form-actions">
                    <button class="primary-btn" @click=${this._handleSaveForm}>
                        ${primaryLabel}
                    </button>
                    <button class="secondary-btn" @click=${this._handleCancelForm}>
                        Cancel
                    </button>
                    ${this.formError ? html`<span class="error-text">${this.formError}</span>` : nothing}
                </div>
            </div>
        `;
    }

    private _handleDeleteSlot(slotId: string): void {
        const references = this.getReferences(slotId);
        if (references.length > 0) {
            this.referencesStates = {
                ...this.referencesStates,
                [slotId]: {references}
            };
            return;
        }

        this.deleteSlot(slotId);
        const nextDeleteStates = {...this.referencesStates};
        delete nextDeleteStates[slotId];
        this.referencesStates = nextDeleteStates;
    }

    private _handleFindReferences(slotId: string): void {
        const references = this.getReferences(slotId);
        this.referencesStates = {
            ...this.referencesStates,
            [slotId]: {references}
        };
    }

    private _handleReferenceNavigate(reference: SlotReference): void {
        this.dispatchEvent(new CustomEvent('slot-reference-navigate', {
            detail: {reference},
            bubbles: true,
            composed: true
        }));
    }

    private _getBlockLabel(blockId: string): string {
        const block = this.documentModel.getBlock(blockId);
        return this.documentModel.getBlockDisplayName(blockId, block?.type || blockId);
    }
}
