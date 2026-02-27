/**
 * BaseInput - Abstract base class for all Style Manager inputs
 *
 * Provides common functionality like label rendering, change events,
 * and shared styling for all input components.
 */
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Abstract base class for input components
 */
export abstract class BaseInput<T = any> extends LitElement {
    /**
     * Common styles for all inputs
     */
    static styles = [
        css`
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

            .input-wrapper {
                display: flex;
                align-items: stretch;
                background: var(--bg-secondary, #f5f5f5);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                transition: border-color 0.15s ease;
                box-sizing: border-box;
            }

            .input-wrapper:focus-within {
                border-color: var(--accent-color, #0078d4);
            }

            input,
            select {
                flex: 1;
                padding: 5px 8px;
                border: none;
                background: transparent;
                color: var(--text-primary, #333);
                font-size: 11px;
                outline: none;
                min-width: 0;
            }

            input::-webkit-inner-spin-button,
            input::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            /* Common button styles */

            .button {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 8px;
                background: var(--bg-tertiary, #e8e8e8);
                border-left: 1px solid var(--border-color, #d4d4d4);
                color: var(--text-secondary, #666);
                font-size: 10px;
                cursor: pointer;
                user-select: none;
                transition: all 0.1s ease;
            }

            .button:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .button:active {
                background: var(--accent-color, #0078d4);
                color: white;
            }
        `];

    @property({type: String}) label?: string;

    @property() value?: T;

    /**
     * Main render method
     */
    render() {
        return html`
            ${this.renderLabel()}
            ${this.renderInput()}
        `;
    }

    /**
     * Dispatch change event with typed detail
     */
    protected dispatchChange(detail: any): void {
        this.dispatchEvent(new CustomEvent('change', {
            detail,
            bubbles: true,
            composed: true
        }));
    }

    /**
     * Render label if provided
     */
    protected renderLabel() {
        return this.label ? html`
            <div class="label">${this.label}</div>` : '';
    }

    /**
     * Abstract method for rendering the input control
     * Must be implemented by subclasses
     */
    protected abstract renderInput(): unknown;
}
