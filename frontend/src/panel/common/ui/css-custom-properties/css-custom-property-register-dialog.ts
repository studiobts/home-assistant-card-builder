/**
 * CustomPropertyRegisterDialog - Create and register custom CSS properties.
 */

import {
    COLOR_SYNTAX,
    CUSTOM_PROPERTY_SYNTAX_OPTIONS,
    getColorInputValue,
    getCSSCustomPropertyRegistry,
    getDefaultInitialValueForSyntax
} from '@/common/core/css-custom-properties';
import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';


@customElement('custom-property-register-dialog')
export class CssCustomPropertyRegisterDialog extends LitElement {
    static styles = css`
    :host {
      display: contents;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1300;
    }

    .dialog {
      width: min(420px, 90vw);
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 8px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: var(--bg-secondary, #f5f5f5);
      border-bottom: 1px solid var(--border-color, #d4d4d4);
    }

    .dialog-title {
      font-size: 13px;
      font-weight: 600;
      margin: 0;
      color: var(--text-primary, #333);
    }

    .close-btn {
      border: 1px solid var(--border-color, #d4d4d4);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
    }

    .dialog-content {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .form-row {
      display: flex;
      gap: 8px;
    }

    .form-row .form-group {
      flex: 1;
    }

    input,
    select {
      padding: 8px 10px;
      font-size: 12px;
      color: var(--text-primary, #333);
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      outline: none;
    }

    .color-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .color-input {
      width: 32px;
      height: 28px;
      padding: 0;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 3px;
      background: transparent;
      cursor: pointer;
    }

    .error-message {
      font-size: 11px;
      color: #c00;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid var(--border-color, #d4d4d4);
      background: var(--bg-secondary, #f5f5f5);
    }

    .btn {
      padding: 6px 12px;
      font-size: 12px;
      border: 1px solid var(--border-color, #d4d4d4);
      background: var(--bg-primary, #fff);
      border-radius: 4px;
      cursor: pointer;
    }

    .btn.primary {
      background: var(--accent-color, #0078d4);
      border-color: var(--accent-color, #0078d4);
      color: #fff;
    }
  `;
    /** Whether dialog is open */
    @property({type: Boolean}) open = false;
    /** Home Assistant instance */
    @property({attribute: false}) hass?: HomeAssistant;
    /** Whether dialog is disabled */
    @property({type: Boolean}) disabled = false;
    @state() private _name = '';
    @state() private _syntax = CUSTOM_PROPERTY_SYNTAX_OPTIONS[0];
    @state() private _inherits = false;
    @state() private _initialValue = getDefaultInitialValueForSyntax(this._syntax);
    @state() private _error = '';

    render() {
        if (!this.open) return nothing;
        const isColor = this._syntax === COLOR_SYNTAX;
        const colorValue = getColorInputValue(this._initialValue);

        return html`
      <div class="overlay" @click=${this.handleClose}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <h2 class="dialog-title">Register property</h2>
            <button class="close-btn" @click=${this.handleClose}>Close</button>
          </div>
          <div class="dialog-content">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input
                type="text"
                placeholder="--custom-prop"
                .value=${this._name}
                @input=${(e: Event) => {
            this._name = (e.target as HTMLInputElement).value;
        }}
                ?disabled=${this.disabled}
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Syntax</label>
                <select
                  .value=${this._syntax}
                  @change=${(e: Event) => {
            this._syntax = (e.target as HTMLSelectElement).value;
            if (!this._initialValue.trim()) {
                this._initialValue = getDefaultInitialValueForSyntax(this._syntax);
            }
        }}
                  ?disabled=${this.disabled}
                >
                  ${CUSTOM_PROPERTY_SYNTAX_OPTIONS.map((option) => html`
                    <option value=${option}>${option}</option>
                  `)}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Inherits</label>
                <select
                  .value=${this._inherits ? 'true' : 'false'}
                  @change=${(e: Event) => {
            this._inherits = (e.target as HTMLSelectElement).value === 'true';
        }}
                  ?disabled=${this.disabled}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Initial value</label>
              ${isColor ? html`
                <div class="color-row">
                  <input
                    class="color-input"
                    type="color"
                    .value=${colorValue}
                    @input=${(e: Event) => {
            this._initialValue = (e.target as HTMLInputElement).value;
        }}
                    ?disabled=${this.disabled}
                  />
                  <input
                    type="text"
                    placeholder="#ff00aa"
                    .value=${this._initialValue}
                    @input=${(e: Event) => {
            this._initialValue = (e.target as HTMLInputElement).value;
        }}
                    ?disabled=${this.disabled}
                  />
                </div>
              ` : html`
                <input
                  type="text"
                  placeholder=${getDefaultInitialValueForSyntax(this._syntax)}
                  .value=${this._initialValue}
                  @input=${(e: Event) => {
            this._initialValue = (e.target as HTMLInputElement).value;
        }}
                  ?disabled=${this.disabled}
                />
              `}
            </div>

            ${this._error ? html`
              <div class="error-message">${this._error}</div>
            ` : nothing}
          </div>
          <div class="dialog-footer">
            <button class="btn" @click=${this.handleClose} ?disabled=${this.disabled}>Cancel</button>
            <button
              class="btn primary"
              @click=${this.handleRegister}
              ?disabled=${this.disabled || !this._name.trim()}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    `;
    }

    protected updated(changedProps: PropertyValues): void {
        if (changedProps.has('open') && this.open) {
            this.reset();
        }
    }

    private reset(): void {
        this._name = '';
        this._syntax = CUSTOM_PROPERTY_SYNTAX_OPTIONS[0];
        this._inherits = false;
        this._initialValue = getDefaultInitialValueForSyntax(this._syntax);
        this._error = '';
    }

    private handleClose(): void {
        this.dispatchEvent(new CustomEvent('close', {bubbles: true, composed: true}));
    }

    private async handleRegister(): Promise<void> {
        const registry = getCSSCustomPropertyRegistry(this.hass);
        const result = await registry.add({
            name: this._name.trim(),
            syntax: this._syntax,
            inherits: this._inherits,
            initialValue: this._initialValue.trim(),
        });

        if (!result.ok) {
            this._error = result.error ?? 'Failed to register property.';
            return;
        }

        this.handleClose();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'custom-property-register-dialog': CssCustomPropertyRegisterDialog;
    }
}
