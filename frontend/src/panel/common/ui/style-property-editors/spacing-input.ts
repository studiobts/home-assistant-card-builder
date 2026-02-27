/**
 * SpacingInput - 4-sided composite input for margin/padding
 *
 * Features:
 * - Grid layout for Top/Right/Bottom/Left values
 * - Visual labels (T, R, B, L)
 * - Central icon indicator
 * - Independent control for each side
 */

import type { CSSUnit } from "@/common/types";
import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseInput } from './base-input';

export interface SpacingValue {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

@customElement('sm-spacing-input')
export class SMSpacingInput extends BaseInput<SpacingValue> {
    static styles = [
        ...BaseInput.styles,
        css`
            .grid {
                display: grid;
                grid-template-areas:
                  ". top ."
                  "left center right"
                  ". bottom .";
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4px;
            }

            .item {
                position: relative;
            }

            .item.top {
                grid-area: top;
            }

            .item.right {
                grid-area: right;
            }

            .item.bottom {
                grid-area: bottom;
            }

            .item.left {
                grid-area: left;
            }

            .item.center {
                grid-area: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .item-label {
                position: absolute;
                top: 2px;
                left: 4px;
                font-size: 8px;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
                pointer-events: none;
                z-index: 1;
            }

            .item input {
                width: 100%;
                padding: 14px 6px 4px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                box-sizing: border-box;
                background: var(--bg-secondary, #f5f5f5);
                color: var(--text-primary, #333);
                font-size: 12px;
                outline: none;
                text-align: center;
                transition: border-color 0.15s ease;
            }

            .item input:focus {
                border-color: var(--accent-color, #0078d4);
            }

            .unit-selector {
                position: relative;
            }

            .unit-button {
                padding: 4px 8px;
                display: flex;
                align-items: center;
                background: var(--bg-tertiary, #e8e8e8);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                color: var(--text-secondary, #666);
                font-size: 13px;
                cursor: pointer;
                user-select: none;
                min-width: 36px;
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

    @property({type: Object}) override value?: SpacingValue = undefined;

    @property({type: String}) unit: CSSUnit = 'px';

    @property({type: Array}) units: CSSUnit[] = ['px'];

    @state() private showUnitSelector = false;

    protected renderInput() {
        return html`
            <div class="grid">
                <div class="item top">
                    <span class="item-label">Top</span>
                    <input
                        type="number"
                        .value=${String(this.value?.top)}
                        @input=${(e: Event) => this.handleChange('top', e)}
                    />
                </div>
                <div class="item right">
                    <span class="item-label">Right</span>
                    <input
                        type="number"
                        .value=${String(this.value?.right)}
                        @input=${(e: Event) => this.handleChange('right', e)}
                    />
                </div>
                <div class="item bottom">
                    <span class="item-label">Bottom</span>
                    <input
                        type="number"
                        .value=${String(this.value?.bottom)}
                        @input=${(e: Event) => this.handleChange('bottom', e)}
                    />
                </div>
                <div class="item left">
                    <span class="item-label">Left</span>
                    <input
                        type="number"
                        .value=${String(this.value?.left)}
                        @input=${(e: Event) => this.handleChange('left', e)}
                    />
                </div>
                <div class="item center">
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
                    ` : html`
                        <div class="unit-button">${this.unit}</div>
                    `}
                </div>
            </div>
        `;
    }

    private handleChange(side: 'top' | 'right' | 'bottom' | 'left', e: Event) {
        const target = e.target as HTMLInputElement;
        const value = parseFloat(target.value) || 0;
        const newValue: SpacingValue = {
            ...(this.value || {top: value, right: value, bottom: value, left: value}),
            [side]: value
        };

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
        'sm-spacing-input': SMSpacingInput;
    }
}
