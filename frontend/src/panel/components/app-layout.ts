import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './global-sidebar';

/**
 * Main application layout
 * Manages sidebar + content area
 */
@customElement('app-layout')
export class AppLayout extends LitElement {
    static styles = css`
        :host {
            display: flex;
            height: 100vh;
            width: 100%;
            background-color: var(--primary-background-color);
            overflow: hidden;
        }

        .sidebar-container {
            flex-shrink: 0;
            height: 100%;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        :host([hideSidebar]) .sidebar-container {
            transform: translateX(-100%);
            opacity: 0;
            pointer-events: none;
            position: absolute;
        }

        .content-area {
            flex: 1;
            height: 100%;
            overflow: auto;
            transition: margin-left 0.3s ease;
        }

        :host([hideSidebar]) .content-area {
            margin-left: 0;
        }

        /* Scrollbar styling for dark/light mode */

        .content-area::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .content-area::-webkit-scrollbar-track {
            background: var(--primary-background-color);
        }

        .content-area::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb-color);
            border-radius: 4px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color);
        }
    `;
    @property({attribute: false})
    hass?: HomeAssistant;
    @property({type: String})
    currentRoute = 'dashboard';
    @property({type: Boolean, reflect: true})
    hideSidebar = false;
    @property({type: Boolean})
    isFullscreen = false;
    @property({type: Boolean})
    narrow = false;

    render() {
        return html`
            ${!this.hideSidebar ? html`
                <div class="sidebar-container">
                    <global-sidebar
                            .hass=${this.hass}
                            .activeRoute=${this.currentRoute}
                            ?isFullscreen=${this.isFullscreen}
                            ?narrow=${this.narrow}
                            @navigate=${this._handleNavigate}
                            @toggle-fullscreen=${this._handleToggleFullscreen}
                            @exit-dashboard=${this._handleExitDashboard}
                    ></global-sidebar>
                </div>
            ` : ''}

            <div class="content-area">
                <slot></slot>
            </div>
        `;
    }

    private _handleNavigate(e: CustomEvent): void {
        // Forward navigate event to parent
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: e.detail,
        }));
    }

    private _handleToggleFullscreen(): void {
        // Forward toggle-fullscreen event to parent
        this.dispatchEvent(new CustomEvent('toggle-fullscreen'));
    }

    private _handleExitDashboard(): void {
        // Forward exit-dashboard event to parent
        this.dispatchEvent(new CustomEvent('exit-dashboard'));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'app-layout': AppLayout;
    }
}

