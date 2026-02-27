import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export abstract class OverlayDialogBase extends LitElement {
    static styles = [css`
        :host {
            position: fixed;
            inset: 0;
            z-index: 190;
            pointer-events: none;
            display: block;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .overlay-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            opacity: 0;
            transition: opacity 0.25s ease;
        }

        :host([open]) .overlay-backdrop {
            opacity: 1;
        }

        .dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            width: var(--overlay-dialog-width, min(92vw, 1400px));
            height: var(--overlay-dialog-height, min(86vh, 860px));
            transform: translate(-50%, -48%) scale(0.98);
            background: var(--bg-primary, #fff);
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
            display: flex;
            flex-direction: column;
            opacity: 0;
            transition: transform 0.25s ease, opacity 0.25s ease;
            overflow: hidden;
        }

        :host([open]) .dialog {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }

        .dialog-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            background: var(--bg-secondary, #f5f5f5);
        }

        .dialog-header-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .dialog-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-primary, #333);
        }

        .dialog-subtitle {
            font-size: 12px;
            color: var(--text-secondary, #666);
        }

        .dialog-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .dialog-close {
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .dialog-body {
            flex: 1;
            overflow: hidden;
        }

        .dialog-footer {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            border-top: 1px solid var(--border-color, #e0e0e0);
            background: var(--bg-secondary, #f5f5f5);
        }

        .footer-spacer {
            flex: 1;
        }

        .primary-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--accent-color, #2196f3);
            color: #fff;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            --mdc-icon-size: 18px;
        }

        .secondary-btn {
            padding: 6px 12px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 4px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
        }

        .danger-btn {
            border: 1px solid rgba(211, 47, 47, 0.4);
            background: rgba(211, 47, 47, 0.1);
            color: #b71c1c;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
        }

        .primary-btn:disabled,
        .secondary-btn:disabled,
        .danger-btn:disabled,
        .dialog-close:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `];

    @property({type: Boolean, reflect: true})
    open = false;

    protected abstract get dialogTitle(): string;

    protected get dialogSubtitle(): string | null {
        return null;
    }

    protected get closeLabel(): string {
        return 'Close';
    }

    protected get showCloseButton(): boolean {
        return true;
    }

    protected get closeOnBackdrop(): boolean {
        return true;
    }

    protected get closeOnEscape(): boolean {
        return true;
    }

    protected renderDialogHeaderActions(): TemplateResult | typeof nothing {
        return nothing;
    }

    protected renderDialogTop(): TemplateResult | typeof nothing {
        return nothing;
    }

    protected abstract renderDialogBody(): TemplateResult;

    protected renderDialogFooter(): TemplateResult | typeof nothing {
        return nothing;
    }

    protected onBeforeClose(): void {
        // no-op by default
    }

    protected updated(changedProps: PropertyValues): void {
        if (changedProps.has('open')) {
            if (this.open && this.closeOnEscape) {
                this._addEscapeListener();
            } else {
                this._removeEscapeListener();
            }
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this._removeEscapeListener();
    }

    render() {
        if (!this.open) {
            return html``;
        }

        return html`
            <div class="overlay-backdrop" @click=${this._handleBackdropClick}></div>
            <div class="dialog">
                ${this.renderDialogHeader()}
                ${this.renderDialogTop()}
                <div class="dialog-body">
                    ${this.renderDialogBody()}
                </div>
                ${this.renderDialogFooter()}
            </div>
        `;
    }

    protected renderDialogHeader(): TemplateResult {
        return html`
            <div class="dialog-header">
                <div class="dialog-header-text">
                    <div class="dialog-title">${this.dialogTitle}</div>
                    ${this.dialogSubtitle ? html`
                        <div class="dialog-subtitle">${this.dialogSubtitle}</div>
                    ` : nothing}
                </div>
                <div class="dialog-header-actions">
                    ${this.renderDialogHeaderActions()}
                    ${this.showCloseButton ? html`
                        <button class="dialog-close" @click=${this.handleClose}>
                            ${this.closeLabel}
                        </button>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    protected handleClose = (): void => {
        this.onBeforeClose();
        this.dispatchEvent(new CustomEvent('overlay-close', {bubbles: true, composed: true}));
    };

    private _handleBackdropClick = (e: MouseEvent): void => {
        if (!this.closeOnBackdrop) return;
        if (e.target === e.currentTarget) {
            this.handleClose();
        }
    };

    private _handleEscape = (e: KeyboardEvent): void => {
        if (!this.closeOnEscape) return;
        if (e.key === 'Escape') {
            this.handleClose();
        }
    };

    private _addEscapeListener(): void {
        window.addEventListener('keydown', this._handleEscape);
    }

    private _removeEscapeListener(): void {
        window.removeEventListener('keydown', this._handleEscape);
    }
}
