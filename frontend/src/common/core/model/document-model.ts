import type { TraitPropertyValue } from '@/common/blocks/core/properties';
import type { BlockInterface } from "@/common/blocks/types";
import { extractEntitiesFromBinding, extractEntitiesFromBindings, type ValueBinding } from '@/common/core/binding';
import type { ContainerStyleData, StylePropertyValue } from "@/common/types";
import type {
    BlockChangeDetail,
    BlockCreatedDetail,
    BlockDeletedDetail,
    BlockMovedDetail,
    BlockSelectionChangedDetail,
    BlockUpdatedDetail
} from './events'
import {
    type BlockData,
    type BlockEntityConfig,
    type BlockLayoutMode,
    type BlockPosition,
    type BlockProps,
    type BlockSize,
    type BlockStyles,
    DOCUMENT_MODEL_VERSION,
    type DocumentBlocks,
    type DocumentData,
    type DocumentSlot,
    type DocumentSlots,
    type EntitySlot,
    type ActionSlot,
    type LinkModeState,
    type LinkEditorSelection,
} from './types';

type StylePropertyValueWithAnimation = StylePropertyValue & {
    animation?: { binding?: ValueBinding };
};

/**
 * Result of entity resolution with inheritance info
 */
export interface ResolvedEntityInfo {
    /** Resolved entity ID (undefined if none found) */
    entityId: string | undefined;
    /** Source of the entity */
    source: 'fixed' | 'slot' | 'inherited' | 'none';
    /** Block ID from which entity was inherited (if source is 'inherited') */
    inheritedFromId?: string;
    /** Display name for the inherited block (label or type) */
    inheritedFromDisplayName?: string;
    /** Block type from which entity was inherited */
    inheritedFromType?: string;
    /** Slot ID if mode is 'slot' */
    slotId?: string;
}

export type SlotReferenceKind =
    | 'block-entity'
    | 'style-binding'
    | 'style-animation'
    | 'trait-binding'
    | 'trait-slot'
    | 'action-slot';

export interface SlotReference {
    blockId: string;
    kind: SlotReferenceKind;
    category?: string;
    property?: string;
    styleTargetId?: string;
    propName?: string;
    actionTrigger?: string;
}

export interface SlotOperationResult {
    success: boolean;
    error?: string;
    slot?: EntitySlot | ActionSlot;
}

// FIXME: remove event target from DocumentData and use EventBus
export class DocumentModel extends EventTarget implements DocumentData {
    version: number = DOCUMENT_MODEL_VERSION;
    rootId: string = 'root';
    slots: DocumentSlots = {entities: {}, actions: {}};
    blocks: DocumentBlocks = {};

    // Runtime-only: data
    selectedId: string | null = null;
    selectedStyleTargetId: string | null = null;
    linkModeState: LinkModeState = {enabled: false, mode: 'idle', activeLinkId: null};
    linkEditorSelection: LinkEditorSelection = {blockId: null, pointId: null, segmentIndex: null, handle: null};
    linkAnchorHighlight: {blockId: string | null} = {blockId: null};
    linkGridColor: string = '#000000';
    // Runtime-only: element registry (not serialized)
    private _elementRegistry = new Map<string, BlockInterface>();

    constructor() {
        super();
        this._reset();
        this._initialize();
    }

    createBlock(
        type: string,
        parentId = 'root',
        defaults: {
            canBeDeleted?: boolean;
            canBeDuplicated?: boolean;
            canChangeLayoutMode?: boolean;
            isHidden?: boolean;
            requireEntity?: boolean;
            props?: BlockProps;
            entityConfig?: BlockEntityConfig;
        } = {},
        options: {
            label?: string;
            layout?: BlockLayoutMode;
            position?: BlockPosition;
            size?: BlockSize;
            props?: BlockProps;
            styles?: BlockStyles;
            parentManaged?: boolean;
            canBeDeleted?: boolean;
            canBeDuplicated?: boolean;
            canChangeLayoutMode?: boolean;
            isHidden?: boolean;
            requireEntity?: boolean;
            entityConfig?: BlockEntityConfig;
        } = {},
        insertIndex?: number
    ): BlockData {
        const id = `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const parent = this.blocks[parentId];
        const layout = options.layout || 'flow';

        // Determine entity config: options override defaults, fallback to inherited mode
        const entityConfig: BlockEntityConfig = options.entityConfig
            || defaults.entityConfig
            || {mode: 'inherited'};

        const block: BlockData = {
            id,
            type,
            parentId,
            canBeDeleted: options.canBeDeleted ?? defaults.canBeDeleted,
            canBeDuplicated: options.canBeDuplicated ?? defaults.canBeDuplicated,
            canChangeLayoutMode: options.canChangeLayoutMode ?? defaults.canChangeLayoutMode,
            isHidden: options.isHidden ?? defaults.isHidden,
            requireEntity: options.requireEntity ?? defaults.requireEntity,
            parentManaged: options.parentManaged || false,
            label: options.label || undefined,
            layout,
            children: [],
            props: {...(defaults.props || {}), ...(options.props || {})},
            order: insertIndex ? insertIndex : 0,
            styles: options.styles,
            zIndex: Object.keys(this.blocks).length,
            entityConfig,
        };

        // FIXME: we have to register an undefined element into the _elementRegistry?

        this.blocks[id] = block;

        if (insertIndex !== undefined) {
            parent.children.splice(insertIndex, 0, id)
            parent.children.forEach((child, index) => {
                this.blocks[child].order = index
            });
        } else {
            parent.children.push(id);
        }

        this.blocks = {
            ...this.blocks,
            [id]: block
        };

        this._emit<BlockCreatedDetail>('block-created', {block: block});
        this._emit<BlockChangeDetail>('change', {action: 'create', block: block});

        return block;
    }

    updateBlock(id: string, updates: Partial<BlockData>): void {
        const originalBlock = this.blocks[id];
        if (!originalBlock) return;

        const block: BlockData = {...originalBlock};

        // Track if style-related changes occurred
        const styleChanged =
            'styles' in updates ||
            'layout' in updates;

        if (updates.props) {
            block.props = {...block.props, ...updates.props};
            delete updates.props;
        }
        if ('styles' in updates) {
            block.styles = updates.styles;
            delete updates.styles;
        }

        Object.assign(block, updates);

        this.blocks = {
            ...this.blocks,
            [id]: block
        };

        this._emit<BlockChangeDetail>('change', {action: 'update', block: block, styleChanged});
        this._emit<BlockUpdatedDetail>('block-updated', {block: block});
    }

    updateBlockId(id: string, nextId: string): { success: boolean; error?: string } {
        const parsedId = nextId
            .trim()
            .toLowerCase()
            .replaceAll(' ', '-');

        if (!parsedId) {
            return {success: false, error: 'ID cannot be empty'};
        }

        if (parsedId === id) {
            return {success: true};
        }

        if (id === this.rootId) {
            return {success: false, error: 'Root block ID cannot be changed'};
        }

        if (this.blocks[parsedId]) {
            return {success: false, error: 'ID already exists'};
        }

        const originalBlock = this.blocks[id];
        if (!originalBlock) {
            return {success: false, error: 'Block not found'};
        }

        const updatedBlocks: DocumentBlocks = {...this.blocks};
        const updatedBlock: BlockData = {...originalBlock, id: parsedId};

        delete updatedBlocks[id];
        updatedBlocks[parsedId] = updatedBlock;

        const affectedBlocks = new Set<string>([parsedId]);

        Object.values(updatedBlocks).forEach((currentBlock) => {
            let nextBlock = currentBlock;
            let changed = false;

            if (nextBlock.parentId === id) {
                nextBlock = {...nextBlock, parentId: parsedId};
                changed = true;
            }

            if (nextBlock.children?.includes(id)) {
                const updatedChildren = nextBlock.children.map((childId) =>
                    childId === id ? parsedId : childId
                );
                nextBlock = {...nextBlock, children: updatedChildren};
                changed = true;
            }

            if (changed) {
                updatedBlocks[nextBlock.id] = nextBlock;
                affectedBlocks.add(nextBlock.id);
            }
        });

        this.blocks = updatedBlocks;

        const wasSelected = this.selectedId === id;
        if (wasSelected) {
            this.select(parsedId);
        }

        this._emit<BlockChangeDetail>('change', {action: 'update', block: updatedBlock});
        affectedBlocks.forEach((blockId) => {
            this._emit<BlockUpdatedDetail>('block-updated', {block: updatedBlocks[blockId]});
        });

        return {success: true};
    }

    deleteBlock(id: string, force: boolean = false): void {
        const block = this.blocks[id];
        if (!block || id === 'root') return;

        // Prevent deletion of parent-managed blocks
        if (!this.canDeleteBlock(id) && !force) {
            console.warn(`Cannot delete parent-managed block: ${id}`);
            return;
        }

        const parent = this.blocks[block.parentId!];
        if (parent && parent.children) {
            parent.children = parent.children.filter((childId) => childId !== id);
        }

        if (block.children) {
            [...block.children].forEach((childId) => this.deleteBlock(childId));
        }

        delete this.blocks[id];

        if (this.selectedId === id) {
            this.selectedId = null;
            this._emit<BlockSelectionChangedDetail>('selection-changed', {
                selectedId: null
            });
        }

        this._emit<BlockDeletedDetail>('block-deleted', {blockId: id});
        this._emit<BlockChangeDetail>('change', {action: 'delete', block: block});
    }

    moveBlock(id: string, targetParentId: string, targetParentIndex: number): void {
        const block = this.blocks[id];
        const sourceParent = this.blocks[block.parentId!];
        const targetParent = this.blocks[targetParentId];

        if (!block || !targetParent || !targetParent.children) return;

        let adjustedIndex = targetParentIndex;
        const isSameParent = sourceParent?.id === targetParentId;

        if (isSameParent && sourceParent?.children) {
            const sourceIndex = sourceParent.children.indexOf(id);
            if (sourceIndex !== -1 && sourceIndex < adjustedIndex) {
                adjustedIndex -= 1;
            }
        }

        if (sourceParent && sourceParent.children) {
            // Remove from source parent
            sourceParent.children = sourceParent.children.filter((childId) => childId !== id);
        }

        // Clamp index after removal
        const maxIndex = targetParent.children.length;
        if (adjustedIndex < 0) adjustedIndex = 0;
        if (adjustedIndex > maxIndex) adjustedIndex = maxIndex;

        // Set the new parent and insert at target index
        block.parentId = targetParentId;
        targetParent.children.splice(adjustedIndex, 0, id);
        targetParent.children.forEach((childId, index) => {
            this.blocks[childId].order = index;
        });

        this._emit<BlockMovedDetail>('block-moved', {
            block: block,
            oldParentId: sourceParent?.id,
            newParentId: targetParentId,
            newIndex: adjustedIndex,
        });
        this._emit<BlockChangeDetail>('change', {action: 'move', block: block});
    }

    select(id: string | null): void {
        this.selectedId = id;
        this.selectedStyleTargetId = null;
        this._emit<BlockSelectionChangedDetail>('selection-changed', {
            selectedId: id,
            selectedBlock: id ? this.blocks[id] : undefined,
        });
        this._emit('style-target-changed', {
            selectedId: id,
            targetId: null,
        });
    }

    getSelected(): BlockData | null {
        return this.selectedId ? this.blocks[this.selectedId] : null;
    }

    selectStyleTarget(targetId: string | null): void {
        if (this.selectedStyleTargetId === targetId) return;
        this.selectedStyleTargetId = targetId;
        this._emit('style-target-changed', {
            selectedId: this.selectedId,
            targetId,
        });
    }

    getSelectedStyleTargetId(): string | null {
        return this.selectedStyleTargetId;
    }

    // =========================================================================
    // Link Editor Runtime State
    // =========================================================================

    getLinkModeState(): LinkModeState {
        return this.linkModeState;
    }

    setLinkModeState(next: Partial<LinkModeState>): void {
        this.linkModeState = {
            ...this.linkModeState,
            ...next,
        };
        this._emit('link-mode-changed', {state: this.linkModeState});
    }

    getLinkEditorSelection(): LinkEditorSelection {
        return this.linkEditorSelection;
    }

    setLinkEditorSelection(next: Partial<LinkEditorSelection>): void {
        this.linkEditorSelection = {
            ...this.linkEditorSelection,
            ...next,
        };
        this._emit('link-editor-selection-changed', {selection: this.linkEditorSelection});
    }

    getLinkAnchorHighlight(): {blockId: string | null} {
        return this.linkAnchorHighlight;
    }

    setLinkAnchorHighlight(blockId: string | null): void {
        if (this.linkAnchorHighlight.blockId === blockId) return;
        this.linkAnchorHighlight = {blockId};
        this._emit('link-anchor-highlight-changed', {blockId});
    }

    getLinkGridColor(): string {
        return this.linkGridColor;
    }

    setLinkGridColor(color: string): void {
        if (this.linkGridColor === color) return;
        this.linkGridColor = color;
        this._emit('link-grid-color-changed', {color});
    }

    canDeleteBlock(id: string): boolean {
        const block = this.blocks[id];
        if (!block || id === 'root') return false;
        return block.canBeDeleted ?? true;
    }

    canDuplicateBlock(id: string): boolean {
        const block = this.blocks[id];
        return block.canBeDuplicated ?? true;
    }

    canChangeLayoutMode(id: string): boolean {
        const block = this.blocks[id];
        return block.canChangeLayoutMode ?? true;
    }

    isHidden(id: string): boolean {
        const block = this.blocks[id];
        return block.isHidden === true;
    }

    isEntityRequired(id: string): boolean {
        const block = this.blocks[id];
        return block.requireEntity ?? false;
    }

    duplicateBlock(id: string): BlockData | null {
        const originalBlock = this.blocks[id];
        if (!originalBlock || !this.canDuplicateBlock(id)) {
            console.warn(`Cannot duplicate block: ${id}`);
            return null;
        }

        const parent = this.blocks[originalBlock.parentId!];
        if (!parent || !parent.children) return null;

        // Find the index of the original block in parent's children
        const originalIndex = parent.children.indexOf(id);
        if (originalIndex === -1) return null;

        // Clone the block with a new ID
        const newId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const duplicatedBlock: BlockData = {
            ...originalBlock,
            id: newId,
            order: originalIndex + 1,
            children: [],
        };

        // Add to blocks
        this.blocks = {
            ...this.blocks,
            [newId]: duplicatedBlock
        };

        // Insert after the original block
        parent.children.splice(originalIndex + 1, 0, newId);

        // Update order for all siblings after insertion
        parent.children.forEach((childId, index) => {
            this.blocks[childId].order = index;
        });

        // Recursively duplicate children if any
        if (originalBlock.children && originalBlock.children.length > 0) {
            originalBlock.children.forEach((childId) => {
                const childBlock = this.blocks[childId];
                if (childBlock) {
                    this._duplicateBlockRecursive(childId, newId);
                }
            });
        }

        this._emit<BlockCreatedDetail>('block-created', {block: duplicatedBlock});
        this._emit<BlockChangeDetail>('change', {action: 'duplicate', block: duplicatedBlock});

        // Select the duplicated block
        this.select(newId);

        return duplicatedBlock;
    }

    getBlock(id: string): BlockData | undefined {
        return this.blocks[id];
    }

    getChildren(parentId: string): BlockData[] {
        const parent = this.blocks[parentId];
        if (!parent || !parent.children) return [];
        return parent.children
            .map((id) => this.blocks[id])
            .filter(Boolean)
            .sort((a, b) => a.order - b.order);
    }

    getBlockLabel(blockOrId: string | BlockData): string | undefined {
        const block = typeof blockOrId === 'string' ? this.blocks[blockOrId] : blockOrId;
        const label = block?.label?.trim();
        return label || undefined;
    }

    getBlockDisplayName(blockOrId: string | BlockData, fallback?: string): string {
        const block = typeof blockOrId === 'string' ? this.blocks[blockOrId] : blockOrId;
        if (!block) {
            return fallback || '';
        }

        return this.getBlockLabel(block) || fallback || block.type;
    }

    /**
     * Resolve entity for a block, following inheritance chain if needed.
     *
     * When mode is 'static', returns the entity configured on the block.
     * When mode is 'inherited' (or no config), walks up the parent chain
     * to find the nearest parent with a static entity.
     *
     * @param blockId - The block ID to resolve entity for
     * @returns Resolved entity info with source information
     */
    resolveEntityForBlock(blockId: string): ResolvedEntityInfo {
        const block = this.blocks[blockId];
        if (!block) {
            return {entityId: undefined, source: 'none'};
        }

        const entityConfig = block.entityConfig;

        // No config = default to inherited behavior
        if (!entityConfig) {
            return this._resolveInheritedEntity(block);
        }

        // Fixed mode: return configured entity
        if (entityConfig.mode === 'fixed') {
            return {
                entityId: entityConfig.entityId,
                source: 'fixed',
            };
        }

        // Slot mode: resolve from slot
        if (entityConfig.mode === 'slot') {
            const slotId = entityConfig.slotId;
            const slotEntityId = slotId ? this.resolveSlotEntity(slotId) : undefined;
            return {
                entityId: slotEntityId,
                source: 'slot',
                slotId,
            };
        }

        // Inherited mode: walk up parent chain
        return this._resolveInheritedEntity(block);
    }

    resolveSlotEntity(slotId: string): string | undefined {
        return this.slots.entities[slotId]?.entityId;
    }

    resolveSlotAction(slotId: string): ActionSlot | undefined {
        return this.slots.actions[slotId];
    }

    /**
     * Get entities required by this specific block type.
     *
     * Default implementation checks entityConfig for static entities.
     * Override in subclasses to provide block-specific entities
     * (e.g., SVG binding blocks that use multiple entities).
     *
     * Note: For blocks with mode='inherited', entities are resolved at runtime
     * via DocumentModel.resolveEntityForBlock() - they are not returned here
     * since the actual entity depends on the parent chain.
     *
     * @returns Array of entity IDs required by the block
     */
    getBlockEntities(block: BlockData | undefined): string[] {
        if (!block) return [];

        const element = this.getElement(block.id);
        const entities = element?.getBlockEntities?.();
        if (entities !== undefined) {
            return entities;
        }
        // Check entityConfig for fixed or slot entity
        if (block.entityConfig?.mode === 'fixed' || block.entityConfig?.mode === 'slot') {
            const resolvedEntity = this.resolveEntityForBlock(block.id).entityId;
            return resolvedEntity ? [resolvedEntity] : [];
        }
        // For inherited mode or no config, entity comes from parent at runtime
        // Return empty - DocumentModel.resolveEntityForBlock() handles resolution
        // TODO: this must be empty or must return inherited entity ID?
        return [];
    }

    // =========================================================================
    // Entity Resolution
    // =========================================================================

    /**
     * Extract entities from style bindings across all containers and targets
     * Walks through block.styles for all targets/containers/categories/properties
     *
     * @returns Array of unique entity IDs used in style bindings
     */
    getStyleBindingEntities(block: BlockData | undefined): string[] {
        if (!block) return [];

        const entities = new Set<string>();

        if (block.styles) {
            for (const target of Object.values(block.styles)) {
                if (!target?.containers) continue;

                // Iterate all containers
                for (const containerStyles of Object.values(target.containers)) {
                    if (!containerStyles) continue;

                    // Iterate all categories (typography, spacing, etc.)
                    for (const categoryData of Object.values(containerStyles)) {
                        if (!categoryData) continue;

                        // Iterate all properties
                        for (const propValue of Object.values(categoryData)) {
                            if (!propValue || typeof propValue !== 'object') continue;

                            const typedPropValue = propValue as { binding?: unknown; animation?: { binding?: unknown } };
                            if (typedPropValue.binding) {
                                const bindingEntities = extractEntitiesFromBinding(typedPropValue.binding, block, this);
                                bindingEntities.forEach(id => entities.add(id));
                            }
                            if (typedPropValue.animation?.binding) {
                                const animationEntities = extractEntitiesFromBinding(typedPropValue.animation.binding, block, this);
                                animationEntities.forEach(id => entities.add(id));
                            }
                        }
                    }
                }
            }
        }

        return Array.from(entities);
    }

    /**
     * Extract entities from trait property bindings
     *
     * @returns Array of unique entity IDs used in trait bindings
     */
    getTraitBindingEntities(block: BlockData | undefined): string[] {
        if (!block) return [];

        const bindings: Record<string, ValueBinding> = {};
        for (const [key, value] of Object.entries(block.props ?? {})) {
            if (!value || typeof value !== 'object') continue;
            const propValue = value as TraitPropertyValue;
            if (propValue.binding) {
                bindings[key] = propValue.binding;
            }
        }

        if (Object.keys(bindings).length === 0) {
            return [];
        }

        return extractEntitiesFromBindings(bindings, block, this);
    }

    /**
     * Get all entities tracked by this block
     * Combines block-specific entities, style binding entities, and trait bindings
     *
     * @returns Object with separate arrays for block, style, and trait entities
     */
    getAllTrackedEntities(block: BlockData | undefined): {
        blockEntities: string[],
        styleEntities: string[],
        traitBindingEntities: string[]
    } {
        return {
            blockEntities: this.getBlockEntities(block),
            styleEntities: this.getStyleBindingEntities(block),
            traitBindingEntities: this.getTraitBindingEntities(block)
        };
    }

    /**
     * Get flattened array of all unique tracked entities
     * Convenience method for getting all entities as single array
     *
     * @returns Array of all unique entity IDs
     */
    getTrackedEntitiesFlat(block: BlockData | undefined): string[] {
        const {blockEntities, styleEntities, traitBindingEntities} = this.getAllTrackedEntities(block);
        return [...new Set([...blockEntities, ...styleEntities, ...traitBindingEntities])];
    }

    /**
     * Get all tracked entities from a block and all its children recursively
     * Returns structured data with entities for each block in the tree
     *
     * @returns Object with current block entities and children tree
     */
    getAllTrackedEntitiesRecursive(block: BlockData | undefined): {
        blockId: string | undefined;
        blockEntities: string[];
        styleEntities: string[];
        traitBindingEntities: string[];
        children: Array<ReturnType<DocumentModel['getAllTrackedEntitiesRecursive']>>;
    } {
        if (!block) {
            return {
                blockId: undefined,
                blockEntities: [],
                styleEntities: [],
                traitBindingEntities: [],
                children: [],
            };
        }

        const currentEntities = this.getAllTrackedEntities(block);
        const children = this.getChildren(block.id);
        const childrenEntities = children.map(child => this.getAllTrackedEntitiesRecursive(child));

        return {
            blockId: block.id,
            blockEntities: currentEntities.blockEntities,
            styleEntities: currentEntities.styleEntities,
            traitBindingEntities: currentEntities.traitBindingEntities,
            children: childrenEntities,
        };
    }

    /**
     * Get flattened array of all unique tracked entities from a block and all its children
     * Convenience method for getting all entities as single flat array
     *
     * @returns Array of all unique entity IDs from block and children
     */
    getTrackedEntitiesRecursiveFlat(block: BlockData | undefined): string[] {
        if (!block) {
            return [];
        }

        const entities = new Set<string>();

        // Add current block entities
        const currentEntities = this.getTrackedEntitiesFlat(block);
        currentEntities.forEach(entityId => entities.add(entityId));

        // Recursively add children entities
        const children = this.getChildren(block.id);
        for (const child of children) {
            const childEntities = this.getTrackedEntitiesRecursiveFlat(child);
            childEntities.forEach(entityId => entities.add(entityId));
        }

        return Array.from(entities);
    }

    /**
     * Check if a block is a descendant of another block (direct or indirect child)
     *
     * @param ancestorId - ID of the potential ancestor block
     * @param descendantId - ID of the potential descendant block
     * @returns true if descendantId is a descendant of ancestorId, false otherwise
     */
    isDescendant(ancestorId: string, descendantId: string): boolean {
        if (!ancestorId || !descendantId || ancestorId === descendantId) {
            return false;
        }

        const ancestor = this.blocks[ancestorId];
        if (!ancestor) {
            return false;
        }

        // Get all children of the ancestor
        const children = this.getChildren(ancestorId);

        // Check if descendantId is in direct children
        if (children.some(child => child.id === descendantId)) {
            return true;
        }

        // Recursively check in all children
        for (const child of children) {
            if (this.isDescendant(child.id, descendantId)) {
                return true;
            }
        }

        return false;
    }

    getSlotEntities(): DocumentSlot[] {
        return Object.values(this.slots.entities).sort((a, b) => a.id.localeCompare(b.id));
    }

    // =========================================================================
    // Entities Tracking
    // =========================================================================

    getSlotEntity(slotId: string): DocumentSlot | undefined {
        return this.slots.entities[slotId];
    }

    getSlotActions(): ActionSlot[] {
        return Object.values(this.slots.actions).sort((a, b) => a.id.localeCompare(b.id));
    }

    getSlotAction(slotId: string): ActionSlot | undefined {
        return this.slots.actions[slotId];
    }

    createSlotEntity(slot: DocumentSlot): SlotOperationResult {
        const id = this._normalizeSlotId(slot.id);

        if (!id) {
            return {success: false, error: 'Slot ID cannot be empty'};
        }

        if (this.slots.entities[id]) {
            return {success: false, error: 'Slot ID already exists'};
        }

        // Validate default entity against domains if specified
        const domains = slot.domains?.filter(d => d.trim()).map(d => d.trim().toLowerCase());
        const entityId = slot.entityId?.trim() || undefined;

        if (domains && domains.length > 0 && entityId) {
            const entityDomain = entityId.split('.')[0];
            if (!domains.includes(entityDomain)) {
                return {
                    success: false,
                    error: `Default entity domain '${entityDomain}' must be one of: ${domains.join(', ')}`
                };
            }
        }

        const newSlot: DocumentSlot = {
            id,
            name: slot.name?.trim() || undefined,
            description: slot.description?.trim() || undefined,
            entityId,
            domains: domains && domains.length > 0 ? domains : undefined,
        };

        this.slots = {
            ...this.slots,
            entities: {...this.slots.entities, [id]: newSlot},
        };
        this._emitSlotEntitiesChanged('create', newSlot);
        this._emit<BlockChangeDetail>('change', {action: 'update'});

        return {success: true, slot: newSlot};
    }

    updateSlotEntity(slotId: string, updates: Partial<DocumentSlot>): SlotOperationResult {
        const current = this.slots.entities[slotId];
        if (!current) {
            return {success: false, error: 'Slot not found'};
        }

        const nextId = updates.id ? this._normalizeSlotId(updates.id) : slotId;

        if (!nextId) {
            return {success: false, error: 'Slot ID cannot be empty'};
        }

        if (nextId !== slotId && this.slots.entities[nextId]) {
            return {success: false, error: 'Slot ID already exists'};
        }

        // Process domains
        const domains = updates.domains !== undefined
            ? (updates.domains?.filter(d => d.trim()).map(d => d.trim().toLowerCase()) || [])
            : current.domains;

        const entityId = updates.entityId !== undefined
            ? updates.entityId.trim() || undefined
            : current.entityId;

        // Validate entity against domains if specified
        if (domains && domains.length > 0 && entityId) {
            const entityDomain = entityId.split('.')[0];
            if (!domains.includes(entityDomain)) {
                return {
                    success: false,
                    error: `Entity domain '${entityDomain}' must be one of: ${domains.join(', ')}`
                };
            }
        }

        const nextSlot: DocumentSlot = {
            ...current,
            ...updates,
            id: nextId,
            name: updates.name !== undefined ? updates.name.trim() || undefined : current.name,
            description: updates.description !== undefined
                ? updates.description.trim() || undefined
                : current.description,
            entityId,
            domains: domains && domains.length > 0 ? domains : undefined,
        };

        if (nextId !== slotId) {
            const updatedEntities = {...this.slots.entities};
            delete updatedEntities[slotId];
            updatedEntities[nextId] = nextSlot;
            this.slots = {...this.slots, entities: updatedEntities};
            const affectedBlocks = this._replaceSlotEntityReferences(slotId, nextId);
            this._notifySlotUsageChanged(affectedBlocks);
        } else {
            this.slots = {...this.slots, entities: {...this.slots.entities, [slotId]: nextSlot}};
            if ('entityId' in updates) {
                const affectedBlocks = this._getSlotEntityReferenceBlockIds(slotId);
                this._notifySlotUsageChanged(affectedBlocks);
            }
        }

        this._emitSlotEntitiesChanged('update', nextSlot);
        this._emit<BlockChangeDetail>('change', {action: 'update'});

        return {success: true, slot: nextSlot};
    }

    deleteSlotEntity(slotId: string): SlotOperationResult {
        if (!this.slots.entities[slotId]) {
            return {success: false, error: 'Slot not found'};
        }

        const updatedEntities = {...this.slots.entities};
        const deleted = updatedEntities[slotId];
        delete updatedEntities[slotId];
        this.slots = {...this.slots, entities: updatedEntities};

        this._emitSlotEntitiesChanged('delete', deleted);
        this._emit<BlockChangeDetail>('change', {action: 'update'});

        return {success: true, slot: deleted};
    }

    // =========================================================================
    // Action Slots
    // =========================================================================

    createSlotAction(slot: ActionSlot): SlotOperationResult {
        const id = this._normalizeSlotId(slot.id);

        if (!id) {
            return {success: false, error: 'Slot ID cannot be empty'};
        }

        if (this.slots.actions[id]) {
            return {success: false, error: 'Slot ID already exists'};
        }

        if (!slot.trigger) {
            return {success: false, error: 'Trigger is required'};
        }

        if (!slot.action || slot.action.action === 'none') {
            return {success: false, error: 'Action is required'};
        }

        const newSlot: ActionSlot = {
            id,
            name: slot.name?.trim() || undefined,
            description: slot.description?.trim() || undefined,
            trigger: slot.trigger,
            action: slot.action,
        };

        this.slots = {
            ...this.slots,
            actions: {...this.slots.actions, [id]: newSlot},
        };
        this._emitSlotActionsChanged('create', newSlot);
        this._emit<BlockChangeDetail>('change', {action: 'update'});

        return {success: true, slot: newSlot};
    }

    updateSlotAction(slotId: string, updates: Partial<ActionSlot>): SlotOperationResult {
        const current = this.slots.actions[slotId];
        if (!current) {
            return {success: false, error: 'Slot not found'};
        }

        const nextId = updates.id ? this._normalizeSlotId(updates.id) : slotId;

        if (!nextId) {
            return {success: false, error: 'Slot ID cannot be empty'};
        }

        if (nextId !== slotId && this.slots.actions[nextId]) {
            return {success: false, error: 'Slot ID already exists'};
        }

        if (updates.trigger !== undefined && !updates.trigger) {
            return {success: false, error: 'Trigger is required'};
        }

        if (updates.action && updates.action.action === 'none') {
            return {success: false, error: 'Action is required'};
        }

        const nextSlot: ActionSlot = {
            ...current,
            ...updates,
            id: nextId,
            name: updates.name !== undefined ? updates.name.trim() || undefined : current.name,
            description: updates.description !== undefined
                ? updates.description.trim() || undefined
                : current.description,
            trigger: updates.trigger ?? current.trigger,
            action: updates.action ?? current.action,
        };

        if (nextId !== slotId) {
            const updatedActions = {...this.slots.actions};
            delete updatedActions[slotId];
            updatedActions[nextId] = nextSlot;
            this.slots = {...this.slots, actions: updatedActions};
            const affectedBlocks = this._replaceSlotActionReferences(slotId, nextId);
            this._notifySlotUsageChanged(affectedBlocks);
        } else {
            this.slots = {...this.slots, actions: {...this.slots.actions, [slotId]: nextSlot}};
            if ('action' in updates || 'trigger' in updates) {
                const affectedBlocks = this._getSlotActionReferenceBlockIds(slotId);
                this._notifySlotUsageChanged(affectedBlocks);
            }
        }

        this._emitSlotActionsChanged('update', nextSlot);
        this._emit<BlockChangeDetail>('change', {action: 'update'});

        return {success: true, slot: nextSlot};
    }

    deleteSlotAction(slotId: string): SlotOperationResult {
        if (!this.slots.actions[slotId]) {
            return {success: false, error: 'Slot not found'};
        }

        const updatedActions = {...this.slots.actions};
        const deleted = updatedActions[slotId];
        delete updatedActions[slotId];
        this.slots = {...this.slots, actions: updatedActions};

        this._emitSlotActionsChanged('delete', deleted);
        this._emit<BlockChangeDetail>('change', {action: 'update'});

        return {success: true, slot: deleted};
    }

    findSlotEntityReferences(slotId: string): SlotReference[] {
        const references: SlotReference[] = [];

        for (const block of Object.values(this.blocks)) {
            const entityConfig = block.entityConfig;
            if (entityConfig?.mode === 'slot' && entityConfig?.slotId === slotId) {
                references.push({
                    blockId: block.id,
                    kind: 'block-entity',
                });
            }

            if (block.styles) {
                for (const [targetId, targetData] of Object.entries(block.styles)) {
                    this._collectSlotReferencesFromContainerStyles(
                        block.id,
                        slotId,
                        targetData?.containers,
                        references,
                        targetId === 'block' ? undefined : targetId
                    );
                }
            }

            if (block.props) {
                for (const [propName, propValue] of Object.entries(block.props)) {
                    if (propValue && typeof propValue === 'object') {
                        const traitValue = propValue as TraitPropertyValue;
                        if (traitValue.binding?.entity?.slotId === slotId) {
                            references.push({
                                blockId: block.id,
                                kind: 'trait-binding',
                                propName,
                            });
                        }

                        if (this._isSlotPropReference(propName, traitValue.value, slotId)) {
                            references.push({
                                blockId: block.id,
                                kind: 'trait-slot',
                                propName,
                            });
                        }
                    } else if (this._isSlotPropReference(propName, propValue, slotId)) {
                        references.push({
                            blockId: block.id,
                            kind: 'trait-slot',
                            propName,
                        });
                    }
                }
            }
        }

        return references;
    }

    findSlotActionReferences(slotId: string): SlotReference[] {
        const references: SlotReference[] = [];

        for (const block of Object.values(this.blocks)) {
            if (!block.actions?.targets) continue;

            for (const [targetId, slotIds] of Object.entries(block.actions.targets)) {
                if (!Array.isArray(slotIds)) continue;
                for (const actionSlotId of slotIds) {
                    if (actionSlotId !== slotId) continue;
                    references.push({
                        blockId: block.id,
                        kind: 'action-slot',
                        propName: targetId,
                        actionTrigger: this.slots.actions[slotId]?.trigger,
                    });
                }
            }
        }

        return references;
    }

    // =========================================================================
    // Slots Management
    // =========================================================================

    buildTree(): BlockData {
        const root = this.blocks[this.rootId];

        const buildSubtree = (block: BlockData): BlockData => {
            if (!block.children) return block;

            return {
                ...block,
                tree: block.children.map((child) => buildSubtree(this.blocks[child])),
            };
        };

        return buildSubtree(root);
    }

    /**
     * Register or unregister an HTMLElement for a Block
     * @param blockOrId - The block ID or BlockData
     * @param element - The HTMLElement to register, or undefined to unregister
     */
    registerElement(blockOrId: string | BlockData, element: BlockInterface | undefined): void {
        const blockId = typeof blockOrId === 'string' ? blockOrId : blockOrId.id;

        if (!this.blocks[blockId]) {
            if (element) {
                console.error(`[DocumentModel] Block ${blockId} not found, element cannot be registered`);
            }
            return;
        }

        if (element) {
            this._elementRegistry.set(blockId, element);
            this._emit('element-registered', {blockId, element});
        } else {
            this._elementRegistry.delete(blockId);
        }
    }

    /**
     * Get the HTMLElement associated with a block
     * @param blockOrId - The block ID or BlockData
     * @returns The associated HTMLElement, or undefined if not found
     */
    getElement(blockOrId: string | BlockData): BlockInterface | undefined {
        const blockId = typeof blockOrId === 'string' ? blockOrId : blockOrId.id;
        if (!this.blocks[blockId]) {
            console.warn(`[DocumentModel] Block ${blockId} not found, element cannot be retrieved`);
            return undefined;
        }
        return this._elementRegistry.get(blockId);
    }

    clear(): void {
        this._reset();
        this._initialize();
    }

    /**
     * Load document state from a saved configuration
     */
    loadFromConfig(config: DocumentData): void {
        // Reset to the initial state
        this._reset();
        this.version = config.version;
        this.rootId = config.rootId;
        this.slots = config.slots;
        this.blocks = config.blocks;

        // Emit event to notify listeners
        this.dispatchEvent(new CustomEvent('document-loaded'));
        this._emitSlotEntitiesReloaded();
        this._emitSlotActionsReloaded();
        this._emit<BlockChangeDetail>('change', {action: 'load'});
    }

    /**
     * Export current document state for saving
     */
    exportToConfig(): DocumentData {
        return {
            version: this.version,
            rootId: this.rootId,
            slots: this.slots,
            blocks: this.blocks,
        };
    }

    private _initialize(): void {
        this.blocks[this.rootId] = {
            label: 'Card',
            id: this.rootId,
            type: 'canvas',
            parentId: null,
            canBeDeleted: false,
            canBeDuplicated: false,
            canChangeLayoutMode: false,
            isHidden: false,
            requireEntity: false,
            parentManaged: false,
            layout: 'flow',
            children: [],
            props: {
                overflow_allow_blocks_outside: { value: true },
                overflow_show: { value: true },
            },
            order: 0,
            zIndex: 0,
        };
    }

    private _reset(): void {
        // Delete all blocks
        Object.keys(this.blocks).forEach((id) => delete this.blocks[id]);
        // Reset selection
        this.selectedId = null;
        this.selectedStyleTargetId = null;
        this.linkModeState = {enabled: false, mode: 'idle', activeLinkId: null};
        this.linkEditorSelection = {blockId: null, pointId: null, segmentIndex: null, handle: null};
        this.linkAnchorHighlight = {blockId: null};
        this.linkGridColor = '#000000';
        this.slots = {entities: {}, actions: {}};
        this.version = DOCUMENT_MODEL_VERSION;
    }

    private _duplicateBlockRecursive(sourceId: string, newParentId: string): void {
        const sourceBlock = this.blocks[sourceId];
        if (!sourceBlock) return;

        const newId = `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newParent = this.blocks[newParentId];

        const duplicatedBlock: BlockData = {
            ...sourceBlock,
            id: newId,
            parentId: newParentId,
            order: newParent.children ? newParent.children.length : 0,
            children: [],
        };

        this.blocks = {
            ...this.blocks,
            [newId]: duplicatedBlock
        };

        if (newParent.children) {
            newParent.children.push(newId);
        }

        // Recursively duplicate children
        if (sourceBlock.children && sourceBlock.children.length > 0) {
            sourceBlock.children.forEach((childId) => {
                this._duplicateBlockRecursive(childId, newId);
            });
        }
    }

    /**
     * Walk up parent chain to find inherited entity.
     * Stops at the first parent with a fixed or slot entity configuration.
     *
     * @param block - The block to start from
     * @returns Resolved entity info from parent chain
     */
    private _resolveInheritedEntity(block: BlockData): ResolvedEntityInfo {
        let currentId = block.parentId;

        while (currentId) {
            const parent = this.blocks[currentId];
            if (!parent) break;

            const parentConfig = parent.entityConfig;

            // Check for fixed mode
            if (parentConfig?.mode === 'fixed') {
                return {
                    entityId: parentConfig.entityId,
                    source: 'inherited',
                    inheritedFromId: parent.id,
                    inheritedFromDisplayName: this.getBlockDisplayName(parent),
                    inheritedFromType: parent.type,
                };
            }

            // Check for slot mode
            if (parentConfig?.mode === 'slot') {
                const slotId = parentConfig.slotId;
                const slotEntityId = slotId ? this._resolveSlotEntity(slotId) : undefined;
                return {
                    entityId: slotEntityId,
                    source: 'inherited',
                    inheritedFromId: parent.id,
                    inheritedFromDisplayName: this.getBlockDisplayName(parent),
                    inheritedFromType: parent.type,
                    slotId,
                };
            }

            currentId = parent.parentId;
        }

        return {entityId: undefined, source: 'none'};
    }


    private _resolveSlotEntity(slotId: string | undefined): string | undefined {
        if (!slotId) {
            return undefined;
        }
        return this.slots.entities[slotId]?.entityId;
    }

    private _normalizeSlotId(value: string): string {
        return value.trim().toLowerCase().replaceAll(' ', '-');
    }

    private _emitSlotEntitiesChanged(action: 'create' | 'update' | 'delete', slot: DocumentSlot): void {
        this.dispatchEvent(new CustomEvent('slots-changed', {
            detail: {action, slot},
        }));
    }

    private _emitSlotEntitiesReloaded(): void {
        this.dispatchEvent(new CustomEvent('slots-changed', {
            detail: {action: 'load'},
        }));
    }

    private _emitSlotActionsChanged(action: 'create' | 'update' | 'delete', slot: ActionSlot): void {
        this.dispatchEvent(new CustomEvent('slot-actions-changed', {
            detail: {action, slot},
        }));
    }

    private _emitSlotActionsReloaded(): void {
        this.dispatchEvent(new CustomEvent('slot-actions-changed', {
            detail: {action: 'load'},
        }));
    }

    private _collectSlotReferencesFromContainerStyles(
        blockId: string,
        slotId: string,
        containerStyles: Record<string, ContainerStyleData> | undefined,
        references: SlotReference[],
        styleTargetId?: string
    ): void {
        if (!containerStyles) return;

        for (const styles of Object.values(containerStyles)) {
            if (!styles) continue;
            for (const [category, categoryData] of Object.entries(styles)) {
                if (!categoryData) continue;
                for (const [property, propValue] of Object.entries(categoryData)) {
                    if (!propValue || typeof propValue !== 'object') continue;
                    const typedPropValue = propValue as {
                        binding?: ValueBinding;
                        animation?: { binding?: ValueBinding };
                    };
                    if (typedPropValue.binding?.entity?.slotId === slotId) {
                        references.push({
                            blockId,
                            kind: 'style-binding',
                            category,
                            property,
                            styleTargetId,
                        });
                    }
                    if (typedPropValue.animation?.binding?.entity?.slotId === slotId) {
                        references.push({
                            blockId,
                            kind: 'style-animation',
                            category,
                            property,
                            styleTargetId,
                        });
                    }
                }
            }
        }
    }

    private _replaceSlotEntityReferences(slotId: string, nextSlotId: string): Set<string> {
        const updatedBlocks: DocumentBlocks = {...this.blocks};
        const affectedBlocks = new Set<string>();

        for (const [blockId, block] of Object.entries(this.blocks)) {
            let nextBlock: BlockData = block;
            let changed = false;

            if (block.entityConfig?.mode === 'slot' && block.entityConfig?.slotId === slotId) {
                nextBlock = {
                    ...nextBlock,
                    entityConfig: {
                        ...block.entityConfig,
                        slotId: nextSlotId,
                    },
                };
                changed = true;
            }

            if (block.styles) {
                let stylesChanged = false;
                const nextStyles = {...block.styles};
                for (const [targetId, targetData] of Object.entries(block.styles)) {
                    if (!targetData?.containers) continue;
                    const {containerStyles, changed: targetChanged} = this._updateSlotIdInContainerStyles(
                        targetData.containers,
                        slotId,
                        nextSlotId
                    );
                    if (targetChanged) {
                        nextStyles[targetId] = {
                            ...targetData,
                            containers: containerStyles,
                        };
                        stylesChanged = true;
                    }
                }
                if (stylesChanged) {
                    nextBlock = {...nextBlock, styles: nextStyles};
                    changed = true;
                }
            }

            if (block.props) {
                let propsChanged = false;
                const nextProps: BlockProps = {...block.props};
                for (const [propName, propValue] of Object.entries(block.props)) {
                    const updated = this._updateSlotIdInTraitValue(propName, propValue, slotId, nextSlotId);
                    if (updated.changed) {
                        nextProps[propName] = updated.value;
                        propsChanged = true;
                    }
                }
                if (propsChanged) {
                    nextBlock = {...nextBlock, props: nextProps};
                    changed = true;
                }
            }

            if (changed) {
                updatedBlocks[blockId] = nextBlock;
                affectedBlocks.add(blockId);
            }
        }

        if (affectedBlocks.size > 0) {
            this.blocks = updatedBlocks;
        }

        return affectedBlocks;
    }

    private _replaceSlotActionReferences(slotId: string, nextSlotId: string): Set<string> {
        const updatedBlocks: DocumentBlocks = {...this.blocks};
        const affectedBlocks = new Set<string>();

        for (const [blockId, block] of Object.entries(this.blocks)) {
            if (!block.actions?.targets) continue;

            let changed = false;
            const nextTargets: Record<string, string[]> = {...block.actions.targets};

            for (const [targetId, slotIds] of Object.entries(block.actions.targets)) {
                if (!Array.isArray(slotIds)) continue;
                let targetChanged = false;
                const nextSlotIds = slotIds.map((currentSlotId) => {
                    if (currentSlotId === slotId) {
                        targetChanged = true;
                        return nextSlotId;
                    }
                    return currentSlotId;
                });

                if (targetChanged) {
                    nextTargets[targetId] = nextSlotIds;
                    changed = true;
                }
            }

            if (changed) {
                updatedBlocks[blockId] = {
                    ...block,
                    actions: {targets: nextTargets},
                };
                affectedBlocks.add(blockId);
            }
        }

        if (affectedBlocks.size > 0) {
            this.blocks = updatedBlocks;
        }

        return affectedBlocks;
    }

    private _updateSlotIdInContainerStyles(
        containerStyles: Record<string, ContainerStyleData>,
        slotId: string,
        nextSlotId: string
    ): { containerStyles: Record<string, ContainerStyleData>; changed: boolean } {
        let changed = false;
        const nextContainerStyles: Record<string, ContainerStyleData> = {};

        for (const [containerId, styles] of Object.entries(containerStyles)) {
            if (!styles) continue;
            let containerChanged = false;
            const nextStyles: ContainerStyleData = {...styles};

            for (const [category, categoryData] of Object.entries(styles)) {
                if (!categoryData) continue;
                let categoryChanged = false;
                const nextCategory = {...categoryData};
                for (const [property, propValue] of Object.entries(categoryData)) {
                    if (!propValue || typeof propValue !== 'object') continue;
                    const updated = this._updateSlotIdInStylePropertyValue(
                        propValue as StylePropertyValueWithAnimation,
                        slotId,
                        nextSlotId
                    );
                    if (updated.changed) {
                        nextCategory[property] = updated.value;
                        categoryChanged = true;
                    }
                }
                if (categoryChanged) {
                    nextStyles[category] = nextCategory;
                    containerChanged = true;
                }
            }

            if (containerChanged) {
                nextContainerStyles[containerId] = nextStyles;
                changed = true;
            } else {
                nextContainerStyles[containerId] = styles;
            }
        }

        return {containerStyles: changed ? nextContainerStyles : containerStyles, changed};
    }

    private _updateSlotIdInStylePropertyValue(
        propValue: StylePropertyValueWithAnimation,
        slotId: string,
        nextSlotId: string
    ): { value: StylePropertyValueWithAnimation; changed: boolean } {
        const typedPropValue = propValue as StylePropertyValueWithAnimation;

        let changed = false;
        let nextBinding = typedPropValue.binding;
        let nextAnimation = typedPropValue.animation;

        if (typedPropValue.binding?.entity?.slotId === slotId) {
            nextBinding = {
                ...typedPropValue.binding,
                entity: {
                    ...typedPropValue.binding.entity,
                    slotId: nextSlotId,
                },
            };
            changed = true;
        }

        if (typedPropValue.animation?.binding?.entity?.slotId === slotId) {
            nextAnimation = {
                ...typedPropValue.animation,
                binding: {
                    ...typedPropValue.animation.binding,
                    entity: {
                        ...typedPropValue.animation.binding.entity,
                        slotId: nextSlotId,
                    },
                },
            };
            changed = true;
        }

        if (!changed) {
            return {value: propValue, changed: false};
        }

        return {
            value: {
                ...typedPropValue,
                binding: nextBinding,
                animation: nextAnimation,
            },
            changed: true,
        };
    }


    private _updateSlotIdInTraitValue(
        propName: string,
        propValue: unknown,
        slotId: string,
        nextSlotId: string
    ): { value: unknown; changed: boolean } {
        if (propValue && typeof propValue === 'object') {
            const traitValue = propValue as TraitPropertyValue;
            let changed = false;
            let nextValue = traitValue.value;
            let nextBinding = traitValue.binding;

            if (traitValue.binding?.entity?.slotId === slotId) {
                nextBinding = {
                    ...traitValue.binding,
                    entity: {
                        ...traitValue.binding.entity,
                        slotId: nextSlotId,
                    },
                };
                changed = true;
            }

            if (this._isSlotPropReference(propName, traitValue.value, slotId)) {
                nextValue = nextSlotId;
                changed = true;
            }

            if (!changed) {
                return {value: propValue, changed: false};
            }

            return {
                value: {
                    ...traitValue,
                    value: nextValue,
                    binding: nextBinding,
                },
                changed: true,
            };
        }

        if (this._isSlotPropReference(propName, propValue, slotId)) {
            return {value: nextSlotId, changed: true};
        }

        return {value: propValue, changed: false};
    }

    private _isSlotPropReference(propName: string, value: unknown, slotId: string): boolean {
        if (typeof value !== 'string') return false;
        if (value !== slotId) return false;
        return propName.toLowerCase().includes('slot');
    }

    private _getSlotEntityReferenceBlockIds(slotId: string): Set<string> {
        const blockIds = new Set<string>();
        for (const reference of this.findSlotEntityReferences(slotId)) {
            blockIds.add(reference.blockId);
        }
        return blockIds;
    }

    private _getSlotActionReferenceBlockIds(slotId: string): Set<string> {
        const blockIds = new Set<string>();
        for (const reference of this.findSlotActionReferences(slotId)) {
            blockIds.add(reference.blockId);
        }
        return blockIds;
    }

    private _notifySlotUsageChanged(blockIds: Set<string>): void {
        if (blockIds.size === 0) return;

        for (const blockId of blockIds) {
            const block = this.blocks[blockId];
            if (!block) continue;
            this._emit<BlockUpdatedDetail>('block-updated', {block});
            this._emit<BlockChangeDetail>('change', {action: 'update', block, styleChanged: true});
        }
    }

    private _emit<T>(eventName: string, detail: T): void {
        this.dispatchEvent(new CustomEvent(eventName, {detail}));
    }
}
