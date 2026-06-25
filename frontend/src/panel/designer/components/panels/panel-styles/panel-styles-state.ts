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
import type { ResolvedStyleData, ResolvedValue, StyleResolver } from '@/common/core/style-resolver';
import type { CSSUnit } from '@/common/types/css-units';
import type { HomeAssistant } from 'custom-card-helpers';
import {
    cloneStylePropertyValue,
    type ContainerStyleData,
    hasStylePropertyBaseValue,
    hasThemeModeOverrideValue,
    mergePresetData,
    type StylePreset,
    type StylePresetData,
    type StylePropertyValue,
    type ThemeMode,
    type ThemeModeSelection,
    type ThemeModeOverride
} from '@/common/types/style-preset';
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
 * Direct inline style update (bypasses batching)
 */
export interface InlineStyleUpdate {
    category: string;
    property: string;
    value: StylePropertyValue;
    targetId?: string | null;
    containerId?: string;
}

/**
 * State change event detail
 */
export interface StateChangeDetail {
    type: 'selection' | 'container' | 'styles' | 'presets' | 'properties' | 'target' | 'theme';
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
    /** Initial editor preview theme mode */
    themeMode?: ThemeModeSelection;
}

interface StyleUpdateOptions {
    themeModeEligible?: boolean;
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
        this._themeMode = config.themeMode ?? 'light';

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

    protected _themeMode: ThemeModeSelection = 'auto';

    /** Active editor preview theme mode */
    get themeMode(): ThemeModeSelection {
        return this._themeMode;
    }

    // ==========================================================================
    // HA State Subscription
    // ==========================================================================

    protected _resolvedStyles: ResolvedStyleData = {};

    /** Resolved styles for current selection and container */
    get resolvedStyles(): ResolvedStyleData {
        return this._resolvedStyles;
    }

    protected _baseResolvedStyles: ResolvedStyleData = {};

    /** Resolved styles with theme-mode overrides intentionally ignored */
    get baseResolvedStyles(): ResolvedStyleData {
        return this._baseResolvedStyles;
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
     * Set active editor preview theme mode.
     */
    setThemeMode(mode: ThemeModeSelection): void {
        if (this._themeMode === mode) return;

        this._themeMode = mode;
        this._resolveStyles();
        this._emitChange('theme');
    }

    /**
     * Update a property value (batched)
     */
    updateProperty(
        category: string,
        property: string,
        value: unknown,
        unit?: CSSUnit,
        options?: StyleUpdateOptions
    ): void {
        const targetId = this._activeTargetId;
        const key = `${targetId ?? 'block'}:${category}.${property}`;
        const writeThemeOverride = this._shouldWriteThemeModeOverride(options);
        const currentResolved = this._resolveForCurrentWriteMode(category, property, writeThemeOverride);
        const resolvedUnit = this.isPositionUnitLocked(category, property)
            ? undefined
            : (unit ?? currentResolved?.unit);
        const valueData = this._buildPropertyUpdateForCurrentWriteMode(category, property, writeThemeOverride, (target) => {
            target.value = value;
            delete target.binding;
            if (resolvedUnit !== undefined) {
                target.unit = resolvedUnit;
            } else {
                delete target.unit;
            }
        });

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

    /**
     * Apply inline style overrides directly (supports bindings/units)
     */
    applyInlineOverrides(
        updates: InlineStyleUpdate[],
        options?: { skipExisting?: boolean }
    ): void {
        const block = this.selectedBlock;
        if (!block || updates.length === 0) return;

        const styles = {...(block.styles || {})};
        const targetCache = new Map<string, {
            target: { stylePresetId?: string; containers?: { [containerId: string]: ContainerStyleData } };
            containers: { [containerId: string]: ContainerStyleData };
            containerCache: Map<string, ContainerStyleData>;
        }>();

        for (const update of updates) {
            const resolvedTargetId = update.targetId ?? 'block';
            const containerId = update.containerId ?? this._activeContainerId;

            let targetEntry = targetCache.get(resolvedTargetId);
            if (!targetEntry) {
                const existingTarget = styles[resolvedTargetId] || {};
                const containers = {...(existingTarget.containers || {})};
                targetEntry = {
                    target: {...existingTarget},
                    containers,
                    containerCache: new Map(),
                };
                targetCache.set(resolvedTargetId, targetEntry);
            }

            let containerData = targetEntry.containerCache.get(containerId);
            if (!containerData) {
                containerData = {...(targetEntry.containers[containerId] || {})};
                targetEntry.containerCache.set(containerId, containerData);
            }

            if (options?.skipExisting && containerData[update.category]?.[update.property] !== undefined) {
                continue;
            }

            const categoryData = {...(containerData[update.category] || {})};
            categoryData[update.property] = cloneStylePropertyValue(update.value);
            containerData[update.category] = categoryData;
        }

        for (const [targetId, entry] of targetCache.entries()) {
            for (const [containerId, containerData] of entry.containerCache.entries()) {
                entry.containers[containerId] = containerData;
            }
            entry.target.containers = entry.containers;
            styles[targetId] = entry.target;
        }

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
        unit?: CSSUnit,
        options?: StyleUpdateOptions
    ): void {
        const targetId = this._activeTargetId;
        const key = `${targetId ?? 'block'}:${category}.${property}`;
        const writeThemeOverride = this._shouldWriteThemeModeOverride(options);
        const currentResolved = this._resolveForCurrentWriteMode(category, property, writeThemeOverride);
        const resolvedUnit = this.isPositionUnitLocked(category, property)
            ? undefined
            : (unit ?? currentResolved?.unit);
        const valueData = this._buildPropertyUpdateForCurrentWriteMode(category, property, writeThemeOverride, (target) => {
            if (binding) {
                target.binding = binding;
            } else {
                delete target.binding;
                target.value = currentResolved?.value;
            }
            if (resolvedUnit !== undefined) {
                target.unit = resolvedUnit;
            } else {
                delete target.unit;
            }
        });

        this._pendingUpdates.set(key, {
            category,
            property,
            value: valueData,
            targetId,
        });

        this._scheduleFlush();
    }

    /**
     * Reset a property (remove inline override)
     */
    resetProperty(category: string, property: string, options?: StyleUpdateOptions): void {
        const block = this.selectedBlock;
        if (!block) return;

        const resolvedTargetId = this._activeTargetId ?? 'block';
        const styles = {...(block.styles || {})};
        const currentTarget = {...(styles[resolvedTargetId] || {})};
        const containerStyles = {...(currentTarget.containers || {})};
        const currentContainerStyles = {...(containerStyles[this._activeContainerId] || {})};

        if (currentContainerStyles[category]) {
            const categoryData = {...currentContainerStyles[category]};
            const currentValue = categoryData[property];
            const resetThemeModeBucket = Boolean(options?.themeModeEligible && currentValue);

            if (resetThemeModeBucket) {
                const nextValue = cloneStylePropertyValue(currentValue as StylePropertyValue);
                const mode = this._getSelectedThemeOverrideMode();
                if (mode) {
                    delete nextValue.themeModes?.[mode];
                    if (nextValue.themeModes && Object.keys(nextValue.themeModes).length === 0) {
                        delete nextValue.themeModes;
                    }
                } else {
                    delete nextValue.value;
                    delete nextValue.unit;
                    delete nextValue.binding;
                }

                if (this._isEmptyStylePropertyValue(nextValue)) {
                    delete categoryData[property];
                } else {
                    categoryData[property] = nextValue;
                }
            } else {
                delete categoryData[property];
            }

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

    /**
     * Add a mode-specific override for the active preview mode.
     *
     * If the property is inherited from a preset, the new local base is
     * materialized from base-only resolution, not from the active preview mode.
     * This preserves the non-overridden mode's preset behavior.
     */
    enableThemeModeOverride(category: string, property: string): void {
        const mode = this._getSelectedThemeOverrideMode();
        if (!mode) return;
        const valueData = this._getOrMaterializeLocalProperty(category, property);
        const currentResolved = this._resolvedStyles[category]?.[property];
        const override = this._cloneResolvedValueAsThemeOverride(currentResolved, category, property);

        valueData.themeModes = {
            ...(valueData.themeModes ?? {}),
            [mode]: override,
        };

        this._writeStyleProperty(category, property, valueData);
    }

    /**
     * Remove the local mode-specific override for the active preview mode.
     */
    disableThemeModeOverride(category: string, property: string): void {
        const mode = this._getSelectedThemeOverrideMode();
        if (!mode) return;
        const valueData = this._getCurrentContainerStyleProperty(category, property);
        if (!valueData?.themeModes?.[mode]) return;

        const nextValue = cloneStylePropertyValue(valueData);
        delete nextValue.themeModes?.[mode];
        if (nextValue.themeModes && Object.keys(nextValue.themeModes).length === 0) {
            delete nextValue.themeModes;
        }

        this._writeStyleProperty(category, property, nextValue);
    }

    hasThemeModeOverride(category: string, property: string, mode?: ThemeMode): boolean {
        const resolvedMode = mode ?? this._getSelectedThemeOverrideMode();
        return Boolean(resolvedMode && hasThemeModeOverrideValue(this._getCurrentContainerStyleProperty(category, property)?.themeModes?.[resolvedMode]));
    }

    hasAnyThemeModeOverride(category: string, property: string): boolean {
        const themeModes = this._getCurrentContainerStyleProperty(category, property)?.themeModes;
        return hasThemeModeOverrideValue(themeModes?.light) || hasThemeModeOverrideValue(themeModes?.dark);
    }

    hasBaseLocalOverride(category: string, property: string): boolean {
        return hasStylePropertyBaseValue(this._getCurrentContainerStyleProperty(category, property));
    }

    hasCurrentEditModeLocalOverride(category: string, property: string, themeModeEligible: boolean): boolean {
        if (!themeModeEligible) {
            return Boolean(this._getCurrentContainerStyleProperty(category, property));
        }
        const mode = this._getSelectedThemeOverrideMode();
        return mode
            ? this.hasThemeModeOverride(category, property, mode)
            : this.hasBaseLocalOverride(category, property);
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
        this._baseResolvedStyles = {};
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

    protected _getResolvedTargetId(): string {
        return this._activeTargetId ?? 'block';
    }

    protected _getBindingContext(): { defaultEntityId?: string } {
        if (!this._selectedBlockId) return {};
        const resolvedEntity = this.documentModel.resolveEntityForBlock(this._selectedBlockId);
        return {defaultEntityId: resolvedEntity.entityId};
    }

    protected _getCurrentContainerStyleProperty(
        category: string,
        property: string
    ): StylePropertyValue | undefined {
        const block = this.selectedBlock;
        if (!block) return undefined;

        return block.styles?.[this._getResolvedTargetId()]
            ?.containers?.[this._activeContainerId]
            ?.[category]
            ?.[property];
    }

    protected _resolveBaseStyles(applyFallbacks: boolean): ResolvedStyleData {
        if (!this._selectedBlockId) return {};
        return this.styleResolver.resolveBase(
            this._selectedBlockId,
            this._activeContainerId,
            this._getBindingContext(),
            applyFallbacks,
            this._activeTargetId ?? undefined
        );
    }

    protected _getSelectedThemeOverrideMode(): ThemeMode | undefined {
        return this._themeMode === 'auto' ? undefined : this._themeMode;
    }

    protected _shouldWriteThemeModeOverride(options?: StyleUpdateOptions): boolean {
        return Boolean(options?.themeModeEligible && this._getSelectedThemeOverrideMode());
    }

    protected _cloneResolvedValueAsProperty(
        resolved: ResolvedValue | undefined,
        category: string,
        property: string
    ): StylePropertyValue {
        const valueData: StylePropertyValue = {};
        if (resolved?.value !== undefined) {
            valueData.value = resolved.value;
        }
        if (!this.isPositionUnitLocked(category, property) && resolved?.unit !== undefined) {
            valueData.unit = resolved.unit;
        }
        if (resolved?.binding !== undefined) {
            valueData.binding = resolved.binding;
        }
        return cloneStylePropertyValue(valueData);
    }

    protected _cloneResolvedValueAsThemeOverride(
        resolved: ResolvedValue | undefined,
        category: string,
        property: string
    ): ThemeModeOverride {
        const valueData = this._cloneResolvedValueAsProperty(resolved, category, property);
        delete valueData.themeModes;
        return valueData;
    }

    protected _isEmptyStylePropertyValue(value: StylePropertyValue): boolean {
        return !hasStylePropertyBaseValue(value)
            && !hasThemeModeOverrideValue(value.themeModes?.light)
            && !hasThemeModeOverrideValue(value.themeModes?.dark);
    }

    protected _getOrMaterializeLocalProperty(category: string, property: string): StylePropertyValue {
        const existing = this._getCurrentContainerStyleProperty(category, property);
        if (existing) {
            const valueData = cloneStylePropertyValue(existing);
            if (!hasStylePropertyBaseValue(valueData)) {
                const baseResolved = this._resolveBaseStyles(true)[category]?.[property];
                const baseValue = this._cloneResolvedValueAsProperty(baseResolved, category, property);
                if (baseValue.value !== undefined) valueData.value = baseValue.value;
                if (baseValue.unit !== undefined) valueData.unit = baseValue.unit;
                if (baseValue.binding !== undefined) valueData.binding = baseValue.binding;
            }
            return valueData;
        }

        const baseResolved = this._resolveBaseStyles(true)[category]?.[property];
        return this._cloneResolvedValueAsProperty(baseResolved, category, property);
    }

    protected _resolveForCurrentWriteMode(
        category: string,
        property: string,
        writeThemeOverride: boolean
    ): ResolvedValue | undefined {
        return writeThemeOverride
            ? this._resolvedStyles[category]?.[property]
            : this._baseResolvedStyles[category]?.[property];
    }

    protected _buildPropertyUpdateForCurrentWriteMode(
        category: string,
        property: string,
        writeThemeOverride: boolean,
        update: (target: StylePropertyValue | ThemeModeOverride) => void
    ): StylePropertyValue {
        const valueData = this._getOrMaterializeLocalProperty(category, property);
        const mode = this._getSelectedThemeOverrideMode();
        if (writeThemeOverride && mode) {
            const override: ThemeModeOverride = {...(valueData.themeModes?.[mode] ?? {})};
            update(override);
            valueData.themeModes = {
                ...(valueData.themeModes ?? {}),
                [mode]: override,
            };
            return cloneStylePropertyValue(valueData);
        }

        update(valueData);
        return cloneStylePropertyValue(valueData);
    }

    protected _writeStyleProperty(category: string, property: string, value: StylePropertyValue): void {
        const block = this.selectedBlock;
        if (!block) return;

        const resolvedTargetId = this._getResolvedTargetId();
        const styles = {...(block.styles || {})};
        const currentTarget = {...(styles[resolvedTargetId] || {})};
        const containerStyles = {...(currentTarget.containers || {})};
        const currentContainerStyles: ContainerStyleData = {
            ...(containerStyles[this._activeContainerId] || {}),
        };
        const categoryData = {...(currentContainerStyles[category] || {})};

        categoryData[property] = cloneStylePropertyValue(value);
        currentContainerStyles[category] = categoryData;
        containerStyles[this._activeContainerId] = currentContainerStyles;
        currentTarget.containers = containerStyles;
        styles[resolvedTargetId] = currentTarget;

        this.documentModel.updateBlock(block.id, {styles});
        this._resolveStyles();
        this._emitChange('styles');
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
            this._baseResolvedStyles = {};
            return;
        }

        const bindingContext = this._getBindingContext();
        this._resolvedStyles = this.styleResolver.resolve(
            this._selectedBlockId,
            this._activeContainerId,
            bindingContext,
            false,
            this._activeTargetId ?? undefined,
            this._getSelectedThemeOverrideMode()
        );
        this._baseResolvedStyles = this.styleResolver.resolveBase(
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
    protected _buildPresetData(): StylePresetData {
        const containerData: ContainerStyleData = {};
        const rawContainerData = this.selectedBlock?.styles?.[this._getResolvedTargetId()]
            ?.containers?.[this._activeContainerId];

        for (const [category, properties] of Object.entries(this._resolvedStyles)) {
            if (properties) {
                containerData[category] = {};
                for (const [prop, resolved] of Object.entries(properties)) {
                    const rawInline = rawContainerData?.[category]?.[prop];
                    if (rawInline) {
                        containerData[category]![prop] = cloneStylePropertyValue(rawInline);
                        continue;
                    }
                    const rawPreset = this._getRawPresetProperty(resolved.presetId, resolved.originContainer, category, prop);
                    if (rawPreset) {
                        containerData[category]![prop] = cloneStylePropertyValue(rawPreset);
                        continue;
                    }
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

    protected _getMergedPresetData(presetId: string | undefined, visited = new Set<string>()): StylePresetData | undefined {
        if (!presetId || visited.has(presetId) || visited.size > 10) return undefined;
        const preset = this._presets.find((candidate) => candidate.id === presetId);
        if (!preset) return undefined;
        visited.add(presetId);
        return mergePresetData(
            this._getMergedPresetData(preset.extendsPresetId, visited),
            preset.data
        );
    }

    protected _getRawPresetProperty(
        presetId: string | undefined,
        containerId: string | undefined,
        category: string,
        property: string
    ): StylePropertyValue | undefined {
        if (!presetId || !containerId) return undefined;
        const presetData = this._getMergedPresetData(presetId);
        return presetData?.containers?.[containerId]?.[category]?.[property];
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
