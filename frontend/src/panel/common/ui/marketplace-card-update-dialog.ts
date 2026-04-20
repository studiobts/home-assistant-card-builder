import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';

import {
    getAccountService,
    type CardData,
    type MarketplaceCardChangelog,
    type MarketplaceCardInfo,
    type MarketplaceDownloadResult,
    type MarketplacePrepareResult,
} from '@/common/api';
import {
    DocumentModel,
    type ActionConfig,
    type ActionSlot,
    type DocumentSlot,
    type DocumentData,
} from '@/common/core/model';
import { migrateDocumentData } from '@/common/core/model/migration';
import { OverlayDialogBase } from '@/panel/common/ui/overlay-dialog-base';
import '@/panel/common/ui/marketplace-slot-configurator';

type DialogStep = 'review' | 'entities' | 'actions';

@customElement('marketplace-card-update-dialog')
export class MarketplaceCardUpdateDialog extends OverlayDialogBase {
    static styles = [
        ...OverlayDialogBase.styles,
        css`
            :host {
                --overlay-dialog-width: min(92vw, 1100px);
                --overlay-dialog-height: min(92vh, 820px);
            }

            .dialog-body {
                padding: 20px;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .section-title {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                color: var(--text-secondary, #666);
                font-weight: 600;
            }

            .meta-row {
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
                font-size: 13px;
                color: var(--text-secondary, #666);
            }

            .select-row {
                display: grid;
                grid-template-columns: 160px 1fr;
                gap: 12px;
                align-items: center;
            }

            .select-row select {
                padding: 8px 10px;
                border-radius: 6px;
                border: 1px solid var(--border-color, #d0d0d0);
                background: var(--bg-primary, #fff);
                font-size: 14px;
                color: var(--text-primary, #333);
                font-family: inherit;
            }

            .preview-compare {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 16px;
            }

            .preview-panel {
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

            .changelog {
                display: grid;
                gap: 12px;
                padding: 12px;
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                background: var(--bg-secondary, #f7f7f7);
            }

            .changelog-entry {
                display: grid;
                gap: 6px;
            }

            .changelog-title {
                font-size: 13px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .changelog-text {
                font-size: 13px;
                color: var(--text-secondary, #666);
                line-height: 1.4;
            }

            .warning-block {
                display: grid;
                gap: 8px;
                padding: 10px 12px;
                border: 1px solid rgba(211, 47, 47, 0.3);
                border-radius: 8px;
                background: rgba(211, 47, 47, 0.08);
            }

            .warning-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--text-primary, #333);
            }

            .warning-checkbox input {
                accent-color: var(--warning-color, #f57c00);
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

    @property({attribute: false})
    hass?: HomeAssistant;

    @property({attribute: false})
    card: CardData | null = null;

    // -- Review step state --
    @state() private changelog: MarketplaceCardChangelog | null = null;
    @state() private currentPreview: MarketplaceCardInfo['preview_images'] = [];
    @state() private targetPreview: MarketplaceCardInfo['preview_images'] = [];
    @state() private loading = false;
    @state() private error: string | null = null;
    @state() private selectedVersion: number | null = null;
    @state() private currentPreviewLoading = false;
    @state() private targetPreviewLoading = false;
    @state() private currentPreviewError: string | null = null;
    @state() private targetPreviewError: string | null = null;
    @state() private confirmReplace = false;

    // -- Wizard state --
    @state() private step: DialogStep = 'review';
    @state() private preparing = false;
    @state() private confirming = false;
    @state() private preparedPayload: MarketplacePrepareResult | null = null;
    @state() private localConfig: DocumentData | null = null;
    @state() private missingEntitySlots: DocumentSlot[] = [];
    @state() private missingActionSlots: ActionSlot[] = [];
    @state() private slotEntities: Record<string, string> = {};
    @state() private slotActions: Record<string, ActionConfig> = {};

    private currentPreviewRequestId = 0;
    private targetPreviewRequestId = 0;
    private _documentModel = new DocumentModel();

    protected get dialogTitle(): string {
        return 'Update marketplace card';
    }

    protected get dialogSubtitle(): string | null {
        if (this.step === 'review') {
            return this.card?.name ? `Update ${this.card.name}` : 'Update downloaded card';
        }
        const steps = this._getWizardSteps();
        const currentIdx = steps.indexOf(this.step);
        return `Step ${currentIdx + 1} of ${steps.length} — Configure new slots`;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if ((changedProps.has('open') && this.open) || (changedProps.has('card') && this.open)) {
            void this._initialize();
        }
    }

    protected renderDialogBody(): TemplateResult {
        switch (this.step) {
            case 'entities':
                return this._renderEntitiesStep();
            case 'actions':
                return this._renderActionsStep();
            default:
                return this._renderReviewStep();
        }
    }

    protected renderDialogFooter(): TemplateResult {
        switch (this.step) {
            case 'entities':
            case 'actions':
                return this._renderWizardFooter();
            default:
                return this._renderReviewFooter();
        }
    }

    // =========================================================================
    // Review Step
    // =========================================================================

    private _renderReviewStep(): TemplateResult {
        if (!this.card) {
            return html`<div class="muted">Select a marketplace card to update.</div>`;
        }

        const currentVersion = this._getCurrentVersion();
        const latestVersion = this.changelog?.latest_version ?? null;
        const versions = this._getAvailableVersions();

        return html`
            ${this.error ? html`<div class="error-banner">${this.error}</div>` : nothing}

            <div class="meta-row">
                <div>Current version: ${currentVersion ?? 'Unknown'}</div>
                <div>Latest version: ${latestVersion ?? 'Unknown'}</div>
            </div>

            <div class="select-row">
                <div class="section-title">Version to download</div>
                <select
                    .value=${this.selectedVersion ? String(this.selectedVersion) : ''}
                    @change=${this._handleVersionChange}
                    ?disabled=${this.loading || this.preparing || versions.length === 0}
                >
                    ${versions.length === 0 ? html`
                        <option value="">No versions available</option>
                    ` : versions.map((version) => html`
                        <option value=${String(version)}>
                            v${version}${version === latestVersion ? ' (latest)' : ''}
                        </option>
                    `)}
                </select>
            </div>

            <div class="preview-compare">
                <div class="preview-panel">
                    <div class="section-title">Current preview</div>
                    ${this._renderPreviewBlock(this.currentPreview, this.currentPreviewLoading, this.currentPreviewError)}
                </div>
                <div class="preview-panel">
                    <div class="section-title">Selected preview</div>
                    ${this._renderPreviewBlock(this.targetPreview, this.targetPreviewLoading, this.targetPreviewError)}
                </div>
            </div>

            <div class="changelog">
                <div class="section-title">Changelog</div>
                ${this._renderChangelog()}
            </div>

            <div class="warning-block">
                <label class="warning-checkbox">
                    <input
                        type="checkbox"
                        ?checked=${this.confirmReplace}
                        @change=${this._handleConfirmChange}
                        ?disabled=${this.preparing || this.loading}
                    />
                    <span>Updating will replace all local changes.</span>
                </label>
            </div>
        `;
    }

    private _renderReviewFooter(): TemplateResult {
        const disabled = this.loading
            || this.preparing
            || !this.card
            || !this.selectedVersion
            || !this.confirmReplace;

        return html`
            <div class="dialog-footer">
                <div class="footer-spacer"></div>
                <button class="secondary-btn" @click=${this.handleClose} ?disabled=${this.preparing}>
                    Cancel
                </button>
                <button class="primary-btn" @click=${this._handlePrepareUpdate} ?disabled=${disabled}>
                    ${this.preparing ? 'Preparing...' : 'Update card'}
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
                <div class="step-title">Configure new entity slots</div>
                <div class="step-meta">${this._getStepLabel()}</div>
            </div>
            ${this.error ? html`<div class="error-banner">${this.error}</div>` : nothing}
            <marketplace-slot-configurator
                .hass=${this.hass}
                .entitySlots=${this.missingEntitySlots}
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
                <div class="step-title">Configure new action slots</div>
                <div class="step-meta">${this._getStepLabel()}</div>
            </div>
            ${this.error ? html`<div class="error-banner">${this.error}</div>` : nothing}
            <marketplace-slot-configurator
                .hass=${this.hass}
                .entitySlots=${[]}
                .actionSlots=${this.missingActionSlots}
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
                    <button class="primary-btn" @click=${this._handleConfirmUpdate} ?disabled=${this.confirming}>
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
    // Shared Rendering
    // =========================================================================

    private _renderPreviewBlock(
        previews: MarketplaceCardInfo['preview_images'],
        loading: boolean,
        error: string | null,
    ): TemplateResult {
        if (loading) {
            return html`<div class="muted">Loading preview...</div>`;
        }
        if (error) {
            return html`<div class="error-banner">${error}</div>`;
        }
        if (!previews?.length) {
            return html`<div class="muted">No previews available.</div>`;
        }
        return html`
            <div class="preview-grid">
                ${previews.map((image, index) => html`
                    <img
                        src=${image.url}
                        alt=${`Preview ${index + 1}`}
                        loading="lazy"
                    />
                `)}
            </div>
        `;
    }

    private _renderChangelog(): TemplateResult {
        const entries = this.changelog?.changelog ?? [];
        if (!entries.length) {
            return html`<div class="muted">No changelog entries available.</div>`;
        }
        return html`
            ${entries.map((entry) => html`
                <div class="changelog-entry">
                    <div class="changelog-title">v${entry.version}</div>
                    ${entry.update_notes ? html`
                        <div class="changelog-text">${entry.update_notes}</div>
                    ` : nothing}
                    ${entry.update_reasons?.length ? html`
                        <div class="changelog-text">Reasons: ${entry.update_reasons.join(', ')}</div>
                    ` : nothing}
                    ${entry.released_at ? html`
                        <div class="changelog-text">Released: ${new Date(entry.released_at).toLocaleDateString()}</div>
                    ` : nothing}
                </div>
            `)}
        `;
    }

    // =========================================================================
    // Handlers
    // =========================================================================

    private _handleVersionChange = (event: Event): void => {
        const target = event.target as HTMLSelectElement | null;
        const value = Number(target?.value);
        if (Number.isNaN(value)) {
            this.selectedVersion = null;
            return;
        }
        this.selectedVersion = value;
        void this._loadTargetPreview(value);
    };

    private _handleConfirmChange = (event: Event): void => {
        const target = event.target as HTMLInputElement | null;
        this.confirmReplace = Boolean(target?.checked);
    };

    private _handlePrepareUpdate = async (): Promise<void> => {
        if (!this.hass || !this.card || !this.selectedVersion) return;
        if (this.preparing || !this.confirmReplace) return;
        this.preparing = true;
        this.error = null;
        try {
            const service = getAccountService(this.hass);
            const result = await service.prepareMarketplaceUpdate(this.card.id, this.selectedVersion);
            this.preparedPayload = result.payload;
            this.localConfig = result.local_config ?? null;
            this._initializeMissingSlots();
            this._advanceToFirstWizardStep();
        } catch (err) {
            this.error = this._formatError(err);
        } finally {
            this.preparing = false;
        }
    };

    private _handleConfirmUpdate = async (): Promise<void> => {
        if (!this.hass || !this.card || !this.preparedPayload) return;
        this.confirming = true;
        this.error = null;
        try {
            const finalPayload = this._applySlotChoicesToPayload();
            const service = getAccountService(this.hass);
            const result = await service.confirmMarketplaceUpdate(this.card.id, finalPayload);
            this.dispatchEvent(new CustomEvent<MarketplaceDownloadResult>('marketplace-update-success', {
                detail: result,
                bubbles: true,
                composed: true,
            }));
            this.handleClose();
        } catch (err) {
            this.error = this._formatError(err);
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
            this.step = 'review';
        } else {
            this.step = steps[currentIdx - 1];
        }
        this.error = null;
    };

    private _handleWizardNext = (): void => {
        const steps = this._getWizardSteps();
        const currentIdx = steps.indexOf(this.step);
        if (currentIdx < steps.length - 1) {
            this.step = steps[currentIdx + 1];
        }
        this.error = null;
    };

    // =========================================================================
    // Slot Merge & Initialization
    // =========================================================================

    private _initializeMissingSlots(): void {
        if (!this.preparedPayload?.config) {
            this.missingEntitySlots = [];
            this.missingActionSlots = [];
            this.slotEntities = {};
            this.slotActions = {};
            return;
        }

        const { config: newMigrated } = migrateDocumentData(this.preparedPayload.config);
        this._documentModel.loadFromConfig(newMigrated);
        const allNewEntitySlots = this._documentModel.getSlotEntities();
        const allNewActionSlots = this._documentModel.getSlotActions();

        // Get local slot IDs
        const localEntityIds = new Set<string>();
        const localActionIds = new Set<string>();
        if (this.localConfig) {
            const { config: localMigrated } = migrateDocumentData(this.localConfig);
            const localModel = new DocumentModel();
            localModel.loadFromConfig(localMigrated);
            for (const slot of localModel.getSlotEntities()) {
                localEntityIds.add(slot.id);
            }
            for (const slot of localModel.getSlotActions()) {
                localActionIds.add(slot.id);
            }
        }

        // Merge: for slots that exist in both local and new, carry over local values into the payload config
        const newConfig = JSON.parse(JSON.stringify(this.preparedPayload.config)) as Record<string, unknown>;
        const newSlots = newConfig.slots as Record<string, Record<string, Record<string, unknown>>> | undefined;

        if (newSlots?.entities && this.localConfig) {
            const localSlots = (this.localConfig as unknown as Record<string, unknown>).slots as Record<string, Record<string, Record<string, unknown>>> | undefined;
            if (localSlots?.entities) {
                for (const slotId of Object.keys(newSlots.entities)) {
                    if (localEntityIds.has(slotId) && localSlots.entities[slotId]) {
                        const localEntityId = localSlots.entities[slotId].entityId;
                        if (typeof localEntityId === 'string' || localEntityId === undefined) {
                            newSlots.entities[slotId].entityId = localEntityId as string;
                        }
                    }
                }
            }
        }

        if (newSlots?.actions && this.localConfig) {
            const localSlots = (this.localConfig as unknown as Record<string, unknown>).slots as Record<string, Record<string, Record<string, unknown>>> | undefined;
            if (localSlots?.actions) {
                for (const slotId of Object.keys(newSlots.actions)) {
                    if (localActionIds.has(slotId) && localSlots.actions[slotId]) {
                        const localAction = localSlots.actions[slotId];
                        if (localAction.trigger) {
                            newSlots.actions[slotId].trigger = localAction.trigger;
                        }
                        if (localAction.action) {
                            newSlots.actions[slotId].action = JSON.parse(JSON.stringify(localAction.action));
                        }
                    }
                }
            }
        }

        // Store the merged config back
        this.preparedPayload = { ...this.preparedPayload, config: newConfig as unknown as MarketplacePrepareResult['config'] };

        // Filter missing slots: those in new config but NOT in local
        this.missingEntitySlots = allNewEntitySlots.filter(slot => !localEntityIds.has(slot.id));
        this.missingActionSlots = allNewActionSlots.filter(slot => !localActionIds.has(slot.id));

        // Pre-fill missing entity slots (validate existence)
        const entities: Record<string, string> = {};
        for (const slot of this.missingEntitySlots) {
            if (slot.entityId?.trim()) {
                const entityId = slot.entityId.trim();
                if (this.hass?.states?.[entityId]) {
                    entities[slot.id] = entityId;
                }
            }
        }
        this.slotEntities = entities;

        // Pre-fill missing action slots
        const actions: Record<string, ActionConfig> = {};
        for (const slot of this.missingActionSlots) {
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

        // Apply user choices for missing entity slots
        if (slots?.entities) {
            for (const slot of this.missingEntitySlots) {
                if (slots.entities[slot.id]) {
                    if (slot.id in this.slotEntities) {
                        slots.entities[slot.id].entityId = this.slotEntities[slot.id];
                    } else {
                        delete slots.entities[slot.id].entityId;
                    }
                }
            }
        }

        // Apply user choices for missing action slots
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
        if (this.missingEntitySlots.length > 0) steps.push('entities');
        if (this.missingActionSlots.length > 0) steps.push('actions');
        return steps;
    }

    private _advanceToFirstWizardStep(): void {
        const steps = this._getWizardSteps();
        if (steps.length > 0) {
            this.step = steps[0];
        } else {
            // No missing slots — confirm immediately
            void this._handleConfirmUpdate();
        }
    }

    private _getStepLabel(): string {
        const steps = this._getWizardSteps();
        const idx = steps.indexOf(this.step);
        return `Step ${idx + 1} of ${steps.length}`;
    }

    // =========================================================================
    // Version / Preview helpers (unchanged from original)
    // =========================================================================

    private _getAvailableVersions(): number[] {
        const changelogVersions = this.changelog?.changelog?.map((entry) => entry.version) ?? [];
        if (changelogVersions.length > 0) {
            return changelogVersions;
        }
        const latest = this.changelog?.latest_version;
        return typeof latest === 'number' ? [latest] : [];
    }

    private _getCurrentVersion(): number | null {
        return typeof this.card?.marketplace_download_version === 'number'
            ? this.card.marketplace_download_version
            : null;
    }

    private async _initialize(): Promise<void> {
        if (!this.hass || !this.card || !this.card.marketplace_id) return;

        this.loading = true;
        this.error = null;
        this.changelog = null;
        this.selectedVersion = null;
        this.confirmReplace = false;
        this.currentPreview = [];
        this.targetPreview = [];
        this.currentPreviewError = null;
        this.targetPreviewError = null;
        this.currentPreviewLoading = false;
        this.targetPreviewLoading = false;
        this.step = 'review';
        this.preparing = false;
        this.confirming = false;
        this.preparedPayload = null;
        this.localConfig = null;
        this.missingEntitySlots = [];
        this.missingActionSlots = [];
        this.slotEntities = {};
        this.slotActions = {};

        try {
            const service = getAccountService(this.hass);
            this.changelog = await service.getMarketplaceCardChangelog(this.card.marketplace_id);
            const latest = this.changelog?.latest_version;
            if (typeof latest === 'number') {
                this.selectedVersion = latest;
            } else {
                const versions = this._getAvailableVersions();
                this.selectedVersion = versions.length ? versions[0] : null;
            }

            await Promise.all([
                this._loadCurrentPreview(),
                this.selectedVersion ? this._loadTargetPreview(this.selectedVersion) : Promise.resolve(),
            ]);
        } catch (err) {
            this.error = this._formatError(err);
        } finally {
            this.loading = false;
        }
    }

    private async _loadCurrentPreview(): Promise<void> {
        if (!this.hass || !this.card?.marketplace_id) return;
        const currentVersion = this._getCurrentVersion();
        if (!currentVersion) return;
        const requestId = ++this.currentPreviewRequestId;
        this.currentPreviewLoading = true;
        this.currentPreviewError = null;
        try {
            const service = getAccountService(this.hass);
            const info = await service.getMarketplaceCardInfo(this.card.marketplace_id, currentVersion);
            if (requestId !== this.currentPreviewRequestId) return;
            this.currentPreview = info.preview_images ?? [];
        } catch (err) {
            if (requestId !== this.currentPreviewRequestId) return;
            this.currentPreviewError = this._formatError(err);
            this.currentPreview = [];
        } finally {
            if (requestId === this.currentPreviewRequestId) {
                this.currentPreviewLoading = false;
            }
        }
    }

    private async _loadTargetPreview(version: number): Promise<void> {
        if (!this.hass || !this.card?.marketplace_id) return;
        const requestId = ++this.targetPreviewRequestId;
        this.targetPreviewLoading = true;
        this.targetPreviewError = null;
        try {
            const service = getAccountService(this.hass);
            const info = await service.getMarketplaceCardInfo(this.card.marketplace_id, version);
            if (requestId !== this.targetPreviewRequestId) return;
            this.targetPreview = info.preview_images ?? [];
        } catch (err) {
            if (requestId !== this.targetPreviewRequestId) return;
            this.targetPreviewError = this._formatError(err);
            this.targetPreview = [];
        } finally {
            if (requestId === this.targetPreviewRequestId) {
                this.targetPreviewLoading = false;
            }
        }
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
}

declare global {
    interface HTMLElementTagNameMap {
        'marketplace-card-update-dialog': MarketplaceCardUpdateDialog;
    }
}
