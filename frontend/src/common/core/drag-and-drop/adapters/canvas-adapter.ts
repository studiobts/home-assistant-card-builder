/**
 * Canvas Adapter
 *
 * Manages drop targets for canvas elements (root level flow containers).
 */

import type { EventBus } from "@/common/core/event-bus";
import { type DropTargetPayloadData, type DraggablePayloadData, type DropElement, DropTargetType } from '../types';
import { BaseDropAdapter } from './base-drop-adapter';
import type { RestrictionManager } from '../core/restriction-manager';
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';

/**
 * Canvas Adapter - specialized for canvas root drop targets
 */
export class CanvasAdapter extends BaseDropAdapter {
    constructor(restrictionManager: RestrictionManager, eventBus: EventBus) {
        super(restrictionManager, eventBus);
    }

    /**
     * Register a canvas
     */
    registerCanvas(canvas: DropElement): void {
        this.register(canvas);
    }

    /**
     * Unregister a canvas
     */
    unregisterCanvas(canvas: DropElement): void {
        this.unregister(canvas);
    }

    protected getAdapterName(): string {
        return 'CanvasAdapter';
    }

    protected _canDrop(payload: DraggablePayloadData, target: DropElement): boolean {
        const result = this.restrictionManager.canDropInCanvas(
            payload,
            target.dropId
        );

        return result.allowed;
    }

    protected _getDropTargetData(target: DropElement): DropTargetPayloadData {
        return {
            type: DropTargetType.CANVAS,
            canvasId: target.dropId,
        };
    }

    protected _getBlockedInstructions(_target: DropElement, childrenCount: number): Instruction['operation'][] {
        // Canvas accepts drop only when empty
        return childrenCount == 0 ? ['reorder-before', 'reorder-after'] : ['combine', 'reorder-before', 'reorder-after'];
    }
}
