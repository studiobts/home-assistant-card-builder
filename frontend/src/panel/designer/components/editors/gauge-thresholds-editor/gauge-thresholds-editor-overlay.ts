import {
    createGaugeThresholdId,
    type GaugeThreshold,
    normalizeGaugeThresholds,
} from '@/common/blocks/components/gauges/gauge-types';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('gauge-thresholds-editor-overlay')
export class GaugeThresholdsEditorOverlay extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: fixed;
            width: 100vw;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 1000;
            pointer-events: none;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .overlay-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            opacity: 0;
            transition: opacity 0.25s ease;
        }

        :host([open]) .overlay-backdrop {
            opacity: 1;
        }

        .dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            width: min(92vw, 860px);
            max-height: min(90vh, 760px);
            transform: translate(-50%, -50%);
            background: var(--bg-primary, #fff);
            border-radius: 10px;
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-color, #e0e0e0);
            background: var(--bg-secondary, #f7f7f7);
        }

        .title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary, #333);
        }

        .content {
            padding: 12px 14px;
            overflow: auto;
            display: grid;
            gap: 8px;
        }

        .row {
            display: grid;
            grid-template-columns: 130px 1fr 120px 78px;
            gap: 8px;
            align-items: center;
            padding: 8px;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 6px;
            background: var(--bg-secondary, #fafafa);
        }

        .row input {
            width: 100%;
            box-sizing: border-box;
            min-width: 0;
            padding: 6px 8px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 4px;
            font-size: 12px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
        }

        .row input[type='color'] {
            padding: 2px;
            height: 32px;
        }

        .row button {
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-primary, #fff);
            border-radius: 4px;
            color: var(--text-primary, #333);
            font-size: 11px;
            padding: 6px 8px;
            cursor: pointer;
            font-weight: 600;
            text-transform: uppercase;
        }

        .row button:hover {
            border-color: var(--error-color, #d32f2f);
            color: var(--error-color, #d32f2f);
        }

        .empty {
            font-size: 12px;
            color: var(--text-secondary, #666);
            padding: 10px 4px;
        }

        .footer {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-top: 1px solid var(--border-color, #e0e0e0);
            background: var(--bg-secondary, #f7f7f7);
        }

        .footer .spacer {
            flex: 1;
        }

        .btn {
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .btn.primary {
            border: none;
            background: var(--accent-color, #2196f3);
            color: #fff;
        }
    `;

    @property({type: Boolean, reflect: true})
    open = false;

    @property({attribute: false})
    thresholds: GaugeThreshold[] = [];

    @state()
    private editingThresholds: GaugeThreshold[] = [];

    updated(changedProps: PropertyValues): void {
        if ((changedProps.has('open') && this.open) || changedProps.has('thresholds')) {
            this.editingThresholds = normalizeGaugeThresholds(this.thresholds).map((threshold) => ({...threshold}));
        }

        if (changedProps.has('open')) {
            if (this.open) {
                window.addEventListener('keydown', this._onEscape);
            } else {
                window.removeEventListener('keydown', this._onEscape);
            }
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this._onEscape);
    }

    render() {
        if (!this.open) {
            return html``;
        }

        return html`
            <div class="overlay-backdrop" @click=${this._cancel}></div>
            <div class="dialog">
                <div class="header">
                    <div class="title">Gauge Thresholds</div>
                    <button class="btn" @click=${this._cancel}>Close</button>
                </div>
                <div class="content">
                    ${this.editingThresholds.length === 0 ? html`
                        <div class="empty">No thresholds configured.</div>
                    ` : this.editingThresholds.map((threshold, index) => this.renderThresholdRow(threshold, index))}
                </div>
                <div class="footer">
                    <button class="btn" @click=${this._addThreshold}>Add Threshold</button>
                    <div class="spacer"></div>
                    <button class="btn" @click=${this._cancel}>Cancel</button>
                    <button class="btn primary" @click=${this._apply}>Apply</button>
                </div>
            </div>
        `;
    }

    private renderThresholdRow(threshold: GaugeThreshold, index: number) {
        return html`
            <div class="row">
                <input
                    type="number"
                    step="0.1"
                    .value=${String(threshold.value)}
                    @input=${(e: Event) => this._updateNumeric(index, 'value', (e.target as HTMLInputElement).value)}
                />
                <input
                        type="color"
                        .value=${threshold.color ?? '#2196f3'}
                        @input=${(e: Event) => this._updateText(index, 'color', (e.target as HTMLInputElement).value)}
                />
                <input
                    type="text"
                    .value=${threshold.label ?? ''}
                    placeholder="Optional label"
                    @input=${(e: Event) => this._updateText(index, 'label', (e.target as HTMLInputElement).value)}
                />
                <button @click=${() => this._removeThreshold(index)}>Remove</button>
            </div>
        `;
    }

    private _onEscape = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this._cancel();
        }
    };

    private _addThreshold = (): void => {
        this.editingThresholds = [
            ...this.editingThresholds,
            {
                id: createGaugeThresholdId(),
                value: 0,
                label: '',
                color: '#2196f3',
            },
        ];
    };

    private _removeThreshold(index: number): void {
        this.editingThresholds = this.editingThresholds.filter((_, currentIndex) => currentIndex !== index);
    }

    private _updateText(index: number, key: 'label' | 'color', value: string): void {
        this.editingThresholds = this.editingThresholds.map((threshold, currentIndex) => (
            currentIndex === index ? {...threshold, [key]: value} : threshold
        ));
    }

    private _updateNumeric(index: number, key: 'value', value: string): void {
        const numeric = parseFloat(value);
        this.editingThresholds = this.editingThresholds.map((threshold, currentIndex) => (
            currentIndex === index
                ? {...threshold, [key]: Number.isFinite(numeric) ? numeric : threshold.value}
                : threshold
        ));
    }

    private _cancel = (): void => {
        this.dispatchEvent(new CustomEvent('overlay-cancel', {
            bubbles: true,
            composed: true,
        }));
    };

    private _apply = (): void => {
        const thresholds = normalizeGaugeThresholds(this.editingThresholds);
        this.dispatchEvent(new CustomEvent('overlay-apply', {
            detail: {thresholds},
            bubbles: true,
            composed: true,
        }));
    };
}

declare global {
    interface HTMLElementTagNameMap {
        'gauge-thresholds-editor-overlay': GaugeThresholdsEditorOverlay;
    }
}
