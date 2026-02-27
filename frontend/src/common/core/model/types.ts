import type { ContainerStyleData } from '@/common/types/style-preset';
import type { ActionConfig as HaActionConfig, BaseActionConfig } from 'custom-card-helpers';
import type { HassServiceTarget } from 'home-assistant-js-websocket';

export const DOCUMENT_MODEL_VERSION = 3;

export type BlockLayoutMode = 'absolute' | 'flow' | 'static';

// =============================================================================
// Link Editor Runtime Types
// =============================================================================

export type LinkEditorMode = 'idle' | 'draw' | 'edit' | 'pick-anchor';

export interface LinkModeState {
    enabled: boolean;
    mode: LinkEditorMode;
    activeLinkId: string | null;
    anchorPickPointId?: string | null;
}

export interface LinkEditorSelection {
    blockId: string | null;
    pointId: string | null;
    segmentIndex: number | null;
    handle?: 'in' | 'out' | null;
}

export interface LinkAnchorHighlight {
    blockId: string | null;
}

// =============================================================================
// Entity Configuration Types
// =============================================================================

/**
 * Entity configuration mode:
 * - 'inherited': entity ereditata dal parent più vicino che ne ha una
 * - 'slot': entity configurabile a runtime tramite slot ID
 * - 'fixed': entity fissa, specificata direttamente nel blocco
 */
export type EntityConfigMode = 'inherited' | 'slot' | 'fixed';

/**
 * Entity configuration for a block.
 * Allows blocks to have a default entity that can be used for style bindings
 * and reactive behavior. Supports inheritance from parent blocks (CSS-like).
 */
export interface BlockEntityConfig {
    /** Configuration mode */
    mode: EntityConfigMode;
    /** Entity ID when mode is 'fixed' */
    entityId?: string;
    /** Slot ID when mode is 'slot' */
    slotId?: string;
}

// =============================================================================
// Actions Configuration Types
// =============================================================================

export type ActionTrigger = 'tap' | 'double_tap' | 'hold';

export interface PerformActionConfig extends BaseActionConfig {
    action: 'perform-action';
    perform_action: string;
    data?: Record<string, unknown>;
    target?: HassServiceTarget;
    /** @deprecated legacy service fields (read only) */
    service?: string;
    /** @deprecated legacy service fields (read only) */
    service_data?: Record<string, unknown>;
}

export type ActionConfig = HaActionConfig | PerformActionConfig;

export interface BlockActionsConfig {
    targets: Record<string, string[]>;
}

export interface BlockPosition {
    x: number;
    y: number;
}

export interface BlockSize {
    width: number;
    height: number;
}

export interface BlockProps {
    [key: string]: unknown;
}

export interface BlockStyleTargetData {
    /** Applied style preset ID */
    stylePresetId?: string;
    /** Container-specific style overrides */
    containers?: { [containerId: string]: ContainerStyleData };
}

export type BlockStyles = Record<string, BlockStyleTargetData>;

export interface BlockData {
    id: string;
    type: string;
    /** Optional user-defined label for display */
    label?: string;
    // Tree-Structure
    parentId: string | null;
    children: string[];
    // Management
    canBeDeleted?: boolean;
    canBeDuplicated?: boolean;
    canChangeLayoutMode?: boolean;
    isHidden?: boolean;
    requireEntity?: boolean;
    parentManaged: boolean;
    // Layout and Positioning
    layout: BlockLayoutMode;
    order: number;
    zIndex: number; // FIXME: this must be removed and placed inside styles for the block target!
    // Style System
    /** Style configuration per target (default target is "block") */
    styles?: BlockStyles;
    // Entity Configuration
    /** Entity configuration for this block (default entity for bindings and reactive behavior) */
    entityConfig?: BlockEntityConfig;
    /** Actions configuration */
    actions?: BlockActionsConfig;
    // Custom Properties
    props: BlockProps;
    // Helper Properties
    tree?: BlockData[];
}

export interface DocumentBlocks {
    [id: string]: BlockData;
}

export interface EntitySlot {
    id: string;
    name?: string;
    description?: string;
    entityId?: string;
    domains?: string[];
}

export interface ActionSlot {
    id: string;
    name?: string;
    description?: string;
    trigger: ActionTrigger;
    action: ActionConfig;
}

export type DocumentSlot = EntitySlot;

export interface DocumentSlots {
    entities: Record<string, EntitySlot>;
    actions: Record<string, ActionSlot>;
}

export interface DocumentData {
    version: number;
    rootId: string;
    slots: DocumentSlots;
    blocks: DocumentBlocks;
}
