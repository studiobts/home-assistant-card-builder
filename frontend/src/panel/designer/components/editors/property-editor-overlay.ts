/**
 * Property Editor Overlay
 *
 * Shared slide-in panel used by property editors.
 */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('property-editor-overlay')
export class PropertyEditorOverlay extends LitElement {
    static styles = css`
    :host {
      display: block;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--right-sidebar-width, 260px);
      z-index: 110;
      pointer-events: none;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host([open]) {
      pointer-events: auto;
      transform: translateX(0);
    }

    .editor-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary, #fff);
      border-left: 1px solid var(--border-color, #d4d4d4);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
    }

    .editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--bg-secondary, #f5f5f5);
      border-bottom: 1px solid var(--border-color, #d4d4d4);
      gap: 12px;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .header-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .header-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #333);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .close-button {
      border: 1px solid var(--border-color, #d4d4d4);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 11px;
      cursor: pointer;
    }

    .close-button:hover {
      border-color: var(--accent-color, #0078d4);
      color: var(--accent-color, #0078d4);
    }

    .editor-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
  `;
    /** Whether overlay is open */
    @property({type: Boolean, reflect: true})
    open = false;
    /** Header title */
    @property({type: String})
    title = '';
    /** Header subtitle */
    @property({type: String})
    subtitle = '';

    updated(changedProps: Map<string, unknown>): void {
        super.updated(changedProps);

        if (changedProps.has('open')) {
            if (this.open) {
                this.addEscapeListener();
            } else {
                this.removeEscapeListener();
            }
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEscapeListener();
    }

    render() {
        return html`
      <div class="editor-panel">
        <div class="editor-header">
          <div class="header-text">
            <span class="header-title">${this.title}</span>
            <span class="header-subtitle">${this.subtitle}</span>
          </div>
          <button class="close-button" @click=${this.handleClose}>Close</button>
        </div>
        <div class="editor-content">
          <slot></slot>
        </div>
      </div>
    `;
    }

    private escapeHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.handleClose();
        }
    };

    private addEscapeListener(): void {
        window.addEventListener('keydown', this.escapeHandler);
    }

    private removeEscapeListener(): void {
        window.removeEventListener('keydown', this.escapeHandler);
    }

    private handleClose(): void {
        this.dispatchEvent(
            new CustomEvent('overlay-close', {
                bubbles: true,
                composed: true,
            })
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'property-editor-overlay': PropertyEditorOverlay;
    }
}
