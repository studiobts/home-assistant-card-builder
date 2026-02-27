import type { GridConfig } from '@/common/blocks/types';
import { gridDimensionsToCSS } from '@/common/blocks/utils';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { type CellSelection, getCellArea } from './types';

/**
 * Grid Visual Canvas - Interactive grid preview and cell selection
 */
@customElement('grid-visual-canvas')
export class GridVisualCanvas extends LitElement {
    static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      background: var(--bg-primary, #fff);
    }

    .canvas-container {
      padding: 20px;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .grid-preview {
      display: grid;
      border: 2px solid var(--border-color, #ddd);
      background: var(--bg-secondary, #f9f9f9);
      min-width: 400px;
      min-height: 300px;
      position: relative;
    }

    .grid-cell {
      border: 1px solid var(--border-color, #ddd);
      background: var(--bg-primary, #fff);
      position: relative;
      cursor: pointer;
      transition: all 0.15s ease;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: var(--text-secondary, #999);
      user-select: none;
    }

    .grid-cell:hover {
      background: var(--accent-light, #e3f2fd);
      border-color: var(--accent-color, #2196f3);
    }

    .grid-cell.selected {
      background: var(--accent-color, #2196f3);
      color: white;
      border-color: var(--accent-color, #2196f3);
      z-index: 1;
    }

    .grid-cell.in-area {
      /* Color set via inline style with area-specific color */
      border-width: 2px;
    }

    .grid-cell.in-area.selected {
      /* Darker version when selected, set via inline style */
      color: white;
    }

    .area-label {
      position: absolute;
      top: 2px;
      left: 4px;
      font-size: 9px;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 4px;
      border-radius: 2px;
      pointer-events: none;
      z-index: 1;
    }

    .cell-coordinates {
      opacity: 0.5;
      font-size: 9px;
    }
  `;
    @property({type: Object})
    config!: GridConfig;
    @state()
    private selectedCells: CellSelection | null = null;
    @state()
    private isDragging = false;
    @state()
    private dragStart: { row: number; column: number } | null = null;

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('mouseup', this._handleMouseUp.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('mouseup', this._handleMouseUp.bind(this));
    }

    clearSelection() {
        this.selectedCells = null;
    }

    render() {
        const gridStyle = {
            gridTemplateRows: gridDimensionsToCSS(this.config.rowSizes),
            gridTemplateColumns: gridDimensionsToCSS(this.config.columnSizes),
            gap: `${this.config.gap.row}px ${this.config.gap.column}px`,
        };

        const cells: Array<{ row: number; column: number }> = [];
        for (let row = 0; row < this.config.rows; row++) {
            for (let column = 0; column < this.config.columns; column++) {
                cells.push({row, column});
            }
        }

        return html`
      <div class="canvas-container">
        <div class="grid-preview" style=${styleMap(gridStyle)}>
          ${repeat(
            cells,
            (cell) => `${cell.row}-${cell.column}`,
            (cell) => {
                const area = getCellArea(cell.row, cell.column, this.config.areas);
                const isSelected = this._isCellSelected(cell.row, cell.column);
                const classes = {
                    'grid-cell': true,
                    'selected': isSelected,
                    'in-area': !!area,
                };

                // Generate cell-specific styles with area color
                const cellStyles: Record<string, string> = {};
                if (area && area.color) {
                    // Convert hex color to rgba with alpha
                    const hexToRgba = (hex: string, alpha: number) => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    };

                    if (isSelected) {
                        // Darker, more opaque when selected
                        cellStyles.background = hexToRgba(area.color, 0.9);
                        cellStyles.borderColor = area.color;
                    } else {
                        // Lighter, semi-transparent when not selected
                        cellStyles.background = hexToRgba(area.color, 0.25);
                        cellStyles.borderColor = hexToRgba(area.color, 0.6);
                    }
                }

                return html`
                <div
                  class=${classMap(classes)}
                  style=${styleMap(cellStyles)}
                  @mousedown=${() => this._handleCellMouseDown(cell.row, cell.column)}
                  @mouseenter=${() => this._handleCellMouseEnter(cell.row, cell.column)}
                >
                  ${area && cell.row === area.rowStart && cell.column === area.columnStart
                    ? html`<span class="area-label">${area.name}</span>`
                    : ''
                }
                  <span class="cell-coordinates">${cell.row + 1},${cell.column + 1}</span>
                </div>
              `;
            }
        )}
        </div>
      </div>
    `;
    }

    private _isCellSelected(row: number, column: number): boolean {
        if (!this.selectedCells) return false;

        return (
            row >= this.selectedCells.rowStart &&
            row < this.selectedCells.rowEnd &&
            column >= this.selectedCells.columnStart &&
            column < this.selectedCells.columnEnd
        );
    }

    private _handleCellMouseDown(row: number, column: number) {
        this.isDragging = true;
        this.dragStart = {row, column};
        this.selectedCells = {
            rowStart: row,
            rowEnd: row + 1,
            columnStart: column,
            columnEnd: column + 1,
        };
    }

    private _handleCellMouseEnter(row: number, column: number) {
        if (this.isDragging && this.dragStart) {
            const rowStart = Math.min(this.dragStart.row, row);
            const rowEnd = Math.max(this.dragStart.row, row) + 1;
            const columnStart = Math.min(this.dragStart.column, column);
            const columnEnd = Math.max(this.dragStart.column, column) + 1;

            this.selectedCells = {rowStart, rowEnd, columnStart, columnEnd};
        }
    }

    private _handleMouseUp() {
        if (this.isDragging && this.selectedCells) {
            // Emit selection event
            this.dispatchEvent(
                new CustomEvent('cells-selected', {
                    detail: {selection: this.selectedCells},
                    bubbles: true,
                    composed: true,
                })
            );
        }

        this.isDragging = false;
        this.dragStart = null;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'grid-visual-canvas': GridVisualCanvas;
    }
}

