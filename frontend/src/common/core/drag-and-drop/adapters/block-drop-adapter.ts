/**
 * Block Drop Adapter
 *
 * Manages drop targets for elements to enable reordering.
 */

import type { EventBus } from "@/common/core/event-bus";
import type { DragDropBlock } from '../drag-drop-block';
import type { RestrictionManager } from '../core/restriction-manager';
import { type DraggablePayloadData, type DropTargetPayloadData, DropTargetType } from "../types";
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';
import { BaseDropAdapter } from './base-drop-adapter';

/**
 * Block Drop Adapter - specialized for drop targets (reordering)
 */
export class BlockDropAdapter extends BaseDropAdapter {
    constructor(restrictionManager: RestrictionManager, eventBus: EventBus) {
        super(restrictionManager, eventBus);
    }

    /**
     * Register a block as a drop target
     */
    registerBlock(target: DragDropBlock): void {
        this.register(target);
    }

    /**
     * Unregister a block
     */
    unregisterBlock(block: DragDropBlock): void {
        this.unregister(block);
    }

    // Implement abstract methods

    protected getAdapterName(): string {
        return 'BlockDropAdapter';
    }

    protected _canDrop(payload: DraggablePayloadData, target: DragDropBlock): boolean {
        // Check if drop is allowed in the canvas containing this block
        const result = this.restrictionManager.canDropInCanvas(
            payload,
            target.canvasId
        );

        // Don't allow dropping a block on itself
        if (payload.blockId === target.blockId) {
            return false;
        }

        return result.allowed;
    }

    protected _getDropTargetData(target: DragDropBlock): DropTargetPayloadData {
        return {
            type: DropTargetType.BLOCK,
            canvasId: target.canvasId,
            targetBlockId: target.dropId,
            targetBlockType: target.blockType,
        };
    }

    protected _getBlockedInstructions(_target: DragDropBlock, _childrenCount: number): Instruction['operation'][] {
        // Blocks support reordering but not combining (use containers for nesting)
        return ['combine'];
    }
}

