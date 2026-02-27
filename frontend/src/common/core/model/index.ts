import { createContext } from "@lit/context";
import { DocumentModel } from './document-model';

export { DocumentModel } from './document-model';
export type { ResolvedEntityInfo } from './document-model';
export type {
    BlockData,
    BlockActionsConfig,
    BlockEntityConfig,
    BlockStyleTargetData,
    BlockStyles,
    BlockPosition,
    BlockSize,
    DocumentBlocks,
    DocumentSlot,
    DocumentSlots,
    ActionConfig,
    ActionSlot,
    EntitySlot,
    ActionTrigger,
    EntityConfigMode,
} from './types';
export type {
    BlockCreatedDetail,
    BlockUpdatedDetail,
    BlockDeletedDetail,
    BlockMovedDetail,
    BlockSelectionChangedDetail,
    BlockChangeDetail,
    BlockElementRegisteredDetail,
} from './events';

export const documentModelContext = createContext<DocumentModel>('document-model');
