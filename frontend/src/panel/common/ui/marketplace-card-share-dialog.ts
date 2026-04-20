import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { domToPng } from 'modern-screenshot';

import { OverlayDialogBase } from '@/panel/common/ui/overlay-dialog-base';
import { getAccountService, type MarketplaceDisclaimer } from '@/common/api';
import { containerManager, type Container } from '@/common/core/container-manager/container-manager';
import type { DocumentData } from '@/common/core/model/types';
import type { CardBuilderRendererCard } from '@/cards/renderer/card-renderer';
import '@/cards/renderer/card-renderer';

export interface ShareCardScreen {
    containerId: string;
    dataUrl: string;
    width: number;
    height: number;
    cardWidthPercent: number;
    cardScale: number;
}

export interface ShareCardDetail {
    description?: string;
    updateNotes?: string;
    updateReasons?: number[];
    screens?: ShareCardScreen[];
}

interface UpdateReasonOption {
    id: number;
    name: string;
}

const MAX_CARD_WIDTH_PERCENT = 100;
const MIN_CARD_WIDTH_PERCENT = 30;

@customElement('marketplace-card-share-dialog')
export class MarketplaceCardShareDialog extends OverlayDialogBase {
    static styles = [
        ...OverlayDialogBase.styles,
        css`
            :host {
                --overlay-dialog-width: min(96vw, 1280px);
                --overlay-dialog-height: min(94vh, 920px);
            }

            .dialog-body {
                padding: 0;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .step-header {
                padding: 16px 20px;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                background: var(--bg-secondary, #f5f5f5);
            }

            .step-title {
                font-size: 15px;
                font-weight: 700;
                color: var(--text-primary, #333);
            }

            .step-meta {
                font-size: 12px;
                color: var(--text-secondary, #666);
            }

            .step-body {
                flex: 1;
                overflow-y: auto;
            }

            .step-layout {
                display: grid;
                grid-template-columns: minmax(0, 1.8fr) minmax(0, 0.5fr);
                gap: 20px;
                padding: 20px;
                box-sizing: border-box;
            }

            .preview-column,
            .controls-column {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            .preview-frame {
                position: relative;
                width: 100%;
                aspect-ratio: var(--preview-ratio);
                border: 1px solid var(--border-color, #dcdcdc);
                border-radius: 12px;
                background: #f7f7f7;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .preview-stage {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
            }

            .card-wrapper {
                width: var(--card-width, 100%);
                max-width: 100%;
                display: flex;
                justify-content: center;
            }

            .card-scale {
                width: 100%;
                transform: scale(calc(var(--card-scale, 1) * var(--export-factor, 1)));
                transform-origin: center;
            }

            .card-scale card-builder-renderer-card {
                width: 100%;
                display: block;
            }

            .preview-loading {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 10px;
                background: rgba(0, 0, 0, 0.55);
                font-size: 22px;
                font-weight: bold;
                color: white;
                z-index: 1;
            }

            .preview-spinner {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                border: 4px solid white;
                border-top-color: var(--accent-color, #2196f3);
                animation: preview-spin 0.9s linear infinite;
            }

            @keyframes preview-spin {
                to {
                    transform: rotate(360deg);
                }
            }

            .intro {
                font-size: 13px;
                color: var(--text-secondary, #666);
                margin: 0;
                line-height: 1.5;
            }

            .summary {
                display: grid;
                gap: 10px;
                padding: 12px;
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                background: var(--bg-secondary, #f5f5f5);
                margin-bottom: 16px;
            }

            .summary-row {
                display: grid;
                grid-template-columns: 110px 1fr;
                gap: 8px;
                align-items: start;
            }

            .summary-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                color: var(--text-secondary, #666);
                font-weight: 600;
            }

            .summary-value {
                font-size: 13px;
                color: var(--text-primary, #333);
                word-break: break-word;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 14px;
            }

            .form-label {
                font-size: 11px;
                font-weight: 600;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            .form-label .required {
                color: #cc0000;
                margin-left: 4px;
            }

            textarea,
            input[type="text"],
            input[type="number"] {
                width: 100%;
                padding: 8px 10px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 4px;
                font-size: 13px;
                font-family: inherit;
                box-sizing: border-box;
                background: var(--bg-primary, #fff);
                color: var(--text-primary, #333);
            }

            textarea {
                min-height: 90px;
                resize: vertical;
            }

            textarea.error {
                border-color: #cc0000;
            }

            .error-text {
                font-size: 11px;
                color: #cc0000;
            }

            .checkbox-group {
                display: grid;
                gap: 8px;
                padding: 10px 0;
            }

            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--text-primary, #333);
            }

            .checkbox-item input {
                accent-color: var(--accent-color, #2196f3);
            }

            .disclaimer-block {
                display: grid;
                gap: 8px;
                padding: 10px 12px;
                border: 1px solid var(--border-color, #dcdcdc);
                border-radius: 8px;
                background: var(--bg-secondary, #f7f7f7);
            }

            .disclaimer-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .disclaimer-toggle {
                background: none;
                border: none;
                padding: 0;
                color: var(--accent-color, #2196f3);
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
            }

            .disclaimer-toggle[disabled] {
                color: var(--text-secondary, #666);
                cursor: not-allowed;
            }

            .disclaimer-body {
                font-size: 12px;
                color: var(--text-primary, #333);
                line-height: 1.5;
            }

            .disclaimer-links {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .disclaimer-links a {
                font-size: 12px;
                color: var(--accent-color, #2196f3);
                text-decoration: none;
                font-weight: 600;
            }

            .disclaimer-links a:hover {
                text-decoration: underline;
            }

            .hint {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .screens-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 12px;
                margin-bottom: 16px;
            }

            .screen-card {
                border: 1px solid var(--border-color, #dcdcdc);
                border-radius: 8px;
                padding: 8px;
                background: #fff;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .screen-card img {
                width: 100%;
                height: auto;
                border-radius: 6px;
                border: 1px solid rgba(0, 0, 0, 0.05);
                background: #f5f5f5;
            }

            .screen-label {
                font-size: 11px;
                font-weight: 600;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            .screen-missing {
                font-size: 12px;
                color: #b71c1c;
                padding: 10px;
                border: 1px dashed rgba(183, 28, 28, 0.4);
                border-radius: 6px;
                text-align: center;
            }

            .range-row {
                display: grid;
                grid-template-columns: 1fr 120px;
                gap: 12px;
                align-items: center;
            }

            .range-row input[type="range"] {
                width: 100%;
            }

            .error-banner {
                margin-bottom: 12px;
                padding: 8px 10px;
                border-radius: 6px;
                background: rgba(211, 47, 47, 0.1);
                color: #b71c1c;
                font-size: 12px;
            }

            @media (max-width: 900px) {
                .step-layout {
                    grid-template-columns: 1fr;
                    overflow: auto;
                }
            }
        `,
    ];

    @property({type: String})
    cardId = '';

    @property({type: String})
    cardName = '';

    @property({type: String})
    description = '';

    @property({attribute: false})
    cardConfig?: DocumentData;

    @property({attribute: false})
    hass?: HomeAssistant;

    @property({type: Boolean})
    shared = false;

    @property({type: Boolean})
    busy = false;

    @property({type: String})
    error: string | null = null;

    @state() private descriptionDraft = '';
    @state() private changeNotes = '';
    @state() private changeReasons: Set<number> = new Set();
    @state() private updateReasonOptions: UpdateReasonOption[] = [];
    @state() private updateReasonLoading = false;
    @state() private updateReasonError: string | null = null;
    @state() private stepIndex = 0;
    @state() private containers: Container[] = [];
    @state() private snapshots: ShareCardScreen[] = [];
    @state() private snapshotting = false;
    @state() private snapshotError: string | null = null;
    @state() private containerWidthPercents: Record<string, number> = {};
    @state() private containerScales: Record<string, number> = {};
    @state() private shareDisclaimer: MarketplaceDisclaimer | null = null;
    @state() private shareDisclaimerLoading = false;
    @state() private shareDisclaimerError: string | null = null;
    @state() private shareDisclaimerAccepted = false;
    @state() private shareDisclaimerExpanded = false;

    private updateReasonRequestId = 0;
    private disclaimerRequestId = 0;
    private previewRenderer?: CardBuilderRendererCard | null;
    private previewFrame?: HTMLElement | null;

    protected get dialogTitle(): string {
        return this.shared ? 'Upload update' : 'Share to marketplace';
    }

    protected get dialogSubtitle(): string | null {
        const total = this._getTotalSteps();
        if (!this.open || total === 0) return null;
        const step = Math.min(this.stepIndex + 1, total);
        return `Step ${step} of ${total}`;
    }

    protected get closeOnBackdrop(): boolean {
        return !this.busy && !this.snapshotting;
    }

    protected get closeOnEscape(): boolean {
        return !this.busy && !this.snapshotting;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has('open') && this.open) {
            this._initializeDialog();
        }
        if (changedProps.has('description') && this.open && !this.shared) {
            this.descriptionDraft = this.description || '';
        }
    }

    protected renderDialogBody(): TemplateResult {
        return html`
            ${this._renderStepHeader()}
            <div class="step-body">
                ${this._isFinalStep()
                    ? this._renderFinalStep()
                    : this._renderContainerStep()}
            </div>
        `;
    }

    protected renderDialogFooter(): TemplateResult | typeof nothing {
        if (this._isFinalStep()) {
            const isUpdate = this.shared;
            const descriptionMissing = !this.descriptionDraft.trim();
            const changeNotesMissing = isUpdate && !this.changeNotes.trim();
            const changeReasonsMissing = isUpdate && this.changeReasons.size === 0;
            const disclaimerReady = !isUpdate
                && !this.shareDisclaimerLoading
                && !this.shareDisclaimerError
                && Boolean(this.shareDisclaimer);
            const disclaimerMissing = !isUpdate && (!this.shareDisclaimerAccepted || !disclaimerReady);
            const snapshotsComplete = this._hasAllSnapshots();
            const disabled = this.busy
                || !snapshotsComplete
                || (isUpdate ? (changeNotesMissing || changeReasonsMissing) : (descriptionMissing || disclaimerMissing));
            const label = isUpdate ? 'Upload update' : 'Share';

            return html`
                <div class="dialog-footer">
                    <button class="secondary-btn" @click=${this._handleBack} ?disabled=${this.busy}>Back</button>
                    <div class="footer-spacer"></div>
                    <button class="secondary-btn" @click=${this.handleClose} ?disabled=${this.busy}>Cancel</button>
                    <button class="primary-btn" @click=${this._handleConfirm} ?disabled=${disabled}>
                        ${this.busy ? 'Uploading...' : label}
                    </button>
                </div>
            `;
        }

        const lastContainerStep = this.stepIndex === this.containers.length - 1;
        const nextLabel = lastContainerStep ? 'Capture & Review' : 'Capture & Next';
        const rendererReady = this._getRendererStatus() === 'ready';
        const disabled = this.snapshotting || !rendererReady;

        return html`
            <div class="dialog-footer">
                ${this.stepIndex > 0
                    ? html`<button class="secondary-btn" @click=${this._handleBack} ?disabled=${this.snapshotting}>Back</button>`
                    : nothing}
                <div class="footer-spacer"></div>
                <button class="secondary-btn" @click=${this.handleClose} ?disabled=${this.snapshotting}>Cancel</button>
                <button class="primary-btn" @click=${this._handleNext} ?disabled=${disabled}>
                    ${this.snapshotting ? 'Capturing...' : nextLabel}
                </button>
            </div>
        `;
    }

    private _renderStepHeader(): TemplateResult {
        if (this._isFinalStep()) {
            return html`
                <div class="step-header">
                    <div>
                        <div class="step-title">Review and upload</div>
                        <div class="step-meta">Check details and screenshots before publishing.</div>
                    </div>
                </div>
            `;
        }

        const container = this._getCurrentContainer();
        const targetLabel = `${container.aspectRatioWidth}:${container.aspectRatioHeight}`;

        return html`
            <div class="step-header">
                <div>
                    <div class="step-title">${container.name} preview</div>
                    <div class="step-meta">Target screen: ${targetLabel}</div>
                </div>
                <div class="step-meta">${this._getCurrentStepLabel()}</div>
            </div>
        `;
    }

    private _renderContainerStep(): TemplateResult {
        const container = this._getCurrentContainer();
        const widthPercent = this._getCardWidthPercent(container.id);
        const rendererStatus = this._getRendererStatus();
        const showLoading = rendererStatus === 'loading';

        return html`
            <div class="step-layout">
                <div class="preview-column">
                    <div
                        class="preview-frame"
                        style="
                            --preview-ratio: ${container.aspectRatioWidth} / ${container.aspectRatioHeight};
                            --card-width: ${widthPercent}%; 
                            --card-scale: ${this._getCardScale(container.id)};
                        "
                        ${ref((el) => this.previewFrame = el as HTMLElement)}
                    >
                        ${showLoading ? html`
                            <div class="preview-loading">
                                <div class="preview-spinner"></div>
                                <div>Loading preview...</div>
                            </div>
                        ` : nothing}
                        <div class="preview-stage">
                            <div class="card-wrapper">
                                <div class="card-scale">
                                    <card-builder-renderer-card
                                        ${ref((el) => this._setPreviewRenderer(el))}
                                        .hass=${this.hass}
                                        .activeContainerId=${container.id}
                                    ></card-builder-renderer-card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="controls-column">
                    <p class="intro">
                        Adjust the card width to improve the screenshot for this container.
                    </p>
                    <p class="intro">
                        Tune the preview for ${container.name}. You can reduce the width to better frame slim layouts.
                    </p>
                    <div class="form-group">
                        <label class="form-label">Card width (%)</label>
                        <div class="range-row">
                            <input
                                type="range"
                                min=${MIN_CARD_WIDTH_PERCENT}
                                max=${MAX_CARD_WIDTH_PERCENT}
                                step="1"
                                .value=${String(widthPercent)}
                                @input=${(e: Event) => this._handleWidthInput(e, container.id)}
                            />
                            <input
                                type="number"
                                min=${MIN_CARD_WIDTH_PERCENT}
                                max=${MAX_CARD_WIDTH_PERCENT}
                                step="1"
                                .value=${String(widthPercent)}
                                @input=${(e: Event) => this._handleWidthInput(e, container.id)}
                            />
                        </div>
                        <div class="hint">Scale width between ${MIN_CARD_WIDTH_PERCENT}% and ${MAX_CARD_WIDTH_PERCENT}%.</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Card scale</label>
                        <div class="range-row">
                            <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.05"
                                .value=${String(this._getCardScale(container.id))}
                                @input=${(e: Event) => this._handleScaleInput(e, container.id)}
                            />
                            <input
                                type="number"
                                min="0.5"
                                max="2"
                                step="0.05"
                                .value=${String(this._getCardScale(container.id))}
                                @input=${(e: Event) => this._handleScaleInput(e, container.id)}
                            />
                        </div>
                        <div class="hint">Zoom in or out to improve visibility.</div>
                    </div>
                    ${this.snapshotError ? html`<div class="error-banner">${this.snapshotError}</div>` : nothing}
                </div>
            </div>
        `;
    }

    private _renderFinalStep(): TemplateResult {
        const isUpdate = this.shared;
        const descriptionMissing = !this.descriptionDraft.trim();
        const changeNotesMissing = isUpdate && !this.changeNotes.trim();
        const changeReasonsMissing = isUpdate && this.changeReasons.size === 0;

        return html`
            <div class="step-layout">
                <div class="controls-column">
                    <p class="intro">
                        ${isUpdate
                            ? 'This will upload a new version of your card to the marketplace.'
                            : 'This will upload your card and any linked assets to the marketplace.'}
                    </p>
                    ${this.error ? html`<div class="error-banner">${this.error}</div>` : nothing}
                    <div class="summary">
                        <div class="summary-row">
                            <span class="summary-label">Card</span>
                            <span class="summary-value">${this.cardName || 'Untitled Card'}</span>
                        </div>
                        ${isUpdate ? html`
                            <div class="summary-row">
                                <span class="summary-label">Description</span>
                                <span class="summary-value">${this.description || 'No description provided.'}</span>
                            </div>
                        ` : nothing}
                    </div>
                    ${isUpdate ? this._renderUpdateFields(changeNotesMissing, changeReasonsMissing) : html`
                        ${this._renderDescriptionField(descriptionMissing)}
                    `}
                </div>
                <div class="preview-column">
                    <div class="step-title">Screenshots</div>
                    <div class="screens-grid">
                        ${this.containers.map((container) => {
                            const screen = this._getSnapshot(container.id);
                            return html`
                                <div class="screen-card">
                                    <div class="screen-label">${container.name}</div>
                                    ${screen
                                        ? html`<img src=${screen.dataUrl} alt="Screenshot ${container.name}" />`
                                        : html`<div class="screen-missing">Missing screenshot</div>`}
                                </div>
                            `;
                        })}
                    </div>
                    ${this._hasAllSnapshots() ? nothing : html`
                        <div class="error-banner">Some screenshots are missing. Go back to capture them.</div>
                    `}
                </div>
            </div>
        `;
    }

    private _renderDescriptionField(descriptionMissing: boolean): TemplateResult {
        return html`
            <div class="form-group">
                <label class="form-label">
                    Description
                    <span class="required">*</span>
                </label>
                <textarea
                    .value=${this.descriptionDraft}
                    class=${descriptionMissing ? 'error' : ''}
                    @input=${this._handleDescriptionInput}
                    placeholder="Describe your card for the marketplace"
                ></textarea>
                ${descriptionMissing ? html`
                    <div class="error-text">Description is required.</div>
                ` : nothing}
                ${this._renderShareDisclaimer()}
            </div>
        `;
    }

    private _renderShareDisclaimer(): TemplateResult | typeof nothing {
        if (this.shared) return nothing;

        const disclaimer = this.shareDisclaimer;
        const loading = this.shareDisclaimerLoading;
        const error = this.shareDisclaimerError;
        const disabled = loading || Boolean(error);
        const hasDetails = Boolean(disclaimer?.html || (disclaimer?.links?.length ?? 0));

        return html`
            <div class="disclaimer-block">
                <div class="disclaimer-row">
                    <label class="checkbox-item">
                        <input
                            type="checkbox"
                            ?checked=${this.shareDisclaimerAccepted}
                            ?disabled=${disabled}
                            @change=${this._handleShareDisclaimerCheck}
                        />
                        <span>I agree to the marketplace sharing disclaimer.</span>
                    </label>
                    <button
                        class="disclaimer-toggle"
                        @click=${this._handleShareDisclaimerToggle}
                        ?disabled=${!hasDetails || disabled}
                        type="button"
                    >
                        ${this.shareDisclaimerExpanded ? 'Hide details' : 'Show details'}
                    </button>
                </div>
                ${loading ? html`<div class="hint">Loading disclaimer...</div>` : nothing}
                ${error ? html`<div class="error-text">${error}</div>` : nothing}
                ${this.shareDisclaimerExpanded && hasDetails ? html`
                    <div class="disclaimer-body">
                        ${disclaimer?.html ? html`${unsafeHTML(disclaimer.html)}` : nothing}
                        ${disclaimer?.links?.length ? html`
                            <div class="disclaimer-links">
                                ${disclaimer.links.map((link) => html`
                                    <a href=${link.url} target="_blank" rel="noopener">
                                        ${link.label}
                                    </a>
                                `)}
                            </div>
                        ` : nothing}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _renderUpdateFields(changeNotesMissing: boolean, changeReasonsMissing: boolean): TemplateResult {
        const hasReasons = this.updateReasonOptions.length > 0;
        return html`
            <div class="form-group">
                <label class="form-label">
                    What changed
                    <span class="required">*</span>
                </label>
                <textarea
                    .value=${this.changeNotes}
                    class=${changeNotesMissing ? 'error' : ''}
                    @input=${this._handleChangeNotesInput}
                    placeholder="Explain what changed in this update"
                ></textarea>
                ${changeNotesMissing ? html`
                    <div class="error-text">Please describe the update.</div>
                ` : nothing}
            </div>

            <div class="form-group">
                <label class="form-label">
                    Reasons
                    <span class="required">*</span>
                </label>
                ${this.updateReasonLoading ? html`
                    <div class="hint">Loading update reasons...</div>
                ` : nothing}
                ${this.updateReasonError ? html`
                    <div class="error-text">${this.updateReasonError}</div>
                ` : nothing}
                ${!this.updateReasonLoading && !this.updateReasonError && !hasReasons ? html`
                    <div class="hint">No update reasons available.</div>
                ` : nothing}
                ${hasReasons ? html`
                    <div class="checkbox-group">
                        ${this.updateReasonOptions.map((reason) => html`
                            <label class="checkbox-item">
                                <input
                                    type="checkbox"
                                    .value=${String(reason.id)}
                                    ?checked=${this.changeReasons.has(reason.id)}
                                    @change=${this._handleReasonChange}
                                />
                                <span>${reason.name}</span>
                            </label>
                        `)}
                    </div>
                ` : nothing}
                ${changeReasonsMissing && hasReasons ? html`
                    <div class="error-text">Select at least one reason.</div>
                ` : hasReasons ? html`
                    <div class="hint">Select all that apply.</div>
                ` : nothing}
            </div>
        `;
    }

    private _handleDescriptionInput = (e: Event): void => {
        const target = e.target as HTMLTextAreaElement;
        this.descriptionDraft = target.value;
    };

    private _handleShareDisclaimerCheck = (e: Event): void => {
        const target = e.target as HTMLInputElement;
        this.shareDisclaimerAccepted = target.checked;
    };

    private _handleShareDisclaimerToggle = (): void => {
        this.shareDisclaimerExpanded = !this.shareDisclaimerExpanded;
    };

    private _handleChangeNotesInput = (e: Event): void => {
        const target = e.target as HTMLTextAreaElement;
        this.changeNotes = target.value;
    };

    private _handleReasonChange = (e: Event): void => {
        const target = e.target as HTMLInputElement;
        const value = Number(target.value);
        if (Number.isNaN(value)) return;
        const next = new Set(this.changeReasons);
        if (target.checked) {
            next.add(value);
        } else {
            next.delete(value);
        }
        this.changeReasons = next;
    };

    private async _fetchUpdateReasons(): Promise<void> {
        if (!this.hass) {
            this.updateReasonError = 'Unable to load update reasons.';
            this.updateReasonLoading = false;
            return;
        }

        const requestId = ++this.updateReasonRequestId;
        this.updateReasonLoading = true;
        this.updateReasonError = null;

        try {
            const service = getAccountService(this.hass);
            const response = await service.listMarketplaceUpdateReasons();
            if (requestId !== this.updateReasonRequestId) return;

            const options: UpdateReasonOption[] = [];
            for (const reason of response?.data ?? []) {
                const data = reason as Record<string, unknown>;
                const rawId = data.id;
                const name = typeof data.name === 'string' ? data.name : '';
                let id: number | null = null;
                if (typeof rawId === 'number' && Number.isFinite(rawId)) {
                    id = rawId;
                } else if (typeof rawId === 'string' && rawId.trim().match(/^\d+$/)) {
                    id = Number(rawId.trim());
                }
                if (id === null || !name) continue;
                options.push({id, name});
            }
            this.updateReasonOptions = options;
        } catch (err) {
            if (requestId !== this.updateReasonRequestId) return;
            console.error('Failed to load update reasons:', err);
            this.updateReasonError = 'Unable to load update reasons.';
            this.updateReasonOptions = [];
        } finally {
            if (requestId === this.updateReasonRequestId) {
                this.updateReasonLoading = false;
            }
        }
    }

    private async _fetchShareDisclaimer(): Promise<void> {
        if (!this.hass) {
            this.shareDisclaimerError = 'Unable to load disclaimer.';
            this.shareDisclaimerLoading = false;
            return;
        }

        const requestId = ++this.disclaimerRequestId;
        this.shareDisclaimerLoading = true;
        this.shareDisclaimerError = null;

        try {
            const service = getAccountService(this.hass);
            const response = await service.getMarketplaceShareDisclaimer();
            if (requestId !== this.disclaimerRequestId) return;
            this.shareDisclaimer = response;
        } catch (err) {
            if (requestId !== this.disclaimerRequestId) return;
            console.error('Failed to load share disclaimer:', err);
            this.shareDisclaimerError = 'Unable to load disclaimer.';
            this.shareDisclaimer = null;
        } finally {
            if (requestId === this.disclaimerRequestId) {
                this.shareDisclaimerLoading = false;
            }
        }
    }

    private _setPreviewRenderer(el: Element | undefined): void {
        if (!el) return;
        const renderer = el as CardBuilderRendererCard;
        this.previewRenderer = renderer;
        if (this.cardId) {
            renderer.setConfig({
                type: 'custom:card-builder-renderer-card',
                card_id: this.cardId,
            });
        }
    }

    private _handleWidthInput = (e: Event, containerId: string): void => {
        const target = e.target as HTMLInputElement;
        const value = Number(target.value);
        if (Number.isNaN(value)) return;
        const percent = Math.min(Math.max(value, MIN_CARD_WIDTH_PERCENT), MAX_CARD_WIDTH_PERCENT);
        this.containerWidthPercents = {...this.containerWidthPercents, [containerId]: percent};
    };

    private _handleScaleInput = (e: Event, containerId: string): void => {
        const target = e.target as HTMLInputElement;
        const value = Number(target.value);
        if (Number.isNaN(value)) return;
        const clamped = Math.min(Math.max(value, 0.5), 2);
        this.containerScales = {...this.containerScales, [containerId]: clamped};
    };

    private _handleNext = async (): Promise<void> => {
        if (this.snapshotting) return;
        const container = this._getCurrentContainer();
        if (!container) return;
        this.snapshotting = true;
        this.snapshotError = null;
        try {
            await this._captureSnapshot(container);
            this.stepIndex = Math.min(this.stepIndex + 1, this.containers.length);
        } catch (err) {
            console.error('Failed to capture snapshot:', err);
            this.snapshotError = 'Unable to capture the screenshot. Try again.';
        } finally {
            this.snapshotting = false;
        }
    };

    private _handleBack = (): void => {
        if (this.snapshotting || this.busy) return;
        if (this.stepIndex === 0) return;
        this.stepIndex -= 1;
        this.snapshotError = null;
    };

    private _handleConfirm = (): void => {
        if (this.busy) return;
        if (!this._hasAllSnapshots()) return;
        if (!this.shared && !this.descriptionDraft.trim()) return;
        if (
            !this.shared
            && (!this.shareDisclaimer
                || this.shareDisclaimerLoading
                || this.shareDisclaimerError
                || !this.shareDisclaimerAccepted)
        ) {
            return;
        }
        if (this.shared && (!this.changeNotes.trim() || this.changeReasons.size === 0)) return;

        const detail: ShareCardDetail = {
            screens: this.snapshots.slice(),
        };
        if (this.shared) {
            detail.updateNotes = this.changeNotes.trim();
            detail.updateReasons = Array.from(this.changeReasons);
        } else {
            detail.description = this.descriptionDraft.trim();
        }

        this.dispatchEvent(new CustomEvent<ShareCardDetail>('share-confirm', {
            detail,
            bubbles: true,
            composed: true,
        }));
    };

    private _initializeDialog(): void {
        this.descriptionDraft = this.description || '';
        this.changeNotes = '';
        this.changeReasons = new Set();
        this.updateReasonOptions = [];
        this.updateReasonLoading = false;
        this.updateReasonError = null;
        this.shareDisclaimer = null;
        this.shareDisclaimerLoading = false;
        this.shareDisclaimerError = null;
        this.shareDisclaimerAccepted = false;
        this.shareDisclaimerExpanded = false;
        this.containers = containerManager.getContainers(true);
        this.containerWidthPercents = this._buildInitialPercents(this.containers);
        this.containerScales = this._buildInitialScales(this.containers);
        this.snapshots = [];
        this.stepIndex = 0;
        this.snapshotError = null;
        if (this.shared) {
            void this._fetchUpdateReasons();
        } else {
            void this._fetchShareDisclaimer();
        }
    }

    private _buildInitialPercents(containers: Container[]): Record<string, number> {
        const result: Record<string, number> = {};
        for (const container of containers) {
            result[container.id] = MAX_CARD_WIDTH_PERCENT;
        }
        return result;
    }

    private _buildInitialScales(containers: Container[]): Record<string, number> {
        const result: Record<string, number> = {};
        for (const container of containers) {
            result[container.id] = 1;
        }
        return result;
    }

    private _getCurrentContainer(): Container {
        return this.containers[this.stepIndex];
    }

    private _getCardWidthPercent(containerId: string): number {
        return this.containerWidthPercents[containerId] ?? MAX_CARD_WIDTH_PERCENT;
    }

    private _getCardScale(containerId: string): number {
        return this.containerScales[containerId] ?? 1;
    }

    private _getContainerScreenSize(container: Container): {width: number; height: number} {
        const width = container.screenWidth;
        const aspectRatio = container.aspectRatioWidth / container.aspectRatioHeight;
        const height = Math.round(width / aspectRatio);
        return {width, height};
    }

    private _getTotalSteps(): number {
        return this.containers.length + 1;
    }

    private _getCurrentStepLabel(): string {
        const total = this._getTotalSteps();
        const current = Math.min(this.stepIndex + 1, total);
        return `Step ${current} / ${total}`;
    }

    private _isFinalStep(): boolean {
        return this.stepIndex >= this.containers.length;
    }

    private _hasAllSnapshots(): boolean {
        return this.containers.every((container) => Boolean(this._getSnapshot(container.id)));
    }

    private _getSnapshot(containerId: string): ShareCardScreen | undefined {
        return this.snapshots.find((item) => item.containerId === containerId);
    }

    private _getRendererStatus(): 'ready' | 'loading' | 'error' {
        const root = this.previewRenderer?.shadowRoot;
        if (!root) return 'loading';
        if (root.querySelector('.card-content.error')) return 'error';
        if (root.querySelector('.card-content.loading')) return 'loading';
        if (root.querySelector('card-builder-renderer-card-canvas')) return 'ready';
        return 'loading';
    }

    private async _waitForRendererReady(timeoutMs: number = 4000): Promise<boolean> {
        const started = performance.now();
        while (performance.now() - started < timeoutMs) {
            const status = this._getRendererStatus();
            if (status === 'ready') return true;
            if (status === 'error') return false;
            await new Promise((resolve) => requestAnimationFrame(() => resolve(true)));
        }
        return false;
    }

    private async _captureSnapshot(container: Container): Promise<void> {
        const frame = this.previewFrame;
        if (!frame) {
            this.snapshotError = 'Preview frame not ready.';
            return;
        }

        const ready = await this._waitForRendererReady();
        if (!ready) {
            this.snapshotError = 'Preview is not ready yet.';
            return;
        }

        const frameWidth = frame.clientWidth;
        if (!frameWidth) {
            this.snapshotError = 'Unable to measure preview size.';
            return;
        }

        const scale = this._getCardScale(container.id);
        const targetSize = this._getContainerScreenSize(container);
        const pixelRatio = targetSize.width / frameWidth;

        const dataUrl = await domToPng(frame, {
            width: targetSize.width,
            height: targetSize.height,
            style: {
                width: `${targetSize.width}px`,
                height: `${targetSize.height}px`,
                border: 'none',
                borderRadius: '0',
                background: 'transparent',
            },
            scale: 1,
            backgroundColor: 'transparent',
            fetch: {bypassingCache: true},
            onCloneNode: function(cloned: Node){
                const clonedElement = cloned as HTMLElement;
                const scaleElement = clonedElement.querySelector('.card-scale') as HTMLElement;
                scaleElement.style.setProperty('transform', `scale(${scale * pixelRatio})`);
            },
        });

        const next: ShareCardScreen = {
            containerId: container.id,
            dataUrl,
            width: targetSize.width,
            height: targetSize.height,
            cardWidthPercent: this._getCardWidthPercent(container.id),
            cardScale: this._getCardScale(container.id),
        };
        this.snapshots = [
            ...this.snapshots.filter((item) => item.containerId !== container.id),
            next,
        ];
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'marketplace-card-share-dialog': MarketplaceCardShareDialog;
    }
}
