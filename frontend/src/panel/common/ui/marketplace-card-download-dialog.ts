import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { HomeAssistant } from 'custom-card-helpers';

import {
    getAccountService,
    type MarketplaceCardInfo,
    type MarketplaceDisclaimer,
    type MarketplaceDownloadResult,
    type MarketplacePrepareResult,
} from '@/common/api';
import {
    DocumentModel,
    type ActionConfig,
    type ActionSlot,
    type DocumentSlot,
} from '@/common/core/model';
import { getMarketplaceBuilderVersionError } from '@/common/api/marketplace-builder-version';
import { migrateDocumentData } from '@/common/core/model/migration';
import { OverlayDialogBase } from '@/panel/common/ui/overlay-dialog-base';
import '@/panel/common/ui/marketplace-slot-configurator';

type DialogStep = 'info' | 'entities' | 'actions';

@customElement('marketplace-card-download-dialog')
export class MarketplaceCardDownloadDialog extends OverlayDialogBase {
    static styles = [
        ...OverlayDialogBase.styles,
        css`
            :host {
                --overlay-dialog-width: min(92vw, 980px);
                --overlay-dialog-height: min(90vh, 760px);
            }

            .dialog-body {
                padding: 20px;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .input-row {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 12px;
                align-items: end;
            }

            .input-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .input-label {
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.4px;
                text-transform: uppercase;
                color: var(--text-secondary, #666);
            }

            .input-row button {
                padding: 13px;
            }

            .text-input {
                padding: 10px 12px;
                border-radius: 6px;
                border: 1px solid var(--border-color, #d0d0d0);
                background: var(--bg-primary, #fff);
                font-size: 14px;
                color: var(--text-primary, #333);
                font-family: inherit;
            }

            .text-input:focus {
                outline: none;
                border-color: var(--accent-color, #2196f3);
            }

            .info-title {
                font-size: 20px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .info-layout {
                display: grid;
                grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
                gap: 16px;
            }

            .preview-column,
            .info-column {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .info-card {
                padding: 16px;
                border-radius: 10px;
                border: 1px solid var(--border-color, #e0e0e0);
                background: var(--bg-secondary, #f7f7f7);
                display: grid;
                gap: 12px;
            }

            .info-row {
                display: grid;
                grid-template-columns: 120px 1fr;
                gap: 10px;
                align-items: baseline;
            }

            .info-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                color: var(--text-secondary, #666);
                font-weight: 600;
            }

            .info-value {
                font-size: 14px;
                color: var(--text-primary, #333);
                word-break: break-word;
            }

            .chips {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .chip {
                padding: 4px 8px;
                border-radius: 999px;
                background: rgba(33, 150, 243, 0.12);
                color: var(--accent-color, #1e88e5);
                font-size: 12px;
                font-weight: 600;
            }

            .previews {
                display: grid;
                gap: 10px;
            }

            .preview-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
            }

            .preview-grid img {
                width: 100%;
                height: auto;
                border-radius: 8px;
                border: 1px solid var(--border-color, #e0e0e0);
                background: #fff;
            }

            @media (max-width: 900px) {
                .info-layout {
                    grid-template-columns: 1fr;
                }
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

            .disclaimer-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--text-primary, #333);
            }

            .disclaimer-checkbox input {
                accent-color: var(--accent-color, #2196f3);
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

            .step-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
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

            .error-banner {
                padding: 10px 12px;
                border-radius: 8px;
                background: rgba(211, 47, 47, 0.12);
                color: #b71c1c;
                font-size: 13px;
                border: 1px solid rgba(211, 47, 47, 0.2);
            }

            .muted {
                font-size: 13px;
                color: var(--text-secondary, #666);
            }
        `,
    ];

    @property({ attribute: false })
    hass?: HomeAssistant;

    // -- Info step state --
    @state() private marketplaceId = '';
    @state() private loadingInfo = false;
    @state() private info: MarketplaceCardInfo | null = null;
    @state() private error: string | null = null;
    @state() private disclaimer: MarketplaceDisclaimer | null = null;
    @state() private disclaimerLoading = false;
    @state() private disclaimerError: string | null = null;
    @state() private disclaimerAccepted = false;
    @state() private disclaimerExpanded = false;

    // -- Wizard state --
    @state() private step: DialogStep = 'info';
    @state() private preparing = false;
    @state() private confirming = false;
    @state() private preparedPayload: MarketplacePrepareResult | null = null;
    @state() private entitySlots: DocumentSlot[] = [];
    @state() private actionSlots: ActionSlot[] = [];
    @state() private slotEntities: Record<string, string> = {};
    @state() private slotActions: Record<string, ActionConfig> = {};
    @state() private downloadError: string | null = null;

    private _documentModel = new DocumentModel();

    protected get dialogTitle(): string {
        return 'Download from marketplace';
    }

    protected get dialogSubtitle(): string | null {
        if (this.step === 'info') {
            return 'Fetch a card by marketplace ID';
        }
        const steps = this._getWizardSteps();
        const currentIdx = steps.indexOf(this.step);
        return `Step ${currentIdx + 1} of ${steps.length} — Configure slots`;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has('open') && this.open) {
            this._resetState();
            void this._loadDisclaimer();
        }
    }

    protected renderDialogBody(): TemplateResult {
        switch (this.step) {
            case 'entities':
                return this._renderEntitiesStep();
            case 'actions':
                return this._renderActionsStep();
            default:
                return this._renderInfoStep();
        }
    }

    protected renderDialogFooter(): TemplateResult {
        switch (this.step) {
            case 'entities':
            case 'actions':
                return this._renderWizardFooter();
            default:
                return this._renderInfoFooter();
        }
    }

    // =========================================================================
    // Info Step
    // =========================================================================

    private _renderInfoStep(): TemplateResult {
        const loadDisabled = this.loadingInfo || this.preparing || !this.marketplaceId.trim();

        return html`
            <div class="input-row">
                <div class="input-group">
                    <label class="input-label" for="marketplace-id">Marketplace ID</label>
                    <input
                        id="marketplace-id"
                        class="text-input"
                        .value=${this.marketplaceId}
                        ?disabled=${this.loadingInfo || this.preparing}
                        @input=${this._handleIdInput}
                        placeholder="Enter marketplace card ID"
                    />
                </div>
                <button
                    class="primary-btn"
                    @click=${this._handleFetchInfo}
                    ?disabled=${loadDisabled}
                >
                    ${this.loadingInfo ? 'Loading...' : 'Load info'}
                </button>
            </div>

            ${this.error ? html`<div class="error-banner">${this.error}</div>` : nothing}

            ${this.info ? this._renderInfo(this.info) : html`
                <div class="muted">Load the card info to preview details before downloading.</div>
            `}

            ${this.info ? this._renderDisclaimer() : nothing}

            ${this.downloadError ? html`<div class="error-banner">${this.downloadError}</div>` : nothing}
        `;
    }

    private _renderInfoFooter(): TemplateResult {
        return html`
            <div class="dialog-footer">
                <div class="footer-spacer"></div>
                <button class="secondary-btn" @click=${this.handleClose} ?disabled=${this.preparing}>
                    Cancel
                </button>
                <button
                    class="primary-btn"
                    @click=${this._handlePrepareDownload}
                    ?disabled=${!this.info || this.preparing || this.loadingInfo || !this.disclaimerAccepted}
                >
                    ${this.preparing ? 'Preparing...' : 'Download card'}
                </button>
            </div>
        `;
    }

    // =========================================================================
    // Entity Slots Step
    // =========================================================================

    private _renderEntitiesStep(): TemplateResult {
        return html`
            <div class="step-header">
                <div class="step-title">Configure entity slots</div>
                <div class="step-meta">${this._getStepLabel()}</div>
            </div>
            ${this.downloadError ? html`<div class="error-banner">${this.downloadError}</div>` : nothing}
            <marketplace-slot-configurator
                .hass=${this.hass}
                .entitySlots=${this.entitySlots}
                .actionSlots=${[]}
                .slotEntities=${this.slotEntities}
                .slotActions=${{}}
                .mode=${'entities'}
                .validateEntities=${true}
                @slot-entities-changed=${this._handleSlotEntitiesChanged}
            ></marketplace-slot-configurator>
        `;
    }

    // =========================================================================
    // Action Slots Step
    // =========================================================================

    private _renderActionsStep(): TemplateResult {
        return html`
            <div class="step-header">
                <div class="step-title">Configure action slots</div>
                <div class="step-meta">${this._getStepLabel()}</div>
            </div>
            ${this.downloadError ? html`<div class="error-banner">${this.downloadError}</div>` : nothing}
            <marketplace-slot-configurator
                .hass=${this.hass}
                .entitySlots=${[]}
                .actionSlots=${this.actionSlots}
                .slotEntities=${{}}
                .slotActions=${this.slotActions}
                .mode=${'actions'}
                @slot-actions-changed=${this._handleSlotActionsChanged}
            ></marketplace-slot-configurator>
        `;
    }

    // =========================================================================
    // Wizard Footer
    // =========================================================================

    private _renderWizardFooter(): TemplateResult {
        const steps = this._getWizardSteps();
        const currentIdx = steps.indexOf(this.step);
        const isLast = currentIdx === steps.length - 1;

        return html`
            <div class="dialog-footer">
                <div class="footer-spacer"></div>
                <button class="secondary-btn" @click=${this._handleWizardBack} ?disabled=${this.confirming}>
                    Back
                </button>
                ${isLast ? html`
                    <button class="primary-btn" @click=${this._handleConfirmDownload} ?disabled=${this.confirming}>
                        ${this.confirming ? 'Saving...' : 'Confirm'}
                    </button>
                ` : html`
                    <button class="primary-btn" @click=${this._handleWizardNext}>
                        Next
                    </button>
                `}
            </div>
        `;
    }

    // =========================================================================
    // Info Rendering
    // =========================================================================

    private _renderInfo(info: MarketplaceCardInfo): TemplateResult {
        const creatorName = info.creator?.username || info.author || 'Unknown';
        const categories = info.categories ?? [];
        const tags = info.tags ?? [];
        const previewImages = info.preview_images ?? [];

        if (!previewImages.length) {
            return html`
                <div class="info-card">
                    <div class="info-row">
                        <div class="info-label">Name</div>
                        <div class="info-value">${info.name}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Description</div>
                        <div class="info-value">${info.description || 'No description'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Version</div>
                        <div class="info-value">${info.version ?? 'Unknown'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Creator</div>
                        <div class="info-value">${creatorName}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Style</div>
                        <div class="info-value">${info.style || 'Not specified'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Categories</div>
                        <div class="info-value">
                            ${categories.length ? html`
                                <div class="chips">
                                    ${categories.map(category => html`<span class="chip">${category}</span>`)}
                                </div>
                            ` : 'None'}
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Tags</div>
                        <div class="info-value">
                            ${tags.length ? html`
                                <div class="chips">
                                    ${tags.map(tag => html`<span class="chip">${tag}</span>`)}
                                </div>
                            ` : 'None'}
                        </div>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="info-title">${info.name}</div>
            <div class="info-layout">
                <div class="preview-column">
                    <div class="previews">
                        <div class="preview-grid">
                            ${previewImages.map((image, index) => html`
                                <img
                                    src=${image.url}
                                    alt=${`Preview ${index + 1}`}
                                    loading="lazy"
                                />
                            `)}
                        </div>
                    </div>
                </div>
                <div class="info-column">
                    <div class="info-card">
                        <div class="info-row">
                            <div class="info-label">Name</div>
                            <div class="info-value">${info.name}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Description</div>
                            <div class="info-value">${info.description || 'No description'}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Version</div>
                            <div class="info-value">${info.version ?? 'Unknown'}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Creator</div>
                            <div class="info-value">${creatorName}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Style</div>
                            <div class="info-value">${info.style || 'Not specified'}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Categories</div>
                            <div class="info-value">
                                ${categories.length ? html`
                                    <div class="chips">
                                        ${categories.map(category => html`<span class="chip">${category}</span>`)}
                                    </div>
                                ` : 'None'}
                            </div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Tags</div>
                            <div class="info-value">
                                ${tags.length ? html`
                                    <div class="chips">
                                        ${tags.map(tag => html`<span class="chip">${tag}</span>`)}
                                    </div>
                                ` : 'None'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private _renderDisclaimer(): TemplateResult {
        const disclaimer = this.disclaimer;
        const loading = this.disclaimerLoading;
        const error = this.disclaimerError;
        const disabled = loading || Boolean(error);
        const hasDetails = Boolean(disclaimer?.html || (disclaimer?.links?.length ?? 0));

        return html`
            <div class="disclaimer-block">
                <div class="disclaimer-row">
                    <label class="disclaimer-checkbox">
                        <input
                            type="checkbox"
                            ?checked=${this.disclaimerAccepted}
                            ?disabled=${disabled}
                            @change=${this._handleDisclaimerCheck}
                        />
                        <span>I agree to the marketplace download disclaimer.</span>
                    </label>
                    <button
                        class="disclaimer-toggle"
                        @click=${this._handleDisclaimerToggle}
                        ?disabled=${!hasDetails || disabled}
                        type="button"
                    >
                        ${this.disclaimerExpanded ? 'Hide details' : 'Show details'}
                    </button>
                </div>
                ${loading ? html`<div class="muted">Loading disclaimer...</div>` : nothing}
                ${error ? html`<div class="error-banner">${error}</div>` : nothing}
                ${this.disclaimerExpanded && hasDetails ? html`
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

    // =========================================================================
    // Handlers
    // =========================================================================

    private _handleIdInput = (event: Event): void => {
        const target = event.target as HTMLInputElement | null;
        this.marketplaceId = target?.value ?? '';
        this.error = null;
        this.downloadError = null;
    };

    private _handleFetchInfo = async (): Promise<void> => {
        if (!this.hass) return;
        const id = this.marketplaceId.trim();
        if (!id) {
            this.error = 'Marketplace ID is required.';
            return;
        }
        this.loadingInfo = true;
        this.error = null;
        this.downloadError = null;
        this.info = null;
        this.disclaimerAccepted = false;
        try {
            const service = getAccountService(this.hass);
            this.info = await service.getMarketplaceCardInfo(id);
            this.downloadError = getMarketplaceBuilderVersionError(this.info.min_builder_version);
        } catch (err) {
            this.error = this._formatError(err);
        } finally {
            this.loadingInfo = false;
        }
    };

    private _handlePrepareDownload = async (): Promise<void> => {
        if (!this.hass || !this.info) return;
        const id = this.info.marketplace_id || this.marketplaceId.trim();
        if (!id) return;
        if (!this.disclaimerAccepted) {
            this.downloadError = 'You must accept the marketplace download disclaimer.';
            return;
        }
        const builderVersionError = getMarketplaceBuilderVersionError(this.info.min_builder_version);
        if (builderVersionError) {
            this.downloadError = builderVersionError;
            return;
        }
        this.preparing = true;
        this.downloadError = null;
        try {
            const service = getAccountService(this.hass);
            this.preparedPayload = await service.prepareMarketplaceDownload(id);
            const payloadVersionError = getMarketplaceBuilderVersionError(this.preparedPayload.min_builder_version);
            if (payloadVersionError) {
                this.downloadError = payloadVersionError;
                this.preparedPayload = null;
                return;
            }
            this._initializeSlotsFromPayload(this.preparedPayload);
            this._advanceToFirstWizardStep();
        } catch (err) {
            this.downloadError = this._formatError(err);
        } finally {
            this.preparing = false;
        }
    };

    private _handleConfirmDownload = async (): Promise<void> => {
        if (!this.hass || !this.preparedPayload) return;
        const marketplaceId = this.preparedPayload.marketplace_id || this.marketplaceId.trim();
        if (!marketplaceId) return;
        const builderVersionError = getMarketplaceBuilderVersionError(this.preparedPayload.min_builder_version);
        if (builderVersionError) {
            this.downloadError = builderVersionError;
            return;
        }
        this.confirming = true;
        this.downloadError = null;
        try {
            const finalPayload = this._applySlotChoicesToPayload();
            const service = getAccountService(this.hass);
            const result = await service.confirmMarketplaceDownload(marketplaceId, finalPayload);
            this.dispatchEvent(new CustomEvent<MarketplaceDownloadResult>('marketplace-download-success', {
                detail: result,
                bubbles: true,
                composed: true,
            }));
            this.handleClose();
        } catch (err) {
            this.downloadError = this._formatError(err);
        } finally {
            this.confirming = false;
        }
    };

    private _handleSlotEntitiesChanged = (ev: CustomEvent): void => {
        this.slotEntities = ev.detail?.slotEntities ?? {};
    };

    private _handleSlotActionsChanged = (ev: CustomEvent): void => {
        this.slotActions = ev.detail?.slotActions ?? {};
    };

    private _handleWizardBack = (): void => {
        const steps = this._getWizardSteps();
        const currentIdx = steps.indexOf(this.step);
        if (currentIdx <= 0) {
            this.step = 'info';
        } else {
            this.step = steps[currentIdx - 1];
        }
        this.downloadError = null;
    };

    private _handleWizardNext = (): void => {
        const steps = this._getWizardSteps();
        const currentIdx = steps.indexOf(this.step);
        if (currentIdx < steps.length - 1) {
            this.step = steps[currentIdx + 1];
        }
        this.downloadError = null;
    };

    private _handleDisclaimerCheck = (event: Event): void => {
        const target = event.target as HTMLInputElement | null;
        this.disclaimerAccepted = Boolean(target?.checked);
        this.error = null;
    };

    private _handleDisclaimerToggle = (): void => {
        this.disclaimerExpanded = !this.disclaimerExpanded;
    };

    // =========================================================================
    // Slot Initialization
    // =========================================================================

    private _initializeSlotsFromPayload(payload: MarketplacePrepareResult): void {
        const config = payload.config;
        if (!config) {
            this.entitySlots = [];
            this.actionSlots = [];
            this.slotEntities = {};
            this.slotActions = {};
            return;
        }

        const { config: migratedConfig } = migrateDocumentData(config);
        this._documentModel.loadFromConfig(migratedConfig);
        this.entitySlots = this._documentModel.getSlotEntities();
        this.actionSlots = this._documentModel.getSlotActions();

        // Pre-fill entity slot values, clearing those whose entity doesn't exist locally
        const entities: Record<string, string> = {};
        for (const slot of this.entitySlots) {
            if (slot.entityId?.trim()) {
                const entityId = slot.entityId.trim();
                if (this.hass?.states?.[entityId]) {
                    entities[slot.id] = entityId;
                }
            }
        }
        this.slotEntities = entities;

        // Pre-fill action slot values with download defaults
        const actions: Record<string, ActionConfig> = {};
        for (const slot of this.actionSlots) {
            if (slot.action && slot.action.action !== 'none') {
                actions[slot.id] = slot.action;
            }
        }
        this.slotActions = actions;
    }

    private _applySlotChoicesToPayload(): MarketplacePrepareResult {
        if (!this.preparedPayload) {
            throw new Error('No prepared payload');
        }

        const payload = { ...this.preparedPayload };
        const config = JSON.parse(JSON.stringify(payload.config)) as Record<string, unknown>;
        const slots = config.slots as Record<string, Record<string, Record<string, unknown>>> | undefined;

        if (slots?.entities) {
            for (const slotId of Object.keys(slots.entities)) {
                if (slotId in this.slotEntities) {
                    slots.entities[slotId].entityId = this.slotEntities[slotId];
                } else {
                    delete slots.entities[slotId].entityId;
                }
            }
        }

        if (slots?.actions) {
            for (const [slotId, actionValue] of Object.entries(this.slotActions)) {
                if (slots.actions[slotId]) {
                    slots.actions[slotId].action = actionValue as unknown as string;
                }
            }
        }

        payload.config = config as unknown as MarketplacePrepareResult['config'];
        return payload;
    }

    // =========================================================================
    // Wizard Navigation
    // =========================================================================

    private _getWizardSteps(): DialogStep[] {
        const steps: DialogStep[] = [];
        if (this.entitySlots.length > 0) steps.push('entities');
        if (this.actionSlots.length > 0) steps.push('actions');
        return steps;
    }

    private _advanceToFirstWizardStep(): void {
        const steps = this._getWizardSteps();
        if (steps.length > 0) {
            this.step = steps[0];
        } else {
            void this._handleConfirmDownload();
        }
    }

    private _getStepLabel(): string {
        const steps = this._getWizardSteps();
        const idx = steps.indexOf(this.step);
        return `Step ${idx + 1} of ${steps.length}`;
    }

    // =========================================================================
    // Utilities
    // =========================================================================

    private _formatError(err: unknown): string {
        if (err && typeof err === 'object' && 'message' in err) {
            return String((err as { message?: unknown }).message ?? 'Unexpected error');
        }
        return String(err ?? 'Unexpected error');
    }

    private _resetState(): void {
        this.marketplaceId = '';
        this.loadingInfo = false;
        this.info = null;
        this.error = null;
        this.downloadError = null;
        this.disclaimer = null;
        this.disclaimerLoading = false;
        this.disclaimerError = null;
        this.disclaimerAccepted = false;
        this.disclaimerExpanded = false;
        this.step = 'info';
        this.preparing = false;
        this.confirming = false;
        this.preparedPayload = null;
        this.entitySlots = [];
        this.actionSlots = [];
        this.slotEntities = {};
        this.slotActions = {};
    }

    private async _loadDisclaimer(): Promise<void> {
        if (!this.hass) return;
        this.disclaimerLoading = true;
        this.disclaimerError = null;
        try {
            const service = getAccountService(this.hass);
            this.disclaimer = await service.getMarketplaceDownloadDisclaimer();
        } catch (err) {
            this.disclaimerError = this._formatError(err);
            this.disclaimer = null;
        } finally {
            this.disclaimerLoading = false;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'marketplace-card-download-dialog': MarketplaceCardDownloadDialog;
    }
}
