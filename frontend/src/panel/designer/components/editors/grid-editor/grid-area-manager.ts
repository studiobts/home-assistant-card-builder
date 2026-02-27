import type { GridArea } from '@/common/blocks/types';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { type CellSelection, getAreaColor } from './types';

/**
 * Grid Area Manager - Create, edit and delete grid areas
 */
@customElement('grid-area-manager')
export class GridAreaManager extends LitElement {
    static styles = css`
    :host {
      display: block;
    }

    .area-manager {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }

    .create-area-section {
      padding: 12px;
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 4px;
      border: 1px solid var(--border-color, #ddd);
    }

    .selection-info {
      font-size: 11px;
      color: var(--text-secondary, #666);
      margin-bottom: 8px;
      padding: 6px 8px;
      background: var(--bg-primary, #fff);
      border-radius: 3px;
      border: 1px solid var(--border-color, #ddd);
    }

    .selection-coords {
      font-weight: 600;
      color: var(--text-primary, #333);
    }

    .create-area-form {
      display: flex;
      gap: 6px;
      align-items: flex-end;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
    }

    .form-input {
      padding: 6px 8px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-input:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .btn {
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--accent-color, #2196f3);
      color: white;
    }

    .btn-primary:hover {
      background: var(--accent-dark, #1976d2);
    }

    .btn-primary:disabled {
      background: var(--border-color, #ddd);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-danger {
      background: var(--error-color, #f44336);
      color: white;
      padding: 4px 8px;
      font-size: 10px;
    }

    .btn-danger:hover {
      background: var(--error-dark, #d32f2f);
    }

    .areas-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .area-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      gap: 8px;
      border-left-width: 4px;
    }

    .area-color-indicator {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      flex-shrink: 0;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .area-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .area-name {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary, #333);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .area-coords {
      font-size: 9px;
      color: var(--text-secondary, #999);
      font-family: monospace;
    }

    .no-areas {
      padding: 16px;
      text-align: center;
      font-size: 11px;
      color: var(--text-secondary, #999);
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 4px;
      border: 1px dashed var(--border-color, #ddd);
    }
  `;
    @property({type: Array})
    areas: GridArea[] = [];
    @property({type: Object})
    selectedCells: CellSelection | null = null;

    render() {
        const hasSelection = !!this.selectedCells;
        const selectionSize = hasSelection
            ? {
                rows: this.selectedCells!.rowEnd - this.selectedCells!.rowStart,
                cols: this.selectedCells!.columnEnd - this.selectedCells!.columnStart,
            }
            : null;

        // Get suggested name for new area
        const suggestedName = this._getSuggestedAreaName();

        return html`
      <div class="area-manager">
        <!-- Create area section -->
        <div class="create-area-section">
          <div class="section-title">Create Grid Area</div>
          
          ${hasSelection
            ? html`
                <div class="selection-info">
                  Selected: 
                  <span class="selection-coords">
                    ${selectionSize!.rows} row${selectionSize!.rows > 1 ? 's' : ''} × 
                    ${selectionSize!.cols} column${selectionSize!.cols > 1 ? 's' : ''}
                  </span>
                </div>
                <div class="create-area-form">
                  <div class="form-group">
                    <label class="form-label">Area Name</label>
                    <input
                      id="area-name-input"
                      type="text"
                      class="form-input"
                      .value=${suggestedName}
                      placeholder="e.g., header, sidebar"
                    />
                  </div>
                  <button
                    class="btn btn-primary"
                    @click=${this._handleCreateArea}
                  >
                    Create
                  </button>
                </div>
              `
            : html`
                <div class="selection-info">
                  Select cells in the grid to create an area
                </div>
              `
        }
        </div>

        <!-- Areas list -->
        <div>
          <div class="section-title">Defined Areas (${this.areas.length})</div>
          ${this.areas.length > 0
            ? html`
                <div class="areas-list">
                  ${repeat(
                this.areas,
                (area) => area.name,
                (area) => html`
                      <div class="area-item" style="border-left-color: ${area.color || '#ddd'}">
                        <div 
                          class="area-color-indicator" 
                          style="background-color: ${area.color || '#ddd'}"
                        ></div>
                        <div class="area-info">
                          <div class="area-name">${area.name}</div>
                          <div class="area-coords">${this._formatCoords(area)}</div>
                        </div>
                        <button
                          class="btn btn-danger"
                          @click=${() => this._handleDeleteArea(area)}
                          title="Delete area"
                        >
                          Delete
                        </button>
                      </div>
                    `
            )}
                </div>
              `
            : html`
                <div class="no-areas">
                  No areas defined yet. Select cells to create one.
                </div>
              `
        }
        </div>
      </div>
    `;
    }

    private _handleCreateArea() {
        if (!this.selectedCells) return;

        const nameInput = this.shadowRoot?.querySelector('#area-name-input') as HTMLInputElement;
        const name = nameInput?.value.trim() || '';

        if (!name) {
            alert('Please enter an area name');
            return;
        }

        // Check if name already exists
        if (this.areas.some(a => a.name === name)) {
            alert('An area with this name already exists');
            return;
        }

        // Assign a color based on the current number of areas
        const color = getAreaColor(this.areas.length);

        const newArea: GridArea = {
            id: name.replaceAll(' ', '-').toLowerCase(),
            name,
            rowStart: this.selectedCells.rowStart,
            rowEnd: this.selectedCells.rowEnd,
            columnStart: this.selectedCells.columnStart,
            columnEnd: this.selectedCells.columnEnd,
            color, // Assign unique color
        };

        this.dispatchEvent(
            new CustomEvent('area-created', {
                detail: {area: newArea},
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleDeleteArea(area: GridArea) {
        this.dispatchEvent(
            new CustomEvent('area-deleted', {
                detail: {area},
                bubbles: true,
                composed: true,
            })
        );
    }

    private _formatCoords(area: GridArea): string {
        return `rows ${area.rowStart + 1}-${area.rowEnd} / cols ${area.columnStart + 1}-${area.columnEnd}`;
    }

    private _getSuggestedAreaName(): string {
        // Generate name in format Area-1, Area-2, etc.
        let counter = 1;
        let suggestedName = `Area-${counter}`;

        // Find first available Area-N name
        const existingNames = new Set(this.areas.map(a => a.name));
        while (existingNames.has(suggestedName)) {
            counter++;
            suggestedName = `Area-${counter}`;
        }

        return suggestedName;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'grid-area-manager': GridAreaManager;
    }
}

