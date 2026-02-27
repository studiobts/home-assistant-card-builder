/**
 * DropdownSelectorBase - Shared dropdown selector behavior and styling.
 */

import { css, type CSSResultGroup, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export abstract class DropdownSelectorBase extends LitElement {
    static styles: CSSResultGroup = css`
    :host {
      display: block;
      position: relative;
    }

    .selector-button {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .selector-button:hover:not(:disabled) {
      border-color: var(--accent-color, #0078d4);
    }

    .selector-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .selector-button .icon {
      color: #7b2d8e;
      font-size: 14px;
    }

    .selector-button .label {
      flex: 1;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .selector-button .placeholder {
      color: var(--text-secondary, #666);
    }

    .selector-button .arrow {
      color: var(--text-tertiary, #999);
      font-size: 10px;
      transition: transform 0.15s ease;
    }

    .selector-button.open .arrow {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 300px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .search-box {
      padding: 8px;
      border-bottom: 1px solid var(--border-color, #d4d4d4);
    }

    .search-box input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 3px;
      font-size: 12px;
      outline: none;
    }

    .search-box input:focus {
      border-color: var(--accent-color, #0078d4);
    }

    .option-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .option-item:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    .option-item.selected {
      background: rgba(0, 120, 212, 0.1);
    }

    .option-item .icon {
      color: #7b2d8e;
      font-size: 12px;
      flex-shrink: 0;
    }

    .option-item .info {
      flex: 1;
      min-width: 0;
    }

    .option-item .name {
      font-size: 12px;
      color: var(--text-primary, #333);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .option-item .description {
      font-size: 10px;
      color: var(--text-secondary, #666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 2px;
    }

    .option-item .meta {
      font-size: 9px;
      color: var(--text-tertiary, #999);
      margin-top: 2px;
    }

    .option-item .check {
      color: var(--accent-color, #0078d4);
      font-size: 14px;
      flex-shrink: 0;
    }

    .divider {
      height: 1px;
      background: var(--border-color, #d4d4d4);
      margin: 4px 0;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.1s ease;
      color: var(--text-primary, #333);
      font-size: 12px;
    }

    .action-item:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    .action-item .icon {
      font-size: 14px;
      color: var(--text-secondary, #666);
    }

    .empty-message {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary, #666);
      font-size: 12px;
    }
  `;
    /** Whether selector is disabled */
    @property({type: Boolean}) disabled = false;
    /** Dropdown open state */
    @state() protected _dropdownOpen = false;
    /** Search filter */
    @state() protected _searchFilter = '';

    protected get showSearch(): boolean {
        return false;
    }

    protected get searchPlaceholder(): string {
        return 'Search...';
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._handleClickOutside = this._handleClickOutside.bind(this);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener('click', this._handleClickOutside);
    }

    render() {
        return html`
      ${this.renderTriggerButton()}
      ${this.renderDropdown()}
    `;
    }

    protected _toggleDropdown(): void {
        if (this.disabled) return;

        if (this._dropdownOpen) {
            this._closeDropdown();
        } else {
            this._openDropdown();
        }
    }

    protected _openDropdown(): void {
        this._dropdownOpen = true;
        this._searchFilter = '';
        // Add click outside listener after a tick
        setTimeout(() => {
            document.addEventListener('click', this._handleClickOutside);
        }, 0);
    }

    protected _closeDropdown(): void {
        this._dropdownOpen = false;
        document.removeEventListener('click', this._handleClickOutside);
    }

    protected _handleSearchInput(e: Event): void {
        this._searchFilter = (e.target as HTMLInputElement).value.toLowerCase();
    }

    protected renderTriggerIcon(): unknown {
        return nothing;
    }

    protected abstract renderTriggerLabel(): TemplateResult;

    protected abstract renderDropdownContent(): TemplateResult;

    protected renderTriggerButton(): TemplateResult {
        return html`
      <button
        class="selector-button ${this._dropdownOpen ? 'open' : ''}"
        @click=${this._toggleDropdown}
        ?disabled=${this.disabled}
      >
        <span class="icon">${this.renderTriggerIcon()}</span>
        <span class="label">${this.renderTriggerLabel()}</span>
        <span class="arrow">&#9660;</span>
      </button>
    `;
    }

    protected renderSearchBox(): TemplateResult {
        return html`
      <div class="search-box">
        <input
          type="text"
          placeholder=${this.searchPlaceholder}
          .value=${this._searchFilter}
          @input=${this._handleSearchInput}
        />
      </div>
    `;
    }

    protected renderDropdown(): TemplateResult | typeof nothing {
        if (!this._dropdownOpen) return nothing;

        return html`
      <div class="dropdown" @click=${(e: Event) => e.stopPropagation()}>
        ${this.showSearch ? this.renderSearchBox() : nothing}
        ${this.renderDropdownContent()}
      </div>
    `;
    }

    private _handleClickOutside(e: Event): void {
        if (!this.contains(e.target as Node)) {
            this._closeDropdown();
        }
    }
}
