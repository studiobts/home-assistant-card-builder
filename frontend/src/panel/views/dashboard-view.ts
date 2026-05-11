import { type CardData, getAccountService, getCardsService } from '@/common/api';
import { shouldShowIntegrationOutdatedNotice, subscribeIntegrationOutdatedChange } from '@/common/api/integration-outdated';
import { hasRuntimeToken, subscribeRuntimeConfigChange } from '@/common/api/runtime-config';
import type { HomeAssistant } from 'custom-card-helpers';
import { getRouter, ROUTES } from '@/panel/router';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@/panel/common/ui/marketplace-card-download-dialog';
import '@/panel/common/ui/marketplace-featured-cards-carousel';
import type {
    MarketplaceFeaturedCardDownloadDetail,
} from '@/panel/common/ui/marketplace-featured-cards-carousel';

/**
 * Dashboard view - main overview page with statistics and quick actions
 */
@customElement('dashboard-view')
export class DashboardView extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 24px;
            background-color: var(--primary-background-color);
            min-height: 100%;
        }

        .dashboard-header {
            margin-bottom: 32px;
        }

        .integration-outdated-banner {
            background: rgba(245, 159, 0, 0.15);
            border: 1px solid rgba(245, 159, 0, 0.4);
            color: var(--primary-text-color);
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.5;
        }

        .dashboard-title {
            font-size: 32px;
            font-weight: 300;
            color: var(--primary-text-color);
            margin: 0 0 8px 0;
        }

        .dashboard-subtitle {
            font-size: 14px;
            color: var(--secondary-text-color);
            margin: 0;
        }

        /* Stats Grid */

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: var(--card-background-color);
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .stat-label {
            font-size: 14px;
            color: var(--secondary-text-color);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 36px;
            font-weight: 300;
            color: var(--primary-text-color);
            margin: 0;
        }

        .stat-subtitle {
            font-size: 12px;
            color: var(--secondary-text-color);
            margin-top: 8px;
        }

        /* Quick Actions */

        .quick-actions {
            background: var(--card-background-color);
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        .section-title {
            font-size: 18px;
            font-weight: 500;
            color: var(--primary-text-color);
            margin: 0 0 16px 0;
        }

        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            --mdc-icon-size: 36px;
        }

        .action-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            justify-content: center;
            padding: 32px 16px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease;
            text-decoration: none;
            font-family: inherit;
        }

        .action-button:hover {
            transform: scale(1.05);
            opacity: 0.9;
        }

        .action-button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
        }

        .action-button.secondary {
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
        }

        .action-button.marketplace-highlight {
            background: var(--accent-color, var(--primary-color));
            color: var(--text-primary-color, white);
        }

        .action-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 12px;
        }

        .action-label {
            font-size: 16px;
            font-weight: 500;
        }

        /* Recent Cards */

        .recent-cards {
            background: var(--card-background-color);
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        .cards-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .card-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid var(--divider-color);
            transition: background-color 0.2s ease;
        }

        .card-item:last-child {
            border-bottom: none;
        }

        .card-info {
            flex: 1;
            min-width: 0;
        }

        .card-name {
            font-size: 16px;
            font-weight: 500;
            color: var(--primary-text-color);
            margin: 0 0 4px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .card-name:hover {
            text-decoration: underline;
            cursor: pointer;
            color: var(--primary-color);
        }

        .card-meta {
            font-size: 12px;
            color: var(--secondary-text-color);
        }

        .card-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
        }

        .icon-button {
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

        .icon-button:hover {
            background-color: var(--secondary-background-color);
        }

        .icon-button.delete {
            color: var(--error-color);
        }

        .icon {
            width: 20px;
            height: 20px;
        }

        /* Loading State */

        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 64px 16px;
            color: var(--secondary-text-color);
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--divider-color);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Empty State */

        .empty-state {
            text-align: center;
            padding: 64px 16px;
            color: var(--secondary-text-color);
        }

        .empty-state ha-icon {
            --mdc-icon-size: 64px;
            margin-bottom: 10px;
            opacity: 0.3;
        }

        .empty-state-title {
            font-size: 20px;
            color: var(--primary-text-color);
            margin: 0 0 8px 0;
        }

        .empty-state-text {
            font-size: 14px;
            margin: 0 0 24px 0;
        }

        /* Error State */

        .error-message {
            background: var(--error-color);
            color: white;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
        }

        @media (max-width: 768px) {
            :host {
                padding: 16px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .actions-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    @property({attribute: false})
    hass?: HomeAssistant;

    @state()
    private cards: CardData[] = [];

    @state()
    private loading = true;

    @state()
    private error: string | null = null;

    @state()
    private showIntegrationUpdateNotice = false;

    @state()
    private marketplaceDialogOpen = false;

    @state()
    private selectedMarketplaceId = '';

    @state()
    private marketplaceBrowseUrl: string | null = null;

    private accountService?: ReturnType<typeof getAccountService>;
    private cardsService?: ReturnType<typeof getCardsService>;

    private unsubscribe?: () => void;
    private unsubscribeIntegrationOutdated?: () => void;
    private unsubscribeRuntimeConfig?: () => void;

    private router = getRouter();

    connectedCallback(): void {
        super.connectedCallback();
        if (this.hass) {
            this.accountService = getAccountService(this.hass);
            this.cardsService = getCardsService(this.hass);
            this._loadCards();
            this._subscribeToUpdates();
            this._loadMarketplaceBrowseUrl();
        }
        this._syncIntegrationOutdatedNotice();
        this.unsubscribeIntegrationOutdated = subscribeIntegrationOutdatedChange(() => {
            this._syncIntegrationOutdatedNotice();
        });
        this.unsubscribeRuntimeConfig = subscribeRuntimeConfigChange(() => {
            this._syncIntegrationOutdatedNotice();
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.unsubscribeIntegrationOutdated) {
            this.unsubscribeIntegrationOutdated();
            this.unsubscribeIntegrationOutdated = undefined;
        }
        if (this.unsubscribeRuntimeConfig) {
            this.unsubscribeRuntimeConfig();
            this.unsubscribeRuntimeConfig = undefined;
        }
    }

    updated(changedProps: Map<string, any>): void {
        if (changedProps.has('hass') && this.hass && !this.cardsService) {
            this.accountService = getAccountService(this.hass);
            this.cardsService = getCardsService(this.hass);
            this._loadCards();
            this._subscribeToUpdates();
            this._loadMarketplaceBrowseUrl();
        }
    }

    render() {
        if (this.loading) {
            return this._renderLoading();
        }

        if (this.error) {
            return this._renderError();
        }

        const stats = this._getStats();

        return html`
            ${this.showIntegrationUpdateNotice ? html`
                <div class="integration-outdated-banner">
                    Your Card Builder integration is out of date. To connect your account correctly,
                    update the custom integration to the latest available version.
                </div>
            ` : nothing}
            <div class="dashboard-header">
                <h1 class="dashboard-title">Card Builder Dashboard</h1>
                <p class="dashboard-subtitle">Manage and create your custom cards</p>
            </div>

            ${this._renderStats(stats)}
            ${this._renderQuickActions()}
            <marketplace-featured-cards-carousel
                .hass=${this.hass}
                @marketplace-featured-card-download=${this._handleFeaturedMarketplaceDownload}
            ></marketplace-featured-cards-carousel>
            ${this._renderRecentCards()}
            <marketplace-card-download-dialog
                .open=${this.marketplaceDialogOpen}
                .hass=${this.hass}
                .initialMarketplaceId=${this.selectedMarketplaceId}
                @overlay-close=${this._closeMarketplaceDialog}
                @marketplace-download-success=${this._handleMarketplaceDownloaded}
            ></marketplace-card-download-dialog>
        `;
    }

    private _syncIntegrationOutdatedNotice(): void {
        this.showIntegrationUpdateNotice = shouldShowIntegrationOutdatedNotice();
    }

    private _renderStats(stats: ReturnType<typeof this._getStats>) {
        return html`
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Cards</div>
                    <div class="stat-value">${stats.total}</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Recently Modified</div>
                    <div class="stat-value">${stats.recentlyModified}</div>
                    <div class="stat-subtitle">Last 7 days</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Last Created</div>
                    <div class="stat-value">
                        ${stats.lastCreated ? stats.lastCreated.name : 'None'}
                    </div>
                    ${stats.lastCreated ? html`
                        <div class="stat-subtitle">
                            ${this._formatDate(stats.lastCreated.created_at)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    private _renderQuickActions() {
        return html`
            <div class="quick-actions">
                <h2 class="section-title">Quick Actions</h2>
                <div class="actions-grid">
                    <button
                            class="action-button marketplace-highlight"
                            @click=${this._handleMarketplaceBrowse}
                            ?disabled=${!this.marketplaceBrowseUrl}
                            title=${this.marketplaceBrowseUrl ? 'Open marketplace in a new tab' : 'Marketplace link unavailable'}
                    >
                        <ha-icon icon="mdi:store-search"></ha-icon>
                        <span class="action-label">Browse Marketplace</span>
                    </button>
                    <button class="action-button " @click=${this._handleMarketplaceDownload}>
                        <ha-icon icon="mdi:cloud-download"></ha-icon>
                        <span class="action-label">Download from Marketplace</span>
                    </button>

                    <button class="action-button" @click=${this._handleCreateNew}>
                        <ha-icon icon="mdi:plus-circle"></ha-icon>
                        <span class="action-label">Create New Card</span>
                    </button>

                    <button class="action-button secondary" @click=${this._handleViewAll}>
                        <ha-icon icon="mdi:cards"></ha-icon>
                        <span class="action-label">View All Cards</span>
                    </button>
                </div>
            </div>
        `;
    }

    private _renderRecentCards() {
        const recentCards = this._getRecentCards(5);

        if (recentCards.length === 0) {
            return html`
                <div class="recent-cards">
                    <h2 class="section-title">Recent Cards</h2>
                    <div class="empty-state">
                        <ha-icon icon="mdi:card-bulleted-off-outline"></ha-icon>
                        <h3 class="empty-state-title">No cards yet</h3>
                        <p class="empty-state-text">Get started by creating your first card</p>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="recent-cards">
                <h2 class="section-title">Recent Cards</h2>
                <ul class="cards-list">
                    ${recentCards.map(card => this._renderCardItem(card))}
                </ul>
            </div>
        `;
    }

    private _renderCardItem(card: CardData) {
        return html`
            <li class="card-item">
                <div class="card-info">
                    <h3
                            class="card-name"
                            @click=${() => this._handleEditCard(card.id)}
                    >${card.name}
                    </h3>
                    <div class="card-meta">
                        ${card.description || 'No description'} •
                        Updated ${this._formatDate(card.updated_at)}
                    </div>
                </div>
                <div class="card-actions">
                    <button
                            class="icon-button"
                            @click=${() => this._handleEditCard(card.id)}
                            title="Edit card"
                    >
                        <ha-icon icon="mdi:pencil"></ha-icon>
                    </button>
                    <button
                            class="icon-button delete"
                            @click=${() => this._handleDeleteCard(card.id)}
                            title="Delete card"
                    >
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>
            </li>
        `;
    }

    private _renderLoading() {
        return html`
            <div class="loading">
                <div class="spinner"></div>
                <div>Loading dashboard...</div>
            </div>
        `;
    }

    private _handleMarketplaceDownload = (): void => {
        if (!hasRuntimeToken()) {
            this.router.navigate(ROUTES.ACCOUNT);
            return;
        }
        this.selectedMarketplaceId = '';
        this.marketplaceDialogOpen = true;
    };

    private _handleFeaturedMarketplaceDownload = (
        event: CustomEvent<MarketplaceFeaturedCardDownloadDetail>,
    ): void => {
        if (!hasRuntimeToken()) {
            this.router.navigate(ROUTES.ACCOUNT);
            return;
        }
        this.selectedMarketplaceId = event.detail.marketplaceId;
        this.marketplaceDialogOpen = true;
    };

    private _closeMarketplaceDialog = (): void => {
        this.marketplaceDialogOpen = false;
        this.selectedMarketplaceId = '';
    };

    private _handleMarketplaceDownloaded = (): void => {
        this.marketplaceDialogOpen = false;
        this.selectedMarketplaceId = '';
    };

    private _handleMarketplaceBrowse = (): void => {
        if (!this.marketplaceBrowseUrl) return;
        window.open(this.marketplaceBrowseUrl, '_blank', 'noopener');
    };

    private _renderError() {
        return html`
            <div class="error-message">
                <strong>Error:</strong> ${this.error}
            </div>
            <button class="action-button" @click=${this._loadCards}>
                Retry
            </button>
        `;
    }

    private async _loadCards(): Promise<void> {
        if (!this.cardsService) return;

        this.loading = true;
        this.error = null;

        try {
            this.cards = await this.cardsService.listCards();
        } catch (err) {
            console.error('Failed to load cards:', err);
            this.error = 'Failed to load cards. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    private async _loadMarketplaceBrowseUrl(): Promise<void> {
        if (!this.accountService) return;
        try {
            const info = await this.accountService.getInfo();
            this.marketplaceBrowseUrl = info?.urls.marketplace_page_browse;
        } catch (err) {
            console.error('Failed to load marketplace browse URL:', err);
            this.marketplaceBrowseUrl = null;
        }
    }

    private async _subscribeToUpdates(): Promise<void> {
        if (!this.cardsService) return;

        try {
            this.unsubscribe = await this.cardsService.subscribeToUpdates(() => {
                // Reload cards on any change
                this._loadCards();
            });
        } catch (err) {
            console.error('Failed to subscribe to updates:', err);
        }
    }

    private _getStats() {
        const total = this.cards.length;

        // Cards modified in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentlyModified = this.cards.filter(card => {
            const updatedAt = new Date(card.updated_at);
            return updatedAt >= sevenDaysAgo;
        }).length;

        // Last created card
        const sortedByCreation = [...this.cards].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        const lastCreated = sortedByCreation[0] || null;

        return {
            total,
            recentlyModified,
            lastCreated
        };
    }

    private _getRecentCards(limit: number): CardData[] {
        return [...this.cards].sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }).slice(0, limit);
    }

    private _formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    }

    private _handleViewAll(): void {
        this.router.navigate(ROUTES.CARDS);
    }

    private _handleCreateNew(): void {
        this.router.navigate(ROUTES.EDITOR_CREATE);
    }

    private _handleEditCard(id: string): void {
        this.router.navigate(ROUTES.EDITOR_EDIT, {id: id});
    }

    private async _handleDeleteCard(id: string): Promise<void> {
        if (!this.cardsService) return;

        const card = this.cards.find(c => c.id === id);
        if (!card) return;

        if (!confirm(`Are you sure you want to delete "${card.name}"?`)) {
            return;
        }

        try {
            await this.cardsService.deleteCard(id);
            // Cards will be reloaded via subscription
        } catch (err) {
            console.error('Failed to delete card:', err);
            alert('Failed to delete card. Please try again.');
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'dashboard-view': DashboardView;
    }
}
