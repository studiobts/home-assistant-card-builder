import { BlockBase } from '@/common/blocks/components/block-base';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockStyleConfig } from '@/common/blocks/style';
import type { BlockPanelConfig } from '@/common/blocks/types';
import type { BlockData } from "@/common/core/model/types";
import { type ResolvedStyleData, resolvedToCSSProperties } from "@/common/core/style-resolver";
import type { DropTargetHoverDetail } from "@/common/core/drag-and-drop";
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from "lit/directives/repeat.js";

export const DEFAULT_STYLE_CONFIG: BlockStyleConfig = {
    groups: ['background', 'border', 'flex'],
    properties: ['layout.display', 'spacing.padding']
};

export interface DropZoneStyleProvider {
    getDropZoneStyleConfig?: () => BlockStyleConfig | undefined;

    getDropZoneResolvedStyleData?(dropZone: BlockData): ResolvedStyleData;
}

/**
 * Drop Zone Block - Virtual container for nested blocks
 *
 * This is a virtual block that:
 * - Cannot be created from sidebar (definition is null)
 * - Can only be created internally by parent blocks
 * - Supports styling applied by parent
 * - Auto-registers with DragDropManager like any other block
 */
@customElement('block-drop-zone')
export class BlockDropZone extends BlockBase {
    static styles = [
        ...BlockBase.styles,
        css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 1px;
                padding: 0;
                width: 100%;
                height: 100%;
                position: relative;
            }

            :host(.dnd-drop-zone-empty) {
                opacity: 0.5;
            }

            /* Empty state - shown only when no children */

            .empty-state {
                min-height: 40px;
                height: 100%;
                padding: 4px;
            }

            .empty-state-message {
                display: flex;
                align-items: center;
                justify-content: center;
                color: black;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                background: rgba(0, 0, 0, 0.2);
                text-align: center;
                box-sizing: border-box;
                height: 100%;
            }
        `
    ];

    public get isBlockDraggable(): boolean {
        return false;
    }

    public get isBlockContainer() {
        return true;
    }

    public override shouldShowDropIndicator(): boolean {
        const block = this.documentModel.getBlock(this.blockId) ?? this.block;
        const childrenCount = block?.children?.length ?? 0;
        return childrenCount > 0;
    }

    /**
     * Returns null definition to prevent sidebar display.
     * Provides defaults for programmatic creation by parent containers.
     */
    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Drop Zone',
                icon: '<ha-icon icon="mdi:download-box-outline"></ha-icon>',
                internal: true
            },
            defaults: {
                canBeDeleted: false,
                canBeDuplicated: false,
                canChangeLayoutMode: false
            },
            entityDefaults: {
                mode: 'inherited'
            }
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        const parentConfig = this._getParentStyleConfig();
        return {
            targetStyles: {
                block: {
                    styles: parentConfig ?? DEFAULT_STYLE_CONFIG,
                },
            },
        };
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.eventBus.addEventListener<DropTargetHoverDetail>(
            'drop-target-hover',
            this._handleDropTargetHover
        );
    }

    render() {
        const children = this.block?.children || [];
        const hasChildren = children.length > 0;

        // Get children blocks from document model
        const childBlocks: BlockData[] = children.map((child) => this.documentModel.getBlock(child as string)).filter((block): block is BlockData => !!block);

        return html`
            ${hasChildren
                    ? repeat(childBlocks, (block) => block.id, (block) => this.renderer!.renderBlock(block))
                    : html`
                        <div class="empty-state">
                            <div class="empty-state-message">
                                Drop Blocks Here
                            </div>
                        </div>`
            }
        `;
    }

    public getBlockedDropInstructions(): Instruction['operation'][] | null {
        // Blocked instruction depends on the parent block
        const block = this.documentModel.getBlock(this.blockId);
        const parent = this.documentModel.getBlock(block!.parentId!)
        const element = this.documentModel.getElement(parent!) as BlockBase; // FIXME: we have to unify the interface with a common base and remove this cast

        const blocked = element?.getBlockedDropInstructions() ?? null;

        if (blocked && blocked.includes('combine')) {
            // If parent blocks combine, we cannot allow reordering;
            // otherwise dropped blocks will be placed into parent as direct children
            return ['reorder-before', 'reorder-after'];
        }

        return null;
    }

    private _handleDropTargetHover = (data?: DropTargetHoverDetail): void => {
        if (!data || data.targetElement !== this) {
            return;
        }
        this.classList.toggle('dnd-drop-zone-empty', data.active && !this.shouldShowDropIndicator());
    }

    // FIXME: find a better way to get resolved styles from parent
    protected getResolvedContextStyles(): Record<string, string> {
        const block = this.documentModel.getBlock(this.blockId) ?? this.block;
        const parentId = block?.parentId!;

        const parentElement = this.documentModel.getElement(parentId) as DropZoneStyleProvider | undefined;
        const resolved = parentElement?.getDropZoneResolvedStyleData?.(this.block!);

        return resolved ? resolvedToCSSProperties(resolved) : this.resolvedRenderContext.styles;
    }

    private _getParentStyleConfig(): BlockStyleConfig | undefined {
        const block = this.documentModel.getBlock(this.blockId) ?? this.block;
        const parentId = block?.parentId;
        if (!parentId) return undefined;

        const parentElement = this.documentModel.getElement(parentId) as DropZoneStyleProvider | undefined;
        return parentElement?.getDropZoneStyleConfig?.();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-drop-zone': BlockDropZone;
    }
}
