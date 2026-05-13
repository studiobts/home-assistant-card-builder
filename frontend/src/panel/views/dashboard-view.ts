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

        .stat-card-name-value {
            font-size: 22px;
            line-height: 1.25;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            word-break: break-word;
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
            return html``;
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
                    <div class="stat-value ${stats.lastCreated ? 'stat-card-name-value' : ''}">
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

}

declare global {
    interface HTMLElementTagNameMap {
        'dashboard-view': DashboardView;
    }
}
