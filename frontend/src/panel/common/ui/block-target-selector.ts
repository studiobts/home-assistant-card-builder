/**
 * BlockTargetSelector - Dropdown to select a block target.
 */

import { DropdownSelectorBase } from "@/panel/common/ui/dropdown-selector-base";
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface BlockTargetOption {
    label: string;
    value: string;
    description?: string;
}

export interface BlockTargetChangeDetail {
    value: string;
}

@customElement('block-target-selector')
export class BlockTargetSelector extends DropdownSelectorBase {
    /** Available block targets */
    @property({attribute: false}) options: BlockTargetOption[] = [];

    /** Selected target value */
    @property({type: String}) value = '';

    /** Placeholder when no target is selected */
    @property({type: String}) placeholder = 'Select target';

    protected get showSearch(): boolean {
        return this.options.length > 5;
    }

    protected get searchPlaceholder(): string {
        return 'Search targets...';
    }

    protected renderTriggerIcon(): TemplateResult {
        return html`&#9678;`;
    }

    protected renderTriggerLabel(): TemplateResult {
        const selected = this._getSelectedOption();

        return html`
      ${selected
            ? html`${selected.label}`
            : html`<span class="placeholder">${this.placeholder}</span>`
        }
    `;
    }

    protected renderDropdownContent(): TemplateResult {
        const filteredOptions = this._getFilteredOptions();

        return html`
      <div class="option-list">
        ${filteredOptions.length > 0 ? html`
          ${filteredOptions.map((option) => html`
            <div
              class="option-item ${option.value === this.value ? 'selected' : ''}"
              @click=${() => this._selectOption(option.value)}
            >
              <span class="icon">&#9673;</span>
              <div class="info">
                <div class="name">${option.label}</div>
                ${option.description ? html`
                  <div class="description">${option.description}</div>
                ` : nothing}
              </div>
              ${option.value === this.value ? html`<span class="check">&#10003;</span>` : nothing}
            </div>
          `)}
        ` : this._searchFilter ? html`
          <div class="empty-message">No targets match "${this._searchFilter}"</div>
        ` : html`
          <div class="empty-message">No targets available</div>
        `}
      </div>
    `;
    }

    private _selectOption(value: string): void {
        this._closeDropdown();

        this.dispatchEvent(
            new CustomEvent<BlockTargetChangeDetail>('change', {
                detail: {value},
                bubbles: true,
                composed: true,
            })
        );
    }

    private _getSelectedOption(): BlockTargetOption | undefined {
        return this.options.find((option) => option.value === this.value);
    }

    private _getFilteredOptions(): BlockTargetOption[] {
        if (!this._searchFilter) return this.options;

        return this.options.filter(
            (option) =>
                option.label.toLowerCase().includes(this._searchFilter) ||
                option.description?.toLowerCase().includes(this._searchFilter)
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-target-selector': BlockTargetSelector;
    }
}
