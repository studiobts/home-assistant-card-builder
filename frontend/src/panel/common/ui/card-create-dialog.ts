import { getCardsService } from '@/common/api';
import { blockRegistry } from '@/common/blocks/core/registry/block-registry';
import { type EventBus, eventBusContext } from '@/common/core/event-bus';
import { DocumentModel } from '@/common/core/model';
import { OverlayDialogBase } from '@/panel/common/ui/overlay-dialog-base';
import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

export interface CardCreateSuccessDetail {
    cardId: string;
}
export const CARD_CREATE_SUCCESS_EVENT = 'card-create-success';

@customElement('card-create-dialog')
export class CardCreateDialog extends OverlayDialogBase {
    static styles = [
        ...OverlayDialogBase.styles,
        css`
            :host {
                --overlay-dialog-width: min(92vw, 560px);
                --overlay-dialog-height: auto;
            }

            .dialog {
                height: auto;
                max-height: min(86vh, 640px);
            }

            .dialog-body {
                padding: 20px;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .form-field {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-label {
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.3px;
                text-transform: uppercase;
                color: var(--text-secondary, #666);
            }

            .required {
                color: #b71c1c;
            }

            .form-input {
                width: 100%;
                box-sizing: border-box;
                padding: 10px 12px;
                border-radius: 6px;
                border: 1px solid var(--border-color, #d0d0d0);
                background: var(--bg-primary, #fff);
                color: var(--text-primary, #333);
                font-size: 14px;
                font-family: inherit;
            }

            .form-input:focus {
                outline: none;
                border-color: var(--accent-color, #2196f3);
            }

            .form-input.error {
                border-color: #b71c1c;
            }

            .form-textarea {
                min-height: 110px;
                resize: vertical;
            }

            .error-text {
                color: #b71c1c;
                font-size: 12px;
                line-height: 1.4;
            }
        `,
    ];

    @property({ attribute: false })
    hass?: HomeAssistant;

    @consume({ context: eventBusContext })
    private eventBus?: EventBus;

    @state() private cardName = '';
    @state() private cardDescription = '';
    @state() private formError: string | null = null;
    @state() private submitError: string | null = null;
    @state() private creating = false;

    protected get dialogTitle(): string {
        return 'Create new card';
    }

    protected get dialogSubtitle(): string | null {
        return 'Set required and optional card details';
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has('open') && this.open) {
            this._resetForm();
        }
    }

    protected renderDialogBody(): TemplateResult {
        const hasNameError = Boolean(this.formError);

        return html`
            <div class="form-field">
                <label class="form-label" for="card-create-name">
                    Card name <span class="required">*</span>
                </label>
                <input
                    id="card-create-name"
                    class="form-input ${hasNameError ? 'error' : ''}"
                    .value=${this.cardName}
                    ?disabled=${this.creating}
                    @input=${this._handleNameInput}
                    @keydown=${this._handleNameKeyDown}
                    placeholder="Enter card name"
                />
                ${hasNameError ? html`<div class="error-text">${this.formError}</div>` : nothing}
            </div>

            <div class="form-field">
                <label class="form-label" for="card-create-description">Description</label>
                <textarea
                    id="card-create-description"
                    class="form-input form-textarea"
                    .value=${this.cardDescription}
                    ?disabled=${this.creating}
                    @input=${this._handleDescriptionInput}
                    placeholder="Optional description"
                ></textarea>
            </div>

            ${this.submitError ? html`<div class="error-text">${this.submitError}</div>` : nothing}
        `;
    }

    protected renderDialogFooter(): TemplateResult {
        return html`
            <div class="dialog-footer">
                <div class="footer-spacer"></div>
                <button class="secondary-btn" @click=${this.handleClose} ?disabled=${this.creating}>
                    Cancel
                </button>
                <button class="primary-btn" @click=${this._handleSubmit} ?disabled=${this.creating}>
                    ${this.creating ? 'Creating...' : 'Create card'}
                </button>
            </div>
        `;
    }

    private _resetForm(): void {
        this.cardName = '';
        this.cardDescription = '';
        this.formError = null;
        this.submitError = null;
        this.creating = false;
    }

    private _handleNameInput = (event: Event): void => {
        const input = event.target as HTMLInputElement;
        this.cardName = input.value;
        if (this.formError) {
            this.formError = null;
        }
    };

    private _handleDescriptionInput = (event: Event): void => {
        const input = event.target as HTMLTextAreaElement;
        this.cardDescription = input.value;
    };

    private _handleNameKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        void this._handleSubmit();
    };

    private async _handleSubmit(): Promise<void> {
        if (this.creating) return;
        if (!this.hass) {
            this.submitError = 'Home Assistant context not available.';
            return;
        }

        const name = this.cardName.trim();
        if (!name) {
            this.formError = 'Card name is required.';
            return;
        }

        this.formError = null;
        this.submitError = null;
        this.creating = true;

        try {
            const model = new DocumentModel();
            const config = model.exportToConfig();
            const cardsService = getCardsService(this.hass);
            const newCard = await cardsService.createCard({
                name,
                description: this.cardDescription.trim(),
                config,
                min_builder_version: blockRegistry.getRequiredBuilderVersionForDocument(config),
                source: 'local',
                author: this.hass.user?.name ?? '',
            });
            this.eventBus?.dispatchEvent<CardCreateSuccessDetail>(CARD_CREATE_SUCCESS_EVENT, {
                cardId: newCard.id,
            });
            this.handleClose();
        } catch (err) {
            console.error('Failed to create card:', err);
            this.submitError = 'Failed to create card. Please try again.';
        } finally {
            this.creating = false;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'card-create-dialog': CardCreateDialog;
    }
}
