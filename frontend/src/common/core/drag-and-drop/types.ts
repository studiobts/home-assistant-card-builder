/**
 * The DropElement interface represents an object that encapsulates information and functionality related to
 * a specific drop item in a user interface. It provides access to the identifier of the drop element
 * and the associated HTML element.
 *
 * Properties:
 * - `dropId` (string): A unique identifier for the drop element. This is a read-only property.
 * - `dropElement` (HTMLElement): Reference to the actual HTML element associated with the drop.
 *   This is also a read-only property.
 */
export interface DropElement {
    get dropId(): string;

    get dropElement(): HTMLElement;

    shouldShowDropIndicator(): boolean;
}

/**
 * Interface representing a drag source element in a drag-and-drop system.
 */
export interface DragSourceElement {
    get sourceId(): string;

    get sourceElement(): HTMLElement;

    get sourceAllowedBlockTypes(): string[] | null;
}

/**
 * Enum representing the types of draggable sources.
 *
 * This enum is used to identify the different origin types of draggable items
 * within the application. It helps in differentiating the source of a drag-and-drop
 * operation.
 *
 * CANVAS - Represents a draggable source originating from the canvas area.
 * SOURCE_ZONE - Represents a draggable source originating from the source zone area.
 */
export enum DraggableSourceType {
    CANVAS = 'canvas',
    SOURCE_ZONE = 'source-zone',
}

/**
 * Interface representing the payload data used during drag operations.
 */
export interface DraggablePayloadData extends Record<string, unknown> {
    sourceType: DraggableSourceType;
    /** ID of the source zone where drag originated */
    sourceId: string;
    /** Type of block being dragged */
    blockType: string;
    /** Block ID if dragging an existing block (for reordering/moving) */
    blockId?: string;
}

/**
 * Enumeration representing the types of drop targets available.
 * This is used to specify the target element where an item
 * has been dropped during a drag-and-drop operation.
 *
 * - CANVAS: Represents the entire canvas area as a drop target.
 * - CONTAINER: Represents a specific container within the canvas.
 * - BLOCK: Represents an individual block within a container.
 */
export enum DropTargetType {
    CANVAS = 'canvas',
    CONTAINER = 'container',
    BLOCK = 'block',
}

/**
 * Represents the payload data for a drop target in a drag-and-drop operation.
 * Provides detailed information about the drop target.
 */
export interface DropTargetPayloadData extends Record<string | symbol, unknown> {
    /** Unique identifier for drop target type */
    type: DropTargetType;
    /** ID of the canvas where drop occurred */
    canvasId: string;
    /** Block ID if drop target is a container/block */
    targetBlockId?: string;
    /** Type of block if drop target is a container/block **/
    targetBlockType?: string;
}

/**
 * Enum representing reasons why a drag/drop operation is restricted.
 */
export enum RestrictionReason {
    /** Source zone is not allowed to drop in target canvas */
    SOURCE_NOT_ALLOWED = 'source_not_allowed',
    /** Block type is not allowed in target canvas */
    BLOCK_TYPE_NOT_ALLOWED = 'block_type_not_allowed',
    /** Container refuses to accept this block type */
    CONTAINER_REFUSES = 'container_refuses',
    /** Block is bound to original parent and cannot be moved */
    BOUND_BLOCK_LOCKED = 'bound_block_locked',
    /** Cross-canvas transfer is not allowed */
    TRANSFER_NOT_ALLOWED = 'transfer_not_allowed',
}

/**
 * Result of a restriction check
 */
export interface RestrictionCheckResult {
    /** Whether operation is allowed */
    allowed: boolean;
    /** Reason if not allowed */
    reason?: RestrictionReason;
    /** Human-readable message explaining the restriction */
    message?: string;
}

/**
 * Rule for cross-canvas transfers
 */
export interface TransferRule {
    /** Source canvas ID */
    sourceCanvasId: string;
    /** Target canvas ID */
    targetCanvasId: string;
    /** Optional: restrict which block types can be transferred */
    allowedBlockTypes?: string[];
    /** If true, transfer is also allowed in reverse direction */
    bidirectional?: boolean;
}

/**
 * Auto-scroll configuration
 */
export interface AutoScrollConfig {
    maxScrollSpeed: "standard" | "fast";
    startEdgeThreshold: number;
}

/**
 * Restriction configuration (all optional - defaults to allow-all)
 */
export interface RestrictionConfig {
    /** Map of canvas ID to allowed source zone IDs */
    sourceAllowlist?: Map<string, Set<string>>;
    /** Map of canvas ID to allowed block types */
    blockTypeRestrictions?: Map<string, Set<string>>;
    /** Map of container type to accepted block types */
    containerAcceptance?: Map<string, Set<string>>;
    /** Set of block IDs that are bound and cannot be moved */
    boundBlocks?: Set<string>;
}

/**
 * Edge position for drop indicator (legacy, kept for compatibility)
 */
export type DropEdge = 'top' | 'bottom' | 'left' | 'right';

/**
 * Drop instruction from list-item pattern (matches Atlassian Instruction type)
 */
export interface DropInstruction {
    /** Type of drop operation */
    operation: 'reorder-before' | 'reorder-after' | 'combine';
    /** Whether this operation was blocked */
    blocked: boolean;
}

export interface DraggableEvent {
    /** Type of block dragging */
    blockType: string;
    /** Origin source type of block dragging */
    sourceType: DraggableSourceType;
    /** Source ID where block came from */
    sourceId: string;
}

export interface DropIgnored extends DraggableEvent {}

/**
 * Base interface representing the event data when a block is dropped.
 */
export interface BlockDroppedEvent extends DraggableEvent {
    /** Target canvas ID where block was dropped */
    targetCanvasId: string;
    /** Target block ID if dropped into container/block */
    targetBlockId?: string;
    /** Target block type if dropped into container/block */
    targetBlockType?: string;
    /** Whether target is a container */
    targetIsContainer?: boolean;
    /** Drop instruction metadata from list-item pattern */
    instruction?: DropInstruction;
}

/**
 * Event detail for block-dropped from source-zone
 */
export interface BlockCreated extends BlockDroppedEvent {}

/**
 * Event detail for block-reordered event inside a canvas
 */
export interface BlockReorderedDetail extends BlockDroppedEvent {
    /** Block ID that was reordered */
    blockId: string;
}

/**
 * Event detail for drop target hover state
 */
export interface DropTargetHoverDetail {
    /** Whether the target is currently active */
    active: boolean;
    /** The hovered drop target element */
    targetElement: HTMLElement | null;
    /** Target canvas ID */
    targetCanvasId?: string;
    /** Target block ID if applicable */
    targetBlockId?: string;
    /** Target block type if applicable */
    targetBlockType?: string;
    /** Whether target is a container */
    targetIsContainer?: boolean;
    /** Drop instruction metadata from list-item pattern */
    instruction?: DropInstruction;
}

export interface BlockDraggingEvent extends DraggableEvent {
    /** Block ID being dragged */
    blockId: string;
    /** Canvas ID where the block is located */
    canvasId: string;
}

/**
 * Event detail for drag generate preview event
 */
export interface BlockDragOnGeneratePreviewDetail extends DraggableEvent {
    /** Block ID being dragged */
    blockId?: string;
}

/**
 * Event detail for drag-started event
 */
export interface BlockDragStartedDetail extends BlockDraggingEvent {}

/**
 * Event detail for block-rejected event
 */
export interface BlockRejectedDetail {
    /** Block type that was rejected */
    blockType: string;
    /** Block ID if applicable */
    blockId?: string;
    /** Source zone ID */
    sourceZoneId: string;
    /** Reason for rejection */
    reason: RestrictionReason;
    /** Human-readable message */
    message: string;
    /** Element that was rejected (for visual feedback) */
    element: HTMLElement;
}
