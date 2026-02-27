import { type BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import { blocksRendererContext } from "@/common/blocks/core/renderer/blocks-renderer-context";
import type { BlockPanelTargetStyles } from '@/common/blocks/types';
import type { HomeAssistant } from "custom-card-helpers";
import { type PositionConfig, type PositionData, type PositionRuntimeParams, PositionSystem } from "./position-system";
import { getStyleLayoutData } from './resolved-to-layout'
import type { RenderContext, ResolvedRenderContext, StyleLayoutData } from './types'
import { ContainerManager, containerManagerContext } from "@/common/core/container-manager/container-manager";
import { type EventBus, eventBusContext } from "@/common/core/event-bus";
import {
    type BlockData,
    type BlockPosition,
    type BlockSize,
    type DocumentModel,
    documentModelContext
} from "@/common/core/model";
import {
    type BindingContext,
    type ResolvedStyleData,
    resolvedToCSSProperties,
    type StyleResolver,
    styleResolverContext
} from "@/common/core/style-resolver";
import { hassContext } from "@/common/types";
import { consume, provide } from "@lit/context";
import { css, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { unsafeStatic } from "lit/static-html.js";
import { EntitySubscriptionManager } from "./entity-subscription-manager";

/**
 * Represents the moveable position, always top/left in pixels.
 */
export interface MoveablePosition {
    left: number;
    top: number;
}

export interface RenderData {
    absoluteBlocks: BlockData[];
    staticBlocks: BlockData[];
    flowBlocks: BlockData[];
    haCardStyles: Record<string, string>;
    canvasStyles: Record<string, string>;
    canvasFlowContainerStyles: Record<string, string>;
}

export abstract class BlocksRenderer extends LitElement {
    static styles = [
        css`
            .canvas {
                min-height: 1px;
                position: relative;
                background: var(--ha-card-background, var(--bg-primary));
                border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
                box-sizing: border-box;
                overflow: hidden;
                z-index: 0;
            }

            .canvas-flow-container {
                border-radius: inherit;
                box-sizing: border-box;
                inset: 0;
                display: flex;
                flex-direction: column;
                padding: 20px;
            }
        `
    ];

    @consume({context: documentModelContext})
    protected documentModel!: DocumentModel;

    @consume({context: blockRegistryContext})
    protected blockRegistry!: BlockRegistry;

    @consume({context: containerManagerContext})
    protected containerManager!: ContainerManager;

    @consume({context: styleResolverContext})
    protected styleResolver!: StyleResolver;

    @consume({context: eventBusContext})
    protected eventBus!: EventBus;

    @provide({context: blocksRendererContext})
    protected rendererManager = this;

    @consume({context: hassContext, subscribe: true})
    @property({attribute: false})
    hass?: HomeAssistant;

    @state() protected rootBlocks: Array<BlockData> = [];
    @state() protected activeContainerId!: string ;
    @state() protected canvasWidth!: number;
    @state() protected canvasHeight!: number;
    @state() protected overflowShow: boolean = true;

    /**
     * Canvas element reference. Must be initialized after the first render.
     * @protected
     */
    protected canvas: HTMLElement | null = null;
    protected canvasFlowContainer: HTMLElement | null = null;

    protected entitySubscriptionManager = new EntitySubscriptionManager();
    protected resizeObserver: ResizeObserver | null = null;
    protected blockEntityUnsubscribers = new Map<string, () => void>();
    protected canvasStyleProperties: string[] = [
        'background.boxShadow',
        'border.borderRadius',
        'typography.fontFamily',
        'typography.fontSize',
        'typography.fontWeight',
        'typography.fontStyle',
        'typography.lineHeight',
        'typography.letterSpacing',
        'typography.textAlign',
        'typography.textDecoration',
        'typography.textTransform',
        'typography.textShadow',
        'typography.whiteSpace',
        'typography.color',
        'animations.motion',
    ];
    private templateUpdateUnsubscribe?: () => void;

    protected abstract doBlockRender(block: BlockData, context: RenderContext): TemplateResult;

    protected abstract render(): TemplateResult;

    // FIXME: can be removed
    renderBlock(block: BlockData): TemplateResult {
        if (!customElements.get(block.type)) {
            throw new Error(`Block type "${block.type}" not registered as custom element`);
        }

        return this.doBlockRender(block, {
            tag: unsafeStatic(block.type),
        })
    }

    // =========================================================================
    // Lifecycle
    // =========================================================================

    /**
     * This method MUST NOT BE ASYNC, otherwise it will alter the rendering of blocks.
     */
    connectedCallback() {
        super.connectedCallback();
        // Initialize the current active container
        this.activeContainerId = this.containerManager.getActiveContainerId();

        this.overflowShow = this.documentModel.getBlock(this.documentModel.rootId)?.props?.overflow_show?.value ?? true;

        this.setupResizeObserver();

        this.templateUpdateUnsubscribe = this.eventBus.addEventListener('template-updated', () => {
            this.requestUpdate();
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        // Clean up all entity subscriptions
        for (const unsubscribe of this.blockEntityUnsubscribers.values()) {
            unsubscribe();
        }
        if (this.templateUpdateUnsubscribe) {
            this.templateUpdateUnsubscribe();
            this.templateUpdateUnsubscribe = undefined;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.blockEntityUnsubscribers.clear();
        this.entitySubscriptionManager.clear();

        this.documentModel.registerElement(this.documentModel.rootId, undefined);
    }

    shouldUpdate(changedProps: PropertyValues): boolean {
        if (changedProps.has('hass') && changedProps.size === 1) {
            const oldHass = changedProps.get('hass') as HomeAssistant | undefined;

            // First load - always update
            if (!oldHass) return true;

            // Get all tracked entities (block + style + trait bindings)
            const trackedEntities = this.documentModel.getTrackedEntitiesRecursiveFlat(this.documentModel.getBlock(this.documentModel.rootId));

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

    async updated(changedProps: PropertyValues) {
        if (changedProps.has('hass') && this.hass) {
            /** Home Assistant instance with entity subscription updates */
            this.entitySubscriptionManager.setHass(this.hass);
        }

        this.canvas?.style.setProperty('overflow', this.overflowShow ? 'visible' : 'hidden');

        super.updated(changedProps);
    }

    protected setupResizeObserver() {
        // Clean up existing observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Create observer to watch canvas size changes
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const {width, height} = entry.contentRect;
                const changed = this.canvasWidth !== width || this.canvasHeight !== height;

                this.canvasWidth = width;
                this.canvasHeight = height;

                if (changed) {
                    this.eventBus.dispatchEvent('canvas-size-changed', {width, height});
                    this.canvasSizeChanged();

                    // Force re-render of blocks to update responsive positioning
                    this.requestUpdate();
                }
            }
        });

        // Wait for canvas to be ready, then observe it
        this.updateComplete.then(() => {
            if (this.canvas) {
                this.resizeObserver!.observe(this.canvas);

                // Get initial dimensions immediately
                const rect = this.canvas.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    this.canvasWidth = rect.width;
                    this.canvasHeight = rect.height;

                    this.eventBus.dispatchEvent('canvas-size-changed', {
                        width: this.canvasWidth,
                        height: this.canvasHeight
                    });
                }
            }
        });
    }

    // =========================================================================
    // Style Management
    // =========================================================================

    protected getRenderData(canvasStylesAppend: Record<string, string> = {}): RenderData {
        const absoluteBlocks = this.rootBlocks.filter((block) => block.layout === 'absolute');
        const staticBlocks = this.rootBlocks.filter((block) => block.layout === 'static');
        const flowBlocks = this.rootBlocks
            .filter((n) => n.layout === 'flow')
            .sort((a, b) => a.order - b.order); // Sort by order property

        // FIXME: this code is the same inside panel-style-state, probably should be moved to a shared helper or inside the style resolver
        const resolvedEntity = this.documentModel.resolveEntityForBlock(this.documentModel.rootId);

        // Card style, must be splitted between canvas and canvasFlorContainer
        const cardStyleResolved = this.resolveBlockStyles(
            this.documentModel.getBlock(this.documentModel.rootId)!,
            this.activeContainerId,
            {defaultEntityId: resolvedEntity.entityId}
        );

        const canvasStyles = resolvedToCSSProperties(cardStyleResolved, {
            filter: {only: {properties: this.canvasStyleProperties}},
            append: canvasStylesAppend
        });
        const canvasFlowContainerStyles = resolvedToCSSProperties(cardStyleResolved, {
            filter: {exclude: {properties: this.canvasStyleProperties}}
        });

        const haCardStyleAppend: Record<string, string> = {};
        if (cardStyleResolved.background?.background || cardStyleResolved.background?.backgroundColor || cardStyleResolved.background?.backgroundImage) {
            haCardStyleAppend['--ha-card-background'] = 'transparent';
        }
        if (cardStyleResolved.border?.borderStyle && cardStyleResolved.border?.borderStyle.value !== 'none') {
            haCardStyleAppend['--ha-card-border-color'] = 'transparent';
            haCardStyleAppend['--ha-card-border-width'] = '0';
        }
        if (cardStyleResolved.border?.borderRadius) {
            haCardStyleAppend['--ha-card-border-radius'] = cardStyleResolved.border?.borderRadius.value as string;
        }

        const haCardStyles = resolvedToCSSProperties(cardStyleResolved, {
            filter: {only: {properties: [
                'border.borderRadius',
            ]}},
            append: {...haCardStyleAppend, ...canvasStylesAppend}
        });

        return {absoluteBlocks, staticBlocks, flowBlocks, haCardStyles, canvasStyles, canvasFlowContainerStyles};
    }

    public resolveBlockStyles(
        block: BlockData,
        containerId: string = this.activeContainerId,
        bindingContext: BindingContext,
        targetId?: string
    ): ResolvedStyleData {
        return this.styleResolver.resolve(block.id, containerId, bindingContext, true, targetId);
    }

    public resolvedRenderContext(
        block: BlockData,
        resolved: ResolvedStyleData | null = null,
        targetStyles?: BlockPanelTargetStyles
    ): ResolvedRenderContext {
        const resolvedEntity = this.documentModel.resolveEntityForBlock(block.id);
        const defaultEntityId = resolvedEntity.entityId;
        const bindingContext = {defaultEntityId};

        resolved = resolved ?? this.resolveBlockStyles(block, this.activeContainerId, bindingContext);
        const layoutData = getStyleLayoutData(resolved);
        const outputMode = this.blockRegistry.getBlockStyleOutputConfig(block);
        const containerStyles = outputMode
            ? resolvedToCSSProperties(resolved, {outputMode, varPrefix: outputMode.varPrefix ?? 'block'})
            : resolvedToCSSProperties(resolved);

        const targetStylesResolved: Record<string, Record<string, string>> = {};
        const targetIds = targetStyles
            ? Object.keys(targetStyles).filter((targetId) => targetId !== 'block')
            : [];
        if (targetIds.length > 0) {
            for (const targetId of targetIds) {
                const targetResolved = this.styleResolver.resolve(
                    block.id,
                    this.activeContainerId,
                    bindingContext,
                    true,
                    targetId
                );
                const targetOutputMode = this.blockRegistry.getBlockStyleOutputConfig(block, targetId);
                targetStylesResolved[targetId] = targetOutputMode
                    ? resolvedToCSSProperties(targetResolved, {
                        outputMode: targetOutputMode,
                        varPrefix: targetOutputMode.varPrefix ?? 'block',
                    })
                    : resolvedToCSSProperties(targetResolved);
            }
        }

        // Build style object
        const styles: Record<string, string> = {
            zIndex: String(block.zIndex || 'auto'),
        };
        Object.assign(styles, containerStyles);

        return {
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            resolved: resolved,
            layoutData: layoutData,
            styles: styles,
            targetStyles: targetStylesResolved,
        }
    }

    protected computeAbsoluteBlockSize(blockId: string): BlockSize | undefined {
        const element = this.documentModel.getElement(blockId);
        if (!element) return undefined;

        const rect = element.getBoundingClientRect();

        return {
            width: rect.width,
            height: rect.height
        }
    }

    getRuntimeBlockSize(block: BlockData, layoutData: StyleLayoutData): BlockSize {
        if (layoutData.size.width && layoutData.size.height) {
            return layoutData.size;
        }

        const measured = this.computeAbsoluteBlockSize(block.id);
        return measured ?? layoutData.size;
    }

    protected canvasSizeChanged() {
    }

    public getCanvasElement(): HTMLElement | null {
        return this.canvas;
    }

    // =========================================================================
    // Moveable Helpers
    // =========================================================================
    /**
     * Convert block position to Moveable position (always top/left in pixels)
     */
    blockToMoveable(layout: StyleLayoutData, size: BlockSize, containerWidth: number, containerHeight: number): MoveablePosition {
        // IMPORTANT: position contains the exact pixel coordinates from dragEnd/resizeEnd
        // We should use it directly to avoid rounding errors from repeated conversions.
        // Only recalculate from positionConfig when using % units (responsive positioning)

        if (layout.positionConfig.unitSystem === '%' && containerWidth && containerHeight) {
            // For percentage-based positioning, we must recalculate when canvas size changes
            const systemConfig: PositionRuntimeParams = {
                containerSize: {width: containerWidth, height: containerHeight},
                elementSize: {width: size.width, height: size.height},
                anchorPoint: layout.positionConfig.anchor,
                originPoint: layout.positionConfig.originPoint,
                unitSystem: layout.positionConfig.unitSystem
            };

            const system = new PositionSystem(systemConfig);

            const positionData: PositionData = {
                x: layout.positionConfig.x,
                y: layout.positionConfig.y,
                anchorPoint: layout.positionConfig.anchor,
                originPoint: layout.positionConfig.originPoint,
                unitSystem: layout.positionConfig.unitSystem
            };

            const absolutePos = system.toMoveableSpace(positionData);

            return {left: absolutePos.x, top: absolutePos.y};
        }

        // For pixel-based positioning, use the exact saved position to avoid drift
        return {left: layout.position.x, top: layout.position.y};
    }

    /**
     * Convert Moveable position (top/left in px) back to block position with config
     */
    moveableToBlock(
        moveablePos: MoveablePosition,
        currentConfig: Required<PositionConfig>,
        blockSize: BlockSize,
        containerWidth: number,
        containerHeight: number
    ): { position: BlockPosition; positionConfig: Required<PositionConfig> } {
        const absolutePos = {x: moveablePos.left, y: moveablePos.top};

        // Create position system
        // IMPORTANT: containerSize should be the actual container dimensions
        const systemConfig: PositionRuntimeParams = {
            containerSize: {width: containerWidth, height: containerHeight},
            elementSize: {width: blockSize.width, height: blockSize.height},
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        };

        const system = new PositionSystem(systemConfig);

        // Convert from Moveable space to user space
        const positionData = system.fromMoveableSpace(absolutePos);

        // Round position to match positionConfig precision and avoid drift
        // This ensures position and positionConfig are always in sync
        const roundedPosition = {
            x: Math.round(absolutePos.x),
            y: Math.round(absolutePos.y)
        };

        return {
            position: roundedPosition, // Use rounded position to match positionConfig
            positionConfig: {
                anchor: positionData.anchorPoint,
                x: positionData.x,
                y: positionData.y,
                unitSystem: positionData.unitSystem,
                originPoint: positionData.originPoint ?? positionData.anchorPoint
            }
        };
    }


    /**
     * Convert Moveable resize data (position + size) back to block data
     */
    moveableResizeToBlock(
        moveablePos: MoveablePosition,
        newSize: BlockSize,
        currentConfig: Required<PositionConfig>,
        containerWidth: number,
        containerHeight: number
    ): { position: BlockPosition; size: BlockSize; positionConfig: Required<PositionConfig> } {
        const absolutePos = {x: moveablePos.left, y: moveablePos.top};

        // Create position system with NEW size
        // IMPORTANT: containerSize should be the actual container dimensions
        const systemConfig: PositionRuntimeParams = {
            containerSize: {width: containerWidth, height: containerHeight},
            elementSize: {width: newSize.width, height: newSize.height},
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        };

        const system = new PositionSystem(systemConfig);

        // Convert from Moveable space to user space
        const positionData = system.fromMoveableSpace(absolutePos);

        // Round position to match positionConfig precision and avoid drift
        const roundedPosition = {
            x: Math.round(absolutePos.x),
            y: Math.round(absolutePos.y)
        };


        return {
            position: roundedPosition, // Use rounded position to match positionConfig
            size: newSize,
            positionConfig: {
                anchor: positionData.anchorPoint,
                x: positionData.x,
                y: positionData.y,
                unitSystem: positionData.unitSystem,
                originPoint: positionData.originPoint ?? positionData.anchorPoint
            }
        };
    }



    // =========================================================================
    // Entity Subscription Management
    // =========================================================================

    /**
     * Subscribe to entity changes for a specific block
     */
    protected subscribeBlockEntities(blockId: string, entities: string[]): void {
        // Unsubscribe previous subscriptions for this block
        this.unsubscribeBlockEntities(blockId);

        if (entities.length === 0) return;

        // Subscribe to all entities
        const unsubscribe = this.entitySubscriptionManager.subscribeMultiple(
            entities,
            (entityId) => this.handleBlockEntityChange(entityId)
        );

        this.blockEntityUnsubscribers.set(blockId, unsubscribe);
    }

    /**
     * Unsubscribe from entity changes for a specific block
     * Called when block is removed or before re-subscribing
     *
     * @param blockId - Block ID to unsubscribe
     */
    protected unsubscribeBlockEntities(blockId: string): void {
        const unsubscribe = this.blockEntityUnsubscribers.get(blockId);
        if (unsubscribe) {
            unsubscribe();
            this.blockEntityUnsubscribers.delete(blockId);
        }
    }

    /**
     * Handle entity state change for a block
     * Triggers re-render
     *
     * @param entityId - Entity ID that changed
     */
    protected handleBlockEntityChange(entityId: string): void {
        void entityId;
        // Trigger re-render
        this.requestUpdate();
    }
}
