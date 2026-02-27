/**
 * PresetSelector - Dropdown to select and manage style presets
 *
 * Provides UI for selecting, creating, and managing presets.
 */

import type { StylePreset } from '@/common/types/style-preset';
import { DropdownSelectorBase } from "@/panel/common/ui/dropdown-selector-base";
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Event detail for preset selection
 */
export interface PresetSelectedDetail {
    presetId: string | null;
}

/**
 * Preset selector component
 */
@customElement('preset-selector')
export class StylePresetSelector extends DropdownSelectorBase {
    /** Available presets */
    @property({attribute: false}) presets: StylePreset[] = [];

    /** Currently selected preset ID */
    @property({type: String}) selectedPresetId?: string;

    /** Whether to show management options */
    @property({type: Boolean}) showManagement = true;

    protected get showSearch(): boolean {
        return this.presets.length > 5;
    }

    protected get searchPlaceholder(): string {
        return 'Search presets...';
    }

    protected renderTriggerIcon() {
        return '★';
    }

    protected renderTriggerLabel() {
        const selectedPreset = this._getSelectedPreset();

        return html`
      ${selectedPreset
            ? html`${selectedPreset.name}`
            : html`<span class="placeholder">No preset applied</span>`
        }
    `;
    }

    protected renderDropdownContent() {
        const filteredPresets = this._getFilteredPresets();

        return html`
      <div class="option-list">
        <!-- None option -->
        <div
          class="option-item ${!this.selectedPresetId ? 'selected' : ''}"
          @click=${() => this._selectPreset(null)}
        >
          <span class="icon">○</span>
          <div class="info">
            <div class="name">No preset</div>
            <div class="description">Use default styles</div>
          </div>
          ${!this.selectedPresetId ? html`<span class="check">✓</span>` : nothing}
        </div>

        ${filteredPresets.length > 0 ? html`
          <div class="divider"></div>
          ${filteredPresets.map((preset) => html`
            <div
              class="option-item ${preset.id === this.selectedPresetId ? 'selected' : ''}"
              @click=${() => this._selectPreset(preset.id)}
            >
              <span class="icon">★</span>
              <div class="info">
                <div class="name">${preset.name}</div>
                ${preset.description ? html`
                  <div class="description">${preset.description}</div>
                ` : nothing}
                ${preset.extendsPresetId ? html`
                  <div class="meta">Extends: ${this._getExtendsName(preset.extendsPresetId)}</div>
                ` : nothing}
              </div>
              ${preset.id === this.selectedPresetId ? html`<span class="check">✓</span>` : nothing}
            </div>
          `)}
        ` : this._searchFilter ? html`
          <div class="empty-message">No presets match "${this._searchFilter}"</div>
        ` : nothing}
      </div>

      ${this.showManagement ? html`
        <div class="divider"></div>
        <div class="action-item" @click=${this._handleCreatePreset}>
          <span class="icon">+</span>
          <span>Save current as preset...</span>
        </div>
        <div class="action-item" @click=${this._handleManagePresets}>
          <span class="icon">⚙</span>
          <span>Manage presets...</span>
        </div>
      ` : nothing}
    `;
    }

    private _selectPreset(presetId: string | null): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent<PresetSelectedDetail>('preset-selected', {
                detail: {presetId},
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleCreatePreset(): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent('create-preset', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleManagePresets(): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent('manage-presets', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private _getSelectedPreset(): StylePreset | undefined {
        if (!this.selectedPresetId) return undefined;
        return this.presets.find((p) => p.id === this.selectedPresetId);
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
}

declare global {
    interface HTMLElementTagNameMap {
        'preset-selector': StylePresetSelector;
    }
}
