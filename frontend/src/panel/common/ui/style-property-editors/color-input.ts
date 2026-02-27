/**
 * ColorInput - Color picker with preview and text input
 *
 * Features:
 * - Native color picker
 * - Transparent background pattern
 * - Color swatch preview
 * - Text input for hex/rgb values
 */

import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseInput } from './base-input';

@customElement('sm-color-input')
export class SMColorInput extends BaseInput<string> {
    static styles = [
        ...BaseInput.styles,
        css`
      .preview {
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-tertiary, #e8e8e8);
        cursor: pointer;
        position: relative;
        border-right: 1px solid var(--border-color, #d4d4d4);
      }

      .preview::before {
        content: '';
        position: absolute;
        inset: 4px;
        background: linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 8px 8px;
        background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        border-radius: 2px;
      }

      .swatch {
        position: absolute;
        inset: 4px;
        border-radius: 2px;
        border: 1px solid rgba(0,0,0,0.1);
      }

      input[type="color"] {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }

      input[type="text"] {
        flex: 1;
        padding: 5px 8px;
        border: none;
        background: transparent;
        color: var(--text-primary, #333);
        font-size: 11px;
        font-family: 'Courier New', monospace;
        outline: none;
      }
    `
    ];
    @property({type: String}) override value: string = '#000000';

    protected renderInput() {
        return html`
      <div class="input-wrapper">
        <div class="preview">
          <div class="swatch" style="background: ${this.value}"></div>
          <input
            type="color"
            .value=${this.value}
            @input=${this.handleChange}
          />
        </div>
        <input
          type="text"
          .value=${this.value}
          @input=${this.handleChange}
        />
      </div>
    `;
    }

    private handleChange(e: Event) {
        const target = e.target as HTMLInputElement;
        this.dispatchChange({value: target.value});
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-color-input': SMColorInput;
    }
}

