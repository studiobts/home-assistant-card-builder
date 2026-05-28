import { BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import { type EventBus, eventBusContext } from "@/common/core/event-bus";
import {
    type BlockData,
    type BlockSelectionChangedDetail,
    type DocumentModel,
    documentModelContext
} from '@/common/core/model';
import { consume } from "@lit/context";
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('contextual-block-toolbar')
export class ContextualBlockToolbar extends LitElement {
    static styles = css`
        :host {
            position: absolute;
            z-index: 100;
            pointer-events: none;
        }

        .toolbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            width: 100%;
        }

        .block-label {
            background: var(--accent-color, #1976d2);
            color: white;
            padding: 5px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            pointer-events: auto;
            box-shadow: 0 0 0 0, 0 0 0 0, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }

        .toolbar {
            display: flex;
            gap: 2px;
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 6px;
            box-shadow: 0 0 0 0, 0 0 0 0, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
            pointer-events: auto;
            --mdc-icon-size: 16px;
        }

        .toolbar-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 21px;
            border: none;
            background: transparent;
            cursor: pointer;
            color: var(--text-primary, #333333);
            transition: all 0.15s ease;
        }

        .toolbar-button:hover {
            background: var(--bg-secondary, #f5f5f5);
        }

        .toolbar-button:active {
            background: var(--bg-tertiary, #e8e8e8);
            transform: scale(0.95);
        }

        .toolbar-button svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .toolbar-button.delete:hover {
            background: #fee;
            color: #d32f2f;
        }

        .toolbar-button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .toolbar-button:disabled:hover {
            background: transparent;
        }
    `;
    @consume({context: documentModelContext})
    documentModel!: DocumentModel;
    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;
    @property({attribute: false})
    show = true;

    @property({attribute: false})
    canvas?: HTMLElement;
    @consume({context: eventBusContext})
    protected eventBus!: EventBus;
    @state()
    protected selectedBlockId: string | null = null;
    protected selectedBlock: BlockData | null = null;
    protected targetElement: HTMLElement | null = null;
    private position = {top: 0, left: 0};
    private canDelete = false;
    private canDuplicate = false;
    private canSelectParent = false;
    private positionRafId: number | null = null;

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this._updatePosition);

        this.documentModel.addEventListener('selection-changed', this._onSelectionChanged);
        this.eventBus.addEventListener('canvas-size-changed', this._onCanvasSizeChanged);
        this.documentModel.addEventListener('block-updated', this._onBlockUpdated);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this._updatePosition);
        this.documentModel.removeEventListener('selection-changed', this._onSelectionChanged);
        this.eventBus.removeEventListener('canvas-size-changed', this._onCanvasSizeChanged);
        this.documentModel.removeEventListener('block-updated', this._onBlockUpdated);
        if (this.positionRafId !== null) {
            cancelAnimationFrame(this.positionRafId);
            this.positionRafId = null;
        }
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has('canvas')) {
            this._updatePosition();
        }
    }

    render() {
        if (!this.show || !this.selectedBlockId) {
            return nothing;
        }

        this.selectedBlock = this.documentModel.getBlock(this.selectedBlockId)!;
        this.targetElement = this.selectedBlockId === this.documentModel.rootId ?
            this.canvas! : this.documentModel.getElement(this.selectedBlockId)!;

        this._updateCapabilities();
        this._updatePosition();

        const blockLabel = this._getBlockLabel();

        return html`
            <div class="toolbar-container">
                <div class="block-label">${blockLabel}</div>
                <div class="toolbar">
                    <button
                            class="toolbar-button"
                            ?disabled=${!this.canSelectParent}
                            @click=${(e: Event) => this._handleSelectParent(e)}
                            title="Select parent (↑)"
                    >
                        <ha-icon icon="mdi:chevron-up"></ha-icon>
                    </button>

                    <button
                            class="toolbar-button"
                            ?disabled=${!this.canDuplicate}
                            @click=${this._handleDuplicate}
                            title="Duplicate (Ctrl+D)"
                    >
                        <ha-icon icon="mdi:content-duplicate"></ha-icon>
                    </button>

                    <button
                            class="toolbar-button delete"
                            ?disabled=${!this.canDelete}
                            @click=${this._handleDelete}
                            title="Delete"
                    >
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>
            </div>
        `;
    }

    private _updateCapabilities = () => {
        this.canDelete = this.documentModel.canDeleteBlock(this.selectedBlockId!);
        this.canDuplicate = this.documentModel.canDuplicateBlock(this.selectedBlockId!);
        this.canSelectParent = this.selectedBlock!.parentId !== null;
    };

    private _onSelectionChanged = (e: Event) => {
        const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
        this.selectedBlockId = detail.selectedId;
    };

    private _onCanvasSizeChanged = () => this._updatePosition();

    private _onBlockUpdated = (e: Event) => {
        const detail = (e as CustomEvent<{ block: BlockData }>).detail;
        if (!this.selectedBlockId) return;
        if (detail?.block?.id === this.selectedBlockId || this.selectedBlockId === this.documentModel.rootId) {
            this._updatePosition();
        }
    };

    private _updatePosition = () => {
        if (!this.targetElement) {
            return;
        }

        if (this.positionRafId !== null) {
            return;
        }

        this.positionRafId = requestAnimationFrame(() => {
            this.positionRafId = null;
            if (!this.targetElement) return;

            const rect = this.targetElement.getBoundingClientRect();
            const root = this.getRootNode();
            const anchorHost = root instanceof ShadowRoot ? root.host as HTMLElement : null;
            const anchorRect = anchorHost?.getBoundingClientRect();
            const anchorTop = anchorRect?.top ?? 0;
            const anchorLeft = anchorRect?.left ?? 0;
            const toolbarHeight = 25; // Approximate toolbar height
            const offset = 5; // Offset above the element

            this.position = {
                top: rect.top - anchorTop - toolbarHeight - offset,
                left: rect.left - anchorLeft,
            };

            this.style.top = `${this.position.top}px`;
            this.style.left = `${this.position.left}px`;
            this.style.width = `${rect.width}px`;
            this.style.transform = 'none';
        });
    };

    private _handleSelectParent(e: Event) {
        e.stopPropagation();
        if (!this.selectedBlock || !this.canSelectParent) return;

        let parentId = this.selectedBlock.parentId;

        while (parentId && this.documentModel.isHidden(parentId)) {
            parentId = this.documentModel.getBlock(parentId)!.parentId;
        }

        if (parentId) {
            this.documentModel.select(parentId);
        }
    }

    private _handleDuplicate() {
        if (!this.selectedBlock || !this.canDuplicate) return;

        this.documentModel.duplicateBlock(this.selectedBlock.id);
    }

    private _handleDelete() {
        if (!this.selectedBlock || !this.canDelete) return;

        this.documentModel.deleteBlock(this.selectedBlock.id);
    }

    private _getBlockLabel(): string {
        if (!this.selectedBlock) return '';

        // Get label from BlockRegistry
        const blockDef = this.blockRegistry.getBlock(this.selectedBlock.type);
        const fallbackLabel = blockDef?.label || this.selectedBlock.type
            .replace(/^ha-/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return this.documentModel.getBlockDisplayName(this.selectedBlock, fallbackLabel);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'contextual-block-toolbar': ContextualBlockToolbar;
    }
}
