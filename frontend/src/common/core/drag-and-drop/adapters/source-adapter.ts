/**
 * Source Adapter
 *
 * Manages draggable blocks in source zones (e.g., sidebar).
 */

import type { EventBus } from "@/common/core/event-bus";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import { DRAGGABLE_SELECTOR } from '../constants';
import { RestrictionManager } from '../core/restriction-manager';
import {
    type BlockDragOnGeneratePreviewDetail,
    type BlockRejectedDetail,
    type DraggablePayloadData,
    DraggableSourceType,
    type DragSourceElement
} from '../types';
import { ShakeAnimator } from '../ui/shake-animator';

export class SourceAdapter {
    private zones = new Map<string, DragSourceElement>();
    private cleanupFunctions = new Map<string, CleanupFn[]>();

    constructor(
        private restrictionManager: RestrictionManager,
        private shakeAnimator: ShakeAnimator,
        private eventBus: EventBus
    ) {
    }

    /**
     * Register a source zone
     */
    registerZone(source: DragSourceElement): void {
        if (this.zones.has(source.sourceId)) {
            console.warn(`Source zone ${source.sourceId} already registered`);
            return;
        }

        this.zones.set(source.sourceId, source);
        this._attachDraggables(source);
    }

    /**
     * Cleanup all zones
     */
    destroy(): void {
        // Cleanup all zones
        this.cleanupFunctions.forEach((cleanups) => {
            cleanups.forEach((cleanup) => cleanup());
        });

        this.cleanupFunctions.clear();
        this.zones.clear();
    }

    /**
     * Attach draggable behavior to blocks in a source zone
     */
    private _attachDraggables(source: DragSourceElement): void {
        const cleanups: CleanupFn[] = [];
        // Find all elements with the DRAGGABLE_ATTRIBUTE
        const blocks = source.sourceElement.querySelectorAll(DRAGGABLE_SELECTOR);

        blocks.forEach((block) => {
            if (!(block instanceof HTMLElement)) {
                return;
            }

            const blockType = block.getAttribute('block-type') || block.dataset.blockType;

            if (!blockType) {
                console.warn('[SourceAdapter] Block missing data-block-type:', block);
                return;
            }

            // Check if this block type is allowed in this zone
            if (source.sourceAllowedBlockTypes && !source.sourceAllowedBlockTypes.includes(blockType)) {
                console.log(`[SourceAdapter] Block type ${blockType} not allowed in zone ${source.sourceId}, skipping...`);
                return;
            }

            try {
                const draggablePayloadData: DraggablePayloadData = {
                    sourceId: source.sourceId,
                    sourceType: DraggableSourceType.SOURCE_ZONE,
                    blockType: blockType,
                }

                const cleanup = draggable({
                    element: block,
                    getInitialData: () => {
                        console.log('[SourceAdapter] Drag started for block:', draggablePayloadData);
                        return draggablePayloadData;
                    },
                    onGenerateDragPreview: () => {
                        console.log('[BlockDraggableAdapter] onGenerateDragPreview for block type:', blockType);

                        // Emit drag-started event
                        this.eventBus.dispatchEvent<BlockDragOnGeneratePreviewDetail>('block-drag-on-generate-preview', {
                            sourceId: source.sourceId,
                            sourceType: DraggableSourceType.SOURCE_ZONE,
                            blockType: blockType,
                        });
                    },
                    canDrag: () => {
                        // Check restrictions
                        const result = this.restrictionManager.canStartDrag(draggablePayloadData);

                        if (!result.allowed) {
                            console.log('[SourceAdapter] Drag rejected:', result.reason, result.message);

                            this.eventBus.dispatchEvent<BlockRejectedDetail>('block-rejected', {
                                blockType,
                                sourceZoneId: source.sourceId,
                                reason: result.reason!,
                                message: result.message || 'Drag operation not allowed',
                                element: block,
                            });

                            // Play shake animation
                            this.shakeAnimator.playShake(block);
                            return false;
                        }

                        return true;
                    },
                });


                cleanups.push(cleanup);
            } catch (error) {
                console.error(`[SourceAdapter] Error attaching draggable to ${blockType}:`, error);
            }
        });

        console.log(`[SourceAdapter] Total draggables attached: ${cleanups.length}`);
        this.cleanupFunctions.set(source.sourceId, cleanups);
    }
}
