/**
 * NumberInput - Numeric input with units and increment/decrement arrows
 *
 * Features:
 * - Numeric input with validation
 * - Up/down arrows for increment/decrement
 * - Multiple unit support (px, %, em, rem, etc.)
 * - Min/max constraints
 */

import type { CSSUnit } from "@/common/types";
import { css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseInput } from './base-input';

@customElement('sm-number-input')
export class SMNumberInput extends BaseInput<number> {
    static styles = [
        ...BaseInput.styles,
        css`
            .arrows {
                display: flex;
                flex-direction: column;
                background: var(--bg-tertiary, #e8e8e8);
                border-left: 1px solid var(--border-color, #d4d4d4);
            }

            .arrow {
                flex: 1;
                width: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-secondary, #666);
                font-size: 8px;
                transition: all 0.1s ease;
                user-select: none;
            }

            .arrow:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .arrow:active {
                background: var(--accent-color, #0078d4);
                color: white;
            }

            .arrow:first-child {
                border-bottom: 1px solid var(--border-color, #d4d4d4);
            }

            .unit-selector {
                position: relative;
            }

            .unit-button {
                padding: 0 8px;
                display: flex;
                align-items: center;
                background: var(--bg-tertiary, #e8e8e8);
                border-left: 1px solid var(--border-color, #d4d4d4);
                color: var(--text-secondary, #666);
                font-size: 10px;
                cursor: pointer;
                user-select: none;
                min-width: 36px;
                height: 100%;
                justify-content: center;
                transition: all 0.1s ease;
            }

            .unit-button:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .unit-options {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                min-width: 60px;
                margin-top: 2px;
            }

            .unit-option {
                padding: 6px 12px;
                font-size: 10px;
                cursor: pointer;
                transition: background 0.1s ease;
            }

            .unit-option:hover {
                background: var(--bg-tertiary, #e8e8e8);
            }

            .unit-option.active {
                background: var(--accent-color, #0078d4);
                color: white;
            }
        `
    ];

    @property({type: Number}) override value?: number;

    @property({type: Number}) min?: number;

    @property({type: Number}) max?: number;

    @property({type: Number}) step: number = 1;

    @property({type: String}) unit?: CSSUnit;

    @property({type: Array}) units?: CSSUnit[];

    @property({type: String}) placeholder?: string;

    @property({type: Number}) default: number = 0;

    @state() private showUnitSelector: boolean = false;

    protected renderInput() {
        const displayValue = this.value === undefined || Number.isNaN(this.value) ? '' : String(this.value);

        return html`
            <div class="input-wrapper">
                <input
                        type="number"
                        placeholder=${this.placeholder}
                        .value=${displayValue}
                        min=${this.min ?? ''}
                        max=${this.max ?? ''}
                        step=${this.step}
                        @input=${this.handleInput}
                />
                <div class="arrows">
                    <div class="arrow" @click=${this.increment}>▲</div>
                    <div class="arrow" @click=${this.decrement}>▼</div>
                </div>
                ${this.units && this.units.length > 1 ? html`
                    <div class="unit-selector">
                        <div class="unit-button" @click=${this.toggleUnitSelector}>
                            ${this.unit}
                        </div>
                        ${this.showUnitSelector ? html`
                            <div class="unit-options">
                                ${this.units.map(u => html`
                                    <div
                                            class="unit-option ${u === this.unit ? 'active' : ''}"
                                            @click=${() => this.selectUnit(u)}
                                    >
                                        ${u}
                                    </div>
                                `)}
                            </div>
                        ` : nothing}
                    </div>
                ` : html`
                    ${this.unit ? html`
                        <div class="unit-selector">
                            <div class="unit-button">${this.unit}</div>
                        </div>
                    ` : nothing}
                `}
            </div>
        `;
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const newValue = parseFloat(target.value) || 0;
        this.dispatchChange({value: newValue, unit: this.unit});
    }

    private increment() {
        const newValue = (this.value ?? this.default) + this.step;
        const clampedValue = this.max !== undefined ? Math.min(newValue, this.max) : newValue;
        this.dispatchChange({value: clampedValue, unit: this.unit});
    }

    private decrement() {
        const newValue = (this.value ?? this.default) - this.step;
        const clampedValue = this.min !== undefined ? Math.max(newValue, this.min) : newValue;
        this.dispatchChange({value: clampedValue, unit: this.unit});
    }

    private toggleUnitSelector(e: Event) {
        e.stopPropagation();
        this.showUnitSelector = !this.showUnitSelector;
    }

    private selectUnit(unit: CSSUnit) {
        this.unit = unit;
        this.showUnitSelector = false;
        if (this.value !== undefined) {
            this.dispatchChange({value: this.value, unit});
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-number-input': SMNumberInput;
    }
}
