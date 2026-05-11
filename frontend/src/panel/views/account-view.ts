import {
    getAccountService,
    type CardBuilderAccount,
    type CardBuilderAccountPlansInfo,
    type CardBuilderAccountPlanInfo,
    type CardBuilderAccountPlanPrice,
} from '@/common/api';
import { getOutdatedIntegrationVersion, subscribeIntegrationOutdatedChange } from '@/common/api/integration-outdated';
import {
    buildConsoleUrl,
    buildCreateAccountUrl,
    hasRuntimeToken,
    subscribeRuntimeConfigChange,
} from '@/common/api/runtime-config';
import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

type PlanViewModel = {
    label: string;
    features: string[];
    isDownloadLimited: boolean;
    prices: CardBuilderAccountPlanPrice[];
    downloadLimit: number | null;
};

type PriceInterval = 'monthly' | 'yearly';
type HeroCopy = {
    title: string;
    subline: string;
};

@customElement('account-view')
export class AccountView extends LitElement {
    static styles = css`
        :host {
            --account-ink: #0c1a2a;
            --account-muted: rgba(12, 26, 42, 0.7);
            --account-accent: #ff8f3f;
            --account-accent-strong: #ff6a1f;
            --account-accent-2: #2f8cf2;
            --account-surface: rgba(255, 255, 255, 0.94);
            --account-surface-strong: #ffffff;
            --account-border: rgba(12, 26, 42, 0.12);
            --account-shadow: 0 24px 60px rgba(12, 26, 42, 0.12);
            --account-shadow-soft: 0 12px 30px rgba(12, 26, 42, 0.08);
            --account-radius: 18px;
            display: block;
            min-height: 100%;
            padding: 32px;
            background: var(--primary-background-color);
            color: var(--account-ink);
            font-family: "Space Grotesk", "Sora", "IBM Plex Sans", sans-serif;
            position: relative;
            overflow: hidden;
        }

        :host::before,
        :host::after {
            content: "";
            position: absolute;
            width: 520px;
            height: 520px;
            border-radius: 50%;
            opacity: 0.35;
            filter: blur(0);
            pointer-events: none;
        }

        :host::before {
            top: -200px;
            left: -160px;
            background: radial-gradient(circle at center, rgba(255, 143, 63, 0.6), transparent 70%);
        }

        :host::after {
            top: -220px;
            right: -180px;
            background: radial-gradient(circle at center, rgba(47, 140, 242, 0.55), transparent 70%);
        }

        .page {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        .hero {
            animation: rise 0.5s ease both;
        }

        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--account-muted);
            margin-bottom: 16px;
        }

        .eyebrow::before {
            content: "";
            width: 26px;
            height: 2px;
            background: linear-gradient(90deg, var(--account-accent), var(--account-accent-2));
        }

        .headline {
            font-size: clamp(28px, 4vw, 42px);
            font-weight: 600;
            margin: 0 0 12px 0;
        }

        .subline {
            font-size: 16px;
            line-height: 1.6;
            color: var(--account-muted);
            margin: 0 0 20px 0;
        }

        .cta-group {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 24px;
        }

        .cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            border: 1px solid transparent;
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
            font-family: inherit;
        }

        .cta.primary {
            background: linear-gradient(120deg, var(--account-accent), var(--account-accent-strong));
            color: #fff;
            box-shadow: 0 12px 24px rgba(255, 111, 32, 0.25);
        }

        .cta.secondary {
            background: var(--account-surface);
            color: var(--account-ink);
            border-color: var(--account-border);
            box-shadow: var(--account-shadow-soft);
        }

        .cta.ghost {
            background: transparent;
            color: var(--account-ink);
            border-color: var(--account-border);
        }

        .cta.danger {
            background: transparent;
            color: #b13b1d;
            border-color: rgba(255, 111, 32, 0.35);
        }

        .cta:hover {
            transform: translateY(-2px);
        }

        .cta:disabled,
        .cta[disabled] {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .benefits {
            display: grid;
            gap: 12px;
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .benefit-item {
            display: flex;
            gap: 12px;
            padding: 12px 14px;
            background: var(--account-surface);
            border-radius: 14px;
            border: 1px solid var(--account-border);
            box-shadow: var(--account-shadow-soft);
        }

        .benefit-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(47, 140, 242, 0.12);
            display: grid;
            place-items: center;
            color: var(--account-accent-2);
            flex-shrink: 0;
        }

        .benefit-title {
            font-weight: 600;
            margin: 0 0 4px 0;
        }

        .benefit-text {
            margin: 0;
            color: var(--account-muted);
            font-size: 13px;
            line-height: 1.5;
        }

        .section {
            background: var(--account-surface);
            border-radius: var(--account-radius);
            padding: 24px;
            border: 1px solid var(--account-border);
            box-shadow: var(--account-shadow-soft);
            animation: rise 0.55s ease both;
        }

        .integration-outdated-banner {
            padding: 14px 18px;
            border-radius: 14px;
            border: 1px solid rgba(255, 111, 32, 0.4);
            background: rgba(255, 111, 32, 0.12);
            color: var(--account-ink);
            font-size: 14px;
            line-height: 1.5;
        }

        .section-title {
            margin: 0 0 16px 0;
            font-size: 20px;
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
        }

        .pricing-card {
            border-radius: 16px;
            padding: 20px;
            border: 1px solid var(--account-border);
            background: #fff;
            display: flex;
            flex-direction: column;
            gap: 14px;
            box-shadow: var(--account-shadow-soft);
            position: relative;
        }

        .plan-preview-badge {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            padding: 4px 10px;
            border-radius: 6px;
            background: var(--primary-color);
            color: var(--text-primary-color);
            border: 1px solid rgba(47, 140, 242, 0.35);
            font-size: 11px;
            font-weight: 700;
            line-height: 1;
            white-space: nowrap;
        }

        .pricing-card.featured {
            border-color: rgba(255, 143, 63, 0.4);
            box-shadow: 0 18px 40px rgba(255, 143, 63, 0.2);
        }

        .pricing-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: var(--account-muted);
        }

        .pricing-title {
            font-size: 20px;
            margin: 0;
        }

        .pricing-price {
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .pricing-price-amount {
            font-size: 22px;
            font-weight: 600;
        }

        .pricing-price-unit {
            font-size: 12px;
            font-weight: 500;
            color: var(--account-muted);
        }

        .pricing-billing-note {
            margin-top: -6px;
            font-size: 12px;
            color: var(--account-muted);
        }

        .plan-cta.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            pointer-events: none;
            transform: none;
            box-shadow: none;
        }

        .pricing-features {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 10px;
            color: var(--account-muted);
            font-size: 13px;
            line-height: 1.5;
        }

        .pricing-features li::before {
            content: "-";
            margin-right: 8px;
            color: var(--account-accent-2);
        }

        .price-toggle {
            display: inline-flex;
            gap: 6px;
            padding: 4px;
            border-radius: 999px;
            background: rgba(12, 26, 42, 0.08);
            align-self: flex-start;
        }
        .price-toggle-placeholder {
            height: 34px;
        }

        .price-toggle button {
            border: none;
            background: transparent;
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            color: var(--account-muted);
            cursor: pointer;
            font-family: inherit;
        }

        .price-toggle button.active {
            background: #fff;
            color: var(--account-ink);
            box-shadow: 0 6px 16px rgba(12, 26, 42, 0.12);
        }

        .token-input {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .token-input input {
            flex: 1;
            min-width: 220px;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid var(--account-border);
            font-size: 14px;
            font-family: inherit;
        }

        .token-input button {
            min-width: 160px;
        }

        .status-banner {
            padding: 10px 14px;
            border-radius: 12px;
            background: rgba(47, 140, 242, 0.12);
            color: var(--account-ink);
            font-size: 13px;
        }

        .status-banner.error {
            background: rgba(255, 111, 32, 0.15);
        }

        .account-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }

        .account-actions {
            margin-top: 18px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .account-metric {
            background: #fff;
            border-radius: 14px;
            padding: 14px;
            border: 1px solid var(--account-border);
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .account-metric span {
            display: block;
            font-size: 12px;
            color: var(--account-muted);
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 6px;
        }

        .account-metric strong {
            font-size: 16px;
        }

        .account-metric.downloads.warning {
            border-color: rgba(255, 143, 63, 0.45);
            background: rgba(255, 143, 63, 0.12);
        }

        .account-metric.downloads.full {
            border-color: rgba(229, 70, 70, 0.45);
            background: rgba(229, 70, 70, 0.12);
        }

        .account-metric-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .account-metric-title {
            font-size: 12px;
            color: var(--account-muted);
            text-transform: uppercase;
            letter-spacing: 0.12em;
        }

        .account-metric-value {
            font-size: 20px;
            font-weight: 600;
        }

        .account-metric-subline {
            font-size: 12px;
            color: var(--account-muted);
            line-height: 1.4;
        }

        .account-metric-subline.critical {
            color: #b13b1d;
        }

        .account-metric-icon {
            color: var(--account-accent);
        }

        .account-metric-icon.full {
            color: #c0392b;
        }

        .page-loading {
            min-height: 60vh;
            display: grid;
            place-items: center;
        }

        .spinner {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 3px solid rgba(12, 26, 42, 0.15);
            border-top-color: var(--account-accent-2);
            animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes rise {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 980px) {
            .hero {
                grid-template-columns: 1fr;
            }

            .pricing-grid {
                grid-template-columns: 1fr;
            }

            .pricing-card.featured {
                transform: none;
            }
        }
    `;

    @property({attribute: false})
    hass?: HomeAssistant;

    @state() private account: CardBuilderAccount | null = null;
    @state() private connected = false;
    @state() private accountLoading = true;
    @state() private error: string | null = null;
    @state() private info: CardBuilderAccountPlansInfo | null = null;
    @state() private infoError: string | null = null;
    @state() private infoLoading = true;
    @state() private tokenValue = '';
    @state() private savingToken = false;
    @state() private tokenSuccess = false;
    @state() private disconnecting = false;
    @state() private priceSelection: Partial<Record<string, PriceInterval>> = {};
    @state() private showIntegrationUpdateNotice = false;
    @state() private integrationOutdated = false;
    @state() private hasIntegrationToken = false;

    private hasLoaded = false;
    private unsubscribeIntegrationOutdated?: () => void;
    private unsubscribeRuntimeConfig?: () => void;

    connectedCallback(): void {
        super.connectedCallback();
        this._syncIntegrationStatus();
        this.unsubscribeIntegrationOutdated = subscribeIntegrationOutdatedChange(() => {
            this._syncIntegrationStatus();
        });
        this.unsubscribeRuntimeConfig = subscribeRuntimeConfigChange(() => {
            this._syncIntegrationStatus();
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.unsubscribeIntegrationOutdated) {
            this.unsubscribeIntegrationOutdated();
            this.unsubscribeIntegrationOutdated = undefined;
        }
        if (this.unsubscribeRuntimeConfig) {
            this.unsubscribeRuntimeConfig();
            this.unsubscribeRuntimeConfig = undefined;
        }
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (changedProps.has('hass') && this.hass && !this.hasLoaded) {
            this.hasLoaded = true;
            void this._loadInfo();
            void this._loadAccount({silentAuthError: true});
        }
    }

    render() {
        const createAccountUrl = buildCreateAccountUrl();
        const consoleUrl = buildConsoleUrl();
        const isLoading = this.infoLoading || this.accountLoading;
        const tokenBlocked = this.integrationOutdated && !this.hasIntegrationToken;
        const tokenStoredButOutdated = this.integrationOutdated && this.hasIntegrationToken;

        if (isLoading) {
            return html`
                <div class="page page-loading">
                    <div class="spinner" role="status" aria-label="Loading"></div>
                </div>
            `;
        }

        const heroCopy = this._getHeroCopy();

        return html`
            <div class="page">
                ${this.showIntegrationUpdateNotice ? html`
                    <div class="integration-outdated-banner">
                        Your Card Builder integration is out of date. To connect your account correctly,
                        update the custom integration to the latest available version.
                    </div>
                ` : nothing}
                <section class="hero">
                    <div class="hero-copy">
                        <div class="eyebrow">Card Builder Account</div>
                        <h1 class="headline">${heroCopy.title}</h1>
                        <p class="subline">${heroCopy.subline}</p>
                        ${!tokenStoredButOutdated ? html`
                            <div class="cta-group">
                                ${this.connected ? html`
                                    <a class="cta primary" href=${consoleUrl} target="_blank" rel="noopener">
                                        Manage Account
                                    </a>
                                ` : html`
                                    <a class="cta primary" href=${createAccountUrl} target="_blank" rel="noopener">
                                        Create Account
                                    </a>
                                `}
                            </div>
                        ` : nothing}
                        
                        <ul class="benefits">
                            <li class="benefit-item">
                                <div class="benefit-icon">
                                    <ha-icon icon="mdi:download-box"></ha-icon>
                                </div>
                                <div>
                                    <p class="benefit-title">Download and Customize</p>
                                    <p class="benefit-text">Grab ready-made cards and adapt them fast.</p>
                                </div>
                            </li>
                            <li class="benefit-item">
                                <div class="benefit-icon">
                                    <ha-icon icon="mdi:cloud-upload"></ha-icon>
                                </div>
                                <div>
                                    <p class="benefit-title">Publish your cards</p>
                                    <p class="benefit-text">Make your creations available in the marketplace for the community.</p>
                                </div>
                            </li>
                            <li class="benefit-item">
                                <div class="benefit-icon">
                                    <ha-icon icon="mdi:numeric-positive-1"></ha-icon>
                                </div>
                                <div>
                                    <p class="benefit-title">Earn Free Download</p>
                                    <p class="benefit-text">Earn extra download slots.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                ${tokenStoredButOutdated ? this._renderIntegrationOutdatedSection() : nothing}
                ${!tokenStoredButOutdated && !this.connected
                    ? this._renderTokenSection({
                        disabled: tokenBlocked,
                        message: tokenBlocked
                            ? 'Update the custom integration to the latest available version before entering a token.'
                            : null,
                    })
                    : nothing}
                ${!tokenStoredButOutdated
                    ? (this.connected ? this._renderAccountSection() : this._renderPromoSection())
                    : nothing}
            </div>
        `;
    }

    private _getHeroCopy(): HeroCopy {
        if (this.integrationOutdated) {
            if (this.hasIntegrationToken) {
                return {
                    title: 'Update required to reconnect your account.',
                    subline:
                        'The Card Builder integration is out of date. ' +
                        'Update the custom integration to the latest available version to reconnect your account.',
                };
            }
            return {
                title: 'Update required before connecting.',
                subline:
                    'This Card Builder integration is out of date. Update the custom integration to the ' +
                    'latest available version before connecting an account.',
            };
        }

        if (!this.connected) {
            return {
                title: 'Create an Account and Unlock the Marketplace.',
                subline:
                    'Upload your cards, download community ones, and tailor them to your dashboards. ' +
                    'Every shared download increases your Free limit.',
            };
        }

        const plan = this._getAccountPlan()!;

        if (this._isFreePlan(plan)) {
            return {
                title: 'Ready for more?',
                subline:
                    `Upgrade your plan for unlimited downloads, advanced features, ` +
                    'and the integrated AI agent.',
            };
        }

        return {
            title: `You're on ${plan.name}.`,
            subline: 'Enjoy the full toolkit and manage your subscription anytime from the console.',
        };
    }

    private _renderPromoSection() {
        if (this.infoError) {
            return html`
                <section class="section">
                    <h2 class="section-title">Choose the plan that fits you</h2>
                    <p class="subline">${this.infoError}</p>
                </section>
            `;
        }

        if (!this.info) {
            return html`
                <section class="section">
                    <h2 class="section-title">Choose the plan that fits you</h2>
                    <p class="subline">Plan information is not available.</p>
                </section>
            `;
        }

        const plans = this.info?.plans ?? [];
        return html`
            <section class="section">
                <h2 class="section-title">Choose the plan that fits you</h2>
                ${plans.length > 0 ? html`
                    <div class="pricing-grid">
                        ${plans.map((plan) => this._renderPlanCard(plan))}
                    </div>
                ` : html`
                    <p class="subline">No plans available at the moment.</p>
                `}
            </section>
        `;
    }

    private _renderPlanCard(plan: CardBuilderAccountPlanInfo) {
        const view = this._buildPlanView(plan);
        const subscriptionPrices = this._getSubscriptionPrices(plan.prices);
        const hasToggle = Boolean(subscriptionPrices.monthly && subscriptionPrices.yearly);
        const selectedInterval = this.priceSelection[plan.code] ?? 'monthly';
        const selectedPrice = this._getSelectedPrice(plan.prices, subscriptionPrices, selectedInterval);
        const billingLabel = selectedPrice ? this._getBillingLabel(selectedPrice) : plan.name;
        const priceDisplay = selectedPrice ? this._getPriceDisplay(selectedPrice) : {
            amountLabel: '--',
            unitLabel: null,
            billedAnnually: false,
        };
        const isPreviewPlan = plan.status === 'preview';
        const ctaLabel = plan.cta?.label?.trim() || 'Get Started';
        const ctaLink = typeof plan.cta?.link === 'string' ? plan.cta.link.trim() : '';
        const ctaDisabled = isPreviewPlan || !ctaLink;

        return html`
            <div class="pricing-card">
                ${isPreviewPlan ? html`<div class="plan-preview-badge">Coming Soon</div>` : nothing}
                <div class="pricing-label">${billingLabel}</div>
                <h3 class="pricing-title">${view.label}</h3>
                ${hasToggle ? html`
                    <div class="price-toggle">
                        <button
                            class=${selectedInterval === 'monthly' ? 'active' : ''}
                            @click=${() => this._handlePriceToggle(plan.code, 'monthly')}
                        >
                            Monthly
                        </button>
                        <button
                            class=${selectedInterval === 'yearly' ? 'active' : ''}
                            @click=${() => this._handlePriceToggle(plan.code, 'yearly')}
                        >
                            Yearly
                        </button>
                    </div>
                ` : html`<div class="price-toggle-placeholder"></div>`}
                <div class="pricing-price">
                    <span class="pricing-price-amount">${priceDisplay.amountLabel}</span>
                    ${priceDisplay.unitLabel ? html`<span class="pricing-price-unit">${priceDisplay.unitLabel}</span>` : nothing}
                </div>
                <div class="pricing-billing-note">
                    ${priceDisplay.billedAnnually ? 'billed annually' : html`&nbsp;`}    
                </div>
                
                ${ctaDisabled
                    ? html`<button class="cta primary plan-cta disabled" disabled>${ctaLabel}</button>`
                    : html`<a class="cta primary plan-cta" href=${ctaLink} target="_blank" rel="noopener">${ctaLabel}</a>`
                }
                <ul class="pricing-features">
                    ${view.features.map(feature => html`<li>${feature}</li>`)}
                </ul>
            </div>
        `;
    }

    private _renderAccountSection() {
        const account = this.account ?? {};
        const plan = this._getAccountPlan();
        const showUpgradeCta = plan ? this._isFreePlan(plan) : false;
        const instanceName = this._getAccountValueFrom(account, ['instance_name']);
        const usedDownloads = this._getAccountNumberFrom(account, ['downloads_count'],);
        const currentSlots = this._getAccountNumberFrom(account, ['download_slots']);
        const initialSlots = this._getAccountNumberFrom(account, ['download_slots_initial']);
        const downloadsRemaining = this._getAccountNumberFrom(account, ['downloads_remaining']);
        const hasUnlimitedDownloads = downloadsRemaining === null;
        const totalSlots = currentSlots ?? initialSlots;
        const usedValue = usedDownloads ?? 0;
        const percentRaw = totalSlots && totalSlots > 0 ? Math.min(100, (usedValue / totalSlots) * 100) : 0;
        const percent = hasUnlimitedDownloads ? 0 : Math.round(percentRaw);
        const status = hasUnlimitedDownloads ? 'unlimited' : (percentRaw >= 100 ? 'full' : (percentRaw >= 60 ? 'warning' : 'normal'));
        const usageLabel = hasUnlimitedDownloads ? `${usedValue}/∞` : (totalSlots !== null ? `${usedValue}/${totalSlots}` : `${usedValue}`);
        const percentLabel = totalSlots !== null ? `${percent}% of ${totalSlots} downloads used.` : `${percent}% of downloads used.`;
        const fullLabel = status === 'full' ? 'You cannot download more cards.' : '';
        const earnedSlots = currentSlots !== null && initialSlots !== null ? Math.max(0, currentSlots - initialSlots) : 0;
        const showEarnCta = earnedSlots === 0 && !hasUnlimitedDownloads;
        return html`
            <section class="section">
                <h2 class="section-title">Your Account</h2>
                <div class="account-grid">
                    ${plan ? html`
                        <div class="account-metric">
                            <div class="account-metric-header">
                                <div class="account-metric-title">Plan</div>
                            </div>
                            <div class="account-metric-value">${plan.name}</div>
                            <div class="account-metric-subline">&nbsp;</div>
                            ${showUpgradeCta ? html`
                                <a class="cta primary" href=${this.info?.urls.website_page_home} target="_blank" rel="noopener">
                                    Upgrade plan
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${instanceName ? html`
                        <div class="account-metric">
                            <span>Instance Name</span>
                            <strong>${instanceName}</strong>
                        </div>
                    ` : ''}
                    <div class="account-metric downloads ${status}">
                        <div class="account-metric-header">
                            <div class="account-metric-title">Downloads</div>
                            ${status === 'warning' ? html`<ha-icon class="account-metric-icon" icon="mdi:alert-circle"></ha-icon>` : ''}
                            ${status === 'full' ? html`<ha-icon class="account-metric-icon full" icon="mdi:close-circle"></ha-icon>` : ''}
                        </div>
                        <div class="account-metric-value">${usageLabel}</div>
                        <div class="account-metric-subline ${status === 'full' ? 'critical' : ''}">
                            ${hasUnlimitedDownloads ? `Unlimited downloads` :
                                html`${percentLabel}${fullLabel ? ` ${fullLabel}` : ''}`
                            }
                        </div>
                    </div>
                    <div class="account-metric">
                        <div class="account-metric-header">
                            <div class="account-metric-title">Extra Slots</div>
                        </div>
                        <div class="account-metric-value">${earnedSlots}</div>
                        <div class="account-metric-subline">
                            Slots unlocked from community downloads.
                        </div>
                        ${showEarnCta ? html`
                            <a class="cta primary" href=${this.info?.urls.website_page_marketplace} target="_blank" rel="noopener">
                                Learn how to unlock more
                            </a>
                        ` : ''}
                    </div>
                </div>
                <div class="account-actions">
                    <button class="cta danger" @click=${this._handleDisconnect} ?disabled=${this.disconnecting}>
                        ${this.disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                </div>
            </section>
        `;
    }

    private _renderTokenSection(options?: { disabled?: boolean; message?: string | null }) {
        const disabled = Boolean(options?.disabled);
        const message = options?.message;
        return html`
            <section class="section token-card" id="token-section">
                <h2 class="section-title">Enter Token</h2>
                <p class="subline">
                    Paste the token generated in the Card Builder console account to link this instance.
                </p>
                ${message ? html`<div class="status-banner error">${message}</div>` : ''}
                ${this.error ? html`<div class="status-banner error">${this.error}</div>` : ''}
                ${this.tokenSuccess ? html`<div class="status-banner">Token saved and account linked.</div>` : ''}
                <div class="token-input">
                    <input
                        type="password"
                        placeholder="Paste the authentication token here"
                        .value=${this.tokenValue}
                        @input=${this._handleTokenInput}
                        ?disabled=${disabled}
                    />
                    <button class="cta primary" @click=${this._handleTokenSave} ?disabled=${this.savingToken || disabled}>
                        ${this.savingToken ? 'Saving...' : 'Connect account'}
                    </button>
                </div>
            </section>
        `;
    }

    private _renderIntegrationOutdatedSection() {
        return html`
            <section class="section">
                <h2 class="section-title">Update Required</h2>
                <p class="subline">
                    The Card Builder integration is out of date, so account data cannot be loaded right now.
                    Update the custom integration to the latest available version, then refresh this panel.
                </p>
            </section>
        `;
    }

    private _handleTokenInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.tokenValue = input.value;
        if (this.error) this.error = null;
        if (this.tokenSuccess) this.tokenSuccess = false;
    }

    private async _handleTokenSave(): Promise<void> {
        if (!this.hass) return;
        if (this.integrationOutdated && !this.hasIntegrationToken) {
            this.error = 'Update the custom integration before connecting an account.';
            return;
        }
        const token = this.tokenValue.trim();
        if (!token) {
            this.error = 'Enter a valid token.';
            return;
        }
        this.savingToken = true;
        this.error = null;
        this.tokenSuccess = false;
        try {
            const service = getAccountService(this.hass);
            await service.setToken(token);
            this.tokenValue = '';
            await this._loadAccount();
            if (this.connected) {
                try {
                    await service.registerFingerprint();
                } catch (err) {
                    this.error = this._getErrorMessage(err);
                }
            }
            this.tokenSuccess = this.connected;
        } catch (err) {
            this.error = this._getErrorMessage(err);
        } finally {
            this.savingToken = false;
        }
    }

    private async _loadAccount(options: { silentAuthError?: boolean } = {}): Promise<void> {
        if (!this.hass) return;
        this.accountLoading = true;
        this.error = null;
        try {
            const service = getAccountService(this.hass);
            this.account = await service.getAccount();
            this.connected = true;
        } catch (err) {
            this.connected = false;
            this.account = null;
            if (!options.silentAuthError || !this._isAuthError(err)) {
                this.error = this._getErrorMessage(err);
            }
        } finally {
            this.accountLoading = false;
        }
    }

    private async _loadInfo(): Promise<void> {
        if (!this.hass) return;
        this.infoLoading = true;
        this.infoError = null;
        try {
            const service = getAccountService(this.hass);
            this.info = await service.getInfo();
        } catch (err) {
            console.error(err);
            this.info = null;
            this.infoError = 'Unable to load plan details.';
        } finally {
            this.infoLoading = false;
        }
    }

    private async _handleDisconnect(): Promise<void> {
        if (!this.hass || this.disconnecting) return;
        const confirmed = window.confirm(
            'Disconnect this Card Builder account from this Home Assistant instance?'
        );
        if (!confirmed) return;
        this.disconnecting = true;
        this.error = null;
        try {
            const service = getAccountService(this.hass);
            await service.disconnect();
            this.connected = false;
            this.account = null;
            this.tokenValue = '';
            this.tokenSuccess = false;
        } catch (err) {
            this.error = this._getErrorMessage(err);
        } finally {
            this.disconnecting = false;
        }
    }

    private _handlePriceToggle(code: string, interval: PriceInterval): void {
        this.priceSelection = {
            ...this.priceSelection,
            [code]: interval,
        };
    }

    private _getAccountPlan(): CardBuilderAccountPlanInfo | null {
        if (!this.info) return null;
        const planCode = this._getAccountValueFrom(this.account ?? {}, ['plan_code']);
        if (!planCode) return null;
        return this.info.plans.find(plan => plan.code === planCode) ?? null;
    }

    private _isFreePlan(plan: CardBuilderAccountPlanInfo): boolean {
        if (!plan.prices || plan.prices.length === 0) return true;
        return plan.prices.every(price => price.billing_type === 'free' || price.amount === 0);
    }

    private _buildPlanView(plan: CardBuilderAccountPlanInfo): PlanViewModel {
        return {
            label: plan.name,
            features: plan.features.map(feature => feature.label),
            isDownloadLimited: plan.download_limit !== null,
            prices: plan.prices,
            downloadLimit: plan.download_limit,
        };
    }

    private _getSubscriptionPrices(prices: CardBuilderAccountPlanPrice[]): {
        monthly?: CardBuilderAccountPlanPrice;
        yearly?: CardBuilderAccountPlanPrice;
    } {
        const monthly = prices.find(
            price => price.billing_type === 'subscription' && price.billing_interval === 'monthly'
        );
        const yearly = prices.find(
            price => price.billing_type === 'subscription' && price.billing_interval === 'yearly'
        );
        return {monthly, yearly};
    }

    private _getSelectedPrice(
        prices: CardBuilderAccountPlanPrice[],
        subscriptionPrices: { monthly?: CardBuilderAccountPlanPrice; yearly?: CardBuilderAccountPlanPrice },
        interval: PriceInterval,
    ): CardBuilderAccountPlanPrice | null {
        if (subscriptionPrices.monthly || subscriptionPrices.yearly) {
            if (interval === 'yearly' && subscriptionPrices.yearly) return subscriptionPrices.yearly;
            if (interval === 'monthly' && subscriptionPrices.monthly) return subscriptionPrices.monthly;
            return subscriptionPrices.monthly ?? subscriptionPrices.yearly ?? null;
        }
        return prices[0] ?? null;
    }

    private _getBillingLabel(price: CardBuilderAccountPlanPrice): string {
        if (price.billing_type === 'free') return 'Free';
        if (price.billing_type === 'one_time') return 'One-time';
        return 'Subscription';
    }

    private _getPriceDisplay(price: CardBuilderAccountPlanPrice): {
        amountLabel: string;
        unitLabel: string | null;
        billedAnnually: boolean;
    } {
        if (price.billing_type === 'free' || price.amount === 0) {
            return {amountLabel: 'Free', unitLabel: null, billedAnnually: false};
        }

        if (price.billing_type === 'subscription') {
            const amountInMajorUnit = price.billing_interval === 'yearly'
                ? (price.amount / 12) / 100
                : price.amount / 100;
            const formattedMonthly = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: price.currency,
            }).format(amountInMajorUnit);
            return {
                amountLabel: formattedMonthly,
                unitLabel: '/ month',
                billedAnnually: price.billing_interval === 'yearly',
            };
        }

        const formatted = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: price.currency,
        }).format(price.amount / 100);
        return {amountLabel: formatted, unitLabel: null, billedAnnually: false};
    }

    private _getAccountValueFrom(account: CardBuilderAccount, keys: string[]): string | null {
        for (const key of keys) {
            const value = (account as Record<string, unknown>)[key];
            if (value === undefined || value === null) continue;
            if (typeof value === 'string' && value.trim()) return value;
            if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        }
        return null;
    }

    private _getAccountNumberFrom(account: CardBuilderAccount, keys: string[]): number | null {
        for (const key of keys) {
            const value = (account as Record<string, unknown>)[key];
            if (typeof value === 'number' && Number.isFinite(value)) return value;
            if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
                return Number(value);
            }
        }
        return null;
    }

    private _isAuthError(err: unknown): boolean {
        if (!err || typeof err !== 'object') return false;
        const maybe = err as {code?: string; message?: string};
        if (maybe.code === 'api_auth_failed') return true;
        if (typeof maybe.message === 'string' && maybe.message.toLowerCase().includes('token')) return true;
        return false;
    }

    private _syncIntegrationStatus(): void {
        this.hasIntegrationToken = hasRuntimeToken();
        this.integrationOutdated = Boolean(getOutdatedIntegrationVersion());
        this.showIntegrationUpdateNotice = this.integrationOutdated && !this.hasIntegrationToken;
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
        'account-view': AccountView;
    }
}
