import type { BlockData } from "./types";
import type { BlockInterface } from "@/common/blocks/types";

export interface BlockCreatedDetail {
    block: BlockData;
}

export interface BlockUpdatedDetail {
    block: BlockData;
}

export interface BlockDeletedDetail {
    blockId: string;
}

export interface BlockMovedDetail {
    block: BlockData;
    oldParentId: string | undefined;
    newParentId: string;
    newIndex: number;
}

export interface BlockSelectionChangedDetail {
    selectedId: string | null;
    selectedBlock?: BlockData;
}

export interface BlockChangeDetail {
    action: 'create' | 'update' | 'delete' | 'move' | 'reorder' | 'duplicate' | 'load';
    block?: BlockData;
    /** Whether the change affected style-related properties (styles) */
    styleChanged?: boolean;
}

export interface BlockElementRegisteredDetail {
    blockId: string;
    element: BlockInterface;
}
