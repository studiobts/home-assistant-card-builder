import { BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import {
    getStyleLayoutData,
    PositionSystem,
    type RenderContext,
    type StyleLayoutData
} from '@/common/blocks/core/renderer';
import { BlocksRenderer } from "@/common/blocks/core/renderer/blocks-renderer";
import { type BlockPanelConfig, type BlockInterface } from "@/common/blocks/types";
import {
    type BlockCreated, type BlockDragOnGeneratePreviewDetail,
    type BlockReorderedDetail,
    type DragDropManager,
    dragDropManagerContext,
    type DropElement,
    type DropInstruction
} from '@/common/core/drag-and-drop';
import type {
    BlockData,
    BlockSelectionChangedDetail,
    BlockUpdatedDetail,
    DocumentBlocks
} from '@/common/core/model';
import type { LinkModeState } from '@/common/core/model/types';
import { consume } from "@lit/context";
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { html as staticHtml } from "lit-html/static.js";
import { property, state } from 'lit/decorators.js';
import { ref } from "lit/directives/ref.js";
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from "lit/directives/style-map.js";
import Moveable from 'moveable';
import {
    ensurePositionGuidesElements,
    getAxisCoordinates,
    getLocalOriginOnElement,
    hidePositionGuides,
    type PositionGuidesElements,
    type PositionGuidesState,
    positionGuidesStyles,
    renderPositionGuides,
    updatePositionGuides
} from '../components/canvas/position-guides';
import '../components/canvas/contextual-block-toolbar';

// FIXME: DropElement must be moved on canvasFlowContainer!
export class BuilderCanvas extends BlocksRenderer implements DropElement, BlockInterface {
    @consume({context: dragDropManagerContext})
    protected dragDropManager!: DragDropManager;

    @consume({context: blockRegistryContext})
    protected blockRegistry!: BlockRegistry;

    @property({type: String})
    protected canvasId!: string;

    @property({type: Boolean})
    protected showPositionGuides = true;

    @property({type: Boolean})
    protected showSnapGuides = true;

    @state() protected isCanvasSelected: boolean = false;
    @state() protected showContextualBlockToolbar: boolean = true;
    @state() protected showControls: boolean = false;
    @state() protected overflowAllowBlocksOutside: boolean = true;
    @state() protected linkModeState: LinkModeState | null = null;

    protected blocks: DocumentBlocks = {};
    protected selectedBlockId: string | null = null;
    protected moveable: Moveable | null = null;
    protected guides: PositionGuidesElements | null = null;

    static styles = [
        ...BlocksRenderer.styles,
        positionGuidesStyles,
        css`
            :host {
                display: flex;
                align-items: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                width: max-content;
            }

            :host(.container-desktop) {
                min-width: 100%;
            }

            .canvas-viewport {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(0, 0, 0, 0.02) 10px,
                        rgba(0, 0, 0, 0.02) 20px
                );
                border: 2px dashed var(--border-color);
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
            }

            :host(.container-desktop) .canvas-viewport {
                background: none;
                border: none;
                border-radius: 0;
                padding: 0;
                box-shadow: none;
            }

            .canvas-viewport::before {
                content: attr(data-container-name);
                position: absolute;
                top: -10px;
                left: 20px;
                background: var(--bg-primary);
                padding: 2px 12px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border: 1px solid var(--border-color);
            }

            :host(.container-desktop) .canvas-viewport::before {
                display: none;
            }

            .canvas-viewport::after {
                content: attr(data-container-width);
                position: absolute;
                top: -10px;
                right: 20px;
                background: var(--accent-color);
                color: white;
                padding: 2px 12px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            :host(.container-desktop) .canvas-viewport::after {
                display: none;
            }

            .canvas {
                outline: 2px solid transparent;
            }

            .canvas.canvas-selected {
                outline-color: var(--accent-color, #0078d4);
            }

            .canvas.canvas-empty .canvas-flow-container,
            .canvas-flow-container.flow-empty {
                height: 300px;
            }

            .canvas-flow-container > * {
                pointer-events: auto;
            }

            .canvas-placeholder {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--text-secondary);
                font-size: 13px;
                text-align: center;
                pointer-events: none;
            }

            .canvas-controls {
                position: absolute;
                bottom: calc(100% + 15px);
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
            }

            .toggle-button {
                border: 1px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-secondary);
                font-size: 12px;
                border-radius: 6px;
                padding: 6px 10px;
                cursor: pointer;
                transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            }

            .toggle-button:hover {
                color: var(--text-primary);
            }

            .toggle-button[aria-pressed='true'] {
                background: var(--accent-color);
                border-color: var(--accent-color);
                color: #ffffff;
            }

            .snap-highlight {
                outline: 1px solid #ff4081 !important;
                outline-offset: 1px !important;
                box-shadow: 0 0 0 4px rgba(255, 64, 129, 0.15) !important;
                transition: none !important;
                z-index: 999;
            }

            .moveable-control-box .moveable-control.moveable-resizable {
                border: none;
                height: 4px;
                border-radius: 3px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction^=n] {
                margin-top: -4px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction^=s] {
                margin-top: 0;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=e] {
                margin-left: 0;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=w] {
                margin-left: -4px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=e],
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=w] {
                width: 4px;
                height: 14px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=ne],
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=se] {
                margin-left: -11px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=nw],
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=sw] {
                margin-left: -4px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=ne]:before,
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=nw]:before,
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=se]:before,
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=sw]:before {
                display: block;
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                background: var(--moveable-color);
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=ne]:before {
                transform-origin: top right;
                bottom: 0;
                right: 4px;
                rotate: 270deg;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=nw]:before {
                transform-origin: top left;
                bottom: 0;
                left: 4px;
                rotate: 90deg;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=se]:before {
                transform-origin: bottom right;
                bottom: 0;
                right: 4px;
                rotate: 90deg;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=sw]:before {
                transform-origin: bottom left;
                bottom: 0;
                left: 4px;
                rotate: 270deg;
            }

            /* Snap guide lines - Default style */

            .moveable-guideline-group .moveable-line {
                border-style: dashed;
                border-width: 0;
                border-color: rgba(212, 28, 0, 0.55);
            }

            .moveable-guideline-group .moveable-line.moveable-horizontal {
                border-top-width: 1px;
            }

            .moveable-guideline-group .moveable-size-value.moveable-gap {
                background: rgb(197, 74, 55) !important;
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.18);
                white-space: nowrap;
                font-size: 10px;
                line-height: 1;
                padding: 2px 6px;
                border-radius: 4px;
                bottom: initial !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 3;
                font-weight: normal;
            }
        `
    ];

    constructor() {
        super();

        this.addEventListener('click', (e) => this._onBuilderClick(e));
    }

    public get dropId(): string {
        return this.canvasId;
    }

    public get dropElement(): HTMLElement {
        return this.canvasFlowContainer!;
    }

    public shouldShowDropIndicator(): boolean {
        return true;
    }

    getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'overflow',
                        label: 'Overflow',
                        traits: [
                            {
                                type: 'checkbox',
                                name: 'overflow_allow_blocks_outside',
                                label: 'Allow blocks outside',
                            },
                            {
                                type: 'checkbox',
                                name: 'overflow_show',
                                label: 'Show overflow',
                            }
                        ]
                    }
                ]
            },
            targetStyles: {
                block: {
                    styles: {
                        groups: ['background', 'border', 'typography', 'animations'],
                        properties: ['size.height', 'size.minHeight', 'size.maxHeight', 'spacing.padding'],
                    },
                },
            },
        };
    }

    getBlockEntities(): string[] | undefined {
        const config = this.documentModel?.resolveEntityForBlock(this.documentModel.rootId);
        if (config?.entityId) return [config.entityId];

        return [];
    }

    getBlockBoundingClientRect(): DOMRect{
        return this.canvas!.getBoundingClientRect();
    }

    connectedCallback() {
        super.connectedCallback();

        this._onModelChange();
        this._setupKeyboardShortcuts();

        // Register root element to the document model
        this.documentModel.registerElement(this.documentModel.rootId, this);

        this.linkModeState = this.documentModel.getLinkModeState();
        this.documentModel.addEventListener('link-mode-changed', this._handleLinkModeChanged as EventListener);
        this._emitSelectionDisabledState(this.linkModeState);

        this.documentModel.addEventListener('change', () => this._onModelChange());
        this.documentModel.addEventListener('selection-changed', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
            this.selectedBlockId = detail.selectedId;
            this.isCanvasSelected = this.selectedBlockId === this.documentModel.rootId;

            this.isCanvasSelected ?
                this.canvas?.classList.add('canvas-selected') :
                this.canvas?.classList.remove('canvas-selected');

            const selectedBlock = this.selectedBlockId ? this.documentModel.getBlock(this.selectedBlockId) : null;
            this.showControls = Boolean(selectedBlock?.layout === 'absolute');
            // this.requestUpdate();
            this._updateMoveable();
        });
        this.documentModel.addEventListener('style-target-changed', () => {
            //this.requestUpdate();
        });
        this.documentModel.addEventListener('block-updated', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockUpdatedDetail;

            // If the updated block is currently selected, update moveable position after render
            if (detail.block.id === this.selectedBlockId) {
                // Use requestAnimationFrame to ensure DOM is updated first
                requestAnimationFrame(() => {
                    this._updateMoveable();
                });
            }
        });

        // Listen to drop events and create/move blocks
        this.eventBus.addEventListener<BlockCreated>('block-created', (data) => {
            console.log('[BuilderCanvas] block-created event received:', data);
            this._handleBlockCreated(data);
        });

        this.eventBus.addEventListener<BlockReorderedDetail>('block-reordered', (data) => {
            console.log('[BuilderCanvas] block-reordered event received:', data);
            this._handleBlockReordered(data);
        });

        this.eventBus.addEventListener<BlockDragOnGeneratePreviewDetail>('block-drag-on-generate-preview', () => {
            // Hide selection when dragging a block to have a better UX
            this.documentModel.select(null);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        if (this.moveable) {
            this.moveable.destroy();
        }

        this._cleanupKeyboardShortcuts();
    }

    async firstUpdated() {
        await this.updateComplete;

        // Self-register as Canvas into DragDropManager
        this.dragDropManager.registerCanvas(this);
    }

    async updated(changedProps: PropertyValues) {
        await super.updated(changedProps);
        await this.updateComplete;

        if (changedProps.has('showPositionGuides')) {
            this._updateGuides();
        }
        if (changedProps.has('showSnapGuides')) {
            await this._updateMoveable();
        }

    }

    render() {
        const isEmpty = this.rootBlocks.length === 0;
        const activeContainer = this.containerManager.getActiveContainer();
        const containerWidthPx = activeContainer.width;

        // Calculate viewport width based on container width + padding
        const viewportWidth = activeContainer.isDefault ? '100%' : `${containerWidthPx + 40}px`;

        const {
            absoluteBlocks,
            staticBlocks,
            flowBlocks,
            haCardStyles,
            canvasStyles,
            canvasFlowContainerStyles
        } = this.getRenderData({width: `${activeContainer.isDefault ? '100%' : `${containerWidthPx}px`} !important`}); // Set canvas width based on current container

        return html`
            <div
                class="canvas-viewport"
                style="width: ${viewportWidth}"
                data-container-name="${activeContainer.name}"
                data-container-width="${containerWidthPx ? `${containerWidthPx}px` : 'Responsive'}"
            >
                
                    <ha-card style="${styleMap(haCardStyles)}">
                        <div
                            class="canvas ${isEmpty ? 'canvas-empty' : ''}"
                            style="${styleMap(canvasStyles)}"
                            ${ref((el) => this.canvas = el as HTMLElement)}
                        >
                            ${renderPositionGuides()}
                            ${isEmpty ? html`<div class="canvas-placeholder">Canvas is empty</div>` : nothing}
                            ${repeat(absoluteBlocks, (block) => block.id, (block) => this.renderBlock(block))}
                            ${repeat(staticBlocks, (block) => block.id, (block) => this.renderBlock(block))}
                            <div
                                class="canvas-flow-container ${flowBlocks.length === 0 ? 'flow-empty' : ''}"
                                data-dnd-drop-target="true"
                                style="${styleMap(canvasFlowContainerStyles)}"
                                @click=${(e: Event) => this._onBuilderClick(e)}
                                ${ref((el) => this.canvasFlowContainer = el as HTMLElement)}
                            >
                                ${repeat(flowBlocks, (block) => block.id, (block) => this.renderBlock(block))}
                            </div>
                        </div>
                    </ha-card>
                

                ${this._renderControls()}
            </div>
            <contextual-block-toolbar
                    .canvas=${this.canvas}
                    .show=${this.showContextualBlockToolbar}
            >
            </contextual-block-toolbar>
        `;
    }

    protected override canvasSizeChanged() {
        if (this.selectedBlockId) {
            this._updateGuides();
        }

        // Update moveable bounds when canvas size changes
        if (this.moveable) {
            this.moveable.updateRect();
        }
    }

    protected doBlockRender(block: BlockData, context: RenderContext): TemplateResult {
        return staticHtml`
          <${context.tag}
            block-id="${block.id}"
            data-dnd-draggable="${block.layout === 'flow'}"
            data-dnd-drop-target="${block.layout === 'flow'}"
            .block=${block}
            .canvasId=${this.canvasId}
            .activeContainerId=${this.activeContainerId}
            @click=${(e: Event) => this._onBlockClick(e, block.id)}
            ${ref((el) => this.documentModel.registerElement(block.id, el as BlockInterface))}
          ></${context.tag}>
      `;
    }

    private _handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if target is an input/textarea
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        const selectedBlock = this.selectedBlockId ? this.documentModel.getBlock(this.selectedBlockId) : null;
        if (!selectedBlock) return;

        // Ctrl+D or Cmd+D: Duplicate
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (this.documentModel.canDuplicateBlock(selectedBlock.id)) {
                this.documentModel.duplicateBlock(selectedBlock.id);
            }
            return;
        }

        // Delete or Backspace: Delete block
        // if (e.key === 'Delete') {
        //   e.preventDefault();
        //   if (this.documentModel.canDeleteBlock(selectedBlock.id)) {
        //     this.documentModel.deleteBlock(selectedBlock.id);
        //   }
        //   return;
        // }
    };

    private _setupKeyboardShortcuts() {
        document.addEventListener('keydown', this._handleKeyDown);
    }

    private _cleanupKeyboardShortcuts() {
        document.removeEventListener('keydown', this._handleKeyDown);
    }

    private _ensureGuidesElements(): void {
        if (!this.guides) {
            this.guides = ensurePositionGuidesElements(this.shadowRoot);
        }
    }

    private _hideGuides(): void {
        this._ensureGuidesElements();
        hidePositionGuides(this.guides);
    }

    private _togglePositionGuides(e: Event): void {
        e.stopPropagation();
        this.showPositionGuides = !this.showPositionGuides;
        this.dispatchEvent(new CustomEvent('position-guides-preference-changed', {
            detail: {
                status: this.showPositionGuides,
                selectedId: this.selectedBlockId,
            },
            bubbles: true,
            composed: true,
        }));
    }

    private _toggleSnapGuides(e: Event): void {
        e.stopPropagation();
        this.showSnapGuides = !this.showSnapGuides;
        this.dispatchEvent(new CustomEvent('snap-guides-preference-changed', {
            detail: {
                status: this.showPositionGuides,
                selectedId: this.selectedBlockId,
            },
            bubbles: true,
            composed: true,
        }));
    }

    private _calculateInsertIndexFromInstruction(targetBlock: BlockData, instruction?: DropInstruction): number {
        if (!instruction) {
            return 0;
        }

        switch (instruction.operation) {
            case 'reorder-before':
                return this._getIndexInParent(targetBlock);
            case 'reorder-after':
                return this._getIndexInParent(targetBlock) + 1;
            case 'combine':
                return 0;
            default:
                console.warn(`[BuilderCanvas] Unknow instruction operation: ${instruction.operation}`);
                return 0;
        }
    }

    private _getIndexInParent(targetBlock: BlockData): number {
        const parentId = targetBlock.parentId;
        if (!parentId) {
            return targetBlock.order;
        }

        const parent = this.documentModel.getBlock(parentId);
        const indexInParent = parent?.children?.indexOf(targetBlock.id) ?? -1;

        return indexInParent === -1 ? targetBlock.order : indexInParent;
    }

    private _handleBlockCreated(detail: BlockCreated): void {
        // New block from source zone - create new block
        const targetBlock = this.documentModel.getBlock(detail.targetBlockId || 'root')!;
        const parentId = !detail.targetBlockId ? 'root' : (
            detail.targetIsContainer && detail.instruction?.operation === 'combine' ? detail.targetBlockId :
                this.documentModel.getBlock(detail.targetBlockId!)!.parentId
        );
        const insertIndex = this._calculateInsertIndexFromInstruction(targetBlock, detail.instruction)
        console.log('[BuilderCanvas] Creating new block:', detail.blockType, ' at index:', insertIndex, 'in parent:', parentId, 'with instruction:', detail.instruction?.operation || 'none');

        // Get block defaults including entity configuration
        const blockDefaults = this.blockRegistry.getDefaults(detail.blockType);
        const entityDefaults = this.blockRegistry.getEntityDefaults(detail.blockType);

        const block = this.documentModel.createBlock(
            detail.blockType,
            parentId!,
            {
                ...blockDefaults,
                entityConfig: {
                    mode: entityDefaults.mode || 'inherited',
                    slotId: entityDefaults.slotId,
                },
            },
            {},
            insertIndex
        );
        console.log('[BuilderCanvas] Created block:', block);

        // Auto-select the newly created block
        this.documentModel.select(block.id);
    }

    private _handleBlockReordered(detail: BlockReorderedDetail): void {
        // Reorder existing block inside the canvas
        const targetBlock = this.documentModel.getBlock(detail.targetBlockId || 'root')!;
        let parentBlockId = detail.targetIsContainer && detail.instruction?.operation === 'combine'?
            detail.targetBlockId : this.documentModel.getBlock(detail.targetBlockId!)!.parentId;

        const insertIndex = this._calculateInsertIndexFromInstruction(targetBlock, detail.instruction)
        console.log('[BuilderCanvas] Reordering block:', detail.blockId, ' at index:', insertIndex, 'in parent:', parentBlockId, 'with instruction:', detail.instruction?.operation || 'none');
        this.documentModel.moveBlock(detail.blockId, parentBlockId!, insertIndex);
    }

    private _getSelectedBlockGuideData(
        liveLeftPx?: number,
        liveTopPx?: number,
        liveSize?: { width: number; height: number }
    ): PositionGuidesState | null {
        if (!this.selectedBlockId) return null;

        const block = this.documentModel.getBlock(this.selectedBlockId);
        if (!block || block.layout !== 'absolute') return null;

        const layoutData = this._getResolvedLayoutData(block);
        layoutData.size = liveSize ?? this.getRuntimeBlockSize(block, layoutData);

        // Determine container dimensions and offset for guides
        let containerWidth = this.canvasWidth;
        let containerHeight = this.canvasHeight;
        let containerOffsetX = 0;
        let containerOffsetY = 0;

        if (block.parentId !== 'root') {
            // Block is positioned relative to a container
            const refEl = this._findInShadowDOM(
                this.shadowRoot!,
                `[block-id="${block.parentId}"]`
            ) as HTMLElement | null;

            if (refEl) {
                // Find the actual positioning parent
                let positioningParent: HTMLElement | null = refEl;
                if (this.canvas && positioningParent) {
                    const canvasRect = this.canvas.getBoundingClientRect();
                    const containerRect = positioningParent.getBoundingClientRect();

                    containerOffsetX = containerRect.left - canvasRect.left;
                    containerOffsetY = containerRect.top - canvasRect.top;
                    containerWidth = containerRect.width;
                    containerHeight = containerRect.height;
                }
            }
        }

        const system = new PositionSystem({
            containerSize: {width: containerWidth, height: containerHeight},
            elementSize: layoutData.size,
            anchorPoint: layoutData.positionConfig.anchor,
            originPoint: layoutData.positionConfig.originPoint,
            unitSystem: layoutData.positionConfig.unitSystem,
        });

        // Determine which position to use
        let left: number;
        let top: number;

        if (liveLeftPx !== undefined && liveTopPx !== undefined) {
            // During drag/resize: use live positions (already in canvas coordinates)
            left = liveLeftPx;
            top = liveTopPx;
        } else {
            const moveablePosition = this.blockToMoveable(layoutData, layoutData.size, containerWidth, containerHeight);
            left = moveablePosition.left + containerOffsetX;
            top = moveablePosition.top + containerOffsetY;
        }

        // Convert from canvas coordinates to container-relative for PositionSystem
        const containerLeft = left - containerOffsetX;
        const containerTop = top - containerOffsetY;

        const positionData = system.fromMoveableSpace({x: containerLeft, y: containerTop});

        // Calculate axis coordinates relative to container, then convert to canvas
        const {axisX: containerAxisX, axisY: containerAxisY} = getAxisCoordinates(
            layoutData.positionConfig.anchor,
            containerWidth,
            containerHeight
        );
        const axisX = containerAxisX + containerOffsetX;
        const axisY = containerAxisY + containerOffsetY;

        const {localOriginX, localOriginY} = getLocalOriginOnElement(
            layoutData.positionConfig.originPoint,
            layoutData.size.width,
            layoutData.size.height,
        );

        const blockOriginX = left + localOriginX;
        const blockOriginY = top + localOriginY;

        return {
            axisX,
            axisY,
            blockOriginX,
            blockOriginY,
            unitSystem: layoutData.positionConfig.unitSystem,
            xValue: positionData.x,
            yValue: positionData.y,
        };
    }

    private _updateGuides(liveLeftPx?: number, liveTopPx?: number, liveSize?: { width: number; height: number }): void {
        if (!this.showPositionGuides) {
            this._hideGuides();
            return;
        }

        this._ensureGuidesElements();
        const data = this._getSelectedBlockGuideData(liveLeftPx, liveTopPx, liveSize);
        updatePositionGuides(this.guides, data, this.canvasWidth, this.canvasHeight);
    }

    private _getResolvedLayoutData(block: BlockData): StyleLayoutData {
        const resolvedEntity = this.documentModel.resolveEntityForBlock(block.id);
        const bindingContext = {defaultEntityId: resolvedEntity.entityId};
        const resolved = this.styleResolver.resolve(block.id, this.activeContainerId, bindingContext);
        return getStyleLayoutData(resolved);
    }

    private _onModelChange() {
        // const tree = this.documentModel.buildTree();
        // console.log('[_onModelChange] Tree:', tree);

        this.blocks = this.documentModel.blocks;

        const block = this.documentModel.getBlock(this.documentModel.rootId)!;
        this.rootBlocks = Object.values(this.blocks).filter(block => block.parentId === this.documentModel.rootId);

        this.overflowShow = block.props?.overflow_show?.value;
        this.overflowAllowBlocksOutside = block.props?.overflow_allow_blocks_outside?.value;


        for (const block of Object.values(this.blocks)) {
            this.subscribeBlockEntities(block.id, this.documentModel.getTrackedEntitiesFlat(block));
        }

        // Required, do not remove o we can miss some updates
        this.requestUpdate();
    }

    private _renderControls() {
        if (!this.showControls) {
            return html``;
        }

        return html`
            <div class="canvas-controls">
                <button
                        class="toggle-button"
                        aria-pressed=${this.showPositionGuides ? 'true' : 'false'}
                        title="Toggle position guides and axes"
                        @click=${(e: Event) => this._togglePositionGuides(e)}
                >
                    Position guides
                </button>
                <button
                        class="toggle-button"
                        aria-pressed=${this.showSnapGuides ? 'true' : 'false'}
                        title="Toggle snap lines"
                        @click=${(e: Event) => this._toggleSnapGuides(e)}
                >
                    Snap lines
                </button>
            </div>
        `;
    }

    private _onBuilderClick(e: Event) {
        const linkState = this.linkModeState;
        if (linkState?.enabled) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (target === this) {
            this.documentModel.select(null);
        } else if (target === this.canvas || target === this.canvasFlowContainer) {
            this.documentModel.select(this.documentModel.rootId);
        }
    }

    protected _onBlockClick(e: Event, blockId: string) {
        if (this.documentModel.isHidden(blockId)) return;

        const linkState = this.linkModeState;
        if (linkState?.enabled) {
            if (linkState.activeLinkId && blockId !== linkState.activeLinkId) {
                e.stopPropagation();
                return;
            }
        }

        e.stopPropagation();
        this.documentModel.select(blockId);
    }

    /**
     * Recursively search for an element in shadow DOM trees
     */
    private _findInShadowDOM(root: Element | ShadowRoot | Document, selector: string): Element | null {
        // Try direct query first
        const found = root.querySelector(selector);
        if (found) return found;

        // Search in all shadow roots of children
        const children = root.querySelectorAll('*');
        for (const child of children) {
            if (child.shadowRoot) {
                const foundInShadow = this._findInShadowDOM(child.shadowRoot, selector);
                if (foundInShadow) return foundInShadow;
            }
        }

        return null;
    }

    // =========================================================================
    // Link mode integration
    // =========================================================================

    private _handleLinkModeChanged = (e: Event): void => {
        const detail = (e as CustomEvent<{ state: LinkModeState }>).detail;
        this.linkModeState = detail?.state ?? null;
        this._emitSelectionDisabledState(this.linkModeState);
    };

    private _emitSelectionDisabledState(state: LinkModeState | null): void {
        if (!state?.enabled || state.mode === 'pick-anchor') {
            this.eventBus.dispatchEvent('block-selection-disabled', {disabled: false});
            return;
        }
        this.eventBus.dispatchEvent('block-selection-disabled', {
            disabled: true,
            excluded: state.activeLinkId ?? undefined,
        });
    }

    private async _updateMoveable() {
        await this.updateComplete;

        this.guides = null;

        if (this.moveable) {
            this.moveable.destroy();
            this.moveable = null;
        }

        const selectedId = this.selectedBlockId;

        if (!selectedId) {
            this._hideGuides();
            return;
        }

        const selectedBlock = this.documentModel.getBlock(selectedId);
        if (!selectedBlock || selectedBlock.layout !== 'absolute') {
            this._hideGuides();
            return;
        }

        const blockEl = this.documentModel.getElement(selectedBlock);
        if (!blockEl || !this.canvas) return;

        // Determine the reference container element and offset
        let referenceContainerEl: HTMLElement = this.canvas;
        let containerWidth = this.canvasWidth;
        let containerHeight = this.canvasHeight;
        let containerOffsetX = 0;
        let containerOffsetY = 0;
        let usingReferenceContainer = false;

        if (selectedBlock.parentId !== 'root') {
            // Block is positioned relative to a container, not the canvas
            // Use _findInShadowDOM to search recursively in nested shadow roots
            const refEl = this.documentModel.getElement(selectedBlock.parentId!)!;
            let positioningParent: HTMLElement | null = blockEl.parentElement || refEl;

            referenceContainerEl = positioningParent;
            usingReferenceContainer = true;

            const canvasRect = this.canvas.getBoundingClientRect();
            const containerRect = positioningParent.getBoundingClientRect();

            // Calculate offset between canvas and container
            containerOffsetX = containerRect.left - canvasRect.left;
            containerOffsetY = containerRect.top - canvasRect.top;

            containerWidth = containerRect.width;
            containerHeight = containerRect.height;

        }

        // Wait for block element to complete its update cycle
        await (blockEl as any).updateComplete;

        const layoutData = this._getResolvedLayoutData(selectedBlock);
        const size = this.getRuntimeBlockSize(selectedBlock, layoutData);
        const initialMoveablePosition = this.blockToMoveable(layoutData, size, containerWidth, containerHeight);

        // Position is already applied via inline styles
        // Moveable will work with transform during drag, and we'll update the model at dragEnd

        // Get all other absolute positioned blocks for snap targets
        const allAbsoluteBlocks = Object.values(this.blocks)
            .filter((n) => n.layout === 'absolute' && n.id !== selectedId);

        // If the selected block is container-relative, only snap to siblings in the same container
        // Otherwise, snap to all absolute blocks
        const snapCandidates = selectedBlock.parentId !== 'root' ?
            allAbsoluteBlocks.filter((n) => n.parentId === selectedBlock.parentId) :
            allAbsoluteBlocks;

        // Build snap element targets with custom classes
        const snapElements = snapCandidates
            .map((n) => {
                return {
                    element: this.documentModel.getElement(n.id)!,
                    className: 'moveable-snap-element'
                };
            });

        // Calculate container center lines with custom classes
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        // Determine bounds
        let bounds = null;
        if (!this.overflowAllowBlocksOutside) {
            if (!usingReferenceContainer) {
                // Standard canvas bounds
                bounds = {left: 0, top: 0, right: this.canvasWidth, bottom: this.canvasHeight};
            } else {
                // Container bounds - allow full container but restrict to not go outside canvas
                // Calculate max bounds in container coordinates
                const canvasRect = this.canvas.getBoundingClientRect();
                const containerRect = referenceContainerEl.getBoundingClientRect();

                // Available space from container edge to canvas edge (in container coordinates)
                const leftSpace = containerRect.left - canvasRect.left;
                const topSpace = containerRect.top - canvasRect.top;
                const rightSpace = canvasRect.right - containerRect.right;
                const bottomSpace = canvasRect.bottom - containerRect.bottom;

                bounds = {
                    left: -leftSpace,
                    top: -topSpace,
                    right: containerWidth + rightSpace,
                    bottom: containerHeight + bottomSpace
                };
            }
        }

        // Use the reference container as Moveable's container
        this.moveable = new Moveable(referenceContainerEl, {
            target: blockEl,
            draggable: true,
            resizable: true,
            keepRatio: false,
            throttleDrag: 0,
            throttleResize: 0,
            renderDirections: ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'],
            edge: false,
            origin: false,
            bounds,

            // Enable snapping
            snappable: true,
            snapThreshold: 5,
            isDisplaySnapDigit: this.showSnapGuides,
            snapGap: this.showSnapGuides,
            snapDirections: {top: true, left: true, bottom: true, right: true, center: true, middle: true},
            elementSnapDirections: {top: true, left: true, bottom: true, right: true, center: true, middle: true},

            // Snap to other elements with custom classes
            elementGuidelines: this.showSnapGuides ? snapElements : [],

            // Snap to container center and edges with custom classes
            snapContainer: referenceContainerEl,
            verticalGuidelines: this.showSnapGuides ? [
                {pos: 0, className: 'snap-canvas-edge'},
                {pos: centerX, className: 'snap-canvas-center'},
                {pos: containerWidth, className: 'snap-canvas-edge'}
            ] : [],
            horizontalGuidelines: this.showSnapGuides ? [
                {pos: 0, className: 'snap-canvas-edge'},
                {pos: centerY, className: 'snap-canvas-center'},
                {pos: containerHeight, className: 'snap-canvas-edge'}
            ] : [],

            // Enable snap during resize
            snapDigit: 0,
        });

        // Force update rect to ensure Moveable calculates the correct position
        this.moveable.updateRect();

        // Track last drag position to avoid getBoundingClientRect rounding errors
        // Initialize with current block position to handle clicks without drag
        let lastDragPosition = {
            left: initialMoveablePosition.left,
            top: initialMoveablePosition.top,
        };

        // Track which elements are currently highlighted for snap
        let currentSnapHighlights = new Set<HTMLElement>();

        // Store container dimensions and offset for use in handlers
        const refContainerWidth = containerWidth;
        const refContainerHeight = containerHeight;
        const refContainerOffsetX = containerOffsetX;
        const refContainerOffsetY = containerOffsetY;

        this.moveable.on('dragStart', () => {
            this.showContextualBlockToolbar = false;
            // FIXME: add event type
            this.eventBus.dispatchEvent('block-drag-start', {block: selectedBlock});
        })

        this.moveable.on('drag', ({target, left, top, transform}) => {
            const block = this.documentModel.getBlock(selectedId);
            if (!block) return;

            // Bounds are already enforced by Moveable's bounds option
            // Position is already in container-relative coordinates
            lastDragPosition = {left, top};

            // Apply transform
            target.style.transform = transform;

            // Update guides in real time
            // Convert container-relative coordinates to canvas-relative for guides
            const canvasLeft = left + refContainerOffsetX;
            const canvasTop = top + refContainerOffsetY;
            this._updateGuides(canvasLeft, canvasTop);
        });

        // Highlight elements when snap occurs
        this.moveable.on('snap', ({elements, gaps}) => {
            // Remove old highlights
            currentSnapHighlights.forEach(el => el.classList.remove('snap-highlight'));
            currentSnapHighlights.clear();

            // Add highlights to snapped elements
            // 'elements' array contains guidelines grouped by element
            if (elements && elements.length > 0) {
                elements.forEach((guideline) => {
                    if (guideline.element && guideline.element instanceof HTMLElement) {
                        guideline.element.classList.add('snap-highlight');
                        currentSnapHighlights.add(guideline.element);
                    }
                });
            }

            // Also highlight elements involved in gap snapping
            if (gaps && gaps.length > 0) {
                gaps.forEach((guideline) => {
                    if (guideline.element && guideline.element instanceof HTMLElement) {
                        guideline.element.classList.add('snap-highlight');
                        currentSnapHighlights.add(guideline.element);
                    }
                });
            }
        });

        this.moveable.on('dragEnd', async ({target}) => {
            const block = this.documentModel.getBlock(selectedId);
            if (!block) return;

            // Clear all snap highlights
            currentSnapHighlights.forEach(el => el.classList.remove('snap-highlight'));
            currentSnapHighlights.clear();

            // Use the last tracked position instead of getBoundingClientRect to avoid rounding errors
            const left = lastDragPosition.left;
            const top = lastDragPosition.top;
            const size = this.getRuntimeBlockSize(block, layoutData);
            // Convert from Moveable pixels to block format (handles responsive conversion)
            // Use reference container dimensions
            const updates = this.moveableToBlock(
                {left, top},
                layoutData.positionConfig,
                size,
                refContainerWidth,
                refContainerHeight
            );

            // Clear transform that was applied during drag
            target.style.transform = '';

            this.eventBus.dispatchEvent('moveable-change', updates); // FIXME: this will trigger a render cycle

            this.showContextualBlockToolbar = true;
            // FIXME: add event type
            this.eventBus.dispatchEvent('block-drag-end', {block: selectedBlock});
        });

        // Track last resize position to avoid getBoundingClientRect rounding errors
        // Initialize with current block position and size to handle clicks without resize
        let lastResizePosition = {
            left: initialMoveablePosition.left,
            top: initialMoveablePosition.top,
            width: layoutData.size.width,
            height: layoutData.size.height
        };

        this.moveable.on('resizeStart', () => {
            this.showContextualBlockToolbar = false;
            // FIXME: add event type
            this.eventBus.dispatchEvent('block-resize-start', {block: selectedBlock});
        })

        this.moveable.on('resize', ({target, width, height, drag}) => {
            const newX = drag.left;
            const newY = drag.top;

            // Bounds are already enforced by Moveable's bounds option
            const finalWidth = width;
            const finalHeight = height;

            // Store the exact position and size for resizeEnd
            lastResizePosition = {
                left: newX,
                top: newY,
                width: finalWidth,
                height: finalHeight
            };

            // Update size and use transform for positioning during resize
            target.style.width = `${finalWidth}px`;
            target.style.height = `${finalHeight}px`;
            target.style.transform = drag.transform;

            // Update guides in real time, passing the new size so guides can calculate
            // the correct origin position based on anchor point
            // Convert container-relative coordinates to canvas-relative for guides
            const canvasX = newX + refContainerOffsetX;
            const canvasY = newY + refContainerOffsetY;
            this._updateGuides(canvasX, canvasY, {width: finalWidth, height: finalHeight});
        });

        this.moveable.on('resizeEnd', ({target}) => {
            // Clear all snap highlights
            currentSnapHighlights.forEach(el => el.classList.remove('snap-highlight'));
            currentSnapHighlights.clear();
            const block = this.documentModel.getBlock(selectedId);
            if (!block) return;

            // Use the last tracked position instead of getBoundingClientRect to avoid rounding errors
            const left = lastResizePosition.left;
            const top = lastResizePosition.top;
            const width = lastResizePosition.width;
            const height = lastResizePosition.height;

            // Convert from Moveable pixels to block format (handles responsive conversion)
            // Use reference container dimensions
            const updates = this.moveableResizeToBlock(
                {left, top},
                {width, height},
                layoutData.positionConfig,
                refContainerWidth,
                refContainerHeight
            );

            // Clear transform that was applied during resize
            target.style.transform = '';

            this.eventBus.dispatchEvent('moveable-change', updates); // FIXME: this will trigger a render cycle

            this.showContextualBlockToolbar = true;
            // FIXME: add event type
            this.eventBus.dispatchEvent('block-resize-end', {block: selectedBlock});
        });

        // Initial paint
        this._updateGuides();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'builder-canvas': BuilderCanvas;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('builder-canvas', BuilderCanvas);
