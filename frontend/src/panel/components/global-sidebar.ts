import type { HomeAssistant } from 'custom-card-helpers';
import { ROUTES } from "@/panel/router";
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Global sidebar for navigation
 * Visible in all views except editor
 */
@customElement('global-sidebar')
export class GlobalSidebar extends LitElement {
    static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 200px;
      background-color: var(--sidebar-background-color, var(--card-background-color));
      border-right: 1px solid var(--divider-color);
      transition: width 0.3s ease;
      overflow: hidden;
    }

    :host([collapsed]) {
      width: 56px;
    }

    .sidebar-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid var(--divider-color);
      box-sizing: border-box;
      height: calc(var(--header-height) + var(--safe-area-inset-top, var(--ha-space-0)))
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.3s ease;
    }
      
    :host([collapsed]) .sidebar-header {
        justify-content: center;
    }  

    :host([collapsed]) .sidebar-title {
      opacity: 0;
      width: 0;
    }

    .toggle-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .toggle-button:hover {
      background-color: var(--secondary-background-color);
    }

    .menu {
      list-style: none;
      margin: 0;
      padding: 8px 0;
      flex: 1;
      overflow-y: auto;
    }

    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      color: var(--primary-text-color);
      text-decoration: none;
      transition: background-color 0.2s ease;
    }

    .menu-item.active {
      background-color: var(--primary-color);
      color: var(--text-primary-color, white);
    }

    .menu-item-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-right: 12px;
      transition: margin-right 0.3s ease;
    }

    :host([collapsed]) .menu-item-icon {
      margin-right: 0;
    }

    .menu-item-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.3s ease;
    }

    :host([collapsed]) .menu-item-label {
      opacity: 0;
      width: 0;
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .sidebar-footer {
      border-top: 1px solid var(--divider-color);
      padding: 8px 0;
    }

    .footer-button {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      color: var(--primary-text-color);
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      transition: background-color 0.2s ease;
    }

    .footer-button:hover {
      background-color: var(--secondary-background-color);
    }

    .footer-button-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-right: 12px;
      transition: margin-right 0.3s ease;
    }

    :host([collapsed]) .footer-button-icon {
      margin-right: 0;
    }

    .footer-button-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.3s ease;
    }

    :host([collapsed]) .footer-button-label {
      opacity: 0;
      width: 0;
    }
  `;
    @property({attribute: false})
    hass?: HomeAssistant;
    @property({type: String})
    activeRoute = 'dashboard';
    @property({type: Boolean, reflect: true})
    collapsed = false;
    @property({type: Boolean})
    isFullscreen = false;
    @property({type: Boolean})
    narrow = false;
    private menuItems = [
        {id: ROUTES.DASHBOARD, icon: 'mdi:view-dashboard', label: 'Dashboard'},
        {id: ROUTES.CARDS, icon: 'mdi:cards', label: 'Cards'},
        {id: ROUTES.EDITOR_CREATE, icon: 'mdi:plus-circle', label: 'New Card'},
    ];

    render() {
        return html`
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="sidebar-title">Card Builder</div>
          <button
            class="toggle-button"
            @click=${this._toggleCollapse}
            title=${this.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
              <ha-icon icon="mdi:chevron-${this.collapsed ? 'right' : 'left'}"></ha-icon>
          </button>
        </div>

        <nav>
          <ul class="menu">
            ${this.menuItems.map(item => this._renderMenuItem(item))}
          </ul>
        </nav>

        ${!this.narrow ? this._renderFooter() : ''}
      </div>
    `;
    }

    private _renderMenuItem(item: { id: string; icon: string; label: string }) {
        const isActive = this.activeRoute === item.id;

        return html`
      <li
        class="menu-item ${isActive ? 'active' : ''}"
        @click=${() => this._handleNavigate(item.id)}
        title=${this.collapsed ? item.label : ''}
      >
          <ha-icon icon="${item.icon}" class="menu-item-icon"></ha-icon>
        <span class="menu-item-label">${item.label}</span>
      </li>
    `;
    }

    private _renderFooter() {
        if (this.isFullscreen) {
            return html`
        <div class="sidebar-footer">
          <button
            class="footer-button"
            @click=${this._handleExitDashboard}
            title=${this.collapsed ? 'Exit to dashboard' : ''}
          >
              <ha-icon icon="mdi:home" class="footer-button-icon"></ha-icon>
            <span class="footer-button-label">Exit to dashboard</span>
          </button>
          <button
            class="footer-button"
            @click=${this._handleToggleFullscreen}
            title=${this.collapsed ? 'Exit fullscreen' : ''}
          >
              <ha-icon icon="mdi:fullscreen-exit" class="footer-button-icon"></ha-icon>
            <span class="footer-button-label">Exit fullscreen</span>
          </button>
        </div>
      `;
        } else {
            return html`
        <div class="sidebar-footer">
          <button
            class="footer-button"
            @click=${this._handleToggleFullscreen}
            title=${this.collapsed ? 'Enter fullscreen' : ''}
          >
              <ha-icon icon="mdi:fullscreen" class="footer-button-icon"></ha-icon>
            <span class="footer-button-label">Enter fullscreen</span>
          </button>
        </div>
      `;
        }
    }

    private _toggleCollapse(): void {
        this.collapsed = !this.collapsed;
    }

    private _handleNavigate(routeId: string): void {
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: {route: routeId},
        }));
    }

    private _handleToggleFullscreen(): void {
        this.dispatchEvent(new CustomEvent('toggle-fullscreen'));
    }

    private _handleExitDashboard(): void {
        this.dispatchEvent(new CustomEvent('exit-dashboard'));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'global-sidebar': GlobalSidebar;
    }
}

