import { type BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { BaseArcGauge, type ArcGeometry, type ArcValuePosition } from '@/common/blocks/components/gauges/base-arc-gauge';
import type { GaugeColorChange } from '@/common/blocks/components/gauges/base-gauge';
import type { PropertyGroup } from '@/common/blocks/core/properties';
import { css, html, nothing, svg } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

interface BlendArcSegment {
    start: number;
    end: number;
    startColor: string;
    endColor: string;
}

type BlendKind = 'bar' | 'background';

interface ArcPaintDefinition {
    paint: string;
    defs: ReturnType<typeof svg>[];
    glowColor: string;
}

@customElement('block-gauge-radial')
export class BlockGaugeRadial extends BaseArcGauge {
    static styles = [
        ...BaseArcGauge.styles,
        css`
            :host {
                display: block;
                min-width: 90px;
                min-height: 90px;
            }

            .radial-root {
                position: relative;
                display: block;
                width: 100%;
                min-height: 0;
                aspect-ratio: var(--radial-aspect-ratio, 1 / 1);
            }

            svg {
                width: 100%;
                height: 100%;
                min-height: 0;
                display: block;
                overflow: visible;
            }

            .track,
            .progress,
            .track-segment,
            .progress-segment {
                fill: none;
                stroke-width: 10;
            }

            .track {
                stroke: rgba(0, 0, 0, 0.2);
            }

            .progress {
                stroke: var(--accent-color, #2196f3);
                stroke-linecap: round;
            }

            .value,
            .label {
                position: absolute;
                white-space: nowrap;
                display: inline-flex;
                align-items: baseline;
                gap: 4px;
                pointer-events: none;
            }

            .value.unit-below {
                flex-direction: column;
                align-items: center;
                gap: 0;
                line-height: 1.1;
            }

            .value.center {
                left: 50%;
                top: 52%;
                transform: translate(-50%, -50%);
            }

            .value.inside-start {
                left: 28%;
                top: 52%;
                transform: translate(-50%, -50%);
            }

            .value.inside-end {
                left: 72%;
                top: 52%;
                transform: translate(-50%, -50%);
            }

            .value.top,
            .value.outside-top {
                left: 50%;
                top: 4px;
                transform: translateX(-50%);
            }

            .value.bottom,
            .value.outside-bottom {
                left: 50%;
                bottom: 4px;
                transform: translateX(-50%);
            }

        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            sinceVersion: '2.4.0',
            definition: {
                label: 'Gauge Radial',
                icon: '<ha-icon icon="mdi:gauge-full"></ha-icon>',
                category: 'gauges',
            },
            defaults: {
                requireEntity: true,
                props: {
                    valueSource: {value: 'state'},
                    valueAttribute: {value: ''},
                    minValue: {value: 0},
                    maxValue: {value: 100},
                    clampValue: {value: true},
                    showValue: {value: true},
                    valueFollowThresholdColor: {value: false},
                    displayMode: {value: 'value'},
                    decimalPlaces: {value: 1},
                    showUnit: {value: true},
                    customUnit: {value: ''},
                    unitPosition: {value: 'inline'},
                    thresholds: {value: []},
                    thresholdsEnabled: {value: false},
                    showThresholdMarkers: {value: false},
                    markerWidthRatio: {value: 1.2},
                    markerThicknessPx: {value: 2},
                    thresholdColorMode: {value: 'active'},
                    animate: {value: true},
                    animationDurationMs: {value: 350},
                    arcAngle: {value: 180},
                    startAngle: {value: 0},
                    arcDirection: {value: 'clockwise'},
                    arcWidth: {value: 10},
                    valuePositionArc: {value: 'bottom'},
                    progressGlow: {value: false},
                    progressGlowIntensity: {value: 6},
                    thresholdBaseColor: {value: ''},
                    showStepColorsOnBarBlend: {value: false},
                    showStepColorsOnBarBlendDistance: {value: 4},
                    showStepColorsOnBackgroundOpacity: {value: 0.28},
                    showStepColorsOnBackgroundBlend: {value: false},
                    showStepColorsOnBackgroundBlendDistance: {value: 4},
                    thresholdsApplyTo: {value: 'none'},
                    labelMode: {value: 'hidden'},
                    labelPosition: {value: 'outside-bottom'},
                    customLabel: {value: ''},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
            actionTargets: {
                value: {label: 'Value', description: 'Gauge value label'},
                progress: {label: 'Progress', description: 'Gauge progress arc'},
                label: {label: 'Label', description: 'Gauge label'},
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        const arcBaseGroup = this.getArcGaugePropertyGroups().find((group) => group.id === 'arc');
        const arcBaseTraits = arcBaseGroup?.traits ?? [];
        const arcValuePositionTrait = arcBaseTraits.find((trait) => trait.name === 'valuePositionArc');
        const arcTraits = arcBaseTraits.filter((trait) => trait.name !== 'valuePositionArc');
        const dataGroup = this.buildMergedBaseDataGroup({
            insertAfterShowValueTraits: arcValuePositionTrait ? [arcValuePositionTrait] : [],
        });

        const arcGroup: PropertyGroup = {
            id: 'arc',
            label: arcBaseGroup?.label ?? 'Arc',
            traits: [
                ...arcTraits,
                {
                    type: 'slider',
                    name: 'arcWidth',
                    label: 'Arc Width',
                    min: 2,
                    max: 40,
                    step: 0.5,
                },
                {
                    type: 'checkbox',
                    name: 'progressGlow',
                    label: 'Glow',
                },
                {
                    type: 'slider',
                    name: 'progressGlowIntensity',
                    label: 'Glow Intensity',
                    min: 1,
                    max: 40,
                    step: 0.5,
                    visible: {prop: 'progressGlow', eq: true},
                },
            ],
        };

        const thresholdsBaseTraits = this.extendThresholdTraitsWithAdvancedColors(
            this.getBaseGaugePropertyGroup('thresholds')?.traits ?? [],
            {
                singleColorModeLabel: 'Single Color Mode',
                singleColorModeVisible: {prop: 'thresholdsApplyTo', in: ['none', 'background']},
            }
        );
        const thresholdsGroup: PropertyGroup = {
            id: 'thresholds',
            label: 'Thresholds',
            traits: thresholdsBaseTraits,
        };

        const labelGroup: PropertyGroup = {
            id: 'label',
            label: 'Label',
            traits: [
                ...this.buildGaugeLabelModeTraits(),
                {
                    type: 'select',
                    name: 'labelPosition',
                    label: 'Label Position',
                    options: [
                        {value: 'center', label: 'Center'},
                        {value: 'left', label: 'Left'},
                        {value: 'right', label: 'Right'},
                        {value: 'top', label: 'Top'},
                        {value: 'bottom', label: 'Bottom'},
                        {value: 'outside-top', label: 'Outside Top'},
                        {value: 'outside-bottom', label: 'Outside Bottom'},
                    ],
                    visible: {prop: 'labelMode', neq: 'hidden'},
                },
            ],
        };

        const groups: PropertyGroup[] = [
            dataGroup,
            labelGroup,
            arcGroup,
            thresholdsGroup,
        ];
        const behaviorGroup = this.getBaseGaugePropertyGroup('behavior');
        if (behaviorGroup) {
            groups.push(behaviorGroup);
        }

        return {
            properties: {
                groups,
            },
            targetStyles: {
                ...this.getBaseGaugeTargetStyles(),
                ...this.getArcGaugeTargetStyles(),
                label: {
                    label: 'Label',
                    description: 'Entity/custom label',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
            },
        };
    }

    render() {
        if (!this.entity) {
            return html`<div class="no-entity">No entity selected</div>`;
        }

        const metrics = this.resolveGaugeMetrics();
        const geometry = this.createArcGeometry(100, 12);
        const trackPath = this.getArcTrackPath(geometry);
        const progressNormalized = this.clamp(metrics.normalized, 0, 1);
        const activeColor = this.resolveActiveThresholdColor(metrics);
        const showMarkers = this.resolvePropertyAsBoolean('showThresholdMarkers');
        const lineCap = 'butt';
        const glowEnabled = this.resolvePropertyAsBoolean('progressGlow');
        const glowIntensity = this.resolveGlowIntensity();

        const thresholdPlacement = this.resolveThresholdPlacement();
        const barThresholdsActive = thresholdPlacement === 'bar' || thresholdPlacement === 'both';
        const backgroundThresholdsActive = thresholdPlacement === 'background' || thresholdPlacement === 'both';
        const arcWidth = this.resolveArcWidth();
        const thresholdBaseColor = this.resolveThresholdBaseColor();

        const trackStyle: Record<string, string> = {
            ...this.getTargetStyle('track'),
            strokeLinecap: lineCap,
        };
        if (!trackStyle.strokeWidth) {
            trackStyle.strokeWidth = String(arcWidth);
        }

        const progressTargetStyle: Record<string, string> = {
            ...this.getTargetStyle('progress'),
        };
        const duration = this.getAnimationDurationMs();
        const progressStyle: Record<string, string> = {
            ...progressTargetStyle,
            strokeLinecap: lineCap,
            transition: duration > 0 ? `stroke-dasharray ${duration}ms linear, stroke ${duration}ms linear` : 'none',
        };
        if (!barThresholdsActive) {
            const singleColor = activeColor || thresholdBaseColor;
            if (singleColor && !progressTargetStyle.stroke) {
                progressStyle.stroke = singleColor;
            }
        }
        if (!progressStyle.strokeWidth) {
            progressStyle.strokeWidth = String(arcWidth);
        }

        const trackStroke = this.resolveStrokeWidth(trackStyle, arcWidth);
        const progressStroke = this.resolveStrokeWidth(progressStyle, arcWidth);
        const maxStroke = Math.max(trackStroke, progressStroke);
        const glowPadding = glowEnabled ? glowIntensity + 2 : 0;
        const layout = this.resolveArcLayout(geometry, maxStroke, trackStroke, showMarkers, glowPadding);
        const safeLayout = this.ensureValidLayout(layout);

        const valueParts = this.resolveGaugeValueParts(metrics);
        const showValue = this.resolvePropertyAsBoolean('showValue');
        const valueStyle = {
            ...this.getTargetStyle('value'),
        };
        const valueTextColor = this.resolveValueTextColor(metrics);
        if (valueTextColor) {
            valueStyle.color = valueTextColor;
        }
        const unitStyle = this.getTargetStyle('unit');
        const unitPosition = this.resolveUnitPosition();
        const valuePosition = this.resolveArcValuePosition();
        const valueAnchor = this.resolveArcValueAnchor(geometry, valuePosition, {
            strokeWidth: trackStroke,
            clampToArcBounds: true,
            sampleSteps: 240,
        });
        const valuePlacementStyle = this.resolvePlacementStyle(valueAnchor, safeLayout);

        const labelText = this.resolveGaugeLabelText();
        const labelStyle = this.getTargetStyle('label');
        const labelPosition = this.resolveLabelPosition();
        const labelAnchor = this.resolveArcValueAnchor(geometry, labelPosition, {
            strokeWidth: trackStroke,
            clampToArcBounds: true,
            sampleSteps: 240,
        });
        const labelPlacementStyle = this.resolvePlacementStyle(labelAnchor, safeLayout);

        const barBlendEnabled = this.resolvePropertyAsBoolean('showStepColorsOnBarBlend');
        const barBlendDistance = this.resolvePropertyAsNumber('showStepColorsOnBarBlendDistance', 4);
        const backgroundBlendEnabled = this.resolvePropertyAsBoolean('showStepColorsOnBackgroundBlend');
        const backgroundBlendDistance = this.resolvePropertyAsNumber('showStepColorsOnBackgroundBlendDistance', 4);
        const backgroundOpacity = this.clamp(
            this.resolvePropertyAsNumber('showStepColorsOnBackgroundOpacity', 0.28),
            0,
            1
        );

        const defaultProgressColor = thresholdBaseColor || progressTargetStyle.stroke || '#2196f3';
        const defaultTrackColor = trackStyle.stroke || 'rgba(0, 0, 0, 0.2)';
        const customProgressPaint = !barThresholdsActive
            ? this.resolveArcStrokePaint(
                this.resolvePreferredPaint(progressStyle, defaultProgressColor, ['stroke', 'background', 'backgroundImage', 'backgroundColor']),
                this.resolveCustomArcGradientId('progress'),
                safeLayout
            )
            : {paint: defaultProgressColor, defs: [], glowColor: defaultProgressColor};
        const customTrackPaint = !backgroundThresholdsActive
            ? this.resolveArcStrokePaint(
                this.resolvePreferredPaint(trackStyle, defaultTrackColor, ['stroke', 'background', 'backgroundImage', 'backgroundColor']),
                this.resolveCustomArcGradientId('track'),
                safeLayout
            )
            : {paint: defaultTrackColor, defs: [], glowColor: defaultTrackColor};
        const customArcPaintDefs = [...customProgressPaint.defs, ...customTrackPaint.defs];
        const progressColorChanges = this.buildThresholdColorChanges(defaultProgressColor, metrics.min, metrics.span);
        const trackColorChanges = this.buildThresholdColorChanges(defaultTrackColor, metrics.min, metrics.span);

        if (!backgroundThresholdsActive) {
            trackStyle.stroke = customTrackPaint.paint;
        }
        if (glowEnabled) {
            if (!barThresholdsActive) {
                progressStyle.filter = `drop-shadow(0 0 ${glowIntensity}px ${customProgressPaint.glowColor})`;
            } else {
                delete progressStyle.filter;
            }
        }

        const progressSegmentsStyle: Record<string, string> = {
            ...progressStyle,
        };
        delete progressSegmentsStyle.filter;
        const progressPathStyle: Record<string, string> = {
            ...progressStyle,
            strokeDasharray: `${progressNormalized} 1`,
        };
        if (!barThresholdsActive) {
            progressSegmentsStyle.stroke = customProgressPaint.paint;
            progressPathStyle.stroke = customProgressPaint.paint;
        }
        if (progressNormalized <= 0) {
            progressPathStyle.opacity = '0';
        }
        const progressMaskStyle: Record<string, string> = {
            fill: 'none',
            stroke: '#fff',
            strokeWidth: String(progressStroke),
            strokeLinecap: lineCap,
            strokeDasharray: `${progressNormalized} 1`,
            transition: duration > 0 ? `stroke-dasharray ${duration}ms linear` : 'none',
        };
        if (progressNormalized <= 0) {
            progressMaskStyle.opacity = '0';
        }
        const progressMaskId = this.resolveProgressMaskId();
        const progressGlowMaskId = this.resolveProgressGlowMaskId();
        const progressGlowFilterId = this.resolveProgressGlowFilterId();
        const glowMaskStrokeWidth = progressStroke + glowIntensity * 4;
        const progressGlowMaskStyle: Record<string, string> = {
            fill: 'none',
            stroke: '#fff',
            strokeWidth: String(glowMaskStrokeWidth),
            strokeLinecap: lineCap,
            strokeDasharray: `${progressNormalized} 1`,
            transition: duration > 0 ? `stroke-dasharray ${duration}ms linear` : 'none',
        };
        if (progressNormalized <= 0) {
            progressGlowMaskStyle.opacity = '0';
        }

        const barBlendSegments = barThresholdsActive && barBlendEnabled
            ? this.renderBlendedArcSegments(
                'bar',
                geometry,
                1,
                progressSegmentsStyle,
                progressColorChanges,
                barBlendDistance,
                1,
                'progress-segment',
                'progress',
                false
            )
            : null;
        const backgroundBlendSegments = backgroundThresholdsActive && backgroundBlendEnabled
            ? this.renderBlendedArcSegments(
                'background',
                geometry,
                1,
                trackStyle,
                trackColorChanges,
                backgroundBlendDistance,
                1,
                'track-segment',
                'track',
                false
            )
            : null;

        return html`
            <div
                class="radial-root"
                style=${styleMap({'--radial-aspect-ratio': `${safeLayout.width} / ${safeLayout.height}`})}
            >
                <svg
                    width=${String(safeLayout.width)}
                    height=${String(safeLayout.height)}
                    viewBox="${safeLayout.minX} ${safeLayout.minY} ${safeLayout.width} ${safeLayout.height}"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden="true"
                >
                    ${barThresholdsActive || barBlendSegments || backgroundBlendSegments || customArcPaintDefs.length > 0 ? svg`
                        <defs>
                            ${customArcPaintDefs}
                            ${barBlendSegments ? barBlendSegments.defs : nothing}
                            ${backgroundBlendSegments ? backgroundBlendSegments.defs : nothing}
                            ${barThresholdsActive ? svg`
                                <mask
                                    id=${progressMaskId}
                                    maskUnits="userSpaceOnUse"
                                    x=${safeLayout.minX}
                                    y=${safeLayout.minY}
                                    width=${safeLayout.width}
                                    height=${safeLayout.height}
                                >
                                    <path
                                        d=${trackPath}
                                        pathLength="1"
                                        style=${styleMap(progressMaskStyle)}
                                    ></path>
                                </mask>
                                <mask
                                    id=${progressGlowMaskId}
                                    maskUnits="userSpaceOnUse"
                                    x=${safeLayout.minX}
                                    y=${safeLayout.minY}
                                    width=${safeLayout.width}
                                    height=${safeLayout.height}
                                >
                                    <path
                                        d=${trackPath}
                                        pathLength="1"
                                        style=${styleMap(progressGlowMaskStyle)}
                                    ></path>
                                </mask>
                            ` : nothing}
                            ${barThresholdsActive && glowEnabled ? this.renderProgressGlowFilterDef(
                                progressGlowFilterId,
                                glowIntensity,
                                safeLayout
                            ) : nothing}
                        </defs>
                    ` : nothing}

                    ${backgroundThresholdsActive
                        ? svg`
                            <g opacity=${String(backgroundOpacity)}>
                                ${backgroundBlendSegments ? backgroundBlendSegments.segments : this.renderColoredArcSegments(
                                    geometry,
                                    1,
                                    trackStyle,
                                    trackColorChanges,
                                    false,
                                    backgroundBlendDistance,
                                    1,
                                    'track-segment',
                                    'track',
                                    false
                                )}
                            </g>
                        `
                        : svg`
                            <path
                                class="track ${this.isStyleTargetActive('track') ? 'style-target-active' : ''}"
                                d=${trackPath}
                                style=${styleMap(trackStyle)}
                                data-style-target="track"
                            ></path>
                        `}

                    ${barThresholdsActive
                        ? svg`
                            <g mask="url(#${progressMaskId})">
                                ${barBlendSegments ? barBlendSegments.segments : this.renderColoredArcSegments(
                                    geometry,
                                    1,
                                    progressSegmentsStyle,
                                    progressColorChanges,
                                    false,
                                    barBlendDistance,
                                    1,
                                    'progress-segment',
                                    'progress',
                                    false
                                )}
                            </g>
                            ${glowEnabled ? svg`
                                <g
                                    mask="url(#${progressGlowMaskId})"
                                    filter="url(#${progressGlowFilterId})"
                                    pointer-events="none"
                                >
                                    ${barBlendSegments ? barBlendSegments.segments : this.renderColoredArcSegments(
                                        geometry,
                                        1,
                                        progressSegmentsStyle,
                                        progressColorChanges,
                                        false,
                                        barBlendDistance,
                                        1,
                                        'progress-segment',
                                        'progress',
                                        false
                                    )}
                                </g>
                            ` : nothing}
                        `
                        : svg`
                            <path
                                class="progress ${this.isStyleTargetActive('progress') ? 'style-target-active' : ''}"
                                d=${trackPath}
                                pathLength="1"
                                style=${styleMap(progressPathStyle)}
                                data-style-target="progress"
                                data-action-target="progress"
                            ></path>
                        `}

                    ${showMarkers ? this.renderThresholdMarkers(metrics.min, metrics.span, geometry, trackStroke) : nothing}
                </svg>

                ${labelText ? html`
                    <div
                        class=${classMap({
                            label: true,
                            'style-target-active': this.isStyleTargetActive('label'),
                        })}
                        style=${styleMap({
                            ...labelStyle,
                            ...labelPlacementStyle,
                        })}
                        data-style-target="label"
                        data-action-target="label"
                    >${labelText}</div>
                ` : nothing}

                ${showValue ? html`
                    <div
                        class=${classMap({
                            value: true,
                            'unit-below': unitPosition === 'below',
                            [valuePosition]: true,
                            'style-target-active': this.isStyleTargetActive('value'),
                        })}
                        style=${styleMap({
                            ...valueStyle,
                            ...valuePlacementStyle,
                        })}
                        data-style-target="value"
                        data-action-target="value"
                    >
                        <span>${valueParts.valueText}</span>
                        ${valueParts.unitText ? html`
                            <span
                                class="${this.isStyleTargetActive('unit') ? 'style-target-active' : ''}"
                                style=${styleMap(unitStyle)}
                                data-style-target="unit"
                                data-action-target="unit"
                            >${valueParts.unitText}</span>
                        ` : nothing}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private renderThresholdMarkers(
        min: number,
        span: number,
        geometry: ArcGeometry,
        arcStrokeWidth: number
    ) {
        const markersStyle = this.getTargetStyle('markers');
        const markersActive = this.isStyleTargetActive('markers');
        const markerLength = this.resolveMarkerLength(arcStrokeWidth);
        const markerThickness = this.resolveMarkerThickness();

        return this.getThresholds().map((threshold) => {
            const normalized = this.clamp((threshold.value - min) / span, 0, 1);
            const markerSegment = this.resolveMarkerSegment(geometry, normalized, markerLength);
            const style: Record<string, string> = {
                ...markersStyle,
            };
            if (threshold.color && !style.stroke) {
                style.stroke = threshold.color;
            }
            if (!style.strokeWidth) {
                style.strokeWidth = String(markerThickness);
            }
            if (!style.strokeLinecap) {
                style.strokeLinecap = 'round';
            }

            return svg`
                <g data-style-target="markers">
                    <line
                        class="${markersActive ? 'style-target-active' : ''}"
                        x1=${markerSegment.inner.x}
                        y1=${markerSegment.inner.y}
                        x2=${markerSegment.outer.x}
                        y2=${markerSegment.outer.y}
                        style=${styleMap(style)}
                    ></line>
                </g>
            `;
        });
    }

    private renderColoredArcSegments(
        geometry: ArcGeometry,
        endNormalized: number,
        baseStyle: Record<string, string>,
        colorChanges: GaugeColorChange[],
        blendEnabled: boolean,
        blendDistance: number,
        alpha: number,
        className: string,
        targetId: 'track' | 'progress',
        roundOuterCaps: boolean
    ) {
        const clampedEnd = this.clamp(endNormalized, 0, 1);
        if (clampedEnd <= 0) {
            return nothing;
        }

        const segments = blendEnabled
            ? this.buildBlendedSegments(clampedEnd, colorChanges, blendDistance)
            : this.buildStepSegments(clampedEnd, colorChanges);
        const strokeWidth = this.resolveStrokeWidth(baseStyle, this.resolveArcWidth());
        const overlap = this.resolveSegmentOverlapNormalized(geometry, strokeWidth);

        const segmentTemplates: ReturnType<typeof svg>[] = [];
        segments.forEach((segment, index) => {
            const expandedStart = segment.start;
            const expandedEnd = index === segments.length - 1 ? segment.end : Math.min(clampedEnd, segment.end + overlap);
            if (expandedEnd <= expandedStart) {
                return;
            }
            const color = this.applyAlpha(segment.color, alpha);
            const style: Record<string, string> = {
                ...baseStyle,
                stroke: color,
                strokeLinecap: 'butt',
            };
            const pathTemplate = svg`
                <path
                    class="${className} ${this.isStyleTargetActive(targetId) ? 'style-target-active' : ''}"
                    d=${this.getArcSegmentPath(geometry, expandedStart, expandedEnd)}
                    style=${styleMap(style)}
                    data-style-target=${targetId}
                    data-action-target=${targetId}
                ></path>
            `;
            segmentTemplates.push(pathTemplate);
        });

        if (!roundOuterCaps || baseStyle.strokeLinecap !== 'round' || segments.length === 0) {
            return segmentTemplates;
        }

        const capRadius = strokeWidth / 2;
        if (capRadius <= 0) {
            return segmentTemplates;
        }

        const startPoint = this.getArcMarkerPoint(geometry, 0);
        const endPoint = this.getArcMarkerPoint(geometry, clampedEnd);
        const firstColor = this.applyAlpha(segments[0].color, alpha);
        const lastColor = this.applyAlpha(segments[segments.length - 1].color, alpha);
        const startCapStyle: Record<string, string> = {
            fill: firstColor,
            stroke: 'none',
        };
        const endCapStyle: Record<string, string> = {
            fill: lastColor,
            stroke: 'none',
        };
        if (baseStyle.filter) {
            startCapStyle.filter = baseStyle.filter;
            endCapStyle.filter = baseStyle.filter;
        }

        const capClass = `${className}-cap ${this.isStyleTargetActive(targetId) ? 'style-target-active' : ''}`;
        return [
            ...segmentTemplates,
            svg`
                <circle
                    class=${capClass}
                    cx=${startPoint.x}
                    cy=${startPoint.y}
                    r=${capRadius}
                    style=${styleMap(startCapStyle)}
                    data-style-target=${targetId}
                    data-action-target=${targetId}
                ></circle>
            `,
            svg`
                <circle
                    class=${capClass}
                    cx=${endPoint.x}
                    cy=${endPoint.y}
                    r=${capRadius}
                    style=${styleMap(endCapStyle)}
                    data-style-target=${targetId}
                    data-action-target=${targetId}
                ></circle>
            `,
        ];
    }

    private renderBlendedArcSegments(
        kind: BlendKind,
        geometry: ArcGeometry,
        endNormalized: number,
        baseStyle: Record<string, string>,
        colorChanges: GaugeColorChange[],
        blendDistance: number,
        alpha: number,
        className: string,
        targetId: 'track' | 'progress',
        roundOuterCaps: boolean
    ): { defs: ReturnType<typeof svg>[]; segments: ReturnType<typeof svg>[] } {
        const clampedEnd = this.clamp(endNormalized, 0, 1);
        if (clampedEnd <= 0) {
            return {defs: [], segments: []};
        }

        const segments = this.buildBlendSegments(clampedEnd, colorChanges, blendDistance);
        const strokeWidth = this.resolveStrokeWidth(baseStyle, this.resolveArcWidth());
        const overlap = this.resolveSegmentOverlapNormalized(geometry, strokeWidth);
        const defs: ReturnType<typeof svg>[] = [];
        const flatTemplates: ReturnType<typeof svg>[] = [];
        const blendTemplates: ReturnType<typeof svg>[] = [];
        segments.forEach((segment, index) => {
            const isBlendSegment = segment.startColor !== segment.endColor;
            const expandedStart = segment.start;
            const expandedEnd = index === segments.length - 1 ? segment.end : Math.min(clampedEnd, segment.end + overlap);
            if (expandedEnd <= expandedStart) {
                return;
            }
            const style: Record<string, string> = {
                ...baseStyle,
                strokeLinecap: 'butt',
            };
            const startColor = this.applyAlpha(segment.startColor, alpha);
            const endColor = this.applyAlpha(segment.endColor, alpha);

            if (startColor === endColor) {
                style.stroke = startColor;
            } else {
                const gradientId = this.resolveBlendSegmentGradientId(kind, index);
                const startPoint = this.getArcMarkerPoint(geometry, expandedStart);
                const endPoint = this.getArcMarkerPoint(geometry, expandedEnd);
                defs.push(svg`
                    <linearGradient
                        id=${gradientId}
                        gradientUnits="userSpaceOnUse"
                        x1=${startPoint.x}
                        y1=${startPoint.y}
                        x2=${endPoint.x}
                        y2=${endPoint.y}
                        color-interpolation="sRGB"
                    >
                        <stop offset="0" stop-color=${startColor}></stop>
                        <stop offset="1" stop-color=${endColor}></stop>
                    </linearGradient>
                `);
                style.stroke = `url(#${gradientId})`;
            }

            const pathTemplate = svg`
                <path
                    class="${className} ${this.isStyleTargetActive(targetId) ? 'style-target-active' : ''}"
                    d=${this.getArcSegmentPath(geometry, expandedStart, expandedEnd)}
                    style=${styleMap(style)}
                    data-style-target=${targetId}
                    data-action-target=${targetId}
                ></path>
            `;
            if (isBlendSegment) {
                blendTemplates.push(pathTemplate);
            } else {
                flatTemplates.push(pathTemplate);
            }
        });
        const pathTemplates = [...flatTemplates, ...blendTemplates];

        if (!roundOuterCaps || baseStyle.strokeLinecap !== 'round' || segments.length === 0) {
            return {defs, segments: pathTemplates};
        }

        const capRadius = strokeWidth / 2;
        if (capRadius <= 0) {
            return {defs, segments: pathTemplates};
        }

        const first = segments[0];
        const last = segments[segments.length - 1];
        const startPoint = this.getArcMarkerPoint(geometry, first.start);
        const endPoint = this.getArcMarkerPoint(geometry, last.end);
        const startCapStyle: Record<string, string> = {
            fill: this.applyAlpha(first.startColor, alpha),
            stroke: 'none',
        };
        const endCapStyle: Record<string, string> = {
            fill: this.applyAlpha(last.endColor, alpha),
            stroke: 'none',
        };
        if (baseStyle.filter) {
            startCapStyle.filter = baseStyle.filter;
            endCapStyle.filter = baseStyle.filter;
        }

        const capClass = `${className}-cap ${this.isStyleTargetActive(targetId) ? 'style-target-active' : ''}`;
        pathTemplates.push(svg`
            <circle
                class=${capClass}
                cx=${startPoint.x}
                cy=${startPoint.y}
                r=${capRadius}
                style=${styleMap(startCapStyle)}
                data-style-target=${targetId}
                data-action-target=${targetId}
            ></circle>
        `);
        pathTemplates.push(svg`
            <circle
                class=${capClass}
                cx=${endPoint.x}
                cy=${endPoint.y}
                r=${capRadius}
                style=${styleMap(endCapStyle)}
                data-style-target=${targetId}
                data-action-target=${targetId}
            ></circle>
        `);

        return {defs, segments: pathTemplates};
    }

    private buildBlendSegments(
        endNormalized: number,
        changes: GaugeColorChange[],
        blendDistance: number
    ): BlendArcSegment[] {
        const clampedEnd = this.clamp(endNormalized, 0, 1);
        if (clampedEnd <= 0) {
            return [];
        }

        const blendSize = this.clamp(blendDistance / 100, 0, 0.6);
        const segments: BlendArcSegment[] = [];
        const epsilon = 1e-6;
        let cursor = 0;
        let currentColor = changes[0]?.color ?? '#2196f3';

        for (let index = 1; index < changes.length; index += 1) {
            const threshold = this.clamp(changes[index].position, 0, 1);
            const nextColor = changes[index].color;

            if (threshold <= cursor + epsilon) {
                currentColor = nextColor;
                continue;
            }

            if (threshold >= clampedEnd + epsilon) {
                break;
            }

            if (blendSize <= 0) {
                const segmentEnd = Math.min(threshold, clampedEnd);
                if (segmentEnd > cursor + epsilon) {
                    segments.push({
                        start: cursor,
                        end: segmentEnd,
                        startColor: currentColor,
                        endColor: currentColor,
                    });
                    cursor = segmentEnd;
                }
                currentColor = nextColor;
                continue;
            }

            const halfBlend = blendSize / 2;
            const blendStart = this.clamp(threshold - halfBlend, 0, clampedEnd);
            const blendEnd = this.clamp(threshold + halfBlend, 0, clampedEnd);
            const safeBlendStart = Math.max(blendStart, cursor);
            const safeBlendEnd = Math.max(safeBlendStart, blendEnd);

            if (safeBlendStart > cursor + epsilon) {
                segments.push({
                    start: cursor,
                    end: safeBlendStart,
                    startColor: currentColor,
                    endColor: currentColor,
                });
            }

            if (safeBlendEnd > safeBlendStart + epsilon) {
                segments.push({
                    start: safeBlendStart,
                    end: safeBlendEnd,
                    startColor: currentColor,
                    endColor: nextColor,
                });
            }

            cursor = safeBlendEnd;
            currentColor = nextColor;

            if (cursor >= clampedEnd - epsilon) {
                break;
            }
        }

        if (cursor < clampedEnd - epsilon) {
            segments.push({
                start: cursor,
                end: clampedEnd,
                startColor: currentColor,
                endColor: currentColor,
            });
        }

        return segments.filter((segment) => segment.end > segment.start + epsilon);
    }

    private resolveBlendSegmentGradientId(kind: BlendKind, index: number): string {
        const raw = this.block?.id ?? 'radial';
        const safeId = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
        return `gauge-radial-${safeId}-${kind}-blend-${index}`;
    }

    private resolveProgressMaskId(): string {
        const raw = this.block?.id ?? 'radial';
        const safeId = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
        return `gauge-radial-${safeId}-progress-mask`;
    }

    private resolveProgressGlowMaskId(): string {
        const raw = this.block?.id ?? 'radial';
        const safeId = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
        return `gauge-radial-${safeId}-progress-glow-mask`;
    }

    private resolveProgressGlowFilterId(): string {
        const raw = this.block?.id ?? 'radial';
        const safeId = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
        return `gauge-radial-${safeId}-progress-glow`;
    }

    private resolveCustomArcGradientId(target: 'track' | 'progress'): string {
        const raw = this.block?.id ?? 'radial';
        const safeId = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
        return `gauge-radial-${safeId}-custom-${target}-paint`;
    }

    private resolveArcStrokePaint(
        paint: string,
        gradientId: string,
        layout: { minX: number; minY: number; width: number; height: number }
    ): ArcPaintDefinition {
        const normalizedPaint = paint.trim();
        if (!normalizedPaint) {
            return {paint: '#2196f3', defs: [], glowColor: '#2196f3'};
        }

        const gradientExpression = this.extractFirstLinearGradientExpression(normalizedPaint);
        if (!gradientExpression) {
            return {
                paint: normalizedPaint,
                defs: [],
                glowColor: this.resolveGlowColorFromPaint(normalizedPaint, '#2196f3'),
            };
        }

        const parsedGradient = this.parseLinearGradientExpression(gradientExpression);
        if (!parsedGradient || parsedGradient.stops.length === 0) {
            return {
                paint: this.resolveGlowColorFromPaint(normalizedPaint, '#2196f3'),
                defs: [],
                glowColor: this.resolveGlowColorFromPaint(normalizedPaint, '#2196f3'),
            };
        }

        const gradientVector = this.resolveGradientVector(parsedGradient.direction, layout);
        const stops = this.resolveGradientStopOffsets(parsedGradient.stops);
        const defs = [
            svg`
                <linearGradient
                    id=${gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1=${gradientVector.x1}
                    y1=${gradientVector.y1}
                    x2=${gradientVector.x2}
                    y2=${gradientVector.y2}
                    color-interpolation="sRGB"
                >
                    ${stops.map((stop) => svg`
                        <stop offset=${String(this.clamp(stop.offset ?? 0, 0, 1))} stop-color=${stop.color}></stop>
                    `)}
                </linearGradient>
            `,
        ];
        const glowColor = stops[0]?.color ?? '#2196f3';
        return {
            paint: `url(#${gradientId})`,
            defs,
            glowColor,
        };
    }

    private renderProgressGlowFilterDef(
        filterId: string,
        intensity: number,
        layout: { minX: number; minY: number; width: number; height: number }
    ) {
        const padding = intensity * 8;
        const x = layout.minX - padding;
        const y = layout.minY - padding;
        const width = layout.width + padding * 2;
        const height = layout.height + padding * 2;
        const deviation = Math.max(0.2, intensity);

        return svg`
            <filter
                id=${filterId}
                x=${String(x)}
                y=${String(y)}
                width=${String(width)}
                height=${String(height)}
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
            >
                <feGaussianBlur in="SourceGraphic" stdDeviation=${String(deviation)} result="blur"></feGaussianBlur>
                <feComposite in="blur" in2="SourceAlpha" operator="out"></feComposite>
            </filter>
        `;
    }

    private resolveSegmentOverlapNormalized(geometry: ArcGeometry, strokeWidth: number): number {
        const sweepRad = Math.max(10, geometry.sweepAngle) * (Math.PI / 180);
        const arcLength = Math.max(1, geometry.radius * sweepRad);
        const overlapPx = Math.max(1, strokeWidth * 0.22);
        return this.clamp(overlapPx / arcLength, 0, 0.04);
    }

    private buildStepSegments(
        endNormalized: number,
        changes: GaugeColorChange[]
    ): Array<{ start: number; end: number; color: string }> {
        const segments: Array<{ start: number; end: number; color: string }> = [];
        let cursor = 0;
        let color = changes[0]?.color ?? '#2196f3';

        for (const change of changes) {
            if (change.position <= 0) {
                color = change.color;
                continue;
            }

            const segmentEnd = this.clamp(change.position, 0, endNormalized);
            if (segmentEnd > cursor) {
                segments.push({start: cursor, end: segmentEnd, color});
            }

            cursor = Math.max(cursor, change.position);
            color = change.color;

            if (cursor >= endNormalized) {
                break;
            }
        }

        if (cursor < endNormalized) {
            segments.push({start: cursor, end: endNormalized, color});
        }

        return segments.filter((segment) => segment.end > segment.start);
    }

    private buildBlendedSegments(
        endNormalized: number,
        changes: GaugeColorChange[],
        blendDistance: number
    ): Array<{ start: number; end: number; color: string }> {
        const segments: Array<{ start: number; end: number; color: string }> = [];
        const sampleCount = Math.max(24, Math.ceil(endNormalized * 140));
        const blendDistanceNormalized = this.clamp(blendDistance / 100, 0, 0.6);

        for (let index = 0; index < sampleCount; index += 1) {
            const start = (endNormalized * index) / sampleCount;
            const end = (endNormalized * (index + 1)) / sampleCount;
            const center = (start + end) / 2;
            const color = this.resolveColorAt(center, changes, blendDistanceNormalized);
            segments.push({start, end, color});
        }

        return segments;
    }

    private resolveColorAt(normalized: number, changes: GaugeColorChange[], blendDistanceNormalized: number): string {
        if (changes.length === 0) {
            return '#2196f3';
        }

        let color = changes[0].color;
        for (let i = 0; i < changes.length; i += 1) {
            const current = changes[i];
            if (normalized < current.position) {
                break;
            }
            color = current.color;
        }

        if (blendDistanceNormalized <= 0 || changes.length < 2) {
            return color;
        }

        const halfBlend = blendDistanceNormalized / 2;
        for (let i = 0; i < changes.length - 1; i += 1) {
            const left = changes[i];
            const right = changes[i + 1];
            const blendStart = right.position - halfBlend;
            const blendEnd = right.position + halfBlend;
            if (normalized < blendStart || normalized > blendEnd) {
                continue;
            }

            const leftRgb = this.parseColor(left.color);
            const rightRgb = this.parseColor(right.color);
            if (!leftRgb || !rightRgb) {
                return normalized < right.position ? left.color : right.color;
            }

            const ratio = this.clamp((normalized - blendStart) / (blendEnd - blendStart), 0, 1);
            return this.rgbToString(this.mixColors(leftRgb, rightRgb, ratio));
        }

        return color;
    }

    private resolveLabelPosition(): ArcValuePosition {
        const position = this.resolveProperty('labelPosition', 'outside-bottom');
        if (position === 'inside-top') {
            return 'top';
        }
        if (position === 'inside-center') {
            return 'center';
        }
        if (position === 'inside-bottom') {
            return 'bottom';
        }
        if (
            position === 'center' ||
            position === 'left' ||
            position === 'right' ||
            position === 'top' ||
            position === 'bottom' ||
            position === 'outside-top' ||
            position === 'outside-bottom'
        ) {
            return position;
        }
        return 'outside-bottom';
    }

    private resolvePlacementStyle(
        anchor: { x: number; y: number; transform: string },
        layout: { minX: number; minY: number; width: number; height: number }
    ): Record<string, string> {
        const left = ((anchor.x - layout.minX) / layout.width) * 100;
        const top = ((anchor.y - layout.minY) / layout.height) * 100;
        return {
            left: `${left}%`,
            top: `${top}%`,
            right: 'auto',
            bottom: 'auto',
            transform: anchor.transform,
        };
    }

    private resolveArcLayout(
        geometry: ArcGeometry,
        maxStroke: number,
        arcStrokeWidth: number,
        showMarkers: boolean,
        glowPadding: number
    ): { minX: number; minY: number; width: number; height: number; aspectRatio: number } {
        const bounds = this.resolveArcBounds(geometry, 0, 1, 180);
        const metrics = this.resolveGaugeMetrics();
        let minX = bounds.minX;
        let minY = bounds.minY;
        let maxX = bounds.maxX;
        let maxY = bounds.maxY;

        if (showMarkers) {
            const markerLength = this.resolveMarkerLength(arcStrokeWidth);
            const markerHalfThickness = this.resolveMarkerThickness() / 2;
            for (const threshold of this.getThresholds()) {
                const normalized = this.clamp((threshold.value - metrics.min) / metrics.span, 0, 1);
                const marker = this.resolveMarkerSegment(geometry, normalized, markerLength);
                minX = Math.min(minX, marker.inner.x - markerHalfThickness, marker.outer.x - markerHalfThickness);
                maxX = Math.max(maxX, marker.inner.x + markerHalfThickness, marker.outer.x + markerHalfThickness);
                minY = Math.min(minY, marker.inner.y - markerHalfThickness, marker.outer.y - markerHalfThickness);
                maxY = Math.max(maxY, marker.inner.y + markerHalfThickness, marker.outer.y + markerHalfThickness);
            }
        }

        const padding = maxStroke / 2 + 2 + glowPadding;
        minX -= padding;
        maxX += padding;
        minY -= padding;
        maxY += padding;

        const width = Math.max(1, maxX - minX);
        const height = Math.max(1, maxY - minY);
        return {
            minX,
            minY,
            width,
            height,
            aspectRatio: width / height,
        };
    }

    private resolveStrokeWidth(style: Record<string, string>, fallback: number): number {
        const raw = style.strokeWidth;
        if (!raw) {
            return fallback;
        }
        const parsed = parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    private resolveArcWidth(): number {
        return Math.max(1, this.resolvePropertyAsNumber('arcWidth', 10));
    }

    private resolveMarkerThickness(): number {
        return this.resolveMarkerThicknessPx();
    }

    private resolveMarkerLength(arcStrokeWidth: number): number {
        return Math.max(1, arcStrokeWidth * this.resolveMarkerWidthRatio());
    }

    private resolveMarkerSegment(
        geometry: ArcGeometry,
        normalized: number,
        markerLength: number
    ): { inner: { x: number; y: number }; outer: { x: number; y: number } } {
        const angle = this.resolveArcAngleAt(geometry, normalized);
        const halfLength = markerLength / 2;
        const innerRadius = Math.max(0, geometry.radius - halfLength);
        const outerRadius = geometry.radius + halfLength;
        return {
            inner: this.pointOnCircle(geometry.cx, geometry.cy, innerRadius, angle),
            outer: this.pointOnCircle(geometry.cx, geometry.cy, outerRadius, angle),
        };
    }

    private applyAlpha(color: string, alpha: number): string {
        const parsed = this.parseColor(color);
        if (!parsed) {
            return color;
        }
        return this.rgbToString({...parsed, a: parsed.a * alpha});
    }

    private ensureValidLayout(
        layout: { minX: number; minY: number; width: number; height: number; aspectRatio: number }
    ): { minX: number; minY: number; width: number; height: number; aspectRatio: number } {
        if (
            !Number.isFinite(layout.minX) ||
            !Number.isFinite(layout.minY) ||
            !Number.isFinite(layout.width) ||
            !Number.isFinite(layout.height) ||
            layout.width <= 0 ||
            layout.height <= 0
        ) {
            return {
                minX: 0,
                minY: 0,
                width: 100,
                height: 100,
                aspectRatio: 1,
            };
        }
        return layout;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-gauge-radial': BlockGaugeRadial;
    }
}
