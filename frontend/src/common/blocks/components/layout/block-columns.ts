import { BlockBase } from '@/common/blocks/components/block-base';
import {
    DEFAULT_STYLE_CONFIG as DROP_ZONE_DEFAULTSTYLE_CONFIG,
    type DropZoneStyleProvider
} from "@/common/blocks/components/layout/block-drop-zone";
import { BlockLayout } from "@/common/blocks/components/layout/block-layout";
import { type BlockRegistration, type BlockRegistry } from '@/common/blocks/core/registry/block-registry';
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import type { BlockStyleConfig } from '@/common/blocks/style';
import type { BlockPanelConfig } from '@/common/blocks/types';
import type { BlockData } from "@/common/core/model/types";
import { type ResolvedStyleData, resolvedToCSSProperties } from '@/common/core/style-resolver';
import type { ContainerStyleData } from '@/common/types/style-preset';
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { consume } from "@lit/context";
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from 'lit/directives/style-map.js';

const DEFAULT_COLUMNS = 2;
const DEFAULT_GAP = 0;
const MIN_COLUMNS = 2
const MAX_COLUMNS = 12;

@customElement('block-columns')
export class BlockColumns extends BlockLayout implements DropZoneStyleProvider {
    static styles = [
        ...BlockBase.styles,
        css`
            .content {
                display: flex;
                flex-direction: row;
                gap: var(--columns-gap, 0);
                position: relative;
                height: 100%;
            }

            .column-slot {
                display: flex;
                flex-direction: column;
                min-width: 0;
                position: relative;
            }

            .column-resize-handle {
                position: absolute;
                top: 0;
                right: calc(min(var(--columns-gap, 0px), 5px) / -2);
                width: 10px;
                height: 100%;
                cursor: col-resize;
                touch-action: none;
                z-index: 200;
            }

            .column-resize-handle::before {
                content: '';
                position: absolute;
                left: 100%;
                top: 0;
                width: 2px;
                height: 100%;
                background: var(--accent-color, #ddd);
                opacity: 0;
                transform: translateX(-50%);
            }

            .column-resize-handle:hover::before,
            .column-resize-handle.active::before {
                opacity: 1;
            }

            .column-resize-overlay {
                position: absolute;
                top: 0;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.08);
                pointer-events: none;
                z-index: 250;
            }

            .column-resize-overlay__label {
                padding: 6px 10px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.08);
                font-size: 12px;
                font-weight: 600;
                color: var(--primary-text-color, #111);
            }

            :host(.block-selected) .content {
                box-shadow: 0 0 1px 1px var(--border-color, #ddd);
            }
        `
    ];

    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;

    private _resizeState: {
        index: number;
        startX: number;
        containerWidth: number;
        startLeft: number;
        startRight: number;
        totalPair: number;
        leftId: string;
        rightId: string;
        currentLeft: number;
        currentRight: number;
    } | null = null;

    private _resizeHandleIndex: number | null = null;

    public get isBlockContainer() {
        return true;
    }

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Columns',
                icon: '<ha-icon icon="mdi:view-column-outline"></ha-icon>',
                category: 'layout'
            },
            defaults: {
                props: {
                    columns: {value: DEFAULT_COLUMNS},
                    gap: {value: DEFAULT_GAP}
                }
            },
            entityDefaults: {
                mode: 'inherited'
            }
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [{
                    id: 'layout',
                    label: 'Layout',
                    traits: [{
                        type: 'number',
                        name: 'columns',
                        label: 'Columns',
                        min: MIN_COLUMNS,
                        max: MAX_COLUMNS
                    }, {
                        type: 'number',
                        name: 'gap',
                        label: 'Gap',
                        min: 0,
                        max: 100
                    }]
                }]
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'layout',
                        exclude: {properties: ['flex.flexDirection']},
                    },
                },
            },
        };
    }

    public getDropZoneStyleConfig(): BlockStyleConfig | undefined {
        return {
            ...DROP_ZONE_DEFAULTSTYLE_CONFIG,
            ...{
                properties: ['size.width', 'spacing.padding']
            }
        };
    }

    public getDropZoneResolvedStyleData(dropZone: BlockData): ResolvedStyleData {
        const resolvedEntity = this.documentModel.resolveEntityForBlock(dropZone.id);
        const defaultEntityId = resolvedEntity.entityId;
        const bindingContext = {defaultEntityId};
        const resolved = this.renderer.resolveBlockStyles(dropZone, this.activeContainerId, bindingContext);

        // Remove size
        const {size, ...others} = resolved ?? {};
        // Forward all other resolved styles to drop-zone block
        return others;
    }

    /**
     * Ensure drop-zones exist when columns are initialized or updated
     */
    updated(changedProps: Map<string, unknown>) {
        super.updated(changedProps);

        // Create/update drop-zones when block is assigned or columns prop changes
        if (changedProps.has('block') && this.block) {
            const oldBlock = changedProps.get('block') as any;
            const newColumns = this.resolvePropertyAsNumber('columns', DEFAULT_COLUMNS);
            const oldColumns = this.resolveRawValueAsNumber(oldBlock?.props?.columns, 0);

            // Always ensure zones on first block assignment, or when columns count changes
            if (!oldBlock || oldColumns !== newColumns) {
                this._ensureDropZones();
                const dropZones = this._getDropZones();

                // If columns count changes, reset drop-zone widths
                if (oldBlock && oldColumns !== newColumns) {
                    this._resetDropZoneWidths(dropZones, newColumns);
                }
            }

            this._updateDropZones();
        }
    }

    render() {
        const gap = this.resolvePropertyAsNumber('gap', DEFAULT_GAP);

        // this._ensureDropZones();

        // Get drop-zone blocks only
        const dropZones: BlockData[] = (this.block?.children || []).map(child => this.documentModel.getBlock(child as string)).filter((block): block is BlockData => !!block);
        const contentStyles = resolvedToCSSProperties(this.resolvedRenderContext.resolved, {
            filter: {only: {categories: [
                'flex'
            ]}},
            append: {
                "--columns-gap": `${gap}px`
            }
        });
        const allEmpty = dropZones.length === 0 || !dropZones.every(zone => zone.children?.length);

        const fallbackWidth = dropZones.length > 0 ? 100 / dropZones.length : 0;
        const resizeOverlay = this._resizeState && this._resizeState.index < dropZones.length - 1
            ? (() => {
                const widths = dropZones.map((zone) => this._getDropZoneWidthPercent(zone, fallbackWidth));
                const beforeWidth = widths.slice(0, this._resizeState!.index).reduce((sum, width) => sum + width, 0);
                const leftLabel = `${this._formatPercent(this._resizeState!.currentLeft)}%`;
                const rightLabel = `${this._formatPercent(this._resizeState!.currentRight)}%`;

                return html`
                    <div
                            class="column-resize-overlay"
                            style=${styleMap({
                                left: `${beforeWidth}%`,
                                width: `${this._resizeState!.currentLeft}%`
                            })}
                    >
                        <div class="column-resize-overlay__label">${leftLabel}</div>
                    </div>
                    <div
                            class="column-resize-overlay"
                            style=${styleMap({
                                left: `${beforeWidth + this._resizeState!.currentLeft}%`,
                                width: `${this._resizeState!.currentRight}%`
                            })}
                    >
                        <div class="column-resize-overlay__label">${rightLabel}</div>
                    </div>
                `;
            })()
            : null;

        return html`
            <div class="content ${allEmpty ? 'empty-state' : ''}" style="${styleMap(contentStyles)}">
                ${repeat(dropZones, (dropZone) => dropZone.id, (dropZone, index) => {
                    const resolvedEntity = this.documentModel.resolveEntityForBlock(dropZone.id);
                    const resolved = this.renderer.resolveBlockStyles(dropZone, this.activeContainerId, {defaultEntityId: resolvedEntity.entityId});

                    const {size} = resolved ?? {};
                    // Extract size from resolved styles, since must be applied to the column and not directly to drop-zone block
                    const resolvedColumn: Pick<ResolvedStyleData, 'size'> = {size};

                    const styleColumn: Record<string, string> = resolvedToCSSProperties(resolvedColumn ?? {});
                    const showResizeHandle = index < dropZones.length - 1;
                    const handleActive = this._resizeHandleIndex === index;

                    return html`
                        <div class="column-slot" style=${styleMap(styleColumn)}>
                            ${showResizeHandle ? html`
                                <div
                                    class="column-resize-handle ${handleActive ? 'active' : ''}"
                                    @pointerdown=${(e: PointerEvent) => this._handleResizeStart(e, index)}
                                ></div>
                            ` : null}
                            ${this.renderer!.renderBlock(dropZone)}
                        </div>
                    `;
                })}
                ${resizeOverlay}
            </div>
        `;
    }

    public getBlockedDropInstructions(): Instruction['operation'][] | null {
        // External blocks not allowed inside columns
        return ['combine'];
    }

    private _getConfiguredContainerIds(dropZones: BlockData[]): string[] {
        const containerIds = new Set<string>();

        containerIds.add(this.containerManager.getDefaultContainerId());

        for (const zone of dropZones) {
            const containerStyles = zone.styles?.block?.containers;
            if (!containerStyles) continue;
            for (const containerId of Object.keys(containerStyles)) {
                containerIds.add(containerId);
            }
        }

        return Array.from(containerIds);
    }

    private _resetDropZoneWidths(dropZones: BlockData[], columns: number): void {
        const width = columns > 0 ? 100 / columns : 0;
        const containerIds = this._getConfiguredContainerIds(dropZones);

        for (const zone of dropZones) {
            const containerStylesUpdate: Record<string, ContainerStyleData> = {};

            for (const containerId of containerIds) {
                const currentContainerStyles: ContainerStyleData = {...(zone.styles?.block?.containers?.[containerId] || {})};
                const size = {...(currentContainerStyles.size || {})};

                size.width = {value: this._roundPercent(width), unit: '%'};
                currentContainerStyles.size = size;
                containerStylesUpdate[containerId] = currentContainerStyles;
            }

            const styles = {...(zone.styles || {})};
            const currentTarget = {...(styles.block || {})};
            currentTarget.containers = containerStylesUpdate;
            styles.block = currentTarget;
            this.documentModel.updateBlock(zone.id, {styles});
        }
    }

    private _roundPercent(value: number): number {
        return Math.round(value * 1000) / 1000;
    }

    private _formatPercent(value: number): string {
        return value.toFixed(1);
    }

    private _getDropZoneWidthPercent(zone: BlockData, fallback: number): number {
        const resolvedEntity = this.documentModel.resolveEntityForBlock(zone.id);
        const resolved = this.renderer.resolveBlockStyles(zone, this.activeContainerId, {defaultEntityId: resolvedEntity.entityId});
        const width = resolved.size?.width;

        if (width) {
            if (width.unit === '%' && typeof width.value === 'number') {
                return width.value;
            }
            if (typeof width.value === 'string' && width.value.endsWith('%')) {
                const parsed = parseFloat(width.value);
                if (!Number.isNaN(parsed)) {
                    return parsed;
                }
            }
        }

        return fallback;
    }

    private _setDropZoneWidthsPercent(updates: Array<{ zoneId: string; width: number }>): void {
        const containerId = this.activeContainerId;

        for (const update of updates) {
            const zone = this.documentModel.getBlock(update.zoneId);
            if (!zone) continue;

            const currentContainerStyles: ContainerStyleData = {...(zone.styles?.block?.containers?.[containerId] || {})};
            const size = {...(currentContainerStyles.size || {})};

            size.width = {value: this._roundPercent(update.width), unit: '%'};
            currentContainerStyles.size = size;

            const styles = {...(zone.styles || {})};
            const currentTarget = {...(styles.block || {})};
            const containerStyles = {...(currentTarget.containers || {})};
            containerStyles[containerId] = currentContainerStyles;
            currentTarget.containers = containerStyles;
            styles.block = currentTarget;
            this.documentModel.updateBlock(zone.id, {styles});
        }
    }

    private _handleResizeStart(e: PointerEvent, index: number): void {
        if (!this.block) return;

        const content = this.renderRoot?.querySelector('.content') as HTMLElement | null;
        if (!content) return;

        const rect = content.getBoundingClientRect();
        if (rect.width <= 0) return;

        e.preventDefault();
        e.stopPropagation();

        const dropZones = this._getDropZones();
        if (index < 0 || index >= dropZones.length - 1) return;

        const fallback = dropZones.length > 0 ? 100 / dropZones.length : 0;
        const leftZone = dropZones[index];
        const rightZone = dropZones[index + 1];
        const startLeft = this._getDropZoneWidthPercent(leftZone, fallback);
        const startRight = this._getDropZoneWidthPercent(rightZone, fallback);

        this._resizeState = {
            index,
            startX: e.clientX,
            containerWidth: rect.width,
            startLeft,
            startRight,
            totalPair: startLeft + startRight,
            leftId: leftZone.id,
            rightId: rightZone.id,
            currentLeft: startLeft,
            currentRight: startRight
        };
        this._resizeHandleIndex = index;
        this.requestUpdate();

        const target = e.currentTarget as HTMLElement | null;
        if (target?.setPointerCapture) {
            target.setPointerCapture(e.pointerId);
        }

        window.addEventListener('pointermove', this._handleResizeMove);
        window.addEventListener('pointerup', this._handleResizeEnd);
        window.addEventListener('pointercancel', this._handleResizeEnd);
    }

    private _handleResizeMove = (e: PointerEvent): void => {
        if (!this._resizeState || !this.block) return;

        const deltaPx = e.clientX - this._resizeState.startX;
        const deltaPercent = (deltaPx / this._resizeState.containerWidth) * 100;
        const min = 1;
        let newLeft = this._resizeState.startLeft + deltaPercent;
        let newRight = this._resizeState.totalPair - newLeft;

        if (newLeft < min) {
            newLeft = min;
            newRight = this._resizeState.totalPair - newLeft;
        } else if (newRight < min) {
            newRight = min;
            newLeft = this._resizeState.totalPair - newRight;
        }

        this._setDropZoneWidthsPercent([
            {zoneId: this._resizeState.leftId, width: newLeft},
            {zoneId: this._resizeState.rightId, width: newRight}
        ]);

        this._resizeState.currentLeft = newLeft;
        this._resizeState.currentRight = newRight;
        this.requestUpdate();
    };

    private _handleResizeEnd = (e: PointerEvent): void => {
        if (this._resizeState) {
            const target = e.target as HTMLElement | null;
            if (target?.releasePointerCapture) {
                target.releasePointerCapture(e.pointerId);
            }
        }

        this._resizeState = null;
        this._resizeHandleIndex = null;
        this.requestUpdate();
        window.removeEventListener('pointermove', this._handleResizeMove);
        window.removeEventListener('pointerup', this._handleResizeEnd);
        window.removeEventListener('pointercancel', this._handleResizeEnd);
    };

    private _ensureDropZones() {
        if (!this.block) return;

        const columns = this.resolvePropertyAsNumber('columns', DEFAULT_COLUMNS);
        const existingDropZones = this.block.children || [];

        // Add missing drop-zones
        if (existingDropZones.length < columns) {
            const toAdd = columns - existingDropZones.length;
            const current = existingDropZones.length;

            const containerStyles: Record<string, ContainerStyleData> = {};
            containerStyles[this.activeContainerId] = {size: {width: {value: this._roundPercent(100 / columns), unit: '%'}}};

            for (let i = 0; i < toAdd; i++) {
                this.documentModel.createBlock('block-drop-zone', this.blockId, this.blockRegistry.getDefaults('block-drop-zone'), {
                    label: `Column ${current + i + 1}`,
                    props: {columnIndex: current + i},
                    styles: {
                        block: {containers: containerStyles}
                    }
                });
            }
        }
        // Remove excess drop-zones
        else if (existingDropZones.length > columns) {
            const toRemove = existingDropZones.slice(columns) as string[];
            toRemove.forEach(zoneId => this.documentModel.deleteBlock(zoneId, true));
        }

        const updatedBlock = this.documentModel.getBlock(this.block.id);
        if (!updatedBlock?.children) return;

        updatedBlock.children.forEach((zoneId, index) => {
            const zone = this.documentModel.getBlock(zoneId as string);
            if (!zone) return;

            const currentIndex = zone.props.columnIndex;
            if (currentIndex !== index) {
                this.documentModel.updateBlock(zoneId as string, {
                    props: {...(zone.props || {}), columnIndex: index}
                });
            }
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-columns': BlockColumns;
    }
}
