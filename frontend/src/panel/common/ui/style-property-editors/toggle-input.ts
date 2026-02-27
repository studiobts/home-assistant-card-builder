/**
 * ToggleInput - Boolean toggle switch
 */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sm-toggle-input')
export class SMToggleInput extends LitElement {
    static styles = css`
    :host {
      display: block;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .label {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .toggle-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-label {
      font-size: 11px;
      color: var(--text-secondary, #666);
      min-width: 45px;
      text-align: right;
    }

    .toggle {
      position: relative;
      width: 40px;
      height: 20px;
      background: var(--bg-tertiary, #e0e0e0);
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .toggle.active {
      background: var(--accent-color, #0078d4);
    }

    .toggle-handle {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .toggle.active .toggle-handle {
      transform: translateX(20px);
    }
  `;
    @property({type: Boolean}) value = false;
    @property({type: String}) label?: string;
    @property({type: String}) labelOn = 'On';
    @property({type: String}) labelOff = 'Off';

    render() {
        return html`
      <div class="container">
        ${this.label ? html`<div class="label">${this.label}</div>` : ''}
        <div class="toggle-wrapper">
          <div class="toggle-label">${this.value ? this.labelOn : this.labelOff}</div>
          <div
            class="toggle ${this.value ? 'active' : ''}"
            @click=${this.handleToggle}
          >
            <div class="toggle-handle"></div>
          </div>
        </div>
      </div>
    `;
    }

    private handleToggle() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {value: !this.value},
            bubbles: true,
            composed: true
        }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-toggle-input': SMToggleInput;
    }
}

