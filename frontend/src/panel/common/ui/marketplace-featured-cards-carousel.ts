import { getAccountService, type MarketplaceFeaturedCard } from '@/common/api';
import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface MarketplaceFeaturedCardDownloadDetail {
    marketplaceId: string;
    card: MarketplaceFeaturedCard;
}

@customElement('marketplace-featured-cards-carousel')
export class MarketplaceFeaturedCardsCarousel extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .featured-section {
            margin-bottom: 32px;
        }

        .section-header {
            margin-bottom: 14px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 500;
            color: var(--primary-text-color);
            margin: 0 0 6px 0;
        }

        .section-text {
            color: var(--secondary-text-color);
            font-size: 14px;
            line-height: 1.45;
            margin: 0;
            max-width: 720px;
        }

        .cards-track {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 2px 2px 12px;
            scroll-snap-type: x proximity;
            scrollbar-width: thin;
        }

        .featured-card {
            flex: 0 0 min(330px, 82vw);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--card-background-color);
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            scroll-snap-align: start;
        }

        .preview {
            display: block;
            width: 100%;
            height: 142px;
            object-fit: cover;
            background: var(--secondary-background-color);
            border-bottom: 1px solid var(--divider-color);
        }

        .card-body {
            display: flex;
            flex: 1;
            flex-direction: column;
            gap: 10px;
            padding: 14px;
            min-height: 0;
        }

        .card-title {
            color: var(--primary-text-color);
            font-size: 15px;
            font-weight: 600;
            line-height: 1.35;
            margin: 0;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
        }

        .card-description {
            color: var(--secondary-text-color);
            font-size: 13px;
            line-height: 1.45;
            margin: 0;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
        }

        .creator {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--secondary-text-color);
            font-size: 12px;
            min-width: 0;
        }

        .creator ha-icon {
            --mdc-icon-size: 16px;
            flex: 0 0 auto;
        }

        .creator-name {
            color: inherit;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-decoration: none;
        }

        .creator-name[href]:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }

        .badges {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            min-height: 24px;
        }

        .badge {
            max-width: 100%;
            padding: 4px 7px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            line-height: 1;
            color: var(--primary-text-color);
            background: var(--secondary-background-color);
            border: 1px solid var(--divider-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-decoration: none;
        }

        .badge:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }

        .badge.tag {
            color: var(--accent-color, var(--primary-color));
            background: color-mix(in srgb, var(--accent-color, var(--primary-color)) 10%, transparent);
            border-color: color-mix(in srgb, var(--accent-color, var(--primary-color)) 28%, transparent);
        }

        .badge.style {
            color: var(--primary-color);
            background: color-mix(in srgb, var(--primary-color) 10%, transparent);
            border-color: color-mix(in srgb, var(--primary-color) 28%, transparent);
        }

        .card-footer {
            margin-top: auto;
            padding-top: 2px;
        }

        .download-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            min-height: 38px;
            padding: 9px 12px;
            border: none;
            border-radius: 6px;
            background: var(--primary-color);
            color: var(--text-primary-color, #fff);
            cursor: pointer;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
        }

        .download-button:hover {
            opacity: 0.9;
        }

        .download-button ha-icon {
            --mdc-icon-size: 18px;
        }

        @media (max-width: 768px) {
            .featured-section {
                margin-bottom: 24px;
            }

            .featured-card {
                flex-basis: min(300px, 86vw);
            }

            .preview {
                height: 128px;
            }
        }
    `;

    @property({ attribute: false })
    hass?: HomeAssistant;

    @state()
    private cards: MarketplaceFeaturedCard[] = [];

    @state()
    private loading = false;

    private loadedForHass?: HomeAssistant;

    connectedCallback(): void {
        super.connectedCallback();
        void this._ensureLoaded();
    }

    protected updated(changedProps: PropertyValues): void {
        if (changedProps.has('hass')) {
            void this._ensureLoaded();
        }
    }

    render() {
        if (this.loading || !this.cards.length) return nothing;

        return html`
            <section class="featured-section">
                <div class="section-header">
                    <h2 class="section-title">Marketplace Cards</h2>
                    <p class="section-text">
                        Selected cards from the marketplace, ready to preview and download into your local library.
                    </p>
                </div>
                <div class="cards-track">
                    ${this.cards.map((card) => this._renderCard(card))}
                </div>
            </section>
        `;
    }

    private _renderCard(card: MarketplaceFeaturedCard) {
        const preview = card.preview_images[0];
        const creatorName = card.origin === 'community' ? card.creator?.username : null;
        const creatorProfile = card.origin === 'community' ? card.creator?.profile : null;

        return html`
            <article class="featured-card">
                <img
                    class="preview"
                    src=${preview.url}
                    width=${preview.width ?? 1200}
                    height=${preview.height ?? 675}
                    alt=${card.name}
                    loading="lazy"
                />
                <div class="card-body">
                    <h3 class="card-title" title=${card.name}>${card.name}</h3>
                    <p class="card-description">${card.description}</p>
                    ${creatorName ? html`
                        <div class="creator">
                            <ha-icon icon="mdi:account-circle-outline"></ha-icon>
                            ${creatorProfile ? html`
                                <a
                                    class="creator-name"
                                    href=${creatorProfile}
                                    target="_blank"
                                    rel="noopener"
                                >${creatorName}</a>
                            ` : html`
                                <span class="creator-name">${creatorName}</span>
                            `}
                        </div>
                    ` : nothing}
                    <div class="badges">
                        <a
                            class="badge style"
                            href=${card.style.url}
                            target="_blank"
                            rel="noopener"
                            title=${card.style.label}
                        >Style: ${card.style.label}</a>
                        ${card.categories.map((category) => html`
                            <a
                                class="badge"
                                href=${category.url}
                                target="_blank"
                                rel="noopener"
                                title=${category.label}
                            >${category.label}</a>
                        `)}
                        ${card.tags.map((tag) => html`
                            <a
                                class="badge tag"
                                href=${tag.url}
                                target="_blank"
                                rel="noopener"
                                title=${tag.label}
                            >${tag.label}</a>
                        `)}
                    </div>
                    <div class="card-footer">
                        <button
                            class="download-button"
                            @click=${() => this._handleDownload(card)}
                        >
                            <ha-icon icon="mdi:cloud-download-outline"></ha-icon>
                            <span>Download card</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    private async _ensureLoaded(): Promise<void> {
        if (!this.hass || this.loadedForHass === this.hass) return;
        this.loadedForHass = this.hass;
        this.loading = true;
        try {
            const service = getAccountService(this.hass);
            const response = await service.listMarketplaceCardsAvailableFeatured();
            this.cards = response.list.items;
        } catch (err) {
            console.error('Failed to load marketplace featured cards:', err);
            this.cards = [];
        } finally {
            this.loading = false;
        }
    }

    private _handleDownload(card: MarketplaceFeaturedCard): void {
        this.dispatchEvent(new CustomEvent<MarketplaceFeaturedCardDownloadDetail>(
            'marketplace-featured-card-download',
            {
                detail: {
                    marketplaceId: card.id,
                    card,
                },
                bubbles: true,
                composed: true,
            },
        ));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'marketplace-featured-cards-carousel': MarketplaceFeaturedCardsCarousel;
    }
}
