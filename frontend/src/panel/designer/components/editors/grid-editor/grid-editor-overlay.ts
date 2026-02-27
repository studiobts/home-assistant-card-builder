import type { GridConfig } from '@/common/blocks/types';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './grid-layout-editor';

/**
 * Grid Editor Overlay - Slide-in panel for grid editing
 * Covers most of the canvas with a dark transparent backdrop
 */
@customElement('grid-editor-overlay')
export class GridEditorOverlay extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: fixed;
            width: 100vw;
            top: 0;
            left: 100%;
            bottom: 0;
            z-index: 1000;
            pointer-events: none;
        }

        :host([open]) {
            pointer-events: auto;
            left: 0;
        }

        .overlay-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            opacity: 0;
            transition: opacity 0.8s ease;
            backdrop-filter: blur(3px);
        }

        :host([open]) .overlay-backdrop {
            opacity: 1;
        }


        .editor-panel {
            position: absolute;
            top: 0;
            left: 100%;
            bottom: 0;
            width: min(85vw, 1400px);
            background: var(--bg-primary, #fff);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 1;
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(0);
        }

        :host([open]) .editor-panel {
            transform: translateX(-100%);
        }

        .editor-content {
            flex: 1;
            overflow: hidden;
        }
    `;
    @property({type: Boolean, reflect: true})
    open = false;
    @property({type: Object})
    config?: GridConfig;
    @state()
    private editingConfig?: GridConfig;

    connectedCallback() {
        super.connectedCallback();
        // Initialize editing config when opening
        if (this.config) {
            this.editingConfig = JSON.parse(JSON.stringify(this.config));
        }
    }

    updated(changedProps: Map<string, unknown>) {
        super.updated(changedProps);

        // Update editing config when overlay opens or config changes
        if (changedProps.has('open') && this.open && this.config) {
            // Always refresh config when opening
            this.editingConfig = JSON.parse(JSON.stringify(this.config));
        } else if (changedProps.has('config') && this.config && this.open) {
            // Update config if it changes while overlay is open
            this.editingConfig = JSON.parse(JSON.stringify(this.config));
        }

        // Handle escape key
        if (changedProps.has('open')) {
            if (this.open) {
                this._addEscapeListener();
            } else {
                this._removeEscapeListener();
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEscapeListener();
    }

    render() {
        if (!this.editingConfig) {
            return html``;
        }

        return html`
            <div class="overlay-backdrop" @click=${this._handleBackdropClick}></div>
            <div class="editor-panel">
                <div class="editor-content">
                    <grid-layout-editor
                            .config=${this.editingConfig}
                            @editor-cancel=${this._handleCancel}
                            @editor-apply=${this._handleApply}
                    ></grid-layout-editor>
                </div>
            </div>
        `;
    }

    private _escapeHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this._handleCancel();
        }
    };

    private _addEscapeListener() {
        window.addEventListener('keydown', this._escapeHandler);
    }

    private _removeEscapeListener() {
        window.removeEventListener('keydown', this._escapeHandler);
    }

    private _handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            this._handleCancel();
        }
    }

    private _handleCancel() {
        this.dispatchEvent(
            new CustomEvent('overlay-cancel', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleApply(e: CustomEvent) {
        this.dispatchEvent(
            new CustomEvent('overlay-apply', {
                detail: e.detail,
                bubbles: true,
                composed: true,
            })
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'grid-editor-overlay': GridEditorOverlay;
    }
}

