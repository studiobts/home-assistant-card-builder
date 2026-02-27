import { getStylePresentsService } from '@/common/api';
import { blockRegistry as appBlockRegistry, BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import { BindingEvaluator } from "@/common/core/binding";
import { type Container, ContainerManager, containerManagerContext } from '@/common/core/container-manager/container-manager';
import { DragDropManager, dragDropManagerContext } from '@/common/core/drag-and-drop';
import { type EnvironmentContext, environmentContext } from "@/common/core/environment-context";
import { EventBus, eventBusContext } from "@/common/core/event-bus";
import { type BlockChangeDetail, DocumentModel, documentModelContext } from '@/common/core/model';
import type { DocumentData, LinkModeState } from '@/common/core/model/types';
import type { SlotReference } from '@/common/core/model/document-model';
import { migrateDocumentData } from '@/common/core/model/migration';
import { StyleResolver, styleResolverContext } from '@/common/core/style-resolver';
import { hassContext } from '@/common/types';
import { ContextProvider, provide } from "@lit/context";
import type { HomeAssistant } from "custom-card-helpers";
import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import { LinkModeController, linkModeControllerContext } from '@/panel/designer/components/editors/link-editor/link-mode-controller';
import {
    DEFAULT_LINK_EDITOR_PREFERENCES,
    linkEditorPreferencesContext,
    normalizeLinkEditorPreferences,
    type LinkEditorPreferences,
} from '@/panel/designer/components/editors/link-editor/link-editor-preferences';
import { overlayHostContext, type OverlayHost, type OverlayRenderer } from '@/panel/designer/core/overlay-host-context';

import '@/panel/designer/components/sidebars/sidebar-left';
import '@/panel/designer/components/sidebars/sidebar-right';
import '@/panel/designer/components/container-selector';
import '@/panel/designer/components/editors/entity-slots-editor/entity-slots-editor-overlay';
import '@/panel/designer/components/editors/action-slots-editor/action-slots-editor-overlay';
import '@/panel/designer/core/builder-canvas';
import '@/panel/media-manager/media-manager-overlay';

const BUILDER_CANVAS_ID = 'main-canvas';

export class BuilderMain extends LitElement {
    static styles = css`
        :host {
            --sidebar-width: 260px;
            --right-sidebar-width: 260px;
            --header-height: 48px;
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --bg-tertiary: #e8e8e8;
            --border-color: #d4d4d4;
            --text-primary: #333333;
            --text-secondary: #666666;
            --accent-color: #0078d4;
            display: block;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        :host([theme='dark']) {
            --bg-primary: #1e1e1e;
            --bg-secondary: #252526;
            --bg-tertiary: #2d2d2d;
            --border-color: #3c3c3c;
            --text-primary: #cccccc;
            --text-secondary: #969696;
        }

        /* Global Moveable styles */

        :host ::slotted(*),
        * {
            --moveable-color: var(--accent-color);
        }

        .builder-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: var(--bg-primary);
            color: var(--text-primary);
        }

        .builder-center {
            position: relative;
            z-index: 0;
            display: flex;
            flex: 1 1 0;
            flex-direction: column;
            min-width: 0;
            overflow: hidden;
        }

        .builder-center-scroll {
            flex: 1 1 auto;
            overflow: auto;
            padding: 40px;
            background: var(--bg-tertiary);
            display: flex;
        }

        .builder-header {
            height: var(--header-height);
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: stretch;
            justify-content: space-between;
            padding: 10px 16px;
            gap: 16px;
            box-sizing: border-box;
        }

        .builder-header-center {
            flex: 1;
            display: flex;
            justify-content: center;
        }

        .builder-header-left {
            display: flex;
            align-items: center;
        }

        .builder-header-actions {
            display: flex;
            align-items: center;
            --mdc-icon-size: 16px;
        }

        .header-action {
            height: 100%;
            padding: 0 10px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.2px;
            text-transform: uppercase;
            border-radius: 4px;
            cursor: pointer;
            transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
        }
        
        .header-action:has( + .header-action ) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        .header-action + .header-action {
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }

        .header-toggle.active {
            color: var(--accent-color);
            background: rgba(0, 120, 212, 0.08);
            outline: 1px solid var(--accent-color);
            outline-offset: -1px;
        }

        .builder-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .sidebar {
            width: var(--sidebar-width);
            flex: 0 0 var(--sidebar-width);
            background: var(--cb-sidebar-background);
            border-right: 1px solid var(--border-color);
            overflow: hidden;
        }

        .sidebar-right {
            width: auto;
            flex: 0 0 auto;
            border-right: none;
            border-left: 1px solid var(--border-color);
        }
    `;

    protected static readonly POSITION_GUIDES_STORAGE_KEY = 'card-builder-position-guides';
    protected static readonly SNAP_GUIDES_STORAGE_KEY = 'card-builder-snap-guides';
    protected static readonly BLOCKS_OUTLINE_STORAGE_KEY = 'card-builder-blocks-outline';
    protected static readonly LINK_EDITOR_PREFS_STORAGE_KEY = 'card-builder-link-editor-preferences';
    protected static readonly RIGHT_SIDEBAR_WIDTH_STORAGE_KEY = 'card-builder-right-sidebar-width';
    protected static readonly RIGHT_SIDEBAR_MIN_WIDTH = 200;
    protected static readonly RIGHT_SIDEBAR_MAX_WIDTH = 600;

    hassProvider = new ContextProvider(this, {context: hassContext})

    @property({type: String, reflect: true})
    theme: 'light' | 'dark' = 'light';

    @provide({context: environmentContext})
    @state()
    protected environment: EnvironmentContext = {
        isBuilder: true,
        blocksOutlineEnabled: true,
        actionsEnabled: false,
    };

    @provide({context: dragDropManagerContext})
    protected dragDropManager!: DragDropManager;

    @provide({context: documentModelContext})
    protected documentModel: DocumentModel = new DocumentModel();

    @provide({context: blockRegistryContext})
    protected blockRegistry: BlockRegistry = appBlockRegistry;

    @state()
    @provide({context: containerManagerContext})
    protected containerManager: ContainerManager = new ContainerManager();

    @provide({context: styleResolverContext})
    protected styleResolver!: StyleResolver;

    @provide({context: eventBusContext})
    protected eventBus = new EventBus();

    @state()
    @provide({context: linkEditorPreferencesContext})
    protected linkEditorPreferences: LinkEditorPreferences = {...DEFAULT_LINK_EDITOR_PREFERENCES};

    protected overlayRegistry: Map<string, OverlayRenderer> = new Map();

    @state()
    @provide({context: overlayHostContext})
    protected overlayHost: OverlayHost = {
        registerOverlay: (id, renderer) => {
            this.overlayRegistry.set(id, renderer);
            this.requestUpdate();
        },
        unregisterOverlay: (id) => {
            if (this.overlayRegistry.delete(id)) {
                this.requestUpdate();
            }
        },
        invalidateOverlays: () => {
            this.requestUpdate();
        },
    };

    @state() protected containers: Container[] = [];
    @state() protected activeContainerId!: string;
    @state() protected canvasWidth!: number;
    @state() protected canvasHeight!: number;
    @state() protected canvasElement: any = null;
    @state() protected styleResolverReady: boolean = false;
    @state() protected slotEntitiesManagerOpen: boolean = false;
    @state() protected slotActionsManagerOpen: boolean = false;
    @state() protected linkModeEnabled: boolean = false;
    @state() protected mediaManagerOpen: boolean = false;
    @state() protected rightSidebarWidth: number = 260;
    @state() protected mediaManagerMode: 'manage' | 'select' = 'manage';
    @state() protected mediaManagerRequestId: string | null = null;
    @state() protected mediaManagerTitle: string = 'Media Manager';
    @state() protected mediaManagerSubtitle: string = 'Manage your media';
    @state() protected mediaManagerConfirmLabel: string = 'Use selected media';

    protected _showPositionGuides: boolean = true;
    protected _showSnapGuides: boolean = true;

    protected headerActions: Map<string, () => TemplateResult | typeof nothing> = new Map();

    protected _hass?: HomeAssistant;

    @provide({context: linkModeControllerContext})
    protected linkModeController!: LinkModeController;

    @property({attribute: false})
    set hass(hass: HomeAssistant) {
        this._hass = hass;

        if (this.styleResolver) {
            this.styleResolver.setBindingEvaluator(this._createBindingEvaluator());
        }
        this.hassProvider.setValue(hass);

    }

    constructor() {
        super();

        this.headerActions.set('link-mode-toggle', () => this._renderHeaderActionLinkModeToggle());
        this.headerActions.set('blocks-outline-toggle', () => this._renderHeaderActionBlocksOutlineToggle());
        this.headerActions.set('actions-toggle', () => this._renderHeaderActionActionsToggle());

        this.linkModeController = new LinkModeController({
            documentModel: this.documentModel,
            eventBus: this.eventBus,
            blockRegistry: this.blockRegistry,
            preferences: this.linkEditorPreferences,
        });

        this.style.setProperty('--right-sidebar-width', `${this.rightSidebarWidth}px`);
    }

    async connectedCallback() {
        super.connectedCallback();

        this._loadCanvasUserPreferences();

        this.dragDropManager = new DragDropManager(this.eventBus);

        // Initialize StyleResolver with preset service
        await this._initializeStyleResolver();

        // Listen to document model changes
        this.documentModel.addEventListener('change', ((evt: CustomEvent<BlockChangeDetail>) => {
            this._notifyConfigChange(evt.detail);
        }) as EventListener);

        this.documentModel.addEventListener('link-mode-changed', (evt: Event) => {
            const detail = (evt as CustomEvent).detail as { state: LinkModeState };
            this.linkModeEnabled = Boolean(detail?.state?.enabled);
        });

        // Initialize containers
        this.containers = this.containerManager.getContainers();
        this.activeContainerId = this.containerManager.getActiveContainerId();

        this.eventBus.addEventListener('canvas-size-changed', ({width, height}) => this._onCanvasSizeChanged(width, height))

        this.addEventListener('manage-entities-slots', () => {
            this.slotEntitiesManagerOpen = true;
        });
        this.addEventListener('manage-action-slots', () => {
            this.slotActionsManagerOpen = true;
        });

        this.eventBus.addEventListener('media-manager-open', (data?: {
            mode?: 'manage' | 'select';
            requestId?: string;
            title?: string;
            subtitle?: string;
            confirmLabel?: string;
        }) => {
            this._openMediaManager(data);
        });

        this.eventBus.addEventListener('link-editor-preferences-changed', (data?: { preferences?: Partial<LinkEditorPreferences> }) => {
            this._updateLinkEditorPreferences(data?.preferences ?? {});
        });
    }

    async firstUpdated() {
        await this.updateComplete;

        // Set canvas element reference
        this.canvasElement = this.shadowRoot?.querySelector('#builder-canvas');
    }

    updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);

        // Update binding evaluator when hass changes
        if (changedProperties.has('hass') && this._hass && this.styleResolver) {
            this.styleResolver.setBindingEvaluator(this._createBindingEvaluator());
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.dragDropManager?.destroy();
        this.linkModeController?.destroy();
    }

    render() {
        if (!this.styleResolverReady || !this._hass) {
            return html``;
        }

        return html`
            <div class="builder-container">
                <div class="builder-body">
                    <aside class="sidebar sidebar-left">
                        <sidebar-left></sidebar-left>
                    </aside>
                    <div class="builder-center">
                        ${this._renderHeader()}
                        <div class="builder-center-scroll">
                            ${this._renderCanvas()}
                        </div>
                    </div>
                    <aside class="sidebar sidebar-right">
                        <sidebar-right
                            .canvasWidth=${this.canvasWidth}
                            .canvasHeight=${this.canvasHeight}
                            .canvas=${this.canvasElement}
                            .hass=${this._hass}
                            .width=${this.rightSidebarWidth}
                            @right-sidebar-width-changed=${this._handleRightSidebarWidthChanged}
                        ></sidebar-right>
                    </aside>
                </div>
            </div>
            <entity-slots-editor-overlay
                .open=${this.slotEntitiesManagerOpen}
                .hass=${this._hass}
                @overlay-close=${() => {this.slotEntitiesManagerOpen = false}}
                @slot-reference-navigate=${this._handleSlotReferenceNavigate}
            ></entity-slots-editor-overlay>
            <action-slots-editor-overlay
                .open=${this.slotActionsManagerOpen}
                .hass=${this._hass}
                @overlay-close=${() => {this.slotActionsManagerOpen = false}}
                @slot-reference-navigate=${this._handleSlotReferenceNavigate}
            ></action-slots-editor-overlay>
            <media-manager-overlay
                .open=${this.mediaManagerOpen}
                .hass=${this._hass}
                .mode=${this.mediaManagerMode}
                .title=${this.mediaManagerTitle}
                .subtitle=${this.mediaManagerSubtitle}
                .confirmLabel=${this.mediaManagerConfirmLabel}
                @overlay-close=${this._closeMediaManager}
                @media-confirm=${this._handleMediaConfirm}
            ></media-manager-overlay>
            ${Array.from(this.overlayRegistry.values()).map((renderer) => renderer())}
        `;
    }

    _renderHeader() {
        return html`
            <header class="builder-header">
                <div class="builder-header-left">
                    <button
                        class="header-action ${this.slotEntitiesManagerOpen ? 'active' : ''}"
                        @click=${this._toggleSlotManager}
                        title="Manage Entities Slots"
                        aria-pressed=${this.slotEntitiesManagerOpen ? 'true' : 'false'}
                    >
                        Entities
                    </button>
                    <button
                        class="header-action ${this.slotActionsManagerOpen ? 'active' : ''}"
                        @click=${this._toggleSlotActionsManager}
                        title="Manage Action Slots"
                        aria-pressed=${this.slotActionsManagerOpen ? 'true' : 'false'}
                    >
                        Actions
                    </button>
                    <button
                        class="header-action ${this.mediaManagerOpen && this.mediaManagerMode === 'manage' ? 'active' : ''}"
                        @click=${this._openMediaManagerFromHeader}
                        title="Media Manager"
                        aria-pressed=${this.mediaManagerOpen && this.mediaManagerMode === 'manage' ? 'true' : 'false'}
                    >
                        Media
                    </button>
                </div>
                <div class="builder-header-center">
                    ${this._renderHeaderContainerSelector()}
                </div>
                <div class="builder-header-actions">
                    ${Array.from(this.headerActions.values()).map((action) => action())}
                </div>
            </header>
        `
    }

    _renderHeaderContainerSelector() {
        return html`
            <container-selector
                .containers=${this.containers}
                .activeContainerId=${this.activeContainerId}
            ></container-selector>
        `;
    }

    _renderHeaderActionBlocksOutlineToggle() {
        return html`
            <button
                class="header-action header-toggle ${this.environment.blocksOutlineEnabled ? 'active' : ''}"
                @click=${this._toggleBlocksHighlight}
                title=${this.environment.blocksOutlineEnabled ? 'Disable Blocks Outline' : 'Enable Blocks Outline'}
                aria-pressed=${this.environment.blocksOutlineEnabled ? 'true' : 'false'}
            >
                <ha-icon icon="mdi:selection"></ha-icon>
            </button>
        `;
    }

    _renderHeaderActionLinkModeToggle() {
        return html`
            <button
                class="header-action header-toggle ${this.linkModeEnabled ? 'active' : ''}"
                @click=${this._toggleLinkMode}
                title=${this.linkModeEnabled ? 'Exit Link Mode' : 'Enter Link Mode'}
                aria-pressed=${this.linkModeEnabled ? 'true' : 'false'}
            >
                <ha-icon icon="mdi:vector-line"></ha-icon>
            </button>
        `;
    }

    _renderHeaderActionActionsToggle() {
        return html`
            <button
                class="header-action header-toggle ${this.environment.actionsEnabled ? 'active' : ''}"
                @click=${this._toggleActionsEnabled}
                title=${this.environment.actionsEnabled ? 'Disable Actions' : 'Enable Actions'}
                aria-pressed=${this.environment.actionsEnabled ? 'true' : 'false'}
            >
                <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            </button>
        `;
    }

    _renderCanvas() {
        const activeContainer = this.containerManager.getActiveContainer();

        return html`
            <builder-canvas
                id="builder-canvas"
                class="container-${activeContainer.id}"
                .canvasId=${BUILDER_CANVAS_ID}
                .showPositionGuides=${this._showPositionGuides}
                .showSnapGuides=${this._showSnapGuides}
                @position-guides-preference-changed=${this._onPositionGuidesPreferenceChanged}
                @snap-guides-preference-changed=${this._onSnapGuidesPreferenceChanged}
            ></builder-canvas>
        `;
    }

    /**
     * Load a configuration into the builder
     * Public method for external integration
     */
    public loadConfig(config: Record<string, unknown>): void {
        if (config && typeof config === 'object') {
            const {config: migratedConfig} = migrateDocumentData(config);
            this.documentModel.loadFromConfig(migratedConfig);
        }
    }

    /**
     * Export the current configuration from the builder
     * Public method for external integration
     */
    public exportConfig(): DocumentData {
        return this.documentModel.exportToConfig();
    }

    /**
     * Clear the document model (reset to initial state)
     * Public method for external integration
     */
    public clearDocument(): void {
        this.documentModel.clear();
    }

    protected async _initializeStyleResolver(): Promise<void> {
        try {
            const presetService = await getStylePresentsService(this._hass!);

            this.styleResolver = new StyleResolver(
                this.documentModel,
                this.containerManager,
                presetService,
                this.blockRegistry
            );

            // Set up binding evaluator if hass is available
            if (this._hass) {
                this.styleResolver.setBindingEvaluator(this._createBindingEvaluator());
            }

            this.styleResolverReady = true;
        } catch (error) {
            console.error('[BuilderMain] Failed to initialize StyleResolver:', error);
        }
    }

    protected _toggleSlotManager() {
        this.slotEntitiesManagerOpen = !this.slotEntitiesManagerOpen;
    }

    protected _toggleSlotActionsManager() {
        this.slotActionsManagerOpen = !this.slotActionsManagerOpen;
    }

    protected _openMediaManagerFromHeader = () => {
        this._openMediaManager({mode: 'manage'});
    };

    protected _openMediaManager(data?: {
        mode?: 'manage' | 'select';
        requestId?: string;
        title?: string;
        subtitle?: string;
        confirmLabel?: string;
    }): void {
        const mode = data?.mode ?? 'manage';
        this.mediaManagerMode = mode;
        this.mediaManagerRequestId = data?.requestId ?? null;
        this.mediaManagerTitle = data?.title ?? (mode === 'select' ? 'Select media' : 'Media Manager');
        this.mediaManagerSubtitle = data?.subtitle ?? (mode === 'select' ? 'Choose or upload a file' : 'Manage your media');
        this.mediaManagerConfirmLabel = data?.confirmLabel ?? 'Use selected media';
        this.mediaManagerOpen = true;
    }

    protected _closeMediaManager = (): void => {
        if (this.mediaManagerMode === 'select' && this.mediaManagerRequestId) {
            this.eventBus.dispatchEvent('media-manager-cancelled', {requestId: this.mediaManagerRequestId});
        }
        this.mediaManagerOpen = false;
        this.mediaManagerMode = 'manage';
        this.mediaManagerRequestId = null;
    };

    protected _handleMediaConfirm = (e: CustomEvent): void => {
        const selection = e.detail as { reference: string; url: string | null; name: string; contentType?: string } | undefined;
        if (this.mediaManagerMode === 'select' && this.mediaManagerRequestId && selection?.reference) {
            this.eventBus.dispatchEvent('media-manager-selected', {
                requestId: this.mediaManagerRequestId,
                selection,
            });
        }
        this._closeMediaManager();
    };

    protected _toggleBlocksHighlight() {
        this.environment = {
            ...this.environment,
            blocksOutlineEnabled: !this.environment.blocksOutlineEnabled,
        }
        localStorage.setItem(BuilderMain.BLOCKS_OUTLINE_STORAGE_KEY, String(this.environment.blocksOutlineEnabled));
    }

    protected _toggleActionsEnabled = () => {
        this.environment = {
            ...this.environment,
            actionsEnabled: !this.environment.actionsEnabled,
        };
    };

    protected _toggleLinkMode = () => {
        this.linkModeController.toggleLinkMode();
    };

    protected _loadCanvasUserPreferences(): void {
        const savedPositionGuides = localStorage.getItem(BuilderMain.POSITION_GUIDES_STORAGE_KEY);
        if (savedPositionGuides !== null) {
            this._showPositionGuides = savedPositionGuides === 'true';
        }

        const savedSnapGuides = localStorage.getItem(BuilderMain.SNAP_GUIDES_STORAGE_KEY);
        if (savedSnapGuides !== null) {
            this._showSnapGuides = savedSnapGuides === 'true';
        }

        const savedBlocksOutline = localStorage.getItem(BuilderMain.BLOCKS_OUTLINE_STORAGE_KEY);
        if (savedBlocksOutline !== null) {
            this.environment = {
                ...this.environment,
                blocksOutlineEnabled: savedBlocksOutline === 'true',
            };
        }

        const savedLinkPrefs = localStorage.getItem(BuilderMain.LINK_EDITOR_PREFS_STORAGE_KEY);
        if (savedLinkPrefs) {
            try {
                const parsed = JSON.parse(savedLinkPrefs) as Partial<LinkEditorPreferences>;
                this.linkEditorPreferences = normalizeLinkEditorPreferences(parsed);
            } catch {
                this.linkEditorPreferences = {...DEFAULT_LINK_EDITOR_PREFERENCES};
            }
        }
        this.linkModeController?.setPreferences?.(this.linkEditorPreferences);

        const savedRightSidebarWidth = localStorage.getItem(BuilderMain.RIGHT_SIDEBAR_WIDTH_STORAGE_KEY);
        if (savedRightSidebarWidth !== null) {
            const parsed = parseInt(savedRightSidebarWidth, 10);
            if (!Number.isNaN(parsed)) {
                this._setRightSidebarWidth(parsed, false);
            }
        }
    }

    protected _updateLinkEditorPreferences(next: Partial<LinkEditorPreferences>): void {
        this.linkEditorPreferences = {
            ...this.linkEditorPreferences,
            ...next,
        };
        localStorage.setItem(
            BuilderMain.LINK_EDITOR_PREFS_STORAGE_KEY,
            JSON.stringify(this.linkEditorPreferences)
        );
        this.linkModeController?.setPreferences?.(this.linkEditorPreferences);
    }

    protected _onPositionGuidesPreferenceChanged(e: CustomEvent): void {
        this._showPositionGuides = e.detail.status;
        localStorage.setItem(BuilderMain.POSITION_GUIDES_STORAGE_KEY, String(this._showPositionGuides));
    }

    protected _onSnapGuidesPreferenceChanged(e: CustomEvent): void {
        this._showSnapGuides = e.detail.status;
        localStorage.setItem(BuilderMain.SNAP_GUIDES_STORAGE_KEY, String(this._showSnapGuides));
    }

    protected _onCanvasSizeChanged(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    protected _handleRightSidebarWidthChanged = (e: CustomEvent<{ width: number }>): void => {
        if (!e?.detail || typeof e.detail.width !== 'number') return;
        this._setRightSidebarWidth(e.detail.width, true);
    };

    protected _setRightSidebarWidth(width: number, persist: boolean) {
        const clamped = Math.max(
            BuilderMain.RIGHT_SIDEBAR_MIN_WIDTH,
            Math.min(BuilderMain.RIGHT_SIDEBAR_MAX_WIDTH, Math.round(width))
        );
        if (this.rightSidebarWidth === clamped) return;
        this.rightSidebarWidth = clamped;
        this.style.setProperty('--right-sidebar-width', `${clamped}px`);
        if (persist) {
            localStorage.setItem(BuilderMain.RIGHT_SIDEBAR_WIDTH_STORAGE_KEY, String(clamped));
        }
    }

    protected async _handleSlotReferenceNavigate(e: CustomEvent<{ reference: SlotReference }>): Promise<void> {
        const {reference} = e.detail;
        this.slotEntitiesManagerOpen = false;
        this.slotActionsManagerOpen = false;
        this.documentModel.select(reference.blockId);

        if (reference.kind === 'style-binding') {
            this._openSidebarTab('styles');
            await this._openStyleBinding(reference);
            return;
        }

        this._openSidebarTab('properties');
        if (reference.kind === 'trait-binding') {
            await this._openTraitBinding(reference);
        }
    }

    protected _openSidebarTab(tabId: string): void {
        const sidebarTabbed = this._getSidebarTabbed();
        if (sidebarTabbed?.setActiveTab) {
            sidebarTabbed.setActiveTab(tabId);
        }
    }

    protected _getSidebarTabbed(): any {
        const sidebar = this.shadowRoot?.querySelector('sidebar-right') as any;
        return sidebar?.shadowRoot?.querySelector('sidebar-tabbed') as any;
    }

    protected async _openStyleBinding(reference: SlotReference): Promise<void> {
        if (!reference.category || !reference.property) return;

        await new Promise((resolve) => requestAnimationFrame(resolve));
        const stylePanel = this._getSidebarTabbed()?.shadowRoot?.querySelector('panel-styles') as any;
        if (!stylePanel) return;

        if (stylePanel.openBindingEditor) {
            stylePanel.openBindingEditor(
                reference.category,
                reference.property,
                reference.property,
                reference.styleTargetId ?? null
            );
        }
    }

    protected async _openTraitBinding(reference: SlotReference): Promise<void> {
        if (!reference.propName) return;

        await new Promise((resolve) => requestAnimationFrame(resolve));
        const propertiesPanel = this._getSidebarTabbed()?.shadowRoot?.querySelector('panel-properties') as any;
        if (!propertiesPanel?.openTraitBindingEditor) return;

        propertiesPanel.openTraitBindingEditor(reference.propName);
    }

    protected _createBindingEvaluator(): BindingEvaluator {
        return new BindingEvaluator(this._hass!, {
            resolveSlotEntity: (slotId) => this.documentModel.resolveSlotEntity(slotId),
            onTemplateResult: () => {
                this.eventBus.dispatchEvent('template-updated');
                this.requestUpdate();
            },
        });
    }

    /**
     * Notify external listeners of config changes
     */
    protected _notifyConfigChange(detail: BlockChangeDetail): void {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: detail,
            bubbles: true,
            composed: true,
        }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'builder-main': BuilderMain;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('builder-main', BuilderMain);
