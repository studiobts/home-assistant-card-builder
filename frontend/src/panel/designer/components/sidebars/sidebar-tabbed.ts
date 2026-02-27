import type { TabConfig } from '@/panel/designer/types.ts';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('sidebar-tabbed')
export class SidebarTabbed extends LitElement {

    static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .tabs {
      display: flex;
      background: var(--cb-sidebar-background);
      border-bottom: 1px solid var(--cb-sidebar-section-border-color);
      height: var(--header-height);
      box-sizing: border-box;
    }
    .tab {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      border-bottom: 2px solid transparent;
    }
    .tab:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .tab.active {
      color: var(--accent-color);
      border-bottom-color: var(--accent-color);
    }
    .tab-content {
      flex: 1;
      overflow: hidden;
      display: none;
    }
    .tab-content.active {
      display: flex;
      flex-direction: column;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: var(--text-secondary);
      font-size: 12px;
    }
  `;
    @property({type: Array}) tabs: TabConfig[] = [];
    @state() private activeTab: string = '';

    render() {
        if (this.tabs.length === 0) {
            return html`<div class="empty-state">No tabs configured</div>`;
        }

        return html`
      <div class="tabs">
        ${this.tabs.map(
            (tab) => html`
            <button
              class="tab ${this.activeTab === tab.id ? 'active' : ''}"
              @click=${() => this._setActiveTab(tab.id)}
            >
              ${tab.label}
            </button>
          `
        )}
      </div>
      ${this.tabs.map(
            (tab) => html`
          <div class="tab-content ${this.activeTab === tab.id ? 'active' : ''}">
            ${this._renderTabContent(tab)}
          </div>
        `
        )}
    `;
    }

    public setActiveTab(tabId: string): void {
        this._setActiveTab(tabId);
    }

    protected firstUpdated(changedProps: PropertyValues): void {
        super.firstUpdated(changedProps);
        // Set first tab as active by default if not set
        if (this.tabs.length > 0 && !this.activeTab) {
            this.activeTab = this.tabs[0].id;
        }
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        // If tabs changed and activeTab is not valid, reset to first tab
        if (changedProps.has('tabs') && this.tabs.length > 0) {
            const isValidTab = this.tabs.some(tab => tab.id === this.activeTab);
            if (!isValidTab) {
                this.activeTab = this.tabs[0].id;
            }
        }
    }

    private _renderTabContent(tab: TabConfig) {
        const props = tab.props || {};

        // Render based on component name
        switch (tab.component) {
            // Left Sidebar Panels
            case 'panel-blocks':
                return html`<panel-blocks></panel-blocks>`;
            case 'panel-layers':
                return html`<panel-layers></panel-layers>`;
            // Right Sidebar Panels
            case 'panel-properties':
                return html`<panel-properties .hass=${props.hass}></panel-properties>`;
            case 'panel-style':
                return html`<panel-styles
                  .hass=${props.hass}      
                  .canvasWidth=${props.canvasWidth}
                  .canvasHeight=${props.canvasHeight}
                  .canvas=${props.canvas}
                ></panel-styles>`;
            case 'panel-actions':
                return html`<panel-actions .hass=${props.hass}></panel-actions>`;
            default:
                return html`<div class="empty-state">Unknown component: ${tab.component}</div>`;
        }
    }

    private _setActiveTab(tabId: string): void {
        this.activeTab = tabId;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sidebar-tabbed': SidebarTabbed;
    }
}
