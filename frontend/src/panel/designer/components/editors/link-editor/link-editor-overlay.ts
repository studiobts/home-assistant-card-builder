import type { BlockData } from '@/common/core/model';
import { DocumentModel, documentModelContext } from '@/common/core/model';
import type { LinkEditorSelection, LinkModeState } from '@/common/core/model/types';
import type { LinkAnchorPoint, LinkCurvePreset, LinkPoint, LinkSegment, LinkSegmentType } from '@/common/blocks/components/advanced/block-link/link-types';
import { ensureSegments } from '@/common/blocks/components/advanced/block-link/link-utils';
import type { BlockRegistry } from '@/common/blocks/core/registry/block-registry';
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import type { EventBus } from '@/common/core/event-bus';
import { eventBusContext } from '@/common/core/event-bus';
import type { LinkEditorPreferences } from '@/panel/designer/components/editors/link-editor/link-editor-preferences';
import { linkEditorPreferencesContext } from '@/panel/designer/components/editors/link-editor/link-editor-preferences';
import { consume } from '@lit/context';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '../property-editor-overlay';
import '@/panel/common/ui/style-property-editors/toggle-input';
import '@/panel/common/ui/style-property-editors/slider-input';
import '@/panel/common/ui/style-property-editors/select-input';
import '@/panel/common/ui/style-property-editors/number-input';
import '@/panel/common/ui/style-property-editors/color-input';
import type { LinkModeController } from '@/panel/designer/components/editors/link-editor/link-mode-controller';

const ANCHOR_OPTIONS: Array<{ value: LinkAnchorPoint; label: string }> = [
    {value: 'top-left', label: 'Top Left'},
    {value: 'top-center', label: 'Top Center'},
    {value: 'top-right', label: 'Top Right'},
    {value: 'middle-left', label: 'Middle Left'},
    {value: 'middle-center', label: 'Center'},
    {value: 'middle-right', label: 'Middle Right'},
    {value: 'bottom-left', label: 'Bottom Left'},
    {value: 'bottom-center', label: 'Bottom Center'},
    {value: 'bottom-right', label: 'Bottom Right'},
];

@customElement('link-editor-overlay')
export class LinkEditorOverlay extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }

        .section {
            padding: 12px 8px;
            border-bottom: 1px solid var(--border-color, #d4d4d4);
        }

        .section-title {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary, #666);
            letter-spacing: 0.3px;
            margin-bottom: 10px;
        }

        .row > .section-title {
            margin-bottom: 0;
            margin-top: 10px;
        }

        .mode-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .mode-badge {
            align-self: flex-start;
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            background: var(--bg-tertiary, #e8e8e8);
            color: var(--text-secondary, #666);
        }

        .mode-badge.active {
            background: rgba(0, 120, 212, 0.12);
            color: var(--accent-color, #0078d4);
        }

        .mode-actions {
            display: flex;
            gap: 8px;
        }

        .action-button {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
        }

        .action-button.primary {
            background: var(--accent-color, #0078d4);
            border-color: var(--accent-color, #0078d4);
            color: #fff;
        }

        .action-button.active {
            background: rgba(255, 193, 7, 0.15);
            border-color: #ffc107;
            color: #946200;
        }

        .hint {
            font-size: 11px;
            color: var(--text-secondary, #666);
        }

        .list {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 10px;
        }

        .list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid transparent;
            background: var(--bg-secondary, #f5f5f5);
            cursor: pointer;
            font-size: 11px;
        }

        .list-item.selected {
            border-color: var(--accent-color, #0078d4);
            background: rgba(0, 120, 212, 0.08);
            color: var(--accent-color, #0078d4);
        }

        .list-meta {
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        .inline-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 8px;
        }

        .row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 8px;
        }

        .anchor-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }

        .anchor-chip {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 999px;
            background: rgba(255, 193, 7, 0.2);
            color: #8a6d00;
            font-weight: 600;
        }

        .empty {
            font-size: 11px;
            color: var(--text-secondary, #666);
            font-style: italic;
        }
    `;

    @property({type: Boolean, reflect: true})
    open = false;

    @property({type: Object})
    block!: BlockData;

    @property({attribute: false})
    controller!: LinkModeController;

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;

    @consume({context: eventBusContext})
    eventBus!: EventBus;

    @consume({context: linkEditorPreferencesContext, subscribe: true})
    linkEditorPreferences!: LinkEditorPreferences;

    @state() private linkModeState: LinkModeState | null = null;
    @state() private selection: LinkEditorSelection | null = null;
    @state() private gridColor: string = '#000000';

    connectedCallback(): void {
        super.connectedCallback();
        this.linkModeState = this.documentModel.getLinkModeState();
        this.selection = this.documentModel.getLinkEditorSelection();
        this.gridColor = this.documentModel.getLinkGridColor();

        this.documentModel.addEventListener('link-mode-changed', this._handleLinkModeChanged);
        this.documentModel.addEventListener('link-editor-selection-changed', this._handleSelectionChanged);
        this.documentModel.addEventListener('link-grid-color-changed', this._handleGridColorChanged);
    }

    disconnectedCallback(): void {
        this.documentModel.removeEventListener('link-mode-changed', this._handleLinkModeChanged as EventListener);
        this.documentModel.removeEventListener('link-editor-selection-changed', this._handleSelectionChanged as EventListener);
        this.documentModel.removeEventListener('link-grid-color-changed', this._handleGridColorChanged as EventListener);
        super.disconnectedCallback();
    }

    render() {
        if (!this.block) return html``;

        const points = this._getPoints();
        const segments = ensureSegments(points, this._getSegments());
        const selectedPoint = points.find((point) => point.id === this.selection?.pointId) ?? null;
        const selectedSegmentIndex = this.selection?.segmentIndex ?? null;

        const smoothingEnabled = Boolean(this._getPropValue('smoothingEnabled', false));
        const smoothingTension = Number(this._getPropValue('smoothingTension', 0.15));
        const showGrid = Boolean(this.linkEditorPreferences?.showGrid);
        const snapToGrid = Boolean(this.linkEditorPreferences?.snapToGrid);
        const snapToPoints = Boolean(this.linkEditorPreferences?.snapToPoints);
        const snapToBlocks = Boolean(this.linkEditorPreferences?.snapToBlocks);
        const showEditorPoints = Boolean(this.linkEditorPreferences?.showPoints);
        const gridColor = this.gridColor;
        const mode = this.linkModeState?.mode ?? 'idle';
        const modeLabel = mode === 'draw' ? 'Drawing' : mode === 'pick-anchor' ? 'Pick Anchor' : 'Editing';

        return html`
            <property-editor-overlay
                .open=${this.open}
                title="Link Editor"
                .subtitle=${this.block.label || this.block.id}
                @overlay-close=${this._handleClose}
            >
                <div class="section">
                    <div class="section-title">Mode</div>
                    <div class="mode-row">
                        <span class="mode-badge ${mode !== 'idle' ? 'active' : ''}">${modeLabel}</span>
                        ${mode === 'draw'
                            ? html`
                                <div class="mode-actions">
                                    <button class="action-button primary" @click=${this.controller.finishDrawing}>Finish Path</button>
                                </div>
                                <div class="hint">Click to add points. Right click or use Finish Path to complete.</div>
                              `
                            : nothing}
                        ${mode === 'pick-anchor'
                            ? html`<div class="hint">Click a block on the canvas to anchor the selected point.</div>`
                            : nothing}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Points</div>
                    ${points.length === 0
                        ? html`<div class="empty">No points yet. Activate draw mode to add points.</div>`
                        : html`
                            <div class="list">
                                ${points.map((point, index) => {
                                    const anchorBlock = point.anchor?.blockId ? this.documentModel.getBlock(point.anchor.blockId) : null;
                                    const anchorLabel = this._getBlockDisplayLabel(anchorBlock);
                                    return html`
                                        <div
                                            class="list-item ${this.selection?.pointId === point.id ? 'selected' : ''}"
                                            @click=${() => this.controller.selectPoint(this.block.id, point.id)}
                                        >
                                            <span>P${index + 1}</span>
                                            <span class="list-meta">
                                                ${anchorLabel ? html`<span class="anchor-chip">Anchor: ${anchorLabel}</span>` : nothing}
                                                ${point.x.toFixed(1)}, ${point.y.toFixed(1)}
                                            </span>
                                        </div>
                                    `;
                                })}
                            </div>
                          `}

                    ${selectedPoint ? this._renderPointEditor(selectedPoint, points) : nothing}
                </div>

                <div class="section">
                    <div class="section-title">Segments</div>
                    ${segments.length === 0
                        ? html`<div class="empty">Add at least two points to edit segments.</div>`
                        : html`
                            <div class="list">
                                ${segments.map((segment, index) => html`
                                    <div
                                        class="list-item ${selectedSegmentIndex === index ? 'selected' : ''}"
                                        @click=${() => this.controller.selectSegment(this.block.id, index)}
                                    >
                                        <span>S${index + 1}</span>
                                        <span class="list-meta">${segment.type}</span>
                                    </div>
                                `)}
                            </div>
                            ${selectedSegmentIndex !== null ? this._renderSegmentEditor(selectedSegmentIndex, segments[selectedSegmentIndex]) : nothing}
                          `}
                </div>

                <div class="section">
                    <div class="section-title">Smoothing</div>
                    <sm-toggle-input
                        label="Smoothing"
                        .value=${smoothingEnabled}
                        @change=${(e: CustomEvent) => this.controller.updateProp(this.block.id, 'smoothingEnabled', e.detail.value)}
                    ></sm-toggle-input>
                    ${smoothingEnabled ? html`
                        <div class="row">
                            <sm-slider-input
                                label="Tension"
                                .value=${smoothingTension}
                                .min=${0}
                                .max=${1}
                                .step=${0.05}
                                @change=${(e: CustomEvent) => this.controller.updateProp(this.block.id,'smoothingTension', e.detail.value)}
                            ></sm-slider-input>
                        </div>
                    ` : nothing}
                </div>

                <div class="section">
                    <div class="section-title">Grid & Snap</div>
                    <div class="row">
                        <sm-toggle-input
                            label="Show Points"
                            .value=${showEditorPoints}
                            @change=${(e: CustomEvent) => this._updatePreferences({showPoints: e.detail.value})}
                        ></sm-toggle-input>
                        <sm-toggle-input
                            label="Show Grid"
                            .value=${showGrid}
                            @change=${(e: CustomEvent) => this._updatePreferences({showGrid: e.detail.value})}
                        ></sm-toggle-input>
                        ${showGrid ? html`
                            <sm-color-input
                                label="Grid Color"
                                .value=${gridColor}
                                @change=${(e: CustomEvent) => this.documentModel.setLinkGridColor(e.detail.value)}
                            ></sm-color-input>
                        ` : nothing}
                        ${showGrid ? html`
                            <sm-toggle-input
                                label="Snap to Grid"
                                .value=${snapToGrid}
                                @change=${(e: CustomEvent) => this._updatePreferences({snapToGrid: e.detail.value})}
                            ></sm-toggle-input>
                        ` : nothing}
                        <sm-toggle-input
                            label="Snap to Points"
                            .value=${snapToPoints}
                            @change=${(e: CustomEvent) => this._updatePreferences({snapToPoints: e.detail.value})}
                        ></sm-toggle-input>
                        <sm-toggle-input
                            label="Snap to Blocks"
                            .value=${snapToBlocks}
                            @change=${(e: CustomEvent) => this._updatePreferences({snapToBlocks: e.detail.value})}
                        ></sm-toggle-input>
                    </div>
                </div>
            </property-editor-overlay>
        `;
    }

    private _renderPointEditor(point: LinkPoint, points: LinkPoint[]) {
        const anchorActive = Boolean(point.anchor?.blockId);
        const isPicking = this.linkModeState?.mode === 'pick-anchor' && this.linkModeState?.anchorPickPointId === point.id;
        const anchorEnabled = anchorActive || isPicking;
        const anchorPoint = point.anchor?.anchor || 'middle-center';

        return html`
            <div class="row">
                <div class="section-title">Selected Point</div>
                <div class="inline-grid">
                    <sm-number-input
                        label="X"
                        .value=${Number(point.x.toFixed(2))}
                        .min=${0}
                        .max=${100}
                        .step=${0.1}
                        unit="%"
                        @change=${(e: CustomEvent) => this.controller.updatePointCoordinate(this.block.id, point.id, 'x', e.detail.value)}
                    ></sm-number-input>
                    <sm-number-input
                        label="Y"
                        .value=${Number(point.y.toFixed(2))}
                        .min=${0}
                        .max=${100}
                        .step=${0.1}
                        unit="%"
                        @change=${(e: CustomEvent) => this.controller.updatePointCoordinate(this.block.id, point.id, 'y', e.detail.value)}
                    ></sm-number-input>
                </div>

                <sm-toggle-input
                    label="Anchor To Block"
                    .value=${anchorEnabled}
                    @change=${(e: CustomEvent) => this.controller.toggleAnchor(this.block.id, point.id, e.detail.value)}
                ></sm-toggle-input>

                ${anchorEnabled ? html`
                    <div class="row">
                        <div class="anchor-actions">
                            <button class="action-button ${isPicking ? 'active' : ''}" @click=${() => this.controller.enterAnchorPick(this.block.id, point.id)}>
                                ${anchorActive ? 'Change Block' : 'Pick Block'}
                            </button>
                        </div>
                        <sm-select-input
                            label="Anchor Point"
                            .value=${anchorPoint}
                            .options=${ANCHOR_OPTIONS}
                            @change=${(e: CustomEvent) => this.controller.updateAnchorPoint(this.block.id, point.id, e.detail.value)}
                        ></sm-select-input>
                        ${anchorActive ? html`
                            <div class="inline-grid">
                                <sm-number-input
                                    label="Offset X"
                                    .value=${Number(point.anchor?.offset?.x.toFixed(2) ?? 0)}
                                    .min=${-100}
                                    .max=${100}
                                    .step=${0.1}
                                    unit="%"
                                    @change=${(e: CustomEvent) => this.controller.updateAnchorOffset(this.block.id, point.id, 'x', e.detail.value)}
                                ></sm-number-input>
                                <sm-number-input
                                    label="Offset Y"
                                    .value=${Number(point.anchor?.offset?.y.toFixed(2) ?? 0)}
                                    .min=${-100}
                                    .max=${100}
                                    .step=${0.1}
                                    unit="%"
                                    @change=${(e: CustomEvent) => this.controller.updateAnchorOffset(this.block.id, point.id, 'y', e.detail.value)}
                                ></sm-number-input>
                            </div>
                        ` : nothing}
                    </div>
                ` : nothing}

                ${points.length > 2 ? html`
                    <div class="mode-actions">
                        <button class="action-button" @click=${() => this.controller.deletePoint(this.block.id, point.id)}>Delete Point</button>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _renderSegmentEditor(index: number, segment: LinkSegment) {
        const type = segment.type || 'line';
        const curvePreset = (segment.curvePreset ?? 'manual') as LinkCurvePreset;
        const curveBulge = typeof segment.curveBulge === 'number' ? segment.curveBulge : 0.25;
        const curveAutoUpdate = Boolean(segment.curveAutoUpdate ?? false);
        return html`
            <div class="row">
                <div class="section-title">Selected Segment</div>
                <sm-select-input
                    label="Type"
                    .value=${type}
                    .options=${[
                        {value: 'line', label: 'Line'},
                        {value: 'curve', label: 'Curve'},
                    ]}
                    @change=${(e: CustomEvent) => this.controller.setSegmentType(this.block.id, index, e.detail.value as LinkSegmentType)}
                ></sm-select-input>
                ${type === 'curve' ? html`
                    <sm-select-input
                        label="Curve Preset"
                        .value=${curvePreset}
                        .options=${[
                            {value: 'smooth', label: 'Smooth (No tension)'},
                            {value: 'arc', label: 'Arc (Bulge)'},
                            {value: 'symmetric', label: 'Symmetric'},
                            {value: 'manual', label: 'Manual'},
                        ]}
                        @change=${(e: CustomEvent) => this.controller.setSegmentCurvePreset(this.block.id, index, e.detail.value as LinkCurvePreset)}
                    ></sm-select-input>
                    ${curvePreset === 'arc' || curvePreset === 'symmetric' ? html`
                        <sm-slider-input
                            label="Bulge"
                            .value=${curveBulge}
                            .min=${-1}
                            .max=${1}
                            .step=${0.05}
                            @change=${(e: CustomEvent) => this.controller.setSegmentCurveBulge(this.block.id, index, e.detail.value)}
                        ></sm-slider-input>
                    ` : nothing}
                    <sm-toggle-input
                        label="Update on Move"
                        .value=${curveAutoUpdate}
                        @change=${(e: CustomEvent) => this.controller.setSegmentCurveAutoUpdate(this.block.id, index, e.detail.value)}
                    ></sm-toggle-input>
                    <div class="hint">Handles remain editable for full control.</div>
                ` : html`<div class="hint">Curve segments expose handles on the canvas.</div>`}
            </div>
        `;
    }

    private _handleLinkModeChanged = (e: Event) => {
        const detail = (e as CustomEvent<{ state: LinkModeState }>).detail;
        this.linkModeState = detail?.state ?? null;
    }

    private _handleSelectionChanged = (e: Event) => {
        const detail = (e as CustomEvent<{ selection: LinkEditorSelection }>).detail;
        this.selection = detail?.selection ?? null;
    }

    private _handleGridColorChanged = (e: Event) => {
        const detail = (e as CustomEvent<{ color?: string }>).detail;
        this.gridColor = detail?.color || '#000000';
    }

    private _handleClose = () => {
        this.dispatchEvent(new CustomEvent('overlay-close', {bubbles: true, composed: true}));
    }

    private _updatePreferences(next: Partial<LinkEditorPreferences>): void {
        this.eventBus.dispatchEvent('link-editor-preferences-changed', {preferences: next});
    }

    private _getPoints(): LinkPoint[] {
        const raw = this.block?.props?.points;
        return Array.isArray(raw) ? (raw as LinkPoint[]) : [];
    }

    private _getSegments(): LinkSegment[] {
        const raw = this.block?.props?.segments;
        return Array.isArray(raw) ? (raw as LinkSegment[]) : [];
    }

    private _getBlockDisplayLabel(block: BlockData | null | undefined): string | null {
        if (!block) return null;
        if (block.label && block.label.trim()) return block.label.trim();
        const definition = this.blockRegistry?.getBlock(block.type);
        return definition?.label ?? block.type;
    }

    private _getPropValue<T>(prop: string, fallback: T): T {
        const value = this.block?.props?.[prop];
        if (value && typeof value === 'object' && 'value' in (value as { value?: T })) {
            return (value as { value?: T }).value ?? fallback;
        }
        return fallback;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'link-editor-overlay': LinkEditorOverlay;
    }
}
