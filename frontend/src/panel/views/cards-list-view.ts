import { type CardData, getCardsService } from '@/common/api';
import { migrateDocumentData, needsDocumentMigration } from '@/common/core/model/migration';
import type { HomeAssistant } from 'custom-card-helpers';
import { getRouter, ROUTES } from '@/panel/router';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { CardsManager, cardsManagerContext } from '@/panel/cards-manager';

/**
 * Cards list view - CRUD table for managing cards with search, sort, and pagination
 */
@customElement('cards-list-view')
export class CardsListView extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 24px;
            background-color: var(--primary-background-color);
            min-height: 100%;
        }

        .cards-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .cards-title {
            font-size: 32px;
            font-weight: 300;
            color: var(--primary-text-color);
            margin: 0;
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        .primary-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: opacity 0.2s ease;
            font-family: inherit;
        }

        .primary-button:hover {
            opacity: 0.9;
        }

        .secondary-button {
            display: flex;
            align-items: center;
            padding: 10px 20px;
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s ease;
            font-family: inherit;
        }

        .secondary-button:hover {
            background: var(--divider-color);
        }

        .secondary-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .icon-small {
            width: 20px;
            height: 20px;
        }

        /* Filters Bar */

        .filters-bar {
            background: var(--card-background-color);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
        }

        .search-input {
            flex: 1;
            min-width: 200px;
            padding: 10px 12px;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            background: var(--primary-background-color);
            color: var(--primary-text-color);
            font-size: 14px;
            font-family: inherit;
        }

        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .page-size-select {
            padding: 8px 12px;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            background: var(--primary-background-color);
            color: var(--primary-text-color);
            font-size: 14px;
            font-family: inherit;
            cursor: pointer;
        }

        /* Table */

        .table-container {
            background: var(--card-background-color);
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: var(--secondary-background-color);
        }

        th {
            padding: 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 500;
            color: var(--secondary-text-color);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: pointer;
            user-select: none;
            position: relative;
        }

        th:hover {
            background: var(--divider-color);
        }

        th.sortable::after {
            content: '';
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            opacity: 0.3;
        }

        th.sort-asc::after {
            border-bottom: 6px solid var(--primary-text-color);
            opacity: 1;
        }

        th.sort-desc::after {
            border-top: 6px solid var(--primary-text-color);
            opacity: 1;
        }

        td {
            padding: 5px 10px;
            border-top: 1px solid var(--divider-color);
            color: var(--primary-text-color);
        }

        .card-name {
            font-weight: 500;
            margin-bottom: 4px;
        }

        .card-name:hover {
            color: var(--primary-color);
            text-decoration: underline;
            cursor: pointer;
        }

        .card-description {
            font-size: 12px;
            color: var(--secondary-text-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 300px;
        }

        .card-date {
            font-size: 13px;
            color: var(--secondary-text-color);
        }

        .actions-cell {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        .migrate-button {
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border: 1px solid var(--warning-color);
            border-radius: 6px;
            background: transparent;
            color: var(--warning-color);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease, opacity 0.2s ease;
            font-family: inherit;
        }

        .migrate-button:hover {
            background: rgba(255, 152, 0, 0.15);
        }

        .migrate-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .icon-button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            color: var(--primary-text-color);
            border-radius: 4px;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-button:hover {
            background-color: var(--secondary-background-color);
        }

        .icon-button.delete {
            color: var(--error-color);
        }

        .icon {
            width: 20px;
            height: 20px;
        }

        /* Pagination */

        .pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: var(--card-background-color);
            border-radius: 8px;
            margin-top: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            flex-wrap: wrap;
            gap: 16px;
        }

        .pagination-info {
            font-size: 14px;
            color: var(--secondary-text-color);
        }

        .pagination-controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .page-button {
            padding: 8px 12px;
            background: var(--primary-background-color);
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            cursor: pointer;
            color: var(--primary-text-color);
            font-size: 14px;
            transition: background-color 0.2s ease;
            min-width: 36px;
            font-family: inherit;
        }

        .page-button:hover:not(:disabled) {
            background: var(--secondary-background-color);
        }

        .page-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .page-button.active {
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-color: var(--primary-color);
        }

        /* Loading State */

        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 64px 16px;
            color: var(--secondary-text-color);
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--divider-color);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Empty State */

        .empty-state {
            text-align: center;
            padding: 64px 16px;
            color: var(--secondary-text-color);
        }

        .empty-state ha-icon {
            --mdc-icon-size: 48px;
            margin-bottom: 16px;
            opacity: 0.3;
        }

        .empty-state-title {
            font-size: 20px;
            color: var(--primary-text-color);
            margin: 0 0 8px 0;
        }

        .empty-state-text {
            font-size: 14px;
            margin: 0 0 24px 0;
        }

        /* Delete Dialog */

        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        }

        .dialog {
            background: var(--card-background-color, var(--primary-background-color));
            border-radius: 8px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 11px 15px -7px rgba(0, 0, 0, .2), 0 24px 38px 3px rgba(0, 0, 0, .14), 0 9px 46px 8px rgba(0, 0, 0, .12);
        }

        .import-dialog {
            max-width: 700px;
        }

        .dialog-header {
            font-size: 24px;
            font-weight: 400;
            margin: 0;
            padding: 24px 24px 16px;
            color: var(--primary-text-color);
        }

        .dialog-content {
            padding: 0 24px 24px;
            color: var(--primary-text-color);
        }

        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 16px 24px;
            border-top: 1px solid var(--divider-color);
        }

        .import-tabs {
            display: flex;
            gap: 0;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--divider-color);
        }

        .import-tab {
            flex: 1;
            padding: 12px 16px;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            color: var(--secondary-text-color);
            transition: all 0.2s ease;
            font-family: inherit;
        }

        .import-tab:hover {
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
        }

        .import-tab.active {
            color: var(--primary-color);
            border-bottom-color: var(--primary-color);
        }

        .import-textarea {
            width: 100%;
            min-height: 200px;
            padding: 12px;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
            resize: vertical;
            box-sizing: border-box;
        }

        .import-textarea:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .file-upload-area {
            border: 2px dashed var(--divider-color);
            border-radius: 8px;
            padding: 32px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            background: var(--secondary-background-color);
        }

        .file-upload-area:hover {
            border-color: var(--primary-color);
            background: var(--primary-background-color);
        }

        .file-upload-area.drag-over {
            border-color: var(--primary-color);
            background: var(--primary-color);
            opacity: 0.1;
        }

        .file-upload-area ha-icon {
            --mdc-icon-size: 64px;
            display: block;
            margin-bottom: 16px;
            color: var(--secondary-text-color);
        }

        .file-upload-text {
            color: var(--primary-text-color);
            font-size: 16px;
            margin-bottom: 8px;
        }

        .file-upload-hint {
            color: var(--secondary-text-color);
            font-size: 12px;
        }

        .file-input {
            display: none;
        }

        .selected-file {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--secondary-background-color);
            border-radius: 4px;
            margin-top: 12px;
        }

        .selected-file-icon {
            width: 32px;
            height: 32px;
            color: var(--primary-color);
        }

        .selected-file-info {
            flex: 1;
        }

        .selected-file-name {
            font-weight: 500;
            color: var(--primary-text-color);
        }

        .selected-file-size {
            font-size: 12px;
            color: var(--secondary-text-color);
        }

        .error-box {
            padding: 12px;
            background: var(--error-color, #f44336);
            color: white;
            border-radius: 4px;
            margin: 16px 0;
            font-size: 14px;
        }

        .success-box {
            padding: 12px;
            background: var(--success-color, #4caf50);
            color: white;
            border-radius: 4px;
            margin: 16px 0;
            font-size: 14px;
        }

        .form-field {
            margin-bottom: 16px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            color: var(--primary-text-color);
            font-size: 14px;
            font-weight: 500;
        }

        .form-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            font-size: 14px;
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
            font-family: inherit;
            box-sizing: border-box;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .form-textarea {
            min-height: 80px;
            resize: vertical;
        }

        .form-hint {
            margin-top: 6px;
            font-size: 12px;
            color: var(--secondary-text-color);
        }

        .danger-button {
            padding: 10px 20px;
            background: var(--error-color, #f44336);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: opacity 0.2s ease;
            font-family: inherit;
        }

        .danger-button:hover {
            opacity: 0.9;
        }

        .danger-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Error Message */

        .error-message {
            background: var(--error-color);
            color: white;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            :host {
                padding: 16px;
            }

            .cards-header {
                flex-direction: column;
                align-items: flex-start;
            }

            .filters-bar {
                flex-direction: column;
                align-items: stretch;
            }

            .search-input {
                width: 100%;
            }

            table {
                font-size: 12px;
            }

            th, td {
                padding: 12px 8px;
            }

            .card-description {
                display: none;
            }

            .pagination {
                flex-direction: column;
                align-items: stretch;
            }

            .pagination-controls {
                justify-content: center;
            }
        }
    `;

    @property({attribute: false})
    hass?: HomeAssistant;

    @consume({context: cardsManagerContext, subscribe: true})
    private cardsManager!: CardsManager;

    @state() private cards: CardData[] = [];
    @state() private filteredCards: CardData[] = [];
    @state() private loading = true;
    @state() private searchQuery = '';
    @state() private sortColumn: 'name' | 'updated_at' = 'updated_at';
    @state() private sortDirection: 'asc' | 'desc' = 'desc';
    @state() private currentPage = 1;
    @state() private pageSize = 10;
    @state() private deleteConfirmId: string | null = null;
    @state() private error: string | null = null;
    @state() private showImportDialog = false;
    @state() private importMethod: 'paste' | 'file' = 'paste';
    @state() private importJsonText = '';
    @state() private importData: Partial<CardData> | null = null;
    @state() private importError: string | null = null;
    @state() private importName = '';
    @state() private importDescription = '';
    @state() private isImporting = false;
    @state() private migratingCardIds = new Set<string>();
    @state() private duplicateSourceId: string | null = null;
    @state() private duplicateName = '';
    @state() private exportSourceId: string | null = null;
    @state() private exportFileName = '';


    private cardsService?: ReturnType<typeof getCardsService>;
    private unsubscribe?: () => void;
    private router = getRouter();
    private searchTimeout?: number;

    connectedCallback(): void {
        super.connectedCallback();
        if (this.hass) {
            this.cardsService = getCardsService(this.hass);
            this._loadCards();
            this._subscribeToUpdates();
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
    }

    updated(changedProps: Map<string, any>): void {
        if (changedProps.has('hass') && this.hass && !this.cardsService) {
            this.cardsService = getCardsService(this.hass);
            this._loadCards();
            this._subscribeToUpdates();
        }
    }

    render() {
        if (this.loading) {
            return this._renderLoading();
        }

        return html`
            ${this.error ? html`
                <div class="error-message">
                    <strong>Error:</strong> ${this.error}
                </div>
            ` : ''}

            <div class="cards-header">
                <h1 class="cards-title">Cards</h1>
                <div class="header-actions">
                    <button class="secondary-button" @click=${this._handleImportClick}>
                        <ha-icon icon="mdi:file-download-outline"></ha-icon>
                        Import Card
                    </button>
                    <button class="primary-button" @click=${this._handleCreateNew}>
                        <ha-icon icon="mdi:plus-circle"></ha-icon>
                        New Card
                    </button>
                </div>
            </div>

            ${this._renderFilters()}
            ${this.filteredCards.length === 0 ? this._renderEmptyState() : this._renderTable()}
            ${this.filteredCards.length > 0 ? this._renderPagination() : ''}
            ${this.deleteConfirmId ? this._renderDeleteDialog() : ''}
            ${this.showImportDialog ? this._renderImportDialog() : ''}
            ${this.duplicateSourceId ? this._renderDuplicateDialog() : ''}
            ${this.exportSourceId ? this._renderExportDialog() : ''}
        `;
    }

    private _renderFilters() {
        return html`
            <div class="filters-bar">
                <input
                        type="text"
                        class="search-input"
                        placeholder="Search by name or description..."
                        .value=${this.searchQuery}
                        @input=${this._handleSearchInput}
                />
                <select
                        class="page-size-select"
                        .value=${this.pageSize.toString()}
                        @change=${this._handlePageSizeChange}
                >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                </select>
            </div>
        `;
    }

    private _renderTable() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageCards = this.filteredCards.slice(startIndex, endIndex);

        return html`
            <div class="table-container">
                <table>
                    <thead>
                    <tr>
                        <th
                                class="sortable ${this.sortColumn === 'name' ? `sort-${this.sortDirection}` : ''}"
                                @click=${() => this._handleSort('name')}
                        >
                            Name
                        </th>
                        <th>Description</th>
                        <th
                                class="sortable ${this.sortColumn === 'updated_at' ? `sort-${this.sortDirection}` : ''}"
                                @click=${() => this._handleSort('updated_at')}
                        >
                            Modified
                        </th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${pageCards.map(card => this._renderTableRow(card))}
                    </tbody>
                </table>
            </div>
        `;
    }

    private _renderTableRow(card: CardData) {
        const needsMigration = needsDocumentMigration(card.config);
        const isMigrating = this._isMigrating(card.id);

        return html`
            <tr>
                <td>
                    <div
                            class="card-name"
                            @click=${() => this._handleEdit(card.id)}
                    >${card.name}
                    </div>
                </td>
                <td>
                    <div class="card-description">
                        ${card.description || html`<em>No description</em>`}
                    </div>
                </td>
                <td>
                    <div class="card-date">${this._formatDate(card.updated_at)}</div>
                </td>
                <td>
                    <div class="actions-cell">
                        ${needsMigration ? html`
                            <button
                                    class="migrate-button"
                                    @click=${() => this._handleMigrateCard(card.id)}
                                    ?disabled=${isMigrating}
                                    title="Migrate card to the latest data format"
                            >
                                ${isMigrating ? 'Migrating...' : 'Migrate'}
                            </button>
                        ` : ''}
                        <button
                                class="icon-button"
                                @click=${() => this._handleDuplicateClick(card.id)}
                                title="Duplicate card"
                        >
                            <ha-icon icon="mdi:content-copy"></ha-icon>
                        </button>
                        <button
                                class="icon-button"
                                @click=${() => this._handleExportClick(card.id)}
                                title="Export card"
                        >
                            <ha-icon icon="mdi:file-export-outline"></ha-icon>
                        </button>
                        <button
                                class="icon-button"
                                @click=${() => this._handleEdit(card.id)}
                                title="Edit card"
                        >
                            <ha-icon icon="mdi:pencil"></ha-icon>
                        </button>
                        <button
                                class="icon-button delete"
                                @click=${() => this._handleDeleteClick(card.id)}
                                title="Delete card"
                        >
                            <ha-icon icon="mdi:delete"></ha-icon>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    private _renderPagination() {
        const totalPages = Math.ceil(this.filteredCards.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize + 1;
        const endIndex = Math.min(this.currentPage * this.pageSize, this.filteredCards.length);

        // Calculate page numbers to show
        const pageNumbers: number[] = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return html`
            <div class="pagination">
                <div class="pagination-info">
                    Showing ${startIndex}-${endIndex} of ${this.filteredCards.length}
                </div>
                <div class="pagination-controls">
                    <button
                            class="page-button"
                            @click=${() => this._goToPage(this.currentPage - 1)}
                            ?disabled=${this.currentPage === 1}
                    >
                        ‹
                    </button>
                    ${pageNumbers.map(page => html`
                        <button
                                class="page-button ${page === this.currentPage ? 'active' : ''}"
                                @click=${() => this._goToPage(page)}
                        >
                            ${page}
                        </button>
                    `)}
                    <button
                            class="page-button"
                            @click=${() => this._goToPage(this.currentPage + 1)}
                            ?disabled=${this.currentPage === totalPages}
                    >
                        ›
                    </button>
                </div>
            </div>
        `;
    }

    private _renderLoading() {
        return html`
            <div class="loading">
                <div class="spinner"></div>
                <div>Loading cards...</div>
            </div>
        `;
    }

    private _renderEmptyState() {
        if (this.searchQuery) {
            return html`
                <div class="table-container">
                    <div class="empty-state">
                        <ha-icon icon="mdi:credit-card-search-outline"></ha-icon>
                        <h3 class="empty-state-title">No cards found</h3>
                        <p class="empty-state-text">Try adjusting your search query</p>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="table-container">
                <div class="empty-state">
                    <ha-icon icon="mdi:card-bulleted-off-outline"></ha-icon>
                    <h3 class="empty-state-title">No cards yet</h3>
                    <p class="empty-state-text">Get started by creating your first card</p>
                </div>
            </div>
        `;
    }

    private _renderDeleteDialog() {
        if (!this.deleteConfirmId) return null;

        const card = this.cards.find(c => c.id === this.deleteConfirmId);
        if (!card) return null;

        return html`
            <div class="dialog-overlay" @click=${this._cancelDelete}>
                <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
                    <h2 class="dialog-header">Delete Card</h2>
                    <div class="dialog-content">
                        Are you sure you want to delete <strong>"${card.name}"</strong>?
                        This action cannot be undone.
                    </div>
                    <div class="dialog-actions">
                        <button class="secondary-button" @click=${this._cancelDelete}>
                            Cancel
                        </button>
                        <button class="danger-button" @click=${this._confirmDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private _renderImportDialog() {
        const isValid = this.importData !== null && !this.importError && this.importName.trim() !== '';

        return html`
            <div class="dialog-overlay" @click=${this._handleCloseImport}>
                <div class="dialog import-dialog" @click=${(e: Event) => e.stopPropagation()}>
                    <h2 class="dialog-header">Import Card</h2>

                    <div class="dialog-content">
                        <!-- Tabs -->
                        <div class="import-tabs">
                            <button
                                    class="import-tab ${this.importMethod === 'paste' ? 'active' : ''}"
                                    @click=${() => this._handleImportMethodChange('paste')}
                            >
                                <ha-icon icon="mdi:clipboard-outline"></ha-icon>
                                Paste JSON
                            </button>
                            <button
                                    class="import-tab ${this.importMethod === 'file' ? 'active' : ''}"
                                    @click=${() => this._handleImportMethodChange('file')}
                            >
                                <ha-icon icon="mdi:file-download-outline"></ha-icon>
                                Upload File
                            </button>
                        </div>

                        <!-- Paste JSON -->
                        ${this.importMethod === 'paste' ? html`
                            <textarea
                                    class="import-textarea"
                                    placeholder="Paste your card JSON here..."
                                    .value=${this.importJsonText}
                                    @input=${this._handleJsonInput}
                            ></textarea>
                        ` : ''}

                        <!-- File Upload -->
                        ${this.importMethod === 'file' ? html`
                            <div
                                    class="file-upload-area"
                                    @click=${this._handleFileClick}
                                    @dragover=${this._handleDragOver}
                                    @dragleave=${this._handleDragLeave}
                                    @drop=${this._handleFileDrop}
                            >
                                <ha-icon icon="mdi:file-download-outline"></ha-icon>
                                <div class="file-upload-text">Click to select or drag and drop</div>
                                <div class="file-upload-hint">JSON files only</div>
                            </div>
                            <input
                                    type="file"
                                    class="file-input"
                                    accept=".json"
                                    @change=${this._handleFileSelect}
                            />
                        ` : ''}

                        <!-- Error Display -->
                        ${this.importError ? html`
                            <div class="error-box">
                                ${this.importError}
                            </div>
                        ` : ''}

                        <!-- Success / Form Fields -->
                        ${this.importData && !this.importError ? html`
                            <div class="success-box">
                                ✓ JSON is valid and ready to import
                            </div>

                            <div class="form-field">
                                <label class="form-label">Card Name *</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        .value=${this.importName}
                                        @input=${this._handleNameInput}
                                        placeholder="Enter card name"
                                />
                            </div>

                            <div class="form-field">
                                <label class="form-label">Description</label>
                                <textarea
                                        class="form-input form-textarea"
                                        .value=${this.importDescription}
                                        @input=${this._handleDescriptionInput}
                                        placeholder="Enter card description (optional)"
                                ></textarea>
                            </div>
                        ` : ''}
                    </div>

                    <div class="dialog-actions">
                        <button class="secondary-button" @click=${this._handleCloseImport}>
                            Cancel
                        </button>
                        <button
                                class="primary-button"
                                @click=${this._handleConfirmImport}
                                ?disabled=${!isValid || this.isImporting}
                        >
                            ${this.isImporting ? 'Importing...' : 'Import Card'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private _renderDuplicateDialog() {
        if (!this.duplicateSourceId) return null;
        const card = this.cards.find(c => c.id === this.duplicateSourceId);
        if (!card) return null;

        const isValid = this.duplicateName.trim().length > 0;

        return html`
            <div class="dialog-overlay" @click=${this._handleCloseDuplicate}>
                <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
                    <h2 class="dialog-header">Duplicate Card</h2>
                    <div class="dialog-content">
                        <div class="form-field">
                            <label class="form-label">New Card Name *</label>
                            <input
                                    type="text"
                                    class="form-input"
                                    .value=${this.duplicateName}
                                    @input=${this._handleDuplicateNameInput}
                                    placeholder="Enter new card name"
                            />
                            <div class="form-hint">Source: ${card.name}</div>
                        </div>
                    </div>
                    <div class="dialog-actions">
                        <button class="secondary-button" @click=${this._handleCloseDuplicate}>
                            Cancel
                        </button>
                        <button
                                class="primary-button"
                                @click=${this._handleConfirmDuplicate}
                                ?disabled=${!isValid}
                        >
                            Duplicate
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private _renderExportDialog() {
        if (!this.exportSourceId) return null;
        const card = this.cards.find(c => c.id === this.exportSourceId);
        if (!card) return null;

        const isValid = this.exportFileName.trim().length > 0;
        const suggested = this.cardsManager.getDefaultExportFileName(card.name) ?? card.name;

        return html`
            <div class="dialog-overlay" @click=${this._handleCloseExport}>
                <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
                    <h2 class="dialog-header">Export Card</h2>
                    <div class="dialog-content">
                        <div class="form-field">
                            <label class="form-label">File Name *</label>
                            <input
                                    type="text"
                                    class="form-input"
                                    .value=${this.exportFileName}
                                    @input=${this._handleExportFileNameInput}
                                    placeholder="Enter file name"
                            />
                            <div class="form-hint">Default: ${suggested}.json</div>
                        </div>
                    </div>
                    <div class="dialog-actions">
                        <button class="secondary-button" @click=${this._handleCloseExport}>
                            Cancel
                        </button>
                        <button
                                class="primary-button"
                                @click=${this._handleConfirmExport}
                                ?disabled=${!isValid}
                        >
                            Export
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private async _loadCards(): Promise<void> {
        if (!this.cardsService) return;

        this.loading = true;
        this.error = null;

        try {
            this.cards = await this.cardsService.listCards();
            this._applyFilters();
        } catch (err) {
            console.error('Failed to load cards:', err);
            this.error = 'Failed to load cards. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    private async _subscribeToUpdates(): Promise<void> {
        if (!this.cardsService) return;

        try {
            this.unsubscribe = await this.cardsService.subscribeToUpdates(() => {
                this._loadCards();
            });
        } catch (err) {
            console.error('Failed to subscribe to updates:', err);
        }
    }

    private _applyFilters(): void {
        let filtered = [...this.cards];

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(card =>
                card.name.toLowerCase().includes(query) ||
                card.description.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;

            if (this.sortColumn === 'name') {
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
            } else {
                aVal = new Date(a.updated_at).getTime();
                bVal = new Date(b.updated_at).getTime();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.filteredCards = filtered;

        // Reset to page 1 if current page is out of range
        const totalPages = Math.ceil(this.filteredCards.length / this.pageSize);
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }
    }

    private _isMigrating(cardId: string): boolean {
        return this.migratingCardIds.has(cardId);
    }

    private async _handleMigrateCard(cardId: string): Promise<void> {
        if (!this.cardsService) return;

        const card = this.cards.find((item) => item.id === cardId);
        if (!card) return;

        const nextMigrating = new Set(this.migratingCardIds);
        nextMigrating.add(cardId);
        this.migratingCardIds = nextMigrating;
        this.error = null;

        try {
            const {config} = migrateDocumentData(card.config);
            await this.cardsService.updateCard(cardId, {config});
            await this._loadCards();
        } catch (err) {
            console.error('Failed to migrate card:', err);
            this.error = 'Failed to migrate card. Please try again.';
        } finally {
            const updatedMigrating = new Set(this.migratingCardIds);
            updatedMigrating.delete(cardId);
            this.migratingCardIds = updatedMigrating;
        }
    }

    private _handleSearchInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.searchQuery = input.value;

        // Debounce search
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = window.setTimeout(() => {
            this._applyFilters();
            this.currentPage = 1; // Reset to first page
        }, 300);
    }

    private _handleSort(column: 'name' | 'updated_at'): void {
        if (this.sortColumn === column) {
            // Toggle direction
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, default to desc
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }
        this._applyFilters();
    }

    private _handlePageSizeChange(e: Event): void {
        const select = e.target as HTMLSelectElement;
        this.pageSize = parseInt(select.value, 10);
        this.currentPage = 1;
        this._applyFilters();
    }

    private _goToPage(page: number): void {
        const totalPages = Math.ceil(this.filteredCards.length / this.pageSize);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
        }
    }

    private _formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    }

    private _handleCreateNew(): void {
        this.router.navigate(ROUTES.EDITOR_CREATE);
    }

    private _handleImportClick(): void {
        this.showImportDialog = true;
        this.importMethod = 'paste';
        this.importJsonText = '';
        this.importData = null;
        this.importError = null;
        this.importName = '';
        this.importDescription = '';
        this.isImporting = false;
    }

    private _handleCloseImport(): void {
        this.showImportDialog = false;
        this.importMethod = 'paste';
        this.importJsonText = '';
        this.importData = null;
        this.importError = null;
        this.importName = '';
        this.importDescription = '';
        this.isImporting = false;
    }

    private _handleImportMethodChange(method: 'paste' | 'file'): void {
        this.importMethod = method;
        this.importJsonText = '';
        this.importData = null;
        this.importError = null;
        this.importName = '';
        this.importDescription = '';
    }

    private _handleDuplicateClick(id: string): void {
        const card = this.cards.find(item => item.id === id);
        if (!card) return;
        this.duplicateSourceId = id;
        this.duplicateName = this.cardsManager.getDefaultDuplicateName(card.name) ?? `${card.name} (Copy)`;
    }

    private _handleCloseDuplicate(): void {
        this.duplicateSourceId = null;
        this.duplicateName = '';
    }

    private _handleDuplicateNameInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.duplicateName = input.value;
    }

    private async _handleConfirmDuplicate(): Promise<void> {
        if (!this.duplicateSourceId) {
            this.error = 'Cards manager not available. Please try again.';
            return;
        }
        const card = this.cards.find(item => item.id === this.duplicateSourceId);
        if (!card) return;

        const newName = this.duplicateName.trim();
        if (!newName) return;

        try {
            await this.cardsManager.duplicateCard(card, newName);

            this._handleCloseDuplicate();
            await this._loadCards();
        } catch (err) {
            console.error('Failed to duplicate card:', err);
            this.error = 'Failed to duplicate card. Please try again.';
        }
    }

    private _handleExportClick(id: string): void {
        const card = this.cards.find(item => item.id === id);
        if (!card) return;
        this.exportSourceId = id;
        this.exportFileName = this.cardsManager.getDefaultExportFileName(card.name) ?? card.name;
    }

    private _handleCloseExport(): void {
        this.exportSourceId = null;
        this.exportFileName = '';
    }

    private _handleExportFileNameInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.exportFileName = input.value;
    }

    private _handleJsonInput(e: Event): void {
        const textarea = e.target as HTMLTextAreaElement;
        this.importJsonText = textarea.value;
        this._validateJson(textarea.value);
    }

    private _handleFileClick(e: Event): void {
        const fileInput = (e.currentTarget as HTMLElement).parentElement?.querySelector('.file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    private _handleDragOver(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        target.classList.add('drag-over');
    }

    private _handleDragLeave(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('drag-over');
    }

    private _handleFileDrop(e: DragEvent): void {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('drag-over');

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            void this._readFile(files[0]);
        }
    }

    private _handleFileSelect(e: Event): void {
        const input = e.target as HTMLInputElement;
        const files = input.files;
        if (files && files.length > 0) {
            void this._readFile(files[0]);
        }
    }

    private async _readFile(file: File): Promise<void> {
        try {
            const content = await this.cardsManager.readJsonFile(file);
            this.importJsonText = content;
            this._validateJson(content);
        } catch (err) {
            this.importError = err instanceof Error ? err.message : 'Failed to read file';
            this.importData = null;
        }
    }

    private _validateJson(jsonText: string): void {
        const result = this.cardsManager.validateImportJson(jsonText);
        this.importError = result.error;
        this.importData = result.data;
        if (result.data && !result.error) {
            this.importName = result.name ?? '';
            this.importDescription = result.description ?? '';
        }
    }

    private _handleNameInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.importName = input.value;
    }

    private _handleDescriptionInput(e: Event): void {
        const textarea = e.target as HTMLTextAreaElement;
        this.importDescription = textarea.value;
    }

    private async _handleConfirmImport(): Promise<void> {
        if (!this.importData || !this.importName.trim()) {
            return;
        }

        this.isImporting = true;

        try {
            await this.cardsManager.importCard(
                this.importData,
                this.importName.trim(),
                this.importDescription.trim()
            );

            // Close dialog and reload cards
            this._handleCloseImport();
            await this._loadCards();

        } catch (err) {
            console.error('Failed to import card:', err);
            this.importError = `Failed to import card: ${err instanceof Error ? err.message : 'unknown error'}`;
        } finally {
            this.isImporting = false;
        }
    }

    private _handleConfirmExport(): void {
        if (!this.exportSourceId) {
            this.error = 'Cards manager not available. Please try again.';
            return;
        }
        const card = this.cards.find(item => item.id === this.exportSourceId);
        if (!card) return;

        this.cardsManager.exportCard(card, this.exportFileName);
        this._handleCloseExport();
    }

    private _handleEdit(id: string): void {
        this.router.navigate(ROUTES.EDITOR_EDIT, {id: id});
    }

    private _handleDeleteClick(id: string): void {
        this.deleteConfirmId = id;
    }

    private _cancelDelete(): void {
        this.deleteConfirmId = null;
    }

    private async _confirmDelete(): Promise<void> {
        if (!this.cardsService || !this.deleteConfirmId) return;

        try {
            await this.cardsService.deleteCard(this.deleteConfirmId);
            this.deleteConfirmId = null;
            // Reload cards list after deletion
            await this._loadCards();
        } catch (err) {
            console.error('Failed to delete card:', err);
            this.error = 'Failed to delete card. Please try again.';
            this.deleteConfirmId = null;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'cards-list-view': CardsListView;
    }
}
