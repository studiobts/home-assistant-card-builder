/**
 * Block Draggable Adapter
 *
 * Manages draggable behavior for elements in the canvas.
 * Allows blocks to be reordered and moved between containers.
 */

import type { EventBus } from "@/common/core/event-bus";
import { DragDropBlock } from "../drag-drop-block";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DRAGGABLE_ATTRIBUTE } from '../constants';
import type { RestrictionManager } from '../core/restriction-manager';
import {
    type BlockDragOnGeneratePreviewDetail,
    type BlockDragStartedDetail,
    type BlockRejectedDetail,
    type DraggablePayloadData,
    DraggableSourceType
} from '../types';
import type { ShakeAnimator } from '../ui/shake-animator';

interface CleanupFunction {
    (): void;
}

export class BlockDraggableAdapter {
    private draggables = new Map<HTMLElement, CleanupFunction>(); // blockId -> cleanup

    constructor(
        private restrictionManager: RestrictionManager,
        private shakeAnimator: ShakeAnimator,
        private eventBus: EventBus
    ) {
    }

    /**
     * Attach draggable behavior to a element
     */
    attachToBlock(block: DragDropBlock): void {
        if (this.draggables.has(block)) {
            console.log('[BlockDraggableAdapter] Block already draggable', {
                element: block,
                blockId: block.blockId,
                canvasId: block.canvasId
            });
            return;
        }

        console.log('[BlockDraggableAdapter] Attaching draggable to block:', block.blockId, 'type:', block.blockType);

        // Add draggable attribute for event retargeting
        block.setAttribute(DRAGGABLE_ATTRIBUTE, 'true');

        const cleanup = draggable({
            element: block,
            getInitialData: () => {
                const payload: DraggablePayloadData = {
                    sourceId: block.canvasId,
                    sourceType: DraggableSourceType.CANVAS,
                    blockType: block.blockType,
                    blockId: block.blockId,
                };
                console.log('[BlockDraggableAdapter] Drag started for block:', block.blockId, 'payload:', payload);
                return payload;
            },
            onGenerateDragPreview: () => {
                console.log('[BlockDraggableAdapter] onGenerateDragPreview for block:', block.blockId);

                // Emit drag-started event
                this.eventBus.dispatchEvent<BlockDragOnGeneratePreviewDetail>('block-drag-on-generate-preview', {
                    sourceId: block.canvasId,
                    sourceType: DraggableSourceType.CANVAS,
                    blockId: block.blockId,
                    blockType: block.blockType,
                });
            },
            onDragStart: () => {
                console.log('[BlockDraggableAdapter] onDragStart for block:', block.blockId);

                this.eventBus.dispatchEvent<BlockDragStartedDetail>('block-drag-started', {
                    sourceId: block.canvasId,
                    sourceType: DraggableSourceType.CANVAS,
                    blockId: block.blockId,
                    blockType: block.blockType,
                    canvasId: block.canvasId,
                });

                // Add visual feedback (e.g., reduce opacity)
                block.style.opacity = '0.5';
            },
            onDrop: () => {
                console.log('[BlockDraggableAdapter] onDrop for block:', block.blockId);

                // Restore visual state
                block.style.opacity = '1';
            },
            canDrag: () => {
                const payload: DraggablePayloadData = {
                    sourceType: DraggableSourceType.CANVAS,
                    sourceId: block.canvasId,
                    blockType: block.blockType,
                    blockId: block.blockId,
                };

                console.log('[BlockDraggableAdapter] canDrag check for block:', block.blockId);

                // Check if block is bound (cannot be moved)
                const result = this.restrictionManager.canStartDrag(payload);
                console.log('[BlockDraggableAdapter] Restriction result:', result);

                if (!result.allowed) {
                    console.log('[BlockDraggableAdapter] Drag rejected:', result.reason, result.message);

                    this.eventBus.dispatchEvent<BlockRejectedDetail>('block-rejected', {
                        blockType: block.blockType,
                        blockId: block.blockId,
                        sourceZoneId: block.canvasId,
                        reason: result.reason!,
                        message: result.message || 'Drag operation not allowed',
                        element: block,
                    });

                    // Play shake animation
                    this.shakeAnimator.playShake(block);

                    return false;
                }

                console.log('[BlockDraggableAdapter] Drag allowed for block:', block.blockId);
                return true;
            },
        });

        this.draggables.set(block, cleanup);
        console.log('[BlockDraggableAdapter] Block is now draggable:', block.blockId);
    }

    /**
     * Detach draggable behavior from a block
     */
    detachFromBlock(element: DragDropBlock): void {
        const cleanup = this.draggables.get(element);
        if (cleanup) {
            console.log('[BlockDraggableAdapter] Detaching draggable from block', {
                element: element,
                blockId: element.blockId
            });
            cleanup();
            this.draggables.delete(element);
        }
    }

    /**
     * Cleanup all draggables
     */
    destroy(): void {
        this.draggables.forEach((cleanup) => cleanup());
        this.draggables.clear();
    }
}

