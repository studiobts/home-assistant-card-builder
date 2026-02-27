import { BlockBase } from '@/common/blocks/components/block-base';
import type { BlockData, BlockProps, EntityConfigMode } from '@/common/core/model/types';
import type { StyleOutputConfig } from '@/common/core/style-resolver';
import type { ContainerStyleData } from '@/common/types/style-preset';

// Block registry types
export interface BlockDefinition {
    label: string;
    icon: string;
    category?: string;
    className?: string;
    accepts?: string[];
    locked?: boolean;
    boundBlocks?: any[];
    render?: (block: HTMLElement, blockId: string) => string | void;
    renderSidebar?: (element: HTMLElement) => string | void;
    internal?: boolean;
}

export interface BlockDefaults {
    canBeDeleted?: boolean;
    canBeDuplicated?: boolean;
    canChangeLayoutMode?: boolean;
    requireEntity?: boolean;
    props?: BlockProps;
}

/**
 * Default entity configuration for new blocks
 */
export interface BlockEntityDefaults {
    /** Default mode for new blocks (default: 'inherited') */
    mode?: EntityConfigMode;
    /** Default slot ID when mode is 'slot' */
    slotId?: string;
}

export interface ActionTargetDefinition {
    /** Target label for the actions panel */
    label: string;
    /** Optional target description */
    description?: string;
}

/**
 * Block registration configuration
 *
 * definition: null = block won't appear in sidebar (virtual block)
 * defaults: always required for block creation
 * styleDefaults: optional default style values for this block type
 * entityDefaults: optional default entity configuration for new blocks
 */
export interface BlockRegistration {
    definition: BlockDefinition | null;
    defaults: BlockDefaults;
    /** Action targets available for this block */
    actionTargets?: Record<string, ActionTargetDefinition>;
    /** Whether to expose the default "block" action target (default: true) */
    exposeBlockActionTarget?: boolean;
    /** Default style values for this block type (container-specific) */
    styleDefaults?: ContainerStyleData;
    /** Default entity configuration for new blocks of this type */
    entityDefaults?: BlockEntityDefaults;
}

/**
 * Self-registering block registry
 * Blocks register themselves by calling BlockRegistry.register()
 */
export class BlockRegistry {
    private blocks: Map<string, BlockRegistration> = new Map();
    private classes: Map<string, typeof BlockBase> = new Map();

    /**
     * Get all blocks as record (for backwards compatibility)
     * Only returns blocks with non-null definition (excludes virtual blocks)
     */
    get allBlocks(): Record<string, BlockDefinition> {
        const result: Record<string, BlockDefinition> = {};
        this.blocks.forEach((registration, type) => {
            if (registration.definition !== null) {
                result[type] = registration.definition;
            }
        });
        return result;
    }

    /**
     * Register a block with its definition and defaults
     */
    register(type: string, blockClass: typeof BlockBase, registration: BlockRegistration): void {
        if (this.blocks.has(type)) {
            console.warn(`[BlockRegistry] Block type "${type}" is already registered. Overwriting.`);
        }

        // Validate registration
        this._validateRegistration(type, registration);

        this.blocks.set(type, registration);
        this.classes.set(type, blockClass);
    }

    /**
     * Get block definition
     */
    getBlock(type: string): BlockDefinition | null | undefined {
        return this.blocks.get(type)?.definition;
    }

    getBlockClass(type: string): typeof BlockBase | undefined {
        return this.classes.get(type);
    }

    /**
     * Get block defaults (size, props)
     */
    getDefaults(type: string): BlockDefaults | undefined {
        return this.blocks.get(type)?.defaults;
    }

    /**
     * Get blocks by category
     * Only returns blocks with non-null definition (excludes internal blocks)
     */
    getByCategory(category: string): Array<{ type: string } & BlockDefinition> {
        const result: Array<{ type: string } & BlockDefinition> = [];
        this.blocks.forEach((registration, type) => {
            // Skip internal blocks (null definition)
            if (registration.definition !== null && registration.definition.category === category) {
                result.push({type, ...registration.definition});
            }
        });
        return result;
    }

    getAllCategories(): string[] {
        const categories: Set<string> = new Set();
        this.blocks.forEach((registration) => {
            if (registration.definition !== null) {
                categories.add(registration.definition.category!);
            }
        });

        return Array.from(categories);
    }

    /**
     * Get all registered block types
     */
    getAllTypes(): string[] {
        return Array.from(this.blocks.keys());
    }

    /**
     * Check if a block type is registered
     */
    isRegistered(type: string): boolean {
        return this.blocks.has(type);
    }

    /**
     * Get full registration for a block type
     */
    getRegistration(type: string): BlockRegistration | undefined {
        return this.blocks.get(type);
    }

    /**
     * Get style output config for a specific block instance and target.
     */
    getBlockStyleOutputConfig(block: BlockData, targetId?: string): StyleOutputConfig | null {
        const blockClass = this.classes.get(block.type);
        if (!blockClass) return null;

        return blockClass.getStyleOutputConfig(block, targetId);
    }

    /**
     * Get action target definitions for a block type
     */
    getBlockActionTargets(type: string): Record<string, ActionTargetDefinition> | undefined {
        return this.blocks.get(type)?.actionTargets;
    }

    /**
     * Get available action targets for a specific block instance
     */
    getBlockActionTargetsForBlock(block: BlockData): Record<string, ActionTargetDefinition> {
        const targets = {...(this.blocks.get(block.type)?.actionTargets || {})};
        const exposeBlockTarget = this.blocks.get(block.type)?.exposeBlockActionTarget ?? true;
        if (exposeBlockTarget && !targets.block) {
            targets.block = {label: 'Block'};
        }

        const blockClass = this.classes.get(block.type);
        if (!blockClass) return targets;

        const availableTargetIds = blockClass.getAvailableActionTargetIds(block, targets);
        if (availableTargetIds.length === Object.keys(targets).length) {
            return targets;
        }

        const filteredTargets: Record<string, ActionTargetDefinition> = {};
        for (const targetId of availableTargetIds) {
            const target = targets[targetId];
            if (target) {
                filteredTargets[targetId] = target;
            }
        }

        return filteredTargets;
    }

    /**
     * Get a single action target definition
     */
    getBlockActionTargetDefinition(type: string, targetId: string): ActionTargetDefinition | undefined {
        return this.blocks.get(type)?.actionTargets?.[targetId];
    }

    /**
     * Get default style values for a block type
     * Returns undefined if no style defaults are configured
     */
    getBlockDefaults(type: string): ContainerStyleData | undefined {
        return this.blocks.get(type)?.styleDefaults;
    }

    /**
     * Get default entity configuration for a block type
     * Returns default inherited mode if no entity defaults are configured
     */
    getEntityDefaults(type: string): BlockEntityDefaults {
        const registration = this.blocks.get(type);
        if (registration?.entityDefaults) {
            return registration.entityDefaults;
        }
        // Default: inherited mode with no slot config
        return {mode: 'inherited'};
    }

    /**
     * Validate block registration
     */
    private _validateRegistration(type: string, registration: BlockRegistration): void {
        const {definition} = registration;

        // Validate definition only if present (null definition = internal block)
        if (definition !== null) {
            if (!definition.label) {
                throw new Error(`[BlockRegistry] Block "${type}" missing required field: label`);
            }
            if (!definition.icon) {
                throw new Error(`[BlockRegistry] Block "${type}" missing required field: icon`);
            }
            if (!definition.category && !definition.internal) {
                throw new Error(`[BlockRegistry] Block "${type}" missing required field: category`);
            }
        }

        if (registration.actionTargets) {
            for (const [targetId, target] of Object.entries(registration.actionTargets)) {
                if (!target.label) {
                    throw new Error(`[BlockRegistry] Block "${type}" action target "${targetId}" missing required field: label`);
                }
            }
        }
    }
}

// Export singleton instance
export const blockRegistry = new BlockRegistry();
