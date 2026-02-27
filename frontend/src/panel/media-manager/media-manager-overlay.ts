import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { getMediaReferenceName, resolveMediaUrl } from '@/common/media/media-utils';
import { OverlayDialogBase } from '@/panel/common/ui/overlay-dialog-base';
import './media-manager';

interface MediaSelection {
    reference: string;
    url: string | null;
    name: string;
    contentType?: string;
}

@customElement('media-manager-overlay')
export class MediaManagerOverlay extends OverlayDialogBase {
    static styles = [
        ...OverlayDialogBase.styles,
        css`
            .dialog-body {
                padding: 0;
            }

            media-manager {
                flex: 1;
                height: 100%;
            }

            .selection-chip {
                padding: 6px 10px;
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 999px;
                font-size: 12px;
                color: var(--text-primary, #333);
                max-width: 260px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        `];

    @property({attribute: false})
    hass?: HomeAssistant;

    @property({type: String})
    mode: 'manage' | 'select' = 'manage';

    @property({type: String})
    title = 'Media Manager';

    @property({type: String})
    subtitle = 'Manage your media';

    @property({type: String})
    confirmLabel = 'Use selected media';

    @state() private selection: MediaSelection | null = null;

    protected get dialogTitle(): string {
        return this.title;
    }

    protected get dialogSubtitle(): string | null {
        return this.subtitle || null;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has('open') && !this.open) {
            this.selection = null;
        }
        if (changedProps.has('mode') && this.mode === 'manage') {
            this.selection = null;
        }
    }

    protected renderDialogBody(): TemplateResult {
        return html`
            <media-manager
                .hass=${this.hass}
                .selectionMode=${this.mode === 'select'}
                .selectedReference=${this.selection?.reference ?? null}
                @media-selected=${this._handleMediaSelected}
                @media-uploaded=${this._handleMediaUploaded}
            ></media-manager>
        `;
    }

    protected renderDialogFooter(): TemplateResult | typeof nothing {
        if (this.mode === 'select') {
            return html`
                <div class="dialog-footer">
                    <div class="selection-chip">
                        ${this.selection ? this.selection.name : 'No media selected'}
                    </div>
                    <div class="footer-spacer"></div>
                    <button class="secondary-btn" @click=${this.handleClose}>Cancel</button>
                    <button class="primary-btn" ?disabled=${!this.selection} @click=${this._confirmSelection}>
                        ${this.confirmLabel}
                    </button>
                </div>
            `;
        }

        return html`
            <div class="dialog-footer">
                <div class="footer-spacer"></div>
                <button class="secondary-btn" @click=${this.handleClose}>Close</button>
            </div>
        `;
    }

    private _handleMediaSelected = async (e: CustomEvent): Promise<void> => {
        const {reference, url, name, contentType} = e.detail || {};
        if (!reference) return;
        const resolvedUrl = url ?? await resolveMediaUrl(this.hass, reference);
        this.selection = {
            reference,
            url: resolvedUrl ?? null,
            name: name || getMediaReferenceName(reference) || reference,
            contentType
        };
    };

    private _handleMediaUploaded = async (e: CustomEvent): Promise<void> => {
        if (this.mode !== 'select') return;
        const detail = e.detail as { lastReference?: string } | undefined;
        if (!detail?.lastReference) return;
        const resolvedUrl = await resolveMediaUrl(this.hass, detail.lastReference);
        this.selection = {
            reference: detail.lastReference,
            url: resolvedUrl ?? null,
            name: getMediaReferenceName(detail.lastReference) || detail.lastReference
        };
    };

    private _confirmSelection(): void {
        if (!this.selection) return;
        this.dispatchEvent(new CustomEvent('media-confirm', {
            detail: this.selection,
            bubbles: true,
            composed: true
        }));
        this.handleClose();
    }

    protected onBeforeClose(): void {
        this.selection = null;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'media-manager-overlay': MediaManagerOverlay;
    }
}
