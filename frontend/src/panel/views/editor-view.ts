import { getAccountService, getCardsService, type UpdateCardInput } from '@/common/api';
import { type BlockChangeDetail } from "@/common/core/model";
import { blockRegistry } from '@/common/blocks/core/registry/block-registry';
import { migrateDocumentData, needsDocumentMigration } from '@/common/core/model/migration';
import { DOCUMENT_MODEL_VERSION, type DocumentData } from "@/common/core/model/types";
import type { HomeAssistant } from 'custom-card-helpers';
import type { BuilderMain } from '@/panel/designer/core/builder-main';
import '@/panel/designer/main';
import type { ShareCardDetail } from '@/panel/common/ui/marketplace-card-share-dialog';
import '@/panel/common/ui/marketplace-card-share-dialog';
import { getRouter, ROUTES } from '@/panel/router';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

/**
 * Editor view - wrapper for builder-main with load/save functionality
 */
@customElement('editor-view')
export class EditorView extends LitElement {
    static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--primary-background-color);
    }

    .editor-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: var(--card-background-color);
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .back-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      border-radius: 4px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .back-button:hover {
      background-color: var(--secondary-background-color);
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .name-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      font-weight: 500;
      font-family: inherit;
      min-width: 200px;
    }

    .name-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .name-input.dirty {
      border-color: var(--warning-color);
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .save-button {
      padding: 12px 20px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .save-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .save-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .share-button {
      padding: 7px 16px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .share-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .share-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      border-radius: 4px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      background-color: var(--secondary-background-color);
    }

    .dirty-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--warning-color);
    }

    .builder-container {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    builder-main {
      width: 100%;
      height: 100%;
    }

    /* Loading State */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .loading-content {
      background: var(--card-background-color);
      padding: 32px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .migration-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 110;
    }

    .migration-content {
      background: var(--card-background-color);
      padding: 28px;
      border-radius: 10px;
      max-width: 520px;
      width: 90%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .migration-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0;
    }

    .migration-text {
      color: var(--primary-text-color);
      line-height: 1.5;
      font-size: 14px;
    }

    .migration-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .migration-version {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      color: var(--primary-text-color);
      font-size: 14px;
    }

    /* Error Message */
    .error-banner {
      background: var(--error-color);
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .error-text {
      flex: 1;
    }

    .dismiss-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 14px;
      text-decoration: underline;
    }

    /* Confirm Dialog */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      font-size: 20px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin: 0 0 16px 0;
    }

    .dialog-content {
      color: var(--primary-text-color);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .secondary-button {
      padding: 10px 20px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
    }

    .secondary-button:hover {
      opacity: 0.8;
    }

    .primary-button {
      padding: 10px 20px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
    }

    .primary-button:hover {
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .editor-header {
        flex-wrap: wrap;
      }

      .name-input {
        min-width: 150px;
        font-size: 14px;
      }
    }
  `;
    @property({attribute: false})
    hass?: HomeAssistant;
    @property({type: String})
    cardId?: string; // undefined = new card, string = edit existing card
    @state()
    private cardName = 'Untitled Card';
    @state()
    private cardDescription = '';
    @state()
    private loading = false;
    @state()
    private saving = false;
    @state()
    private isDirty = false;
    @state()
    private migrationRequired = false;
    @state()
    private migrationInProgress = false;
    @state()
    private error: string | null = null;
    @state()
    private accountConnected = false;
    @state()
    private shareDialogOpen = false;
    @state()
    private sharing = false;
    @state()
    private shareError: string | null = null;
    @state()
    private marketplaceShared = false;
    @state()
    private localCardVersion: number | null = null;
    @state()
    private marketplaceSharedVersion: number | null = null;
    @state()
    private marketplaceVersionLoading = false;
    private marketplaceDownloaded = false;
    private marketplaceId: string | null = null;
    @state()
    private shareDialogConfig: DocumentData | null = null;

    // FIXME: builderRef is too complicated, simplify with ref() or move provide directives here
    @query('builder-main')
    private builderRef?: BuilderMain;

    private accountService?: ReturnType<typeof getAccountService>
    private cardsService?: ReturnType<typeof getCardsService>;
    private router = getRouter();
    private configChangeListener?: EventListener;
    private pendingMigrationConfig: DocumentData | null = null;
    private accountLoaded = false;
    private cardMeta: Record<string, unknown> | null = null;
    private marketplaceVersionRequestId = 0;

    connectedCallback(): void {
        super.connectedCallback();
        if (this.hass) {
            this.accountService = getAccountService(this.hass);
            if (!this.accountLoaded) {
                this.accountLoaded = true;
                void this._loadAccountStatus();
            }
            this.cardsService = getCardsService(this.hass);
            this.cardId ?
                this._loadCard() :
                this._clearDocumentModel();
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.configChangeListener && this.builderRef) {
            this.builderRef.removeEventListener('config-changed', this.configChangeListener);
        }

        this._clearDocumentModel();
    }

    updated(changedProps: Map<string, any>): void {
        if (changedProps.has('hass') && this.hass && !this.cardsService) {
            this.cardsService = getCardsService(this.hass);
            if (this.cardId) {
                this._loadCard();
            }
        }
        if (changedProps.has('hass') && this.hass && !this.accountService) {
            this.accountService = getAccountService(this.hass);
            this.accountLoaded = true;
            void this._loadAccountStatus();
        }

        if (changedProps.has('cardId')) {
            if (this.cardId) {
                this._loadCard();
            } else {
                // Reset for new card
                this.cardName = 'Untitled Card';
                this.cardDescription = '';
                this.isDirty = false;
                this.migrationRequired = false;
                this.pendingMigrationConfig = null;
                this.marketplaceShared = false;
                this.marketplaceDownloaded = false;
                this.localCardVersion = null;
                this.marketplaceSharedVersion = null;
                this.marketplaceVersionLoading = false;
                this.marketplaceId = null;
                this.cardMeta = null;
                // Clear document model for new card
                this._clearDocumentModel();
            }
        }
    }

    firstUpdated(): void {
        // Listen to config changes from builder
        this.configChangeListener = ((evt: CustomEvent<BlockChangeDetail>) => {
            if (evt.detail.action !== 'load') {
                this._markDirty()
            }
        }) as EventListener;

        if (this.builderRef) {
            this.builderRef.addEventListener('config-changed', this.configChangeListener);
        }
    }

    render() {
        return html`
      ${this.error ? this._renderError() : ''}
      ${this._renderHeader()}
      <div class="builder-container">
        <builder-main
          .theme=${this._getTheme()}
          .hass=${this.hass}
        ></builder-main>
        ${this.loading ? this._renderLoading() : ''}
        ${this.migrationRequired ? this._renderMigrationOverlay() : ''}
      </div>
      <marketplace-card-share-dialog
        .open=${this.shareDialogOpen}
        .hass=${this.hass}
        .cardId=${this.cardId ?? ''}
        .cardName=${this.cardName}
        .description=${this.cardDescription}
        .cardConfig=${this.shareDialogConfig ?? undefined}
        .shared=${this.marketplaceShared}
        .busy=${this.sharing}
        .error=${this.shareError}
        @overlay-close=${this._closeShareDialog}
        @share-confirm=${this._handleShareConfirm}
      ></marketplace-card-share-dialog>
    `;
    }

    private _renderHeader() {
        const shareDisabledReason = this._getShareDisabledReason();
        const shareDisabled = Boolean(shareDisabledReason) || this.sharing;
        const shareTitle = shareDisabledReason
            ?? (this.marketplaceShared ? 'Upload a new version to the marketplace' : 'Share the card to marketplace');
        const shareLabel = this.marketplaceShared ? 'Share Update' : 'Share Card';

        return html`
      <div class="editor-header">
        <button class="back-button" @click=${this._handleBack} title="Back to cards">
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>

        <input type="text"
          class="name-input ${this.isDirty ? 'dirty' : ''}"
          .value=${this.cardName}
          @input=${this._handleNameChange}
          placeholder="Card name"
          ?disabled=${this.migrationRequired}
        />

        <div class="header-actions">
          ${this.isDirty ? html`<div class="dirty-indicator" title="Unsaved changes"></div>` : ''}
          
          <button
            class="save-button"
            @click=${this._handleSave}
            ?disabled=${this.saving || !this.isDirty || this.migrationRequired}
          >
            ${this.saving ? html`
              <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            ` : ''}
            ${this.saving ? 'Saving...' : 'Save'}
          </button>

          <button
            class="share-button"
            @click=${this._handleShare}
            ?disabled=${shareDisabled}
            title=${shareTitle}
          >
            <ha-icon icon="mdi:cloud-upload"></ha-icon>
            ${this.sharing ? 'Uploading...' : shareLabel}
          </button>

          <button
            class="close-button"
            @click=${this._handleClose}
            title="Close"
          >
              <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
      </div>
    `;
    }

    private _renderError() {
        return html`
      <div class="error-banner">
        <div class="error-text">
          <strong>Error:</strong> ${this.error}
        </div>
        <button class="dismiss-button" @click=${() => this.error = null}>
          Dismiss
        </button>
      </div>
    `;
    }

    private _renderLoading() {
        return html`
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <div class="loading-text">Loading card...</div>
        </div>
      </div>
    `;
    }

    private _renderMigrationOverlay() {
        return html`
      <div class="migration-overlay">
        <div class="migration-content">
          <h3 class="migration-title">Migration Required</h3>
          <div class="migration-text">
            This card uses an older data format and must be migrated before it can be edited.
          </div>
          <div class="migration-version">
            Current version: v${this.pendingMigrationConfig!.version || 'unknown'} -> Target version: v${DOCUMENT_MODEL_VERSION}
          </div>
          <div class="migration-actions">
            <button
              class="primary-button"
              @click=${this._handleMigrateCard}
              ?disabled=${this.migrationInProgress}
            >
              ${this.migrationInProgress ? 'Migrating...' : 'Migrate Card'}
            </button>
          </div>
        </div>
      </div>
    `;
    }

    private _getTheme(): 'light' | 'dark' {
        return this.hass?.themes?.darkMode ? 'dark' : 'light';
    }

    private async _loadAccountStatus(): Promise<void> {
        if (!this.hass) return;
        try {
            const service = getAccountService(this.hass);
            await service.getAccount();
            this.accountConnected = true;
            if (this.marketplaceShared && this.marketplaceId) {
                void this._refreshMarketplaceSharedVersion();
            }
        } catch {
            this.accountConnected = false;
        }
    }

    private async _loadCard(): Promise<void> {
        if (!this.cardId || !this.cardsService) return;

        this.loading = true;
        this.error = null;
        this.migrationRequired = false;
        this.pendingMigrationConfig = null;

        try {
            const card = await this.cardsService.getCard(this.cardId);
            if (card) {
                this.cardName = card.name;
                this.cardDescription = card.description;
                this.localCardVersion = typeof card.version === 'number' ? card.version : null;
                this.marketplaceDownloaded = Boolean(card.marketplace_download);
                this.marketplaceId = typeof card.marketplace_id === 'string' && card.marketplace_id.trim()
                    ? card.marketplace_id.trim()
                    : null;
                this.marketplaceShared = Boolean(this.marketplaceId) && !this.marketplaceDownloaded;
                this.marketplaceSharedVersion = null;
                this.marketplaceVersionLoading = false;
                this.cardMeta = card.meta ?? null;
                this.isDirty = false;

                if (this.marketplaceShared && this.accountConnected) {
                    void this._refreshMarketplaceSharedVersion();
                }

                if (needsDocumentMigration(card.config)) {
                    this.migrationRequired = true;
                    this.pendingMigrationConfig = card.config;
                    this._clearDocumentModel();
                    return;
                }

                // Load config into builder
                await this.updateComplete;
                if (this.builderRef && typeof (this.builderRef as any).loadConfig === 'function') {
                    (this.builderRef as any).loadConfig(card.config);
                }
            } else {
                this.error = 'Card not found';
                this.router.navigate(ROUTES.CARDS);
            }
        } catch (err) {
            console.error('Failed to load card:', err);
            this.error = 'Failed to load card. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    private async _handleMigrateCard(): Promise<void> {
        if (!this.cardId || !this.cardsService || !this.pendingMigrationConfig) return;

        this.migrationInProgress = true;
        this.error = null;

        try {
            const {config} = migrateDocumentData(this.pendingMigrationConfig);
            await this.cardsService.updateCard(this.cardId, {
                config,
                min_builder_version: blockRegistry.getRequiredBuilderVersionForDocument(config),
            });
            this.migrationRequired = false;
            this.pendingMigrationConfig = null;
            await this._loadCard();
        } catch (err) {
            console.error('Failed to migrate card:', err);
            this.error = 'Failed to migrate card. Please try again.';
        } finally {
            this.migrationInProgress = false;
        }
    }

    private async _handleSave(): Promise<void> {
        if (!this.cardsService || this.saving || this.migrationRequired) return;

        this.saving = true;
        this.error = null;

        try {
            const config = this._getConfigFromBuilder();
            const minBuilderVersion = blockRegistry.getRequiredBuilderVersionForDocument(config);

            if (this.cardId) {
                // Update existing card
                const updatedCard = await this.cardsService.updateCard(this.cardId, {
                    name: this.cardName,
                    description: this.cardDescription,
                    config,
                    min_builder_version: minBuilderVersion,
                });
                this.localCardVersion = typeof updatedCard?.version === 'number'
                    ? updatedCard.version
                    : this.localCardVersion;
            } else {
                // Create new card
                const newCard = await this.cardsService.createCard({
                    name: this.cardName,
                    description: this.cardDescription,
                    config,
                    min_builder_version: minBuilderVersion,
                    source: 'local',
                    author: this.hass?.user?.name ?? '',
                });
                // Update URL with new ID (without reload)
                this.router.navigate(ROUTES.EDITOR_EDIT, {id: newCard.id});
                this.cardId = newCard.id;
                this.localCardVersion = typeof newCard?.version === 'number'
                    ? newCard.version
                    : this.localCardVersion;
            }

            this.isDirty = false;
        } catch (err) {
            console.error('Failed to save card:', err);
            this.error = 'Failed to save card. Please try again.';
        } finally {
            this.saving = false;
        }
    }

    private _getShareDisabledReason(): string | null {
        if (!this.accountConnected) {
            return 'Create an account to share in the marketplace.';
        }
        if (!this.cardId) {
            return 'Save the card before sharing.';
        }
        if (this.marketplaceDownloaded) {
            return 'This card was downloaded from the marketplace and cannot be updated.';
        }
        if (this.isDirty) {
            return 'Save your changes before sharing.';
        }
        if (this.migrationRequired) {
            return 'Complete the migration before sharing.';
        }
        if (this.saving || this.loading) {
            return 'Please wait until the card is saved.';
        }
        if (this.marketplaceShared) {
            if (this.marketplaceVersionLoading) {
                return 'Checking marketplace version...';
            }
            if (typeof this.localCardVersion !== 'number') {
                return 'Unable to determine local card version.';
            }
            if (typeof this.marketplaceSharedVersion !== 'number') {
                return 'Unable to verify marketplace version.';
            }
            if (this.localCardVersion === this.marketplaceSharedVersion) {
                return `No updates to upload (v${this.localCardVersion}).`;
            }
            if (this.localCardVersion < this.marketplaceSharedVersion) {
                return `Local version is behind marketplace (local v${this.localCardVersion}, marketplace v${this.marketplaceSharedVersion}).`;
            }
        }
        return null;
    }

    private async _refreshMarketplaceSharedVersion(): Promise<void> {
        if (!this.accountService || !this.accountConnected || !this.cardId || !this.marketplaceShared) {
            this.marketplaceSharedVersion = null;
            this.marketplaceVersionLoading = false;
            return;
        }

        const requestId = ++this.marketplaceVersionRequestId;
        this.marketplaceVersionLoading = true;
        try {
            const response = await this.accountService.listMarketplaceCardsShared({
                local_ids: [this.cardId],
                per_page: 1,
            });
            if (requestId !== this.marketplaceVersionRequestId) return;

            const entry = (response?.data ?? []).find((item) => item?.id === this.marketplaceId)
                ?? response?.data?.[0];
            this.marketplaceSharedVersion = typeof entry?.version === 'number' ? entry.version : null;
        } catch (err) {
            if (requestId !== this.marketplaceVersionRequestId) return;
            console.error('Failed to load marketplace shared version:', err);
            this.marketplaceSharedVersion = null;
        } finally {
            if (requestId === this.marketplaceVersionRequestId) {
                this.marketplaceVersionLoading = false;
            }
        }
    }

    private _handleShare = (): void => {
        if (this._getShareDisabledReason() || this.sharing) return;
        this.shareError = null;
        this.shareDialogConfig = this._getConfigFromBuilder();
        this.shareDialogOpen = true;
    };

    private _closeShareDialog = (): void => {
        if (this.sharing) return;
        this.shareDialogOpen = false;
        this.shareError = null;
        this.shareDialogConfig = null;
    };

    private _buildMarketplaceMeta(updateNotes: string, updateReasons: number[]): Record<string, unknown> | null {
        if (!updateNotes && updateReasons.length === 0) return this.cardMeta ?? null;
        const base = this.cardMeta && typeof this.cardMeta === 'object' ? this.cardMeta : {};
        return {
            ...base,
            marketplace_update: {
                notes: updateNotes || undefined,
                reasons: updateReasons.length ? updateReasons : undefined,
            },
        };
    }

    private async _handleShareConfirm(e: CustomEvent<ShareCardDetail>): Promise<void> {
        if (!this.accountService || !this.cardsService || !this.cardId || this.sharing) return;
        const detail = e.detail || {};
        const description = typeof detail.description === 'string' ? detail.description.trim() : '';
        const updateNotes = typeof detail.updateNotes === 'string' ? detail.updateNotes.trim() : '';
        const updateReasons = Array.isArray(detail.updateReasons)
            ? detail.updateReasons
                .map((item) => {
                    if (typeof item === 'number' && Number.isFinite(item)) return item;
                    if (typeof item === 'string' && item.trim().match(/^\d+$/)) return Number(item.trim());
                    return null;
                })
                .filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
            : [];
        const categoryIds = Array.isArray(detail.categoryIds)
            ? detail.categoryIds.filter((item) => typeof item === 'string' && item.trim())
            : null;
        const screens = Array.isArray(detail.screens)
            ? detail.screens.filter((screen) => screen && typeof screen.containerId === 'string' && typeof screen.dataUrl === 'string')
            : null;

        this.sharing = true;
        this.shareError = null;

        try {
            const updatePayload: UpdateCardInput = {};
            let shouldUpdate = false;
            const nextDescription = description && description !== this.cardDescription ? description : null;
            const nextMeta = this.marketplaceShared
                ? this._buildMarketplaceMeta(updateNotes, updateReasons)
                : null;
            const nextCategories = !this.marketplaceShared && categoryIds ? categoryIds : null;

            if (nextDescription) {
                updatePayload.description = nextDescription;
                shouldUpdate = true;
            }

            if (nextMeta && JSON.stringify(nextMeta) !== JSON.stringify(this.cardMeta ?? {})) {
                updatePayload.meta = nextMeta;
                shouldUpdate = true;
            }

            if (nextCategories) {
                updatePayload.categories = nextCategories;
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                const updatedCard = await this.cardsService.updateCard(this.cardId, updatePayload);
                this.localCardVersion = typeof updatedCard?.version === 'number'
                    ? updatedCard.version
                    : this.localCardVersion;
                if (nextDescription) {
                    this.cardDescription = nextDescription;
                }
                if (updatePayload.meta) {
                    this.cardMeta = updatePayload.meta;
                }
            }

            const uploadResponse = await this.accountService.uploadMarketplaceCard(this.cardId, {
                screens: screens
                    ? screens.map((screen) => ({
                        container_id: screen.containerId,
                        data_url: screen.dataUrl,
                        width: screen.width,
                        height: screen.height,
                        card_width_percent: screen.cardWidthPercent,
                        card_scale: screen.cardScale,
                    }))
                    : undefined,
                updateNotes: this.marketplaceShared && updateNotes ? updateNotes : undefined,
                updateReasons: this.marketplaceShared && updateReasons.length ? updateReasons : undefined,
            });

            if (!this.marketplaceShared) {
                this.marketplaceId = uploadResponse['marketplace_id'] as string;
                this.marketplaceShared = true;
                this.marketplaceDownloaded = false;
            }

            if (typeof this.localCardVersion === 'number') {
                this.marketplaceSharedVersion = this.localCardVersion;
            } else if (this.marketplaceShared && this.marketplaceId) {
                void this._refreshMarketplaceSharedVersion();
            }

            this.shareDialogOpen = false;
            this.shareDialogConfig = null;
        } catch (err) {
            console.error('Failed to share card:', err);
            this.shareError = this._getErrorMessage(err);
        } finally {
            this.sharing = false;
        }
    }

    private _getConfigFromBuilder(): DocumentData {
        if (this.builderRef && typeof (this.builderRef as any).exportConfig === 'function') {
            return (this.builderRef as any).exportConfig();
        }
        // Fallback to empty config
        return {};
    }

    private _handleNameChange(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.cardName = input.value;
        this._markDirty();
    }

    private _markDirty(): void {
        if (!this.isDirty) {
            this.isDirty = true;
        }
    }

    private _handleBack(): void {
        if (this.isDirty) {
            this._showUnsavedChangesDialog();
        } else {
            this.router.navigate(ROUTES.CARDS);
        }
    }

    private _handleClose(): void {
        if (this.isDirty) {
            this._showUnsavedChangesDialog();
        } else {
            this.router.navigate(ROUTES.CARDS);
        }
    }

    private _showUnsavedChangesDialog(): void {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        if (confirm(message)) {
            this.router.navigate(ROUTES.CARDS);
        }
    }

    private _clearDocumentModel(): void {
        if (this.builderRef && typeof (this.builderRef as any).clearDocument === 'function') {
            (this.builderRef as any).clearDocument();
        }
    }

    private _getErrorMessage(err: unknown): string {
        if (!err) return 'Operation failed.';
        if (typeof err === 'string') return err;
        if (typeof err === 'object') {
            const maybe = err as {message?: string; code?: string};
            if (maybe.message) return maybe.message;
            if (maybe.code) return maybe.code;
        }
        return 'Operation failed.';
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'editor-view': EditorView;
    }
}
