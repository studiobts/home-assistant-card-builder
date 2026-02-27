import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('draggable-block')
export class DraggableBlock extends LitElement {
    static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: 2px;
      user-select: none;
      transition: all 0.3s ease;
    }
    :host(:hover) {
      border-color: var(--border-color);
      background: var(--bg-secondary);
      cursor: move;
    }
    .icon {
      font-size: 20px;
      margin-bottom: 4px;
    }
    .label {
      font-size: 12px;
      font-family: var(--cb-font-family), sans-serif;
      color: #515858;
    }
  `;
    @property({type: String, attribute: 'block-type'})
    blockType = '';
    @property({type: String})
    icon = '';
    @property({type: String})
    label = '';

    render() {
        return html`
      <span class="icon">
        ${unsafeHTML(this.icon)}
      </span>
      <span class="label">${this.label}</span>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'draggable-block': DraggableBlock;
    }
}

