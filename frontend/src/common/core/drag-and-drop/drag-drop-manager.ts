/**
 * Drag and Drop Manager
 *
 * Main class coordinating all drag-and-drop operations for flow layout blocks.
 * Operates independently from the Moveable-based absolute positioning system.
 */

import type { EventBus } from "@/common/core/event-bus";
import { DragDropBlock } from './drag-drop-block';
import { DRAGGABLE_SELECTOR, DROP_TARGET_SELECTOR } from './constants';
import {
    type AutoScrollConfig,
    type BlockCreated,
    type BlockDroppedEvent,
    type BlockReorderedDetail,
    type DraggablePayloadData,
    DraggableSourceType,
    type DropInstruction,
    type DropTargetPayloadData,
    type DropTargetHoverDetail,
    DropTargetType,
    type RestrictionConfig,
    type TransferRule,
    type DropElement,
    type DragSourceElement, type DropIgnored
} from './types';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { BlockDraggableAdapter } from './adapters/block-draggable-adapter';
import { BlockDropAdapter } from './adapters/block-drop-adapter';
import { CanvasAdapter } from './adapters/canvas-adapter';
import { ContainerAdapter } from './adapters/container-adapter';
import { SourceAdapter } from './adapters/source-adapter';
import { RestrictionManager } from './core/restriction-manager';
import { TransferManager } from './core/transfer-manager';
import { DropIndicatorManager } from './ui/drop-indicator-manager';
import { ShakeAnimator } from './ui/shake-animator';
import { findClosestInShadowDOM } from './utils/shadow-dom';

/**
 * Main drag-and-drop manager class
 */
export class DragDropManager {
    private static _isEventRetargetingPatchApplied = false;
    private eventBus: EventBus;
    private restrictionManager: RestrictionManager;
    private transferManager: TransferManager;
    private dropIndicator: DropIndicatorManager;
    private shakeAnimator: ShakeAnimator;
    private sourceAdapter: SourceAdapter;
    private canvasAdapter: CanvasAdapter;
    private blockDropAdapter: BlockDropAdapter;
    private blockDraggableAdapter: BlockDraggableAdapter;
    private containerAdapter: ContainerAdapter;
    private autoScrollCleanup: (() => void) | null = null;
    private monitorCleanup: (() => void) | null = null;
    private autoScrollInitialized = false;
    private autoScrollElement?: Element;
    private activeDropTargetElement: HTMLElement | null = null;
    private autoScrollConfig: AutoScrollConfig = {
        maxScrollSpeed: 'standard',
        startEdgeThreshold: 30,
    };

    constructor(eventBus: EventBus) {
        // Apply event retargeting patch needed for shadow DOM boundaries
        this._applyEventRetargetingPatch();

        this.eventBus = eventBus;

        // Initialize managers
        this.restrictionManager = new RestrictionManager();
        this.transferManager = new TransferManager();
        this.dropIndicator = new DropIndicatorManager();
        this.shakeAnimator = new ShakeAnimator();

        // Initialize adapters
        this.sourceAdapter = new SourceAdapter(this.restrictionManager, this.shakeAnimator, this.eventBus);
        this.canvasAdapter = new CanvasAdapter(this.restrictionManager, this.eventBus);
        this.blockDropAdapter = new BlockDropAdapter(this.restrictionManager, this.eventBus);
        this.blockDraggableAdapter = new BlockDraggableAdapter(this.restrictionManager, this.shakeAnimator, this.eventBus);
        this.containerAdapter = new ContainerAdapter(this.restrictionManager, this.eventBus);

        // Setup global monitor for debugging
        this._setupMonitor();
    }

    /**
     * Register a source zone (e.g., sidebar with draggable blocks)
     */
    registerSourceZone(source: DragSourceElement): void {
        console.log(`[DragDropManager] registering source zone ${source.sourceId}`);
        this.sourceAdapter.registerZone(source);
    }

    /**
     * Register a canvas (drop target)
     */
    registerCanvas(canvas: DropElement): void {
        console.log(`[DragDropManager] registerCanvas ${canvas.dropId}`);
        this.canvasAdapter.registerCanvas(canvas);
    }

    registerBlock(block: DragDropBlock): void {
        if (block.isBlockDroppable) {
            block.isBlockContainer ?
                this.containerAdapter.attachToContainer(block) :
                this.blockDropAdapter.registerBlock(block);
        }
        if (block.isBlockDraggable) {
            this.blockDraggableAdapter.attachToBlock(block);
        }

        console.log('[DragDropManager] Block registered:', {
            id: block.blockId,
            container: block.isBlockContainer,
            draggable: block.isBlockDraggable,
            droppable: block.isBlockDroppable
        });
    }

    unregisterBlock(block: DragDropBlock): void {
        console.log('[DragDropManager] Unregistering block:', {element: block, blockId: block.blockId});
        this.blockDropAdapter.unregisterBlock(block);
        this.blockDraggableAdapter.detachFromBlock(block);
        this.containerAdapter.unregisterContainer(block);
    }

    /**
     * Set restriction rules
     */
    // noinspection JSUnusedGlobalSymbols
    setRestrictions(config: Partial<RestrictionConfig>): void {
        this.restrictionManager.setRestrictions(config);
    }

    /**
     * Enable cross-canvas transfer with rules
     */
    // noinspection JSUnusedGlobalSymbols
    enableCrossCanvasTransfer(rules: TransferRule[]): void {
        this.transferManager.setRules(rules);
        this.restrictionManager.setTransferRules(rules);
    }

    /**
     * Set auto-scroll configuration
     */
    // noinspection JSUnusedGlobalSymbols
    setAutoScrollConfig(element: Element, config: Partial<AutoScrollConfig>): void {
        this.autoScrollElement = element;
        this.autoScrollConfig = {
            ...this.autoScrollConfig,
            ...config,
        };

        // Setup auto-scroll with the new config if already initialized
        if (this.autoScrollInitialized) {
            if (this.autoScrollCleanup) {
                this.autoScrollCleanup();
            }
        }

        this._setupAutoScroll();
    }

    /**
     * Mark a block as bound (cannot be moved)
     */
    // noinspection JSUnusedGlobalSymbols
    addBoundBlock(blockId: string): void {
        this.restrictionManager.addBoundBlock(blockId);
    }

    /**
     * Unmark a block as bound
     */
    // noinspection JSUnusedGlobalSymbols
    removeBoundBlock(blockId: string): void {
        this.restrictionManager.removeBoundBlock(blockId);
    }

    /**
     * Clean up and destroy the manager
     */
    destroy(): void {
        // Cleanup adapters
        this.sourceAdapter.destroy();
        this.canvasAdapter.destroy();
        this.blockDropAdapter.destroy();
        this.blockDraggableAdapter.destroy();
        this.containerAdapter.destroy();

        // Cleanup UI managers
        this.dropIndicator.destroy();
        this.shakeAnimator.destroy();

        // Cleanup transfer manager
        this.transferManager.destroy();

        // Cleanup monitor
        if (this.monitorCleanup) {
            this.monitorCleanup();
            this.monitorCleanup = null;
        }

        // Cleanup auto-scroll
        if (this.autoScrollCleanup) {
            this.autoScrollCleanup();
            this.autoScrollCleanup = null;
        }
    }

    /**
     * Applies an event retargeting patch to ensure that drag-and-drop events are correctly targeted
     * within shadow DOM boundaries. Updates the `target` property of events to the nearest matching
     * element based on the specified selectors.
     */
    private _applyEventRetargetingPatch(): void {
        if (DragDropManager._isEventRetargetingPatchApplied) {
            console.warn(`[DragDropManager] Event retargeting patch already applied`);
            return;
        }

        const patchEvent = (event: Event, selector: string) => {
            const realTarget = event.composedPath()[0];
            const matchedElement = findClosestInShadowDOM(realTarget as Element, selector);

            if (matchedElement && event.target !== matchedElement) {
                Object.defineProperty(event, 'target', {value: matchedElement, enumerable: true, configurable: true});
            }
        };

        ['dragstart', 'drag', 'dragend'].forEach(type => {
            window.addEventListener(type, (event) => patchEvent(event, DRAGGABLE_SELECTOR), {capture: true})
        });
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(type => {
            window.addEventListener(type, (event) => patchEvent(event, DROP_TARGET_SELECTOR), {capture: true})
        });
    }

    /**
     * Sets up a monitor to handle drag-and-drop interactions, including initiating drag events,
     * handling intermediate states during dragging, and processing drop operations. This method
     * is primarily responsible for managing user interactions and visual feedback while dragging
     * items and performing updates upon completion of a drop action.
     */
    private _setupMonitor(): void {
        this.monitorCleanup = monitorForElements({
            onDrag: ({source, location}) => {
                // Handle drop indicator using list-item instruction pattern
                const dropTargets = location.current.dropTargets;

                if (dropTargets.length === 0) {
                    this._setActiveDropTarget(null);
                    this.dropIndicator.hide();
                    return;
                }

                const sourceElement = source.element as HTMLElement;
                const validTarget = dropTargets.find((target) => {
                    const targetElement = target.element as HTMLElement;
                    return !this._isTargetDescendantOfSource(sourceElement, targetElement);
                });

                if (!validTarget) {
                    this._setActiveDropTarget(null);
                    this.dropIndicator.hide();
                    return;
                }

                const targetElement = validTarget.element as DropElement & HTMLElement;
                const dropTargetPayloadData = validTarget.data as DropTargetPayloadData;

                // Extract instruction from list-item pattern
                const instruction = extractInstruction(validTarget.data);
                const dropInstruction: DropInstruction | undefined = instruction ? {
                    operation: instruction.operation,
                    blocked: instruction.blocked,
                } : undefined;

                this._setActiveDropTarget(targetElement, dropTargetPayloadData, dropInstruction);

                // FIXME: once DropElement is moved on canvasFlowContainer ?. can be removed
                if (!targetElement.shouldShowDropIndicator?.()) {
                    this.dropIndicator.hide();
                    return;
                }


                if (!instruction || instruction.blocked) {
                    this.dropIndicator.hide();
                    return;
                }

                // Determine which edge to show indicator on based on operation
                let edge: 'top' | 'bottom' | null = null;

                switch (instruction.operation) {
                    case 'reorder-before':
                        edge = 'top';
                        break;
                    case 'reorder-after':
                        edge = 'bottom';
                        break;
                    case 'combine':
                        edge = 'top';
                        break; // For combine (nesting), show indicator at top of container
                }

                if (edge && targetElement) {
                    // For indented indicators, we would need to track nesting level separately
                    // The Instruction doesn't provide level information - that's application-specific
                    const indentLevel = 0; // TODO: implement nesting level tracking if needed

                    this.dropIndicator.show(targetElement, edge, indentLevel);
                } else {
                    this.dropIndicator.hide();
                }
            },
            onDropTargetChange: ({location}) => {
                console.log('[DragDropManager] Drop targets changed:', location.current.dropTargets);
            },
            onDrop: ({source, location}) => {
                // Hide the indicator after the drop has been completed
                this._setActiveDropTarget(null);
                this.dropIndicator.hide();

                const draggablePayloadData = source.data as DraggablePayloadData;

                if (location.current.dropTargets.length === 0) {
                    console.log('[DragDropManager] No drop targets - ignoring drop');
                    this.eventBus.dispatchEvent<DropIgnored>('block-drop-ignored', {
                        blockType: draggablePayloadData.blockType,
                        sourceId: draggablePayloadData.sourceId,
                        sourceType: draggablePayloadData.sourceType,
                    });
                    return;
                }
                const sourceElement = source.element as HTMLElement;
                const validTarget = location.current.dropTargets.find((target) => {
                    const targetElement = target.element as HTMLElement;
                    return !this._isTargetDescendantOfSource(sourceElement, targetElement);
                });

                if (!validTarget) {
                    console.warn('[DragDropManager] Drop rejected: Cannot drop a block inside itself or its descendants');
                    return;
                }

                // Get the most specific (innermost) valid drop target
                const targetElement = validTarget.element as HTMLElement;
                const dropTargetPayloadData = validTarget.data as DropTargetPayloadData;

                // Extract instruction from the list-item pattern
                const instruction = extractInstruction(dropTargetPayloadData);

                // Convert instruction to DropInstruction type for events
                // Instruction only has operation and blocked properties per Atlassian docs
                const dropInstruction: DropInstruction | undefined = instruction ? {
                    operation: instruction.operation,
                    blocked: instruction.blocked,
                } : undefined;

                const detail: BlockDroppedEvent = {
                    blockType: draggablePayloadData.blockType,
                    sourceId: draggablePayloadData.sourceId,
                    sourceType: draggablePayloadData.sourceType,
                    targetCanvasId: dropTargetPayloadData.canvasId,
                    targetBlockId: dropTargetPayloadData.targetBlockId,
                    targetBlockType: dropTargetPayloadData.targetBlockType,
                    targetIsContainer: dropTargetPayloadData.type === DropTargetType.CONTAINER,
                    instruction: dropInstruction,
                }

                console.log('[DragDropManager] onDrop', {
                    mostSpecificTarget: validTarget,
                    draggablePayloadData,
                    sourceElement,
                    targetElement,
                    dropTargetPayloadData,
                    instruction,
                });

                if (draggablePayloadData.sourceType === DraggableSourceType.SOURCE_ZONE) {
                    this.eventBus.dispatchEvent<BlockCreated>('block-created', detail);
                } else {
                    this.eventBus.dispatchEvent<BlockReorderedDetail>('block-reordered', {
                        ...detail,
                        blockId: draggablePayloadData.blockId!
                    })
                }
            }
        });
    }

    /**
     * Check if a target element is a descendant of the dragged element
     * This prevents dropping a block inside itself or its children
     */
    private _isTargetDescendantOfSource(sourceElement: HTMLElement, targetElement: HTMLElement): boolean {
        // Get the block ID from source
        const sourceBlockId = sourceElement.getAttribute('block-id');
        if (!sourceBlockId) return false;

        // Walk up the DOM tree from target to check if source is an ancestor
        let current: HTMLElement | null = targetElement;
        while (current) {
            const currentBlockId = current.getAttribute('block-id');
            if (currentBlockId === sourceBlockId) {
                // Target is inside the source - this is invalid
                return true;
            }

            // Move up to parent, but stop at shadow DOM boundaries
            if (current.parentElement) {
                current = current.parentElement;
            } else if (current.getRootNode && (current.getRootNode() as any).host) {
                // Cross-shadow DOM boundary
                current = (current.getRootNode() as any).host;
            } else {
                break;
            }
        }

        return false;
    }

    private _setActiveDropTarget(
        targetElement: HTMLElement | null,
        payload?: DropTargetPayloadData,
        instruction?: DropInstruction
    ): void {
        if (this.activeDropTargetElement === targetElement) {
            return;
        }

        if (this.activeDropTargetElement) {
            this.eventBus.dispatchEvent<DropTargetHoverDetail>('drop-target-hover', {
                active: false,
                targetElement: this.activeDropTargetElement,
            });
        }

        this.activeDropTargetElement = targetElement;

        if (targetElement) {
            this.eventBus.dispatchEvent<DropTargetHoverDetail>('drop-target-hover', {
                active: true,
                targetElement,
                targetCanvasId: payload?.canvasId,
                targetBlockId: payload?.targetBlockId,
                targetBlockType: payload?.targetBlockType,
                targetIsContainer: payload?.type === DropTargetType.CONTAINER,
                instruction,
            });
        }
    }

    /**
     * Setup auto-scroll for drag operations
     */
    private _setupAutoScroll(): void {
        this.autoScrollCleanup = autoScrollForElements({
            element: this.autoScrollElement!,
            canScroll: ({element}) => {
                // Allow scrolling on scrollable containers
                return element.scrollHeight > element.clientHeight ||
                    element.scrollWidth > element.clientWidth;
            },
            getConfiguration: () => ({
                maxScrollSpeed: this.autoScrollConfig.maxScrollSpeed,
            }),
        });

        this.autoScrollInitialized = true;
    }
}
