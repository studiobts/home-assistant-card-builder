import { BlockBase } from '@/common/blocks/components/block-base';
import type { DropZoneStyleProvider } from "@/common/blocks/components/layout/block-drop-zone";
import { BlockLayout } from "@/common/blocks/components/layout/block-layout";
import { type BlockRegistration, type BlockRegistry } from '@/common/blocks/core/registry/block-registry';
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import type { BlockPanelConfig } from '@/common/blocks/types';
import type { BlockData } from "@/common/core/model/types";
import { type ResolvedStyleData } from '@/common/core/style-resolver';
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { consume } from "@lit/context";
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('block-container')
export class BlockContainer extends BlockLayout implements DropZoneStyleProvider {
    static styles = [
        ...BlockBase.styles,
        css`
            .container {
                display: flex;
            }
            .container-slot {
                width: 100%;
            }
        `
    ];

    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;

    public get isBlockContainer() {
        return true;
    }

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Container',
                icon: '<ha-icon icon="mdi:contain"></ha-icon>',
                category: 'layout'
            },
            defaults: {},
            entityDefaults: {
                mode: 'inherited'
            }
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            targetStyles: {
                block: {
                    styles: {
                        preset: 'layout',
                    },
                },
            },
        };
    }

    public getDropZoneResolvedStyleData(_dropZone: BlockData): ResolvedStyleData {
        const resolvedEntity = this.documentModel.resolveEntityForBlock(this.block!.id);
        const resolved = this.renderer.resolveBlockStyles(this.block!, this.activeContainerId, {defaultEntityId: resolvedEntity.entityId});

        // Get flex and forward to drop-zone flex
        const {flex} = resolved ?? {};
        return {flex};
    }

    /**
     * Ensure drop-zones exist when columns are initialized or updated
     */
    updated(changedProps: Map<string, unknown>) {
        super.updated(changedProps);

        // Create drop-zone when block is assigned
        if (changedProps.has('block') && this.block) {
            this._ensureDropZone();
            this._updateDropZones();
        }
    }

    render() {
        if (! this.block || this.block.children.length === 0) return html``;

        const dropZone: BlockData = this._getDropZone()!;

        return html`
            <div class="container">
                <div class="container-slot">
                    ${this.renderer!.renderBlock(dropZone)}
                </div>
            </div>
        `;
    }

    public getBlockedDropInstructions(): Instruction['operation'][] | null {
        // External blocks not allowed inside container
        return ['combine'];
    }

    private _getDropZone(): BlockData | undefined {
        return this._getDropZones()[0] ?? undefined;
    }

    private _ensureDropZone() {
        if (!this.block) return;

        const existingDropZone = this._getDropZone();

        // Add missing drop-zone
        if (! existingDropZone) {
            const dropZone = this.documentModel.createBlock('block-drop-zone', this.blockId, this.blockRegistry.getDefaults('block-drop-zone'), {
                label: `Content`,
                isHidden: true,
            });

            this.block.children = [dropZone.id];
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-container': BlockContainer;
    }
}
