import { BaseEntity } from '@/common/blocks/components/entities/base-entity';
import type { PropertyGroup, TraitPropertyValue } from '@/common/blocks/core/properties';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig, BlockPanelTargetStyles } from '@/common/blocks/types';
import type { BlockUpdatedDetail } from '@/common/core/model';
import type { LinkEditorSelection, LinkModeState } from '@/common/core/model/types';
import { buildEntityTemplateVariables, DEFAULT_ENTITY_TEMPLATE_KEYWORDS, TEMPLATE_GENERIC_ERROR } from '@/common/core/template/ha-template-service';
import { css, svg, nothing, type PropertyValues } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import type { LinkAnchorPoint, LinkPoint, LinkSegment } from '@/common/blocks/components/advanced/block-link/link-types';
import { clampNormalized, ensureSegments, normalizePoint } from '@/common/blocks/components/advanced/block-link/link-utils';
import type { LinkModeController } from '@/panel/designer/components/editors/link-editor/link-mode-controller';
import { linkModeControllerContext } from '@/panel/designer/components/editors/link-editor/link-mode-controller';
import {
    DEFAULT_LINK_EDITOR_PREFERENCES,
    linkEditorPreferencesContext,
    type LinkEditorPreferences,
} from '@/panel/designer/components/editors/link-editor/link-editor-preferences';
import type {
    LinkAnimationContext,
    LinkAnimationPanelConfig,
    LinkAnimationPropResolver,
    LinkFlowDirection
} from './animations/link-animation-base';
import type { LinkAnimationBase, LinkAnimationContextConfig } from './animations/link-animation-base';

const DEFAULT_ANIMATION = 'particle';

const SPEED_PRESETS: Record<string, string> = {
    linear: '{{ value | abs }}',
    slow: '{{ (value | abs) / 3 }}',
    fast: '{{ (value | abs) * 2 }}',
};

const DEFAULT_POINT_RADIUS = 5;
const DEFAULT_HANDLE_RADIUS = 5;

export interface LinkAnimationConfig {
    id: string;
    label: string;
    factory: () => LinkAnimationBase<Record<string, any>>;
}

@customElement('block-link')
export class BlockLink extends BaseEntity {
    private static animationRegistry = new Map<string, LinkAnimationConfig>();

    static styles = [
        ...BaseEntity.styles,
        css`
            :host {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                padding: 0;
                pointer-events: none;
                --link-line-color: var(--text-secondary, rgba(0, 0, 0, 0.35));
                --link-flow-color: var(--accent-color, rgba(33, 150, 243, 0.95));
                --link-line-width: 4px;
            }

            :host(.editing-active.editing-mode-draw) {
                pointer-events: auto;
            }

            svg {
                width: 100%;
                height: 100%;
                display: block;
                pointer-events: none;
            }

            .link-path {
                fill: none;
                vector-effect: non-scaling-stroke;
                pointer-events: visibleStroke;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .link-line {
                stroke: var(--link-line-color);
                stroke-width: var(--link-line-width);
            }

            .link-line.move-enabled {
                cursor: move;
            }

            .link-line.selected {
                stroke: var(--link-line-selected-color, var(--accent-color, #0078d4));
            }

            .link-grid {
                pointer-events: none;
            }

            .link-grid line {
                stroke-width: 1px;
                vector-effect: non-scaling-stroke;
            }

            .link-snap-guides {
                pointer-events: none;
            }

            .link-snap-guides line {
                stroke: var(--accent-color, #0078d4);
                stroke-width: 1px;
                stroke-dasharray: 4 4;
                vector-effect: non-scaling-stroke;
            }

            .link-element-no-pointer {
                pointer-events: none;
            }

            .link-node,
            .link-handle {
                pointer-events: all;
                cursor: pointer;
                vector-effect: non-scaling-stroke;
            }

            .link-node {
                fill: #ffffff;
                stroke: #000000;
                stroke-width: 1px;
            }

            .link-node.selected {
                fill: #ff4081;
            }

            .link-node.anchored {
                fill: #ffc107;
            }

            .handle-line {
                stroke: #aaa;
                stroke-width: 2px;
            }

            .link-handle {
                fill: #ffffff;
                stroke: #2196f3;
                stroke-width: 1px;
            }

            .link-handle.selected {
                fill: #ff4081;
                stroke: #8d0734;
            }

        `,
    ];

    @state() private linkModeState: LinkModeState | null = null;
    @state() private linkEditorSelection: LinkEditorSelection | null = null;
    @state() private previewPoint: { x: number; y: number } | null = null;
    @state() private snapGuide: { x?: { x: number; y1: number; y2: number }; y?: { y: number; x1: number; x2: number } } | null = null;
    @state() private pathLength = 0;
    @state() private gridColor = '#000000';

    @query('path.link-line') private linePath?: SVGPathElement;

    private animation: LinkAnimationBase<LinkAnimationContextConfig> | null = null;
    private animationId: string | null = null;
    private lastAnimationContext: LinkAnimationContext<LinkAnimationContextConfig> | null = null;

    private blockUpdateListener?: (e: Event) => void;

    @consume({context: linkModeControllerContext})
    private linkModeController?: LinkModeController;

    @consume({context: linkEditorPreferencesContext, subscribe: true})
    private linkEditorPreferences: LinkEditorPreferences = {...DEFAULT_LINK_EDITOR_PREFERENCES};

    static registerAnimation(id: string, config: LinkAnimationConfig): void {
        this.animationRegistry.set(id, config);
    }

    private getAnimation(styleId: string): LinkAnimationBase<LinkAnimationContextConfig> | null {
        const config = BlockLink.animationRegistry.get(styleId);
        if (!config) return null;

        if (!this.animation || this.animationId !== styleId) {
            this.animation?.destroy();
            this.animation = config.factory();
            this.animationId = styleId;
        }

        return this.animation;
    }

    private getAnimationPanelConfig(styleId: string): LinkAnimationPanelConfig | null {
        const animation = this.getAnimation(styleId);
        return animation?.getPanelConfig?.() ?? null;
    }

    private getAnimationTargetIds(styleId: string): string[] {
        const animationConfig = this.getAnimationPanelConfig(styleId);
        if (!animationConfig?.targetStyles) return [];
        return Object.keys(animationConfig.targetStyles);
    }

    private getAnimationResolvedProps(styleId: string): Record<string, unknown> {
        const animation = this.getAnimation(styleId);
        if (!animation?.getResolvedProps) return {};

        const resolver: LinkAnimationPropResolver = {
            resolveString: (name, fallback) => this.resolveProperty(name, fallback),
            resolveNumber: (name, fallback) => this.resolvePropertyAsNumber(name, fallback),
            resolveBoolean: (name, fallback = false) => this.resolvePropertyAsBoolean(name, fallback),
        };

        return animation.getResolvedProps(resolver);
    }

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Link',
                icon: '<ha-icon icon="mdi:vector-line"></ha-icon>',
                internal: true,
            },
            defaults: {
                canChangeLayoutMode: false,
                canBeDuplicated: true,
                requireEntity: true,
                props: {
                    points: [],
                    segments: [],
                    renderStyle: {value: DEFAULT_ANIMATION},
                    flowEnabled: {value: true},
                    flowDirectionPositive: {value: 'forward'},
                    speedPreset: {value: 'linear'},
                    speedTemplate: {value: SPEED_PRESETS.linear},
                    speedSource: {value: 'state'},
                    speedAttribute: {value: ''},
                    smoothingEnabled: {value: false},
                    smoothingTension: {value: 0.15},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        const resolvedBlock = this.block ? this.documentModel.getBlock(this.block.id) ?? this.block : this.block;
        const renderStyleValue = resolvedBlock?.props?.renderStyle as TraitPropertyValue | undefined;
        const renderStyleId = renderStyleValue?.value !== undefined
            ? String(renderStyleValue.value)
            : this.resolveProperty('renderStyle', DEFAULT_ANIMATION);
        const animationConfig = this.getAnimationPanelConfig(renderStyleId);
        const animationGroups = animationConfig?.properties?.groups ?? [];
        const animationTargets = animationConfig?.targetStyles ?? {};

        const baseGroups: PropertyGroup[] = [
            {
                id: 'link-editor',
                label: 'Link Editor',
                traits: [
                    {
                        type: 'action',
                        name: 'editLink',
                        label: 'Link Editor',
                        buttonLabel: 'Edit Link',
                        actionId: 'open-link-editor',
                        icon: '⇢',
                    },
                ],
            },
            {
                id: 'rendering',
                label: 'Rendering',
                traits: [
                    {
                        type: 'select',
                        name: 'renderStyle',
                        label: 'Style',
                        options: Array
                            .from(BlockLink.animationRegistry.values())
                            .map(({id, label}) => ({value: id, label})),
                    },
                ],
            },
        ];

        const flowGroup: PropertyGroup = {
            id: 'flow',
            label: 'Flow',
            traits: [
                {
                    type: 'checkbox',
                    name: 'flowEnabled',
                    label: 'Enable Animation',
                },
                {
                    type: 'select',
                    name: 'flowDirectionPositive',
                    label: 'Positive Direction',
                    options: [
                        {value: 'forward', label: 'Start → End'},
                        {value: 'reverse', label: 'End → Start'},
                    ],
                },
                {
                    type: 'select',
                    name: 'speedPreset',
                    label: 'Speed Preset',
                    options: [
                        {value: 'linear', label: 'Linear'},
                        {value: 'slow', label: 'Slow'},
                        {value: 'fast', label: 'Fast'},
                        {value: 'custom', label: 'Custom'},
                    ],
                },
                {
                    type: 'textarea',
                    name: 'speedTemplate',
                    label: 'Custom Formula',
                    rows: 3,
                    placeholder: '{{ value }}',
                    templateKeywords: DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
                    visible: {
                        prop: 'speedPreset',
                        eq: 'custom',
                    },
                },
                {
                    type: 'select',
                    name: 'speedSource',
                    label: 'Value Source',
                    options: [
                        {value: 'state', label: 'Entity State'},
                        {value: 'attribute', label: 'Attribute'},
                    ],
                },
                {
                    type: 'attribute-picker',
                    name: 'speedAttribute',
                    label: 'Attribute',
                    placeholder: 'Enter attribute name',
                    visible: {
                        prop: 'speedSource',
                        eq: 'attribute',
                    },
                },
            ],
        };

        const targetStyles = {
            block: {
                styles: {
                    properties: [
                        'layout.show',
                        'layout.zIndex',
                    ],
                },
            },
            path: {
                label: 'Path',
                description: 'Base path style',
                styles: {
                    groups: ['svg'],
                    properties: [
                        'effects.opacity',
                        'effects.filter',
                    ],
                },
            },
        } as BlockPanelTargetStyles;

        if (animationGroups.length === 0 && Object.keys(animationTargets).length === 0) {
            return {
                properties: {
                    groups: [...baseGroups, flowGroup],
                },
                targetStyles,
            };
        }

        return {
            properties: {
                groups: [...baseGroups, ...animationGroups, flowGroup],
            },
            targetStyles: {
                ...targetStyles,
                ...animationTargets,
            },
        };
    }

    connectedCallback(): void {
        super.connectedCallback();

        this.linkModeState = this.documentModel.getLinkModeState();
        this.linkEditorSelection = this.documentModel.getLinkEditorSelection();
        this.gridColor = this.documentModel.getLinkGridColor();

        this.documentModel.addEventListener('link-mode-changed', this._handleLinkModeChanged);
        this.documentModel.addEventListener('link-editor-selection-changed', this._handleLinkSelectionChanged);
        this.documentModel.addEventListener('link-grid-color-changed', this._handleLinkGridColorChanged as EventListener);

        this.eventBus.addEventListener('link-preview-move', (data: { blockId: string; point: { x: number; y: number } }) => {
            if (data.blockId !== this.block?.id) return;
            this.previewPoint = data.point;
        });

        this.eventBus.addEventListener('link-preview-clear', (data: { blockId?: string }) => {
            if (data.blockId && data.blockId !== this.block?.id) return;
            this.previewPoint = null;
        });

        this.eventBus.addEventListener('link-snap-guide', (data: { blockId: string; guide: { x?: { x: number; y1: number; y2: number }; y?: { y: number; x1: number; x2: number } } }) => {
            if (data.blockId !== this.block?.id) return;
            this.snapGuide = data.guide;
        });

        this.eventBus.addEventListener('link-snap-clear', (data: { blockId?: string }) => {
            if (data.blockId && data.blockId !== this.block?.id) return;
            this.snapGuide = null;
        });

        this.blockUpdateListener = (e: Event) => {
            const detail = (e as CustomEvent<BlockUpdatedDetail>).detail;
            if (!detail?.block || !this.block) return;
            if (detail.block.id === this.block.id) return;

            const points = this.getPoints();
            const anchors = points.map((p) => p.anchor?.blockId).filter(Boolean) as string[];
            if (anchors.includes(detail.block.id)) {
                this.requestUpdate();
            }
        };

        this.documentModel.addEventListener('block-updated', this.blockUpdateListener as EventListener);
    }

    disconnectedCallback(): void {
        this.documentModel.removeEventListener('link-mode-changed', this._handleLinkModeChanged as EventListener);
        this.documentModel.removeEventListener('link-editor-selection-changed', this._handleLinkSelectionChanged as EventListener);
        this.documentModel.removeEventListener('link-grid-color-changed', this._handleLinkGridColorChanged as EventListener);
        if (this.blockUpdateListener) {
            this.documentModel.removeEventListener('block-updated', this.blockUpdateListener as EventListener);
        }

        this.animation?.destroy();
        this.animation = null;
        this.animationId = null;
        this.lastAnimationContext = null;

        super.disconnectedCallback();
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        const length = this.linePath?.getTotalLength?.();
        if (typeof length === 'number' && Number.isFinite(length)) {
            if (Math.abs(length - this.pathLength) > 0.1) {
                this.pathLength = length;
            }
        }

        this.classList.toggle('editing-active', this.isEditingActive());

        if (changedProps.has('linkModeState')) {
            this.classList.remove(`editing-mode-${changedProps.get('linkModeState')?.mode ?? 'view'}`);
            this.classList.add(`editing-mode-${this.linkModeState?.mode ?? 'view'}`);
        }

        if (this.animation && this.lastAnimationContext) {
            this.animation.update(this.lastAnimationContext);
        }
    }

    firstUpdated(changedProps: PropertyValues): void {
        super.firstUpdated(changedProps);
        if (this.animation && this.lastAnimationContext) {
            this.animation.update(this.lastAnimationContext);
        }
    }

    render() {
        if (!this.block) return nothing;
        if (!this.canvasWidth || !this.canvasHeight) return nothing;

        const normalizedPoints = this.getResolvedPoints();
        const renderScale = {
            sx: this.canvasWidth / 100,
            sy: this.canvasHeight / 100,
        };
        const points = normalizedPoints.map((point) => this.toRenderPoint(point, renderScale));
        const hasPoints = points.length > 1;

        const renderStyleId = this.resolveProperty('renderStyle', DEFAULT_ANIMATION);
        const svgClass = classMap({
            'link-svg': true,
            [`style-${renderStyleId}`]: true,
        });

        const segments = ensureSegments(this.getPoints(), this.getSegments());
        const smoothingEnabled = this.resolvePropertyAsBoolean('smoothingEnabled');
        const smoothingTension = this.resolvePropertyAsNumber('smoothingTension', 0.15);
        const flowEnabled = this.resolvePropertyAsBoolean('flowEnabled');

        const d = hasPoints ? this.buildPath(points, segments, smoothingEnabled, smoothingTension) : '';

        const lineStyle = this.buildSvgStyle(this.getTargetStyle('path'), {
            color: 'var(--link-line-color)',
            width: 'var(--link-line-width)',
        });
        const moveEnabled = this.isEditingActive() && this.linkModeState?.mode === 'edit';
        const lineClass = classMap({
            'link-path': true,
            'link-line': true,
            'move-enabled': moveEnabled,
        });
        const selectedSegmentIndex = moveEnabled ? (this.linkEditorSelection?.segmentIndex ?? null) : null;
        const selectedSegmentPath =
            selectedSegmentIndex !== null
                ? this.buildSegmentPath(points, segments, selectedSegmentIndex, smoothingEnabled, smoothingTension)
                : '';
        const selectedLineStyle = selectedSegmentPath
            ? {
                  ...lineStyle,
                  stroke: 'var(--link-line-selected-color, var(--accent-color, #0078d4))',
                  color: 'var(--link-line-selected-color, var(--accent-color, #0078d4))',
                  strokeWidth: 'calc(var(--link-line-width) + 1px)',
              }
            : null;
        const animationTargetIds = this.getAnimationTargetIds(renderStyleId);
        const animationStyles: Record<string, Record<string, string>> = {};
        for (const targetId of animationTargetIds) {
            animationStyles[targetId] = this.getTargetStyle(targetId);
        }

        const speedValue = this.resolveSpeedValue();
        const flowActive = flowEnabled && Math.abs(speedValue) > 0;
        const animation = this.getAnimation(renderStyleId);
        const animationConfig = this.getAnimationResolvedProps(renderStyleId);
        const defaultAnimationStyle = animation?.getDefaultStyle?.()?.cssText;
        const animationContext: LinkAnimationContext<LinkAnimationContextConfig> = {
              blockId: this.block.id,
              path: d,
              pathLength: this.pathLength,
              flowEnabled: flowActive,
              speedValue,
              flowDirectionPositive: this.resolveProperty('flowDirectionPositive', 'forward') as LinkFlowDirection,
              animationStyles,
              animationConfig,
          };
        this.lastAnimationContext = animationContext;


        return svg`
            <svg class=${svgClass} viewBox="0 0 ${this.canvasWidth} ${this.canvasHeight}" preserveAspectRatio="none" width="${this.canvasWidth}px" height="${this.canvasHeight}px">
                ${defaultAnimationStyle ? svg`<style>${defaultAnimationStyle}</style>` : nothing}
                ${this.renderGrid(renderScale)}
                ${this.renderSnapGuides(renderScale)}
                ${hasPoints
                    ? svg`
                        <path
                            class=${lineClass}
                            d=${d}
                            style=${styleMap(lineStyle)}
                            @pointerdown=${(e: PointerEvent) => this.linkModeController?.startPathDrag(this.block!.id, e)}
                            @contextmenu=${(e: MouseEvent) => this.linkModeController?.handleLineContextMenu(this.block!.id, e)}
                        ></path>
                        ${selectedLineStyle
                            ? svg`
                                  <path
                                      class=${classMap({
                                          'link-path': true,
                                          'link-line': true,
                                          selected: true,
                                          'link-element-no-pointer': true,
                                      })}
                                      d=${selectedSegmentPath}
                                      style=${styleMap(selectedLineStyle)}
                                  ></path>
                              `
                            : nothing}
                    `
                    : nothing}

                ${hasPoints && flowActive && animation && animationContext ? animation.render(animationContext) : nothing}

                ${this.renderEditorNodes(points, segments)}
            </svg>
        `;
    }

    protected updatePositionFromLayoutData() {
        this.style.left = '0px';
        this.style.top = '0px';
        this.style.width = '100%';
        this.style.height = '100%';
        if (this.block) {
            this.style.zIndex = String(this.block.zIndex ?? 1);
        }
    }

    private renderEditorNodes(points: LinkPoint[], segments: LinkSegment[]) {
        if (!this.block) return nothing;
        if (!this.isEditingActive()) return nothing;
        if (!this.linkEditorPreferences.showPoints) return nothing;

        const editorPoints = points.filter((point) => point.id !== 'preview');
        const pointRadius = DEFAULT_POINT_RADIUS;
        const handleRadius = DEFAULT_HANDLE_RADIUS;

        const selection = this.linkEditorSelection;
        const selectedPointId = selection?.pointId;
        const selectedHandle = selection?.handle;

        return svg`
            <g class="link-nodes link-element-no-pointer">
                ${editorPoints.map((point, index) => {
                    const isSelected = selectedPointId === point.id;
                    const anchored = Boolean(point.anchor?.blockId);
                    const nodeClass = classMap({
                        'link-node': true,
                        selected: isSelected,
                        anchored,
                    });
                    const handleOut = this.getHandlePosition(point, 'out');
                    const handleIn = this.getHandlePosition(point, 'in');

                    const showHandleOut = this.isCurveSegment(segments[index]);
                    const showHandleIn = this.isCurveSegment(segments[index - 1]);

                    return svg`
                        ${showHandleOut
                            ? svg`
                                  <line class="handle-line" x1=${point.x} y1=${point.y} x2=${handleOut.x} y2=${handleOut.y}></line>
                                  <circle
                                      class=${classMap({
                                          'link-handle': true,
                                          selected: isSelected && selectedHandle === 'out',
                                      })}
                                      cx=${handleOut.x}
                                      cy=${handleOut.y}
                                      r=${handleRadius}
                                      @pointerdown=${(e: PointerEvent) => this.linkModeController!.startHandleDrag(this.block!.id, e, point.id, 'out')}
                                  ></circle>
                              `
                            : nothing}
                        ${showHandleIn
                            ? svg`
                                  <line class="handle-line" x1=${point.x} y1=${point.y} x2=${handleIn.x} y2=${handleIn.y}></line>
                                  <circle
                                      class=${classMap({
                                          'link-handle': true,
                                          selected: isSelected && selectedHandle === 'in',
                                      })}
                                      cx=${handleIn.x}
                                      cy=${handleIn.y}
                                      r=${handleRadius}
                                      @pointerdown=${(e: PointerEvent) => this.linkModeController!.startHandleDrag(this.block!.id, e, point.id, 'in')}
                                  ></circle>
                              `
                            : nothing}
                        <circle
                            class=${nodeClass}
                            cx=${point.x}
                            cy=${point.y}
                            r=${pointRadius}
                            @pointerdown=${(e: PointerEvent) => this.linkModeController!.startPointDrag(this.block!.id, e, point.id)}
                            @contextmenu=${(e: MouseEvent) => this.linkModeController!.handlePointContextMenu(this.block!.id, e, point.id)}
                        ></circle>
                    `;
                })}
            </g>
        `;
    }

    private renderGrid(scale: { sx: number; sy: number }) {
        if (!this.isEditingActive()) return nothing;
        if (!this.linkEditorPreferences.showGrid) return nothing;

        const step = 5;
        const majorStep = 10;
        const lines = [];

        for (let i = 0; i <= 100; i += step) {
            const x = i * scale.sx;
            const y = i * scale.sy;
            const isMajor = i % majorStep === 0;

            const lineStyle = {
                stroke: this.gridColor,
                strokeOpacity: isMajor ? '0.50' : '0.25',
            };
            lines.push(svg`
                <line
                    class=${classMap({'grid-line': true, major: isMajor})}
                    x1=${x}
                    y1="0"
                    x2=${x}
                    y2=${this.canvasHeight}
                    style=${styleMap(lineStyle)}
                ></line>
            `);
            lines.push(svg`
                <line
                    class=${classMap({'grid-line': true, major: isMajor})}
                    x1="0"
                    y1=${y}
                    x2=${this.canvasWidth}
                    y2=${y}
                    style=${styleMap(lineStyle)}
                ></line>
            `);
        }

        return svg`<g class="link-grid">${lines}</g>`;
    }

    private renderSnapGuides(scale: { sx: number; sy: number }) {
        if (!this.isEditingActive()) return nothing;
        if (!this.snapGuide) return nothing;

        const lines = [];
        if (this.snapGuide.x) {
            lines.push(svg`
                <line
                    x1=${this.snapGuide.x.x * scale.sx}
                    y1=${this.snapGuide.x.y1 * scale.sy}
                    x2=${this.snapGuide.x.x * scale.sx}
                    y2=${this.snapGuide.x.y2 * scale.sy}
                ></line>
            `);
        }
        if (this.snapGuide.y) {
            lines.push(svg`
                <line
                    x1=${this.snapGuide.y.x1 * scale.sx}
                    y1=${this.snapGuide.y.y * scale.sy}
                    x2=${this.snapGuide.y.x2 * scale.sx}
                    y2=${this.snapGuide.y.y * scale.sy}
                ></line>
            `);
        }

        if (!lines.length) return nothing;
        return svg`<g class="link-snap-guides">${lines}</g>`;
    }

    private buildPath(points: LinkPoint[], segments: LinkSegment[], smoothing: boolean, tension: number): string {
        if (points.length < 2) return '';

        const start = points[0];
        let d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;

        for (let i = 0; i < points.length - 1; i += 1) {
            const current = points[i];
            const next = points[i + 1];
            const segment = segments[i];

            if (segment?.type === 'curve') {
                const cp1 = this.getHandlePosition(current, 'out');
                const cp2 = this.getHandlePosition(next, 'in');
                d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
                continue;
            }

            if (smoothing && points.length > 2) {
                const prev = points[i - 1] ?? current;
                const nextNext = points[i + 2] ?? next;
                const scale = Math.max(0, Math.min(1, 1 - tension)) / 6;

                const cp1 = {
                    x: current.x + (next.x - prev.x) * scale,
                    y: current.y + (next.y - prev.y) * scale,
                };
                const cp2 = {
                    x: next.x - (nextNext.x - current.x) * scale,
                    y: next.y - (nextNext.y - current.y) * scale,
                };

                d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
                continue;
            }

            d += ` L ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
        }

        return d;
    }

    private buildSegmentPath(
        points: LinkPoint[],
        segments: LinkSegment[],
        index: number,
        smoothing: boolean,
        tension: number
    ): string {
        if (points.length < 2) return '';
        if (index < 0 || index >= points.length - 1) return '';

        const current = points[index];
        const next = points[index + 1];
        const segment = segments[index];
        let d = `M ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;

        if (segment?.type === 'curve') {
            const cp1 = this.getHandlePosition(current, 'out');
            const cp2 = this.getHandlePosition(next, 'in');
            d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
            return d;
        }

        if (smoothing && points.length > 2) {
            const prev = points[index - 1] ?? current;
            const nextNext = points[index + 2] ?? next;
            const scale = Math.max(0, Math.min(1, 1 - tension)) / 6;

            const cp1 = {
                x: current.x + (next.x - prev.x) * scale,
                y: current.y + (next.y - prev.y) * scale,
            };
            const cp2 = {
                x: next.x - (nextNext.x - current.x) * scale,
                y: next.y - (nextNext.y - current.y) * scale,
            };

            d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
            return d;
        }

        d += ` L ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
        return d;
    }

    private resolveSpeedValue(): number {
        const speedPreset = this.resolveProperty('speedPreset', 'linear');
        const template = speedPreset === 'custom'
            ? this.resolveProperty('speedTemplate', SPEED_PRESETS.linear)
            : (SPEED_PRESETS[speedPreset] ?? SPEED_PRESETS.linear);

        const entityState = this.getEntityState();
        const speedSource = this.resolveProperty('speedSource', 'state');
        const attribute = this.resolveProperty('speedAttribute', '');

        let rawValue: unknown = entityState?.state;
        if (speedSource === 'attribute' && attribute) {
            rawValue = this.getEntityAttribute(attribute);
        }

        const numericValue = this.toNumber(rawValue);
        if (!template || template.trim() === '') {
            return numericValue;
        }

        const variables = buildEntityTemplateVariables(entityState, numericValue);
        const resolved = this.resolveTemplateString(
            `link-speed-${this.block?.id ?? ''}`,
            template,
            variables
        );

        if (resolved === TEMPLATE_GENERIC_ERROR) {
            return 0;
        }

        const parsed = parseFloat(resolved);
        if (Number.isNaN(parsed)) {
            return 0;
        }

        return parsed;
    }

    private toNumber(value: unknown): number {
        if (value === undefined || value === null) return 0;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(String(value));
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    private buildSvgStyle(style: Record<string, string>, defaults: { color: string; width: string }): Record<string, string> {
        const stroke = style.stroke || defaults.color;
        const strokeWidth = style.strokeWidth || defaults.width;
        const fill = style.fill ?? 'none';
        const color = style.color || stroke;

        return {
            ...style,
            stroke,
            strokeWidth,
            fill,
            color,
        };
    }

    private isEditingActive(): boolean {
        if (!this.linkModeState?.enabled) return false;
        return this.linkModeState.activeLinkId === this.block?.id;
    }

    private getPoints(): LinkPoint[] {
        const raw = this.block?.props?.points;
        if (!Array.isArray(raw)) return [];
        return raw as LinkPoint[];
    }

    private getSegments(): LinkSegment[] {
        const raw = this.block?.props?.segments;
        if (!Array.isArray(raw)) return [];
        return raw as LinkSegment[];
    }

    private getResolvedPoints(): LinkPoint[] {
        const points = this.getPoints().map((point) => ({...point}));
        const resolved = points.map((point) => {
            if (!point.anchor?.blockId) return normalizePoint(point);

            const anchorBase = this.resolveAnchorBase(point);
            if (!anchorBase) return normalizePoint(point);

            const offset = point.anchor.offset ?? {
                x: point.x - anchorBase.x,
                y: point.y - anchorBase.y,
            };

            return {
                ...point,
                x: clampNormalized(anchorBase.x + offset.x),
                y: clampNormalized(anchorBase.y + offset.y),
            };
        });

        if (this.linkModeState?.mode === 'draw' && this.previewPoint) {
            resolved.push({
                id: 'preview',
                x: this.previewPoint.x,
                y: this.previewPoint.y,
            });
        }

        return resolved;
    }

    private toRenderPoint(point: LinkPoint, scale: {sx: number, sy: number}): LinkPoint {
        return {
            ...point,
            x: point.x * scale.sx,
            y: point.y * scale.sy,
            handleIn: point.handleIn ? {x: point.handleIn.x * scale.sx, y: point.handleIn.y * scale.sy} : undefined,
            handleOut: point.handleOut ? {x: point.handleOut.x * scale.sx, y: point.handleOut.y * scale.sy} : undefined,
        };
    }

    private resolveAnchorBase(point: LinkPoint): { x: number; y: number } | null {
        if (!point.anchor?.blockId) return null;
        const anchorBlockData = this.documentModel.getBlock(point.anchor.blockId);
        if (!anchorBlockData) return null;
        const anchorBlock = this.documentModel.getElement(point.anchor.blockId);
        if (!anchorBlock) return null;

        const canvasEl = this.renderer.getCanvasElement();
        if (!canvasEl) return null;

        const canvasRect = canvasEl.getBoundingClientRect();
        const blockRect = anchorBlock.getBoundingClientRect();
        if (!canvasRect.width || !canvasRect.height) return null;

        const anchorPoint = point.anchor.anchor || 'middle-center';
        const { x, y } = this.getAnchorOffset(anchorPoint, blockRect);

        return {
            x: clampNormalized(((x - canvasRect.left) / canvasRect.width) * 100),
            y: clampNormalized(((y - canvasRect.top) / canvasRect.height) * 100),
        };
    }

    private getAnchorOffset(anchor: LinkAnchorPoint, rect: DOMRect): { x: number; y: number } {
        const xMap: Record<string, number> = {
            'left': rect.left,
            'center': rect.left + rect.width / 2,
            'right': rect.right,
        } as const;
        const yMap: Record<string, number> = {
            'top': rect.top,
            'middle': rect.top + rect.height / 2,
            'bottom': rect.bottom,
        } as const;

        const [vertical, horizontal] = anchor.split('-') as ['top' | 'middle' | 'bottom', 'left' | 'center' | 'right'];
        return { x: xMap[horizontal], y: yMap[vertical] };
    }

    private getHandlePosition(point: LinkPoint, handle: 'in' | 'out'): { x: number; y: number } {
        const offset = handle === 'in' ? point.handleIn : point.handleOut;
        if (!offset) {
            return {
                x: point.x,
                y: point.y,
            };
        }

        return {
            x: this.clampRender(point.x + offset.x, this.canvasWidth),
            y: this.clampRender(point.y + offset.y, this.canvasHeight),
        };
    }

    private clampRender(value: number, max: number): number {
        if (Number.isNaN(value)) return 0;
        if (!Number.isFinite(max) || max <= 0) return value;
        return Math.min(max, Math.max(0, value));
    }

    private isCurveSegment(segment?: LinkSegment): boolean {
        return segment?.type === 'curve';
    }

    private _handleLinkModeChanged = (e: Event) => {
        const detail = (e as CustomEvent<{ state: LinkModeState }>).detail;
        this.linkModeState = detail.state;
        if (this.linkModeState?.mode !== 'draw') {
            this.previewPoint = null;
        }
        if (!this.isEditingActive()) {
            this.snapGuide = null;
        }
    };

    private _handleLinkGridColorChanged = (e: Event) => {
        const detail = (e as CustomEvent<{ color?: string }>).detail;
        this.gridColor = detail?.color || '#000000';
    };

    private _handleLinkSelectionChanged = (e: Event) => {
        const detail = (e as CustomEvent<{ selection: LinkEditorSelection }>).detail;
        this.linkEditorSelection = detail.selection;
    };
}

import { ParticleAnimation } from './animations/particle-animation';

BlockLink.registerAnimation('particle', {id: 'particle', label: 'Particle', factory: () => new ParticleAnimation()});

declare global {
    interface HTMLElementTagNameMap {
        'block-link': BlockLink;
    }
}
