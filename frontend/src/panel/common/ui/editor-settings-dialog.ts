import type { EditorBackgroundOption, EditorSettings } from '@/common/core/model/types';
import { type EventBus, eventBusContext } from '@/common/core/event-bus';
import '@/panel/common/ui/style-property-editors/color-input';
import { consume } from '@lit/context';
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { OverlayDialogBase } from './overlay-dialog-base';

type BackgroundSelection = 'default' | 'color' | 'value';

export const EDITOR_SETTINGS_CHANGED_EVENT = 'editor-settings-changed';
export const EDITOR_SETTINGS_SET_DEFAULT_EVENT = 'editor-settings-set-default';
export const EDITOR_SETTINGS_RESET_DEFAULT_EVENT = 'editor-settings-reset-default';

export interface EditorSettingsChangedDetail {
    settings: EditorSettings | undefined;
}

export interface EditorSettingsDefaultDetail {
    settings: EditorSettings;
}

export interface EditorSettingsResetDefaultDetail {
    settings: EditorSettings | undefined;
}

@customElement('editor-settings-dialog')
export class EditorSettingsDialog extends OverlayDialogBase {
    static styles = [
        ...OverlayDialogBase.styles,
        css`
            :host {
                --overlay-dialog-width: min(92vw, 520px);
                --overlay-dialog-height: auto;
            }

            .dialog-body {
                overflow: visible;
            }

            .settings-body {
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 18px;
            }

            .setting-row {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .setting-label {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .setting-control-line {
                display: flex;
                align-items: stretch;
                gap: 8px;
            }

            select,
            textarea {
                flex: 1;
                min-width: 0;
                width: 100%;
                box-sizing: border-box;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 4px;
                background: var(--bg-primary, #fff);
                color: var(--text-primary, #333);
                font: inherit;
                font-size: 13px;
            }

            select {
                padding: 8px 10px;
            }

            textarea {
                min-height: 96px;
                padding: 10px;
                resize: vertical;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                line-height: 1.4;
            }

            select:focus,
            textarea:focus {
                outline: none;
                border-color: var(--accent-color, #0078d4);
            }

            sm-color-input {
                flex: 1;
            }

            .default-button {
                width: 34px;
                min-width: 34px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 4px;
                background: var(--bg-primary, #fff);
                color: var(--text-primary, #333);
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                --mdc-icon-size: 18px;
            }

            .default-button:hover:not(:disabled) {
                color: var(--accent-color, #0078d4);
                border-color: var(--accent-color, #0078d4);
            }

            .default-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `,
    ];

    @property({attribute: false})
    settings?: EditorSettings;

    @property({attribute: false})
    globalSettings?: EditorSettings;

    @property({type: Boolean})
    savingDefault = false;

    @consume({context: eventBusContext})
    private eventBus!: EventBus;

    @state()
    private backgroundSelection: BackgroundSelection = 'default';

    @state()
    private backgroundColor = '#e8e8e8';

    @state()
    private backgroundValue = '';

    protected get dialogTitle(): string {
        return 'Editor settings';
    }

    protected get dialogSubtitle(): string {
        return 'Configure this card editor';
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has('open') && this.open) {
            this._loadSettings();
        }
        if (changedProps.has('settings') && this.open) {
            this._loadSettings();
        }
    }

    protected renderDialogBody(): TemplateResult {
        return html`
            <div class="settings-body">
                <div class="setting-row">
                    <label class="setting-label" for="background-mode">Editor background</label>
                    <div class="setting-control-line">
                        <select
                            id="background-mode"
                            .value=${this.backgroundSelection}
                            @change=${this._handleBackgroundSelectionChange}
                        >
                            <option value="default">Use default</option>
                            <option value="color">Custom color</option>
                            <option value="value">Custom value</option>
                        </select>
                        ${this._renderResetDefaultButton()}
                    </div>
                </div>
                ${this._renderBackgroundValueControl()}
            </div>
        `;
    }

    protected renderDialogFooter(): TemplateResult {
        return html`
            <div class="dialog-footer">
                <div class="footer-spacer"></div>
                <button class="primary-btn" @click=${this.handleClose}>Done</button>
            </div>
        `;
    }

    private _renderBackgroundValueControl(): TemplateResult | typeof nothing {
        if (this.backgroundSelection === 'color') {
            return html`
                <div class="setting-row">
                    <label class="setting-label">Custom color</label>
                    <div class="setting-control-line">
                        <sm-color-input
                            .value=${this.backgroundColor}
                            @change=${this._handleColorChange}
                        ></sm-color-input>
                        ${this._renderSetDefaultButton()}
                    </div>
                </div>
            `;
        }

        if (this.backgroundSelection === 'value') {
            return html`
                <div class="setting-row">
                    <label class="setting-label" for="background-value">Custom CSS background value</label>
                    <div class="setting-control-line">
                        <textarea
                            id="background-value"
                            .value=${this.backgroundValue}
                            @input=${this._handleValueChange}
                            placeholder="linear-gradient(135deg, #20242c, #3a4252)"
                        ></textarea>
                        ${this._renderSetDefaultButton()}
                    </div>
                </div>
            `;
        }

        return nothing;
    }

    private _renderSetDefaultButton(): TemplateResult {
        return html`
            <button
                class="default-button"
                title="Set as editor default"
                ?disabled=${this.savingDefault || !this._buildBackgroundOption()}
                @click=${this._handleSetDefault}
            >
                <ha-icon icon="mdi:content-save-cog-outline"></ha-icon>
            </button>
        `;
    }

    private _renderResetDefaultButton(): TemplateResult | typeof nothing {
        if (this.backgroundSelection !== 'default' || !this._hasGlobalBackground()) {
            return nothing;
        }

        return html`
            <button
                class="default-button"
                title="Reset editor default"
                ?disabled=${this.savingDefault}
                @click=${this._handleResetDefault}
            >
                <ha-icon icon="mdi:restore"></ha-icon>
            </button>
        `;
    }

    private _loadSettings(): void {
        const background = this.settings?.options?.background;
        if (!background) {
            this.backgroundSelection = 'default';
            return;
        }

        if (background.mode === 'color') {
            this.backgroundSelection = 'color';
            this.backgroundColor = background.color || this.backgroundColor;
            return;
        }

        if (background.mode === 'value') {
            this.backgroundSelection = 'value';
            this.backgroundValue = background.value || '';
        }
    }

    private _handleBackgroundSelectionChange = (e: Event): void => {
        const select = e.target as HTMLSelectElement;
        this.backgroundSelection = select.value as BackgroundSelection;
        this._emitSettingsChange();
    };

    private _handleColorChange = (e: CustomEvent<{value?: string}>): void => {
        this.backgroundColor = e.detail?.value || this.backgroundColor;
        this._emitSettingsChange();
    };

    private _handleValueChange = (e: Event): void => {
        this.backgroundValue = (e.target as HTMLTextAreaElement).value;
        this._emitSettingsChange();
    };

    private _handleSetDefault = (): void => {
        const background = this._buildBackgroundOption();
        if (!background) return;
        this.eventBus.dispatchEvent<EditorSettingsDefaultDetail>(
            EDITOR_SETTINGS_SET_DEFAULT_EVENT,
            {settings: {options: {background}}},
        );
    };

    private _handleResetDefault = (): void => {
        this.eventBus.dispatchEvent<EditorSettingsResetDefaultDetail>(
            EDITOR_SETTINGS_RESET_DEFAULT_EVENT,
            {settings: undefined},
        );
    };

    private _emitSettingsChange(): void {
        const background = this._buildBackgroundOption();
        const settings = background ? {options: {background}} : undefined;
        this.eventBus.dispatchEvent<EditorSettingsChangedDetail>(
            EDITOR_SETTINGS_CHANGED_EVENT,
            {settings},
        );
    }

    private _buildBackgroundOption(): EditorBackgroundOption | undefined {
        if (this.backgroundSelection === 'color') {
            const color = this.backgroundColor.trim();
            return color ? {mode: 'color', color} : undefined;
        }

        if (this.backgroundSelection === 'value') {
            const value = this.backgroundValue.trim();
            return value ? {mode: 'value', value} : undefined;
        }

        return undefined;
    }

    private _hasGlobalBackground(): boolean {
        return Boolean(this.globalSettings?.options?.background);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'editor-settings-dialog': EditorSettingsDialog;
    }
}
