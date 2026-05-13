import { CARD_BUILDER_VERSION } from "@/common/version";
import type { HomeAssistant, Panel } from 'custom-card-helpers';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';

import '@/panel/designer/main';
import '@/panel/components';
import '@/panel/media-manager';
import '@/panel/views';
import { getRouter, ROUTES } from '@/panel/router';
import { PANEL_INFO } from "@/panel/panel-info";
import { CardsManager, cardsManagerContext } from '@/panel/cards-manager';
import { getAccountStatusService } from '@/common/api';
import { notifyRuntimeConfigChange, setRuntimeConfig, updateRuntimeConfig } from '@/common/api/runtime-config';
import { resolveOutdatedIntegrationIfUpdated } from '@/common/api/integration-outdated';
import {
    CARD_BUILDER_FRONTEND_VERSION_RECHECK_EVENT,
    getCardBuilderFrontendVersionCheck,
    getCardBuilderPanelRuntimeConfig,
    getCardBuilderVersionBlockedCopy,
    type RuntimeVersionCheckResult,
} from '@/common/cache-version-guard';

/**
 * Card Builder Panel for Home Assistant
 *
 * This custom panel integrates the visual card builder designer
 * directly into Home Assistant's interface, providing a seamless
 * experience for creating and editing dashboard cards.
 */
@customElement('card-builder-panel')
export class CardBuilderPanel extends LitElement {
    static styles = css`
    :host {
      --cb-font-family: Roboto, Arial, Helvetica, sans-serif;
      --cb-sidebar-background: white;
      --cb-sidebar-section-border-color: #e6e8ee
    }
    
    :host {
      display: block;
      height: 100%;
      width: 100%;
      position: relative;
      overflow: hidden;
      background: var(--card-background-color, #ffffff);
    }

    .panel-container {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .builder-wrapper {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    builder-main {
      width: 100%;
      height: 100%;
    }

    .error {
      padding: 16px;
      color: var(--error-color, #db4437);
      background: var(--card-background-color, #ffffff);
      border-radius: 8px;
      margin: 16px;
      border: 1px solid var(--error-color, #db4437);
    }

    .cache-guard-page {
      box-sizing: border-box;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: var(--primary-text-color, #212121);
      background: var(--primary-background-color, #ffffff);
      font-family: var(--paper-font-body1_-_font-family, Roboto, Arial, sans-serif);
    }

    .cache-guard-box {
      width: min(100%, 560px);
      border: 1px solid var(--divider-color, #d9dce3);
      border-radius: 8px;
      background: var(--card-background-color, #ffffff);
      padding: 18px;
      box-sizing: border-box;
    }

    .cache-guard-title {
      margin: 0 0 8px;
      font-size: 18px;
      line-height: 1.35;
      font-weight: 600;
    }

    .cache-guard-message {
      margin: 0;
      font-size: 14px;
      line-height: 1.45;
      color: var(--secondary-text-color, #5f6368);
    }

    .cache-guard-versions {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 6px 10px;
      margin-top: 14px;
      font-size: 13px;
      line-height: 1.35;
    }

    .cache-guard-label {
      color: var(--secondary-text-color, #5f6368);
    }

    .cache-guard-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      overflow-wrap: anywhere;
    }
  `;
    private static readonly FULLSCREEN_STORAGE_KEY = 'card-builder-fullscreen';

    @provide({context: cardsManagerContext})
    private cardsManager = new CardsManager();

    @property({attribute: false}) public hass!: HomeAssistant;
    @property({attribute: false}) public narrow = false;
    @property({attribute: false}) public route?: {path: string, prefix: string};
    @property({attribute: false}) public panel?: Panel;

    @state() private _isReady = false;
    @state() private _loadedHAComponents = false;
    @state() private _currentRoute: string = ROUTES.DASHBOARD;
    @state() private _routeParams: Record<string, string> = {};
    @state() private _isFullscreen = false;
    @state() private _versionCheck?: RuntimeVersionCheckResult;

    private _router = getRouter();
    private _originalDrawerWidth: string | null = null;
    private _handleFrontendVersionRecheck = (): void => {
        if (this.hass) {
            this._syncFrontendVersionCheck();
        }
    };

    async connectedCallback() {
        super.connectedCallback();
        window.addEventListener(CARD_BUILDER_FRONTEND_VERSION_RECHECK_EVENT, this._handleFrontendVersionRecheck);
        await this._initialize();

        // Load fullscreen preference from localStorage
        this._loadFullscreenPreference();

        // Subscribe to router events
        this._router.addEventListener('route-changed', this._handleRouteChanged.bind(this));

        // Get initial route
        const {route, params} = this._router.getCurrentRoute();
        this._currentRoute = route;
        this._routeParams = params;
    }

    disconnectedCallback(): void {
        window.removeEventListener(CARD_BUILDER_FRONTEND_VERSION_RECHECK_EVENT, this._handleFrontendVersionRecheck);
        super.disconnectedCallback();
    }

    render() {
        if (this._versionCheck && !this._versionCheck.ok) {
            return this._renderVersionBlocked(this._versionCheck);
        }

        if (!this.hass || !this._isReady) {
            return html``;
        }

        const hideSidebar = ([ROUTES.EDITOR_CREATE, ROUTES.EDITOR_EDIT] as string[]).includes(this._currentRoute);

        return html`
      <app-layout
        .hass=${this.hass}
        .currentRoute=${this._currentRoute}
        ?hideSidebar=${hideSidebar}
        ?isFullscreen=${this._isFullscreen}
        ?narrow=${this.narrow}
        @navigate=${this._handleNavigate}
        @toggle-fullscreen=${this._toggleFullscreen}
        @exit-dashboard=${this._exitToDefaultDashboard}
      >
        ${this._renderCurrentView()}
      </app-layout>
    `;
    }

    protected async firstUpdated(changedProps: PropertyValues): Promise<void> {
        super.firstUpdated(changedProps);

        await this._loadHAComponents();
    }

    protected async _loadHAComponents() {
        if (this._loadedHAComponents) return;

        if (!customElements.get("ha-selector")) {
            await (window as any).loadFragment("ha-selector");

            if (!customElements.get("ha-selector")) {
                console.warn('Unable to load custom element: ha-selector.');
            }
        }

        this._loadedHAComponents = true;
    }

    protected async updated(changedProps: PropertyValues) {
        super.updated(changedProps);

        if (changedProps.has('hass') && this.hass) {
            if (!this._syncFrontendVersionCheck()) {
                return;
            }
            this.cardsManager.setHass(this.hass);
            await this._loadHAComponents();
        }

        // Handle narrow mode changes - exit fullscreen if entering narrow mode
        if (changedProps.has('narrow')) {
            if (this.narrow && this._isFullscreen) {
                this._isFullscreen = false;
                return; // _isFullscreen change will trigger another update
            }
            this._applyFullscreen();
        }

        // Handle fullscreen state changes
        if (changedProps.has('_isFullscreen')) {
            this._applyFullscreen();
        }
    }

    private async _initialize(): Promise<void> {
        // Wait for Home Assistant to be ready
        await this._waitForHass();

        if (!this._syncFrontendVersionCheck()) {
            this._isReady = true;
            return;
        }

        // Force translations loading
        await this.hass.loadFragmentTranslation("lovelace");
        await this.hass.loadBackendTranslation("services");
        await this._initializeRuntimeConfig();

        this._isReady = true;
    }

    private async _initializeRuntimeConfig(): Promise<void> {
        if (!this.hass) return;
        const config = getCardBuilderPanelRuntimeConfig(this.hass);
        setRuntimeConfig(config);
        resolveOutdatedIntegrationIfUpdated(config.integrationVersion);
        notifyRuntimeConfigChange();

        try {
            const service = getAccountStatusService(this.hass);
            const status = await service.getStatus();
            updateRuntimeConfig({hasToken: status.hasToken});
            notifyRuntimeConfigChange();
        } catch (err) {
            console.warn('[CardBuilderPanel] Failed to load account status:', err);
        }
    }

    private async _waitForHass(): Promise<void> {
        return new Promise((resolve) => {
            if (this.hass) {
                resolve();
                return;
            }

            const checkHass = () => {
                if (this.hass) {
                    resolve();
                } else {
                    setTimeout(checkHass, 50);
                }
            };
            checkHass();
        });
    }

    private _loadFullscreenPreference(): void {
        // Only load fullscreen preference if not in narrow mode
        if (!this.narrow) {
            const saved = localStorage.getItem(CardBuilderPanel.FULLSCREEN_STORAGE_KEY);
            if (saved === 'true') {
                this._isFullscreen = true;
                this._applyFullscreen();
            }
        }
    }

    private _applyFullscreen(): void {
        if (this._isFullscreen && !this.narrow) {
            this._hideHASidebar();
        } else {
            this._showHASidebar();
        }
    }

    private _hideHASidebar(): void {
        // Navigate through shadow DOMs to get ha-drawer
        const homeAssistant = document.querySelector('home-assistant');
        if (homeAssistant?.shadowRoot) {
            const homeAssistantMain = homeAssistant.shadowRoot.querySelector('home-assistant-main');
            if (homeAssistantMain?.shadowRoot) {
                const haDrawer = homeAssistantMain.shadowRoot.querySelector('ha-drawer') as HTMLElement;
                if (haDrawer) {
                    // Get the current --mdc-drawer-width value from :host
                    const computedStyle = getComputedStyle(haDrawer);
                    const currentWidth = computedStyle.getPropertyValue('--mdc-drawer-width');

                    // Save the original width if not already saved
                    if (this._originalDrawerWidth === null && currentWidth) {
                        this._originalDrawerWidth = currentWidth.trim();
                    }

                    // Set --mdc-drawer-width to 0
                    haDrawer.style.setProperty('--mdc-drawer-width', '0px');
                }
            }
        }
    }

    private _showHASidebar(): void {
        // Navigate through shadow DOMs to get ha-drawer
        const homeAssistant = document.querySelector('home-assistant');
        if (homeAssistant?.shadowRoot) {
            const homeAssistantMain = homeAssistant.shadowRoot.querySelector('home-assistant-main');
            if (homeAssistantMain?.shadowRoot) {
                const haDrawer = homeAssistantMain.shadowRoot.querySelector('ha-drawer') as HTMLElement;
                if (haDrawer && this._originalDrawerWidth !== null) {
                    // Restore the original --mdc-drawer-width value
                    haDrawer.style.setProperty('--mdc-drawer-width', this._originalDrawerWidth);
                    this._originalDrawerWidth = null;
                }
            }
        }
    }

    private _toggleFullscreen(): void {
        // Fullscreen is only available when not in narrow mode
        if (this.narrow) return;

        this._isFullscreen = !this._isFullscreen;
        localStorage.setItem(CardBuilderPanel.FULLSCREEN_STORAGE_KEY, String(this._isFullscreen));
    }

    private _exitToDefaultDashboard(): void {
        // Navigate to Home Assistant default dashboard
        window.location.href = '/';
    }

    private _handleRouteChanged(e: Event): void {
        const event = e as CustomEvent;
        this._currentRoute = event.detail.route;
        this._routeParams = event.detail.params;
    }

    private _handleNavigate(e: CustomEvent): void {
        const {route} = e.detail;
        this._router.navigate(route);
    }

    private _renderCurrentView() {
        switch (this._currentRoute) {
            case ROUTES.DASHBOARD:
                return html`<dashboard-view .hass=${this.hass}></dashboard-view>`;

            case ROUTES.CARDS:
                return html`<cards-list-view .hass=${this.hass}></cards-list-view>`;

            case ROUTES.ACCOUNT:
                return html`<account-view .hass=${this.hass}></account-view>`;

            case ROUTES.EDITOR_CREATE:
                return html`<editor-view .hass=${this.hass}></editor-view>`;

            case ROUTES.EDITOR_EDIT:
                return html`<editor-view .hass=${this.hass} .cardId=${this._routeParams.id}></editor-view>`;

            default:
                return html`<dashboard-view .hass=${this.hass}></dashboard-view>`;
        }
    }

    private _syncFrontendVersionCheck(): boolean {
        if (!this.hass) {
            return true;
        }

        const result = getCardBuilderFrontendVersionCheck(this.hass);
        if (!this._isSameVersionCheck(result)) {
            this._versionCheck = result;
        }
        return result.ok;
    }

    private _isSameVersionCheck(result: RuntimeVersionCheckResult): boolean {
        const current = this._versionCheck;
        return Boolean(
            current
            && current.ok === result.ok
            && current.jsVersion === result.jsVersion
            && current.runtimeVersion === result.runtimeVersion
        );
    }

    private _renderVersionBlocked(result: RuntimeVersionCheckResult) {
        const copy = getCardBuilderVersionBlockedCopy(result);
        return html`
            <div class="cache-guard-page">
                <div class="cache-guard-box">
                    <h2 class="cache-guard-title">${copy.title}</h2>
                    <p class="cache-guard-message">${copy.message}</p>
                    <div class="cache-guard-versions">
                        <span class="cache-guard-label">Cached JS</span>
                        <span class="cache-guard-value">${copy.jsVersion}</span>
                        <span class="cache-guard-label">Runtime</span>
                        <span class="cache-guard-value">${copy.runtimeVersion}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'card-builder-panel': CardBuilderPanel;
    }
}

console.info(
    `%c ${PANEL_INFO.name} %c v${CARD_BUILDER_VERSION}`,
    `background: ${PANEL_INFO.bgLeft}; color: ${PANEL_INFO.colorLeft}; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `background: ${PANEL_INFO.bgRight}; color: ${PANEL_INFO.colorRight}; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;`
);

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.boot();
