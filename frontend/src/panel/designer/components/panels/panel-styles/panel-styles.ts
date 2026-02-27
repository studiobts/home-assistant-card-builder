/**
 * Style Panel - Properties editor using Style Manager components
 *
 * Uses the new style resolution system with container fallback,
 * preset support, and property binding capabilities.
 */

import { getStylePresentsService } from '@/common/api';
import type { BindingValueInputConfig } from '@/common/blocks/core/properties';
import type { BlockPanelTargetStyles } from '@/common/blocks/types';
import {
    type AnchorPoint,
    getStyleLayoutData,
    type PositionConfig,
    PositionSystem,
    type StyleLayoutData,
    type UnitSystem
} from '@/common/blocks/core/renderer';
import { GROUP_PROPERTIES, type PropertyGroupId } from '@/common/blocks/style';
import type { ValueBinding } from '@/common/core/binding';
import { type ContainerManager, containerManagerContext } from '@/common/core/container-manager/container-manager';
import { type EventBus, eventBusContext } from "@/common/core/event-bus";
import {
    type BlockChangeDetail,
    type BlockData,
    type BlockElementRegisteredDetail,
    type BlockPosition,
    type BlockSelectionChangedDetail,
    type BlockSize,
    type BlockUpdatedDetail,
    type DocumentModel,
    documentModelContext
} from '@/common/core/model';
import type { DocumentSlot } from '@/common/core/model/types';
import {
    getDefaultUnitForProperty,
    getUnitsForProperty,
    type StyleResolver,
    styleResolverContext
} from '@/common/core/style-resolver';
import type { ResolvedStyleData, ResolvedValue } from '@/common/core/style-resolver/style-resolution-types';
import type { CSSUnit } from '@/common/types';
import type { StylePreset } from '@/common/types/style-preset';
import { PanelBase } from "@/panel/designer/components";
import { getMediaReferenceName, isManagedMediaReference } from '@/common/media';
import { consume } from "@lit/context";
import type { HomeAssistant } from "custom-card-helpers";
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { PanelStylesState, type StateChangeDetail } from '@/panel/designer/components/panels/panel-styles/panel-styles-state';

import '@/panel/common/ui/property-editor/property-row'
import '@/panel/common/ui/block-target-selector';
import '@/panel/common/ui/style-presets/style-preset-selector';
import '@/panel/common/ui/style-presets/style-preset-save-dialog';
import '@/panel/common/ui/style-presets/style-presets-manager-dialog';
import '@/panel/designer/components/editors/property-binding-editor/property-binding-editor-overlay';
import '@/panel/designer/components/editors/property-animation-editor/property-animation-editor-overlay';
import type { ResolvedPropertyConfig } from '@/panel/designer/components/panels/panel-styles/property-config-resolver';

type BackgroundImageMode = 'none' | 'image' | 'media' | 'gradient' | 'custom';

type LengthValue = { value: number; unit: CSSUnit };
type LengthPair = { x: LengthValue; y: LengthValue };

const VIRTUAL_PROPERTIES = [
    'layout.show',
    'layout.positionX',
    'layout.positionY',
    'animations.motion',
];

const BACKGROUND_CUSTOM_VALUE = '__custom__';

const BACKGROUND_IMAGE_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Image URL', value: 'image'},
    {label: 'Media Library', value: 'media'},
    {label: 'Gradient', value: 'gradient'},
    {label: 'Custom', value: 'custom'},
];

const BACKGROUND_REPEAT_OPTIONS = [
    {label: 'Repeat', value: 'repeat'},
    {label: 'No Repeat', value: 'no-repeat'},
    {label: 'Repeat X', value: 'repeat-x'},
    {label: 'Repeat Y', value: 'repeat-y'},
    {label: 'Space', value: 'space'},
    {label: 'Round', value: 'round'},
];

const BACKGROUND_SIZE_OPTIONS = [
    {label: 'Auto', value: 'auto'},
    {label: 'Cover', value: 'cover'},
    {label: 'Contain', value: 'contain'},
    {label: 'Custom', value: BACKGROUND_CUSTOM_VALUE},
];

const BACKGROUND_POSITION_OPTIONS = [
    {label: 'Center', value: 'center'},
    {label: 'Top', value: 'top'},
    {label: 'Bottom', value: 'bottom'},
    {label: 'Left', value: 'left'},
    {label: 'Right', value: 'right'},
    {label: 'Top Left', value: 'top left'},
    {label: 'Top Center', value: 'top center'},
    {label: 'Top Right', value: 'top right'},
    {label: 'Center Left', value: 'center left'},
    {label: 'Center Right', value: 'center right'},
    {label: 'Bottom Left', value: 'bottom left'},
    {label: 'Bottom Center', value: 'bottom center'},
    {label: 'Bottom Right', value: 'bottom right'},
    {label: 'Custom', value: BACKGROUND_CUSTOM_VALUE},
];

const BACKGROUND_POSITION_ALIASES: Record<string, string> = {
    'left top': 'top left',
    'right top': 'top right',
    'left bottom': 'bottom left',
    'right bottom': 'bottom right',
    'left center': 'center left',
    'right center': 'center right',
    'center top': 'top center',
    'center bottom': 'bottom center',
};

const BACKGROUND_BLEND_MODE_OPTIONS = [
    {label: 'Color', value: 'color'},
    {label: 'Color Burn', value: 'color-burn'},
    {label: 'Color Dodge', value: 'color-dodge'},
    {label: 'Darken', value: 'darken'},
    {label: 'Difference', value: 'difference'},
    {label: 'Exclusion', value: 'exclusion'},
    {label: 'Hard Light', value: 'hard-light'},
    {label: 'Hue', value: 'hue'},
    {label: 'Lighten', value: 'lighten'},
    {label: 'Luminosity', value: 'luminosity'},
    {label: 'Multiply', value: 'multiply'},
    {label: 'Normal', value: 'normal'},
    {label: 'Overlay', value: 'overlay'},
    {label: 'Saturation', value: 'saturation'},
    {label: 'Screen', value: 'screen'},
    {label: 'Soft Light', value: 'soft-light'}
];

const BACKGROUND_LENGTH_UNITS: CSSUnit[] = ['%', 'px', 'rem', 'em', 'vw', 'vh'];

const TEXT_TRANSFORM_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Capitalize', value: 'capitalize'},
    {label: 'Uppercase', value: 'uppercase'},
    {label: 'Lowercase', value: 'lowercase'},
];

const TEXT_DECORATION_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Underline', value: 'underline'},
    {label: 'Overline', value: 'overline'},
    {label: 'Line Through', value: 'line-through'},
];

const WHITE_SPACE_OPTIONS = [
    {label: 'Normal', value: 'normal'},
    {label: 'No-Wrap', value: 'nowrap'},
    {label: 'Pre', value: 'pre'},
    {label: 'Pre-Wrap', value: 'pre-wrap'},
    {label: 'Pre-Line', value: 'pre-line'},
    {label: 'Break-Spaces', value: 'break-spaces'},
];

export class PanelStyles extends PanelBase {
    static styles = [
        ...PanelBase.styles,
        css`

        .panel-content {
            padding: 0;
        }

        /* Preset Section */

        .preset-section {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
        }

        .preset-label {
            display: block;
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .target-section {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
        }

        .target-label {
            display: block;
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .target-description {
            margin-top: 8px;
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        /* Sections */

        .section {
            margin-bottom: 0;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }

        .section-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent-color);
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.15);
            flex-shrink: 0;
        }

        .property-grid {
            display: grid;
            grid-template-columns: 50% 50%;
            gap: 8px;
        }

        .background-input {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .background-inline-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
        }

        .background-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .background-field-label {
            font-size: 9px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .background-media {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .media-selected {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 8px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--bg-primary);
        }

        .media-name {
            font-size: 11px;
            color: var(--text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .media-actions {
            display: flex;
            gap: 6px;
            flex-shrink: 0;
        }

        .media-button {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            cursor: pointer;
        }

        .media-button.primary {
            background: var(--accent-color);
            border-color: transparent;
            color: #fff;
        }

        .media-button.danger {
            background: rgba(219, 68, 55, 0.12);
            border-color: rgba(219, 68, 55, 0.4);
            color: var(--error-color, #db4437);
        }

        .text-input {
            width: 100%;
            box-sizing: border-box;
            padding: 6px 8px;
            border: 1px solid var(--border-color);
            border-radius: 3px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 11px;
            font-family: inherit;
        }

        .text-input:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        .block-info {
            padding: 8px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 10px;
            line-height: 1.6;
        }

        .block-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .block-info-row:last-child {
            margin-bottom: 0;
        }

        .block-info-label {
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: 600;
        }

        .block-info-value {
            color: var(--text-primary);
            font-family: 'Courier New', monospace;
            font-size: 9px;
        }

        /* Layout Mode Toggle */

        .layout-mode-container {
            padding: 12px;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            --mdc-icon-size: 20px;
        }

        .layout-mode-label {
            display: block;
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .layout-mode-toggle {
            display: flex;
            position: relative;
            background: var(--bg-tertiary);
            border-radius: 6px;
            padding: 2px;
            height: 36px;
        }

        .layout-mode-option {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-secondary);
            cursor: pointer;
            z-index: 1;
            transition: color 0.2s ease;
            user-select: none;
        }

        .layout-mode-option:hover {
            color: var(--text-primary);
        }

        .layout-mode-option.active {
            color: white;
        }

        .layout-mode-option svg {
            width: 14px;
            height: 14px;
        }

        .layout-mode-slider {
            position: absolute;
            top: 2px;
            bottom: 2px;
            width: calc(50% - 2px);
            background: var(--accent-color);
            border-radius: 4px;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .layout-mode-toggle[data-mode="flow"] .layout-mode-slider {
            transform: translateX(0);
        }

        .layout-mode-toggle[data-mode="absolute"] .layout-mode-slider {
            transform: translateX(calc(100% + 4px));
        }

        /* Container indicator */

        .container-indicator {
            padding: 8px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 13px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .container-indicator .container-name {
            font-weight: 600;
            color: var(--accent-color);
        }

        .animation-hint {
            padding: 8px 10px;
            border: 1px dashed var(--border-color);
            border-radius: 4px;
            background: var(--bg-secondary);
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.4;
        }
    `];

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @consume({context: containerManagerContext})
    containerManager!: ContainerManager;

    @consume({context: styleResolverContext})
    styleResolver!: StyleResolver;

    @consume({context: eventBusContext})
    eventBus!: EventBus;

    @property({type: Object, attribute: false})
    hass?: HomeAssistant;

    @property({type: Number}) canvasWidth!: number;
    @property({type: Number}) canvasHeight!: number;
    @state() protected selectedBlock: BlockData | null = null;
    @state() protected panelState: PanelStylesState | null = null;
    @state() protected resolvedStyles: ResolvedStyleData = {};
    @state() protected visibleProperties: ResolvedPropertyConfig | null = null;
    @state() protected presets: StylePreset[] = [];
    @state() protected activeTargetId: string | null = null;
    @state() protected slots: DocumentSlot[] = [];
    // Dialog states
    @state() protected saveDialogOpen = false;
    @state() protected managerDialogOpen = false;
    @state() protected bindingEditorOpen = false;
    @state() protected bindingEditorTarget: { category: string; property: string; label: string } | null = null;
    // Expanded sections
    @state() protected expandedSections: Set<string> = new Set();
    @state() protected backgroundImageMode: BackgroundImageMode = 'none';
    @state() protected pendingMediaRequestId: string | null = null;

    @state() protected animationEditorOpen = false;
    @state() protected animationEditorTarget: { category: string; property: string; label: string } | null = null;

    protected sections: Map<string, () => TemplateResult | typeof nothing> = new Map();
    protected editors: Map<string, () => TemplateResult | typeof nothing> = new Map();

    protected computedStyleTarget: Element | null = null;
    protected computedStyle: CSSStyleDeclaration | null = null;

    /**
     * Get the effective default entity ID for bindings.
     * Uses the new entity resolution system from DocumentModel.
     */
    protected get defaultEntityId(): string | undefined {
        if (!this.selectedBlock) return undefined;
        const resolved = this.documentModel.resolveEntityForBlock(this.selectedBlock.id);
        return resolved.entityId;
    }

    constructor() {
        super();

        this.sections.set('layout', () => this._renderLayoutSection());
        this.sections.set('flex', () => this._renderFlexSection());
        this.sections.set('size', () => this._renderSizeSection());
        this.sections.set('spacing', () => this._renderSpacingSection());
        this.sections.set('typography', () => this._renderTypographySection());
        this.sections.set('background', () => this._renderBackgroundSection());
        this.sections.set('border', () => this._renderBorderSection());
        this.sections.set('svg', () => this._renderSvgSection());
        this.sections.set('effects', () => this._renderEffectsSection());
        this.sections.set('animations', () => this._renderAnimationsSection());

        this.editors.set('binding', () => this._renderBindingEditorOverlay());
        this.editors.set('animation', () => this._renderAnimationEditorOverlay());
    }

    async connectedCallback() {
        super.connectedCallback();

        // Initialize panel state with preset service
        await this._initializePanelState();

        // Listen for selection changes
        this.documentModel.addEventListener('selection-changed', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
            this.handleSelectionChange(detail.selectedBlock);
        });

        this.documentModel.addEventListener('element-registered', (e: Event) => {
            const detail = (e as CustomEvent<BlockElementRegisteredDetail>).detail;
            if (!this.selectedBlock || detail.blockId !== this.selectedBlock.id) return;
            if (this.panelState) {
                this.panelState.handleDocumentChange(detail.blockId);
            }
            this._ensureActiveTargetAvailable();
            this.requestUpdate();
        });

        this.slots = this.documentModel.getSlotEntities();
        this.documentModel.addEventListener('slots-changed', () => {
            this.slots = this.documentModel.getSlotEntities();
            this.requestUpdate();
        });

        // Listen for block updates
        this.documentModel.addEventListener('block-updated', (e: Event) => {
            const detail = (e as CustomEvent<BlockUpdatedDetail>).detail;
            if (!this.selectedBlock || detail.block.id !== this.selectedBlock.id) return;

            this.selectedBlock = {...detail.block};
            if (this.panelState) {
                this.panelState.handleDocumentChange(this.selectedBlock.id);
            }
            this._ensureActiveTargetAvailable();
            this.requestUpdate();
        });

        // Listen for non-update block changes
        this.documentModel.addEventListener('change', (e: Event) => {
            const detail = (e as CustomEvent<BlockChangeDetail>).detail;
            if (detail.action === 'update') return;

            if (this.selectedBlock && detail.block?.id === this.selectedBlock.id) {
                const updatedBlock = this.documentModel.getBlock(this.selectedBlock.id);
                if (updatedBlock) {
                    this.selectedBlock = {...updatedBlock};
                    if (this.panelState) {
                        this.panelState.handleDocumentChange(this.selectedBlock.id);
                    }
                    this._ensureActiveTargetAvailable();
                    this.requestUpdate();
                }
            }
        });

        // FIXME: add event type
        this.eventBus.addEventListener('moveable-change', (data: {
            position: BlockPosition,
            positionConfig: PositionConfig,
            size?: BlockSize
        }) => {
            const {position, positionConfig, size} = data; // TODO: create interface
            const properties = [
                {category: 'layout', property: 'positionX', value: position.x},
                {category: 'layout', property: 'positionY', value: position.y},
                {category: '_internal', property: 'position_config', value: positionConfig},
            ];

            if (size) {
                properties.push({category: 'size', property: 'width', value: size.width});
                properties.push({category: 'size', property: 'height', value: size.height});
            }

            this.panelState!.updateProperties(properties, null);
        });

        this.eventBus.addEventListener('media-manager-selected', (data: {
            requestId: string;
            selection: { reference: string };
        }) => {
            if (!data || data.requestId !== this.pendingMediaRequestId) return;
            this.pendingMediaRequestId = null;
            if (data.selection?.reference) {
                this.backgroundImageMode = 'media';
                this._handlePropertyChange('background', 'backgroundImage', data.selection.reference);
            }
        });

        this.eventBus.addEventListener('media-manager-cancelled', (data: { requestId: string }) => {
            if (!data || data.requestId !== this.pendingMediaRequestId) return;
            this.pendingMediaRequestId = null;
        });
    }

    public openBindingEditor(
        category: string,
        property: string,
        label?: string,
        styleTargetId?: string | null
    ): void {
        if (styleTargetId !== undefined && this.panelState) {
            this.panelState.setActiveTarget(styleTargetId ?? null);
        }
        this.bindingEditorTarget = {
            category,
            property,
            label: label ?? property,
        };
        this.bindingEditorOpen = true;
    }

    render() {
        if (!this.selectedBlock) {
            return html`
                <div class="empty-state">
                    <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
                    <div>Select an element to edit its styles</div>
                </div>
            `;
        }

        const hasStyleTargets = this._hasStyleTargets(this.selectedBlock);
        const container = this.containerManager.getActiveContainer();
        const containerInfo = !container.width ? 'No width limit' : `Max width: ${container.width}px`;

        return html`
            <!-- Container Indicator -->
            <div class="container-indicator">
                Editing for: <span class="container-name">${container.name} (${containerInfo})</span>
            </div>

            ${this._renderTargetSelector()}

            <!-- Preset Selector -->
            ${hasStyleTargets ? html`
                <div class="preset-section">
                    <span class="preset-label">Style Preset</span>
                    <preset-selector
                            .presets=${this.presets}
                            .selectedPresetId=${this.panelState?.appliedPresetId}
                            @preset-selected=${this._handlePresetSelected}
                            @create-preset=${this._openSaveDialog}
                            @manage-presets=${this._openManagerDialog}
                    ></preset-selector>
                </div>
            ` : nothing}

            <div class="panel-content">
                ${Array.from(this.sections.values()).map((section) => section())}
            </div>

            <!-- Dialogs -->
            <preset-save-dialog
                    .open=${this.saveDialogOpen}
                    .currentStyles=${this.resolvedStyles}
                    .containerId=${this.containerManager.getActiveContainerId()}
                    .presets=${this.presets}
                    @save=${this._handleSavePreset}
                    @cancel=${this._closeSaveDialog}
            ></preset-save-dialog>

            <preset-manager-dialog
                    .open=${this.managerDialogOpen}
                    .presets=${this.presets}
                    @edit=${this._handleEditPreset}
                    @delete=${this._handleDeletePreset}
                    @close=${this._closeManagerDialog}
            ></preset-manager-dialog>

            ${Array.from(this.editors.values()).map((editor) => editor())}
        `;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.panelState) {
            this.panelState.dispose();
            this.panelState = null;
        }
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (changedProps.has('selectedBlock') || changedProps.has('resolvedStyles') || changedProps.has('activeTargetId')) {
            this._resetComputedStyleCache();
        }

        if (changedProps.has('selectedBlock')) {
            this._updateBackgroundImageMode(true);
            return;
        }

        if (changedProps.has('resolvedStyles')) {
            this._updateBackgroundImageMode(false);
        }
    }

    protected async _initializePanelState(): Promise<void> {
        try {
            const presetService = await getStylePresentsService(this.hass!);

            this.panelState = new PanelStylesState({
                documentModel: this.documentModel,
                presetService,
                styleResolver: this.styleResolver, // Use shared resolver from context
                hass: this.hass,
                initialContainerId: this.containerManager.getActiveContainerId(),
            });

            // Listen for state changes
            this.panelState.addEventListener('state-change', (e: Event) => {
                const detail = (e as CustomEvent<StateChangeDetail>).detail;
                this._handleStateChange(detail);
            });

            // Update local state
            this.resolvedStyles = this.panelState.resolvedStyles;
            this.visibleProperties = this.panelState.visibleProperties;
            this.presets = this.panelState.presets;
            this.activeTargetId = this.panelState.activeTargetId;
        } catch (error) {
            console.error('[PanelStyle] Failed to initialize panel state:', error);
        }
    }

    protected _handleStateChange(detail: StateChangeDetail): void {
        switch (detail.type) {
            case 'styles':
                this.resolvedStyles = this.panelState?.resolvedStyles || {};
                break;
            case 'presets':
                this.presets = this.panelState?.presets || [];
                break;
            case 'properties':
                this.visibleProperties = this.panelState?.visibleProperties || null;
                break;
            case 'selection':
            case 'target':
            case 'container':
                this.resolvedStyles = this.panelState?.resolvedStyles || {};
                this.visibleProperties = this.panelState?.visibleProperties || null;
                this.activeTargetId = this.panelState?.activeTargetId || null;
                break;
        }
        this._ensureActiveTargetAvailable();
        this.requestUpdate();
    }

    protected handleSelectionChange(block?: BlockData) {
        if (!block) {
            this.selectedBlock = null;
            this._closeBindingEditor(true);
            this._closeAnimationEditor(true);
            if (this.panelState) {
                this.panelState.setSelectedBlock(null);
            }
            return;
        }

        this._closeBindingEditor(true);
        this._closeAnimationEditor(true);
        this.selectedBlock = {...(block || {})};

        if (this.panelState) {
            this.panelState.setSelectedBlock(block.id);
        }

        this._ensureActiveTargetAvailable();
    }

    protected toggleSection(sectionId: string) {
        if (this.expandedSections.has(sectionId)) {
            this.expandedSections.delete(sectionId);
        } else {
            this.expandedSections.add(sectionId);
        }
        this.requestUpdate();
    }

    protected switchLayoutMode(mode: 'absolute' | 'flow') {
        if (!this.selectedBlock || this.selectedBlock.layout === mode) return;
        this.documentModel.updateBlock(this.selectedBlock.id, {layout: mode});
    }

    // =========================================================================
    // Preset Handlers
    // =========================================================================

    protected getContainerDimensions(): { width: number; height: number } {
        let containerWidth = this.canvasWidth;
        let containerHeight = this.canvasHeight;

        if (this.selectedBlock && this.selectedBlock.parentId !== 'root') {
            const positioningParent = this.documentModel.getElement(this.selectedBlock.parentId!)!;
            const rect = positioningParent.getBoundingClientRect();

            containerWidth = rect.width;
            containerHeight = rect.height;
        }

        return {width: containerWidth, height: containerHeight};
    }

    protected getLayoutData(): StyleLayoutData | null {
        if (!this.selectedBlock) return null;
        return getStyleLayoutData(this.resolvedStyles);
    }

    protected getRuntimeSize(layoutData: StyleLayoutData): BlockSize {
        if (layoutData.size.width && layoutData.size.height) {
            return layoutData.size;
        }

        const element = this.documentModel.getElement(this.selectedBlock!.id);
        if (!element) return layoutData.size;

        const rect = element.getBlockBoundingClientRect?.() ?? element.getBoundingClientRect();
        return {width: rect.width, height: rect.height};
    }

    protected applyPositionUpdate(position: BlockPosition, positionConfig: PositionConfig): void {
        if (!this.panelState) return;

        this.panelState.updateProperties([
            {category: 'layout', property: 'positionX', value: position.x},
            {category: 'layout', property: 'positionY', value: position.y},
            {category: '_internal', property: 'position_config', value: positionConfig},
        ], null);
    }

    protected _handlePresetSelected(e: CustomEvent): void {
        const {presetId} = e.detail;
        if (this.panelState) {
            this.panelState.applyPreset(presetId);
        }
    }

    protected _openSaveDialog(): void {
        this.saveDialogOpen = true;
    }

    protected _closeSaveDialog(): void {
        this.saveDialogOpen = false;
    }

    protected async _handleSavePreset(e: CustomEvent): Promise<void> {
        const {input} = e.detail;
        if (this.panelState) {
            try {
                await this.panelState.createPreset(
                    input.name,
                    input.description,
                    input.extendsPresetId
                );
                this._closeSaveDialog();
            } catch (error) {
                console.error('[PanelStyle] Failed to save preset:', error);
            }
        }
    }

    // =========================================================================
    // Property Handlers
    // =========================================================================

    protected _openManagerDialog(): void {
        this.managerDialogOpen = true;
    }

    protected _closeManagerDialog(): void {
        this.managerDialogOpen = false;
    }

    protected _handleEditPreset(e: CustomEvent): void {
        // TODO: Open edit dialog
        console.log('Edit preset:', e.detail.presetId);
    }

    protected async _handleDeletePreset(e: CustomEvent): Promise<void> {
        const {presetId} = e.detail;
        if (this.panelState) {
            try {
                await this.panelState.deletePreset(presetId);
            } catch (error) {
                console.error('[PanelStyle] Failed to delete preset:', error);
            }
        }
    }

    protected _handlePropertyChange(
        category: string,
        property: string,
        value: unknown,
        unit?: CSSUnit
    ): void {
        if (this.panelState) {
            this.panelState.updateProperty(category, property, value, unit);
        }
    }

    protected _handleBindingChange(
        category: string,
        property: string,
        binding: ValueBinding | null,
        unit?: CSSUnit
    ): void {
        if (this.panelState) {
            this.panelState.updateBinding(category, property, binding, unit);
        }
    }

    protected _handleBindingEdit(e: CustomEvent): void {
        const {category, property, label} = e.detail;
        this.bindingEditorTarget = {category, property, label};
        this.bindingEditorOpen = true;
    }

    protected _closeBindingEditor(clearTarget = false): void {
        this.bindingEditorOpen = false;
        if (clearTarget) {
            this.bindingEditorTarget = null;
        }
    }

    // =========================================================================
    // Legacy property update (for layout/position)
    // =========================================================================

    protected _handlePropertyReset(category: string, property: string): void {
        if (this.panelState) {
            this.panelState.resetProperty(category, property);
        }
    }

    protected updateLegacyProperty(property: string, detail: { value: any, unit?: CSSUnit }) {
        // FIXME: this method must be removed when position system is fully migrated to panel state
        if (!this.selectedBlock) return;

        const value = detail.value;
        const numValue = typeof value === 'number' ? value : parseFloat(value);

        if (property === 'layout') {
            this.documentModel.updateBlock(this.selectedBlock.id, {layout: value as 'absolute' | 'flow'});
        } else if (property === 'zIndex') {
            this.documentModel.updateBlock(this.selectedBlock.id, {zIndex: isNaN(numValue) ? 0 : numValue});
        }
    }

    protected _handleTargetChange(e: CustomEvent): void {
        const value = e.detail.value as string;
        const nextTargetId = value === '__block__' ? null : value;
        if (this.panelState) {
            this.panelState.setActiveTarget(nextTargetId);
        }
    }

    protected _getTargetStyles(block: BlockData | null): BlockPanelTargetStyles | null {
        if (!block) return null;
        const element = this.documentModel.getElement(block.id);
        const panelConfig = element?.getPanelConfig();
        return panelConfig?.targetStyles ?? null;
    }

    protected _getAvailableTargetDefs(block: BlockData | null): BlockPanelTargetStyles | null {
        const targetStyles = this._getTargetStyles(block);
        if (!targetStyles) return null;
        const filtered = Object.fromEntries(
            Object.entries(targetStyles).filter(([targetId]) => targetId !== 'block')
        );
        return Object.keys(filtered).length > 0 ? filtered : null;
    }

    protected _hasStyleTargets(block: BlockData | null): boolean {
        const targetStyles = this._getTargetStyles(block);
        return !!targetStyles && Object.keys(targetStyles).length > 0;
    }

    // =========================================================================
    // Render Methods
    // =========================================================================

    protected _ensureActiveTargetAvailable(): void {
        if (!this.selectedBlock) return;

        const targetStyles = this._getTargetStyles(this.selectedBlock);
        if (!targetStyles || Object.keys(targetStyles).length === 0) {
            if (this.activeTargetId !== null) {
                this.panelState?.setActiveTarget(null);
            }
            return;
        }

        const hasBlockTarget = Boolean(targetStyles.block);
        const targetIds = Object.keys(targetStyles).filter((targetId) => targetId !== 'block');

        if (this.activeTargetId && !targetStyles[this.activeTargetId]) {
            if (hasBlockTarget) {
                this.panelState?.setActiveTarget(null);
            } else if (targetIds.length > 0) {
                this.panelState?.setActiveTarget(targetIds[0]);
            }
            return;
        }

        if (!this.activeTargetId && !hasBlockTarget && targetIds.length > 0) {
            this.panelState?.setActiveTarget(targetIds[0]);
        }
    }

    protected _renderTargetSelector() {
        if (!this.selectedBlock) return nothing;

        const targetStyles = this._getTargetStyles(this.selectedBlock);
        const targetDefs = this._getAvailableTargetDefs(this.selectedBlock);
        if (!targetStyles || !targetDefs) {
            return nothing;
        }

        const hasBlockTarget = Boolean(targetStyles.block);

        const options = [
            ...(hasBlockTarget ? [{
                label: targetStyles.block?.label ?? 'Block',
                value: '__block__',
                description: targetStyles.block?.description,
            }] : []),
            ...Object.entries(targetDefs).map(([targetId, target]) => ({
                label: target.label ?? targetId,
                value: targetId,
                description: target.description,
            })),
        ];

        const selectedValue =
            this.activeTargetId && targetStyles[this.activeTargetId]
                ? this.activeTargetId
                : (hasBlockTarget ? '__block__' : Object.keys(targetDefs)[0]);
        const activeTarget =
            selectedValue === '__block__'
                ? targetStyles.block ?? null
                : targetDefs[selectedValue] ?? null;

        return html`
            <div class="target-section">
                <span class="target-label">Style target</span>
                <block-target-selector
                        .value=${selectedValue}
                        .options=${options}
                        @change=${this._handleTargetChange}
                ></block-target-selector>
                ${activeTarget?.description ? html`
                    <div class="target-description">${activeTarget.description}</div>
                ` : nothing}
            </div>
        `;
    }

    protected _renderLayoutSection() {
        if (!this.selectedBlock) return nothing;
        if (!this._isSectionVisible('layout')) return nothing;

        const isExpanded = this.expandedSections.has('layout');
        const layoutMode = this._renderLayoutMode();

        const layout = this.resolvedStyles.layout || {};
        const zIndexComputed = this._getComputedNumberValue('layout', 'zIndex');
        const zIndexPlaceholder = this._getCurrentValueText('layout', 'zIndex');
        const displayHelperText = this._getCurrentValueText('layout', 'display');

        return html`
            ${layoutMode}
            <!-- Layout Properties Section -->
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('layout')}>
                    <span class="section-title">
                        <span>Layout</span>
                        ${this._sectionHasInlineOverrides('layout') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this.selectedBlock.layout === 'absolute' ? this._renderAbsolutePositionInputs() : nothing}
                    ${this._renderPropertyRow('layout', 'zIndex', 'Z-Index', html`
                        <sm-number-input
                                .value=${this._getUserValue('layout', 'zIndex', this.selectedBlock.zIndex || 0)}
                                .placeholder=${zIndexPlaceholder}
                                .default=${zIndexComputed.value ?? 0}
                                min="0"
                                step="1"
                                @change=${(e: CustomEvent) => {
                                    this._handlePropertyChange('layout', 'zIndex', e.detail.value);
                                    this.updateLegacyProperty('zIndex', e.detail);
                                }}
                        ></sm-number-input>
                    `)}

                    ${this._renderPropertyRow('layout', 'display', 'Display', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(layout.display)}
                                .options=${[
                                    {label: 'Block', value: 'block'},
                                    {label: 'Flex', value: 'flex'},
                                    {label: 'Grid', value: 'grid'},
                                    {label: 'Inline', value: 'inline'},
                                    {label: 'Inline Block', value: 'inline-block'},
                                    {label: 'Inline Flex', value: 'inline-flex'},
                                    {label: 'None', value: 'none'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('layout', 'display', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: displayHelperText})}
                    ${this._renderPropertyRow('layout', 'show', 'Show', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(layout.show)}
                                .options=${[
                                    {label: 'Yes', value: 'yes'},
                                    {label: 'No', value: 'no'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('layout', 'show', e.detail.value)}
                        ></sm-select-input>
                    `)}
                </div>
            </div>
        `;
    }

    protected _renderLayoutMode() {
        const layoutMode = this.documentModel.canChangeLayoutMode(this.selectedBlock!.id);
        return layoutMode ? html`
            <!-- Layout Mode Toggle (no binding) -->
            <div class="layout-mode-container">
                <div class="layout-mode-label">Layout Mode</div>
                <div class="layout-mode-toggle" data-mode="${this.selectedBlock!.layout}">
                    <div class="layout-mode-slider"></div>
                    <div
                        class="layout-mode-option ${this.selectedBlock!.layout === 'flow' ? 'active' : ''}"
                        @click=${() => this.switchLayoutMode('flow')}
                    >
                        <ha-icon icon="mdi:format-align-left"></ha-icon>
                        <span>Flow</span>
                    </div>
                    <div
                        class="layout-mode-option ${this.selectedBlock!.layout === 'absolute' ? 'active' : ''}"
                        @click=${() => this.switchLayoutMode('absolute')}
                    >
                        <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
                        <span>Absolute</span>
                    </div>
                </div>
            </div>
        ` : nothing;
    }

    protected _renderAbsolutePositionInputs() {
        const layoutData = this.getLayoutData();
        if (!layoutData) return nothing;
        if (this.selectedBlock?.layout !== 'absolute') return nothing;

        const positionConfig = layoutData.positionConfig;

        return html`
            <!-- Position Mode (no binding) -->
            <sm-toggle-input
                    label="Position Mode"
                    labelOn="Responsive"
                    labelOff="Static"
                    .value=${positionConfig.unitSystem === '%'}
                    @change=${(e: CustomEvent) => this._handlePositionModeChange(e)}
            ></sm-toggle-input>

            <!-- Anchor Point (no binding) -->
            <sm-anchor-selector
                    label="Anchor Point"
                    .value=${positionConfig.anchor}
                    @change=${(e: CustomEvent) => this._handleAnchorChange(e)}
            ></sm-anchor-selector>

            ${this._renderPropertyRow('layout', 'positionX', 'X', html`
                <sm-number-input
                        .value=${this._getPositionDisplayValue('x', positionConfig)}
                        step="1"
                        unit="${positionConfig.unitSystem}"
                        .units=${[positionConfig.unitSystem]}
                        @change=${(e: CustomEvent) => {
                            const value = e.detail.value;
                            this._handlePropertyChange('layout', 'positionX', value);
                            this._handlePositionChange('x', value);
                        }}
                ></sm-number-input>
            `)}
            ${this._renderPropertyRow('layout', 'positionY', 'Y', html`
                <sm-number-input
                        .value=${this._getPositionDisplayValue('y', positionConfig)}
                        step="1"
                        unit="${positionConfig.unitSystem}"
                        .units=${[positionConfig.unitSystem]}
                        @change=${(e: CustomEvent) => {
                            const value = e.detail.value;
                            this._handlePropertyChange('layout', 'positionY', value);
                            this._handlePositionChange('y', value);
                        }}
                ></sm-number-input>
            `)}
        `;
    }

    protected _handlePositionModeChange(e: CustomEvent): void {
        const layoutData = this.getLayoutData();
        if (!layoutData) return;

        const targetUnit: UnitSystem = e.detail.value ? '%' : 'px';
        const currentConfig = layoutData.positionConfig;
        const containerSize = this.getContainerDimensions();
        const elementSize = this.getRuntimeSize(layoutData);

        const system = new PositionSystem({
            containerSize,
            elementSize,
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        });

        const positionData = {
            x: currentConfig.x || 0,
            y: currentConfig.y || 0,
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        };

        const newData = system.convertUnits(positionData, targetUnit);

        this.applyPositionUpdate(
            layoutData.position,
            {
                anchor: newData.anchorPoint,
                x: newData.x,
                y: newData.y,
                unitSystem: newData.unitSystem,
                originPoint: newData.originPoint ?? newData.anchorPoint,
            }
        );
    }

    protected _handleAnchorChange(e: CustomEvent): void {
        const layoutData = this.getLayoutData();
        if (!layoutData) return;

        const newAnchor = e.detail.value as AnchorPoint;
        const currentConfig = layoutData.positionConfig;

        if (newAnchor === currentConfig.anchor) return;

        const containerSize = this.getContainerDimensions();
        const elementSize = this.getRuntimeSize(layoutData);

        const system = new PositionSystem({
            containerSize,
            elementSize,
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        });

        const currentData = {
            x: currentConfig.x || 0,
            y: currentConfig.y || 0,
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        };

        const newData = system.convertAnchor(currentData, newAnchor);

        this.applyPositionUpdate(
            layoutData.position,
            {
                x: newData.x,
                y: newData.y,
                anchor: newData.anchorPoint,
                originPoint: newData.originPoint ?? newData.anchorPoint,
                unitSystem: currentConfig.unitSystem,
            }
        );
    }

    protected _handlePositionChange(axis: 'x' | 'y', value: number): void {
        const layoutData = this.getLayoutData();
        if (!layoutData) return;

        const newConfig = {
            ...layoutData.positionConfig,
            [axis]: value
        };

        const containerSize = this.getContainerDimensions();
        const elementSize = this.getRuntimeSize(layoutData);

        const system = new PositionSystem({
            containerSize,
            elementSize,
            anchorPoint: newConfig.anchor,
            originPoint: newConfig.originPoint,
            unitSystem: newConfig.unitSystem
        });

        const absolutePos = system.toMoveableSpace({
            x: newConfig.x,
            y: newConfig.y,
            anchorPoint: newConfig.anchor,
            originPoint: newConfig.originPoint,
            unitSystem: newConfig.unitSystem
        });

        this.applyPositionUpdate({x: absolutePos.x, y: absolutePos.y}, newConfig);
    }

    protected _renderFlexSection() {
        if (!this.selectedBlock) return nothing;
        if (!this._isSectionVisible('flex')) return nothing;

        // const layout = this.resolvedStyles.layout || {};
        // if (layout.display !== 'flex') return nothing;

        const isExpanded = this.expandedSections.has('flex');

        const flex = this.resolvedStyles.flex || {};
        const rowGapUnit = this._getUnitConfig('flex', 'rowGap');
        const columnGapUnit = this._getUnitConfig('flex', 'columnGap');
        const flexDirectionHelperText = this._getCurrentValueText('flex', 'flexDirection');
        const justifyContentHelperText = this._getCurrentValueText('flex', 'justifyContent');
        const alignItemsHelperText = this._getCurrentValueText('flex', 'alignItems');
        const rowGapComputed = this._getComputedNumberValue('flex', 'rowGap');
        const columnGapComputed = this._getComputedNumberValue('flex', 'columnGap');
        const rowGapUnitValue = rowGapComputed.unit && rowGapUnit?.units?.includes(rowGapComputed.unit) ? rowGapComputed.unit : rowGapUnit?.unit;
        const columnGapUnitValue = columnGapComputed.unit && columnGapUnit?.units?.includes(columnGapComputed.unit) ? columnGapComputed.unit : columnGapUnit?.unit;

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('flex')}>
                    <span class="section-title">
                        <span>Flex Options</span>
                        ${this._sectionHasInlineOverrides('flex') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('flex', 'flexDirection', 'Flex Direction', html`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(flex.flexDirection)}
                                .options=${[
                                    {
                                        value: 'row',
                                        tooltip: 'Row',
                                        icon: '<ha-icon icon="mdi:transfer-right"></ha-icon>'
                                    },
                                    {
                                        value: 'row-reverse',
                                        tooltip: 'Row Reverse',
                                        icon: '<ha-icon icon="mdi:transfer-left"></ha-icon>'
                                    },
                                    {
                                        value: 'column',
                                        tooltip: 'Column',
                                        icon: '<ha-icon icon="mdi:transfer-down"></ha-icon>'
                                    },
                                    {
                                        value: 'column-reverse',
                                        tooltip: 'Column Reverse',
                                        icon: '<ha-icon icon="mdi:transfer-up"></ha-icon>'
                                    }
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('flex', 'flexDirection', e.detail.value)}
                        ></sm-button-group-input>
                    `, {helperText: flexDirectionHelperText})}

                    ${this._renderPropertyRow('flex', 'justifyContent', 'Justify Content', html`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(flex.justifyContent)}
                                .options=${[
                                    {
                                        value: 'flex-start',
                                        tooltip: 'Start',
                                        icon: '<ha-icon icon="mdi:format-horizontal-align-left"></ha-icon>'
                                    },
                                    {
                                        value: 'center',
                                        tooltip: 'Center',
                                        icon: '<ha-icon icon="mdi:format-horizontal-align-center"></ha-icon>'
                                    },
                                    {
                                        value: 'flex-end',
                                        tooltip: 'End',
                                        icon: '<ha-icon icon="mdi:format-horizontal-align-right"></ha-icon>'
                                    },
                                    {
                                        value: 'space-between',
                                        tooltip: 'Space Between',
                                        icon: '<ha-icon icon="mdi:align-horizontal-distribute"></ha-icon>' // FIXME: use a better icon
                                    },
                                    {
                                        value: 'space-around',
                                        tooltip: 'Space Around',
                                        icon: '<div style="rotate: 90deg"><ha-icon icon="mdi:format-align-center"></ha-icon></div>' // FIXME: use a better icon
                                    }
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('flex', 'justifyContent', e.detail.value)}
                        ></sm-button-group-input>
                    `, {helperText: justifyContentHelperText})}

                    ${this._renderPropertyRow('flex', 'alignItems', 'Align Items', html`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(flex.alignItems)}
                                .options=${[
                                    {
                                        value: 'flex-start',
                                        tooltip: 'Start',
                                        icon: '<ha-icon icon="mdi:align-vertical-top"></ha-icon>'
                                    },
                                    {
                                        value: 'center',
                                        tooltip: 'Center',
                                        icon: '<ha-icon icon="mdi:align-vertical-center"></ha-icon>'
                                    },
                                    {
                                        value: 'flex-end',
                                        tooltip: 'End',
                                        icon: '<ha-icon icon="mdi:align-vertical-bottom"></ha-icon>'
                                    },
                                    {
                                        value: 'stretch',
                                        tooltip: 'Stretch',
                                        icon: '<ha-icon icon="mdi:stretch-to-page-outline"></ha-icon>' // FIXME: use a better icon
                                    }
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('flex', 'alignItems', e.detail.value)}
                        ></sm-button-group-input>
                    `, {helperText: alignItemsHelperText})}

                    <div class="property-grid">
                        ${this._renderPropertyRow('flex', 'rowGap', 'Row Gap', html`
                            <sm-number-input
                                    .value=${this._getUserValue('flex', 'rowGap')}
                                    .placeholder=${this._getCurrentValueText('flex', 'rowGap')}
                                    .default=${rowGapComputed.value ?? 0}
                                    min="0"
                                    step="1"
                                    unit="${rowGapUnitValue ?? 'px'}"
                                    .units=${rowGapUnit?.units ?? ['px']}
                                    @change=${(e: CustomEvent) => this._handlePropertyChange('flex', 'rowGap', e.detail.value, e.detail.unit)}
                            ></sm-number-input>
                        `)}
                        ${this._renderPropertyRow('flex', 'columnGap', 'Column Gap', html`
                            <sm-number-input
                                    .value=${this._getUserValue('flex', 'columnGap')}
                                    .placeholder=${this._getCurrentValueText('flex', 'columnGap')}
                                    .default=${columnGapComputed.value ?? 0}
                                    min="0"
                                    step="1"
                                    unit="${columnGapUnitValue ?? 'px'}"
                                    .units=${columnGapUnit?.units ?? ['px']}
                                    @change=${(e: CustomEvent) => this._handlePropertyChange('flex', 'columnGap', e.detail.value, e.detail.unit)}
                            ></sm-number-input>
                        `)}
                    </div>
                </div>
            </div>
        `;
    }

    protected _renderSizeSection() {
        if (!this.selectedBlock) return nothing;
        if (!this._isSectionVisible('size')) return nothing;

        // const size = this.resolvedStyles.size || {};
        // const layoutData = this.getLayoutData();
        // const runtimeSize = layoutData ? this.getRuntimeSize(layoutData) : {width: 0, height: 0};

        const isExpanded = this.expandedSections.has('size');
        const widthUnit = this._getUnitConfig('size', 'width');
        const heightUnit = this._getUnitConfig('size', 'height');
        const minWidthUnit = this._getUnitConfig('size', 'minWidth');
        const maxWidthUnit = this._getUnitConfig('size', 'maxWidth');
        const minHeightUnit = this._getUnitConfig('size', 'minHeight');
        const maxHeightUnit = this._getUnitConfig('size', 'maxHeight');
        const widthComputed = this._getComputedNumberValue('size', 'width');
        const heightComputed = this._getComputedNumberValue('size', 'height');
        const minWidthComputed = this._getComputedNumberValue('size', 'minWidth');
        const maxWidthComputed = this._getComputedNumberValue('size', 'maxWidth');
        const minHeightComputed = this._getComputedNumberValue('size', 'minHeight');
        const maxHeightComputed = this._getComputedNumberValue('size', 'maxHeight');
        const widthUnitValue = widthComputed.unit && widthUnit?.units?.includes(widthComputed.unit) ? widthComputed.unit : widthUnit?.unit;
        const heightUnitValue = heightComputed.unit && heightUnit?.units?.includes(heightComputed.unit) ? heightComputed.unit : heightUnit?.unit;
        const minWidthUnitValue = minWidthComputed.unit && minWidthUnit?.units?.includes(minWidthComputed.unit) ? minWidthComputed.unit : minWidthUnit?.unit;
        const maxWidthUnitValue = maxWidthComputed.unit && maxWidthUnit?.units?.includes(maxWidthComputed.unit) ? maxWidthComputed.unit : maxWidthUnit?.unit;
        const minHeightUnitValue = minHeightComputed.unit && minHeightUnit?.units?.includes(minHeightComputed.unit) ? minHeightComputed.unit : minHeightUnit?.unit;
        const maxHeightUnitValue = maxHeightComputed.unit && maxHeightUnit?.units?.includes(maxHeightComputed.unit) ? maxHeightComputed.unit : maxHeightUnit?.unit;

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('size')}>
                    <span class="section-title">
                        <span>Size</span>
                        ${this._sectionHasInlineOverrides('size') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">

                    ${this._renderPropertyRow('size', 'width', 'Width', html`
                        <sm-number-input
                                .value=${this._getUserValue('size', 'width')}
                                .placeholder=${this._getCurrentValueText('size', 'width')}
                                .default=${widthComputed.value ?? 0}
                                min="1"
                                step="1"
                                unit="${widthUnitValue ?? 'px'}"
                                .units=${widthUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => {
                                    this._handlePropertyChange('size', 'width', e.detail.value, e.detail.unit);
                                }}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('size', 'height', 'Height', html`
                        <sm-number-input
                                .value=${this._getUserValue('size', 'height')}
                                .placeholder=${this._getCurrentValueText('size', 'height')}
                                .default=${heightComputed.value ?? 0}
                                min="1"
                                step="1"
                                unit="${heightUnitValue ?? 'px'}"
                                .units=${heightUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => {
                                    this._handlePropertyChange('size', 'height', e.detail.value, e.detail.unit);
                                }}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('size', 'minWidth', 'Min Width', html`
                        <sm-number-input
                                .value=${this._getUserValue('size', 'minWidth')}
                                .placeholder=${this._getCurrentValueText('size', 'minWidth')}
                                .default=${minWidthComputed.value ?? 0}
                                min="0"
                                step="1"
                                unit="${minWidthUnitValue ?? 'px'}"
                                .units=${minWidthUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('size', 'minWidth', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('size', 'maxWidth', 'Max Width', html`
                        <sm-number-input
                                .value=${this._getUserValue('size', 'maxWidth')}
                                .placeholder=${this._getCurrentValueText('size', 'maxWidth')}
                                .default=${maxWidthComputed.value ?? 0}
                                min="0"
                                step="1"
                                unit="${maxWidthUnitValue ?? 'px'}"
                                .units=${maxWidthUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('size', 'maxWidth', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('size', 'minHeight', 'Min Height', html`
                        <sm-number-input
                                .value=${this._getUserValue('size', 'minHeight')}
                                .placeholder=${this._getCurrentValueText('size', 'minHeight')}
                                .default=${minHeightComputed.value ?? 0}
                                min="0"
                                step="1"
                                unit="${minHeightUnitValue ?? 'px'}"
                                .units=${minHeightUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('size', 'minHeight', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('size', 'maxHeight', 'Max Height', html`
                        <sm-number-input
                                .value=${this._getUserValue('size', 'maxHeight')}
                                .placeholder=${this._getCurrentValueText('size', 'maxHeight')}
                                .default=${maxHeightComputed.value ?? 0}
                                min="0"
                                step="1"
                                unit="${maxHeightUnitValue ?? 'px'}"
                                .units=${maxHeightUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('size', 'maxHeight', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `;
    }

    protected _renderSpacingSection() {
        if (!this._isSectionVisible('spacing')) return nothing;

        const spacing = this.resolvedStyles.spacing || {};
        const isExpanded = this.expandedSections.has('spacing');
        const marginUnit = this._getUnitConfig('spacing', 'margin');
        const paddingUnit = this._getUnitConfig('spacing', 'padding');
        const marginHelperText = this._getCurrentValueText('spacing', 'margin');
        const paddingHelperText = this._getCurrentValueText('spacing', 'padding');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('spacing')}>
                    <span class="section-title">
                        <span>Spacing</span>
                        ${this._sectionHasInlineOverrides('spacing') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('spacing', 'margin', 'Margin', html`
                        <sm-spacing-input
                                .value=${this._getResolvedValue(spacing.margin)}
                                unit="${marginUnit?.unit ?? 'px'}"
                                .units=${marginUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('spacing', 'margin', e.detail.value, e.detail.unit)}
                        ></sm-spacing-input>
                    `, {helperText: marginHelperText})}
                    ${this._renderPropertyRow('spacing', 'padding', 'Padding', html`
                        <sm-spacing-input
                                .value=${this._getResolvedValue(spacing.padding)}
                                unit="${paddingUnit?.unit ?? 'px'}"
                                .units=${paddingUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('spacing', 'padding', e.detail.value, e.detail.unit)}
                        ></sm-spacing-input>
                    `, {helperText: paddingHelperText})}
                </div>
            </div>
        `;
    }

    protected _renderTypographySection() {
        if (!this._isSectionVisible('typography')) return nothing;

        const typography = this.resolvedStyles.typography || {};
        const isExpanded = this.expandedSections.has('typography');
        const fontSizeUnit = this._getUnitConfig('typography', 'fontSize');
        const letterSpacingUnit = this._getUnitConfig('typography', 'letterSpacing');
        const fontSizeComputed = this._getComputedNumberValue('typography', 'fontSize');
        const lineHeightComputed = this._getComputedNumberValue('typography', 'lineHeight');
        const letterSpacingComputed = this._getComputedNumberValue('typography', 'letterSpacing');
        const fontSizeUnitValue = !this._hasLocalOverride('typography', 'fontSize') && fontSizeComputed.unit && fontSizeUnit?.units?.includes(fontSizeComputed.unit) ? fontSizeComputed.unit : fontSizeUnit?.unit;
        const letterSpacingUnitValue = !this._hasLocalOverride('typography', 'letterSpacing') && letterSpacingComputed.unit && letterSpacingUnit?.units?.includes(letterSpacingComputed.unit) ? letterSpacingComputed.unit : letterSpacingUnit?.unit;
        const fontSizeValue = this._hasLocalOverride('typography', 'fontSize') ? this._getResolvedValue(typography.fontSize, 16) : (fontSizeComputed.value ?? this._getResolvedValue(typography.fontSize, 16));
        const lineHeightBase = this._getResolvedValue(typography.lineHeight, 1.5);
        const lineHeightValue = this._hasLocalOverride('typography', 'lineHeight') ? lineHeightBase : (lineHeightComputed.value ?? lineHeightBase);
        const letterSpacingBase = this._getResolvedValue(typography.letterSpacing, 0);
        const letterSpacingValue = this._hasLocalOverride('typography', 'letterSpacing') ? letterSpacingBase : (letterSpacingComputed.value ?? letterSpacingBase);
        const textAlignHelperText = this._getCurrentValueText('typography', 'textAlign');
        const fontWeightHelperText = this._getCurrentValueText('typography', 'fontWeight');
        const fontFamilyHelperText = this._getCurrentValueText('typography', 'fontFamily');
        const textTransformHelperText = this._getCurrentValueText('typography', 'textTransform');
        const textDecorationHelperText = this._getCurrentValueText('typography', 'textDecoration');
        const whiteSpaceHelperText = this._getCurrentValueText('typography', 'whiteSpace');
        const colorHelperText = this._getCurrentValueText('typography', 'color');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('typography')}>
                    <span class="section-title">
                        <span>Typography</span>
                        ${this._sectionHasInlineOverrides('typography') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('typography', 'color', 'Text Color', html`
                        <sm-color-input
                                .value=${this._getResolvedValue(typography.color, '')}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'color', e.detail.value)}
                        ></sm-color-input>
                    `, {helperText: colorHelperText})}
                    ${this._renderPropertyRow('typography', 'textAlign', 'Text Align', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(typography.textAlign)}
                                .options=${[
                                    {label: 'Left', value: 'left'},
                                    {label: 'Center', value: 'center'},
                                    {label: 'Right', value: 'right'},
                                    {label: 'Justify', value: 'justify'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'textAlign', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: textAlignHelperText})}
                    ${this._renderPropertyRow('typography', 'fontSize', 'Font Size', html`
                        <sm-slider-input
                                .value=${fontSizeValue ?? 16}
                                min="8"
                                max="72"
                                step="1"
                                unit="${fontSizeUnitValue ?? 'px'}"
                                .units=${fontSizeUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'fontSize', e.detail.value, e.detail.unit)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow('typography', 'fontWeight', 'Font Weight', html`
                        <sm-select-input
                                .value=${String(this._getResolvedValue(typography.fontWeight))}
                                .options=${[
                                    {label: 'Thin (100)', value: '100'},
                                    {label: 'Light (300)', value: '300'},
                                    {label: 'Normal (400)', value: '400'},
                                    {label: 'Medium (500)', value: '500'},
                                    {label: 'Semi-Bold (600)', value: '600'},
                                    {label: 'Bold (700)', value: '700'},
                                    {label: 'Extra-Bold (800)', value: '800'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'fontWeight', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: fontWeightHelperText})}
                    ${this._renderPropertyRow('typography', 'fontFamily', 'Font Family', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(typography.fontFamily)}
                                .options=${[
                                    {label: 'Arial', value: 'Arial, sans-serif'},
                                    {label: 'Helvetica', value: 'Helvetica, sans-serif'},
                                    {label: 'Times New Roman', value: '"Times New Roman", serif'},
                                    {label: 'Georgia', value: 'Georgia, serif'},
                                    {label: 'Courier New', value: '"Courier New", monospace'},
                                    {label: 'Verdana', value: 'Verdana, sans-serif'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'fontFamily', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: fontFamilyHelperText})}
                    ${this._renderPropertyRow('typography', 'lineHeight', 'Line Height', html`
                        <sm-slider-input
                                .value=${lineHeightValue ?? 1.5}
                                min="0.5"
                                max="3"
                                step="0.1"
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'lineHeight', e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow('typography', 'textTransform', 'Text Transform', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(typography.textTransform)}
                                .options=${TEXT_TRANSFORM_OPTIONS}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'textTransform', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: textTransformHelperText})}
                    ${this._renderPropertyRow('typography', 'textDecoration', 'Text Decoration', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(typography.textDecoration)}
                                .options=${TEXT_DECORATION_OPTIONS}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'textDecoration', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: textDecorationHelperText})}
                    ${this._renderPropertyRow('typography', 'textShadow', 'Text Shadow', html`
                        <sm-text-input
                                .value=${this._getUserValue('typography', 'textShadow', '') ?? ''}
                                placeholder=${this._getCurrentValueText('typography', 'textShadow') ?? 'e.g. 2px 2px 4px rgba(0,0,0,0.3)'}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'textShadow', e.detail.value)}
                        ></sm-text-input>
                    `)}
                    ${this._renderPropertyRow('typography', 'letterSpacing', 'Letter Spacing', html`
                        <sm-slider-input
                                .value=${letterSpacingValue ?? 0}
                                min="-2"
                                max="10"
                                step="0.1"
                                unit="${letterSpacingUnitValue ?? 'px'}"
                                .units=${letterSpacingUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'letterSpacing', e.detail.value, e.detail.unit)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow('typography', 'whiteSpace', 'White Space', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(typography.whiteSpace)}
                                .options=${WHITE_SPACE_OPTIONS}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('typography', 'whiteSpace', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: whiteSpaceHelperText})}
                </div>
            </div>
        `;
    }

    protected _renderBackgroundSection() {
        if (!this._isSectionVisible('background')) return nothing;

        const background = this.resolvedStyles.background || {};
        const isExpanded = this.expandedSections.has('background');
        const backgroundImageValue = String(this._getResolvedValue(background.backgroundImage, ''));
        const backgroundImageMode = backgroundImageValue
            ? this._getBackgroundImageMode(backgroundImageValue)
            : this.backgroundImageMode;
        const backgroundImageUrl = this._extractBackgroundImageUrl(backgroundImageValue);
        const backgroundImageUserValue = this._getUserValue('background', 'backgroundImage', '') ?? '';
        const backgroundImageUserUrl = this._extractBackgroundImageUrl(backgroundImageUserValue);
        const backgroundMediaReference = backgroundImageMode === 'media' ? backgroundImageUrl : '';
        const hasMediaSelection = isManagedMediaReference(backgroundMediaReference);
        const mediaLabel = hasMediaSelection
            ? (getMediaReferenceName(backgroundMediaReference) || backgroundMediaReference)
            : '';
        const backgroundSizeValue = String(this._getResolvedValue(background.backgroundSize, 'auto'));
        const backgroundSizePreset = this._getBackgroundSizePreset(backgroundSizeValue);
        const backgroundSizePair = this._parseLengthPair(backgroundSizeValue, {
            x: {value: 100, unit: '%'},
            y: {value: 100, unit: '%'},
        });
        const backgroundPositionValue = String(this._getResolvedValue(background.backgroundPosition, 'center'));
        const backgroundPositionPreset = this._getBackgroundPositionPreset(backgroundPositionValue);
        const backgroundPositionPair = this._parseLengthPair(backgroundPositionValue, {
            x: {value: 50, unit: '%'},
            y: {value: 50, unit: '%'},
        });
        const backgroundRepeatValue = String(this._getResolvedValue(background.backgroundRepeat));
        const backgroundImagePlaceholder = this._getCurrentValueText('background', 'backgroundImage');
        const backgroundImageHelperText = backgroundImageMode === 'image' || backgroundImageMode === 'gradient' || backgroundImageMode === 'custom' ? undefined : this._getCurrentValueText('background', 'backgroundImage');
        const backgroundSizeHelperText = this._getCurrentValueText('background', 'backgroundSize');
        const backgroundPositionHelperText = this._getCurrentValueText('background', 'backgroundPosition');
        const backgroundRepeatHelperText = this._getCurrentValueText('background', 'backgroundRepeat');
        const backgroundBlendHelperText = this._getCurrentValueText('background', 'backgroundBlendMode');
        const backgroundColorHelperText = this._getCurrentValueText('background', 'backgroundColor');
        const boxShadowPlaceholder = this._getCurrentValueText('background', 'boxShadow') ?? '0 6px 18px rgba(0, 0, 0, 0.2)';

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('background')}>
                    <span class="section-title">
                        <span>Background</span>
                        ${this._sectionHasInlineOverrides('background') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('background', 'backgroundColor', 'Background Color', html`
                        <sm-color-input
                                .value=${this._getResolvedValue(background.backgroundColor, '')}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('background', 'backgroundColor', e.detail.value)}
                        ></sm-color-input>
                    `, {helperText: backgroundColorHelperText})}
                    ${this._renderPropertyRow('background', 'backgroundImage', 'Background Image', html`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${backgroundImageMode}
                                    .options=${BACKGROUND_IMAGE_OPTIONS}
                                    @change=${(e: CustomEvent) =>
                                            this._handleBackgroundImageModeChange(
                                                    e.detail.value as BackgroundImageMode,
                                                    backgroundImageValue
                                            )}
                            ></sm-select-input>
                            ${backgroundImageMode === 'image' ? html`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder=${backgroundImagePlaceholder ?? 'https://example.com/background.png'}
                                        .value=${backgroundImageUserUrl}
                                        @input=${(e: Event) =>
                                                this._handlePropertyChange(
                                                        'background',
                                                        'backgroundImage',
                                                        (e.target as HTMLInputElement).value
                                                )}
                                />
                            ` : nothing}
                            ${backgroundImageMode === 'media' ? html`
                                <div class="background-media">
                                    ${hasMediaSelection ? html`
                                        <div class="media-selected">
                                            <span class="media-name" title=${backgroundMediaReference}>${mediaLabel}</span>
                                            <div class="media-actions">
                                                <button class="media-button" @click=${this._openMediaManagerForBackgroundImage}>
                                                    Edit
                                                </button>
                                                <button class="media-button danger" @click=${this._clearBackgroundMedia}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ` : html`
                                        <button class="media-button primary" @click=${this._openMediaManagerForBackgroundImage}>
                                            Select media
                                        </button>
                                    `}
                                </div>
                            ` : nothing}
                            ${backgroundImageMode === 'gradient' ? html`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder=${backgroundImagePlaceholder ?? 'linear-gradient(135deg, #111111, #999999)'}
                                        .value=${backgroundImageUserValue}
                                        @input=${(e: Event) =>
                                                this._handlePropertyChange(
                                                        'background',
                                                        'backgroundImage',
                                                        (e.target as HTMLInputElement).value
                                                )}
                                />
                            ` : nothing}
                            ${backgroundImageMode === 'custom' ? html`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder=${backgroundImagePlaceholder ?? 'url(...) or gradient'}
                                        .value=${backgroundImageUserValue}
                                        @input=${(e: Event) =>
                                                this._handlePropertyChange(
                                                        'background',
                                                        'backgroundImage',
                                                        (e.target as HTMLInputElement).value
                                                )}
                                />
                            ` : nothing}
                        </div>
                    `, {helperText: backgroundImageHelperText})}
                    ${this._renderPropertyRow('background', 'backgroundSize', 'Background Size', html`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${backgroundSizePreset}
                                    .options=${BACKGROUND_SIZE_OPTIONS}
                                    @change=${(e: CustomEvent) =>
                                            this._handleBackgroundSizePresetChange(
                                                    e.detail.value,
                                                    backgroundSizePreset
                                            )}
                            ></sm-select-input>
                            ${backgroundSizePreset === BACKGROUND_CUSTOM_VALUE ? html`
                                <div class="background-inline-grid">
                                    <div class="background-field">
                                        <span class="background-field-label">Width</span>
                                        <sm-number-input
                                                .value=${backgroundSizePair.x.value}
                                                min="0"
                                                step="1"
                                                unit="${backgroundSizePair.x.unit}"
                                                .units=${BACKGROUND_LENGTH_UNITS}
                                                @change=${(e: CustomEvent) =>
                                                        this._handleBackgroundLengthPairChange(
                                                                'backgroundSize',
                                                                'x',
                                                                e.detail.value,
                                                                e.detail.unit,
                                                                backgroundSizePair
                                                        )}
                                        ></sm-number-input>
                                    </div>
                                    <div class="background-field">
                                        <span class="background-field-label">Height</span>
                                        <sm-number-input
                                                .value=${backgroundSizePair.y.value}
                                                min="0"
                                                step="1"
                                                unit="${backgroundSizePair.y.unit}"
                                                .units=${BACKGROUND_LENGTH_UNITS}
                                                @change=${(e: CustomEvent) =>
                                                        this._handleBackgroundLengthPairChange(
                                                                'backgroundSize',
                                                                'y',
                                                                e.detail.value,
                                                                e.detail.unit,
                                                                backgroundSizePair
                                                        )}
                                        ></sm-number-input>
                                    </div>
                                </div>
                            ` : nothing}
                        </div>
                    `, {helperText: backgroundSizeHelperText})}
                    ${this._renderPropertyRow('background', 'backgroundPosition', 'Background Position', html`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${backgroundPositionPreset}
                                    .options=${BACKGROUND_POSITION_OPTIONS}
                                    @change=${(e: CustomEvent) =>
                                            this._handleBackgroundPositionPresetChange(
                                                    e.detail.value,
                                                    backgroundPositionPreset
                                            )}
                            ></sm-select-input>
                            ${backgroundPositionPreset === BACKGROUND_CUSTOM_VALUE ? html`
                                <div class="background-inline-grid">
                                    <div class="background-field">
                                        <span class="background-field-label">X</span>
                                        <sm-number-input
                                                .value=${backgroundPositionPair.x.value}
                                                step="1"
                                                unit="${backgroundPositionPair.x.unit}"
                                                .units=${BACKGROUND_LENGTH_UNITS}
                                                @change=${(e: CustomEvent) =>
                                                        this._handleBackgroundLengthPairChange(
                                                                'backgroundPosition',
                                                                'x',
                                                                e.detail.value,
                                                                e.detail.unit,
                                                                backgroundPositionPair
                                                        )}
                                        ></sm-number-input>
                                    </div>
                                    <div class="background-field">
                                        <span class="background-field-label">Y</span>
                                        <sm-number-input
                                                .value=${backgroundPositionPair.y.value}
                                                step="1"
                                                unit="${backgroundPositionPair.y.unit}"
                                                .units=${BACKGROUND_LENGTH_UNITS}
                                                @change=${(e: CustomEvent) =>
                                                        this._handleBackgroundLengthPairChange(
                                                                'backgroundPosition',
                                                                'y',
                                                                e.detail.value,
                                                                e.detail.unit,
                                                                backgroundPositionPair
                                                        )}
                                        ></sm-number-input>
                                    </div>
                                </div>
                            ` : nothing}
                        </div>
                    `, {helperText: backgroundPositionHelperText})}
                    ${this._renderPropertyRow('background', 'backgroundRepeat', 'Background Repeat', html`
                        <sm-select-input
                                .value=${backgroundRepeatValue}
                                .options=${BACKGROUND_REPEAT_OPTIONS}
                                @change=${(e: CustomEvent) =>
                                        this._handlePropertyChange('background', 'backgroundRepeat', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: backgroundRepeatHelperText})}
                    ${this._renderPropertyRow('background', 'boxShadow', 'Box Shadow', html`
                        <input
                                class="text-input"
                                type="text"
                                placeholder=${boxShadowPlaceholder}
                                .value=${this._getUserValue('background', 'boxShadow', '') ?? ''}
                                @input=${(e: Event) =>
                                        this._handlePropertyChange(
                                                'background',
                                                'boxShadow',
                                                (e.target as HTMLInputElement).value
                                        )}
                        />
                    `)}
                    ${this._renderPropertyRow('background', 'backgroundBlendMode', 'Background Blend Mode', html`
                        <sm-select-input
                                .value=${String(this._getResolvedValue(background.backgroundBlendMode))}
                                .options=${BACKGROUND_BLEND_MODE_OPTIONS}
                                @change=${(e: CustomEvent) =>
                                        this._handlePropertyChange(
                                                'background',
                                                'backgroundBlendMode',
                                                e.detail.value
                                        )}
                        ></sm-select-input>
                    `, {helperText: backgroundBlendHelperText})}
                </div>
            </div>
        `;
    }

    protected _renderBorderSection() {
        if (!this._isSectionVisible('border')) return nothing;

        const border = this.resolvedStyles.border || {};
        const isExpanded = this.expandedSections.has('border');
        const borderWidthUnit = this._getUnitConfig('border', 'borderWidth');
        const borderRadiusUnit = this._getUnitConfig('border', 'borderRadius');
        const borderWidthComputed = this._getComputedNumberValue('border', 'borderWidth');
        const borderRadiusComputed = this._getComputedNumberValue('border', 'borderRadius');
        const borderWidthUnitValue = borderWidthComputed.unit && borderWidthUnit?.units?.includes(borderWidthComputed.unit) ? borderWidthComputed.unit : borderWidthUnit?.unit;
        const borderRadiusUnitValue = borderRadiusComputed.unit && borderRadiusUnit?.units?.includes(borderRadiusComputed.unit) ? borderRadiusComputed.unit : borderRadiusUnit?.unit;
        const borderStyleHelperText = this._getCurrentValueText('border', 'borderStyle');
        const borderColorHelperText = this._getCurrentValueText('border', 'borderColor');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('border')}>
                    <span class="section-title">
                        <span>Border</span>
                        ${this._sectionHasInlineOverrides('border') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('border', 'borderWidth', 'Border Width', html`
                        <sm-number-input
                                .value=${this._getUserValue('border', 'borderWidth')}
                                .placeholder=${this._getCurrentValueText('border', 'borderWidth')}
                                .default=${borderWidthComputed.value ?? 0}
                                min="0"
                                step="1"
                                unit="${borderWidthUnitValue ?? 'px'}"
                                .units=${borderWidthUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('border', 'borderWidth', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('border', 'borderStyle', 'Border Style', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(border.borderStyle)}
                                .options=${[
                                    {label: 'None', value: 'none'},
                                    {label: 'Solid', value: 'solid'},
                                    {label: 'Dashed', value: 'dashed'},
                                    {label: 'Dotted', value: 'dotted'},
                                    {label: 'Double', value: 'double'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('border', 'borderStyle', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: borderStyleHelperText})}
                    ${this._renderPropertyRow('border', 'borderColor', 'Border Color', html`
                        <sm-color-input
                                .value=${this._getResolvedValue(border.borderColor, '')}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('border', 'borderColor', e.detail.value)}
                        ></sm-color-input>
                    `, {helperText: borderColorHelperText})}
                    ${this._renderPropertyRow('border', 'borderRadius', 'Border Radius', html`
                        <sm-number-input
                                .value=${this._getUserValue('border', 'borderRadius')}
                                .placeholder=${this._getCurrentValueText('border', 'borderRadius')}
                                .default=${borderRadiusComputed.value ?? 0}
                                min="0"
                                step="1"
                                unit="${borderRadiusUnitValue ?? 'px'}"
                                .units=${borderRadiusUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('border', 'borderRadius', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `;
    }

    protected _renderEffectsSection() {
        if (!this._isSectionVisible('effects')) return nothing;

        const effects = this.resolvedStyles.effects || {};
        const isExpanded = this.expandedSections.has('effects');
        const opacityComputed = this._getComputedNumberValue('effects', 'opacity');
        const rotateComputed = this._getComputedNumberValue('effects', 'rotate');
        const rotateUnit = this._getUnitConfig('effects', 'rotate');
        const rotateUnitValue = !this._hasLocalOverride('effects', 'rotate') && rotateComputed.unit && rotateUnit?.units?.includes(rotateComputed.unit) ? rotateComputed.unit : rotateUnit?.unit;
        const opacityBase = this._getResolvedValue(effects.opacity, 1);
        const opacityValue = this._hasLocalOverride('effects', 'opacity') ? opacityBase : (opacityComputed.value ?? opacityBase);
        const rotateBase = this._getResolvedValue(effects.rotate, 0);
        const rotateValue = this._hasLocalOverride('effects', 'rotate') ? rotateBase : (rotateComputed.value ?? rotateBase);

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('effects')}>
                    <span class="section-title">
                        <span>Effects</span>
                        ${this._sectionHasInlineOverrides('effects') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('effects', 'opacity', 'Opacity', html`
                        <sm-slider-input
                                .value=${opacityValue ?? 1}
                                min="0"
                                max="1"
                                step="0.01"
                                @change=${(e: CustomEvent) => this._handlePropertyChange('effects', 'opacity', e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow('effects', 'rotate', 'Rotate', html`
                        <sm-slider-input
                                .value=${rotateValue ?? 0}
                                min="0"
                                max="360"
                                step="1"
                                unit="${rotateUnitValue ?? 'deg'}"
                                .units=${rotateUnit?.units ?? ['deg']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('effects', 'rotate', e.detail.value, e.detail.unit)}
                        ></sm-slider-input>
                    `)}
                </div>
            </div>
        `;
    }

    protected _renderSvgSection() {
        if (!this._isSectionVisible('svg')) return nothing;

        const svgStyles = this.resolvedStyles.svg || {};
        const isExpanded = this.expandedSections.has('svg');
        const strokeWidthUnit = this._getUnitConfig('svg', 'strokeWidth');
        const dashOffsetUnit = this._getUnitConfig('svg', 'strokeDashoffset');
        const strokeWidthComputed = this._getComputedNumberValue('svg', 'strokeWidth');
        const dashOffsetComputed = this._getComputedNumberValue('svg', 'strokeDashoffset');
        const miterLimitComputed = this._getComputedNumberValue('svg', 'strokeMiterlimit');
        const strokeOpacityComputed = this._getComputedNumberValue('svg', 'strokeOpacity');
        const fillOpacityComputed = this._getComputedNumberValue('svg', 'fillOpacity');
        const strokeWidthUnitValue = strokeWidthComputed.unit && strokeWidthUnit?.units?.includes(strokeWidthComputed.unit) ? strokeWidthComputed.unit : strokeWidthUnit?.unit;
        const dashOffsetUnitValue = dashOffsetComputed.unit && dashOffsetUnit?.units?.includes(dashOffsetComputed.unit) ? dashOffsetComputed.unit : dashOffsetUnit?.unit;
        const strokeOpacityBase = this._getResolvedValue(svgStyles.strokeOpacity, 1);
        const strokeOpacityValue = this._hasLocalOverride('svg', 'strokeOpacity') ? strokeOpacityBase : (strokeOpacityComputed.value ?? strokeOpacityBase);
        const fillOpacityBase = this._getResolvedValue(svgStyles.fillOpacity, 1);
        const fillOpacityValue = this._hasLocalOverride('svg', 'fillOpacity') ? fillOpacityBase : (fillOpacityComputed.value ?? fillOpacityBase);
        const strokeHelperText = this._getCurrentValueText('svg', 'stroke');
        const fillHelperText = this._getCurrentValueText('svg', 'fill');
        const strokeLinecapHelperText = this._getCurrentValueText('svg', 'strokeLinecap');
        const strokeLinejoinHelperText = this._getCurrentValueText('svg', 'strokeLinejoin');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('svg')}>
                    <span class="section-title">
                        <span>SVG</span>
                        ${this._sectionHasInlineOverrides('svg') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('svg', 'stroke', 'Stroke Color', html`
                        <sm-color-input
                                .value=${this._getResolvedValue(svgStyles.stroke, '')}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'stroke', e.detail.value)}
                        ></sm-color-input>
                    `, {helperText: strokeHelperText})}
                    ${this._renderPropertyRow('svg', 'strokeWidth', 'Stroke Width', html`
                        <sm-number-input
                                .value=${this._getUserValue('svg', 'strokeWidth')}
                                .placeholder=${this._getCurrentValueText('svg', 'strokeWidth')}
                                .default=${strokeWidthComputed.value ?? 0}
                                min="0"
                                step="1"
                                unit="${strokeWidthUnitValue ?? 'px'}"
                                .units=${strokeWidthUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'strokeWidth', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('svg', 'strokeLinecap', 'Line Cap', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(svgStyles.strokeLinecap)}
                                .options=${[
                                    {label: 'Butt', value: 'butt'},
                                    {label: 'Round', value: 'round'},
                                    {label: 'Square', value: 'square'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'strokeLinecap', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: strokeLinecapHelperText})}
                    ${this._renderPropertyRow('svg', 'strokeLinejoin', 'Line Join', html`
                        <sm-select-input
                                .value=${this._getResolvedValue(svgStyles.strokeLinejoin)}
                                .options=${[
                                    {label: 'Miter', value: 'miter'},
                                    {label: 'Round', value: 'round'},
                                    {label: 'Bevel', value: 'bevel'},
                                ]}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'strokeLinejoin', e.detail.value)}
                        ></sm-select-input>
                    `, {helperText: strokeLinejoinHelperText})}
                    ${this._renderPropertyRow('svg', 'strokeDasharray', 'Dash Array', html`
                        <sm-text-input
                                .value=${this._getUserValue('svg', 'strokeDasharray', '') ?? ''}
                                placeholder=${this._getCurrentValueText('svg', 'strokeDasharray') ?? 'e.g. 8 6'}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'strokeDasharray', e.detail.value)}
                        ></sm-text-input>
                    `)}
                    ${this._renderPropertyRow('svg', 'strokeDashoffset', 'Dash Offset', html`
                        <sm-number-input
                                .value=${this._getUserValue('svg', 'strokeDashoffset')}
                                .placeholder=${this._getCurrentValueText('svg', 'strokeDashoffset')}
                                .default=${dashOffsetComputed.value ?? 0}
                                step="1"
                                unit="${dashOffsetUnitValue ?? 'px'}"
                                .units=${dashOffsetUnit?.units ?? ['px']}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'strokeDashoffset', e.detail.value, e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow('svg', 'strokeOpacity', 'Stroke Opacity', html`
                        <sm-slider-input
                                .value=${strokeOpacityValue ?? 1}
                                min="0"
                                max="1"
                                step="0.01"
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'strokeOpacity', e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow('svg', 'fill', 'Fill Color', html`
                        <sm-color-input
                                .value=${this._getResolvedValue(svgStyles.fill, '')}
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'fill', e.detail.value)}
                        ></sm-color-input>
                    `, {helperText: fillHelperText})}
                    ${this._renderPropertyRow('svg', 'fillOpacity', 'Fill Opacity', html`
                        <sm-slider-input
                                .value=${fillOpacityValue ?? 1}
                                min="0"
                                max="1"
                                step="0.01"
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'fillOpacity', e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow('svg', 'strokeMiterlimit', 'Miter Limit', html`
                        <sm-number-input
                                .value=${this._getUserValue('svg', 'strokeMiterlimit')}
                                .placeholder=${this._getCurrentValueText('svg', 'strokeMiterlimit')}
                                .default=${miterLimitComputed.value ?? 0}
                                min="1"
                                step="1"
                                @change=${(e: CustomEvent) => this._handlePropertyChange('svg', 'strokeMiterlimit', e.detail.value)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `;
    }

    protected _renderAnimationsSection() {
        if (!this._isSectionVisible('animations')) return nothing;

        const isExpanded = this.expandedSections.has('animations');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('animations')}>
                    <span class="section-title">
                        <span>Animations</span>
                        ${this._sectionHasInlineOverrides('animations') ? html`
                            <span
                                class="section-indicator"
                                title="Inline overrides"
                                aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('animations', 'motion', 'Block motion', html`
                        <div class="animation-hint">
                            Use the animation editor to add motion to the block.
                        </div>
                    `, {showBindingToggle: false})}
                </div>
            </div>
        `;
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    // FIXME: for card this values are wrong since card element saved into registry is the builder-canvas
    // FIXME: and not the canvas element!
    protected _resetComputedStyleCache(): void {
        this.computedStyleTarget = null;
        this.computedStyle = null;
    }

    protected _getStyleTargetElement(): HTMLElement | null {
        if (!this.selectedBlock) return null;
        const element = this.documentModel.getElement(this.selectedBlock.id);
        if (!element) return null;

        if (!this.activeTargetId) {
            return element;
        }

        const renderRoot = (element as { renderRoot?: ShadowRoot | HTMLElement }).renderRoot ?? element.shadowRoot ?? element;
        const target = renderRoot?.querySelector?.(`[data-style-target="${this.activeTargetId}"]`) as HTMLElement | null;

        return target ?? element;
    }

    protected _getComputedStyleDeclaration(): CSSStyleDeclaration | null {
        const target = this._getStyleTargetElement();
        if (!target) {
            this.computedStyleTarget = null;
            this.computedStyle = null;
            return null;
        }

        if (this.computedStyleTarget !== target) {
            this.computedStyleTarget = target;
            this.computedStyle = getComputedStyle(target);
        }

        return this.computedStyle;
    }

    protected _getComputedStyleValueByCssProperty(cssProperty: string): string | undefined {
        const styles = this._getComputedStyleDeclaration();
        if (!styles) return undefined;
        const value = styles.getPropertyValue(cssProperty).trim();
        return value || undefined;
    }

    protected _getCssPropertyName(property: string): string | undefined {
        if (!property) return undefined;
        return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    }

    protected _hasLocalOverride(category: string, property: string): boolean {
        return Boolean(this.resolvedStyles[category]?.[property]?.hasLocalOverride);
    }

    protected _shouldUseComputedFallback(category: string, property: string): boolean {
        if (VIRTUAL_PROPERTIES.includes(`${category}.${property}`)) return false;
        return !this._hasLocalOverride(category, property);
    }

    protected _getComputedStyleValue(category: string, property: string): string | undefined {
        if (!this._shouldUseComputedFallback(category, property)) return undefined;
        if (category === 'spacing' && (property === 'margin' || property === 'padding')) {
            const prefix = property === 'margin' ? 'margin' : 'padding';
            const top = this._getComputedStyleValueByCssProperty(`${prefix}-top`);
            const right = this._getComputedStyleValueByCssProperty(`${prefix}-right`);
            const bottom = this._getComputedStyleValueByCssProperty(`${prefix}-bottom`);
            const left = this._getComputedStyleValueByCssProperty(`${prefix}-left`);

            if (top && right && bottom && left) {
                return `${top} ${right} ${bottom} ${left}`;
            }

            const fallback = this._getComputedStyleValueByCssProperty(prefix);
            if (fallback) return fallback;

            const parts = [top, right, bottom, left].filter(Boolean);
            return parts.length > 0 ? parts.join(' ') : undefined;
        }
        const cssProperty = this._getCssPropertyName(property);
        if (!cssProperty) return undefined;
        return this._getComputedStyleValueByCssProperty(cssProperty);
    }

    protected _getCurrentValueText(category: string, property: string): string | undefined {
        const value = this._getComputedStyleValue(category, property);
        if (!value) return undefined;
        return `Current: ${value}`;
    }

    protected _parseNumberWithUnit(value: string): { value: number; unit?: CSSUnit } | null {
        const token = value.trim().split(/\s+/)[0];
        const match = token.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
        if (!match) return null;

        const numeric = parseFloat(match[1]);
        if (Number.isNaN(numeric)) return null;

        const unit = match[2] ? (match[2] as CSSUnit) : undefined;
        return {value: numeric, unit};
    }

    protected _getComputedNumberValue(
        category: string,
        property: string
    ): { value?: number; unit?: CSSUnit; text?: string } {
        if (!this._shouldUseComputedFallback(category, property)) return {};

        const propertyKey = `${category}.${property}`;
        if (propertyKey === 'typography.lineHeight') {
            const lineHeightRaw = this._getComputedStyleValueByCssProperty('line-height');
            const fontSizeRaw = this._getComputedStyleValueByCssProperty('font-size');
            if (!lineHeightRaw || !fontSizeRaw) return {};

            const lineHeightValue = this._parseNumberWithUnit(lineHeightRaw);
            const fontSizeValue = this._parseNumberWithUnit(fontSizeRaw);
            if (!lineHeightValue?.value || !fontSizeValue?.value) return {};

            return {
                value: lineHeightValue.value / fontSizeValue.value,
                text: lineHeightRaw,
            };
        }

        const raw = this._getComputedStyleValue(category, property);
        if (!raw) return {};

        const normalized = raw.trim().toLowerCase();
        if (normalized === 'none' || normalized === 'normal') {
            return {value: 0, text: raw};
        }

        const parsed = this._parseNumberWithUnit(raw);
        if (!parsed) return {text: raw};

        return {value: parsed.value, unit: parsed.unit, text: raw};
    }

    protected _getUserValue<T>(
        category: string,
        property: string,
        defaultValue?: T
    ): T | undefined {
        if (!this._hasLocalOverride(category, property)) return undefined;
        return this._getResolvedValue(this.resolvedStyles[category]?.[property], defaultValue);
    }

    protected _renderPropertyRow(
        category: string,
        property: string,
        label: string,
        inputTemplate: ReturnType<typeof html>,
        options: { showBindingToggle?: boolean; showAnimationToggle?: boolean; helperText?: string } = {}
    ) {
        if (!this._isPropertyVisible(category, property)) {
            return nothing;
        }
        const resolved = this.resolvedStyles[category]?.[property];
        const {showBindingToggle = true, showAnimationToggle = true, helperText} = options;

        return html`
            <property-row
                    .hass=${this.hass}
                    .label=${label}
                    .property=${property}
                    .category=${category}
                    .origin=${resolved?.origin || 'default'}
                    .presetName=${resolved?.presetId ? this._getPresetName(resolved.presetId) : undefined}
                    .originContainer=${resolved?.originContainer}
                    .hasLocalOverride=${resolved?.hasLocalOverride || false}
                    .binding=${resolved?.binding}
                    .animation=${resolved?.animation}
                    .resolvedValue=${resolved?.value}
                    .resolvedUnit=${resolved?.unit}
                    .helperText=${helperText}
                    .defaultEntityId=${this.defaultEntityId}
                    .showBindingToggle=${showBindingToggle}
                    .showAnimationToggle=${showAnimationToggle}
                    @property-binding-change=${(e: CustomEvent) => this._handleBindingChange(e.detail.category, e.detail.property, e.detail.binding, e.detail.unit)}
                    @property-binding-edit=${this._handleBindingEdit}
                    @property-animation-change=${(e: CustomEvent) => this._handleAnimationChange(e.detail.category, e.detail.property, e.detail.animation)}
                    @property-animation-edit=${this._handleAnimationEdit}
                    @property-reset=${(e: CustomEvent) => this._handlePropertyReset(e.detail.category, e.detail.property)}
            >
                ${inputTemplate}
            </property-row>
        `;
    }

    protected _renderBindingEditorOverlay() {
        if (!this.bindingEditorTarget) return nothing;

        const {category, property, label} = this.bindingEditorTarget;
        const binding = this.resolvedStyles[category]?.[property]?.binding;
        const valueInputConfig = this._getBindingValueInputConfig(category, property);

        return html`
            <property-binding-editor-overlay
                .open=${this.bindingEditorOpen}
                .hass=${this.hass}
                .label=${label}
                .category=${category}
                .block=${this.selectedBlock}
                .propertyName=${property}
                .binding=${binding}
                .defaultEntityId=${this.defaultEntityId}
                .slots=${this.slots}
                .valueInputConfig=${valueInputConfig}
                @property-binding-change=${(e: CustomEvent) =>
                        this._handleBindingChange(e.detail.category, e.detail.property, e.detail.binding, e.detail.unit)}
                @overlay-close=${() => this._closeBindingEditor()}
            ></property-binding-editor-overlay>
        `;
    }

    protected _renderAnimationEditorOverlay() {
        if (!this.animationEditorTarget) return nothing;

        const {property, label} = this.animationEditorTarget;

        return html`
            <property-animation-editor-overlay
                .open=${this.animationEditorOpen}
                .label=${label}
                .propertyName=${property}
                @property-animation-change=${(e: CustomEvent) => this._handleAnimationChange(e.detail.category, e.detail.property, e.detail.animation)}
                @overlay-close=${() => this._closeAnimationEditor()}
            ></property-animation-editor-overlay>
        `;
    }

    protected _getBindingValueInputConfig(
        category: string,
        property: string
    ): BindingValueInputConfig | undefined {
        const propertyKey = `${category}.${property}`;
        const unitConfig = this._getUnitConfig(category, property);

        switch (propertyKey) {
            case 'layout.display':
                return {
                    type: 'select',
                    options: [
                        {label: 'Block', value: 'block'},
                        {label: 'Flex', value: 'flex'},
                        {label: 'Grid', value: 'grid'},
                        {label: 'Inline', value: 'inline'},
                        {label: 'Inline Block', value: 'inline-block'},
                        {label: 'Inline Flex', value: 'inline-flex'},
                        {label: 'None', value: 'none'},
                    ],
                };
            case 'layout.positionX':
            case 'layout.positionY': {
                const layoutData = this.getLayoutData();
                const positionUnit = (layoutData?.positionConfig.unitSystem ?? 'px') as CSSUnit;
                return {
                    type: 'number',
                    step: 1,
                    unit: positionUnit,
                    units: [positionUnit],
                };
            }
            case 'layout.zIndex':
                return {type: 'number', min: 0, step: 1};
            case 'size.width':
            case 'size.height':
                return {
                    type: 'number',
                    min: 1,
                    step: 1,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'size.minWidth':
            case 'size.maxWidth':
            case 'size.minHeight':
            case 'size.maxHeight':
                return {
                    type: 'number',
                    min: 0,
                    step: 1,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'spacing.margin':
            case 'spacing.padding':
                return {
                    type: 'spacing',
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'typography.fontFamily':
                return {
                    type: 'select',
                    options: [
                        {label: 'Arial', value: 'Arial, sans-serif'},
                        {label: 'Helvetica', value: 'Helvetica, sans-serif'},
                        {label: 'Times New Roman', value: '"Times New Roman", serif'},
                        {label: 'Georgia', value: 'Georgia, serif'},
                        {label: 'Courier New', value: '"Courier New", monospace'},
                        {label: 'Verdana', value: 'Verdana, sans-serif'},
                    ],
                };
            case 'typography.fontSize':
                return {
                    type: 'slider',
                    min: 8,
                    max: 72,
                    step: 1,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'typography.fontWeight':
                return {
                    type: 'select',
                    options: [
                        {label: 'Thin (100)', value: '100'},
                        {label: 'Light (300)', value: '300'},
                        {label: 'Normal (400)', value: '400'},
                        {label: 'Medium (500)', value: '500'},
                        {label: 'Semi-Bold (600)', value: '600'},
                        {label: 'Bold (700)', value: '700'},
                        {label: 'Extra-Bold (800)', value: '800'},
                    ],
                };
            case 'typography.lineHeight':
                return {type: 'slider', min: 0.5, max: 3, step: 0.1};
            case 'typography.textAlign':
                return {
                    type: 'select',
                    options: [
                        {label: 'Left', value: 'left'},
                        {label: 'Center', value: 'center'},
                        {label: 'Right', value: 'right'},
                        {label: 'Justify', value: 'justify'},
                    ],
                };
            case 'typography.color':
            case 'background.backgroundColor':
            case 'border.borderColor':
                return {type: 'color'};
            case 'background.backgroundImage':
                return {
                    type: 'text',
                    placeholder: 'https://... or linear-gradient(...)',
                };
            case 'background.backgroundSize':
                return {
                    type: 'text',
                    placeholder: 'cover | contain | 100% 100%',
                };
            case 'background.backgroundPosition':
                return {
                    type: 'text',
                    placeholder: 'center | 50% 50%',
                };
            case 'background.backgroundRepeat':
                return {
                    type: 'select',
                    options: BACKGROUND_REPEAT_OPTIONS,
                };
            case 'border.borderWidth':
            case 'border.borderRadius':
                return {
                    type: 'number',
                    min: 0,
                    step: 1,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'border.borderStyle':
                return {
                    type: 'select',
                    options: [
                        {label: 'None', value: 'none'},
                        {label: 'Solid', value: 'solid'},
                        {label: 'Dashed', value: 'dashed'},
                        {label: 'Dotted', value: 'dotted'},
                        {label: 'Double', value: 'double'},
                    ],
                };
            case 'svg.stroke':
            case 'svg.fill':
                return {type: 'color'};
            case 'svg.strokeWidth':
            case 'svg.strokeDashoffset':
                return {
                    type: 'number',
                    min: 0,
                    step: 1,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'svg.strokeLinecap':
                return {
                    type: 'select',
                    options: [
                        {label: 'Butt', value: 'butt'},
                        {label: 'Round', value: 'round'},
                        {label: 'Square', value: 'square'},
                    ],
                };
            case 'svg.strokeLinejoin':
                return {
                    type: 'select',
                    options: [
                        {label: 'Miter', value: 'miter'},
                        {label: 'Round', value: 'round'},
                        {label: 'Bevel', value: 'bevel'},
                    ],
                };
            case 'svg.strokeDasharray':
                return {
                    type: 'text',
                    placeholder: 'e.g. 8 6',
                };
            case 'svg.strokeOpacity':
            case 'svg.fillOpacity':
                return {type: 'slider', min: 0, max: 1, step: 0.01};
            case 'svg.strokeMiterlimit':
                return {type: 'number', min: 1, step: 1};
            case 'effects.opacity':
                return {type: 'slider', min: 0, max: 1, step: 0.01};
            case 'flex.flexDirection':
                return {
                    type: 'select',
                    options: [
                        {label: 'Row', value: 'row'},
                        {label: 'Row Reverse', value: 'row-reverse'},
                        {label: 'Column', value: 'column'},
                        {label: 'Column Reverse', value: 'column-reverse'},
                    ],
                };
            case 'flex.justifyContent':
                return {
                    type: 'select',
                    options: [
                        {label: 'Start', value: 'flex-start'},
                        {label: 'Center', value: 'center'},
                        {label: 'End', value: 'flex-end'},
                        {label: 'Space Between', value: 'space-between'},
                        {label: 'Space Around', value: 'space-around'},
                    ],
                };
            case 'flex.alignItems':
                return {
                    type: 'select',
                    options: [
                        {label: 'Start', value: 'flex-start'},
                        {label: 'Center', value: 'center'},
                        {label: 'End', value: 'flex-end'},
                        {label: 'Stretch', value: 'stretch'},
                    ],
                };
            case 'flex.rowGap':
            case 'flex.columnGap':
                return {
                    type: 'number',
                    min: 0,
                    step: 1,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            default:
                return undefined;
        }
    }

    protected _getResolvedValue<T>(resolved: ResolvedValue | undefined, defaultValue: T | undefined = undefined): T | undefined {
        if (!resolved || resolved.value === undefined) {
            return defaultValue;
        }
        return resolved.value as T;
    }

    protected _updateBackgroundImageMode(forceReset: boolean): void {
        if (forceReset && !this.selectedBlock) {
            this.backgroundImageMode = 'none';
            return;
        }
        const value = this.resolvedStyles.background?.backgroundImage?.value;
        const raw = typeof value === 'string' ? value.trim() : '';

        if (!raw) {
            if (forceReset) {
                this.backgroundImageMode = 'none';
            }
            return;
        }

        const nextMode = this._getBackgroundImageMode(raw);
        if (nextMode !== this.backgroundImageMode) {
            this.backgroundImageMode = nextMode;
        }
    }

    protected _getBackgroundImageMode(value: string): BackgroundImageMode {
        const raw = value.trim();
        if (!raw || raw === 'none') return 'none';

        const unwrapped = this._extractBackgroundImageUrl(raw);
        if (isManagedMediaReference(unwrapped)) return 'media';

        const lower = raw.toLowerCase();
        if (lower.includes('gradient(')) return 'gradient';
        if (lower.startsWith('url(') || this._looksLikeUrl(raw)) return 'image';
        return 'custom';
    }

    protected _looksLikeUrl(value: string): boolean {
        if (/^(https?:\/\/|data:|\/)/i.test(value)) return true;
        return /^[^()\s]+\.[a-z0-9]{2,}$/i.test(value);
    }

    protected _extractBackgroundImageUrl(value: string): string {
        const raw = value.trim();
        if (!raw) return '';
        const match = raw.match(/^url\((.*)\)$/i);
        if (!match) return raw;

        let inner = match[1].trim();
        if (
            (inner.startsWith('"') && inner.endsWith('"'))
            || (inner.startsWith("'") && inner.endsWith("'"))
        ) {
            inner = inner.slice(1, -1);
        }
        return inner;
    }

    protected _getBackgroundSizePreset(value: string): string {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'auto' || normalized === 'auto auto') {
            return 'auto';
        }
        if (normalized === 'cover' || normalized === 'contain') {
            return normalized;
        }
        return BACKGROUND_CUSTOM_VALUE;
    }

    protected _getBackgroundPositionPreset(value: string): string {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'center center') {
            return 'center';
        }
        const alias = BACKGROUND_POSITION_ALIASES[normalized];
        if (alias) {
            return alias;
        }
        const match = BACKGROUND_POSITION_OPTIONS.find(
            (option) => option.value !== BACKGROUND_CUSTOM_VALUE && option.value === normalized
        );
        return match ? match.value : BACKGROUND_CUSTOM_VALUE;
    }

    protected _parseLengthToken(token: string | undefined, fallback: LengthValue): LengthValue {
        if (!token) return fallback;
        const match = token.trim().match(/^(-?\d+(?:\.\d+)?)([a-z%]*)$/i);
        if (!match) return fallback;

        const value = Number(match[1]);
        if (!Number.isFinite(value)) return fallback;

        const unit = (match[2] || fallback.unit) as CSSUnit;
        if (!BACKGROUND_LENGTH_UNITS.includes(unit)) {
            return {value, unit: fallback.unit};
        }

        return {value, unit};
    }

    protected _parseLengthPair(value: string, fallback: LengthPair): LengthPair {
        const tokens = value.trim().split(/\s+/).filter(Boolean);
        const first = tokens[0];
        const second = tokens[1] ?? tokens[0];

        return {
            x: this._parseLengthToken(first, fallback.x),
            y: this._parseLengthToken(second, fallback.y),
        };
    }

    protected _formatLengthPair(pair: LengthPair): string {
        return `${pair.x.value}${pair.x.unit} ${pair.y.value}${pair.y.unit}`;
    }

    protected _handleBackgroundLengthPairChange(
        property: 'backgroundSize' | 'backgroundPosition',
        axis: 'x' | 'y',
        value: number,
        unit: CSSUnit | undefined,
        pair: LengthPair
    ): void {
        const nextPair: LengthPair = {
            x: axis === 'x' ? {value, unit: unit ?? pair.x.unit} : pair.x,
            y: axis === 'y' ? {value, unit: unit ?? pair.y.unit} : pair.y,
        };

        this._handlePropertyChange('background', property, this._formatLengthPair(nextPair));
    }

    protected _handleBackgroundImageModeChange(
        mode: BackgroundImageMode,
        currentValue: string
    ): void {
        this.backgroundImageMode = mode;

        if (mode === 'none') {
            this._handlePropertyChange('background', 'backgroundImage', 'none');
            return;
        }

        const currentMode = this._getBackgroundImageMode(currentValue);
        if (mode === 'media') {
            if (currentMode !== 'media') {
                this._handlePropertyChange('background', 'backgroundImage', '');
            }
            const currentReference = this._extractBackgroundImageUrl(currentValue);
            if (!isManagedMediaReference(currentReference)) {
                this._openMediaManagerForBackgroundImage();
            }
            return;
        }

        if (mode === 'gradient') {
            if (currentMode !== 'gradient') {
                this._handlePropertyChange(
                    'background',
                    'backgroundImage',
                    'linear-gradient(180deg, #000000, #ffffff)'
                );
            }
            return;
        }

        if (mode === 'image') {
            if (currentMode !== 'image') {
                this._handlePropertyChange('background', 'backgroundImage', '');
            }
            return;
        }

        if (mode === 'custom' && currentMode !== 'custom') {
            this._handlePropertyChange('background', 'backgroundImage', '');
        }
    }

    protected _openMediaManagerForBackgroundImage = (): void => {
        if (!this.eventBus) return;
        const requestId = `bg-media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.pendingMediaRequestId = requestId;
        this.eventBus.dispatchEvent('media-manager-open', {
            mode: 'select',
            requestId,
            title: 'Select image',
            subtitle: 'Choose or upload a background media',
            confirmLabel: 'Use image',
        });
    };

    protected _clearBackgroundMedia = (): void => {
        this.pendingMediaRequestId = null;
        this.backgroundImageMode = 'media';
        this._handlePropertyChange('background', 'backgroundImage', '');
    };

    protected _handleBackgroundSizePresetChange(
        preset: string,
        currentPreset: string
    ): void {
        if (preset === BACKGROUND_CUSTOM_VALUE) {
            if (currentPreset !== BACKGROUND_CUSTOM_VALUE) {
                const fallback: LengthPair = {
                    x: {value: 100, unit: '%'},
                    y: {value: 100, unit: '%'},
                };
                this._handlePropertyChange('background', 'backgroundSize', this._formatLengthPair(fallback));
            }
            return;
        }

        this._handlePropertyChange('background', 'backgroundSize', preset);
    }

    protected _handleBackgroundPositionPresetChange(
        preset: string,
        currentPreset: string
    ): void {
        if (preset === BACKGROUND_CUSTOM_VALUE) {
            if (currentPreset !== BACKGROUND_CUSTOM_VALUE) {
                const fallback: LengthPair = {
                    x: {value: 50, unit: '%'},
                    y: {value: 50, unit: '%'},
                };
                this._handlePropertyChange('background', 'backgroundPosition', this._formatLengthPair(fallback));
            }
            return;
        }

        this._handlePropertyChange('background', 'backgroundPosition', preset);
    }

    protected _handleAnimationChange(
        _category: string,
        _property: string,
        _animation: unknown
    ): void {}

    protected _handleAnimationEdit(e: CustomEvent): void {
        const {category, property, label} = e.detail;
        this.animationEditorTarget = {category, property, label};
        this.animationEditorOpen = true;
    }

    protected _closeAnimationEditor(clearTarget = false): void {
        this.animationEditorOpen = false;
        if (clearTarget) {
            this.animationEditorTarget = null;
        }
    }

    protected _getUnitConfig(
        category: string,
        property: string
    ): { unit: CSSUnit; units: CSSUnit[] } | null {
        const units = getUnitsForProperty(category, property);
        if (!units || units.length === 0) return null;

        const resolvedUnit = this.resolvedStyles[category]?.[property]?.unit;
        const defaultUnit = getDefaultUnitForProperty(category, property) ?? units[0];
        const unit = resolvedUnit && units.includes(resolvedUnit) ? resolvedUnit : defaultUnit;

        return {unit, units};
    }

    protected _getPositionDisplayValue(
        axis: 'x' | 'y',
        positionConfig: PositionConfig
    ): number | undefined {
        const hasPositionConfig = Boolean(this.resolvedStyles._internal?.position_config?.value);
        if (hasPositionConfig) {
            return axis === 'x' ? positionConfig.x : positionConfig.y;
        }

        const layout = this.resolvedStyles.layout || {};
        const fallback = axis === 'x' ? positionConfig.x : positionConfig.y;
        return this._getResolvedValue(
            axis === 'x' ? layout.positionX : layout.positionY,
            fallback
        );
    }

    protected _getPresetName(presetId: string): string | undefined {
        const preset = this.presets.find(p => p.id === presetId);
        return preset?.name;
    }

    protected _sectionHasInlineOverrides(section: PropertyGroupId): boolean {
        const groups = this._getSectionGroups(section);

        return groups.some((groupId) => {
            const properties = GROUP_PROPERTIES[groupId] || [];
            return properties.some((propertyKey) => {
                if (!this._isPropertyKeyVisible(propertyKey)) return false;
                const separatorIndex = propertyKey.indexOf('.');
                if (separatorIndex === -1) return false;
                const category = propertyKey.slice(0, separatorIndex);
                const property = propertyKey.slice(separatorIndex + 1);
                return Boolean(this.resolvedStyles[category]?.[property]?.hasLocalOverride);
            });
        });
    }

    protected _getSectionGroups(section: PropertyGroupId): PropertyGroupId[] {
        if (section === 'layout') {
            return ['layout', 'flex'];
        }
        return [section];
    }

    protected _isSectionVisible(section: string): boolean {
        // If no visibility config, show all sections
        if (!this.visibleProperties) return true;
        const groupId = section as PropertyGroupId;
        if (!this.visibleProperties.groups.has(groupId)) return false;

        const properties = GROUP_PROPERTIES[groupId] || [];
        return properties.some((propertyKey) => this._isPropertyKeyVisible(propertyKey));
    }

    protected _isPropertyVisible(category: string, property: string): boolean {
        const propertyKey = `${category}.${property}`;
        return this._isPropertyKeyVisible(propertyKey);
    }

    protected _isPropertyKeyVisible(propertyKey: string): boolean {
        if (!this.visibleProperties) return true;
        return this.visibleProperties.properties.has(propertyKey)
            && !this.visibleProperties.excludedProperties.has(propertyKey);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'panel-style': PanelStyles;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('panel-styles', PanelStyles);
