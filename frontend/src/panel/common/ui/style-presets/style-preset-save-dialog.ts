/**
 * PresetSaveDialog - Dialog to save current styles as a preset
 *
 * Allows naming, describing, and optionally extending another preset.
 */

import type { ResolvedStyleData } from '@/common/core/style-resolver/style-resolution-types';
import type { CreateStylePresetInput, StylePreset, StylePresetData } from '@/common/types/style-preset';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * Event detail for save action
 */
export interface PresetSaveDetail {
    input: CreateStylePresetInput;
}

/**
 * Preset save dialog component
 */
@customElement('preset-save-dialog')
export class StylePresetSaveDialog extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }

        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .dialog {
            background: var(--bg-primary, #fff);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 450px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color, #d4d4d4);
        }

        .dialog-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary, #333);
            margin: 0;
        }

        .close-btn {
            width: 28px;
            height: 28px;
            padding: 0;
            border: none;
            border-radius: 4px;
            background: transparent;
            color: var(--text-secondary, #666);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
        }

        .close-btn:hover {
            background: var(--bg-secondary, #f5f5f5);
            color: var(--text-primary, #333);
        }

        .dialog-content {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-group:last-child {
            margin-bottom: 0;
        }

        .form-label {
            display: block;
            margin-bottom: 6px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary, #333);
        }

        .form-label .required {
            color: #cc0000;
        }

        input, textarea, select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 4px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 13px;
            font-family: inherit;
            transition: border-color 0.15s ease;
            box-sizing: border-box;
        }

        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: var(--accent-color, #0078d4);
        }

        input.error, textarea.error, select.error {
            border-color: #cc0000;
        }

        textarea {
            min-height: 80px;
            resize: vertical;
        }

        .form-hint {
            margin-top: 4px;
            font-size: 11px;
            color: var(--text-secondary, #666);
        }

        .error-message {
            margin-top: 4px;
            font-size: 11px;
            color: #cc0000;
        }

        .preview-section {
            margin-top: 16px;
            padding: 12px;
            background: var(--bg-secondary, #f5f5f5);
            border-radius: 4px;
        }

        .preview-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary, #666);
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .preview-list {
            font-size: 11px;
            color: var(--text-primary, #333);
        }

        .preview-item {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
        }

        .preview-item .key {
            color: var(--text-secondary, #666);
        }

        .preview-item .value {
            font-family: monospace;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .dialog-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 16px 20px;
            border-top: 1px solid var(--border-color, #d4d4d4);
        }

        .btn {
            padding: 8px 16px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 4px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .btn:hover:not(:disabled) {
            background: var(--bg-secondary, #f5f5f5);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-primary {
            background: var(--accent-color, #0078d4);
            border-color: var(--accent-color, #0078d4);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            background: #006cbd;
            border-color: #006cbd;
        }

        .btn-primary:disabled {
            background: #99c9ea;
            border-color: #99c9ea;
        }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 6px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;

    /** Whether dialog is open */
    @property({type: Boolean}) open = false;

    /** Current resolved styles to save */
    @property({attribute: false}) currentStyles?: ResolvedStyleData;

    /** Current container ID */
    @property({type: String}) containerId!: string;

    /** Available presets (for extends selection) */
    @property({attribute: false}) presets: StylePreset[] = [];

    /** Whether save is in progress */
    @property({type: Boolean}) saving = false;

    /** Form: preset name */
    @state() private _name = '';

    /** Form: preset description */
    @state() private _description = '';

    /** Form: extends preset ID */
    @state() private _extendsPresetId?: string;

    /** Form validation error */
    @state() private _error = '';

    updated(changedProps: Map<string, unknown>): void {
        if (changedProps.has('open') && this.open) {
            this._resetForm();
        }
    }

    render() {
        if (!this.open) return nothing;

        const previewItems = this._getPreviewItems();

        return html`
            <div class="overlay" @click=${this._handleOverlayClick}>
                <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="dialog-header">
                        <h2 class="dialog-title">Save as Preset</h2>
                        <button class="close-btn" @click=${this._handleCancel}>×</button>
                    </div>

                    <div class="dialog-content">
                        <div class="form-group">
                            <label class="form-label">
                                Name <span class="required">*</span>
                            </label>
                            <input
                                    type="text"
                                    .value=${this._name}
                                    @input=${this._handleNameInput}
                                    placeholder="My Custom Style"
                                    class=${this._error ? 'error' : ''}
                                    ?disabled=${this.saving}
                            />
                            ${this._error ? html`
                                <div class="error-message">${this._error}</div>
                            ` : nothing}
                        </div>

                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea
                                    .value=${this._description}
                                    @input=${this._handleDescriptionInput}
                                    placeholder="Optional description of this preset..."
                                    ?disabled=${this.saving}
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Extends</label>
                            <select
                                    .value=${this._extendsPresetId || ''}
                                    @change=${this._handleExtendsChange}
                                    ?disabled=${this.saving}
                            >
                                <option value="">None (standalone preset)</option>
                                ${this.presets.map((preset) => html`
                                    <option value=${preset.id}>${preset.name}</option>
                                `)}
                            </select>
                            <div class="form-hint">
                                Extend another preset to inherit its values. Only differences will be saved.
                            </div>
                        </div>

                        ${previewItems.length > 0 ? html`
                            <div class="preview-section">
                                <div class="preview-title">Values to save (${this.containerId})</div>
                                <div class="preview-list">
                                    ${previewItems.map((item) => html`
                                        <div class="preview-item">
                                            <span class="key">${item.key}</span>
                                            <span class="value">${item.value}</span>
                                        </div>
                                    `)}
                                    ${this._getPreviewItems().length > 8 ? html`
                                        <div class="preview-item">
                                            <span class="key">...</span>
                                            <span class="value">and more</span>
                                        </div>
                                    ` : nothing}
                                </div>
                            </div>
                        ` : nothing}
                    </div>

                    <div class="dialog-footer">
                        <button class="btn" @click=${this._handleCancel} ?disabled=${this.saving}>
                            Cancel
                        </button>
                        <button
                                class="btn btn-primary"
                                @click=${this._handleSave}
                                ?disabled=${this.saving || !this._name.trim()}
                        >
                            ${this.saving ? html`<span class="spinner"></span>` : nothing}
                            ${this.saving ? 'Saving...' : 'Save Preset'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private _resetForm(): void {
        this._name = '';
        this._description = '';
        this._extendsPresetId = undefined;
        this._error = '';
    }

    private _handleNameInput(e: Event): void {
        this._name = (e.target as HTMLInputElement).value;
        this._error = '';
    }

    private _handleDescriptionInput(e: Event): void {
        this._description = (e.target as HTMLTextAreaElement).value;
    }

    private _handleExtendsChange(e: Event): void {
        const value = (e.target as HTMLSelectElement).value;
        this._extendsPresetId = value || undefined;
    }

    private _validate(): boolean {
        if (!this._name.trim()) {
            this._error = 'Preset name is required';
            return false;
        }

        // Check for duplicate names
        const duplicate = this.presets.find(
            (p) => p.name.toLowerCase() === this._name.trim().toLowerCase()
        );
        if (duplicate) {
            this._error = 'A preset with this name already exists';
            return false;
        }

        return true;
    }

    private _buildPresetData(): StylePresetData {
        // Convert resolved styles to preset data format
        const containerData: Record<string, unknown> = {};

        if (this.currentStyles) {
            for (const [category, properties] of Object.entries(this.currentStyles)) {
                if (properties) {
                    containerData[category] = {};
                    for (const [prop, resolved] of Object.entries(properties)) {
                        (containerData[category] as Record<string, unknown>)[prop] = {
                            value: resolved.value,
                            binding: resolved.binding
                        };
                    }
                }
            }
        }

        return {
            containers: {
                [this.containerId]: containerData as any
            }
        };
    }

    private _handleSave(): void {
        if (!this._validate()) return;

        const input: CreateStylePresetInput = {
            name: this._name.trim(),
            description: this._description.trim() || undefined,
            extendsPresetId: this._extendsPresetId,
            data: this._buildPresetData()
        };

        this.dispatchEvent(
            new CustomEvent<PresetSaveDetail>('save', {
                detail: {input},
                bubbles: true,
                composed: true
            })
        );
    }

    private _handleCancel(): void {
        this.dispatchEvent(
            new CustomEvent('cancel', {
                bubbles: true,
                composed: true
            })
        );
    }

    private _handleOverlayClick(e: Event): void {
        if (e.target === e.currentTarget) {
            this._handleCancel();
        }
    }

    private _getPreviewItems(): Array<{ key: string; value: string }> {
        const items: Array<{ key: string; value: string }> = [];

        if (this.currentStyles) {
            for (const [category, properties] of Object.entries(this.currentStyles)) {
                if (properties) {
                    for (const [prop, resolved] of Object.entries(properties)) {
                        if (resolved.value !== undefined) {
                            items.push({
                                key: `${category}.${prop}`,
                                value: String(resolved.value)
                            });
                        }
                    }
                }
            }
        }

        return items.slice(0, 8); // Show max 8 items
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'preset-save-dialog': StylePresetSaveDialog;
    }
}
