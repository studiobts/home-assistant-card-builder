/**
 * Entity Extractor
 *
 * Utilities to extract entity IDs from binding configurations.
 * Used by block-base and style system to track which entities
 * are needed for binding resolution.
 */

import { type BlockData, DocumentModel } from "@/common/core/model";
import type {
    BindingEntitySource,
    ConditionBinding,
    ConditionGroup,
    ConditionRule,
    ValueBinding
} from '../types/bindings';
import { isConditionGroup, isConditionRule } from '../types/bindings';

// ============================================================================
// Main Extraction Functions
// ============================================================================

/**
 * Extract entity ID from an EntitySource if present
 *
 * @param entitySource - The entity source configuration
 * @param block - The block containing the entity source
 * @param documentModel - The document model containing the block
 * @returns Entity ID or undefined if not specified
 */
export function extractEntityFromSource(
    entitySource: BindingEntitySource | undefined,
    block: BlockData,
    documentModel: DocumentModel
): string | undefined {
    if (entitySource?.slotId) {
        return documentModel.resolveSlotEntity(entitySource.slotId);
    }

    if (entitySource?.entityId) {
        return entitySource.entityId;
    }

    return documentModel.resolveEntityForBlock(block.id).entityId;
}

/**
 * Extract all entity IDs from a ValueBinding
 * Handles all binding modes and extracts entities from:
 * - binding.entity.entityId (direct entity reference)
 * - binding.entity.slotId (slot-based entity reference)
 * - Condition cases (for condition mode)
 *
 * @param binding - The binding configuration
 * @param block - The block containing the binding
 * @param documentModel - The document model containing the block
 * @returns Array of unique entity IDs found in the binding
 */
export function extractEntitiesFromBinding(binding: ValueBinding | unknown, block: BlockData, documentModel: DocumentModel): string[] {
    if (!binding || typeof binding !== 'object') {
        return [];
    }

    const entities = new Set<string>();
    const b = binding as ValueBinding;

    // Extract from entity source (common to all binding types)
    const sourceEntity = extractEntityFromSource(b.entity, block, documentModel);
    if (sourceEntity) {
        entities.add(sourceEntity);
    }

    // Handle condition mode - extract from all condition cases
    if (b.mode === 'condition') {
        const conditionBinding = b as ConditionBinding;
        if (conditionBinding.conditions) {
            for (const condCase of conditionBinding.conditions) {
                const conditionEntities = extractEntitiesFromCondition(condCase.condition);
                conditionEntities.forEach(id => entities.add(id));
            }
        }
    }

    // These have showWhen/hideWhen/activeWhen conditions
    const anyBinding = binding as Record<string, unknown>;

    if ('showWhen' in anyBinding && anyBinding.showWhen) {
        const showWhenEntities = extractEntitiesFromCondition(
            anyBinding.showWhen as ConditionRule | ConditionGroup
        );
        showWhenEntities.forEach(id => entities.add(id));
    }

    if ('hideWhen' in anyBinding && anyBinding.hideWhen) {
        const hideWhenEntities = extractEntitiesFromCondition(
            anyBinding.hideWhen as ConditionRule | ConditionGroup
        );
        hideWhenEntities.forEach(id => entities.add(id));
    }

    if ('activeWhen' in anyBinding && anyBinding.activeWhen) {
        const activeWhenEntities = extractEntitiesFromCondition(
            anyBinding.activeWhen as ConditionRule | ConditionGroup
        );
        activeWhenEntities.forEach(id => entities.add(id));
    }

    return Array.from(entities);
}

/**
 * Extract all entity IDs from a condition (rule or group)
 * Recursively processes nested condition groups
 *
 * @param condition - The condition to extract entities from
 * @returns Array of unique entity IDs found in the condition
 */
export function extractEntitiesFromCondition(
    condition: ConditionRule | ConditionGroup
): string[] {
    const entities = new Set<string>();

    if (isConditionGroup(condition)) {
        // Recursively extract from all rules in the group
        for (const rule of condition.rules) {
            const ruleEntities = extractEntitiesFromCondition(rule);
            ruleEntities.forEach(id => entities.add(id));
        }
    } else if (isConditionRule(condition)) {
        // Extract entity from condition rule if present
        if (condition.entity) {
            entities.add(condition.entity);
        }
    }

    return Array.from(entities);
}

/**
 * Extract entities from multiple bindings at once
 * Utility function for processing collections of bindings
 *
 * @param bindings - Record or array of bindings to process
 * @param block - The block containing the bindings
 * @param documentModel - The document model containing the block
 * @returns Array of unique entity IDs from all bindings
 */
export function extractEntitiesFromBindings(
    bindings: Record<string, ValueBinding | unknown> | (ValueBinding | unknown)[],
    block: BlockData,
    documentModel: DocumentModel
): string[] {
    const entities = new Set<string>();

    const bindingList = Array.isArray(bindings)
        ? bindings
        : Object.values(bindings);

    for (const binding of bindingList) {
        if (!binding) continue;
        const bindingEntities = extractEntitiesFromBinding(binding, block, documentModel);
        bindingEntities.forEach(id => entities.add(id));
    }

    return Array.from(entities);
}
