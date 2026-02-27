/**
 * SelectInput - Dropdown select with custom styling
 *
 * Features:
 * - Custom styled dropdown
 * - Option array support
 * - Custom arrow indicator
 * - Keyboard navigation
 */

import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { BaseInput } from './base-input';

@customElement('sm-select-input')
export class SMSelectInput extends BaseInput<string> {
    static styles = [
        ...BaseInput.styles,
        css`
            .select-wrapper {
                position: relative;
            }

            select {
                width: 100%;
                padding: 5px 24px 5px 8px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                background: var(--bg-secondary, #f5f5f5);
                color: var(--text-primary, #333);
                font-size: 11px;
                outline: none;
                cursor: pointer;
                appearance: none;
                transition: border-color 0.15s ease;
            }

            select:focus {
                border-color: var(--accent-color, #0078d4);
            }

            .select-wrapper::after {
                content: '▼';
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 8px;
                color: var(--text-secondary, #666);
                pointer-events: none;
            }
        `
    ];

    @property({type: String}) override value: string = '';

    @property({type: Array}) options: Array<{ label: string, value: string }> = [];

    @query('select') private selectElement?: HTMLSelectElement;

    updated(changedProps: Map<string, unknown>) {
        if (changedProps.has('value') && this.selectElement) {
            // Force update select element value
            this.selectElement.value = this.value;
        }
    }

    protected renderInput() {
        return html`
            <div class="select-wrapper">
                <select .value=${this.value} @change=${this.handleChange}>
                    ${this.options.map(opt => html`
                        <option value=${opt.value} ?selected=${opt.value === this.value}>${opt.label}</option>
                    `)}
                </select>
            </div>
        `;
    }

    private handleChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        this.dispatchChange({value: target.value});
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-select-input': SMSelectInput;
    }
}

