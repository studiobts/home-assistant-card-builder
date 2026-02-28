import type { HomeAssistant, Panel } from 'custom-card-helpers';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';

import './designer/main.ts';
import './components';
import './media-manager';
import './views';
import { getRouter, ROUTES } from './router';
import { CardsManager, cardsManagerContext } from './cards-manager';

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

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
      font-size: var(--paper-font-body1_-_font-size, 14px);
      color: var(--primary-text-color, #212121);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--primary-color, #03a9f4);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .error {
      padding: 16px;
      color: var(--error-color, #db4437);
      background: var(--card-background-color, #ffffff);
      border-radius: 8px;
      margin: 16px;
      border: 1px solid var(--error-color, #db4437);
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

    private _router = getRouter();
    private _originalDrawerWidth: string | null = null;

    async connectedCallback() {
        super.connectedCallback();
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

    render() {
        if (!this.hass || !this._isReady) {
            return html`
        <div class="panel-container">
          <div class="loading">
            <div class="loading-content">
              <div class="spinner"></div>
              <div>Loading Card Builder...</div>
            </div>
          </div>
        </div>
      `;
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
        // Force translations loading
        await this.hass.loadFragmentTranslation("lovelace");
        await this.hass.loadBackendTranslation("services");

        this._isReady = true;
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

            case ROUTES.EDITOR_CREATE:
                return html`<editor-view .hass=${this.hass}></editor-view>`;

            case ROUTES.EDITOR_EDIT:
                return html`<editor-view .hass=${this.hass} .cardId=${this._routeParams.id}></editor-view>`;

            default:
                return html`<dashboard-view .hass=${this.hass}></dashboard-view>`;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'card-builder-panel': CardBuilderPanel;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.boot();
