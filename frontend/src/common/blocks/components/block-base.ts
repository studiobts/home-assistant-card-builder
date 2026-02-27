import type { TraitPropertyValue } from '@/common/blocks/core/properties';
import type { ActionTargetDefinition, BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlocksRenderer } from "@/common/blocks/core/renderer/blocks-renderer";
import { blocksRendererContext } from "@/common/blocks/core/renderer/blocks-renderer-context";
import type { ResolvedRenderContext } from "@/common/blocks/core/renderer/types";
import type { BlockPanelConfig, BlockInterface } from '@/common/blocks/types';
import { BindingEvaluator } from '@/common/core/binding';
import {
    buildTemplateVariables,
    HaTemplateSession,
    TEMPLATE_GENERIC_ERROR,
    type TemplateKeywordValue
} from '@/common/core/template/ha-template-service';
import { type ContainerManager, containerManagerContext } from "@/common/core/container-manager/container-manager";
import { DragDropBlock } from "@/common/core/drag-and-drop";
import { type EnvironmentContext, environmentContext } from "@/common/core/environment-context";
import { type EventBus, eventBusContext } from "@/common/core/event-bus";
import {
    type BlockChangeDetail,
    type BlockData,
    type BlockMovedDetail,
    type BlockSelectionChangedDetail,
    type ActionConfig,
    type ActionSlot,
    type ActionTrigger,
    type DocumentModel,
    documentModelContext,
} from '@/common/core/model';
import type { StyleOutputConfig } from '@/common/core/style-resolver';
import { dispatchBlockAction } from '@/common/blocks/core/actions/action-dispatcher';
import { hassContext } from '@/common/types';
import { consume } from "@lit/context";
import type { HomeAssistant } from "custom-card-helpers";
import type { HassEntity } from "home-assistant-js-websocket";
import { css, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';

/**
 * Property value with template support
 */
// FIXME: move away from here
export interface TemplateValue {
    value: string;
    isTemplate: boolean;
}

export interface TemplateResolveOptions {
    /** Unique key for template session (defaults to property name) */
    key?: string;
    /** Variables passed to the template render */
    variables?: Record<string, unknown>;
    /** Keyword values passed to the template render */
    keywords?: TemplateKeywordValue[];
    /** Debounce for template updates */
    debounceMs?: number;
}

export class BlockBase extends DragDropBlock implements BlockInterface {
    static styles = [
        css`
            :host {
                display: block;
                user-select: none;
                outline-offset: -2px;
                box-sizing: border-box;
                pointer-events: auto;
                line-height: normal;
                padding: 4px;
                transition:
                    /* all 0.5s ease, */ /* FIXME: This may be very dangerous, we must add transition only for some properties */
                    color 0.35s ease,
                    border-color 0.35s ease,
                    box-shadow 0.35s ease,
                    background 0.35s ease,
                    background-color 0.35s ease,
                    background-image 0.35s ease,
                    background-size 0.35s ease,
                    background-position 0.35s ease,
                    width 0.35s ease,
                    height 0.35s ease,
                    opacity 0.15s ease,
                    outline 0.15s ease;
            }

            :host(.block-absolute) {
                position: absolute;
            }

            :host(.block-flow) {
                position: relative;
                width: auto;
            }

            :host(.block-outline-enabled) {
                outline: 1px dashed rgba(100, 100, 100, 0.75);
            }
            
            :host(.block-selected) {
                transition: none !important;
                outline: 2px solid var(--accent-color, #0078d4);
                z-index: 1000;
            }

            :host(.block-anchor-highlight) {
                outline: 2px solid #ffc107 !important;
                outline-offset: 1px;
                box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
                transition: none !important;
                z-index: 999;
            }
            
            :host(.builder:hover) {
                cursor: pointer;
            }

            :host(.snap-highlight) {
                outline: 1px solid #ff4081 !important;
                outline-offset: 1px !important;
                box-shadow: 0 0 0 4px rgba(255, 64, 129, 0.15) !important;
                transition: none !important;
                z-index: 999;
            }

            .style-target-active {
                outline: 1px dashed var(--accent-color, #0078d4);
                outline-offset: 2px;
                box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.12);
            }

            :host(.actions-pass-through) {
                pointer-events: none;
            }

            :host(.block-selection-disabled) {
                pointer-events: none;
            }

            :host(.action-feedback) {
                opacity: 0.7;
                transition: opacity 0.15s ease;
            }
        `,
    ];

    @consume({context: environmentContext, subscribe: true})
    @state()
    protected environment!: EnvironmentContext;

    @consume({context: blocksRendererContext})
    protected renderer!: BlocksRenderer;

    @consume({context: documentModelContext})
    protected documentModel!: DocumentModel;

    @consume({context: containerManagerContext})
    protected containerManager!: ContainerManager;

    @consume({context: eventBusContext})
    protected eventBus!: EventBus;

    @consume({context: hassContext, subscribe: true})
    @property({attribute: false})
    hass?: HomeAssistant;

    @property({type: Object})
    block?: BlockData;

    @property({type: String})
    activeContainerId!: string;

    @state() protected entity?: string;
    @state() protected activeStyleTargetId?: string | null;
    @state() protected isDragging: boolean = false;
    @state() protected isResizing: boolean = false;
    @state() protected canvasWidth: number = 0;
    @state() protected canvasHeight: number = 0;

    protected selected: boolean = false;
    protected resolvedRenderContext!: ResolvedRenderContext;
    protected bindingEvaluator?: BindingEvaluator;
    private templateSessions = new Map<string, HaTemplateSession>();

    protected actionHoldDelay = 1000;
    protected actionDoubleTapDelay = 250;

    private _holdTimeoutId: number | null = null;
    private _tapTimeoutId: number | null = null;
    private _lastTapTimestamp = 0;
    private _lastTapTarget: string | null = null;
    private _holdTriggered = false;
    private _pointerId: number | null = null;
    private _pressTarget: string | null = null;
    private _pressStartX = 0;
    private _pressStartY = 0;
    private _pointerMoved = false;
    private _feedbackTimeoutId: number | null = null;
    private _actionListenersActive = false;

    public get isBlockDraggable(): boolean {
        if (!this.block) return false;
        return this.block.layout !== 'static';
    }

    public get isBlockDroppable(): boolean {
        if (!this.block) return false;
        return this.block.layout !== 'static';
    }

    // =========================================================================
    // Configuration

    // =========================================================================
    /**
     * Slot ID for runtime entity binding (when mode is 'slot')
     */
    protected get slotId(): string | undefined {
        return this.block?.entityConfig?.slotId;
    }

    // =========================================================================
    /**
     * Get block configuration for registration
     * Override in subclasses to provide block definition and defaults
     */
    static getBlockConfig(): BlockRegistration | null {
        return null;
    }

    // =========================================================================
    // Lifecycle
    // =========================================================================

    /**
     * Returns available action target IDs for a specific block instance.
     * Override in subclasses when target availability depends on block props.
     */
    static getAvailableActionTargetIds(_block: BlockData, targetDefs: Record<string, ActionTargetDefinition>): string[] {
        return Object.keys(targetDefs);
    }

    /**
     * Returns output mode configuration for resolved styles.
     * Override in subclasses to output CSS variables for specific properties.
     */
    static getStyleOutputConfig(_block: BlockData, _targetId?: string): StyleOutputConfig | null {
        return null;
    }

    protected hasNativeActions(): boolean {
        return false;
    }

    protected getNativeActionTargetIds(): string[] {
        return [];
    }

    protected handleNativePointerDown(_e: PointerEvent, _targetId: string | null): boolean {
        return false;
    }

    /**
     * Retrieves the configuration settings for the panel.
     */
    getPanelConfig(): BlockPanelConfig {
        return {};
    }

    connectedCallback() {
        super.connectedCallback();

        // Get entity
        this.entity = this.resolvedEntityId();
        // Check if we are selected
        this.selected = this.documentModel.selectedId === this.block?.id;

        if (this.environment.isBuilder) {
            this.documentModel.addEventListener('change', (e: Event) => {
                const detail = (e as CustomEvent)?.detail as BlockChangeDetail;

                // If we are the parent of the changed block, update ourselves
                // FIXME: this can be optimized since we need an update only when:
                // FIXME: - we become the parent (block dropped)
                // FIXME: - the block change order (block reordered)
                // FIXME: - the block is deleted
                if (detail.block?.parentId === this.block!.id) {
                    this.requestUpdate();
                }
            });

            this.documentModel.addEventListener('block-moved', (e: Event) => {
                const detail = (e as CustomEvent).detail as BlockMovedDetail;
                if (detail.oldParentId === this.block!.id || detail.newParentId === this.block!.id) {
                    this.requestUpdate();
                }
            });

            this.documentModel.addEventListener('selection-changed', (e: Event) => {
                const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
                this.selected = this.block!.id === detail.selectedId;

                this.selected ?
                    this.classList.add('block-selected') :
                    this.classList.remove('block-selected');
            });

            this.documentModel.addEventListener('link-anchor-highlight-changed', (e: Event) => {
                const detail = (e as CustomEvent<{ blockId: string | null }>).detail;
                this.classList.toggle('block-anchor-highlight', this.block!.id === detail?.blockId);
            });

            this.documentModel.addEventListener('slots-changed', () => {
                const resolvedEntity = this.resolvedEntityId();
                if (this.entity !== resolvedEntity) {
                    this.entity = resolvedEntity;
                }
                this.requestUpdate();
            });

            this.eventBus.addEventListener('block-drag-start', ({block}) => {
                if (block.id === this.block!.id) {
                    this.isDragging = true;
                }
            });

            this.eventBus.addEventListener('block-drag-end', ({block}) => {
                if (block.id === this.block!.id) {
                    this.isDragging = false;
                }
            });

            this.eventBus.addEventListener('block-resize-start', ({block}) => {
                if (block.id === this.block!.id) {
                    this.isResizing = true;
                }
            });

            this.eventBus.addEventListener('block-resize-end', ({block}) => {
                if (block.id === this.block!.id) {
                    this.isResizing = false;
                }
            });

            this.eventBus.addEventListener(
                'block-selection-disabled',
                (data: { disabled?: boolean; excluded?: string }) => {
                    if (!this.block) return;
                    const disabled = Boolean(data?.disabled);
                    const excludedId = data?.excluded;

                    if (!disabled) {
                        this.classList.remove('block-selection-disabled');
                        return;
                    }

                    if (excludedId && this.block.id === excludedId) {
                        this.classList.remove('block-selection-disabled');
                        return;
                    }

                    this.classList.add('block-selection-disabled');
                }
            );
        }

        this.eventBus.addEventListener('canvas-size-changed', ({width, height}) => {
            this.canvasWidth = width;
            this.canvasHeight = height;
        });

        this._syncActionListeners();
    }

    disconnectedCallback() {
        this._clearActionTimers();
        this._removeActionListeners();
        this.disposeTemplateSessions();

        super.disconnectedCallback();
    }

    /**
     * Optimize re-renders by checking if entity state changed
     */
    shouldUpdate(changedProps: PropertyValues): boolean {
        // Always update if non-hass properties changed
        if (changedProps.has('block') || changedProps.has('entity')) {
            return true;
        }

        // Check if hass changed
        if (changedProps.has('hass')) {
            const oldHass = changedProps.get('hass') as HomeAssistant | undefined;

            // First load - always update
            if (!oldHass) return true;

            // Get all tracked entities (block + style + trait bindings)
            const trackedEntities = this.documentModel.getTrackedEntitiesRecursiveFlat(this.block);

            // No entities tracked, no need to update for hass changes
            if (trackedEntities.length === 0) return false;

            // Check if any tracked entity state changed
            for (const entityId of trackedEntities) {
                const oldState = oldHass.states[entityId];
                const newState = this.hass?.states[entityId];
                if (oldState !== newState) {
                    return true;
                }
            }

            return false;
        }

        return super.shouldUpdate?.(changedProps) ?? true;
    }

    willUpdate(changedProps: PropertyValues) {
        super.willUpdate(changedProps);
        // Check if there is an active style target
        this.activeStyleTargetId = this.selected ? this.documentModel.getSelectedStyleTargetId() : null;
        // Get resolved styles before update the block
        // In this way target styles are updated before rendering
        this.resolvedRenderContext = this.renderer.resolvedRenderContext(
            this.block!,
            undefined,
            this.getPanelConfig().targetStyles
        );

        this.canvasWidth = this.resolvedRenderContext.canvasWidth;
        this.canvasHeight = this.resolvedRenderContext.canvasHeight;

        if (changedProps.has('hass')) {
            this.disposeTemplateSessions();
        }

        if (changedProps.has('hass') || (this.hass && !this.bindingEvaluator)) {
            this.bindingEvaluator = new BindingEvaluator(this.hass!, {
                resolveSlotEntity: (slotId) => this.documentModel.resolveSlotEntity(slotId),
                onTemplateResult: () => this.requestUpdate(),
            })
        }
    }

    firstUpdated(changedProps: PropertyValues) {
        super.firstUpdated(changedProps);

        this.addEventListener('block-rendering-completed', ((e: CustomEvent<{block: BlockData}>) => {
            // Add absolute positioning style if needed
            if (this.documentModel.isDescendant(this.block!.id, e.detail.block.id)) {
                this.updatePositionFromLayoutData();
            }
        }) as EventListener);
    }

    updated(changedProps: PropertyValues) {
        super.updated(changedProps);

        if (changedProps.has('block') && this.block) {
            this.entity = this.resolvedEntityId();
            this.classList.remove(`block-${(changedProps.get('block') as BlockData)?.layout}`);
            this.classList.add(`block-${this.block.layout}`);
        }
        if (changedProps.has('block')) {
            this._syncActionListeners();
        }

        // Refresh status class list
        const classes = {
            'block-selected': this.selected,
            'block-outline-enabled': this.environment.blocksOutlineEnabled,
            'builder': this.environment.isBuilder,
            'actions-pass-through': this._shouldPassThroughActions(),
        };
        Object.entries(classes).forEach(([className, enabled]) => {
            this.classList.toggle(className, Boolean(enabled));
        });

        this._syncActionTargetPointerEvents();
        // FIXME: this is needed by columns to override drop-zone style, we should find a better way!
        const styles = this.getResolvedContextStyles();
        // Refresh style
        this.style.cssText = this.stylesToString(styles);

        this.updatePositionFromLayoutData();

        // This event is captured by parents, which can use it to update their own position and promptly
        // catch children size changes.
        this.dispatchEvent(new CustomEvent('block-rendering-completed', {
            detail: {block: this.block},
            bubbles: true,
            composed: true
        }));
    }

    getBlockEntities(): string[] | undefined {
        if (!this.block) return [];

        // Check entityConfig for fixed entity
        if (this.block.entityConfig?.mode === 'fixed' && this.block.entityConfig.entityId) {
            return [this.block.entityConfig.entityId];
        }

        const config = this.documentModel?.resolveEntityForBlock(this.block.id);
        if (config?.entityId) return [config.entityId];

        return [];
    }

    protected updatePositionFromLayoutData() {
        if (!this.block || this.block.layout !== 'absolute' || !this.resolvedRenderContext.layoutData) {
            return;
        }

        const size = this.renderer.getRuntimeBlockSize(this.block, this.resolvedRenderContext.layoutData);
        const absolutePos = this.renderer.blockToMoveable(this.resolvedRenderContext.layoutData, size, this.canvasWidth, this.canvasHeight);

        this.style.left = `${absolutePos.left}px`;
        this.style.top = `${absolutePos.top}px`;
    }

    protected getResolvedContextStyles(): Record<string, string> {
        return this.resolvedRenderContext.styles;
    }

    /**
     * Get the resolved entity ID for this block.
     * Uses documentModel.resolveEntityForBlock() for inheritance support.
     */
    protected resolvedEntityId(): string | undefined {
        if (!this.block || !this.documentModel) {
            return undefined;
        }
        const resolved = this.documentModel.resolveEntityForBlock(this.block.id);
        return resolved.entityId;
    }

    /**
     * Get current entity state
     */
    protected getEntityState(): HassEntity | null {
        if (!this.hass || !this.entity) return null;
        return this.hass.states[this.entity];
    }

    // =========================================================================
    // Entities Tracking
    // =========================================================================

    /**
     * Check if entity is available
     */
    protected isEntityAvailable(): boolean {
        const state = this.getEntityState();
        return !!state && state.state !== 'unavailable' && state.state !== 'unknown';
    }

    protected getTargetStyle(targetId: string): Record<string, string> {
        return this.resolvedRenderContext?.targetStyles?.[targetId] || {};
    }

    protected isStyleTargetActive(targetId: string): boolean {
        return this.activeStyleTargetId === targetId;
    }

    // =========================================================================
    // Actions
    // =========================================================================

    protected getActionSlotIds(targetId: string): string[] {
        return this.block?.actions?.targets?.[targetId] ?? [];
    }

    protected getResolvedActionSlots(targetId: string): ActionSlot[] {
        const slotIds = this.getActionSlotIds(targetId);
        return slotIds
            .map((slotId) => this.documentModel.resolveSlotAction(slotId))
            .filter((slot): slot is ActionSlot => Boolean(slot));
    }

    private _isActionConfigured(action?: ActionConfig): boolean {
        return !!action && action.action !== 'none';
    }

    private _getActionTriggerFlags(targetId: string): {hasTap: boolean; hasDoubleTap: boolean; hasHold: boolean} {
        const slots = this.getResolvedActionSlots(targetId)
            .filter((slot) => this._isActionConfigured(slot.action));
        return {
            hasTap: slots.some((slot) => slot.trigger === 'tap'),
            hasDoubleTap: slots.some((slot) => slot.trigger === 'double_tap'),
            hasHold: slots.some((slot) => slot.trigger === 'hold'),
        };
    }

    private _hasAnyConfiguredActionForTarget(targetId: string): boolean {
        const slots = this.getResolvedActionSlots(targetId);
        return slots.some((slot) => this._isActionConfigured(slot.action));
    }

    private _hasAnyConfiguredAction(): boolean {
        const targets = this.block?.actions?.targets;
        if (!targets) return false;
        for (const targetId of Object.keys(targets)) {
            if (this._hasAnyConfiguredActionForTarget(targetId)) {
                return true;
            }
        }
        return false;
    }

    private _syncActionListeners(): void {
        const shouldListen = this._hasAnyConfiguredAction() || this.hasNativeActions();
        if (shouldListen === this._actionListenersActive) return;
        if (shouldListen) {
            this.addEventListener('pointerdown', this._handlePointerDown);
            this.addEventListener('pointerup', this._handlePointerUp);
            this.addEventListener('pointermove', this._handlePointerMove);
            this.addEventListener('pointercancel', this._handlePointerCancel);
        } else {
            this._removeActionListeners();
            this._clearActionTimers();
            this._resetPointerState();
        }
        this._actionListenersActive = shouldListen;
    }

    private _removeActionListeners(): void {
        this.removeEventListener('pointerdown', this._handlePointerDown);
        this.removeEventListener('pointerup', this._handlePointerUp);
        this.removeEventListener('pointermove', this._handlePointerMove);
        this.removeEventListener('pointercancel', this._handlePointerCancel);
        this._actionListenersActive = false;
    }

    private _handlePointerDown = (e: PointerEvent) => {
        if (!this._shouldHandleActions(e)) return;

        const targetId = this._resolveActionTarget(e);
        if (targetId && this._hasAnyConfiguredActionForTarget(targetId)) {
            this._pointerId = e.pointerId;
            this._pressTarget = targetId;
            this._pressStartX = e.clientX;
            this._pressStartY = e.clientY;
            this._pointerMoved = false;
            this._holdTriggered = false;

            const {hasHold, hasDoubleTap, hasTap} = this._getActionTriggerFlags(targetId);

            if (hasDoubleTap && hasTap && this._tapTimeoutId && this._lastTapTarget === this._pressTarget) {
                const elapsed = performance.now() - this._lastTapTimestamp;
                if (elapsed < this.actionDoubleTapDelay) {
                    this._clearTapTimer();
                }
            }

            if (hasHold && this._pressTarget) {
                this._clearHoldTimer();
                this._holdTimeoutId = window.setTimeout(() => {
                    this._holdTriggered = true;
                    this._clearTapTimer();
                    this._lastTapTimestamp = 0;
                    this._lastTapTarget = null;
                    this._executeAction('hold', this._pressTarget!);
                }, this.actionHoldDelay);
            }

            if (this.setPointerCapture) {
                this.setPointerCapture(e.pointerId);
            }
            return;
        }

        const rawTargetId = this._resolveRawTarget(e);
        if (this.handleNativePointerDown(e, rawTargetId)) {
            return;
        }
    };

    private _handlePointerMove = (e: PointerEvent) => {
        if (this._pointerId === null || e.pointerId !== this._pointerId) return;

        const dx = e.clientX - this._pressStartX;
        const dy = e.clientY - this._pressStartY;
        const distance = Math.hypot(dx, dy);
        if (distance > 6) {
            this._pointerMoved = true;
            this._clearHoldTimer();
        }
    };

    private _handlePointerUp = (e: PointerEvent) => {
        if (this._pointerId === null || e.pointerId !== this._pointerId) return;

        this._clearHoldTimer();

        if (!this.areActionsEnabled()) {
            this._resetPointerState(e.pointerId);
            return;
        }

        if (this._holdTriggered || this._pointerMoved) {
            this._resetPointerState(e.pointerId);
            return;
        }

        const targetId = this._pressTarget || this._resolveActionTarget(e);
        if (!targetId || !this._hasAnyConfiguredActionForTarget(targetId)) {
            this._resetPointerState(e.pointerId);
            return;
        }

        const {hasTap, hasDoubleTap} = this._getActionTriggerFlags(targetId);

        if (hasDoubleTap) {
            const now = performance.now();
            const isDoubleTap =
                this._lastTapTimestamp > 0 &&
                now - this._lastTapTimestamp < this.actionDoubleTapDelay &&
                this._lastTapTarget === targetId;

            if (isDoubleTap) {
                this._clearTapTimer();
                this._lastTapTimestamp = 0;
                this._lastTapTarget = null;
                this._executeAction('double_tap', targetId);
            } else {
                this._lastTapTimestamp = now;
                this._lastTapTarget = targetId;
                if (hasTap) {
                    this._tapTimeoutId = window.setTimeout(() => {
                        this._executeAction('tap', targetId);
                        this._lastTapTimestamp = 0;
                        this._lastTapTarget = null;
                        this._tapTimeoutId = null;
                    }, this.actionDoubleTapDelay);
                }
            }
        } else if (hasTap) {
            this._clearTapTimer();
            this._lastTapTimestamp = 0;
            this._lastTapTarget = null;
            this._executeAction('tap', targetId);
        }

        this._resetPointerState(e.pointerId);
    };

    private _handlePointerCancel = (e: PointerEvent) => {
        if (this._pointerId !== null && e.pointerId !== this._pointerId) return;
        this._clearHoldTimer();
        this._resetPointerState(e.pointerId);
    };

    private _executeAction(trigger: ActionTrigger, targetId: string): void {
        if (!this.areActionsEnabled()) return;
        if (!this.block || !this.hass) return;

        const entityId = this.resolvedEntityId();
        const actionSlots = this.getResolvedActionSlots(targetId)
            .filter((slot) => slot.trigger === trigger)
            .filter((slot) => this._isActionConfigured(slot.action));

        if (actionSlots.length === 0) return;

        let executed = false;
        for (const slot of actionSlots) {
            if (!this._isActionExecutable(slot.action, entityId)) continue;
            executed = true;
            void dispatchBlockAction({
                hass: this.hass,
                element: this,
                action: slot.action,
                trigger,
                entityId,
                eventBus: this.eventBus,
                blockId: this.block.id,
                targetId,
                slotId: slot.id,
            });
        }

        if (executed) {
            this._applyActionFeedback();
        }
    }

    private _isActionExecutable(action: ActionConfig, entityId?: string): boolean {
        if (!this._isActionConfigured(action)) return false;
        if ((action.action === 'toggle' || action.action === 'more-info') && !entityId) {
            return false;
        }
        if (action.action === 'call-service' || action.action === 'perform-action') {
            const hasService = Boolean(
                ('perform_action' in action && action.perform_action) ||
                ('service' in action && typeof action.service === 'string' && action.service) ||
                ('domain' in action && typeof action.domain === 'string' && 'service' in action && typeof action.service === 'string')
            );
            if (! hasService) {
                return false;
            }
        }
        if (action.action === 'navigate' && !(action as {navigation_path?: string}).navigation_path) {
            return false;
        }
        return true;
    }

    private _applyActionFeedback(): void {
        this.classList.add('action-feedback');
        if (this._feedbackTimeoutId) {
            window.clearTimeout(this._feedbackTimeoutId);
        }
        this._feedbackTimeoutId = window.setTimeout(() => {
            this.classList.remove('action-feedback');
            this._feedbackTimeoutId = null;
        }, 150);
    }

    private _shouldHandleActions(e: PointerEvent): boolean {
        if (!this.areActionsEnabled()) return false;
        if (this.isDragging || this.isResizing) return false;
        if (e.pointerType === 'mouse' && e.button !== 0) return false;
        return !this._isInteractiveElement(e.target as HTMLElement | null);
    }

    protected areActionsEnabled(): boolean {
        return Boolean(this.environment?.actionsEnabled);
    }

    private _shouldPassThroughActions(): boolean {
        if (!this.areActionsEnabled()) return false;
        if (this.hasNativeActions()) return false;
        return !this._hasAnyConfiguredAction();
    }

    private _resolveActionTarget(e: Event): string | null {
        const path = e.composedPath() as EventTarget[];
        for (const node of path) {
            if (node === this) break;
            if (node instanceof HTMLElement) {
                const targetId = node.dataset?.actionTarget;
                if (targetId && this._hasAnyConfiguredActionForTarget(targetId)) {
                    return targetId;
                }
            }
        }
        return this._hasAnyConfiguredActionForTarget('block') ? 'block' : null;
    }

    private _resolveRawTarget(e: Event): string | null {
        const path = e.composedPath() as EventTarget[];
        for (const node of path) {
            if (node === this) break;
            if (node instanceof HTMLElement) {
                const targetId = node.dataset?.actionTarget;
                if (targetId) {
                    return targetId;
                }
            }
        }
        return 'block';
    }

    private _syncActionTargetPointerEvents(): void {
        const targetIds = new Set(this.getNativeActionTargetIds());
        const nodes = this.renderRoot?.querySelectorAll?.('[data-action-target]');
        if (!nodes) return;

        nodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            const targetId = node.dataset?.actionTarget;
            if (!targetId) return;
            const hasActions = this._hasAnyConfiguredActionForTarget(targetId);
            const shouldReceive = hasActions || targetIds.has(targetId);
            node.style.pointerEvents = shouldReceive ? '' : 'none';
        });
    }

    private _isInteractiveElement(element: HTMLElement | null): boolean {
        if (!element) return false;
        if (element.isContentEditable) return true;
        const tag = element.tagName.toLowerCase();
        if (['input', 'textarea', 'select', 'button', 'a'].includes(tag)) return true;
        return !!element.closest('input, textarea, select, button, a, [contenteditable="true"]');
    }

    private _resetPointerState(pointerId?: number): void {
        if (pointerId !== undefined && this.releasePointerCapture) {
            try {
                this.releasePointerCapture(pointerId);
            } catch {
                // ignore if pointer capture is not active
            }
        }
        this._pointerId = null;
        this._pressTarget = null;
        this._pressStartX = 0;
        this._pressStartY = 0;
        this._pointerMoved = false;
        this._holdTriggered = false;
    }

    private _clearHoldTimer(): void {
        if (this._holdTimeoutId) {
            window.clearTimeout(this._holdTimeoutId);
            this._holdTimeoutId = null;
        }
    }

    private _clearTapTimer(): void {
        if (this._tapTimeoutId) {
            window.clearTimeout(this._tapTimeoutId);
            this._tapTimeoutId = null;
        }
    }

    private _clearActionTimers(): void {
        this._clearHoldTimer();
        this._clearTapTimer();
        if (this._feedbackTimeoutId) {
            window.clearTimeout(this._feedbackTimeoutId);
            this._feedbackTimeoutId = null;
        }
    }

    protected stylesToString(styles: Record<string, string>): string {
        return Object.entries(styles)
            .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
            .join('; ');
    }

    /**
     * Resolve a raw property value with support for bindings and templates
     */
    protected resolveRawValue(value: unknown, fallback: unknown = ''): string {
        return this.resolveRawValueWithTemplate(value, fallback);
    }

    protected resolveRawValueWithTemplate(
        value: unknown,
        fallback: unknown = '',
        template?: TemplateResolveOptions
    ): string {
        if (value === undefined || value === null) {
            return String(fallback);
        }

        if (typeof value === 'object') {
            if ('value' in value && 'isTemplate' in value) {
                const templateValue = value as TemplateValue;
                if (templateValue.isTemplate) {
                    const keywordVariables = template?.keywords ? buildTemplateVariables(template.keywords) : {};
                    const variables = {
                        ...(template?.variables ?? {}),
                        ...keywordVariables,
                    };
                    return this.resolveTemplateString(
                        template?.key ?? templateValue.value,
                        templateValue.value,
                        variables,
                        template?.debounceMs
                    );
                }
                return templateValue.value ?? fallback;
            }

            if ('binding' in value || ('value' in value && !('isTemplate' in value))) {
                const propValue = value as TraitPropertyValue;
                const defaultValue = propValue.value ?? fallback;

                if (propValue.binding && this.bindingEvaluator) {
                    const evaluation = this.bindingEvaluator.evaluate(propValue.binding, {
                        defaultEntityId: this.resolvedEntityId(),
                        defaultValue,
                    });
                    return String(evaluation.value ?? defaultValue);
                }

                return String(defaultValue);
            }
        }
        else if (typeof value === 'string') {
            return value;
        }

        return String(fallback);
    }

    /**
     * Get numeric value (handles template values)
     */
    protected resolveRawValueAsNumber(value: unknown, fallback: number): number {
        const resolved = this.resolveRawValueWithTemplate(value, fallback);

        const num = parseFloat(resolved);
        return Number.isNaN(num) ? fallback : num;
    }

    /**
     * Get boolean value
     */
    protected resolveRawValueAsBoolean(value: unknown, fallback: boolean = false): boolean {
        const resolved = this.resolveRawValueWithTemplate(value, fallback);

        if (resolved.toLowerCase() === 'true') {
            return true;
        }
        const num = parseFloat(resolved);
        if (Number.isNaN(num)) {
            return fallback;
        }

        return num !== 0
    }

    protected resolveProperty(name: string, fallback?: unknown, template?: TemplateResolveOptions): string {
        const value = this.getPropertyValue(name);

        return this.resolveRawValueWithTemplate(value, fallback, {
            ...template,
            key: template?.key ?? name,
        });
    }

    protected resolvePropertyAsNumber(name: string, fallback: number, template?: TemplateResolveOptions): number {
        const resolved = this.resolveRawValueWithTemplate(this.getPropertyValue(name), fallback, {
            ...template,
            key: template?.key ?? name,
        });

        const num = parseFloat(resolved);
        return Number.isNaN(num) ? fallback : num;
    }

    protected resolvePropertyAsBoolean(name: string, fallback: boolean = false, template?: TemplateResolveOptions): boolean {
        const resolved = this.resolveRawValueWithTemplate(this.getPropertyValue(name), fallback, {
            ...template,
            key: template?.key ?? name,
        });

        if (resolved.toLowerCase() === 'true') {
            return true;
        }
        const num = parseFloat(resolved);
        if (Number.isNaN(num)) {
            return fallback;
        }

        return num !== 0
    }

    protected resolveTemplateString(
        key: string,
        template: string,
        variables: Record<string, unknown>,
        debounceMs?: number
    ): string {
        const cleanedTemplate = template?.trim();
        if (!this.hass || !cleanedTemplate) {
            this.disposeTemplateSession(key);
            return '';
        }

        const session = this.getTemplateSession(key);
        session.update({template: cleanedTemplate, variables, reportErrors: true, debounceMs});

        const error = session.getError();
        if (error) {
            return TEMPLATE_GENERIC_ERROR;
        }

        return session.getResult()?.result ?? '';
    }

    private getTemplateSession(key: string): HaTemplateSession {
        let session = this.templateSessions.get(key);
        if (!session) {
            session = new HaTemplateSession(this.hass!, {
                onResult: () => this.requestUpdate(),
                onError: () => this.requestUpdate(),
            });
            this.templateSessions.set(key, session);
        }
        return session;
    }

    private disposeTemplateSession(key: string): void {
        const session = this.templateSessions.get(key);
        if (!session) return;
        session.dispose();
        this.templateSessions.delete(key);
    }

    private disposeTemplateSessions(): void {
        for (const session of this.templateSessions.values()) {
            session.dispose();
        }
        this.templateSessions.clear();
    }

    private getPropertyValue(name: string): TraitPropertyValue | undefined {
        const value = this.block?.props?.[name];
        if (!value || typeof value !== 'object') {
            return undefined;
        }

        const candidate = value as TraitPropertyValue;
        if ('value' in candidate || 'binding' in candidate) {
            return candidate;
        }

        return undefined;
    }
}
