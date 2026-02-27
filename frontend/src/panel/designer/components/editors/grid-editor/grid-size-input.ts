import type { GridDimension, GridUnit } from '@/common/blocks/types';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Grid Size Input - Combined input for dimension value and unit
 */
@customElement('grid-size-input')
export class GridSizeInput extends LitElement {
    static styles = css`
    :host {
      display: block;
    }

    .size-input-container {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .index-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      min-width: 20px;
    }

    .value-input {
      flex: 1;
      padding: 4px 6px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .value-input:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .unit-select {
      padding: 4px 6px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .unit-select:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .minmax-inputs {
      display: flex;
      gap: 4px;
      margin-top: 4px;
      padding-left: 24px;
    }

    .minmax-label {
      font-size: 9px;
      color: var(--text-secondary, #999);
      min-width: 30px;
      display: flex;
      align-items: center;
    }

    .minmax-input {
      flex: 1;
      padding: 3px 5px;
      font-size: 10px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 2px;
      background: var(--bg-primary, #fff);
    }
  `;
    @property({type: Object})
    dimension!: GridDimension;
    @property({type: Number})
    index!: number;
    @property({type: String})
    type!: 'row' | 'column';

    render() {
        const showValue = this.dimension.unit !== 'auto';
        const showMinMax = this.dimension.unit === 'minmax';

        return html`
      <div class="size-input-container">
        <span class="index-label">${this.index + 1}</span>
        ${showValue
            ? html`
              <input
                type="number"
                class="value-input"
                .value=${this.dimension.value.toString()}
                @input=${this._handleValueChange}
                min="0"
                step=${this.dimension.unit === 'fr' ? '0.1' : '1'}
              />
            `
            : ''
        }
        <select class="unit-select" .value=${this.dimension.unit} @change=${this._handleUnitChange}>
          <option value="fr">fr</option>
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="auto">auto</option>
          <option value="minmax">minmax</option>
        </select>
      </div>
      ${showMinMax
            ? html`
            <div class="minmax-inputs">
              <span class="minmax-label">min:</span>
              <input
                type="number"
                class="minmax-input"
                .value=${(this.dimension.minValue ?? 100).toString()}
                @input=${(e: Event) => this._handleMinMaxChange(e, 'min')}
                min="0"
              />
              <span class="minmax-label">max:</span>
              <input
                type="number"
                class="minmax-input"
                .value=${(this.dimension.maxValue ?? 300).toString()}
                @input=${(e: Event) => this._handleMinMaxChange(e, 'max')}
                min="0"
              />
            </div>
          `
            : ''
        }
    `;
    }

    private _handleValueChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const value = parseFloat(input.value) || 0;

        this.dispatchEvent(
            new CustomEvent('dimension-change', {
                detail: {
                    index: this.index,
                    type: this.type,
                    dimension: {...this.dimension, value},
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleUnitChange(e: Event) {
        const select = e.target as HTMLSelectElement;
        const unit = select.value as GridUnit;

        const updatedDimension: GridDimension = {
            ...this.dimension,
            unit,
        };

        // Set defaults for minmax
        if (unit === 'minmax') {
            updatedDimension.minValue = updatedDimension.minValue ?? 100;
            updatedDimension.maxValue = updatedDimension.maxValue ?? 300;
        }

        this.dispatchEvent(
            new CustomEvent('dimension-change', {
                detail: {
                    index: this.index,
                    type: this.type,
                    dimension: updatedDimension,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleMinMaxChange(e: Event, type: 'min' | 'max') {
        const input = e.target as HTMLInputElement;
        const value = parseFloat(input.value) || 0;

        const updatedDimension: GridDimension = {
            ...this.dimension,
            [type === 'min' ? 'minValue' : 'maxValue']: value,
        };

        this.dispatchEvent(
            new CustomEvent('dimension-change', {
                detail: {
                    index: this.index,
                    type: this.type,
                    dimension: updatedDimension,
                },
                bubbles: true,
                composed: true,
            })
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'grid-size-input': GridSizeInput;
    }
}

