/**
 * AnchorSelector - Visual selector for position anchor point
 *
 * Allows selecting the reference point for positioning with a 3x3 grid:
 * - top-left, top-center, top-right
 * - middle-left, middle-center, middle-right
 * - bottom-left, bottom-center, bottom-right
 */

import type { AnchorPoint } from '@/common/blocks/core/renderer';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sm-anchor-selector')
export class SMAnchorSelector extends LitElement {
    static styles = css`
    :host {
      display: block;
    }

    .label {
      display: block;
      margin-bottom: 5px;
      font-size: 10px;
      font-weight: 500;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .anchor-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 8px;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 3px;
      position: relative;
    }

    .anchor-point {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: var(--bg-tertiary, #e8e8e8);
      border: 2px solid transparent;
      border-radius: 3px;
      transition: all 0.15s ease;
    }

    .anchor-point:hover {
      background: var(--bg-primary, #fff);
      border-color: var(--accent-color, #0078d4);
    }

    .anchor-point.active {
      background: var(--accent-color, #0078d4);
      border-color: var(--accent-color, #0078d4);
    }

    .anchor-point::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--text-secondary, #666);
      border-radius: 50%;
      transition: background 0.15s ease;
    }

    .anchor-point.active::before {
      background: white;
    }
  `;
    @property({type: String}) value: AnchorPoint = 'top-left';
    @property({type: String}) label?: string;

    render() {
        const anchors: Array<{ value: AnchorPoint; label: string }> = [
            {value: 'top-left', label: 'Top Left'},
            {value: 'top-center', label: 'Top Center'},
            {value: 'top-right', label: 'Top Right'},
            {value: 'middle-left', label: 'Middle Left'},
            {value: 'middle-center', label: 'Middle Center'},
            {value: 'middle-right', label: 'Middle Right'},
            {value: 'bottom-left', label: 'Bottom Left'},
            {value: 'bottom-center', label: 'Bottom Center'},
            {value: 'bottom-right', label: 'Bottom Right'},
        ];

        return html`
      ${this.label ? html`<div class="label">${this.label}</div>` : ''}
      <div class="anchor-grid">
        ${anchors.map(anchor => html`
          <div
            class="anchor-point ${this.value === anchor.value ? 'active' : ''}"
            @click=${() => this.handleSelect(anchor.value)}
            title="${anchor.label}"
          ></div>
        `)}
      </div>
    `;
    }

    private handleSelect(anchor: AnchorPoint) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {value: anchor},
            bubbles: true,
            composed: true
        }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-anchor-selector': SMAnchorSelector;
    }
}

