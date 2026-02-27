/**
 * PresetManagerDialog - Manage existing presets (list, edit, delete)
 *
 * Provides a dialog interface for managing all style presets.
 */

import type { StylePreset } from '@/common/types/style-preset';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * Event detail for edit action
 */
export interface PresetEditDetail {
    presetId: string;
}

/**
 * Event detail for delete action
 */
export interface PresetDeleteDetail {
    presetId: string;
}

/**
 * Preset manager dialog component
 */
@customElement('preset-manager-dialog')
export class StylePresetsManagerDialog extends LitElement {
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
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dialog {
      background: var(--bg-primary, #fff);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 550px;
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

    .search-bar {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color, #d4d4d4);
    }

    .search-bar input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }

    .search-bar input:focus {
      border-color: var(--accent-color, #0078d4);
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .preset-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .preset-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color-light, #eee);
      transition: background 0.1s ease;
    }

    .preset-item:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    .preset-item:last-child {
      border-bottom: none;
    }

    .preset-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, #7b2d8e 0%, #9b5dae 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .preset-info {
      flex: 1;
      min-width: 0;
    }

    .preset-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary, #333);
      margin-bottom: 2px;
    }

    .preset-description {
      font-size: 11px;
      color: var(--text-secondary, #666);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preset-meta {
      font-size: 10px;
      color: var(--text-tertiary, #999);
    }

    .preset-meta span {
      margin-right: 12px;
    }

    .preset-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 4px;
      background: transparent;
      color: var(--text-secondary, #666);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: var(--bg-tertiary, #e8e8e8);
      border-color: var(--border-color, #d4d4d4);
    }

    .action-btn.danger:hover {
      background: #fee;
      border-color: #f88;
      color: #c00;
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-secondary, #666);
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.3;
    }

    .empty-state .message {
      font-size: 14px;
      margin-bottom: 4px;
    }

    .empty-state .hint {
      font-size: 12px;
      color: var(--text-tertiary, #999);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
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

    .btn:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    /* Delete confirmation */
    .delete-confirm {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #fee;
      border-radius: 4px;
      margin-top: 8px;
    }

    .delete-confirm .message {
      flex: 1;
      font-size: 12px;
      color: #900;
    }

    .delete-confirm .btn-small {
      padding: 4px 10px;
      font-size: 11px;
      border-radius: 3px;
    }

    .delete-confirm .btn-danger {
      background: #c00;
      border-color: #c00;
      color: white;
    }

    .delete-confirm .btn-danger:hover {
      background: #a00;
      border-color: #a00;
    }

    .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
    /** Whether dialog is open */
    @property({type: Boolean}) open = false;
    /** Available presets */
    @property({attribute: false}) presets: StylePreset[] = [];
    /** Search filter */
    @state() private _searchFilter = '';
    /** Preset pending deletion (for confirmation) */
    @state() private _pendingDeleteId?: string;
    /** Whether delete is in progress */
    @state() private _deleting = false;

    render() {
        if (!this.open) return nothing;

        const filteredPresets = this._getFilteredPresets();

        return html`
      <div class="overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <h2 class="dialog-title">Manage Presets</h2>
            <button class="close-btn" @click=${this._handleClose}>×</button>
          </div>

          ${this.presets.length > 5 ? html`
            <div class="search-bar">
              <input
                type="text"
                placeholder="Search presets..."
                .value=${this._searchFilter}
                @input=${this._handleSearchInput}
              />
            </div>
          ` : nothing}

          <div class="dialog-content">
            ${filteredPresets.length === 0 ? html`
              <div class="empty-state">
                <div class="icon">★</div>
                <div class="message">
                  ${this._searchFilter
            ? `No presets match "${this._searchFilter}"`
            : 'No presets yet'
        }
                </div>
                <div class="hint">
                  ${this._searchFilter
            ? 'Try a different search term'
            : 'Create your first preset from the style panel'
        }
                </div>
              </div>
            ` : html`
              <ul class="preset-list">
                ${filteredPresets.map((preset) => html`
                  <li class="preset-item">
                    <div class="preset-icon">★</div>
                    <div class="preset-info">
                      <div class="preset-name">${preset.name}</div>
                      ${preset.description ? html`
                        <div class="preset-description">${preset.description}</div>
                      ` : nothing}
                      <div class="preset-meta">
                        ${preset.extendsPresetId ? html`
                          <span>Extends: ${this._getExtendsName(preset.extendsPresetId)}</span>
                        ` : nothing}
                        <span>Created: ${this._formatDate(preset.createdAt)}</span>
                        ${this._getUsageCount(preset.id) > 0 ? html`
                          <span>Used by: ${this._getUsageCount(preset.id)} preset(s)</span>
                        ` : nothing}
                      </div>
                      ${this._pendingDeleteId === preset.id ? html`
                        <div class="delete-confirm">
                          <span class="message">Delete this preset?</span>
                          <button
                            class="btn btn-small"
                            @click=${this._handleDeleteCancel}
                            ?disabled=${this._deleting}
                          >Cancel</button>
                          <button
                            class="btn btn-small btn-danger"
                            @click=${this._handleDeleteConfirm}
                            ?disabled=${this._deleting}
                          >
                            ${this._deleting ? html`<span class="spinner"></span>` : 'Delete'}
                          </button>
                        </div>
                      ` : nothing}
                    </div>
                    <div class="preset-actions">
                      <button
                        class="action-btn"
                        @click=${() => this._handleEdit(preset.id)}
                        title="Edit preset"
                      >✎</button>
                      <button
                        class="action-btn danger"
                        @click=${() => this._handleDeleteClick(preset.id)}
                        title="Delete preset"
                      >🗑</button>
                    </div>
                  </li>
                `)}
              </ul>
            `}
          </div>

          <div class="dialog-footer">
            <button class="btn" @click=${this._handleClose}>Close</button>
          </div>
        </div>
      </div>
    `;
    }

    private _handleClose(): void {
        this._pendingDeleteId = undefined;
        this.dispatchEvent(
            new CustomEvent('close', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleOverlayClick(e: Event): void {
        if (e.target === e.currentTarget) {
            this._handleClose();
        }
    }

    private _handleSearchInput(e: Event): void {
        this._searchFilter = (e.target as HTMLInputElement).value.toLowerCase();
    }

    private _handleEdit(presetId: string): void {
        this.dispatchEvent(
            new CustomEvent<PresetEditDetail>('edit', {
                detail: {presetId},
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleDeleteClick(presetId: string): void {
        this._pendingDeleteId = presetId;
    }

    private _handleDeleteConfirm(): void {
        if (!this._pendingDeleteId) return;

        this._deleting = true;

        this.dispatchEvent(
            new CustomEvent<PresetDeleteDetail>('delete', {
                detail: {presetId: this._pendingDeleteId},
                bubbles: true,
                composed: true,
            })
        );

        // Reset after a short delay (parent should close or update)
        setTimeout(() => {
            this._pendingDeleteId = undefined;
            this._deleting = false;
        }, 500);
    }

    private _handleDeleteCancel(): void {
        this._pendingDeleteId = undefined;
    }

    private _getFilteredPresets(): StylePreset[] {
        if (!this._searchFilter) return this.presets;

        return this.presets.filter(
            (p) =>
                p.name.toLowerCase().includes(this._searchFilter) ||
                p.description?.toLowerCase().includes(this._searchFilter)
        );
    }

    private _getExtendsName(presetId: string | undefined): string | undefined {
        if (!presetId) return undefined;
        const preset = this.presets.find((p) => p.id === presetId);
        return preset?.name;
    }

    private _formatDate(isoString: string): string {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return isoString;
        }
    }

    private _getUsageCount(presetId: string): number {
        // Count how many other presets extend this one
        return this.presets.filter((p) => p.extendsPresetId === presetId).length;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'preset-manager-dialog': StylePresetsManagerDialog;
    }
}
