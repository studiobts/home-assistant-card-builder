import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { MediaService } from '@/common/api';
import type { MediaItem } from '@/common/media';
import {
    buildCardBuilderMediaReference,
    getCardBuilderRelativePath,
    isCardBuilderMediaReference,
    mediaContentIdToPublicUrl,
    resolveMediaUrl,
    CARD_BUILDER_LOCAL_ROOT
} from '@/common/media/media-utils';

interface UploadProgress {
    current: number;
    total: number;
}

@customElement('media-manager')
export class MediaManager extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
            color: var(--primary-text-color);
            background: var(--primary-background-color);
            font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
        }

        .media-manager {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            box-sizing: border-box;
            height: 100%;
        }

        .toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .toolbar .spacer {
            flex: 1;
        }

        .button {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.2px;
        }

        .button.primary {
            background: var(--primary-color);
            color: var(--text-primary-color, #fff);
            border-color: transparent;
        }

        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .search-input {
            flex: 1;
            min-width: 160px;
            padding: 8px 10px;
            border-radius: 6px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            font-size: 12px;
        }

        .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--secondary-text-color);
            flex-wrap: wrap;
        }

        .breadcrumbs button {
            border: none;
            background: none;
            color: var(--primary-color);
            cursor: pointer;
            padding: 0;
            font-size: 12px;
        }

        .breadcrumbs .separator {
            color: var(--secondary-text-color);
        }

        .drop-zone {
            border: 2px dashed var(--divider-color);
            border-radius: 10px;
            padding: 16px;
            text-align: center;
            background: var(--card-background-color);
            color: var(--secondary-text-color);
            transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .drop-zone.dragging {
            border-color: var(--primary-color);
            background: rgba(3, 169, 244, 0.08);
            color: var(--primary-text-color);
        }

        .upload-status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            color: var(--primary-text-color);
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid var(--primary-color);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .error-banner {
            padding: 10px 12px;
            border-radius: 8px;
            background: rgba(219, 68, 55, 0.12);
            border: 1px solid var(--error-color, #db4437);
            color: var(--error-color, #db4437);
            font-size: 12px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
            flex: 1;
            overflow: auto;
            padding-bottom: 4px;
            align-content: start;
            align-items: start;
            grid-auto-rows: max-content;
        }

        .content {
            flex: 1;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
        }

        .content.split {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .grid-panel,
        .preview-panel {
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .preview-panel {
            border: 1px solid var(--divider-color);
            border-radius: 12px;
            background: var(--card-background-color);
            padding: 12px;
            gap: 12px;
        }

        .preview-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--primary-text-color);
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .preview-frame {
            flex: 1;
            border-radius: 10px;
            border: 1px solid var(--divider-color);
            background: var(--secondary-background-color);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            min-height: 0;
        }

        .preview-frame img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .preview-meta {
            font-size: 12px;
            color: var(--secondary-text-color);
            word-break: break-all;
        }

        .item {
            background: var(--card-background-color);
            border: 2px solid var(--divider-color);
            border-radius: 6px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            position: relative;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .item:hover,
        .item.selected {
            border-color: var(--primary-color);
        }

        .item-actions {
            position: absolute;
            top: 6px;
            right: 6px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 1;
        }

        .item:hover .item-actions {
            opacity: 1;
        }

        .icon-button {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            --mdc-icon-size: 16px;
        }

        .icon-button:hover {
            border-color: var(--error-color, #db4437);
            color: var(--error-color, #db4437);
        }

        .thumbnail {
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 8px;
            background: var(--secondary-background-color);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .item-name {
            font-size: 12px;
            color: var(--primary-text-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .empty-state {
            font-size: 13px;
            color: var(--secondary-text-color);
            text-align: center;
            padding: 24px 0;
        }
    `;

    @property({ attribute: false })
    hass?: HomeAssistant;

    @property({ type: String })
    baseMediaId = CARD_BUILDER_LOCAL_ROOT;

    @property({ type: Boolean })
    selectionMode = false;

    @property({ type: String })
    selectedReference: string | null = null;

    @state() private currentMediaId = '';
    @state() private items: MediaItem[] = [];
    @state() private loading = false;
    @state() private uploading = false;
    @state() private uploadProgress: UploadProgress = { current: 0, total: 0 };
    @state() private searchQuery = '';
    @state() private errorMessage: string | null = null;
    @state() private dragActive = false;
    @state() private previewErrors = new Set<string>();
    @state() private selectedPreviewUrl: string | null = null;
    @state() private selectedPreviewName: string | null = null;
    @state() private selectedPreviewIsImage = false;
    @state() private selectedPreviewType: string | null = null;
    @query('input[type="file"]')
    private fileInput?: HTMLInputElement;

    private mediaService?: MediaService;
    private errorTimeoutId: number | null = null;
    private initialized = false;
    private initializing = false;

    protected updated(changedProps: PropertyValues): void {
        if (changedProps.has('hass') && this.hass) {
            this.mediaService = new MediaService(this.hass);
        }

        if (changedProps.has('baseMediaId')) {
            this.initialized = false;
        }

        if (changedProps.has('selectedReference') && !this.selectedReference) {
            this.updatePreview(null, null, false, null);
        }

        if ((changedProps.has('hass') || changedProps.has('baseMediaId')) && this.hass && !this.initialized && !this.initializing) {
            this.initializing = true;
            void this.initialize().finally(() => {
                this.initialized = true;
                this.initializing = false;
            });
        }
    }

    render() {
        if (!this.hass) {
            return html`<div class="media-manager"><div class="empty-state">Home Assistant not available.</div></div>`;
        }

        return html`
            <div class="media-manager">
                <div class="toolbar">
                    <button class="button primary" @click=${this.handleUploadClick} ?disabled=${this.uploading}>
                        <ha-icon icon="mdi:upload"></ha-icon>
                        Upload
                    </button>
                    <button class="button" @click=${this.refresh} ?disabled=${this.loading || this.uploading}>
                        <ha-icon icon="mdi:refresh"></ha-icon>
                        Refresh
                    </button>
                    <div class="spacer"></div>
                    <input
                        class="search-input"
                        type="search"
                        placeholder="Search..."
                        .value=${this.searchQuery}
                        @input=${this.handleSearchInput}
                    />
                </div>

                ${this.errorMessage
                    ? html`<div class="error-banner">${this.errorMessage}</div>`
                    : nothing}

                ${this.renderBreadcrumbs()}

                <div
                    class="drop-zone ${this.dragActive ? 'dragging' : ''}"
                    @dragenter=${this.handleDragEnter}
                    @dragover=${this.handleDragOver}
                    @dragleave=${this.handleDragLeave}
                    @drop=${this.handleDrop}
                >
                    Drag files here to upload or use the Upload button.
                </div>

                ${this.uploading
                    ? html`
                        <div class="upload-status">
                            <div class="spinner"></div>
                            <span>Uploading ${this.uploadProgress.current}/${this.uploadProgress.total}</span>
                        </div>
                    `
                    : nothing}

                <input
                    type="file"
                    multiple
                    hidden
                    @change=${this.handleFileInput}
                />

                <div class="content ${this.selectedReference ? 'split' : ''}">
                    <div class="grid-panel">
                        <div class="grid">
                            ${this.loading
                                ? html`<div class="empty-state">Loading...</div>`
                                : this.filteredItems.length === 0
                                    ? html`<div class="empty-state">No files found.</div>`
                                    : this.filteredItems.map((item) => this.renderItem(item))}
                        </div>
                    </div>
                    ${this.selectedReference ? html`
                        <div class="preview-panel">
                            <div class="preview-title">Selected media</div>
                            <div class="preview-frame">
                                ${this.selectedPreviewIsImage && this.selectedPreviewUrl
                                    ? html`<img src="${this.selectedPreviewUrl}" alt="${this.selectedPreviewName ?? ''}" />`
                                    : html`<ha-icon icon="mdi:image-off-outline"></ha-icon>`}
                            </div>
                            ${this.selectedPreviewName ? html`
                                <div class="preview-meta">${this.selectedPreviewName}</div>
                            ` : nothing}
                            ${this.selectedPreviewType ? html`
                                <div class="preview-meta">${this.selectedPreviewType}</div>
                            ` : nothing}
                        </div>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    private renderBreadcrumbs() {
        const crumbs = this.getBreadcrumbs();
        if (crumbs.length === 0) return nothing;

        return html`
            <div class="breadcrumbs">
                ${crumbs.map((crumb, index) => html`
                    <button @click=${() => this.navigateTo(crumb.mediaId)}>${crumb.label}</button>
                    ${index < crumbs.length - 1 ? html`<span class="separator">/</span>` : nothing}
                `)}
            </div>
        `;
    }

    private renderItem(item: MediaItem) {
        const isFolder = this.isFolder(item);
        const isImage = this.isImage(item);
        const previewUrl = this.getPreviewUrl(item);
        const isSelected = this.selectedReference === item.media_content_id;
        return html`
            <div class="item ${isSelected ? 'selected' : ''}" @click=${() => this.handleItemClick(item)}>
                ${!isFolder ? html`
                    <div class="item-actions" @click=${(e: Event) => e.stopPropagation()}>
                        <button class="icon-button" @click=${(e: Event) => this.handleDelete(e, item)}>
                            <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                        </button>
                    </div>
                ` : nothing}
                <div class="thumbnail">
                    ${previewUrl && isImage
                        ? html`<img src="${previewUrl}" @error=${() => this.handlePreviewError(item)} />`
                        : html`<ha-icon icon="${isFolder ? 'mdi:folder' : 'mdi:image-off-outline'}"></ha-icon>`}
                </div>
                <div class="item-name" title=${item.title}>${item.title}</div>
            </div>
        `;
    }

    private get filteredItems(): MediaItem[] {
        if (!this.searchQuery) return this.items;
        const query = this.searchQuery.toLowerCase();
        return this.items.filter((item) => item.title.toLowerCase().includes(query));
    }

    private async initialize(): Promise<void> {
        if (!this.mediaService) return;
        const base = this.baseMediaId || CARD_BUILDER_LOCAL_ROOT;
        this.currentMediaId = base;
        await this.loadCurrent();
    }

    private async loadCurrent(): Promise<void> {
        if (!this.mediaService) return;
        this.loading = true;
        this.errorMessage = null;

        try {
            const response = await this.mediaService.browse(this.currentMediaId || this.baseMediaId);
            const children = response.children || [];
            this.items = this.sortItems(children);
        } catch (err) {
            this.items = [];
            this.setError(this.getErrorMessage(err, 'Failed to load media.'));
        } finally {
            this.loading = false;
        }
    }

    private sortItems(items: MediaItem[]): MediaItem[] {
        return [...items].sort((a, b) => {
            const aFolder = this.isFolder(a);
            const bFolder = this.isFolder(b);
            if (aFolder !== bFolder) return aFolder ? -1 : 1;
            return a.title.localeCompare(b.title);
        });
    }


    private getBreadcrumbs(): Array<{ label: string; mediaId: string }> {
        const base = this.baseMediaId || CARD_BUILDER_LOCAL_ROOT;
        const current = this.currentMediaId || base;
        const relative = getCardBuilderRelativePath(current);
        const crumbs = [{ label: 'Card Builder', mediaId: base }];

        if (!relative) return crumbs;

        const parts = relative.split('/').filter(Boolean);
        let acc = '';
        for (const part of parts) {
            acc = acc ? `${acc}/${part}` : part;
            crumbs.push({ label: part, mediaId: buildCardBuilderMediaReference(acc) });
        }

        return crumbs;
    }

    private isFolder(item: MediaItem): boolean {
        return Boolean(item.can_expand) || item.media_class === 'directory' || item.media_content_type === 'directory';
    }

    private isImage(item: MediaItem): boolean {
        return item.media_content_type?.startsWith('image/') || item.media_class === 'image';
    }

    private getPreviewUrl(item: MediaItem): string | null {
        if (this.previewErrors.has(item.media_content_id)) return null;
        if (item.thumbnail) return item.thumbnail;
        if (this.isImage(item)) {
            return mediaContentIdToPublicUrl(item.media_content_id);
        }
        return null;
    }

    private handlePreviewError(item: MediaItem): void {
        this.previewErrors = new Set(this.previewErrors).add(item.media_content_id);
    }

    private async handleItemClick(item: MediaItem): Promise<void> {
        if (this.isFolder(item)) {
            this.clearSelection();
            this.navigateTo(item.media_content_id);
            return;
        }

        const reference = item.media_content_id;
        this.selectedReference = reference;
        const url = await resolveMediaUrl(this.hass, reference);
        const fallbackUrl = url ?? mediaContentIdToPublicUrl(reference);
        this.updatePreview(item.title, item.media_content_type, this.isImage(item), fallbackUrl);

        this.dispatchEvent(new CustomEvent('media-selected', {
            detail: {
                reference,
                url,
                name: item.title,
                contentType: item.media_content_type,
            },
            bubbles: true,
            composed: true,
        }));
    }

    private navigateTo(mediaId: string): void {
        this.clearSelection();
        this.currentMediaId = mediaId;
        void this.loadCurrent();
    }

    private handleUploadClick(): void {
        this.fileInput?.click();
    }

    private handleFileInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        void this.uploadFiles(Array.from(input.files));
        input.value = '';
    }

    private handleSearchInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.searchQuery = input.value;
    }

    private async uploadFiles(files: File[]): Promise<void> {
        if (!this.mediaService || files.length === 0) return;

        const targetFolder = this.currentMediaId || this.baseMediaId;
        if (!isCardBuilderMediaReference(targetFolder)) {
            this.setError('Upload is available only for Card Builder media.');
            return;
        }

        this.uploading = true;
        this.uploadProgress = { current: 0, total: files.length };
        const uploadedReferences: string[] = [];
        let lastUploaded: { reference: string; name: string; isImage: boolean; contentType: string | null } | null = null;

        try {
            for (const file of files) {
                this.uploadProgress = {
                    current: this.uploadProgress.current + 1,
                    total: this.uploadProgress.total,
                };
                const response = await this.mediaService.uploadFile(file, targetFolder);
                const fallbackPath = [
                    getCardBuilderRelativePath(targetFolder),
                    file.name,
                ].filter(Boolean).join('/');
                const reference = response?.reference || buildCardBuilderMediaReference(fallbackPath);
                uploadedReferences.push(reference);
                this.selectedReference = reference;
                lastUploaded = {
                    reference,
                    name: file.name,
                    isImage: file.type?.startsWith('image/') ?? false,
                    contentType: file.type || null,
                };
            }
            await this.loadCurrent();
            if (lastUploaded) {
                const previewUrl = mediaContentIdToPublicUrl(lastUploaded.reference);
                this.updatePreview(
                    lastUploaded.name,
                    lastUploaded.contentType,
                    lastUploaded.isImage,
                    previewUrl
                );
            }
            if (uploadedReferences.length > 0) {
                this.dispatchEvent(new CustomEvent('media-uploaded', {
                    detail: {
                        references: uploadedReferences,
                        lastReference: uploadedReferences[uploadedReferences.length - 1],
                    },
                    bubbles: true,
                    composed: true,
                }));
            }
        } catch (err) {
            this.setError(this.getErrorMessage(err, 'Upload failed.'));
        } finally {
            this.uploading = false;
        }
    }

    private async handleDelete(e: Event, item: MediaItem): Promise<void> {
        e.stopPropagation();
        if (!this.mediaService) return;
        if (this.isFolder(item)) return;

        const shouldDelete = window.confirm(`Delete "${item.title}"?`);
        if (!shouldDelete) return;

        try {
            await this.mediaService.deleteFile(item.media_content_id);
            await this.loadCurrent();
        } catch (err) {
            this.setError(this.getErrorMessage(err, 'Delete failed.'));
        }
    }

    private handleDragEnter(e: DragEvent): void {
        e.preventDefault();
        this.dragActive = true;
    }

    private handleDragOver(e: DragEvent): void {
        e.preventDefault();
        this.dragActive = true;
    }

    private handleDragLeave(e: DragEvent): void {
        if (e.target === e.currentTarget) {
            this.dragActive = false;
        }
    }

    private handleDrop(e: DragEvent): void {
        e.preventDefault();
        this.dragActive = false;

        const files = Array.from(e.dataTransfer?.files ?? []);
        if (files.length === 0) return;
        void this.uploadFiles(files);
    }

    private refresh(): void {
        this.clearSelection();
        void this.loadCurrent();
    }

    private updatePreview(
        name: string | null,
        contentType: string | null,
        isImage: boolean,
        url: string | null
    ): void {
        this.selectedPreviewName = name;
        this.selectedPreviewType = contentType;
        this.selectedPreviewIsImage = isImage;
        this.selectedPreviewUrl = url;
    }

    private clearSelection(): void {
        this.selectedReference = null;
        this.updatePreview(null, null, false, null);
    }

    private setError(message: string): void {
        this.errorMessage = message;
        if (this.errorTimeoutId !== null) {
            window.clearTimeout(this.errorTimeoutId);
        }
        this.errorTimeoutId = window.setTimeout(() => {
            this.errorMessage = null;
            this.errorTimeoutId = null;
        }, 5000);
    }

    private getErrorMessage(err: unknown, fallback: string): string {
        if (!err) return fallback;
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message || fallback;
        if (typeof err === 'object') {
            const anyErr = err as Record<string, any>;
            return anyErr.message || anyErr.error || anyErr?.body?.message || fallback;
        }
        return fallback;
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'media-manager': MediaManager;
    }
}
