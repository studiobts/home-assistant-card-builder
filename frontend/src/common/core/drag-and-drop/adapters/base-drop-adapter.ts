/**
 * Base Drop Adapter
 *
 * Abstract base class providing common drop target functionality.
 * Specialized adapters extend this for different drop target types.
 */
import type { EventBus } from "@/common/core/event-bus";
import { DragDropBlock } from "../drag-drop-block";
import type { DraggablePayloadData, DropElement, DropTargetPayloadData } from "../types";
import { RestrictionManager } from '../core/restriction-manager';
import { attachInstruction, type Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";

/**
 * Abstract base class for drop adapters
 */
export abstract class BaseDropAdapter {
    protected dropTargets = new Map<HTMLElement, CleanupFn>();

    protected constructor(
        protected restrictionManager: RestrictionManager,
        protected eventBus: EventBus
    ) {
    }

    /**
     * Register a drop target
     */
    register(target: DropElement): void {
        if (this.dropTargets.has(target.dropElement)) {
            console.warn(`[${this.getAdapterName()}] Drop target already registered, skip: `, target.dropElement);
            return;
        }

        console.log(`[${this.getAdapterName()}] Registering drop target ${target.dropId}`);
        this._attachDropTarget(target);
    }

    /**
     * Unregister a drop target
     */
    unregister(target: DropElement): void {
        const cleanup = this.dropTargets.get(target.dropElement);
        if (cleanup) {
            cleanup();
            this.dropTargets.delete(target.dropElement);
        }
    }

    /**
     * Clean up all drop targets
     */
    destroy(): void {
        this.dropTargets.forEach((cleanup) => cleanup());
        this.dropTargets.clear();
    }

    /**
     * Attach drop target behavior to an element
     * Can be overridden by subclasses for specialized behavior
     */
    protected _attachDropTarget(target: DropElement): void {
        const cleanup = dropTargetForElements({
            element: target.dropElement,
            canDrop: ({source}) => {
                const payload = source.data as DraggablePayloadData;
                return this._canDrop(payload, target);
            },
            getData: ({input, element}) => {
                const children: DragDropBlock[] = this._getBlockChildren(element);
                const targetData = this._getDropTargetData(target);
                const blockedInstructions = this._getBlockedInstructions(target, children.length);

                // Build operations object following Atlassian docs
                // Each operation can be: 'not-available' (default), 'available', or 'blocked'
                const operations: Record<string, 'available' | 'not-available' | 'blocked'> = {
                    'reorder-before': blockedInstructions.includes('reorder-before') ? 'not-available' : 'available',
                    'reorder-after': blockedInstructions.includes('reorder-after') ? 'not-available' : 'available',
                    'combine': blockedInstructions.includes('combine') ? 'not-available' : 'available',
                };

                return attachInstruction(targetData, {
                    input,
                    element,
                    axis: 'vertical',
                    operations: operations,
                });
            },
        });

        this.dropTargets.set(target.dropElement, cleanup);
    }

    /**
     * Get child elements that are blocks
     */
    protected _getBlockChildren(element: Element): DragDropBlock[] {
        return Array
            .from(element.children)
            .filter((child) => child instanceof DragDropBlock);
    }

    // Abstract methods to be implemented by derived classes

    /**
     * Get the adapter name for logging
     */
    protected abstract getAdapterName(): string;

    /**
     * Check if the drop action is allowed
     */
    protected abstract _canDrop(payload: DraggablePayloadData, target: DropElement): boolean;

    /**
     * Get data to attach to the drop target
     */
    protected abstract _getDropTargetData(target: DropElement): DropTargetPayloadData;

    /**
     * Get blocked instructions for list-item pattern
     * Returns an array of instruction types that should be blocked
     */
    protected _getBlockedInstructions(_target: DropElement, _childrenCount: number): Instruction['operation'][] {
        // Default: no blocked instructions
        return [];
    }
}

