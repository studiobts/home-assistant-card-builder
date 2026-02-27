/**
 * Property Group Component
 *
 * Componente per raggruppare proprietà in sezioni collassabili.
 * Ispirato ai sector di GrapesJS.
 */

import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('property-group')
export class PanelPropertyGroup extends LitElement {
    static styles = css`
    :host {
      display: block;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--bg-secondary);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease;
      border-bottom: 1px solid var(--border-color);
    }

    .group-header:hover {
      background: var(--bg-tertiary);
    }

    .collapse-icon {
      font-size: 10px;
      color: var(--secondary-text-color, #666);
      transition: transform 0.2s ease;
      width: 12px;
      text-align: center;
    }

    .collapse-icon.expanded {
      transform: rotate(90deg);
    }

    .group-label {
      flex: 1;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--primary-text-color, #333);
    }

    .group-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .group-content.collapsed {
      display: none;
    }

    /* Slot content styling */
    ::slotted(.property-row) {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `;
    /** Storage key prefix per persistenza */
    private static STORAGE_PREFIX = 'card-builder-property-group-';
    /** Etichetta del gruppo */
    @property({type: String}) label = '';
    /** ID univoco del gruppo (usato per persistenza stato) */
    @property({type: String}) groupId = '';
    /** Stato collapsed iniziale */
    @property({type: Boolean}) collapsed = false;
    /** Stato collapsed interno (reattivo) */
    @state() private _isCollapsed = false;
    private _hasRestoredState = false;

    connectedCallback(): void {
        super.connectedCallback();
        // Restore collapsed state from localStorage
        this._restoreState();
    }

    willUpdate(changedProperties: Map<string, unknown>): void {
        // Sync with external collapsed prop on first render
        if (changedProperties.has('collapsed') && !this._hasRestoredState) {
            this._isCollapsed = this.collapsed;
        }
    }

    render() {
        return html`
      <div class="property-group">
        <div class="group-header" @click=${this._toggleCollapsed}>
          <span class="group-label">${this.label}</span>
          <span class="collapse-icon ${this._isCollapsed ? '' : 'expanded'}">▶</span>
        </div>
        <div class="group-content ${this._isCollapsed ? 'collapsed' : ''}">
          <slot></slot>
        </div>
      </div>
    `;
    }

    private _restoreState(): void {
        if (!this.groupId) return;

        const storageKey = PanelPropertyGroup.STORAGE_PREFIX + this.groupId;
        const savedState = localStorage.getItem(storageKey);

        if (savedState !== null) {
            this._isCollapsed = savedState === 'true';
            this._hasRestoredState = true;
        } else {
            this._isCollapsed = this.collapsed;
        }
    }

    private _saveState(): void {
        if (!this.groupId) return;

        const storageKey = PanelPropertyGroup.STORAGE_PREFIX + this.groupId;
        localStorage.setItem(storageKey, String(this._isCollapsed));
    }

    private _toggleCollapsed(): void {
        this._isCollapsed = !this._isCollapsed;
        this._saveState();

        this.dispatchEvent(new CustomEvent('group-toggle', {
            detail: {
                groupId: this.groupId,
                collapsed: this._isCollapsed
            },
            bubbles: true,
            composed: true
        }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'property-group': PanelPropertyGroup;
    }
}
