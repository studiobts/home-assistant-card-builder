import { BaseEntity } from '@/common/blocks/components/entities/base-entity';
import { dispatchBlockAction } from '@/common/blocks/core/actions/action-dispatcher';
import type { ActionConfig, ActionTrigger } from '@/common/core/model/types';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import type { BlockData } from '@/common/core/model/types';
import type { StyleOutputConfig } from '@/common/core/style-resolver';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import type { HassEntity } from 'home-assistant-js-websocket';

// =============================================================================
// Types
// =============================================================================

type SliderMode = 'single' | 'range';
type SliderModeSetting = 'auto' | SliderMode;

type DisplayMode = 'raw' | 'percent' | 'custom';
type DisplayModeSetting = 'auto' | DisplayMode;

type CommitMode = 'onRelease' | 'throttled' | 'debounced';

type DisableMode = 'auto' | 'custom' | 'never';

type CoverControlMode = 'auto' | 'position' | 'tilt';

type ActiveThumb = 'single' | 'low' | 'high' | null;

type ActivationMode = 'press' | 'hold';
type HoldTapAction = 'more-info' | 'toggle';
type SliderOrientation = 'horizontal' | 'vertical';

type HorizontalValuePosition = 'inline' | 'inside' | 'tooltip';
type HorizontalInlinePosition = 'left' | 'right';
type HorizontalInsidePosition = 'left' | 'center' | 'right';

type VerticalValuePosition = 'top' | 'bottom' | 'inside' | 'tooltip';
type VerticalInsidePosition = 'top' | 'middle' | 'bottom';

type DisplayValues = {
    single?: number;
    low?: number;
    high?: number;
};

type ActualValues = {
    single?: number;
    low?: number;
    high?: number;
};

interface SliderServiceConfig {
    domain: string;
    service: string;
    field: string;
    fieldLow?: string;
    fieldHigh?: string;
}

interface ResolvedSliderConfig {
    domain: string | null;
    mode: SliderMode;
    actualMin: number;
    actualMax: number;
    actualStep: number;
    displayMin: number;
    displayMax: number;
    displayStep: number;
    displayMode: DisplayMode;
    precision: number;
    unit: string;
    values: ActualValues;
    service?: SliderServiceConfig;
    supportsService: boolean;
}

interface SliderRenderContext {
    config: ResolvedSliderConfig;
    displayValues: DisplayValues;
    isDisabled: boolean;
    activeColor: string;
    showValue: boolean;
    singleValue: number;
    lowValue: number;
    highValue: number;
    positionSinglePercent: number;
    positionLowPercent: number;
    positionHighPercent: number;
    startPercent: number;
    endPercent: number;
    trackStyle: Record<string, string>;
    trackInactiveStyle: Record<string, string>;
    trackActiveStyle: Record<string, string>;
    thumbStyle: Record<string, string>;
    thumbLowStyle: Record<string, string>;
    thumbHighStyle: Record<string, string>;
    valueStyle: Record<string, string>;
    tooltipStyle: Record<string, string>;
    showThumb: boolean;
    shape: string;
    valueText: string;
    rootClasses: ReturnType<typeof classMap>;
}

// =============================================================================
// Defaults
// =============================================================================

const DEFAULT_SYNC_TIMEOUT_MS = 1500;
const DEFAULT_HOLD_ACTIVATION_MS = 350;

const DOMAIN_ACTIVE_COLORS: Record<string, string> = {
    light: '#f4b400',
    media_player: '#1e88e5',
    cover: '#8d6e63',
    fan: '#00acc1',
    humidifier: '#4fc3f7',
    climate: '#e53935',
    water_heater: '#ff7043',
    input_number: '#43a047',
    number: '#43a047',
};

// =============================================================================
// Slider Block
// =============================================================================

@customElement('block-slider')
export class BlockSlider extends BaseEntity {
    static styles = [
        ...BaseEntity.styles,
        css`
            :host {
                --block-size-height: 20px;
                --block-size-width: 100%;
                --block-border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
                --slider-thumb-size: var(--block-size-height);
                display: block;
                height: var(--block-size-height);
                border-radius: var(--block-border-radius);
            }
            :host, :host(.block-flow) {
                width: var(--block-size-width);
            }
            :host(.vertical) {
                --block-size-height: 100px;
                --block-size-width: 30px;
                --slider-thumb-size: var(--block-size-width);
            }

            .slider-root {
                display: flex;
                flex-direction: column;
                gap: 6px;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: inherit;
            }

            .slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                height: 100%;
                border-radius: inherit;
            }

            .slider-root.vertical .slider-row {
                flex-direction: column;
                gap: 10px;
            }

            .slider-root.vertical .track {
                flex: 1 1 auto;
                width: 100%;
            }

            .track {
                --slider-track-border-radius: var(--block-border-radius);
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: var(--slider-track-border-radius);
                background: var(--slider-inactive-color, rgba(0, 0, 0, 0.12));
                overflow: visible;
                touch-action: none;
                cursor: pointer;
            }

            .slider-root.dragging,
            .slider-root.dragging .track {
                cursor: ew-resize;
            }

            .slider-root.vertical.dragging,
            .slider-root.vertical.dragging .track {
                cursor: ns-resize;
            }

            .track-inactive {
                position: absolute;
                inset: 0;
                border-radius: var(--slider-track-border-radius);
            }

            .track-active {
                position: absolute;
                top: 0;
                height: 100%;
                border-radius: var(--slider-track-border-radius);
                background: var(--slider-active-color, var(--accent-color, #2196f3));
            }

            .slider-root.vertical .track-active {
                top: auto;
                left: 0;
                width: 100%;
            }

            .thumb {
                position: absolute;
                top: 50%;
                width: var(--slider-thumb-size);
                height: var(--slider-thumb-size);
                border-radius: 50%;
                background: #fff;
                border: 2px solid var(--slider-active-color, var(--accent-color, #2196f3));
                transform: translate(-50%, -50%);
                box-sizing: border-box;
                pointer-events: none;
                transition: box-shadow 0.15s ease;
            }

            .slider-root.vertical .thumb {
                top: auto;
                left: 50%;
                transform: translate(-50%, 50%);
            }

            .thumb.active {
                box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.08);
            }

            .value-label,
            .value-inline {
                font-size: 12px;
                font-weight: 600;
                color: var(--primary-text-color, #111);
                white-space: nowrap;
                font-variant-numeric: tabular-nums;
            }

            .value-inline {
                min-width: 48px;
                text-align: right;
            }

            .value-inline.align-left {
                text-align: left;
            }

            .value-inline.align-right {
                text-align: right;
            }

            .value-vertical {
                text-align: center;
            }

            .value-inside {
                position: absolute;
                padding: 0;
                box-sizing: border-box;
                text-align: center;
                top: 50%;
                transform: translateY(-50%);
            }
            
            .value-inside.position-center {
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .value-inside.position-left {
                left: 0;
                margin-left: 10px;
            }

            .value-inside.position-right {
                right: 0;
                margin-right: 10px;
            }

            .value-inside.vertical {
                left: 50%;
                top: auto;
                transform: translateX(-50%);
            }

            .value-inside.vertical.position-top {
                top: 0;
                margin-top: 10px;
            }

            .value-inside.vertical.position-middle {
                top: 50%;
                transform: translate(-50%, -50%);
            }

            .value-inside.vertical.position-bottom {
                bottom: 0;
                margin-bottom: 10px;
            }

            .tooltip {
                position: absolute;
                top: -28px;
                transform: translateX(-50%);
                padding: 4px 6px;
                border-radius: 6px;
                background: rgba(0, 0, 0, 0.75);
                color: white;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                pointer-events: none;
            }

            .slider-root.vertical .tooltip {
                top: auto;
                left: calc(100% + 8px);
                transform: translateY(-50%);
            }

            .slider-root.disabled {
                opacity: 0.6;
                pointer-events: none;
            }

            .slider-root.sync-pending .thumb {
                box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
            }

            .slider-root.shape-square .track,
            .slider-root.shape-square .track-inactive,
            .slider-root.shape-square .track-active {
                border-radius: 0;
            }

            .slider-root.shape-square .thumb {
                border-radius: 0;
            }
        `,
    ];

    @state() private _localDisplayValue: number | null = null;
    @state() private _localDisplayLow: number | null = null;
    @state() private _localDisplayHigh: number | null = null;
    @state() private _activeThumb: ActiveThumb = null;
    @state() private _isInteracting = false;
    @state() private _syncPending = false;

    private _lastCommitAt = 0;
    private _throttleTimerId: number | null = null;
    private _debounceTimerId: number | null = null;
    private _pendingCommit: DisplayValues | null = null;
    private _pendingSync: { values: ActualValues; startedAt: number } | null = null;
    private _pendingSyncTimeoutId: number | null = null;

    private _lastCommittedValues: ActualValues | null = null;
    private _holdActivationTimerId: number | null = null;
    private _pendingHold: {
        pointerId: number;
        config: ResolvedSliderConfig;
        thumb: 'single' | 'low' | 'high';
        rect: DOMRect;
        target: HTMLElement;
        startX: number;
        startY: number;
        lastX: number;
        lastY: number;
        hasDragStarted: boolean;
        shouldTriggerTapAction: boolean;
    } | null = null;
    private _dragState: {
        pointerId: number;
        config: ResolvedSliderConfig;
        thumb: 'single' | 'low' | 'high';
        rect: DOMRect;
    } | null = null;

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Slider',
                icon: '<ha-icon icon="mdi:arrow-left-right-bold"></ha-icon>',
                category: 'controls',
            },
            defaults: {
                requireEntity: true,
                props: {
                    mode: {value: 'auto'},
                    coverControl: {value: 'auto'},
                    valueSource: {value: 'state'},
                    valueAttribute: {value: ''},
                    displayMode: {value: 'auto'},
                    displayMin: {value: 0},
                    displayMax: {value: 100},
                    shape: {value: 'rounded'},
                    showThumb: {value: true},
                    showValue: {value: true},
                    orientation: {value: 'horizontal'},
                    valuePositionHorizontal: {value: 'inline'},
                    inlinePositionHorizontal: {value: 'right'},
                    insidePositionHorizontal: {value: 'center'},
                    valuePositionVertical: {value: 'top'},
                    insidePositionVertical: {value: 'middle'},
                    activationMode: {value: 'press'},
                    holdTapEnabled: {value: false},
                    holdTapAction: {value: 'more-info'},
                    commitMode: {value: 'onRelease'},
                    commitThrottleMs: {value: 200},
                    commitDebounceMs: {value: 300},
                    disableMode: {value: 'auto'},
                    disabled: {value: false},
                    invert: {value: false},
                    rangeMinGap: {value: 0},
                    useMinOverride: {value: false},
                    minOverride: {value: 0},
                    useMaxOverride: {value: false},
                    maxOverride: {value: 100},
                    useStepOverride: {value: false},
                    stepOverride: {value: 1},
                    usePrecisionOverride: {value: false},
                    precisionOverride: {value: 0},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
            exposeBlockActionTarget: false,
            actionTargets: {
                value: {label: 'Value', description: 'Value label'},
            },
        };
    }

    protected hasNativeActions(): boolean {
        return true;
    }

    static getStyleOutputConfig(_block: BlockData, targetId?: string): StyleOutputConfig | null {
        if (targetId && targetId !== 'block') return null;

        return {
            mode: 'properties',
            filter: {exclude: {properties: [
                'size.height',
                'border.borderRadius'
            ]}},
            varPrefix: 'block',
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'appearance',
                        label: 'Appearance',
                        traits: [
                            {
                                type: 'select',
                                name: 'orientation',
                                label: 'Orientation',
                                options: [
                                    {value: 'horizontal', label: 'Horizontal'},
                                    {value: 'vertical', label: 'Vertical'},
                                ],
                            },
                            {
                                type: 'select',
                                name: 'shape',
                                label: 'Shape',
                                options: [
                                    {value: 'rounded', label: 'Rounded'},
                                    {value: 'square', label: 'Square'},
                                ],
                            },
                            {
                                type: 'checkbox',
                                name: 'showThumb',
                                label: 'Show Thumb',
                            },
                            {
                                type: 'checkbox',
                                name: 'showValue',
                                label: 'Show Value',
                            },
                            {
                                type: 'select',
                                name: 'valuePositionHorizontal',
                                label: 'Value Position',
                                options: [
                                    {value: 'inline', label: 'Inline'},
                                    {value: 'tooltip', label: 'Tooltip'},
                                    {value: 'inside', label: 'Inside'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'showValue', eq: true},
                                        {prop: 'orientation', eq: 'horizontal'},
                                    ],
                                },
                            },
                            {
                                type: 'select',
                                name: 'inlinePositionHorizontal',
                                label: 'Inline Position',
                                options: [
                                    {value: 'left', label: 'Left'},
                                    {value: 'right', label: 'Right'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'orientation', eq: 'horizontal'},
                                        {prop: 'valuePositionHorizontal', eq: 'inline'},
                                    ],
                                },
                            },
                            {
                                type: 'select',
                                name: 'insidePositionHorizontal',
                                label: 'Inside Position',
                                options: [
                                    {value: 'left', label: 'Left'},
                                    {value: 'center', label: 'Center'},
                                    {value: 'right', label: 'Right'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'orientation', eq: 'horizontal'},
                                        {prop: 'valuePositionHorizontal', eq: 'inside'},
                                    ],
                                },
                            },
                            {
                                type: 'select',
                                name: 'valuePositionVertical',
                                label: 'Value Position',
                                options: [
                                    {value: 'top', label: 'Top'},
                                    {value: 'bottom', label: 'Bottom'},
                                    {value: 'inside', label: 'Inside'},
                                    {value: 'tooltip', label: 'Tooltip'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'showValue', eq: true},
                                        {prop: 'orientation', eq: 'vertical'},
                                    ],
                                },
                            },
                            {
                                type: 'select',
                                name: 'insidePositionVertical',
                                label: 'Inside Position',
                                options: [
                                    {value: 'top', label: 'Top'},
                                    {value: 'middle', label: 'Middle'},
                                    {value: 'bottom', label: 'Bottom'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'orientation', eq: 'vertical'},
                                        {prop: 'valuePositionVertical', eq: 'inside'},
                                    ],
                                },
                            },
                            {
                                type: 'checkbox',
                                name: 'invert',
                                label: 'Invert',
                            },
                        ],
                    },
                    {
                        id: 'behavior',
                        label: 'Behavior',
                        traits: [
                            {
                                type: 'select',
                                name: 'activationMode',
                                label: 'Activation',
                                options: [
                                    {value: 'press', label: 'Press'},
                                    {value: 'hold', label: 'Hold'},
                                ],
                            },
                            {
                                type: 'checkbox',
                                name: 'holdTapEnabled',
                                label: 'Enable Tap Action',
                                visible: {prop: 'activationMode', eq: 'hold'},
                            },
                            {
                                type: 'select',
                                name: 'holdTapAction',
                                label: 'Tap Action',
                                options: [
                                    {value: 'more-info', label: 'More Info'},
                                    {value: 'toggle', label: 'Toggle'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'activationMode', eq: 'hold'},
                                        {prop: 'holdTapEnabled', eq: true},
                                    ],
                                },
                            },
                            {
                                type: 'select',
                                name: 'mode',
                                label: 'Mode',
                                options: [
                                    {value: 'auto', label: 'Auto'},
                                    {value: 'single', label: 'Single'},
                                    {value: 'range', label: 'Range'},
                                ],
                            },
                            {
                                type: 'select',
                                name: 'coverControl',
                                label: 'Cover Control',
                                options: [
                                    {value: 'auto', label: 'Auto'},
                                    {value: 'position', label: 'Position'},
                                    {value: 'tilt', label: 'Tilt'},
                                ],
                                visible: {
                                    prop: 'mode',
                                    in: ['auto', 'single', 'range'],
                                },
                            },
                            {
                                type: 'select',
                                name: 'valueSource',
                                label: 'Value Source',
                                options: [
                                    {value: 'state', label: 'State'},
                                    {value: 'attribute', label: 'Attribute'},
                                ],
                            },
                            {
                                type: 'attribute-picker',
                                name: 'valueAttribute',
                                label: 'Value Attribute',
                                placeholder: 'Select or type attribute',
                                visible: {prop: 'valueSource', eq: 'attribute'},
                            },
                            {
                                type: 'select',
                                name: 'displayMode',
                                label: 'Display Mode',
                                options: [
                                    {value: 'auto', label: 'Auto'},
                                    {value: 'raw', label: 'Raw'},
                                    {value: 'percent', label: 'Percent'},
                                    {value: 'custom', label: 'Custom'},
                                ],
                            },
                            {
                                type: 'number',
                                name: 'displayMin',
                                label: 'Display Min',
                                step: 0.01,
                                binding: {type: 'number'},
                                visible: {prop: 'displayMode', eq: 'custom'},
                            },
                            {
                                type: 'number',
                                name: 'displayMax',
                                label: 'Display Max',
                                step: 0.01,
                                binding: {type: 'number'},
                                visible: {prop: 'displayMode', eq: 'custom'},
                            },
                            {
                                type: 'select',
                                name: 'commitMode',
                                label: 'Commit Mode',
                                options: [
                                    {value: 'onRelease', label: 'On Release'},
                                    {value: 'throttled', label: 'Throttled'},
                                    {value: 'debounced', label: 'Debounced'},
                                ],
                            },
                            {
                                type: 'number',
                                name: 'commitThrottleMs',
                                label: 'Throttle (ms)',
                                min: 50,
                                max: 2000,
                                visible: {prop: 'commitMode', eq: 'throttled'},
                            },
                            {
                                type: 'number',
                                name: 'commitDebounceMs',
                                label: 'Debounce (ms)',
                                min: 50,
                                max: 2000,
                                visible: {prop: 'commitMode', eq: 'debounced'},
                            },
                        ],
                    },
                    {
                        id: 'overrides',
                        label: 'Overrides',
                        traits: [
                            {
                                type: 'checkbox',
                                name: 'useMinOverride',
                                label: 'Override Min',
                            },
                            {
                                type: 'number',
                                name: 'minOverride',
                                label: 'Min',
                                step: 0.01,
                                binding: {type: 'number'},
                                visible: {prop: 'useMinOverride', eq: true},
                            },
                            {
                                type: 'checkbox',
                                name: 'useMaxOverride',
                                label: 'Override Max',
                            },
                            {
                                type: 'number',
                                name: 'maxOverride',
                                label: 'Max',
                                step: 0.01,
                                binding: {type: 'number'},
                                visible: {prop: 'useMaxOverride', eq: true},
                            },
                            {
                                type: 'checkbox',
                                name: 'useStepOverride',
                                label: 'Override Step',
                            },
                            {
                                type: 'number',
                                name: 'stepOverride',
                                label: 'Step',
                                step: 0.01,
                                binding: {type: 'number'},
                                visible: {prop: 'useStepOverride', eq: true},
                            },
                            {
                                type: 'checkbox',
                                name: 'usePrecisionOverride',
                                label: 'Override Precision',
                            },
                            {
                                type: 'number',
                                name: 'precisionOverride',
                                label: 'Precision',
                                min: 0,
                                max: 6,
                                visible: {prop: 'usePrecisionOverride', eq: true},
                            },
                        ],
                    },
                    {
                        id: 'range',
                        label: 'Range',
                        traits: [
                            {
                                type: 'number',
                                name: 'rangeMinGap',
                                label: 'Min Gap',
                                min: 0,
                                max: 100,
                                step: 0.01,
                            },
                        ],
                    },
                    {
                        id: 'disabled',
                        label: 'Disabled',
                        traits: [
                            {
                                type: 'select',
                                name: 'disableMode',
                                label: 'Disabled When',
                                options: [
                                    {value: 'auto', label: 'Unavailable/Unknown'},
                                    {value: 'custom', label: 'Custom'},
                                    {value: 'never', label: 'Never'},
                                ],
                            },
                            {
                                type: 'checkbox',
                                name: 'disabled',
                                label: 'Disabled',
                                binding: {
                                    type: 'select',
                                    options: [
                                        {label: 'False', value: 'false'},
                                        {label: 'True', value: 'true'},
                                    ],
                                },
                                visible: {prop: 'disableMode', eq: 'custom'},
                            },
                        ],
                    },
                ],
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'full',
                    },
                },
                track: {
                    label: 'Track',
                    description: 'Slider track container',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'track-inactive': {
                    label: 'Track Inactive',
                    description: 'Inactive track area',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'track-active': {
                    label: 'Track Active',
                    description: 'Active track area',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                thumb: {
                    label: 'Thumb',
                    description: 'Single slider thumb',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'thumb-low': {
                    label: 'Thumb Low',
                    description: 'Range low thumb',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'thumb-high': {
                    label: 'Thumb High',
                    description: 'Range high thumb',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                value: {
                    label: 'Value',
                    description: 'Value label text',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                tooltip: {
                    label: 'Tooltip',
                    description: 'Tooltip value bubble',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
            },
        };
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (changedProps.has('block')) {
            this.entity = this.resolvedEntityId();
        }

        const orientation = this.resolveProperty('orientation', 'horizontal') as SliderOrientation;
        this.classList.toggle('vertical', orientation === 'vertical');
    }

    disconnectedCallback(): void {
        this._clearCommitTimers();
        this._clearPendingSync();
        if (this._dragState) {
            window.removeEventListener('pointermove', this._onTrackPointerMove);
            window.removeEventListener('pointerup', this._onTrackPointerUp);
            this._dragState = null;
        }
        super.disconnectedCallback();
    }

    render() {
        if (!this.entity) {
            return html`<div class="no-entity">No entity selected</div>`;
        }

        const config = this._resolveConfig();
        if (!config) {
            return html`<div class="no-entity">Entity unavailable</div>`;
        }

        const orientation = this.resolveProperty('orientation', 'horizontal') as SliderOrientation;
        const context = this._buildRenderContext(config, orientation);

        return orientation === 'vertical'
            ? this._renderVertical(context)
            : this._renderHorizontal(context);
    }

    private _buildRenderContext(config: ResolvedSliderConfig, orientation: SliderOrientation): SliderRenderContext {
        const isDisabled = this._isDisabled();
        const displayValues = this._getDisplayValues(config);
        const activeColor = this._getDefaultActiveColor(config.domain);
        const showValue = this.resolvePropertyAsBoolean('showValue');

        const displayRange = this._safeRange(config.displayMin, config.displayMax);
        const singleValue = displayValues.single ?? config.displayMin;
        const lowValue = displayValues.low ?? config.displayMin;
        const highValue = displayValues.high ?? config.displayMax;

        const percent = (value: number) => ((value - config.displayMin) / displayRange) * 100;
        const singlePercent = percent(singleValue);
        const lowPercent = percent(lowValue);
        const highPercent = percent(highValue);

        const clampedSinglePercent = this._clamp(singlePercent, 0, 100);
        const clampedLowPercent = this._clamp(lowPercent, 0, 100);
        const clampedHighPercent = this._clamp(highPercent, 0, 100);

        const invert = this.resolvePropertyAsBoolean('invert');
        const positionSinglePercent = invert ? 100 - clampedSinglePercent : clampedSinglePercent;
        const positionLowPercent = invert ? 100 - clampedLowPercent : clampedLowPercent;
        const positionHighPercent = invert ? 100 - clampedHighPercent : clampedHighPercent;

        const startPercent = config.mode === 'range'
            ? Math.min(positionLowPercent, positionHighPercent)
            : (invert ? positionSinglePercent : 0);
        const endPercent = config.mode === 'range'
            ? Math.max(positionLowPercent, positionHighPercent)
            : (invert ? 100 : positionSinglePercent);

        const trackStyle = this.getTargetStyle('track');
        const trackInactiveStyle = this.getTargetStyle('track-inactive');
        const trackActiveStyle = this._withDefaultActiveColor(
            this.getTargetStyle('track-active'),
            activeColor
        );
        const thumbStyle = this.getTargetStyle('thumb');
        const thumbLowStyle = this.getTargetStyle('thumb-low');
        const thumbHighStyle = this.getTargetStyle('thumb-high');
        const valueStyle = this.getTargetStyle('value');
        const tooltipStyle = this.getTargetStyle('tooltip');
        const showThumb = this.resolvePropertyAsBoolean('showThumb');
        const shape = this.resolveProperty('shape', 'rounded');

        const rootClasses = classMap({
            'slider-root': true,
            vertical: orientation === 'vertical',
            disabled: isDisabled,
            'sync-pending': this._syncPending,
            dragging: this._isInteracting,
            [`shape-${shape}`]: true,
        });

        const valueText = this._formatRangeValue(displayValues, config);

        return {
            config,
            displayValues,
            isDisabled,
            activeColor,
            showValue,
            singleValue,
            lowValue,
            highValue,
            positionSinglePercent,
            positionLowPercent,
            positionHighPercent,
            startPercent,
            endPercent,
            trackStyle,
            trackInactiveStyle,
            trackActiveStyle,
            thumbStyle,
            thumbLowStyle,
            thumbHighStyle,
            valueStyle,
            tooltipStyle,
            showThumb,
            shape,
            valueText,
            rootClasses,
        };
    }

    private _renderHorizontal(ctx: SliderRenderContext) {
        const valuePosition = this.resolveProperty('valuePositionHorizontal', 'inline') as HorizontalValuePosition;
        const inlinePosition = this.resolveProperty('inlinePositionHorizontal', 'left') as HorizontalInlinePosition;
        const insidePosition = this.resolveProperty('insidePositionHorizontal', 'left') as HorizontalInsidePosition;
        const showValue = ctx.showValue;
        const tooltipEnabled = showValue && valuePosition === 'tooltip' && this._isInteracting;

        const inlineValueTemplate = showValue && valuePosition === 'inline' ? html`
            <div
                class="value-inline align-${inlinePosition} ${this.isStyleTargetActive('value') ? 'style-target-active' : ''}"
                style=${styleMap(ctx.valueStyle)}
                data-style-target="value"
                data-action-target="value"
            >${ctx.valueText}</div>
        ` : nothing;

        const insideValueTemplate = showValue && valuePosition === 'inside' ? html`
            <div
                class=${classMap({
                    'value-label': true,
                    'value-inside': true,
                    'position-center': insidePosition === 'center',
                    'position-left': insidePosition === 'left',
                    'position-right': insidePosition === 'right',
                    'style-target-active': this.isStyleTargetActive('value'),
                })}
                style=${styleMap(ctx.valueStyle)}
                data-style-target="value"
                data-action-target="value"
            >${ctx.valueText}</div>
        ` : nothing;

        const rowClasses = classMap({
            'slider-row': true,
        });

        const renderInline = showValue && valuePosition === 'inline';
        const placeInlineBefore = renderInline && inlinePosition === 'left';
        const placeInlineAfter = renderInline && inlinePosition !== 'left';

        return html`
            <div
                class=${ctx.rootClasses}
                style=${styleMap({'--slider-active-color': ctx.activeColor})}
            >
                <div class=${rowClasses}>
                    ${placeInlineBefore ? inlineValueTemplate : nothing}
                    <div
                        class="track ${this.isStyleTargetActive('track') ? 'style-target-active' : ''}"
                        style=${styleMap(ctx.trackStyle)}
                        data-style-target="track"
                    >
                        <div
                            class="track-inactive ${this.isStyleTargetActive('track-inactive') ? 'style-target-active' : ''}"
                            style=${styleMap(ctx.trackInactiveStyle)}
                            data-style-target="track-inactive"
                        ></div>
                        <div
                            class="track-active ${this.isStyleTargetActive('track-active') ? 'style-target-active' : ''}"
                            style=${styleMap({
                                ...ctx.trackActiveStyle,
                                left: `${ctx.startPercent}%`,
                                width: `${ctx.endPercent - ctx.startPercent}%`,
                            })}
                            data-style-target="track-active"
                        ></div>
                        ${insideValueTemplate}

                        ${ctx.config.mode === 'range' ? html`
                            ${ctx.showThumb ? html`
                                <div
                                    class="thumb ${this._activeThumb === 'low' ? 'active' : ''} ${this.isStyleTargetActive('thumb-low') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.thumbLowStyle, left: `${ctx.positionLowPercent}%`})}
                                    data-style-target="thumb-low"
                                ></div>
                                <div
                                    class="thumb ${this._activeThumb === 'high' ? 'active' : ''} ${this.isStyleTargetActive('thumb-high') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.thumbHighStyle, left: `${ctx.positionHighPercent}%`})}
                                    data-style-target="thumb-high"
                                ></div>
                            ` : nothing}

                            ${tooltipEnabled ? html`
                                <div
                                    class="tooltip ${this.isStyleTargetActive('tooltip') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.tooltipStyle, left: `${ctx.positionLowPercent}%`})}
                                    data-style-target="tooltip"
                                >${this._formatSingleValue(ctx.lowValue, ctx.config)}</div>
                                <div
                                    class="tooltip ${this.isStyleTargetActive('tooltip') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.tooltipStyle, left: `${ctx.positionHighPercent}%`})}
                                    data-style-target="tooltip"
                                >${this._formatSingleValue(ctx.highValue, ctx.config)}</div>
                            ` : nothing}
                        ` : html`
                            ${ctx.showThumb ? html`
                                <div
                                    class="thumb ${this._activeThumb === 'single' ? 'active' : ''} ${this.isStyleTargetActive('thumb') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.thumbStyle, left: `${ctx.positionSinglePercent}%`})}
                                    data-style-target="thumb"
                                ></div>
                            ` : nothing}

                            ${tooltipEnabled ? html`
                                <div
                                    class="tooltip ${this.isStyleTargetActive('tooltip') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.tooltipStyle, left: `${ctx.positionSinglePercent}%`})}
                                    data-style-target="tooltip"
                                >${this._formatSingleValue(ctx.singleValue, ctx.config)}</div>
                            ` : nothing}
                        `}
                    </div>

                    ${placeInlineAfter ? inlineValueTemplate : nothing}
                </div>
            </div>
        `;
    }

    private _renderVertical(ctx: SliderRenderContext) {
        const valuePosition = this.resolveProperty('valuePositionVertical', 'top') as VerticalValuePosition;
        const insidePosition = this.resolveProperty('insidePositionVertical', 'middle') as VerticalInsidePosition;
        const showValue = ctx.showValue;
        const tooltipEnabled = showValue && valuePosition === 'tooltip' && this._isInteracting;

        const outsideValueTemplate = showValue && (valuePosition === 'top' || valuePosition === 'bottom') ? html`
            <div
                class="value-label value-vertical ${this.isStyleTargetActive('value') ? 'style-target-active' : ''}"
                style=${styleMap(ctx.valueStyle)}
                data-style-target="value"
                data-action-target="value"
            >${ctx.valueText}</div>
        ` : nothing;

        const insideValueTemplate = showValue && valuePosition === 'inside' ? html`
            <div
                class=${classMap({
                    'value-label': true,
                    'value-inside': true,
                    vertical: true,
                    'position-top': insidePosition === 'top',
                    'position-middle': insidePosition === 'middle',
                    'position-bottom': insidePosition === 'bottom',
                    'style-target-active': this.isStyleTargetActive('value'),
                })}
                style=${styleMap(ctx.valueStyle)}
                data-style-target="value"
                data-action-target="value"
            >${ctx.valueText}</div>
        ` : nothing;

        const placeValueTop = showValue && valuePosition === 'top';
        const placeValueBottom = showValue && valuePosition === 'bottom';

        return html`
            <div
                class=${ctx.rootClasses}
                style=${styleMap({'--slider-active-color': ctx.activeColor})}
            >
                <div class="slider-row">
                    ${placeValueTop ? outsideValueTemplate : nothing}
                    <div
                        class="track ${this.isStyleTargetActive('track') ? 'style-target-active' : ''}"
                        style=${styleMap(ctx.trackStyle)}
                        data-style-target="track"
                    >
                        <div
                            class="track-inactive ${this.isStyleTargetActive('track-inactive') ? 'style-target-active' : ''}"
                            style=${styleMap(ctx.trackInactiveStyle)}
                            data-style-target="track-inactive"
                        ></div>
                        <div
                            class="track-active ${this.isStyleTargetActive('track-active') ? 'style-target-active' : ''}"
                            style=${styleMap({
                                ...ctx.trackActiveStyle,
                                bottom: `${ctx.startPercent}%`,
                                height: `${ctx.endPercent - ctx.startPercent}%`,
                            })}
                            data-style-target="track-active"
                        ></div>
                        ${insideValueTemplate}

                        ${ctx.config.mode === 'range' ? html`
                            ${ctx.showThumb ? html`
                                <div
                                    class="thumb ${this._activeThumb === 'low' ? 'active' : ''} ${this.isStyleTargetActive('thumb-low') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.thumbLowStyle, bottom: `${ctx.positionLowPercent}%`})}
                                    data-style-target="thumb-low"
                                ></div>
                                <div
                                    class="thumb ${this._activeThumb === 'high' ? 'active' : ''} ${this.isStyleTargetActive('thumb-high') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.thumbHighStyle, bottom: `${ctx.positionHighPercent}%`})}
                                    data-style-target="thumb-high"
                                ></div>
                            ` : nothing}

                            ${tooltipEnabled ? html`
                                <div
                                    class="tooltip ${this.isStyleTargetActive('tooltip') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.tooltipStyle, top: `${100 - ctx.positionLowPercent}%`})}
                                    data-style-target="tooltip"
                                >${this._formatSingleValue(ctx.lowValue, ctx.config)}</div>
                                <div
                                    class="tooltip ${this.isStyleTargetActive('tooltip') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.tooltipStyle, top: `${100 - ctx.positionHighPercent}%`})}
                                    data-style-target="tooltip"
                                >${this._formatSingleValue(ctx.highValue, ctx.config)}</div>
                            ` : nothing}
                        ` : html`
                            ${ctx.showThumb ? html`
                                <div
                                    class="thumb ${this._activeThumb === 'single' ? 'active' : ''} ${this.isStyleTargetActive('thumb') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.thumbStyle, bottom: `${ctx.positionSinglePercent}%`})}
                                    data-style-target="thumb"
                                ></div>
                            ` : nothing}

                            ${tooltipEnabled ? html`
                                <div
                                    class="tooltip ${this.isStyleTargetActive('tooltip') ? 'style-target-active' : ''}"
                                    style=${styleMap({...ctx.tooltipStyle, top: `${100 - ctx.positionSinglePercent}%`})}
                                    data-style-target="tooltip"
                                >${this._formatSingleValue(ctx.singleValue, ctx.config)}</div>
                            ` : nothing}
                        `}
                    </div>

                    ${placeValueBottom ? outsideValueTemplate : nothing}
                </div>
            </div>
        `;
    }

    // =============================================================================
    // Input Handlers
    // =============================================================================
    protected getNativeActionTargetIds(): string[] {
        return [];
    }

    protected handleNativePointerDown(e: PointerEvent, _targetId: string | null): boolean {
        const config = this._resolveConfig();
        if (!config || this._isDisabled()) return false;
        if (!this.areActionsEnabled()) return false;
        if (e.pointerType === 'mouse' && e.button !== 0) return false;

        const track = this.renderRoot?.querySelector('.track') as HTMLElement | null;
        if (!track) return false;

        const path = e.composedPath() as EventTarget[];
        if (!path.includes(track)) {
            return false;
        }

        e.preventDefault();
        e.stopPropagation();

        const rect = track.getBoundingClientRect();
        const displayValue = this._displayFromPointer(e.clientX, e.clientY, rect, config);
        const thumb = config.mode === 'range'
            ? this._pickRangeThumb(displayValue, config)
            : 'single';

        const activationMode = this.resolveProperty('activationMode', 'press') as ActivationMode;
        if (activationMode === 'hold') {
            const holdTapEnabled = this.resolvePropertyAsBoolean('holdTapEnabled');
            this._scheduleHoldActivation(e, rect, config, thumb, track, holdTapEnabled);
            return true;
        }

        this._beginDrag(e.pointerId, e.clientX, e.clientY, rect, config, thumb, track);
        return true;
    }

    private _onTrackPointerMove = (e: PointerEvent): void => {
        if (!this._dragState || e.pointerId !== this._dragState.pointerId) return;
        const {config, thumb, rect} = this._dragState;
        const displayValue = this._displayFromPointer(e.clientX, e.clientY, rect, config);
        this._applyDisplayValue(displayValue, config, thumb);
    };

    private _onTrackPointerUp = (e: PointerEvent): void => {
        if (!this._dragState || e.pointerId !== this._dragState.pointerId) return;
        const {config, thumb} = this._dragState;

        e.preventDefault();
        e.stopPropagation();

        this._dragState = null;
        window.removeEventListener('pointermove', this._onTrackPointerMove);
        window.removeEventListener('pointerup', this._onTrackPointerUp);

        this._commitOnRelease(config, thumb);
        this._activeThumb = null;
        this._isInteracting = false;
    };

    private _scheduleHoldActivation(
        e: PointerEvent,
        rect: DOMRect,
        config: ResolvedSliderConfig,
        thumb: 'single' | 'low' | 'high',
        target: HTMLElement,
        allowTapAction: boolean
    ): void {
        this._cancelHoldActivation(false, false);

        this._pendingHold = {
            pointerId: e.pointerId,
            config,
            thumb,
            rect,
            target,
            startX: e.clientX,
            startY: e.clientY,
            lastX: e.clientX,
            lastY: e.clientY,
            hasDragStarted: false,
            shouldTriggerTapAction: allowTapAction,
        };

        target.setPointerCapture?.(e.pointerId);
        window.addEventListener('pointermove', this._onHoldPointerMove);
        window.addEventListener('pointerup', this._onHoldPointerUp);
        window.addEventListener('pointercancel', this._onHoldPointerUp);

        this._holdActivationTimerId = window.setTimeout(() => {
            const pending = this._pendingHold;
            if (!pending) return;
            this._pendingHold = null;
            this._holdActivationTimerId = null;
            this._removeHoldListeners();
            pending.hasDragStarted = true;
            this._beginDrag(
                pending.pointerId,
                pending.lastX,
                pending.lastY,
                pending.rect,
                pending.config,
                pending.thumb,
                pending.target
            );
        }, DEFAULT_HOLD_ACTIVATION_MS);
    }

    private _onHoldPointerMove = (e: PointerEvent): void => {
        if (!this._pendingHold || e.pointerId !== this._pendingHold.pointerId) return;
        this._pendingHold.lastX = e.clientX;
        this._pendingHold.lastY = e.clientY;

        const dx = e.clientX - this._pendingHold.startX;
        const dy = e.clientY - this._pendingHold.startY;
        if (Math.hypot(dx, dy) > 6) {
            this._cancelHoldActivation(true, false);
        }
    };

    private _onHoldPointerUp = (e: PointerEvent): void => {
        if (!this._pendingHold || e.pointerId !== this._pendingHold.pointerId) return;
        this._cancelHoldActivation(true, true);
    };

    private _cancelHoldActivation(releaseCapture: boolean, evaluateTap: boolean): void {
        const pending = this._pendingHold;
        if (this._holdActivationTimerId !== null) {
            window.clearTimeout(this._holdActivationTimerId);
            this._holdActivationTimerId = null;
        }
        if (evaluateTap && pending && !pending.hasDragStarted) {
            this._maybeTriggerHoldTapAction(pending);
        }
        if (releaseCapture && pending?.target?.releasePointerCapture) {
            try {
                pending.target.releasePointerCapture(pending.pointerId);
            } catch {
                // ignore if pointer capture is not active
            }
        }
        this._pendingHold = null;
        this._removeHoldListeners();
    }

    private _removeHoldListeners(): void {
        window.removeEventListener('pointermove', this._onHoldPointerMove);
        window.removeEventListener('pointerup', this._onHoldPointerUp);
        window.removeEventListener('pointercancel', this._onHoldPointerUp);
    }

    private _maybeTriggerHoldTapAction(pending: {
        pointerId: number;
        config: ResolvedSliderConfig;
        thumb: 'single' | 'low' | 'high';
        rect: DOMRect;
        target: HTMLElement;
        startX: number;
        startY: number;
        lastX: number;
        lastY: number;
        hasDragStarted: boolean;
        shouldTriggerTapAction: boolean;
    }): void {
        if (!pending.shouldTriggerTapAction) return;

        if (!this.hass || !this.block || !this.eventBus) return;
        const entityId = this.resolvedEntityId();
        if (!entityId) return;

        const tapAction = this.resolveProperty('holdTapAction', 'more-info') as HoldTapAction;
        const action: ActionConfig = tapAction === 'toggle'
            ? {action: 'toggle'}
            : {action: 'more-info'};

        const trigger: ActionTrigger = 'tap';
        void dispatchBlockAction({
            hass: this.hass,
            element: this,
            action,
            trigger,
            entityId,
            eventBus: this.eventBus,
            blockId: this.block.id,
            targetId: 'block',
            slotId: undefined,
        });
    }

    private _beginDrag(
        pointerId: number,
        clientX: number,
        clientY: number,
        rect: DOMRect,
        config: ResolvedSliderConfig,
        thumb: 'single' | 'low' | 'high',
        target: HTMLElement
    ): void {
        const displayValue = this._displayFromPointer(clientX, clientY, rect, config);

        this._activeThumb = thumb;
        this._isInteracting = true;

        this._applyDisplayValue(displayValue, config, thumb);

        this._dragState = {
            pointerId,
            config,
            thumb,
            rect,
        };

        target.setPointerCapture?.(pointerId);
        window.addEventListener('pointermove', this._onTrackPointerMove);
        window.addEventListener('pointerup', this._onTrackPointerUp);
    }

    private _applyDisplayValue(displayValue: number, config: ResolvedSliderConfig, thumb: 'single' | 'low' | 'high'): void {
        if (config.mode === 'single') {
            const normalized = this._normalizeDisplayValues({single: displayValue}, config);
            this._localDisplayValue = normalized.single ?? displayValue;
            this._scheduleCommit(normalized, config, 'single');
            return;
        }

        const current = this._getDisplayValues(config);
        const draft: DisplayValues = {
            low: current.low ?? config.displayMin,
            high: current.high ?? config.displayMax,
        };

        if (thumb === 'low') {
            draft.low = displayValue;
        } else {
            draft.high = displayValue;
        }

        const normalized = this._normalizeDisplayValues(draft, config, thumb);
        this._localDisplayLow = normalized.low ?? draft.low ?? config.displayMin;
        this._localDisplayHigh = normalized.high ?? draft.high ?? config.displayMax;
        this._scheduleCommit(normalized, config, thumb);
    }

    private _commitOnRelease(config: ResolvedSliderConfig, thumb: ActiveThumb): void {
        const commitMode = this._getCommitMode();
        if (commitMode !== 'onRelease') return;

        if (config.mode === 'single') {
            if (this._localDisplayValue === null) return;
            this._commitDisplayValues({single: this._localDisplayValue}, config, thumb);
        } else {
            if (this._localDisplayLow === null || this._localDisplayHigh === null) return;
            this._commitDisplayValues({low: this._localDisplayLow, high: this._localDisplayHigh}, config, thumb);
        }
    }

    private _displayFromPointer(clientX: number, clientY: number, rect: DOMRect, config: ResolvedSliderConfig): number {
        const orientation = this.resolveProperty('orientation', 'horizontal') as SliderOrientation;
        let ratio = 0;

        if (orientation === 'vertical') {
            const y = this._clamp(rect.bottom - clientY, 0, rect.height);
            ratio = rect.height > 0 ? y / rect.height : 0;
        } else {
            const x = this._clamp(clientX - rect.left, 0, rect.width);
            ratio = rect.width > 0 ? x / rect.width : 0;
        }

        const percent = ratio * 100;
        const positionPercent = this._applyInvert(percent);
        const displayRange = config.displayMax - config.displayMin;
        return config.displayMin + (positionPercent / 100) * displayRange;
    }

    private _applyInvert(percent: number): number {
        const invert = this.resolvePropertyAsBoolean('invert');
        return invert ? 100 - percent : percent;
    }

    private _pickRangeThumb(displayValue: number, config: ResolvedSliderConfig): 'low' | 'high' {
        const current = this._getDisplayValues(config);
        const low = current.low ?? config.displayMin;
        const high = current.high ?? config.displayMax;
        return Math.abs(displayValue - low) <= Math.abs(displayValue - high) ? 'low' : 'high';
    }

    // =============================================================================
    // Commit Logic
    // =============================================================================

    private _getCommitMode(): CommitMode {
        return this.resolveProperty('commitMode', 'onRelease') as CommitMode;
    }

    private _scheduleCommit(values: DisplayValues, config: ResolvedSliderConfig, thumb: ActiveThumb): void {
        if (!config.supportsService) return;

        const commitMode = this._getCommitMode();
        if (commitMode === 'onRelease') {
            return;
        }

        if (commitMode === 'throttled') {
            const throttleMs = Math.max(50, this.resolvePropertyAsNumber('commitThrottleMs', 200));
            const now = Date.now();

            if (!this._lastCommitAt || now - this._lastCommitAt >= throttleMs) {
                this._lastCommitAt = now;
                this._commitDisplayValues(values, config, thumb);
                return;
            }

            this._pendingCommit = values;
            if (this._throttleTimerId === null) {
                const wait = Math.max(0, throttleMs - (now - this._lastCommitAt));
                this._throttleTimerId = window.setTimeout(() => {
                    this._throttleTimerId = null;
                    if (this._pendingCommit) {
                        this._lastCommitAt = Date.now();
                        this._commitDisplayValues(this._pendingCommit, config, thumb);
                        this._pendingCommit = null;
                    }
                }, wait);
            }
            return;
        }

        if (commitMode === 'debounced') {
            const debounceMs = Math.max(50, this.resolvePropertyAsNumber('commitDebounceMs', 300));
            this._pendingCommit = values;
            if (this._debounceTimerId !== null) {
                window.clearTimeout(this._debounceTimerId);
            }
            this._debounceTimerId = window.setTimeout(() => {
                this._debounceTimerId = null;
                if (this._pendingCommit) {
                    this._commitDisplayValues(this._pendingCommit, config, thumb);
                    this._pendingCommit = null;
                }
            }, debounceMs);
        }
    }

    private async _commitDisplayValues(values: DisplayValues, config: ResolvedSliderConfig, thumb: ActiveThumb): Promise<void> {
        if (!this.hass || !this.entity || !config.supportsService || !config.service) return;
        if (this._isDisabled()) return;
        if (!this.areActionsEnabled()) return;

        const normalizedDisplay = this._normalizeDisplayValues(values, config, thumb === 'high' ? 'high' : thumb === 'low' ? 'low' : undefined);
        const actualValues = this._toActualValues(normalizedDisplay, config, thumb);
        const useDisplayForService = config.service.field === 'brightness_pct';
        const serviceValues = useDisplayForService ? normalizedDisplay : actualValues;
        const payload = this._buildServicePayload(serviceValues, config);
        if (!payload) return;

        this._lastCommittedValues = {...config.values};
        this._setPendingSync(actualValues);

        const action: ActionConfig = {
            action: 'call-service',
            service: `${payload.domain}.${payload.service}`,
            data: payload.data,
        };

        try {
            await dispatchBlockAction({
                hass: this.hass,
                element: this,
                action,
                trigger: 'tap',
                entityId: this.entity,
                eventBus: this.eventBus,
                blockId: this.block?.id,
                targetId: 'block',
                slotId: undefined,
                throwOnError: true,
            });
        } catch (error) {
            this._clearPendingSync();
            this._revertToLastCommitted(config);
            this._emitServiceError(error, payload);
        }
    }

    private _clearCommitTimers(): void {
        if (this._throttleTimerId !== null) {
            window.clearTimeout(this._throttleTimerId);
            this._throttleTimerId = null;
        }
        if (this._debounceTimerId !== null) {
            window.clearTimeout(this._debounceTimerId);
            this._debounceTimerId = null;
        }
        this._pendingCommit = null;
    }

    // =============================================================================
    // Config Resolution
    // =============================================================================

    private _resolveConfig(): ResolvedSliderConfig | null {
        const state = this.getEntityState();
        const domain = this.getEntityDomain();

        if (!state || !domain) return null;

        const attributes = state.attributes || {};
        const modeSetting = this.resolveProperty('mode', 'auto') as SliderModeSetting;
        const coverControl = this.resolveProperty('coverControl', 'auto') as CoverControlMode;
        const displayModeSetting = this.resolveProperty('displayMode', 'auto') as DisplayModeSetting;
        const valueSource = this.resolveProperty('valueSource', 'state');
        const valueAttribute = this.resolveProperty('valueAttribute', '');

        let mode: SliderMode = 'single';
        let values: ActualValues = {};
        let min = 0;
        let max = 100;
        let step = 1;
        let unit = '';
        let displayMode: DisplayMode = 'raw';
        let service: SliderServiceConfig | undefined = undefined;

        switch (domain) {
            case 'light': {
                const brightness = this._getNumberAttribute(attributes, 'brightness');
                min = 0;
                max = 255;
                step = 1;
                values.single = brightness ?? min;
                displayMode = 'percent';
                service = {domain: 'light', service: 'turn_on', field: 'brightness'};
                break;
            }
            case 'media_player': {
                const volume = this._getNumberAttribute(attributes, 'volume_level');
                min = 0;
                max = 1;
                step = 0.01;
                values.single = volume ?? min;
                displayMode = 'percent';
                service = {domain: 'media_player', service: 'volume_set', field: 'volume_level'};
                break;
            }
            case 'cover': {
                const tiltAvailable = this._getNumberAttribute(attributes, 'current_tilt_position') !== null
                    || this._getNumberAttribute(attributes, 'tilt_position') !== null;
                const useTilt = coverControl === 'tilt' || (coverControl === 'auto' && tiltAvailable);
                const position = useTilt
                    ? this._firstNumber(attributes, ['current_tilt_position', 'tilt_position'])
                    : this._firstNumber(attributes, ['current_position', 'position']);
                min = 0;
                max = 100;
                step = 1;
                values.single = position ?? min;
                service = useTilt
                    ? {domain: 'cover', service: 'set_cover_tilt_position', field: 'tilt_position'}
                    : {domain: 'cover', service: 'set_cover_position', field: 'position'};
                unit = '%';
                break;
            }
            case 'fan': {
                const percentage = this._firstNumber(attributes, ['percentage', 'speed', 'speed_percent', 'speed_percentage']);
                min = 0;
                max = 100;
                step = this._getNumberAttribute(attributes, 'percentage_step') ?? 1;
                values.single = percentage ?? min;
                service = {domain: 'fan', service: 'set_percentage', field: 'percentage'};
                unit = '%';
                break;
            }
            case 'humidifier': {
                const targetHumidity = this._firstNumber(attributes, ['humidity', 'target_humidity']);
                min = this._getNumberAttribute(attributes, 'min_humidity') ?? 0;
                max = this._getNumberAttribute(attributes, 'max_humidity') ?? 100;
                step = this._getNumberAttribute(attributes, 'humidity_step') ?? 1;
                values.single = targetHumidity ?? min;
                service = {domain: 'humidifier', service: 'set_humidity', field: 'humidity'};
                unit = '%';
                break;
            }
            case 'climate': {
                const low = this._getNumberAttribute(attributes, 'target_temp_low');
                const high = this._getNumberAttribute(attributes, 'target_temp_high');
                const hasRange = low !== null && high !== null;

                mode = hasRange ? 'range' : 'single';
                min = this._getNumberAttribute(attributes, 'min_temp') ?? 7;
                max = this._getNumberAttribute(attributes, 'max_temp') ?? 35;
                const tempUnit = this._getTemperatureUnit(attributes);
                step = this._getNumberAttribute(attributes, 'target_temp_step')
                    ?? this._getDefaultTempStep(tempUnit);
                unit = tempUnit;

                if (mode === 'range') {
                    values.low = low ?? min;
                    values.high = high ?? max;
                    service = {
                        domain: 'climate',
                        service: 'set_temperature',
                        field: 'temperature',
                        fieldLow: 'target_temp_low',
                        fieldHigh: 'target_temp_high',
                    };
                } else {
                    const temp = this._firstNumber(attributes, ['temperature', 'target_temperature']);
                    values.single = temp ?? min;
                    service = {domain: 'climate', service: 'set_temperature', field: 'temperature'};
                }
                break;
            }
            case 'water_heater': {
                const temp = this._firstNumber(attributes, ['temperature', 'target_temperature']);
                min = this._getNumberAttribute(attributes, 'min_temp') ?? 30;
                max = this._getNumberAttribute(attributes, 'max_temp') ?? 75;
                const tempUnit = this._getTemperatureUnit(attributes);
                step = this._getNumberAttribute(attributes, 'target_temp_step')
                    ?? this._getNumberAttribute(attributes, 'temperature_step')
                    ?? this._getDefaultTempStep(tempUnit);
                unit = tempUnit;
                values.single = temp ?? min;
                service = {domain: 'water_heater', service: 'set_temperature', field: 'temperature'};
                break;
            }
            case 'input_number': {
                const numericState = this._parseNumber(state.state) ?? 0;
                min = this._getNumberAttribute(attributes, 'min') ?? 0;
                max = this._getNumberAttribute(attributes, 'max') ?? 100;
                step = this._getNumberAttribute(attributes, 'step') ?? 1;
                unit = String(attributes.unit_of_measurement ?? '');
                values.single = numericState;
                service = {domain: 'input_number', service: 'set_value', field: 'value'};
                break;
            }
            case 'number': {
                const numericState = this._parseNumber(state.state) ?? 0;
                min = this._getNumberAttribute(attributes, 'min') ?? 0;
                max = this._getNumberAttribute(attributes, 'max') ?? 100;
                step = this._getNumberAttribute(attributes, 'step') ?? 1;
                unit = String(attributes.unit_of_measurement ?? '');
                values.single = numericState;
                service = {domain: 'number', service: 'set_value', field: 'value'};
                break;
            }
            default: {
                const numericState = this._parseNumber(state.state);
                min = this._getNumberAttribute(attributes, 'min') ?? 0;
                max = this._getNumberAttribute(attributes, 'max') ?? 100;
                step = this._getNumberAttribute(attributes, 'step') ?? 1;
                values.single = numericState ?? min;
                unit = String(attributes.unit_of_measurement ?? '');

                const genericService = this._resolveGenericService(domain);
                if (genericService) {
                    service = genericService;
                }
                break;
            }
        }

        if (modeSetting !== 'auto') {
            if (domain === 'climate') {
                mode = modeSetting;
            } else if (modeSetting === 'single') {
                mode = 'single';
            }
        }

        if (mode === 'range' && (values.low === undefined || values.high === undefined)) {
            values.low = values.low ?? min;
            values.high = values.high ?? max;
        }

        if (mode === 'single') {
            if (valueSource === 'attribute' && valueAttribute) {
                const attrValue = this._getNumberAttribute(attributes, valueAttribute);
                if (attrValue !== null) {
                    values.single = attrValue;
                }
            } else if (valueSource === 'state') {
                const stateValue = this._parseNumber(state.state);
                if (stateValue !== null) {
                    values.single = stateValue;
                }
            }
        }

        if (mode === 'range' && valueSource === 'attribute' && valueAttribute) {
            const rangeValue = this._getNumberAttribute(attributes, valueAttribute);
            if (rangeValue !== null) {
                values.low = rangeValue;
                values.high = rangeValue;
            }
        }

        if (this.resolvePropertyAsBoolean('useMinOverride')) {
            min = this.resolvePropertyAsNumber('minOverride', min);
        }
        if (this.resolvePropertyAsBoolean('useMaxOverride')) {
            max = this.resolvePropertyAsNumber('maxOverride', max);
        }
        if (this.resolvePropertyAsBoolean('useStepOverride')) {
            step = this.resolvePropertyAsNumber('stepOverride', step);
        }

        if (min > max) {
            const tmp = min;
            min = max;
            max = tmp;
        }
        if (step <= 0) {
            step = 1;
        }

        if (displayModeSetting !== 'auto') {
            displayMode = displayModeSetting;
        }

        if (domain === 'light') {
            service = displayMode === 'percent'
                ? {domain: 'light', service: 'turn_on', field: 'brightness_pct'}
                : {domain: 'light', service: 'turn_on', field: 'brightness'};
        }

        let displayMin = min;
        let displayMax = max;
        let displayStep = step;

        if (displayMode === 'percent') {
            displayMin = 0;
            displayMax = 100;
            displayStep = 1;
            unit = '%';
        } else if (displayMode === 'custom') {
            displayMin = this.resolvePropertyAsNumber('displayMin', min);
            displayMax = this.resolvePropertyAsNumber('displayMax', max);
            if (displayMin > displayMax) {
                const tmp = displayMin;
                displayMin = displayMax;
                displayMax = tmp;
            }
            if (displayMin === displayMax) {
                displayMax = displayMin + 1;
            }
            displayStep = this._mapStep(step, min, max, displayMin, displayMax);
        }

        if (!unit) {
            unit = this._guessUnitForDomain(domain, displayMode);
        }

        let precision = this._decimalsFromStep(displayStep);
        if (this.resolvePropertyAsBoolean('usePrecisionOverride')) {
            precision = Math.max(0, this.resolvePropertyAsNumber('precisionOverride', precision));
        }

        return {
            domain,
            mode,
            actualMin: min,
            actualMax: max,
            actualStep: step,
            displayMin,
            displayMax,
            displayStep,
            displayMode,
            precision,
            unit,
            values,
            service,
            supportsService: Boolean(service),
        };
    }

    private _resolveGenericService(domain: string): SliderServiceConfig | undefined {
        const services = this.hass?.services?.[domain];
        if (!services) return undefined;

        if (services.set_value) {
            return {domain, service: 'set_value', field: 'value'};
        }

        return undefined;
    }

    // =============================================================================
    // Value Resolution
    // =============================================================================

    private _getDisplayValues(config: ResolvedSliderConfig): DisplayValues {
        if (this._isInteracting) {
            return {
                single: this._localDisplayValue ?? this._toDisplayValue(config.values.single ?? config.actualMin, config),
                low: this._localDisplayLow ?? this._toDisplayValue(config.values.low ?? config.actualMin, config),
                high: this._localDisplayHigh ?? this._toDisplayValue(config.values.high ?? config.actualMax, config),
            };
        }

        if (this._pendingSync) {
            const now = Date.now();
            if (this._pendingSyncMatches(config)) {
                this._clearPendingSync();
            } else if (now - this._pendingSync.startedAt < DEFAULT_SYNC_TIMEOUT_MS) {
                return {
                    single: this._toDisplayValue(this._pendingSync.values.single ?? config.values.single ?? config.actualMin, config),
                    low: this._toDisplayValue(this._pendingSync.values.low ?? config.values.low ?? config.actualMin, config),
                    high: this._toDisplayValue(this._pendingSync.values.high ?? config.values.high ?? config.actualMax, config),
                };
            }
            this._clearPendingSync();
        }

        return {
            single: this._toDisplayValue(config.values.single ?? config.actualMin, config),
            low: this._toDisplayValue(config.values.low ?? config.actualMin, config),
            high: this._toDisplayValue(config.values.high ?? config.actualMax, config),
        };
    }

    private _toDisplayValue(actualValue: number, config: ResolvedSliderConfig): number {
        const actualRange = this._safeRange(config.actualMin, config.actualMax);
        const displayRange = this._safeRange(config.displayMin, config.displayMax);
        const normalized = (actualValue - config.actualMin) / actualRange;
        const displayValue = config.displayMin + normalized * displayRange;
        return this._clamp(displayValue, config.displayMin, config.displayMax);
    }

    private _pendingSyncMatches(config: ResolvedSliderConfig): boolean {
        if (!this._pendingSync) return false;

        const epsilon = Math.max(config.actualStep, 0.01) / 2;
        if (config.mode === 'range') {
            if (this._pendingSync.values.low === undefined || this._pendingSync.values.high === undefined) {
                return false;
            }
            if (config.values.low === undefined || config.values.high === undefined) {
                return false;
            }
            const lowDiff = Math.abs(config.values.low - this._pendingSync.values.low);
            const highDiff = Math.abs(config.values.high - this._pendingSync.values.high);
            return lowDiff <= epsilon && highDiff <= epsilon;
        }

        if (this._pendingSync.values.single === undefined || config.values.single === undefined) {
            return false;
        }
        const diff = Math.abs(config.values.single - this._pendingSync.values.single);
        return diff <= epsilon;
    }

    private _normalizeDisplayValues(values: DisplayValues, config: ResolvedSliderConfig, thumb?: 'low' | 'high' | 'single'): DisplayValues {
        if (config.mode === 'single') {
            const actual = this._toActualValue(values.single ?? config.displayMin, config);
            const snapped = this._snapToStep(actual, config.actualMin, config.actualStep);
            const display = this._toDisplayValue(snapped, config);
            return {single: display};
        }

        const actualLow = this._toActualValue(values.low ?? config.displayMin, config);
        const actualHigh = this._toActualValue(values.high ?? config.displayMax, config);
        const constrained = this._applyRangeConstraints(actualLow, actualHigh, config, thumb === 'high' ? 'high' : 'low');

        return {
            low: this._toDisplayValue(constrained.low, config),
            high: this._toDisplayValue(constrained.high, config),
        };
    }

    private _toActualValues(values: DisplayValues, config: ResolvedSliderConfig, thumb: ActiveThumb): ActualValues {
        if (config.mode === 'single') {
            const actual = this._toActualValue(values.single ?? config.displayMin, config);
            return {single: this._snapToStep(actual, config.actualMin, config.actualStep)};
        }

        const actualLow = this._toActualValue(values.low ?? config.displayMin, config);
        const actualHigh = this._toActualValue(values.high ?? config.displayMax, config);
        const constrained = this._applyRangeConstraints(actualLow, actualHigh, config, thumb === 'high' ? 'high' : 'low');

        return {
            low: this._snapToStep(constrained.low, config.actualMin, config.actualStep),
            high: this._snapToStep(constrained.high, config.actualMin, config.actualStep),
        };
    }

    private _applyRangeConstraints(low: number, high: number, config: ResolvedSliderConfig, changed: 'low' | 'high'): {low: number; high: number} {
        const minGap = Math.max(0, this.resolvePropertyAsNumber('rangeMinGap', 0));
        let nextLow = this._clamp(low, config.actualMin, config.actualMax);
        let nextHigh = this._clamp(high, config.actualMin, config.actualMax);

        if (changed === 'low') {
            if (nextLow > nextHigh - minGap) {
                nextLow = nextHigh - minGap;
            }
        } else {
            if (nextHigh < nextLow + minGap) {
                nextHigh = nextLow + minGap;
            }
        }

        nextLow = this._clamp(nextLow, config.actualMin, config.actualMax);
        nextHigh = this._clamp(nextHigh, config.actualMin, config.actualMax);

        if (nextLow > nextHigh) {
            const tmp = nextLow;
            nextLow = nextHigh;
            nextHigh = tmp;
        }

        return {low: nextLow, high: nextHigh};
    }

    // =============================================================================
    // Service Handling
    // =============================================================================

    private _buildServicePayload(values: ActualValues, config: ResolvedSliderConfig): {domain: string; service: string; data: Record<string, unknown>} | null {
        if (!config.service || !this.entity) return null;

        const data: Record<string, unknown> = {entity_id: this.entity};

        if (config.mode === 'range' && config.service.fieldLow && config.service.fieldHigh) {
            data[config.service.fieldLow] = values.low;
            data[config.service.fieldHigh] = values.high;
        } else {
            data[config.service.field] = values.single;
        }

        return {
            domain: config.service.domain,
            service: config.service.service,
            data,
        };
    }

    private _emitServiceError(error: unknown, payload: {domain: string; service: string; data: Record<string, unknown>}): void {
        const detail = {
            entityId: this.entity,
            error,
            payload,
            blockId: this.block?.id,
        };

        this.eventBus?.dispatchEvent('slider-service-error', detail);
        this.dispatchEvent(new CustomEvent('slider-service-error', {detail, bubbles: true, composed: true}));
    }

    private _setPendingSync(values: ActualValues): void {
        this._pendingSync = {values, startedAt: Date.now()};
        this._syncPending = true;

        if (this._pendingSyncTimeoutId !== null) {
            window.clearTimeout(this._pendingSyncTimeoutId);
        }
        this._pendingSyncTimeoutId = window.setTimeout(() => {
            this._clearPendingSync();
            this.requestUpdate();
        }, DEFAULT_SYNC_TIMEOUT_MS);
    }

    private _clearPendingSync(): void {
        this._pendingSync = null;
        this._syncPending = false;
        if (this._pendingSyncTimeoutId !== null) {
            window.clearTimeout(this._pendingSyncTimeoutId);
            this._pendingSyncTimeoutId = null;
        }
    }

    private _revertToLastCommitted(config: ResolvedSliderConfig): void {
        if (!this._lastCommittedValues) return;
        const display = this._getDisplayValues({...config, values: this._lastCommittedValues});
        this._localDisplayValue = display.single ?? null;
        this._localDisplayLow = display.low ?? null;
        this._localDisplayHigh = display.high ?? null;
        this._lastCommittedValues = null;
        this.requestUpdate();
    }

    // =============================================================================
    // Formatting Helpers
    // =============================================================================

    private _formatSingleValue(value: number, config: ResolvedSliderConfig): string {
        const formatted = this._formatNumber(value, config.precision);
        return config.unit ? `${formatted}${config.unit}` : formatted;
    }

    private _formatRangeValue(values: DisplayValues, config: ResolvedSliderConfig): string {
        if (config.mode === 'range') {
            const low = values.low ?? config.displayMin;
            const high = values.high ?? config.displayMax;
            const lowText = this._formatNumber(low, config.precision);
            const highText = this._formatNumber(high, config.precision);
            return config.unit ? `${lowText}-${highText}${config.unit}` : `${lowText}-${highText}`;
        }

        const single = values.single ?? config.displayMin;
        return this._formatSingleValue(single, config);
    }

    private _formatNumber(value: number, precision: number): string {
        if (!Number.isFinite(value)) return '-';
        const fixed = value.toFixed(precision);
        if (precision > 0) {
            return fixed.replace(/\.?0+$/, '');
        }
        return fixed;
    }

    // =============================================================================
    // Misc Helpers
    // =============================================================================

    private _isDisabled(): boolean {
        const mode = this.resolveProperty('disableMode', 'auto') as DisableMode;
        if (mode === 'never') return false;
        if (mode === 'custom') {
            return this.resolvePropertyAsBoolean('disabled');
        }
        return !this.isEntityAvailable();
    }

    private _getDefaultActiveColor(domain: string | null): string {
        if (!domain) return 'var(--accent-color, #2196f3)';
        return DOMAIN_ACTIVE_COLORS[domain] || 'var(--accent-color, #2196f3)';
    }

    private _withDefaultActiveColor(style: Record<string, string>, color: string): Record<string, string> {
        const hasBackground = 'backgroundColor' in style || 'background' in style;
        if (!hasBackground) {
            return {...style, backgroundColor: color};
        }
        return style;
    }

    private _safeRange(min: number, max: number): number {
        const range = max - min;
        return range === 0 ? 1 : range;
    }

    private _guessUnitForDomain(domain: string, displayMode: DisplayMode): string {
        if (displayMode === 'percent') return '%';
        if (domain === 'fan' || domain === 'cover' || domain === 'humidifier') return '%';
        return '';
    }

    private _getTemperatureUnit(attributes: HassEntity['attributes']): string {
        return String(
            attributes.temperature_unit
            || attributes.unit_of_measurement
            || this.hass?.config?.unit_system?.temperature
            || '°C'
        );
    }

    private _getDefaultTempStep(unit: string): number {
        return unit.includes('F') ? 1 : 0.5;
    }

    private _getNumberAttribute(attributes: Record<string, any>, name: string): number | null {
        if (!attributes || !(name in attributes)) return null;
        const value = this._parseNumber(attributes[name]);
        return value === null ? null : value;
    }

    private _firstNumber(attributes: Record<string, any>, keys: string[]): number | null {
        for (const key of keys) {
            const value = this._getNumberAttribute(attributes, key);
            if (value !== null) return value;
        }
        return null;
    }

    private _parseNumber(value: unknown): number | null {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    }

    private _decimalsFromStep(step: number): number {
        if (!Number.isFinite(step) || step <= 0) return 0;
        const str = step.toString();
        if (str.includes('e-')) {
            const exp = parseInt(str.split('e-')[1] || '0', 10);
            return Number.isFinite(exp) ? exp : 0;
        }
        const dot = str.indexOf('.');
        if (dot === -1) return 0;
        return str.length - dot - 1;
    }

    private _mapStep(step: number, min: number, max: number, displayMin: number, displayMax: number): number {
        const actualRange = max - min;
        const displayRange = displayMax - displayMin;
        if (actualRange === 0) return 1;
        const mapped = (step / actualRange) * displayRange;
        return mapped > 0 ? mapped : 1;
    }

    private _snapToStep(value: number, min: number, step: number): number {
        if (!Number.isFinite(value)) return min;
        if (step <= 0) return value;
        const steps = Math.round((value - min) / step);
        return min + steps * step;
    }

    private _clamp(value: number, min: number, max: number): number {
        return Math.min(max, Math.max(min, value));
    }

    private _toActualValue(displayValue: number, config: ResolvedSliderConfig): number {
        const actualRange = this._safeRange(config.actualMin, config.actualMax);
        const displayRange = this._safeRange(config.displayMin, config.displayMax);
        const clampedDisplay = this._clamp(displayValue, config.displayMin, config.displayMax);
        const normalized = (clampedDisplay - config.displayMin) / displayRange;
        return config.actualMin + normalized * actualRange;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-slider': BlockSlider;
    }
}
