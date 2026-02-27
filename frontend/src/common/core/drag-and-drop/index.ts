/**
 * Drag and Drop Manager
 *
 * Public API exports for the drag-and-drop system.
 */

export { DragDropManager } from './drag-drop-manager';
export { dragDropManagerContext, DragDropBlock } from './drag-drop-block';

export type {
    DropElement,
    DragSourceElement,
    DraggablePayloadData,
    DropTargetPayloadData,
    TransferRule,
    AutoScrollConfig,
    RestrictionConfig,
    DropEdge,
    DropInstruction,
    BlockCreated,
    BlockReorderedDetail,
    DropTargetHoverDetail,
    BlockDragOnGeneratePreviewDetail,
    BlockDragStartedDetail,
    BlockRejectedDetail,
} from './types';

export { RestrictionReason } from './types';

export {
    DRAGGABLE_ATTRIBUTE,
    DRAGGABLE_SELECTOR,
    DROP_TARGET_ATTRIBUTE,
    DROP_TARGET_SELECTOR,
} from './constants';
