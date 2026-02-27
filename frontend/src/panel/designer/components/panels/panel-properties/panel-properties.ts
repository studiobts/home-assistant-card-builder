import type { MediaPickerTrait, PropertyTrait, TraitPropertyValue } from '@/common/blocks/core/properties';
import type { BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from "@/common/blocks/core/registry/block-registry-context";
import type { EventBus } from '@/common/core/event-bus';
import { eventBusContext } from '@/common/core/event-bus';
import type { BlockPanelConfig, GridConfig } from '@/common/blocks/types';
import type { ValueBinding } from '@/common/core/binding';
import {
    type BlockData,
    type BlockEntityConfig,
    type BlockSelectionChangedDetail,
    type BlockUpdatedDetail,
    DocumentModel,
    documentModelContext,
    type ResolvedEntityInfo
} from '@/common/core/model';
import type { HomeAssistant } from 'custom-card-helpers';
import { consume } from "@lit/context";
import { css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { PanelBase } from '../panel-base';

import "@/panel/designer/components/editors/entity-config-editor/entity-config-editor";
import { linkModeControllerContext, LinkModeController } from '@/panel/designer/components/editors/link-editor/link-mode-controller';
import { overlayHostContext, type OverlayHost } from '@/panel/designer/core/overlay-host-context';
import '@/panel/designer/components/editors/grid-editor/grid-editor-overlay';
import '@/panel/designer/components/editors/link-editor/link-editor-overlay';
import './panel-properties-traits';

export class PanelProperties extends PanelBase {
    static styles = [
        ...PanelBase.styles,
        css`
            .panel-content {
                padding: 0;
            }
            /* Entity Config Section */
            .entity-config-section {
                padding: 12px;
                background: var(--bg-secondary, #f9f9f9);
                border-bottom: 1px solid var(--border-color, #e0e0e0);
            }

            .section-title {
                display: block;
                margin-bottom: 12px;
                font-size: 11px;
                font-weight: 600;
                color: var(--text-primary, #333);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            /* Overlay trigger styles */
            .edit-grid-button {
                width: 100%;
                padding: 10px 16px;
                background: var(--accent-color, #2196f3);
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .edit-grid-button:hover {
                background: var(--accent-dark, #1976d2);
            }

            .edit-grid-button::before {
                content: '⊞';
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: opacity 0.2s;
            }

            .block-meta {
                padding: 12px;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
                background: var(--bg-secondary, #f9f9f9);
            }

            .id-row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .id-apply {
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 4px;
                background: var(--bg-primary, #fff);
                color: var(--text-primary, #333);
                cursor: pointer;
                transition: background 0.15s ease;
            }

            .id-apply:hover {
                background: var(--bg-tertiary, #f0f0f0);
            }

            .id-apply:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .id-error {
                margin-top: 4px;
                font-size: 10px;
                color: var(--error-color, #d32f2f);
            }
        `,
    ];

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;

    @consume({context: eventBusContext})
    eventBus!: EventBus;

    @consume({context: linkModeControllerContext})
    linkModeController!: LinkModeController;

    @consume({context: overlayHostContext})
    overlayHost!: OverlayHost;

    @property({attribute: false})
    hass?: HomeAssistant;

    @state() protected selectedBlock: BlockData | null = null;
    @state() protected resolvedEntityInfo: ResolvedEntityInfo | null = null;
    @state() protected pendingBlockId = '';
    @state() protected blockIdError: string | null = null;
    @state() protected idDirty = false;
    @state() protected pendingMediaRequestId: string | null = null;
    @state() protected pendingMediaTarget: { prop: string; sourceProp?: string; sourceValue?: string } | null = null;
    @state() protected gridEditorOpen = false;
    @state() protected linkEditorOpen = false;
    @state() protected gridEditorBlockId: string | null = null;
    @state() protected linkEditorBlockId: string | null = null;

    connectedCallback(): void {
        super.connectedCallback();

        this.overlayHost.registerOverlay('grid-editor', () => this._renderGridEditorOverlay());
        this.overlayHost.registerOverlay('link-editor', () => this._renderLinkEditorOverlay());

        this.documentModel.addEventListener('selection-changed', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
            this.selectedBlock = detail.selectedBlock || null;
            this.pendingBlockId = this.selectedBlock?.id || '';
            this.blockIdError = null;
            this.idDirty = false;
            this.pendingMediaRequestId = null;
            this.pendingMediaTarget = null;
            this._updateResolvedEntityInfo();
        });

        this.documentModel.addEventListener('block-updated', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockUpdatedDetail;
            if (this.selectedBlock && detail.block.id === this.selectedBlock.id) {
                this.selectedBlock = {...detail.block};
                this._updateResolvedEntityInfo();
                if (!this.idDirty) {
                    this.pendingBlockId = detail.block.id;
                }
            }
            if (this.gridEditorBlockId === detail.block.id || this.linkEditorBlockId === detail.block.id) {
                this.overlayHost.invalidateOverlays();
            }
        });

        this.documentModel.addEventListener('block-deleted', (e: Event) => {
            const detail = (e as CustomEvent<{ blockId: string }>).detail;
            if (!detail?.blockId) return;
            if (this.gridEditorBlockId === detail.blockId) {
                this._closeGridEditor();
            }
            if (this.linkEditorBlockId === detail.blockId) {
                this._closeLinkEditor();
            }
        });

        this.eventBus.addEventListener('grid-editor-open', this._handleGridEditorOpen);
        this.eventBus.addEventListener('grid-editor-close', this._handleGridEditorClose);
        this.eventBus.addEventListener('link-editor-open', this._handleLinkEditorOpen);
        this.eventBus.addEventListener('link-editor-close', this._handleLinkEditorClose);

        this.eventBus.addEventListener('media-manager-selected', (data: {
            requestId: string;
            selection: { reference: string };
        }) => {
            if (!data || data.requestId !== this.pendingMediaRequestId || !this.pendingMediaTarget) return;
            this.pendingMediaRequestId = null;
            const { prop, sourceProp, sourceValue } = this.pendingMediaTarget;
            this.pendingMediaTarget = null;
            if (!data.selection?.reference) return;

            this._updatePropWithBinding(prop, data.selection.reference);
            if (sourceProp) {
                this._updatePropWithBinding(sourceProp, sourceValue ?? 'media');
            }
        });

        this.eventBus.addEventListener('media-manager-cancelled', (data: { requestId: string }) => {
            if (!data || data.requestId !== this.pendingMediaRequestId) return;
            this.pendingMediaRequestId = null;
            this.pendingMediaTarget = null;
        });
    }

    disconnectedCallback(): void {
        this.overlayHost.unregisterOverlay('grid-editor');
        this.overlayHost.unregisterOverlay('link-editor');
        this.eventBus.removeEventListener('grid-editor-open', this._handleGridEditorOpen);
        this.eventBus.removeEventListener('grid-editor-close', this._handleGridEditorClose);
        this.eventBus.removeEventListener('link-editor-open', this._handleLinkEditorOpen);
        this.eventBus.removeEventListener('link-editor-close', this._handleLinkEditorClose);
        super.disconnectedCallback();
    }

    render() {
        if (!this.selectedBlock) {
            return html`
                <div class="empty-state">
                    <ha-icon icon="mdi:tag-outline"></ha-icon>
                    <div>Select an element to edit its properties</div>
                </div>
            `;
        }

        const blockDef = this.blockRegistry.getBlock(this.selectedBlock.type);
        const typeLabel = this.selectedBlock.id === this.documentModel.rootId ? 'Card' : (blockDef?.label || this.selectedBlock.type);
        const canApplyId = this.pendingBlockId.trim() !== this.selectedBlock.id && this.pendingBlockId.trim() !== '';
        const isRootBlock = this.selectedBlock.id === this.documentModel.rootId;

        return html`
            <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">${typeLabel}</span>
            </div>
            
            ${!isRootBlock ? html`
            <div class="block-meta">
                <div class="property-row">
                    <span class="property-label">Block name</span>
                    <input
                        class="property-input"
                        type="text"
                        .value=${this.selectedBlock.label || ''}
                        placeholder="Optional name"
                        @change=${this._onBlockLabelChanged}
                    />
                </div>
                <div class="property-row">
                    <span class="property-label">Block ID</span>
                    <div class="id-row">
                        <input
                            class="property-input"
                            type="text"
                            .value=${this.pendingBlockId}
                            @input=${this._onBlockIdInput}
                        />
                        <button
                            class="id-apply"
                            ?disabled=${!canApplyId}
                            @click=${this._applyBlockId}
                        >
                            Apply
                        </button>
                    </div>
                    ${this.blockIdError ? html`<div class="id-error">${this.blockIdError}</div>` : nothing}
                </div>
            </div>` : nothing}
            
            <!-- Entity Configuration Section -->
            ${this._renderEntityConfigSection()}
            
            <div class="panel-content">
                ${this._renderProperties()}
            </div>
        `;
    }

    public openTraitBindingEditor(propertyName: string): void {
        const traitsPanel = this.shadowRoot?.querySelector('traits-panel') as any;
        traitsPanel?.openBindingEditor?.(propertyName);
    }

    /**
     * Update resolved entity info for the selected block
     */
    protected _updateResolvedEntityInfo(): void {
        if (!this.selectedBlock) {
            this.resolvedEntityInfo = null;
            return;
        }
        this.resolvedEntityInfo = this.documentModel.resolveEntityForBlock(this.selectedBlock.id);
    }

    protected _onBlockLabelChanged(e: Event): void {
        if (!this.selectedBlock) return;
        const input = e.target as HTMLInputElement;
        const label = input.value.trim();
        this.documentModel.updateBlock(this.selectedBlock.id, {label: label || undefined});
    }

    protected _onBlockIdInput(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.pendingBlockId = input.value;
        this.blockIdError = null;
        this.idDirty = this.selectedBlock ? this.pendingBlockId.trim() !== this.selectedBlock.id : false;
    }

    protected _applyBlockId(): void {
        if (!this.selectedBlock) return;

        const result = this.documentModel.updateBlockId(this.selectedBlock.id, this.pendingBlockId);
        if (!result.success) {
            this.blockIdError = result.error || 'Unable to update ID';
            return;
        }

        this.pendingBlockId = this.pendingBlockId.trim();
        this.blockIdError = null;
        this.idDirty = false;
    }

    /**
     * Render the entity configuration section
     */
    protected _renderEntityConfigSection() {
        if (!this.selectedBlock) return nothing;

        const entityConfig = this.selectedBlock.entityConfig || {mode: 'inherited'};

        return html`
            <div class="entity-config-section">
                <span class="section-title">Entity Configuration</span>
                <entity-config-editor
                    .block=${this.selectedBlock}    
                    .config=${entityConfig}
                    .resolvedInfo=${this.resolvedEntityInfo}
                    .hass=${this.hass}
                    @config-changed=${this._onEntityConfigChanged}
                    @select-source-block=${this._onSelectSourceBlock}
                ></entity-config-editor>
            </div>
        `;
    }

    /**
     * Render properties using the traits system
     */
    protected _renderProperties() {
        if (!this.selectedBlock) return html``;

        const element = this.documentModel.getElement(this.selectedBlock.id);
        const panelConfig = element?.getPanelConfig();
        const propertiesConfig = panelConfig?.properties;

        if (!propertiesConfig) {
            return html`
                <div class="placeholder-text">
                    No editable properties available for this element
                </div>
            `;
        }

        return html`
            <traits-panel
                .config=${propertiesConfig}
                .props=${this.selectedBlock.props || {}}
                .block=${this.selectedBlock}
                .hass=${this.hass}
                .defaultEntityId=${this.resolvedEntityInfo?.entityId}
                .actionHandlers=${this._getActionHandlers()}
                @trait-changed=${this._onTraitChanged}
                @trait-binding-changed=${this._onTraitBindingChanged}
            ></traits-panel>
        `;
    }

    /**
     * Get action handlers for trait actions
     */
    protected _getActionHandlers(): Map<string, () => void> {
        const handlers = new Map<string, () => void>([
            ['open-grid-editor', () => this._openGridEditor()],
            ['open-link-editor', () => this._openLinkEditor()],
        ]);

        const panelConfig = this._getPanelConfig();
        const groups = panelConfig?.properties?.groups ?? [];
        for (const group of groups) {
            for (const trait of group.traits ?? []) {
                if (this._isMediaPickerTrait(trait)) {
                    handlers.set(`media-picker-open:${trait.name}`, () => this._openMediaPicker(trait));
                    handlers.set(`media-picker-clear:${trait.name}`, () => this._clearMediaPicker(trait));
                }
            }
        }

        return handlers;
    }

    /**
     * Handle trait value change
     */
    protected _onTraitChanged(e: CustomEvent<{ name: string; value: unknown }>) {
        const {name, value} = e.detail;
        const existing = this._getTraitPropertyValue(name);
        const nextValue: TraitPropertyValue = {
            value,
            binding: existing?.binding,
        };
        this._updateProp(name, nextValue);
    }

    protected _onTraitBindingChanged(
        e: CustomEvent<{ name: string; binding: ValueBinding | null }>
    ): void {
        if (!this.selectedBlock) return;

        const existing = this._getTraitPropertyValue(e.detail.name);
        const nextValue: TraitPropertyValue = {
            value: existing?.value,
            binding: e.detail.binding ?? undefined,
        };
        this._updateProp(e.detail.name, nextValue);
    }

    protected _getTraitPropertyValue(name: string): TraitPropertyValue | undefined {
        const value = this.selectedBlock?.props?.[name];
        if (!value || typeof value !== 'object') {
            return undefined;
        }

        const candidate = value as TraitPropertyValue;
        if ('value' in candidate || 'binding' in candidate) {
            return candidate;
        }

        return undefined;
    }

    private _getPanelConfig(): BlockPanelConfig | undefined {
        if (!this.selectedBlock) return undefined;
        const element = this.documentModel.getElement(this.selectedBlock.id);
        return element?.getPanelConfig();
    }

    private _isMediaPickerTrait(trait: PropertyTrait): trait is MediaPickerTrait {
        return trait.type === 'media-picker';
    }

    private _openMediaPicker(trait: MediaPickerTrait): void {
        if (!this.eventBus) return;
        const requestId = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.pendingMediaRequestId = requestId;
        this.pendingMediaTarget = {
            prop: trait.name,
            sourceProp: trait.sourceProp,
            sourceValue: trait.sourceValue,
        };
        this.eventBus.dispatchEvent('media-manager-open', {
            mode: 'select',
            requestId,
            title: 'Select media',
            subtitle: 'Choose or upload a file',
            confirmLabel: 'Use media',
        });
    }

    private _clearMediaPicker(trait: MediaPickerTrait): void {
        this._updatePropWithBinding(trait.name, '');
    }

    private _updatePropWithBinding(name: string, value: unknown): void {
        const existing = this._getTraitPropertyValue(name);
        const nextValue: TraitPropertyValue = {
            value,
            binding: existing?.binding,
        };
        this._updateProp(name, nextValue);
    }

    /**
     * Update a single property on the selected block
     */
    protected _updateProp(key: string, value: unknown): void {
        if (!this.selectedBlock) return;
        this.documentModel.updateBlock(this.selectedBlock.id, {
            props: {[key]: value},
        });
    }

    // Grid Editor handlers
    protected _openGridEditor() {
        if (!this.selectedBlock) return;
        this.eventBus.dispatchEvent('grid-editor-open', {blockId: this.selectedBlock.id});
    }

    protected _openLinkEditor() {
        if (!this.selectedBlock || this.selectedBlock.type !== 'block-link') return;
        this.linkModeController?.openEditor(this.selectedBlock.id);
    }

    private _handleGridEditorOpen = (data?: { blockId?: string }) => {
        const blockId = data?.blockId ?? this.selectedBlock?.id ?? null;
        if (!blockId) return;
        const block = this.documentModel.getBlock(blockId);
        if (!block || block.type !== 'block-grid') return;
        this.gridEditorBlockId = blockId;
        this.gridEditorOpen = true;
        this.overlayHost.invalidateOverlays();
    };

    private _handleGridEditorClose = () => {
        this._closeGridEditor();
    };

    private _handleLinkEditorOpen = (data?: { blockId?: string }) => {
        const blockId = data?.blockId ?? this.documentModel.getLinkModeState().activeLinkId ?? null;
        if (!blockId) return;
        const block = this.documentModel.getBlock(blockId);
        if (!block || block.type !== 'block-link') return;
        this.documentModel.select(blockId);
        this.linkEditorBlockId = blockId;
        this.linkEditorOpen = true;
        this.overlayHost.invalidateOverlays();
    };

    private _handleLinkEditorClose = () => {
        this.linkEditorOpen = false;
        this.linkEditorBlockId = null;
        this.overlayHost.invalidateOverlays();
    };

    private _closeGridEditor = () => {
        this.gridEditorOpen = false;
        this.gridEditorBlockId = null;
        this.overlayHost.invalidateOverlays();
    };

    private _closeLinkEditor = () => {
        this.linkModeController?.closeEditor();
    };

    private _applyGridConfig = (e: CustomEvent) => {
        const {config} = e.detail;
        if (!this.gridEditorBlockId) return;
        this.documentModel.updateBlock(this.gridEditorBlockId, {
            props: {gridConfig: config},
        });
        this._closeGridEditor();
    };

    private _renderGridEditorOverlay() {
        if (!this.gridEditorOpen || !this.gridEditorBlockId) return nothing;
        const block = this._getGridBlock();
        const gridConfig = (block?.props?.gridConfig as GridConfig) || null;
        if (!block || !gridConfig) return nothing;
        return html`
            <grid-editor-overlay
                .open=${this.gridEditorOpen}
                .config=${gridConfig}
                @overlay-cancel=${this._closeGridEditor}
                @overlay-apply=${this._applyGridConfig}
            ></grid-editor-overlay>
        `;
    }

    private _renderLinkEditorOverlay() {
        const block = this._getLinkBlock();
        if (!block) return nothing;
        return html`
            <link-editor-overlay
                .open=${this.linkEditorOpen}
                .block=${block}
                .controller=${this.linkModeController}
                @overlay-close=${this._closeLinkEditor}
            ></link-editor-overlay>
        `;
    }

    private _getGridBlock(): BlockData | null {
        if (!this.gridEditorBlockId) return null;
        return this.documentModel.getBlock(this.gridEditorBlockId) ?? null;
    }

    private _getLinkBlock(): BlockData | null {
        if (!this.linkEditorBlockId) return null;
        return this.documentModel.getBlock(this.linkEditorBlockId) ?? null;
    }


    /**
     * Handle entity configuration change from editor
     */
    protected _onEntityConfigChanged(e: CustomEvent<BlockEntityConfig>): void {
        if (!this.selectedBlock) return;

        this.documentModel.updateBlock(this.selectedBlock.id, {
            entityConfig: e.detail,
        });
    }

    /**
     * Handle click on source block link - select the source block
     */
    protected _onSelectSourceBlock(e: CustomEvent<{ blockId: string }>): void {
        const {blockId} = e.detail;
        this.documentModel.select(blockId);
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('panel-properties', PanelProperties);

declare global {
    interface HTMLElementTagNameMap {
        'panel-properties': PanelProperties;
    }
}
