/**
 * SliderInput - Range slider with visual feedback
 *
 * Features:
 * - Range slider with animated thumb
 * - Current value display
 * - Min/max/step configuration
 * - Automatic decimal formatting
 */

import type { CSSUnit } from "@/common/types";
import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseInput } from './base-input';

@customElement('sm-slider-input')
export class SMSliderInput extends BaseInput<number> {
    static styles = [
        ...BaseInput.styles,
        css`
            .slider-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            input[type="range"] {
                flex: 1;
                height: 4px;
                -webkit-appearance: none;
                appearance: none;
                background: var(--bg-tertiary, #e8e8e8);
                border-radius: 2px;
                outline: none;
            }

            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                background: var(--accent-color, #0078d4);
                border-radius: 50%;
                cursor: pointer;
                transition: transform 0.1s ease;
            }

            input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }

            input[type="range"]::-moz-range-thumb {
                width: 12px;
                height: 12px;
                background: var(--accent-color, #0078d4);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                transition: transform 0.1s ease;
            }

            input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.2);
            }

            .value {
                min-width: 36px;
                text-align: right;
                font-size: 10px;
                color: var(--text-secondary, #666);
                font-weight: 500;
            }

            .unit-selector {
                position: relative;
            }

            .unit-button {
                padding: 0 8px;
                display: flex;
                align-items: center;
                background: var(--bg-tertiary, #e8e8e8);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
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

    @property({type: Number}) override value: number = 0;

    @property({type: Number}) min: number = 0;

    @property({type: Number}) max: number = 100;

    @property({type: Number}) step: number = 1;

    @property({type: String}) unit: CSSUnit = 'px';

    @property({type: Array}) units: CSSUnit[] = [];

    @state() private showUnitSelector = false;

    protected renderInput() {
        const decimals = this.step < 1 ? 2 : 0;

        return html`
            <div class="slider-wrapper">
                <input
                        type="range"
                        min=${this.min}
                        max=${this.max}
                        step=${this.step}
                        .value=${String(this.value)}
                        @input=${this.handleInput}
                />
                <span class="value">${this.value.toFixed(decimals)}</span>
                ${this.units.length > 1 ? html`
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
                        ` : ''}
                    </div>
                ` : this.units.length === 1 ? html`
                    <div class="unit-button">${this.unit}</div>
                ` : ''}
            </div>
        `;
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const newValue = parseFloat(target.value);
        this.dispatchChange({value: newValue, unit: this.unit});
    }

    private toggleUnitSelector(e: Event) {
        e.stopPropagation();
        this.showUnitSelector = !this.showUnitSelector;
    }

    private selectUnit(unit: CSSUnit) {
        this.showUnitSelector = false;
        this.unit = unit;
        this.dispatchChange({value: this.value, unit});
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-slider-input': SMSliderInput;
    }
}
