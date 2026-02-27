import { BlockRegistry } from '@/common/blocks/core/registry/block-registry';
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import {
    type BlockData,
    type BlockSelectionChangedDetail,
    DocumentModel,
    documentModelContext
} from '@/common/core/model';
import { PanelBase } from '@/panel/designer/components';
import { consume } from "@lit/context";
import { css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('panel-layers')
export class PanelLayers extends PanelBase {
    static styles = [
        ...PanelBase.styles,
        css`
            :host {
                --mdc-icon-size: 18px;
            }
            .layers-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                border-bottom: 1px solid var(--divider-color);
                background: var(--bg-secondary);
            }

            .layers-title {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                color: var(--text-secondary);
                letter-spacing: 0.5px;
            }

            .toggle-absolute {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                color: var(--text-secondary);
                background: var(--bg-primary);
                border: 1px solid var(--divider-color);
                transition: all 0.15s ease;
            }

            .toggle-absolute:hover {
                background: var(--bg-tertiary);
                border-color: var(--accent-color);
            }

            .toggle-absolute.active {
                background: var(--accent-color);
                color: white;
                border-color: var(--accent-color);
            }

            .toggle-icon {
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .layer-item {
                display: flex;
                align-items: center;
                padding: 6px 8px;
                cursor: pointer;
                user-select: none;
                border-radius: 4px;
                font-size: 12px;
                color: var(--text-primary);
                transition: background 0.15s ease;
            }

            .layer-item:hover {
                background: var(--bg-tertiary);
            }

            .layer-item.selected {
                background: var(--accent-color);
                color: white;
                font-weight: 500;
            }

            .layer-item.selected:hover {
                background: var(--accent-color);
                opacity: 0.95;
            }

            .layer-parent-ref {
                margin-left: auto;
                padding-left: 8px;
                font-size: 10px;
                color: var(--text-tertiary);
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .layer-item.selected .layer-parent-ref {
                color: rgba(255, 255, 255, 0.7);
            }

            .parent-link {
                text-decoration: underline;
                cursor: pointer;
                transition: opacity 0.15s ease;
            }

            .parent-link:hover {
                opacity: 0.7;
            }

            .layer-toggle {
                width: 16px;
                height: 16px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 4px;
                cursor: pointer;
                flex-shrink: 0;
            }

            .layer-toggle::before {
                content: '';
                display: inline-block;
                width: 0;
                height: 0;
                border-left: 4px solid var(--text-secondary);
                border-top: 3px solid transparent;
                border-bottom: 3px solid transparent;
                transition: transform 0.2s;
            }

            .layer-item.selected .layer-toggle::before {
                border-left-color: white;
            }

            .layer-toggle.expanded::before {
                transform: rotate(90deg);
            }

            .layer-toggle.empty {
                visibility: hidden;
            }

            .layer-icon {
                width: 18px;
                height: 18px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 8px;
                font-size: 14px;
                flex-shrink: 0;
            }

            .layer-label {
                flex: 1;
                min-width: 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .layer-label-text {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .layer-type {
                margin-left: 6px;
                font-size: 9px;
                letter-spacing: 0.3px;
                color: var(--text-tertiary);
            }

            .layer-item.selected .layer-type {
                color: rgba(255, 255, 255, 0.7);
            }

            .layer-absolute-badge {
                margin-left: 6px;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: 600;
                text-transform: uppercase;
                background: var(--accent-color);
                color: white;
                letter-spacing: 0.3px;
                flex-shrink: 0;
            }

            .layer-item.selected .layer-absolute-badge {
                background: rgba(255, 255, 255, 0.3);
            }

            .layer-children {
                padding-left: 16px;
            }

            .absolute-root {
                margin-top: 8px;
            }
        `,
    ];
    @consume({context: documentModelContext})
    documentModel!: DocumentModel;
    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;
    @state() private selectedId: string | null = null;
    @state() private blocks: Record<string, BlockData> = {};
    @state() private expandedBlocks: Set<string> = new Set();
    @state() private autoExpandedBlocks: Set<string> = new Set();
    @state() private showAbsoluteSeparated: boolean = false;

    connectedCallback(): void {
        super.connectedCallback();
        this._onModelChange();

        this.documentModel.addEventListener('change', () => this._onModelChange());
        this.documentModel.addEventListener('selection-changed', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
            const newSelectedId = detail.selectedId;

            // Close all auto-expanded blocks that are not manually expanded
            this.autoExpandedBlocks.forEach(blockId => {
                if (!this.expandedBlocks.has(blockId)) {
                    // This block was only auto-expanded, so we don't need to track it anymore
                }
            });
            this.autoExpandedBlocks.clear();

            // If there's a new selection, auto-expand the chain to that block
            if (newSelectedId) {
                const selectedBlock = this.blocks[newSelectedId];

                // If showing absolute blocks separately and selected block is absolute
                if (this.showAbsoluteSeparated && selectedBlock?.layout === 'absolute') {
                    // Auto-expand the absolute-root
                    if (!this.expandedBlocks.has('absolute-root')) {
                        this.autoExpandedBlocks.add('absolute-root');
                    }
                } else {
                    // Auto-expand the parent chain
                    const chain = this._getParentChain(newSelectedId);
                    chain.forEach(blockId => {
                        if (!this.expandedBlocks.has(blockId)) {
                            this.autoExpandedBlocks.add(blockId);
                        }
                    });
                }
            }

            this.selectedId = newSelectedId;
            this.requestUpdate();
        });

        this.expandedBlocks.add(this.documentModel.rootId);
    }

    render() {
        const rootBlock = this.blocks[this.documentModel.rootId];

        // Collect all absolute blocks
        const absoluteBlocks = Object.values(this.blocks).filter(
            block => block.layout === 'absolute' && block.id !== this.documentModel.rootId
        );

        return html`
            <div class="layers-header">
                <div class="layers-title">Layers</div>
                <div 
                    class="toggle-absolute ${this.showAbsoluteSeparated ? 'active' : ''}"
                    @click=${this._toggleAbsoluteMode}
                    title="Toggle absolute blocks visualization"
                >
                    <span class="toggle-icon"><ha-icon icon="mdi:crosshairs-gps"></ha-icon></span>
                    <span>${this.showAbsoluteSeparated ? 'Separated' : 'Nested'}</span>
                </div>
            </div>
            <div class="panel-content">
                ${this._renderLayer(rootBlock, 0)}
                ${this.showAbsoluteSeparated && absoluteBlocks.length > 0 ? html`
                    <div class="absolute-root">
                        ${this._renderAbsoluteRoot(absoluteBlocks)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    private _onModelChange(): void {
        this.blocks = {...this.documentModel.blocks};
        this.requestUpdate();
    }

    private _getParentChain(blockId: string): string[] {
        const chain: string[] = [];
        let currentId: string | null = blockId;

        while (currentId && currentId !== this.documentModel.rootId) {
            // Find the parent of currentId
            let parentId: string | null = null;
            for (const [id, block] of Object.entries(this.blocks)) {
                if (block.children?.includes(currentId)) {
                    parentId = id;
                    break;
                }
            }

            if (parentId) {
                chain.push(parentId);
                currentId = parentId;
            } else {
                break;
            }
        }

        return chain;
    }

    private _renderLayer(block: BlockData, depth: number): any {
        const blockDef = this.blockRegistry.getBlock(block.type);
        const icon = block.id === this.documentModel.rootId ?
            '<ha-icon icon="mdi:card-outline"></ha-icon>' : (blockDef?.icon || '?');
        const {displayLabel, typeLabel, hasCustomLabel} = this._getLayerDisplay(block);

        // Filter children based on current mode and remove hidden block showing his children directly under this block
        const flowChildren = (block.children || []).reduce<BlockData[]>((accumulated, childId) => {
            const child = this.blocks[childId];
            let children = [child];
            // If block is hidden, get its children and push them to show directly under this block
            if (this.documentModel.isHidden(childId)) {
                children = (child.children || []).map((grandId) => this.blocks[grandId]);
            }

            children.forEach((item) => {
                // In separated mode, show only flow blocks in the tree
                if (!this.showAbsoluteSeparated || item.layout === 'flow') {
                    accumulated.push(item);
                }
            })

            return accumulated;
        }, []);

        const hasChildren = flowChildren.length > 0;
        const isExpanded = this.expandedBlocks.has(block.id) || this.autoExpandedBlocks.has(block.id);
        const isSelected = this.selectedId === block.id;

        return html`
            <div>
                <div
                    class="layer-item ${isSelected ? 'selected' : ''}"
                    @click=${(e: Event) => this._onLayerClick(e, block.id)}
                >
            <span
                  class="layer-toggle ${hasChildren ? (isExpanded ? 'expanded' : '') : 'empty'}"
                  @click=${(e: Event) => this._onToggleClick(e, block.id)}
            ></span>
                    <span class="layer-icon">${unsafeHTML(icon)}</span>
                    <span class="layer-label">
                        <span class="layer-label-text">${displayLabel}</span>
                        ${hasCustomLabel ? html`<span class="layer-type">${typeLabel}</span>` : ''}
                    </span>
                    ${!this.showAbsoluteSeparated && block.layout === 'absolute' && block.id !== this.documentModel.rootId ? html`
                        <span class="layer-absolute-badge">Abs</span>
                    ` : ''}
                </div>
                ${hasChildren && isExpanded ? html`
                    <div class="layer-children">
                        ${flowChildren.map((child) => this._renderLayer(child, depth + 1))}
                    </div>
                ` : ''}
            </div>
        `;
    }

    private _onLayerClick(e: Event, blockId: string): void {
        e.stopPropagation();
        this.documentModel.select(blockId);
    }

    private _onToggleClick(e: Event, blockId: string): void {
        e.stopPropagation();
        const block = this.blocks[blockId];

        const hasFlowChildren = block.children && block.children.some(childId => {
            const child = this.blocks[childId];
            return child && child.layout === 'flow';
        });

        if (!hasFlowChildren) return;

        if (this.expandedBlocks.has(blockId)) {
            this.expandedBlocks.delete(blockId);
        } else {
            this.expandedBlocks.add(blockId);
        }
        this.requestUpdate();
    }

    private _toggleAbsoluteMode(): void {
        this.showAbsoluteSeparated = !this.showAbsoluteSeparated;
        this.requestUpdate();
    }

    private _getLayerDisplay(block: BlockData): { displayLabel: string; typeLabel: string; hasCustomLabel: boolean } {
        const blockDef = this.blockRegistry.getBlock(block.type);
        const typeLabel = block.id === this.documentModel.rootId ? 'Card' : (blockDef?.label || block.type);

        return {
            displayLabel: this.documentModel.getBlockDisplayName(block, typeLabel),
            typeLabel,
            hasCustomLabel: Boolean(this.documentModel.getBlockLabel(block)),
        };
    }

    private _renderAbsoluteRoot(absoluteBlocks: BlockData[]): any {
        const isExpanded = this.expandedBlocks.has('absolute-root') || this.autoExpandedBlocks.has('absolute-root');

        return html`
            <div>
                <div
                    class="layer-item"
                    @click=${(e: Event) => {
                        e.stopPropagation();
                        if (this.expandedBlocks.has('absolute-root')) {
                            this.expandedBlocks.delete('absolute-root');
                        } else {
                            this.expandedBlocks.add('absolute-root');
                        }
                        this.requestUpdate();
                    }}
                >
                    <span class="layer-toggle ${isExpanded ? 'expanded' : ''}"></span>
                    <span class="layer-icon"><ha-icon icon="mdi:crosshairs-gps"></span>
                    <span class="layer-label">Absolute Blocks</span>
                </div>
                ${isExpanded ? html`
                    <div class="layer-children">
                        ${absoluteBlocks.map(block => this._renderAbsoluteBlock(block))}
                    </div>
                ` : ''}
            </div>
        `;
    }

    private _renderAbsoluteBlock(block: BlockData): any {
        const blockDef = this.blockRegistry.getBlock(block.type);
        const icon = blockDef?.icon || '?';
        const {displayLabel, typeLabel, hasCustomLabel} = this._getLayerDisplay(block);
        const isSelected = this.selectedId === block.id;

        // Get parent block info for reference
        const parentBlock = block.parentId ? this.blocks[block.parentId] : null;
        const parentLabelInfo = parentBlock ? this._getLayerDisplay(parentBlock) : null;

        return html`
            <div
                class="layer-item ${isSelected ? 'selected' : ''}"
                @click=${(e: Event) => this._onLayerClick(e, block.id)}
            >
                <span class="layer-toggle empty"></span>
                <span class="layer-icon">${unsafeHTML(icon)}</span>
                <span class="layer-label">
                    <span class="layer-label-text">${displayLabel}</span>
                    ${hasCustomLabel ? html`<span class="layer-type">${typeLabel}</span>` : ''}
                </span>
                ${parentLabelInfo ? html`
                    <span class="layer-parent-ref">
                        in: 
                        <span 
                            class="parent-link"
                            @click=${(e: Event) => {
                                e.stopPropagation();
                                if (block.parentId) {
                                    this.documentModel.select(block.parentId);
                                }
                            }}
                        >
                            ${parentLabelInfo.displayLabel}
                            ${parentLabelInfo.hasCustomLabel ? html`<span class="layer-type">${parentLabelInfo.typeLabel}</span>` : ''}
                        </span>
                    </span>
                ` : ''}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'panel-layers': PanelLayers;
    }
}
