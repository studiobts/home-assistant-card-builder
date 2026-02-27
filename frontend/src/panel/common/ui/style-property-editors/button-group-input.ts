/**
 * ButtonGroupInput - Multi-option button group selector
 */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export interface ButtonGroupOption {
    value: string;
    icon: string;
    tooltip?: string;
}

@customElement('sm-button-group-input')
export class SMButtonGroupInput extends LitElement {
    static styles = css`
    :host {
      display: block;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .button-group {
      display: flex;
      gap: 4px;
      background: var(--bg-tertiary, #f0f0f0);
      padding: 4px;
      border-radius: 6px;
    }

    .button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px 5px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--text-secondary, #666);
      position: relative;
    }

    .button:hover {
      background: var(--bg-secondary, #e0e0e0);
      color: var(--text-primary, #333);
    }

    .button.active {
      background: var(--accent-color, #0078d4);
      color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    .button svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .button::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 10px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      margin-bottom: 4px;
    }

    .button:hover::after {
      opacity: 1;
    }
  `;
    @property({type: String}) value = '';
    @property({type: String}) label?: string;
    @property({type: Array}) options: ButtonGroupOption[] = [];

    render() {
        return html`
      <div class="container">
        ${this.label ? html`<div class="label">${this.label}</div>` : ''}
        <div class="button-group">
          ${this.options.map(option => html`
            <button
              class="button ${this.value === option.value ? 'active' : ''}"
              @click=${() => this.handleSelect(option.value)}
              data-tooltip="${option.tooltip || option.value}"
            >
                ${unsafeHTML(option.icon)}
            </button>
          `)}
        </div>
      </div>
    `;
    }

    private handleSelect(value: string) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {value},
            bubbles: true,
            composed: true
        }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-button-group-input': SMButtonGroupInput;
    }
}

