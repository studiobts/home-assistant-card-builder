/**
 * Style Resolver
 *
 * Main resolution engine for block styles with container fallback support.
 * Resolves styles through the chain: inline → preset → block-type defaults → global defaults
 */

import type { StylePresetsService } from '@/common/api/services/style-presets-service';
import type { BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { type BindingEvaluator } from '@/common/core/binding';
import type { ContainerManager } from "@/common/core/container-manager/container-manager";
import type { BlockData, DocumentModel } from "@/common/core/model";
import type { ContainerStyleData, StylePresetData, StylePropertyValue } from '@/common/types/style-preset';
import { mergePresetData } from '@/common/types/style-preset';
import type {
    ResolutionContext,
    ResolvedCategoryData,
    ResolvedStyleData,
    ResolvedValue,
    ValueOrigin
} from './style-resolution-types';

// ============================================================================
// Types
// ============================================================================

/**
 * Binding context for evaluation
 */
// FIXME: remove and use BindingEvaluateOptions
export interface BindingContext {
    /**
     * Default entity ID to use for binding resolution.
     * Individual bindings can override with binding.entity.entityId
     */
    defaultEntityId?: string;
}

/**
 * Filter configuration for CSS conversion
 */
export interface StyleFilter {
    /** Convert only specified categories and/or properties */
    only?: {
        categories?: string[];
        properties?: string[];
    };
    /** Exclude specified categories and/or properties */
    exclude?: {
        categories?: string[];
        properties?: string[];
    };
    /** Include specific properties that were excluded by category */
    include?: string[];
}

// ============================================================================
// Style Resolver Class
// ============================================================================

/**
 * Resolves block styles with container fallback
 */
export class StyleResolver {
    /** Optional binding evaluator for resolving bindings */
    protected bindingEvaluator?: BindingEvaluator;

    /** Binding context for evaluation */
    protected bindingContext: BindingContext = {};

    constructor(
        protected documentModel: DocumentModel,
        protected containerManager: ContainerManager,
        protected presetService: StylePresetsService,
        protected blockRegistry?: BlockRegistry
    ) {
    }

    /**
     * Set the binding evaluator for resolving bindings
     */
    setBindingEvaluator(evaluator: BindingEvaluator | undefined): void {
        this.bindingEvaluator = evaluator;
    }

    /**
     * Set the binding context for evaluation
     */
    setBindingContext(context: BindingContext): void {
        this.bindingContext = context;
    }

    // ==========================================================================
    // Main Resolution
    // ==========================================================================

    /**
     * Resolve all styles for a block target on a specific container
     *
     * @param blockId - Block ID
     * @param containerId - Container ID
     * @param bindingContext - Binding context for this resolution
     * @param applyFallbacks - Whether to apply fallback styles to the resolved result
     * @param targetId - Style target ID (defaults to "block")
     * @returns Resolved style data
     */
    resolve(
        blockId: string,
        containerId: string,
        bindingContext: BindingContext,
        applyFallbacks: boolean = true,
        targetId?: string
    ): ResolvedStyleData {
        return this.resolveTarget(blockId, containerId, targetId, bindingContext, applyFallbacks);
    }

    protected resolveTarget(
        blockId: string,
        containerId: string,
        targetId?: string,
        bindingContext?: BindingContext,
        applyFallbacks: boolean = true
    ): ResolvedStyleData {
        const resolvedBindingContext = bindingContext || this.bindingContext;
        const resolvedTargetId = targetId ?? 'block';

        const block = this.documentModel.getBlock(blockId);
        if (!block) {
            return {};
        }

        const presetId = block.styles?.[resolvedTargetId]?.stylePresetId;
        const resolutionContext: ResolutionContext = {
            blockId,
            targetId: resolvedTargetId,
            containerId: containerId,
            blockType: block.type,
            presetId,
            applyFallbacks,
        };

        const resolved = this.resolveAllCategories(block, resolutionContext, resolvedBindingContext);

        return resolved;
    }

    /**
     * Resolve all style categories for a block
     */
    protected resolveAllCategories(
        block: BlockData,
        resolutionContext: ResolutionContext,
        bindingContext?: BindingContext
    ): ResolvedStyleData {
        const result: ResolvedStyleData = {};

        // Get all categories from all sources
        const allCategories = this.getAllCategories(block, resolutionContext);

        // Resolve each category
        for (const category of allCategories) {
            const resolvedCategory = this.resolveCategory(block, resolutionContext, category, bindingContext);
            if (Object.keys(resolvedCategory).length > 0) {
                result[category] = resolvedCategory;
            }
        }

        return result;
    }

    /**
     * Get all unique categories from all style sources
     */
    protected getAllCategories(block: BlockData, resolutionContext: ResolutionContext): string[] {
        const categories = new Set<string>();

        // From block type defaults
        const blockDefaults = this.blockRegistry?.getBlockDefaults(resolutionContext.blockType);
        const isBlockTarget = resolutionContext.targetId === 'block';
        if (blockDefaults && isBlockTarget) {
            Object.keys(blockDefaults).forEach((c) => categories.add(c));
        }

        // From preset (all containers)
        if (resolutionContext.presetId) {
            const preset = this.presetService.getCachedPreset(resolutionContext.presetId);
            if (preset?.data?.containers) {
                for (const containerStyles of Object.values(preset.data.containers)) {
                    if (containerStyles) {
                        Object.keys(containerStyles).forEach((c) => categories.add(c));
                    }
                }
            }
        }

        // From inline styles (all containers)
        const inlineSources = this.getInlineSources(block, resolutionContext);
        for (const containerStyles of inlineSources) {
            if (containerStyles) {
                Object.keys(containerStyles).forEach((c) => categories.add(c));
            }
        }

        return Array.from(categories);
    }

    // ==========================================================================
    // Style Source Getters
    // ==========================================================================

    /**
     * Resolve a single category
     */
    protected resolveCategory(
        block: BlockData,
        resolutionContext: ResolutionContext,
        category: string,
        bindingContext?: BindingContext
    ): ResolvedCategoryData {
        const result: ResolvedCategoryData = {};

        // Get all properties in this category from all sources
        const allProperties = this.getAllPropertiesInCategory(block, resolutionContext, category);

        // Resolve each property
        for (const property of allProperties) {
            const resolved = this.resolvePropertyValue(block, resolutionContext, category, property, bindingContext);
            if (resolved) {
                result[property] = resolved;
            }
        }

        return result;
    }

    /**
     * Get all unique properties in a category from all sources
     */
    protected getAllPropertiesInCategory(
        block: BlockData,
        context: ResolutionContext,
        category: string
    ): string[] {
        const properties = new Set<string>();

        // From block type defaults
        const blockDefaults = this.blockRegistry?.getBlockDefaults(context.blockType);
        if (context.targetId === 'block' && blockDefaults?.[category]) {
            Object.keys(blockDefaults[category]!).forEach((p) => properties.add(p));
        }

        // From preset
        if (context.presetId) {
            const presetProperties = this.getPresetPropertiesInCategory(category, context.presetId, context.containerId, context.applyFallbacks);
            presetProperties.forEach(p => properties.add(p));
        }

        // From inline styles
        const inlineProperties = this.getInlinePropertiesInCategory(block, category, context.containerId, context.targetId, context.applyFallbacks);
        inlineProperties.forEach(p => properties.add(p));

        return Array.from(properties);
    }

    /**
     * Resolve a single property value through the chain
     */
    protected resolvePropertyValue(
        block: BlockData,
        context: ResolutionContext,
        category: string,
        property: string,
        bindingContext?: BindingContext
    ): ResolvedValue | undefined {
        // Check if current container has a local override
        const hasLocalOverride = this.hasLocalOverride(block, context.containerId, category, property, context.targetId);

        // Resolution chain (highest to lowest priority):
        // 1. Inline current/fallback container
        // 2. Preset current/fallback container
        // 3. Block type defaults

        const containersChain = this.containerManager.getFallbackChain(context.containerId);

        // 1. Inline style
        for (const container of containersChain) {
            const inlineCurrent = this.getPropertyFromInline(block, container.id, category, property, context.targetId);
            if (inlineCurrent.value !== undefined) {
                const origin = container.id === context.containerId ? 'inline' : 'inline-fallback';
                return this.createResolvedValue(inlineCurrent, origin, container.id, hasLocalOverride, undefined, bindingContext);
            }
        }

        // 2. Preset style
        if (context.presetId) {
            for (const container of containersChain) {
                const presetCurrent = this.getPropertyFromPreset(context.presetId, container.id, category, property);
                if (presetCurrent.value !== undefined) {
                    const origin = container.id === context.containerId ? 'preset' : 'preset-fallback';
                    return this.createResolvedValue(presetCurrent, origin, context.containerId, hasLocalOverride, context.presetId, bindingContext);
                }
            }
        }

        // 3. Block type defaults
        if (context.targetId === 'block') {
            const blockDefault = this.getPropertyFromBlockDefaults(context.blockType, category, property);
            if (blockDefault.value !== undefined) {
                return this.createResolvedValue(blockDefault, 'block-type-default', undefined, hasLocalOverride, undefined, bindingContext);
            }
        }

        return undefined;
    }

    /**
     * Check if block has a local override for property on current container
     */
    protected hasLocalOverride(
        block: BlockData,
        containerId: string,
        category: string,
        property: string,
        targetId?: string
    ): boolean {
        const resolvedTargetId = targetId ?? 'block';
        return block.styles?.[resolvedTargetId]?.containers?.[containerId]?.[category]?.[property] !== undefined;
    }

    /**
     * Create a ResolvedValue from source result
     */
    protected createResolvedValue(
        source: { value: StylePropertyValue | undefined },
        origin: ValueOrigin,
        originContainer: string | undefined,
        hasLocalOverride: boolean,
        presetId?: string,
        bindingContext?: BindingContext
    ): ResolvedValue {
        const propValue = source.value!;
        const binding = propValue.binding;
        const unit = propValue.unit;

        // Determine the base value
        let value: unknown;

        if (binding) {
            const result = this.bindingEvaluator?.evaluate(binding, {
                defaultEntityId: bindingContext?.defaultEntityId || this.bindingContext.defaultEntityId,
                defaultValue: propValue.value,
            });
            value = result?.value;
        } else {
            value = propValue.value;
        }

        return {
            value,
            unit,
            origin,
            originContainer,
            presetId,
            binding,
            hasLocalOverride,
        };
    }

    /**
     * Get inline styles with container fallback
     */
    protected getInlinePropertiesInCategory(
        block: BlockData,
        category: string,
        containerId: string,
        targetId?: string,
        applyFallbacks: boolean = true
    ): string[] {
        const resolvedTargetId = targetId ?? 'block';
        const containerStyles = block.styles?.[resolvedTargetId]?.containers;
        const containers = this.containerManager.getFallbackChain(containerId);

        // Try current container
        if (! applyFallbacks && containerStyles?.[containerId]?.[category]) {
            return Object.keys(containerStyles[containerId][category] || {});
        }

        const properties = new Set<string>();
        for (const container of containers) {
            for (const value of Object.keys(containerStyles?.[container.id]?.[category] || {})) {
                properties.add(value);
            }
        }

        return Array.from(properties);
    }

    // ==========================================================================
    // Preset Inheritance
    // ==========================================================================

    protected getInlineSources(block: BlockData, context: ResolutionContext): ContainerStyleData[] {
        const resolvedTargetId = context.targetId ?? 'block';
        const target = block.styles?.[resolvedTargetId];
        if (!target?.containers) return [];
        return Object.values(target.containers).filter(Boolean) as ContainerStyleData[];
    }

    protected getPresetPropertiesInCategory(category: string, presetId: string, containerId: string, applyFallbacks: boolean): string[] {
        // Get merged preset (handles inheritance)
        const mergedPreset = this.getMergedPreset(presetId);
        if (!mergedPreset?.containers) {
            return [];
        }

        const containers = this.containerManager.getFallbackChain(containerId);

        // Try current container
        if (! applyFallbacks && mergedPreset.containers[containerId]?.[category]) {
            return Object.keys(mergedPreset.containers[containerId][category] || {});
        }

        const properties = new Set<string>();
        for (const container of containers) {
            for (const value of Object.keys(mergedPreset.containers?.[container.id]?.[category] || {})) {
                properties.add(value);
            }
        }

        return Array.from(properties);
    }

    /**
     * Get property from inline styles
     */
    protected getPropertyFromInline(
        block: BlockData,
        containerId: string,
        category: string,
        property: string,
        targetId?: string
    ): { value: StylePropertyValue | undefined } {
        const resolvedTargetId = targetId ?? 'block';
        const value = block.styles?.[resolvedTargetId]?.containers?.[containerId]?.[category]?.[property];
        return {value};
    }

    // ==========================================================================
    // Preset Helpers
    // ==========================================================================

    /**
     * Get property from preset
     */
    protected getPropertyFromPreset(
        presetId: string,
        containerId: string,
        category: string,
        property: string
    ): { value: StylePropertyValue | undefined } {
        const mergedPreset = this.getMergedPreset(presetId);
        const value = mergedPreset?.containers?.[containerId]?.[category]?.[property];
        return {value};
    }

    /**
     * Get property from block type defaults
     */
    protected getPropertyFromBlockDefaults(
        blockType: string,
        category: string,
        property: string
    ): { value: StylePropertyValue | undefined } {
        const defaults = this.blockRegistry?.getBlockDefaults(blockType);
        const value = defaults?.[category]?.[property];
        return {value};
    }

    /**
     * Get merged preset data (resolves inheritance chain)
     */
    protected getMergedPreset(presetId: string): StylePresetData | undefined {
        return this.mergePresetChain(presetId);
    }

    /**
     * Merge preset inheritance chain
     */
    protected mergePresetChain(
        presetId: string,
        visited = new Set<string>()
    ): StylePresetData | undefined {
        // Circular reference check
        if (visited.has(presetId)) {
            console.warn(`[StyleResolver] Circular preset inheritance detected: ${Array.from(visited).join(' → ')} → ${presetId}`);
            return undefined;
        }

        // Max depth check
        if (visited.size > 10) {
            console.warn('[StyleResolver] Max preset inheritance depth exceeded');
            return undefined;
        }

        const preset = this.presetService.getCachedPreset(presetId);
        if (!preset) {
            console.warn(`[StyleResolver] Preset not found: ${presetId}`);
            return undefined;
        }

        visited.add(presetId);

        // If no parent, return this preset's data
        if (!preset.extendsPresetId) {
            return preset.data;
        }

        // Get parent's merged data
        const parentData = this.mergePresetChain(preset.extendsPresetId, visited);

        // Merge parent with this preset
        return mergePresetData(parentData, preset.data);
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a category should be converted based on filter
 */
export function shouldIncludeCategory(
    category: string,
    filter?: StyleFilter
): boolean {
    if (!filter) return true;

    // Only mode: include category if it's in categories list OR if any property from this category is specified
    if (filter.only) {
        const inCategories = filter.only.categories?.includes(category) ?? false;
        const hasPropertyInCategory = filter.only.properties?.some(prop => prop.startsWith(`${category}.`)) ?? false;
        return inCategories || hasPropertyInCategory;
    }

    // Exclude mode: exclude category unless it has properties in include list
    if (filter.exclude) {
        const excludedByCategory = filter.exclude.categories?.includes(category) ?? false;
        if (!excludedByCategory) return true;

        // If category is excluded, check if any property from this category is in include list
        return filter.include?.some(prop => prop.startsWith(`${category}.`)) ?? false;
    }

    return true;
}

/**
 * Check if a specific property should be converted based on filter
 */
export function shouldIncludeProperty(
    category: string,
    propertyName: string,
    filter?: StyleFilter
): boolean {
    if (!filter) return true;

    const fullPath = `${category}.${propertyName}`;

    // Only mode: include only specified properties or properties from specified categories
    if (filter.only) {
        const inCategories = filter.only.categories?.includes(category) ?? false;
        const inProperties = filter.only.properties?.includes(fullPath) ?? false;
        return inCategories || inProperties;
    }

    // Exclude mode with optional include
    if (filter.exclude) {
        const excludedByCategory = filter.exclude.categories?.includes(category) ?? false;
        const excludedByProperty = filter.exclude.properties?.includes(fullPath) ?? false;

        // If explicitly included, allow it
        if (filter.include?.includes(fullPath)) {
            return true;
        }

        // Otherwise, exclude if in exclude list
        return !excludedByCategory && !excludedByProperty;
    }

    return true;
}


/**
 * Filter a ResolvedStyleData object using the same filtering rules as CSS conversion
 *
 * @param resolved - The resolved style data to filter
 * @param filter - The filter configuration to apply
 * @returns A new ResolvedStyleData object with the filter applied
 */
export function filterResolvedData(
    resolved: ResolvedStyleData,
    filter?: StyleFilter
): ResolvedStyleData {
    if (!filter) {
        return resolved;
    }

    const result: ResolvedStyleData = {};

    // Process each category
    for (const [category, data] of Object.entries(resolved)) {
        if (!data) continue;
        if (category === '_internal') continue;

        // Check if category should be included
        if (!shouldIncludeCategory(category, filter)) continue;

        // Filter properties within the category
        const filteredCategory: ResolvedCategoryData = {};
        let hasProperties = false;

        for (const [propertyName, resolvedValue] of Object.entries(data)) {
            if (!resolvedValue) continue;

            // Check if property should be included
            if (shouldIncludeProperty(category, propertyName, filter)) {
                filteredCategory[propertyName] = resolvedValue;
                hasProperties = true;
            }
        }

        // Only add category if it has properties
        if (hasProperties) {
            result[category] = filteredCategory;
        }
    }

    return result;
}
