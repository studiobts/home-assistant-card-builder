import { BlockBase } from '@/common/blocks/components/block-base';
import { BlockLayout } from "@/common/blocks/components/layout/block-layout";
import { type BlockRegistration, type BlockRegistry } from '@/common/blocks/core/registry/block-registry';
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import type { BlockPanelConfig, GridConfig } from '@/common/blocks/types';
import { gridAreasToCSS, gridDimensionsToCSS } from '@/common/blocks/utils';
import type { BlockData, BlockUpdatedDetail } from '@/common/core/model';
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { consume } from "@lit/context";
import { css, html, type PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

/**
 * Default grid configuration
 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
    rows: 2,
    columns: 2,
    rowSizes: [
        {value: 1, unit: 'fr'},
        {value: 1, unit: 'fr'},
    ],
    columnSizes: [
        {value: 1, unit: 'fr'},
        {value: 1, unit: 'fr'},
    ],
    areas: [],
    gap: {row: 0, column: 0},
};

@customElement('block-grid')
export class BlockGrid extends BlockLayout {
    static styles = [
        ...BlockBase.styles,
        css`
            .grid-content {
                display: grid;
            }

            .grid-zone {
                display: flex;
                flex-direction: column;
                min-width: 0;
                min-height: 0;
                position: relative;
            }
        `,
    ];

    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;

    public get isBlockContainer() {
        return true;
    }

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Grid',
                icon: '<ha-icon icon="mdi:grid"></ha-icon>',
                category: 'layout',
            },
            defaults: {
                props: {
                    gridConfig: {...DEFAULT_GRID_CONFIG},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'grid-editor',
                        label: 'Grid Layout',
                        traits: [
                            {
                                type: 'action',
                                name: 'editGrid',
                                label: 'Grid Editor',
                                buttonLabel: 'Edit Grid Layout',
                                actionId: 'open-grid-editor',
                                icon: '⊞'
                            },
                            {
                                type: 'info',
                                name: 'gridInfo',
                                label: 'Grid Info',
                                description: 'Configure grid rows, columns and areas'
                            },
                        ]
                    }
                ]
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'layout',
                        // FIXME: we should exclude flex?
                    },
                },
            },
        };
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.documentModel.addEventListener('block-updated', this._onBlockUpdated);
    }

    disconnectedCallback(): void {
        this.documentModel.removeEventListener('block-updated', this._onBlockUpdated);
        super.disconnectedCallback();
    }

    /**
     * Ensure drop-zones exist when grid is initialized or updated
     */
    updated(changedProps: PropertyValues) {
        super.updated(changedProps);

        if (changedProps.has('block') && this.block) {
            this._ensureDropZones();
            this._updateDropZones();
        }
    }

    render() {
        const gridConfig = (this.block?.props.gridConfig as GridConfig) || DEFAULT_GRID_CONFIG;

        // Get drop-zone blocks (they are already created by updated())
        const dropZones: BlockData[] = (this.block?.children || [])
            .map(child => this.documentModel.getBlock(child as string))
            .filter((block): block is BlockData => !!block);

        const allEmpty = dropZones.length === 0 || !dropZones.every(zone => zone.children?.length);

        // Build grid style
        const gridStyle = {
            gridTemplateRows: gridDimensionsToCSS(gridConfig.rowSizes),
            gridTemplateColumns: gridDimensionsToCSS(gridConfig.columnSizes),
            gap: `${gridConfig.gap.row}px ${gridConfig.gap.column}px`,
        };

        // Add grid-template-areas if we have areas
        if (gridConfig.areas.length > 0) {
            const areasCSS = gridAreasToCSS(gridConfig.areas, gridConfig.rows, gridConfig.columns);
            if (areasCSS) {
                (gridStyle as any).gridTemplateAreas = areasCSS;
            }
        }

        return html`
      <div class="grid-content ${allEmpty ? 'empty-state' : ''}" style=${styleMap(gridStyle)}>
        ${repeat(
            dropZones,
            (dropZone) => dropZone.id,
            (dropZone) => {
                const zoneStyle: Record<string, string> = {
                    gridArea: (dropZone.props.areaId || dropZone.props.gridArea) as string
                };

                return html`
              <div class="grid-zone" style=${styleMap(zoneStyle)}>
                ${this.renderer!.renderBlock(dropZone)}
              </div>
            `;
            }
        )}
      </div>
    `;
    }

    public getBlockedDropInstructions(): Instruction['operation'][] | null {
        // External blocks not allowed inside grid
        return ['combine'];
    }

    private _onBlockUpdated = (e: Event): void => {
        const detail = (e as CustomEvent<BlockUpdatedDetail>).detail;
        const updated = detail.block;

        if (updated.type === 'block-drop-zone' && updated.parentId === this.block!.id) {
            this._handleDropZoneLabelUpdate(detail.block);
        }
    };

    private _ensureDropZones() {
        const gridConfig = (this.block!.props.gridConfig as GridConfig) || DEFAULT_GRID_CONFIG;
        const areas = gridConfig.areas || [];

        // Calculate how many drop zones we need
        // If we have areas, we create one drop-zone per area
        // Otherwise, we create one drop-zone per cell
        const expectedZones = areas.length > 0 ? areas.length : gridConfig.rows * gridConfig.columns;

        const existingDropZones = this.block!.children || [];

        // Add missing drop-zones
        if (existingDropZones.length < expectedZones) {
            const toAdd = expectedZones - existingDropZones.length;
            for (let i = 0; i < toAdd; i++) {
                const zoneIndex = i;
                const zoneProps: any = {zoneIndex};
                let zoneName = `Grid Area ${zoneIndex + 1}`;
                const area = areas.length > 0 ? areas[zoneIndex] : undefined;

                if (area) {
                    // Area-based zone
                    zoneProps.areaName = area.name;
                    zoneProps.gridArea = area.name;
                    zoneName = area.name;
                } else {
                    // Cell-based zone
                    const row = Math.floor(zoneIndex / gridConfig.columns);
                    const column = zoneIndex % gridConfig.columns;
                    zoneProps.row = row;
                    zoneProps.column = column;
                    zoneProps.gridArea = `${row + 1} / ${column + 1} / span 1 / span 1`;
                }

                this.documentModel.createBlock('block-drop-zone', this.blockId, this.blockRegistry.getDefaults('block-drop-zone'), {
                    label: zoneName,
                    props: zoneProps,
                });
            }
        }
        // Remove excess drop-zones
        else if (existingDropZones.length > expectedZones) {
            const toRemove = existingDropZones.slice(expectedZones) as string[];
            toRemove.forEach(zoneId => this.documentModel.deleteBlock(zoneId, true));
        }
        // Update existing zones with correct grid-area

        existingDropZones.forEach((zoneId, index) => {
            const zone = this.documentModel.getBlock(zoneId as string);
            if (!zone) return;

            const updatedProps: any = {zoneIndex: index};
            const area = areas.length > 0 ? areas[index] : undefined;

            if (area) {
                updatedProps.areaId = area.id;
                updatedProps.areaName = area.name;
                updatedProps.gridArea = area.name;
            } else {
                const row = Math.floor(index / gridConfig.columns);
                const column = index % gridConfig.columns;
                updatedProps.areaId = undefined;
                updatedProps.areaName = undefined;
                updatedProps.row = row;
                updatedProps.column = column;
                updatedProps.gridArea = `${row + 1} / ${column + 1} / span 1 / span 1`;
            }

            // Only update if props have actually changed
            const propsChanged = Object.keys(updatedProps).some(
                key => zone.props[key] !== updatedProps[key]
            );

            const labelChanged = area && zone.label !== area.name;
            if (propsChanged || labelChanged) {
                const updates: Partial<BlockData> = {};
                if (propsChanged) {
                    updates.props = updatedProps;
                }
                if (labelChanged) {
                    updates.label = area?.name;
                }
                this.documentModel.updateBlock(zoneId as string, updates);
            }
        });

    }

    private _handleDropZoneLabelUpdate(zone: BlockData): void {
        const gridConfig = (this.block!.props.gridConfig as GridConfig) || DEFAULT_GRID_CONFIG;
        if (!gridConfig.areas.length) return;

        const zoneIndex = typeof zone.props.zoneIndex === 'number'
            ? zone.props.zoneIndex
            : this.block!.children.indexOf(zone.id);
        if (zoneIndex < 0 || zoneIndex >= gridConfig.areas.length) return;

        const nextLabel = zone.label?.trim();
        if (!nextLabel) return;

        const currentArea = gridConfig.areas[zoneIndex];
        if (!currentArea || currentArea.name === nextLabel) return;

        const nextAreas = gridConfig.areas.map((area, index) => (
            index === zoneIndex ? {...area, name: nextLabel} : area
        ));

        this.documentModel.updateBlock(this.block!.id, {
            props: {
                gridConfig: {
                    ...gridConfig,
                    areas: nextAreas,
                },
            },
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-grid': BlockGrid;
    }
}
