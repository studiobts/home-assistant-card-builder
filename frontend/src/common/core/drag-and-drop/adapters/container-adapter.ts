/**
 * Container Adapter
 *
 * Manages drop targets for container blocks (supports recursive nesting).
 */

import type { EventBus } from "@/common/core/event-bus";
import type { DragDropBlock } from '../drag-drop-block';
import { BaseDropAdapter } from './base-drop-adapter';
import type { RestrictionManager } from '../core/restriction-manager';
import { type DraggablePayloadData, type DropTargetPayloadData, DropTargetType } from "../types";
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';

/**
 * Container Adapter - specialized for container block drop targets (nesting)
 */
export class ContainerAdapter extends BaseDropAdapter {
    constructor(restrictionManager: RestrictionManager, eventBus: EventBus) {
        super(restrictionManager, eventBus);
    }

    /**
     * Attach drop target to a container block
     */
    attachToContainer(block: DragDropBlock): void {
        this.register(block);
    }

    /**
     * Unregister a container
     */
    unregisterContainer(block: DragDropBlock): void {
        this.unregister(block);
    }

    // Implement abstract methods

    protected getAdapterName(): string {
        return 'ContainerAdapter';
    }

    protected _canDrop(payload: DraggablePayloadData, target: DragDropBlock): boolean {
        // Check if the container accepts this block type
        const result = this.restrictionManager.canNestInContainer(
            payload,
            target.blockType,
            target.blockTypesAcceptedAsChildren
        );

        return result.allowed;
    }

    protected _getDropTargetData(target: DragDropBlock): DropTargetPayloadData {
        return {
            type: DropTargetType.CONTAINER,
            canvasId: target.canvasId,
            targetBlockId: target.dropId,
            targetBlockType: target.blockType,
        };
    }

    protected _getBlockedInstructions(_target: DragDropBlock, _childrenCount: number): Instruction['operation'][] {
        const droppableBlockedInstruction = _target.getBlockedDropInstructions();

        return droppableBlockedInstruction !== null ? droppableBlockedInstruction : [];
    }
}
