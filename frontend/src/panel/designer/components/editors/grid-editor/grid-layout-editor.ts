import { DEFAULT_GRID_CONFIG } from '@/common/blocks/components/layout/block-grid';
import type { GridConfig } from '@/common/blocks/types';
import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { type CellSelection, createGridDimension, GRID_CONSTRAINTS } from './types';

import './grid-visual-canvas';
import './grid-size-input';
import './grid-area-manager';

/**
 * Grid Layout Editor - Main editor component
 */
@customElement('grid-layout-editor')
export class GridLayoutEditor extends LitElement {
    static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-primary, #fff);
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .editor-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #ddd);
      background: var(--bg-secondary, #f5f5f5);
    }

    .editor-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #333);
      margin: 0 0 12px 0;
    }

    .grid-dimensions {
      display: flex;
      gap: 16px;
      align-items: flex-end;
    }

    .dimension-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .dimension-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .dimension-input {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dimension-input input {
      width: 60px;
      padding: 6px 8px;
      font-size: 12px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      background: var(--bg-primary, #fff);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .dimension-input input:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .dimension-info {
      font-size: 10px;
      color: var(--text-secondary, #999);
    }

    .editor-body {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .canvas-section {
      flex: 1;
      overflow: auto;
      border-right: 1px solid var(--border-color, #ddd);
    }

    .sidebar-section {
      width: 260px;
      overflow-y: auto;
      background: var(--bg-secondary, #f9f9f9);
      display: flex;
      flex-direction: column;
    }

    .sidebar-tab {
      border-bottom: 1px solid var(--border-color, #ddd);
    }

    .tab-header {
      padding: 12px 16px;
      background: var(--bg-tertiary, #e0e0e0);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary, #333);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.15s ease;
    }

    .tab-header:hover {
      background: var(--bg-secondary, #d0d0d0);
    }

    .tab-header.collapsed {
      border-bottom: 1px solid var(--border-color, #ddd);
    }

    .tab-icon {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid var(--text-secondary, #666);
      transition: transform 0.2s ease;
    }

    .tab-header.collapsed .tab-icon {
      transform: rotate(-90deg);
    }

    .tab-content {
      padding: 12px;
      background: var(--bg-primary, #fff);
    }

    .tab-content.hidden {
      display: none;
    }

    .sizes-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .gap-controls {
      display: flex;
      gap: 12px;
    }

    .gap-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .gap-label {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
    }

    .gap-input {
      width: 100%;
      padding: 6px 8px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--border-color, #ddd);
      background: var(--bg-secondary, #f5f5f5);
    }

    .btn {
      flex: 1;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-cancel {
      background: var(--bg-tertiary, #e0e0e0);
      color: var(--text-primary, #333);
    }

    .btn-cancel:hover {
      background: var(--bg-secondary, #d0d0d0);
    }

    .btn-apply {
      background: var(--accent-color, #2196f3);
      color: white;
    }

    .btn-apply:hover {
      background: var(--accent-dark, #1976d2);
    }
  `;
    @property({type: Object})
    config: GridConfig = {...DEFAULT_GRID_CONFIG};
    @state()
    private selectedCells: CellSelection | null = null;
    @query('grid-visual-canvas')
    private canvas?: any;
    private collapsedTabs = new Set<string>();

    render() {
        return html`
      <div class="editor-container">
        <!-- Header with grid dimensions -->
        <div class="editor-header">
          <h3 class="editor-title">Grid Layout Editor</h3>
          <div class="grid-dimensions">
            <div class="dimension-group">
              <label class="dimension-label">Rows</label>
              <div class="dimension-input">
                <input
                  type="number"
                  .value=${this.config.rows.toString()}
                  @input=${this._handleRowsChange}
                  min=${GRID_CONSTRAINTS.MIN_ROWS}
                  max=${GRID_CONSTRAINTS.MAX_ROWS}
                />
                <span class="dimension-info">
                  (${GRID_CONSTRAINTS.MIN_ROWS}-${GRID_CONSTRAINTS.MAX_ROWS})
                </span>
              </div>
            </div>
            <div class="dimension-group">
              <label class="dimension-label">Columns</label>
              <div class="dimension-input">
                <input
                  type="number"
                  .value=${this.config.columns.toString()}
                  @input=${this._handleColumnsChange}
                  min=${GRID_CONSTRAINTS.MIN_COLUMNS}
                  max=${GRID_CONSTRAINTS.MAX_COLUMNS}
                />
                <span class="dimension-info">
                  (${GRID_CONSTRAINTS.MIN_COLUMNS}-${GRID_CONSTRAINTS.MAX_COLUMNS})
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Body with canvas and sidebar -->
        <div class="editor-body">
          <!-- Canvas section -->
          <div class="canvas-section">
            <grid-visual-canvas
              .config=${this.config}
              @cells-selected=${this._handleCellsSelected}
            ></grid-visual-canvas>
          </div>

          <!-- Sidebar section -->
          <div class="sidebar-section">
            <!-- Row sizes tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has('rows') ? 'collapsed' : ''}"
                @click=${() => this._toggleTab('rows')}
              >
                <span>Row Sizes</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has('rows') ? 'hidden' : ''}">
                <div class="sizes-list">
                  ${repeat(
            this.config.rowSizes,
            (_, index) => index,
            (dimension, index) => html`
                      <grid-size-input
                        .dimension=${dimension}
                        .index=${index}
                        .type=${'row'}
                        @dimension-change=${this._handleDimensionChange}
                      ></grid-size-input>
                    `
        )}
                </div>
              </div>
            </div>

            <!-- Column sizes tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has('columns') ? 'collapsed' : ''}"
                @click=${() => this._toggleTab('columns')}
              >
                <span>Column Sizes</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has('columns') ? 'hidden' : ''}">
                <div class="sizes-list">
                  ${repeat(
            this.config.columnSizes,
            (_, index) => index,
            (dimension, index) => html`
                      <grid-size-input
                        .dimension=${dimension}
                        .index=${index}
                        .type=${'column'}
                        @dimension-change=${this._handleDimensionChange}
                      ></grid-size-input>
                    `
        )}
                </div>
              </div>
            </div>

            <!-- Gap tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has('gap') ? 'collapsed' : ''}"
                @click=${() => this._toggleTab('gap')}
              >
                <span>Gap</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has('gap') ? 'hidden' : ''}">
                <div class="gap-controls">
                  <div class="gap-group">
                    <label class="gap-label">Row Gap (px)</label>
                    <input
                      type="number"
                      class="gap-input"
                      .value=${this.config.gap.row.toString()}
                      @input=${(e: Event) => this._handleGapChange(e, 'row')}
                      min="0"
                      max=${GRID_CONSTRAINTS.MAX_GAP}
                    />
                  </div>
                  <div class="gap-group">
                    <label class="gap-label">Column Gap (px)</label>
                    <input
                      type="number"
                      class="gap-input"
                      .value=${this.config.gap.column.toString()}
                      @input=${(e: Event) => this._handleGapChange(e, 'column')}
                      min="0"
                      max=${GRID_CONSTRAINTS.MAX_GAP}
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Areas tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has('areas') ? 'collapsed' : ''}"
                @click=${() => this._toggleTab('areas')}
              >
                <span>Grid Areas</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has('areas') ? 'hidden' : ''}">
                <grid-area-manager
                  .areas=${this.config.areas}
                  .selectedCells=${this.selectedCells}
                  @area-created=${this._handleAreaCreated}
                  @area-deleted=${this._handleAreaDeleted}
                ></grid-area-manager>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="action-buttons">
          <button class="btn btn-cancel" @click=${this._handleCancel}>Cancel</button>
          <button class="btn btn-apply" @click=${this._handleApply}>Apply</button>
        </div>
      </div>
    `;
    }

    private _handleRowsChange(e: Event) {
        const input = e.target as HTMLInputElement;
        let rows = parseInt(input.value) || 1;
        rows = Math.max(GRID_CONSTRAINTS.MIN_ROWS, Math.min(GRID_CONSTRAINTS.MAX_ROWS, rows));

        const newConfig = {...this.config, rows};

        // Adjust row sizes array
        if (rows > this.config.rowSizes.length) {
            // Add new rows
            const toAdd = rows - this.config.rowSizes.length;
            newConfig.rowSizes = [
                ...this.config.rowSizes,
                ...Array(toAdd).fill(null).map(() => createGridDimension(1, 'fr')),
            ];
        } else if (rows < this.config.rowSizes.length) {
            // Remove rows
            newConfig.rowSizes = this.config.rowSizes.slice(0, rows);
        }

        // Remove areas that are out of bounds
        newConfig.areas = this.config.areas.filter(
            area => area.rowEnd <= rows && area.columnEnd <= this.config.columns
        );

        this.config = newConfig;
        this._clearSelection();
    }

    private _handleColumnsChange(e: Event) {
        const input = e.target as HTMLInputElement;
        let columns = parseInt(input.value) || 1;
        columns = Math.max(GRID_CONSTRAINTS.MIN_COLUMNS, Math.min(GRID_CONSTRAINTS.MAX_COLUMNS, columns));

        const newConfig = {...this.config, columns};

        // Adjust column sizes array
        if (columns > this.config.columnSizes.length) {
            // Add new columns
            const toAdd = columns - this.config.columnSizes.length;
            newConfig.columnSizes = [
                ...this.config.columnSizes,
                ...Array(toAdd).fill(null).map(() => createGridDimension(1, 'fr')),
            ];
        } else if (columns < this.config.columnSizes.length) {
            // Remove columns
            newConfig.columnSizes = this.config.columnSizes.slice(0, columns);
        }

        // Remove areas that are out of bounds
        newConfig.areas = this.config.areas.filter(
            area => area.rowEnd <= this.config.rows && area.columnEnd <= columns
        );

        this.config = newConfig;
        this._clearSelection();
    }

    private _handleDimensionChange(e: CustomEvent) {
        const {index, type, dimension} = e.detail;

        const newConfig = {...this.config};
        if (type === 'row') {
            newConfig.rowSizes = [...this.config.rowSizes];
            newConfig.rowSizes[index] = dimension;
        } else {
            newConfig.columnSizes = [...this.config.columnSizes];
            newConfig.columnSizes[index] = dimension;
        }

        this.config = newConfig;
    }

    private _handleGapChange(e: Event, type: 'row' | 'column') {
        const input = e.target as HTMLInputElement;
        const value = Math.max(0, Math.min(GRID_CONSTRAINTS.MAX_GAP, parseInt(input.value) || 0));

        this.config = {
            ...this.config,
            gap: {
                ...this.config.gap,
                [type]: value,
            },
        };
    }

    private _handleCellsSelected(e: CustomEvent) {
        this.selectedCells = e.detail.selection;
    }

    private _handleAreaCreated(e: CustomEvent) {
        const {area} = e.detail;
        this.config = {
            ...this.config,
            areas: [...this.config.areas, area],
        };
        this._clearSelection();
    }

    private _handleAreaDeleted(e: CustomEvent) {
        const {area} = e.detail;
        this.config = {
            ...this.config,
            areas: this.config.areas.filter(a => a.name !== area.name),
        };
    }

    private _clearSelection() {
        this.selectedCells = null;
        this.canvas?.clearSelection();
    }

    private _toggleTab(tabId: string) {
        if (this.collapsedTabs.has(tabId)) {
            this.collapsedTabs.delete(tabId);
        } else {
            this.collapsedTabs.add(tabId);
        }
        this.requestUpdate();
    }

    private _handleCancel() {
        this.dispatchEvent(
            new CustomEvent('editor-cancel', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleApply() {
        this.dispatchEvent(
            new CustomEvent('editor-apply', {
                detail: {config: this.config},
                bubbles: true,
                composed: true,
            })
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'grid-layout-editor': GridLayoutEditor;
    }
}

