/**
 * Style Panel State Manager
 *
 * Centralized state management for the style panel.
 * Handles batching of property updates and coordination between services.
 */

import type { StylePresetsService } from '@/common/api/services/style-presets-service';
import type { BlockPanelConfig, BlockPanelTargetStyles } from '@/common/blocks/types';
import { BindingEvaluator, type ValueBinding } from '@/common/core/binding';
import type { DocumentModel } from '@/common/core/model/document-model';
import type { BlockData } from '@/common/core/model/types';
import type { ResolvedStyleData, StyleResolver } from '@/common/core/style-resolver';
import type { CSSUnit } from '@/common/types/css-units';
import type { HomeAssistant } from 'custom-card-helpers';
import type { ContainerStyleData, StylePreset, StylePropertyValue } from '@/common/types/style-preset';
import { PropertyConfigResolver, type ResolvedPropertyConfig } from './property-config-resolver';

// ============================================================================
// Types
// ============================================================================

/**
 * Pending update for batching
 */
interface PendingUpdate {
    category: string;
    property: string;
    value: StylePropertyValue;
    targetId: string | null;
}

/**
 * State change event detail
 */
export interface StateChangeDetail {
    type: 'selection' | 'container' | 'styles' | 'presets' | 'properties' | 'target';
}

/**
 * Style panel state configuration
 */
export interface StylePanelStateConfig {
    /** Document model instance */
    documentModel: DocumentModel;
    /** Preset service instance */
    presetService: StylePresetsService;
    /** Style resolver instance (shared with renderer) */
    styleResolver: StyleResolver;
    /** Home Assistant instance (for binding evaluation) */
    hass?: HomeAssistant;
    /** Initial container ID */
    initialContainerId: string;
}

// ============================================================================
// Style Panel State Manager
// ============================================================================

/**
 * Manages state for the style panel
 */
export class PanelStylesState extends EventTarget {
    // Services
    protected documentModel: DocumentModel;
    protected presetService: StylePresetsService;
    protected styleResolver: StyleResolver;
    protected propertyConfigResolver: PropertyConfigResolver;
    protected bindingEvaluator?: BindingEvaluator;

    // Home Assistant instance
    protected hass?: HomeAssistant;
    // Batching
    protected _pendingUpdates: Map<string, PendingUpdate> = new Map();
    protected _flushScheduled = false;
    protected _flushTimeoutId: number | null = null;
    // Subscriptions
    protected _presetUnsubscribe: (() => void) | null = null;
    protected _stateSubscription: (() => void) | null = null;
    constructor(config: StylePanelStateConfig) {
        super();

        this.documentModel = config.documentModel;
        this.presetService = config.presetService;
        this.styleResolver = config.styleResolver; // Use provided resolver instance
        this.hass = config.hass;
        this._activeContainerId = config.initialContainerId;

        this.propertyConfigResolver = new PropertyConfigResolver();

        // Initialize binding evaluator if hass is available
        if (this.hass) {
            this.bindingEvaluator = new BindingEvaluator(this.hass, {
                resolveSlotEntity: (slotId) => this.documentModel.resolveSlotEntity(slotId),
                onTemplateResult: () => {
                    this._resolveStyles();
                    this._emitChange('styles');
                },
            });
            this.styleResolver.setBindingEvaluator(this.bindingEvaluator);
        }

        // Subscribe to preset updates
        this._presetUnsubscribe = this.presetService.subscribe((presets) => {
            this._presets = presets;
            this._emitChange('presets');

            // Re-resolve if we have a selection
            if (this._selectedBlockId) {
                this._resolveStyles();
            }
        });

        // Subscribe to HA state changes for real-time binding updates
        if (this.hass) {
            this._subscribeToStateChanges();
        }
    }

    // State
    protected _selectedBlockId: string | null = null;

    /** Currently selected block ID */
    get selectedBlockId(): string | null {
        return this._selectedBlockId;
    }

    protected _activeContainerId!: string;

    /** Active container ID */
    get activeContainerId(): string {
        return this._activeContainerId;
    }

    protected _activeTargetId: string | null = null;

    /** Active target ID */
    get activeTargetId(): string | null {
        return this._activeTargetId;
    }

    // ==========================================================================
    // HA State Subscription
    // ==========================================================================

    protected _resolvedStyles: ResolvedStyleData = {};

    /** Resolved styles for current selection and container */
    get resolvedStyles(): ResolvedStyleData {
        return this._resolvedStyles;
    }

    protected _visibleProperties: ResolvedPropertyConfig | null = null;

    /** Visible properties configuration for current block type */
    get visibleProperties(): ResolvedPropertyConfig | null {
        return this._visibleProperties;
    }

    protected _presets: StylePreset[] = [];

    /** Available presets */
    get presets(): StylePreset[] {
        return this._presets;
    }

    /** Currently selected block data */
    get selectedBlock(): BlockData | null {
        if (!this._selectedBlockId) return null;
        return this.documentModel.blocks[this._selectedBlockId] || null;
    }

    // ==========================================================================
    // Getters
    // ==========================================================================

    /** Applied preset ID for current block */
    get appliedPresetId(): string | undefined {
        const block = this.selectedBlock;
        if (!block) return undefined;
        const activeTarget = this._getActiveTargetStyle(block.id);
        if (!activeTarget) return undefined;
        return block.styles?.[activeTarget.targetId]?.stylePresetId;
    }

    /** Applied preset for current block */
    get appliedPreset(): StylePreset | undefined {
        const presetId = this.appliedPresetId;
        if (!presetId) return undefined;
        return this._presets.find((p) => p.id === presetId);
    }

    /**
     * Update Home Assistant instance (e.g., when hass changes)
     */
    setHass(hass: HomeAssistant): void {
        this.hass = hass;

        // Update binding evaluator
        this.bindingEvaluator = new BindingEvaluator(hass, {
            resolveSlotEntity: (slotId) => this.documentModel.resolveSlotEntity(slotId),
            onTemplateResult: () => {
                this._resolveStyles();
                this._emitChange('styles');
            },
        });
        this.styleResolver.setBindingEvaluator(this.bindingEvaluator);

        // Re-subscribe to state changes
        if (!this._stateSubscription) {
            this._subscribeToStateChanges();
        }

        // Re-resolve if we have a selection
        if (this._selectedBlockId) {
            this._resolveStyles();
            this._emitChange('styles');
        }
    }

    /**
     * Set selected block
     */
    setSelectedBlock(blockId: string | null): void {
        if (this._selectedBlockId === blockId) return;

        this._selectedBlockId = blockId;
        this._activeTargetId = null;

        this._resolveVisibleProperties();

        // Resolve styles
        this._resolveStyles();
        this._emitChange('selection');
        this.documentModel.selectStyleTarget(null);
    }

    /**
     * Set active container
     */
    setActiveContainer(containerId: string): void {
        if (this._activeContainerId === containerId) return;

        this._activeContainerId = containerId;

        // Re-resolve styles for new container
        this._resolveVisibleProperties();
        this._resolveStyles();
        this._emitChange('container');
    }

    /**
     * Set active target for the current block
     */
    setActiveTarget(targetId: string | null): void {
        if (this._activeTargetId === targetId) return;

        this._activeTargetId = targetId;
        this._resolveVisibleProperties();

        this._resolveStyles();
        this._emitChange('target');
        this.documentModel.selectStyleTarget(targetId);
    }

    /**
     * Update a property value (batched)
     */
    updateProperty(category: string, property: string, value: unknown, unit?: CSSUnit): void {
        const targetId = this._activeTargetId;
        const key = `${targetId ?? 'block'}:${category}.${property}`;
        const resolvedUnit = this.isPositionUnitLocked(category, property)
            ? undefined
            : (unit ?? this._resolvedStyles[category]?.[property]?.unit);
        const valueData: StylePropertyValue = {value};

        if (resolvedUnit !== undefined) {
            valueData.unit = resolvedUnit;
        }

        this._pendingUpdates.set(key, {
            category,
            property,
            value: valueData,
            targetId,
        });
        this._scheduleFlush();
    }

    updateProperties(
        properties: Array<{ category: string, property: string, value: unknown, unit?: CSSUnit }>,
        targetId: string | null = null
    ): void {
        const block = this.selectedBlock;
        if (!block) return;

        const resolvedTargetId = targetId ?? 'block';
        const styles = {...(block.styles || {})};
        const currentTarget = {...(styles[resolvedTargetId] || {})};
        const containerStyles = {...(currentTarget.containers || {})};
        const currentContainerStyles: ContainerStyleData = {
            ...(containerStyles[this._activeContainerId] || {}),
        };

        for (const update of properties.values()) {
            if (!currentContainerStyles[update.category]) {
                currentContainerStyles[update.category] = {};
            }
            const valueData: StylePropertyValue = {value: update.value};

            if (update.unit !== undefined && !this.isPositionUnitLocked(update.category, update.property)) {
                valueData.unit = update.unit;
            }

            currentContainerStyles[update.category]![update.property] = valueData;
        }

        containerStyles[this._activeContainerId] = currentContainerStyles;
        currentTarget.containers = containerStyles;
        styles[resolvedTargetId] = currentTarget;

        this.documentModel.updateBlock(block.id, {styles});

        // Re-resolve
        this._resolveStyles();
        this._emitChange('styles');
    }

    // ==========================================================================
    // Selection and Container
    // ==========================================================================

    /**
     * Update a property binding (batched)
     */
    updateBinding(
        category: string,
        property: string,
        binding: ValueBinding | null,
        unit?: CSSUnit
    ): void {
        const targetId = this._activeTargetId;
        const key = `${targetId ?? 'block'}:${category}.${property}`;
        const currentResolved = this._resolvedStyles[category]?.[property];
        const resolvedUnit = this.isPositionUnitLocked(category, property)
            ? undefined
            : (unit ?? currentResolved?.unit);

        if (binding) {
            const valueData: StylePropertyValue = {binding};
            if (resolvedUnit !== undefined) {
                valueData.unit = resolvedUnit;
            }
            this._pendingUpdates.set(key, {
                category,
                property,
                value: valueData,
                targetId,
            });
        } else {
            // Remove binding, keep current value
            const valueData: StylePropertyValue = {value: currentResolved?.value};
            if (resolvedUnit !== undefined) {
                valueData.unit = resolvedUnit;
            }
            this._pendingUpdates.set(key, {
                category,
                property,
                value: valueData,
                targetId,
            });
        }

        this._scheduleFlush();
    }

    /**
     * Reset a property (remove inline override)
     */
    resetProperty(category: string, property: string): void {
        const block = this.selectedBlock;
        if (!block) return;

        const resolvedTargetId = this._activeTargetId ?? 'block';
        const styles = {...(block.styles || {})};
        const currentTarget = {...(styles[resolvedTargetId] || {})};
        const containerStyles = {...(currentTarget.containers || {})};
        const currentContainerStyles = {...(containerStyles[this._activeContainerId] || {})};

        if (currentContainerStyles[category]) {
            const categoryData = {...currentContainerStyles[category]};
            delete categoryData[property];

            if (Object.keys(categoryData).length === 0) {
                delete currentContainerStyles[category];
            } else {
                currentContainerStyles[category] = categoryData;
            }
        }

        if (Object.keys(currentContainerStyles).length === 0) {
            delete containerStyles[this._activeContainerId];
        } else {
            containerStyles[this._activeContainerId] = currentContainerStyles;
        }

        if (Object.keys(containerStyles).length === 0) {
            if (currentTarget.stylePresetId) {
                delete currentTarget.containers;
                styles[resolvedTargetId] = currentTarget;
            } else {
                delete styles[resolvedTargetId];
            }
        } else {
            currentTarget.containers = containerStyles;
            styles[resolvedTargetId] = currentTarget;
        }

        this.documentModel.updateBlock(block.id, {styles});

        // Re-resolve
        this._resolveStyles();
        this._emitChange('styles');
    }

    // ==========================================================================
    // Property Updates
    // ==========================================================================

    /**
     * Apply a preset to the current block
     */
    applyPreset(presetId: string | null): void {
        const block = this.selectedBlock;
        if (!block) return;

        const activeTarget = this._getActiveTargetStyle(block.id);
        if (!activeTarget) return;

        const targetId = activeTarget.targetId;
        const styles = {...(block.styles || {})};
        const currentTarget = {...(styles[targetId] || {})};

        if (presetId) {
            currentTarget.stylePresetId = presetId;
        } else {
            delete currentTarget.stylePresetId;
        }

        if (!currentTarget.stylePresetId && !currentTarget.containers) {
            delete styles[targetId];
        } else {
            styles[targetId] = currentTarget;
        }

        this.documentModel.updateBlock(block.id, {styles});

        // Re-resolve
        this._resolveStyles();
        this._emitChange('styles');
    }

    /**
     * Create a new preset from current styles
     */
    async createPreset(
        name: string,
        description?: string,
        extendsPresetId?: string
    ): Promise<StylePreset> {
        // Build preset data from current resolved styles
        const presetData = this._buildPresetData();

        const preset = await this.presetService.createPreset({
            name,
            description,
            extendsPresetId,
            data: presetData,
        });

        return preset;
    }

    /**
     * Delete a preset
     */
    async deletePreset(presetId: string): Promise<void> {
        await this.presetService.deletePreset(presetId);

        // If deleted preset was applied to current block, clear it
        if (this.appliedPresetId === presetId) {
            this.applyPreset(null);
        }
    }

    /**
     * Force flush any pending updates
     */
    flush(): void {
        if (this._flushTimeoutId !== null) {
            if ('cancelIdleCallback' in window) {
                window.cancelIdleCallback(this._flushTimeoutId);
            } else {
                cancelAnimationFrame(this._flushTimeoutId);
            }
        }
        this._flush();
    }

    /**
     * Handle document model changes
     */
    handleDocumentChange(blockId: string): void {
        if (this._selectedBlockId) {
            this._resolveVisibleProperties();
            this._emitChange('properties');
        }

        // Re-resolve styles if it's the selected block
        if (blockId === this._selectedBlockId) {
            this._resolveStyles();
            this._emitChange('styles');
        }
    }

    /**
     * Cleanup resources
     */
    dispose(): void {
        // Cancel any pending flush
        if (this._flushTimeoutId !== null) {
            if ('cancelIdleCallback' in window) {
                window.cancelIdleCallback(this._flushTimeoutId);
            } else {
                cancelAnimationFrame(this._flushTimeoutId);
            }
        }

        // Unsubscribe from presets
        if (this._presetUnsubscribe) {
            this._presetUnsubscribe();
            this._presetUnsubscribe = null;
        }

        // Unsubscribe from HA state changes
        if (this._stateSubscription) {
            this._stateSubscription();
            this._stateSubscription = null;
        }

        // Clear state
        this._selectedBlockId = null;
        this._activeTargetId = null;
        this._resolvedStyles = {};
        this._visibleProperties = null;
        this._pendingUpdates.clear();
    }

    // ==========================================================================
    // Preset Management
    // ==========================================================================

    /**
     * Subscribe to Home Assistant state changes
     */
    protected async _subscribeToStateChanges(): Promise<void> {
        if (!this.hass?.connection) return;

        try {
            const unsub = await this.hass.connection.subscribeEvents(
                () => this._handleEntityStateChange(),
                'state_changed'
            );
            this._stateSubscription = unsub;
        } catch (error) {
            console.warn('[StylePanelState] Failed to subscribe to state changes:', error);
        }
    }

    /**
     * Handle entity state changes
     */
    protected _handleEntityStateChange(): void {
        // Only re-resolve if we have bindings that could be affected
        if (this._selectedBlockId && this._hasBindingsInResolvedStyles()) {
            this._resolveStyles();
            this._emitChange('styles');
        }
    }

    /**
     * Check if any resolved style has a binding
     */
    protected _hasBindingsInResolvedStyles(): boolean {
        for (const category of Object.values(this._resolvedStyles)) {
            if (category) {
                for (const resolved of Object.values(category)) {
                    if (resolved?.binding) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // ==========================================================================
    // Batching
    // ==========================================================================

    protected _getPanelConfig(blockId: string): BlockPanelConfig | null {
        const element = this.documentModel.getElement(blockId);
        return element?.getPanelConfig() ?? null;
    }

    protected _getTargetStyles(blockId: string): BlockPanelTargetStyles | null {
        return this._getPanelConfig(blockId)?.targetStyles ?? null;
    }

    protected _getActiveTargetStyle(blockId: string): { targetId: string; target: BlockPanelTargetStyles[string] } | null {
        const targetStyles = this._getTargetStyles(blockId);
        if (!targetStyles || Object.keys(targetStyles).length === 0) {
            return null;
        }

        const targetId = this._activeTargetId ?? 'block';
        const target = targetStyles[targetId];
        if (!target) return null;

        return {targetId, target};
    }

    protected _resolveVisibleProperties(): void {
        const blockId = this._selectedBlockId;
        if (!blockId) {
            this._visibleProperties = null;
            return;
        }

        const block = this.documentModel.blocks[blockId];
        if (!block) {
            this._visibleProperties = null;
            return;
        }

        const activeTarget = this._getActiveTargetStyle(blockId);
        if (!activeTarget) {
            this._visibleProperties = this.propertyConfigResolver.resolve({});
            return;
        }

        this._visibleProperties = this.propertyConfigResolver.resolve(activeTarget.target.styles);
    }

    protected isPositionUnitLocked(category: string, property: string): boolean {
        return category === 'layout' && (property === 'positionX' || property === 'positionY');
    }

    // ==========================================================================
    // Resolution
    // ==========================================================================

    /**
     * Schedule flush of pending updates
     */
    protected _scheduleFlush(): void {
        if (this._flushScheduled) return;
        this._flushScheduled = true;

        // Use requestIdleCallback if available, otherwise requestAnimationFrame
        if ('requestIdleCallback' in window) {
            this._flushTimeoutId = window.requestIdleCallback(
                () => this._flush(),
                {timeout: 16}
            ) as unknown as number;
        } else {
            this._flushTimeoutId = requestAnimationFrame(() => this._flush()) as number;
        }
    }

    /**
     * Flush pending updates to document model
     */
    protected _flush(): void {
        this._flushScheduled = false;
        this._flushTimeoutId = null;

        const block = this.selectedBlock;
        if (!block || this._pendingUpdates.size === 0) return;

        const updatesByTarget = new Map<string | null, PendingUpdate[]>();
        for (const update of this._pendingUpdates.values()) {
            const targetId = update.targetId ?? null;
            if (!updatesByTarget.has(targetId)) {
                updatesByTarget.set(targetId, []);
            }
            updatesByTarget.get(targetId)!.push(update);
        }

        const styles = {...(block.styles || {})};
        let stylesUpdated = false;

        for (const [targetId, updates] of updatesByTarget.entries()) {
            const resolvedTargetId = targetId ?? 'block';
            const currentTarget = {...(styles[resolvedTargetId] || {})};
            const targetContainerStyles = {...(currentTarget.containers || {})};
            const currentContainerStyles: ContainerStyleData = {
                ...(targetContainerStyles[this._activeContainerId] || {}),
            };

            for (const update of updates) {
                if (!currentContainerStyles[update.category]) {
                    currentContainerStyles[update.category] = {};
                }
                currentContainerStyles[update.category]![update.property] = update.value;
            }

            targetContainerStyles[this._activeContainerId] = currentContainerStyles;
            currentTarget.containers = targetContainerStyles;
            styles[resolvedTargetId] = currentTarget;
            stylesUpdated = true;
        }

        if (stylesUpdated) {
            this.documentModel.updateBlock(block.id, {styles});
        }

        // Clear pending
        this._pendingUpdates.clear();

        // Re-resolve
        this._resolveStyles();
        this._emitChange('styles');
    }

    // ==========================================================================
    // Events
    // ==========================================================================

    /**
     * Resolve styles for current selection and container
     */
    protected _resolveStyles(): void {
        if (!this._selectedBlockId) {
            this._resolvedStyles = {};
            return;
        }

        // Resolve entity for this block using the new entity configuration system
        const resolvedEntity = this.documentModel.resolveEntityForBlock(this._selectedBlockId);
        const defaultEntityId = resolvedEntity.entityId;
        const bindingContext = {defaultEntityId};

        this._resolvedStyles = this.styleResolver.resolve(
            this._selectedBlockId,
            this._activeContainerId,
            bindingContext,
            false,
            this._activeTargetId ?? undefined
        );
    }

    // ==========================================================================
    // Lifecycle
    // ==========================================================================

    /**
     * Build preset data from current resolved styles
     */
    protected _buildPresetData(): import('@/common/types/style-preset').StylePresetData {
        const containerData: ContainerStyleData = {};

        for (const [category, properties] of Object.entries(this._resolvedStyles)) {
            if (properties) {
                containerData[category] = {};
                for (const [prop, resolved] of Object.entries(properties)) {
                    if (this.isPositionUnitLocked(category, prop)) {
                        containerData[category]![prop] = {
                            value: resolved.value,
                            binding: resolved.binding,
                        };
                        continue;
                    }
                    containerData[category]![prop] = {
                        value: resolved.value,
                        binding: resolved.binding,
                        unit: resolved.unit,
                    };
                }
            }
        }

        return {
            containers: {
                [this._activeContainerId]: containerData,
            },
        };
    }

    /**
     * Emit state change event
     */
    protected _emitChange(type: StateChangeDetail['type']): void {
        this.dispatchEvent(
            new CustomEvent<StateChangeDetail>('state-change', {
                detail: {type},
            })
        );
    }
}
