import { type BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import type { PropertyGroup } from '@/common/blocks/core/properties';
import { BlockGaugeRadial } from '@/common/blocks/components/gauges/block-gauge-radial';
import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('block-gauge-tachometer')
export class BlockGaugeTachometer extends BlockGaugeRadial {
    static styles = [
        ...BlockGaugeRadial.styles,
        css`
            .tachometer-shell {
                position: relative;
                width: 100%;
            }

            .tachometer-overlay {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                overflow: visible;
                pointer-events: none;
            }

            .needle {
                fill: #f4f4f2;
                stroke: rgba(0, 0, 0, 0.28);
                stroke-width: 0.35;
                stroke-linejoin: round;
            }

            .needle-highlight {
                fill: none;
                stroke: rgba(255, 255, 255, 0.75);
                stroke-width: 0.9;
                stroke-linecap: round;
                pointer-events: none;
            }

            .needle-center {
                fill: #1f1f1f;
                stroke: rgba(0, 0, 0, 0.35);
                stroke-width: 0.45;
            }

            .tick-major,
            .tick-minor {
                stroke: rgba(0, 0, 0, 0.45);
                stroke-linecap: butt;
                fill: none;
            }

            .tick-major {
                stroke-width: 1.4;
            }

            .tick-minor {
                stroke-width: 1;
                opacity: 0.75;
            }

            .tick-value {
                fill: currentColor;
                text-anchor: middle;
                dominant-baseline: middle;
                font-size: 4.2px;
                pointer-events: none;
            }
        `,
    ];

    @state()
    private _overlayViewBox = '0 0 100 100';

    static getBlockConfig(): BlockRegistration {
        const radial = BlockGaugeRadial.getBlockConfig();
        const radialProps = radial.defaults.props as Record<string, {value: unknown}>;
        return {
            ...radial,
            definition: {
                ...radial.definition,
                label: 'Gauge Tachometer',
                icon: '<ha-icon icon="mdi:speedometer"></ha-icon>',
            },
            defaults: {
                ...radial.defaults,
                props: {
                    ...radialProps,
                    arcAngle: {value: 270},
                    startAngle: {value: -45},
                    needleLength: {value: 40},
                    showMajorTicks: {value: true},
                    majorTickCount: {value: 10},
                    majorTickLength: {value: 5},
                    majorTickThickness: {value: 0.7},
                    showMinorTicks: {value: true},
                    minorTicksPerInterval: {value: 4},
                    minorTickLength: {value: 3},
                    minorTickThickness: {value: 0.5},
                    showMajorTickValues: {value: true},
                    majorTickValueDecimals: {value: 0},
                },
            },
            actionTargets: {
                ...radial.actionTargets,
                needle: {label: 'Needle', description: 'Tachometer needle'},
                needleCenter: {label: 'Needle Center', description: 'Needle center circle'},
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        const base = super.getPanelConfig();
        const baseGroups = base.properties?.groups ?? [];
        const groups = [...baseGroups].filter((group) => group.id !== 'tachometer');

        const tachometerGroup: PropertyGroup = {
            id: 'tachometer',
            label: 'Tachometer',
            traits: [
                {
                    type: 'slider',
                    name: 'needleLength',
                    label: 'Needle Length',
                    min: 20,
                    max: 100,
                    step: 1,
                },
                {
                    type: 'checkbox',
                    name: 'showMajorTicks',
                    label: 'Show Major Ticks',
                },
                {
                    type: 'number',
                    name: 'majorTickCount',
                    label: 'Major Tick Count',
                    min: 2,
                    max: 24,
                    step: 1,
                    visible: {prop: 'showMajorTicks', eq: true},
                },
                {
                    type: 'slider',
                    name: 'majorTickLength',
                    label: 'Major Tick Length',
                    min: 1,
                    max: 24,
                    step: 0.5,
                    visible: {prop: 'showMajorTicks', eq: true},
                },
                {
                    type: 'slider',
                    name: 'majorTickThickness',
                    label: 'Major Tick Thickness',
                    min: 0.5,
                    max: 8,
                    step: 0.1,
                    visible: {prop: 'showMajorTicks', eq: true},
                },
                {
                    type: 'checkbox',
                    name: 'showMinorTicks',
                    label: 'Show Minor Ticks',
                    visible: {prop: 'showMajorTicks', eq: true},
                },
                {
                    type: 'number',
                    name: 'minorTicksPerInterval',
                    label: 'Minor Ticks/Interval',
                    min: 1,
                    max: 12,
                    step: 1,
                    visible: {
                        and: [
                            {prop: 'showMajorTicks', eq: true},
                            {prop: 'showMinorTicks', eq: true},
                        ],
                    },
                },
                {
                    type: 'slider',
                    name: 'minorTickLength',
                    label: 'Minor Tick Length',
                    min: 1,
                    max: 24,
                    step: 0.5,
                    visible: {
                        and: [
                            {prop: 'showMajorTicks', eq: true},
                            {prop: 'showMinorTicks', eq: true},
                        ],
                    },
                },
                {
                    type: 'slider',
                    name: 'minorTickThickness',
                    label: 'Minor Tick Thickness',
                    min: 0.5,
                    max: 8,
                    step: 0.1,
                    visible: {
                        and: [
                            {prop: 'showMajorTicks', eq: true},
                            {prop: 'showMinorTicks', eq: true},
                        ],
                    },
                },
                {
                    type: 'checkbox',
                    name: 'showMajorTickValues',
                    label: 'Show Major Tick Values',
                    visible: {prop: 'showMajorTicks', eq: true},
                },
                {
                    type: 'number',
                    name: 'majorTickValueDecimals',
                    label: 'Tick Value Decimals',
                    min: 0,
                    max: 4,
                    step: 1,
                    visible: {
                        and: [
                            {prop: 'showMajorTicks', eq: true},
                            {prop: 'showMajorTickValues', eq: true},
                        ],
                    },
                },
            ],
        };

        const thresholdsIndex = groups.findIndex((group) => group.id === 'thresholds');
        if (thresholdsIndex >= 0) {
            groups.splice(thresholdsIndex, 0, tachometerGroup);
        } else {
            groups.push(tachometerGroup);
        }

        return {
            properties: {
                ...(base.properties ?? {}),
                groups,
            },
            targetStyles: {
                ...base.targetStyles,
                needle: {
                    label: 'Needle',
                    description: 'Needle body',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                needleCenter: {
                    label: 'Needle Center',
                    description: 'Needle center circle',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                majorTicks: {
                    label: 'Major Ticks',
                    description: 'Main tachometer ticks',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                minorTicks: {
                    label: 'Minor Ticks',
                    description: 'Secondary tachometer ticks',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                tickValues: {
                    label: 'Tick Values',
                    description: 'Major tick labels',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
            },
        };
    }

    public override updated(changedProperties: PropertyValues<this>) {
        super.updated(changedProperties);
        const baseSvg = this.renderRoot.querySelector('.radial-root > svg') as SVGSVGElement | null;
        if (!baseSvg) {
            return;
        }
        const viewBox = baseSvg.getAttribute('viewBox') ?? '0 0 100 100';
        if (viewBox !== this._overlayViewBox) {
            this._overlayViewBox = viewBox;
        }
    }

    render() {
        if (!this.entity) {
            return super.render();
        }

        const baseTemplate = super.render();
        const metrics = this.resolveGaugeMetrics();
        const geometry = this.createArcGeometry(100, 12);
        const needleAngle = this.resolveArcAngleAt(geometry, metrics.normalized);
        const needleLengthPct = this.clamp(this.resolvePropertyAsNumber('needleLength', 84), 20, 100);
        const needleLength = geometry.radius * (needleLengthPct / 100);
        const needleShape = this.createNeedleShape(geometry.cx, geometry.cy, needleLength);
        const duration = this.getAnimationDurationMs();
        const needleTransition = duration > 0 ? `transform ${duration}ms linear` : 'none';

        const showMajorTicks = this.resolvePropertyAsBoolean('showMajorTicks');
        const showMinorTicks = this.resolvePropertyAsBoolean('showMinorTicks');
        const showMajorTickValues = this.resolvePropertyAsBoolean('showMajorTickValues');
        const majorTickCount = Math.max(2, Math.round(this.resolvePropertyAsNumber('majorTickCount', 8)));
        const minorTicksPerInterval = Math.max(1, Math.round(this.resolvePropertyAsNumber('minorTicksPerInterval', 4)));
        const tickValueDecimals = Math.max(0, Math.min(4, Math.round(this.resolvePropertyAsNumber('majorTickValueDecimals', 0))));

        const needleStyle: Record<string, string> = {
            ...this.getTargetStyle('needle'),
        };
        const needleCenterStyle: Record<string, string> = {
            ...this.getTargetStyle('needleCenter'),
        };
        const needleRotationStyle: Record<string, string> = {
            transformOrigin: `${geometry.cx}px ${geometry.cy}px`,
            transformBox: 'view-box',
            transform: `rotate(${needleAngle}deg)`,
            transition: needleTransition,
        };
        const majorTickStyle: Record<string, string> = {
            ...this.getTargetStyle('majorTicks'),
        };
        const minorTickStyle: Record<string, string> = {
            ...this.getTargetStyle('minorTicks'),
        };
        const tickValueStyle: Record<string, string> = {
            ...this.getTargetStyle('tickValues'),
        };

        const arcStrokeWidth = this.resolveTachArcStrokeWidth();
        const innerArcRadius = Math.max(0, geometry.radius - arcStrokeWidth / 2);
        const majorTickLength = this.clamp(this.resolvePropertyAsNumber('majorTickLength', Math.max(3, arcStrokeWidth * 0.9)), 1, 24);
        const majorTickThickness = this.clamp(this.resolvePropertyAsNumber('majorTickThickness', 1.4), 0.5, 8);
        const minorTickLength = this.clamp(this.resolvePropertyAsNumber('minorTickLength', Math.max(2, majorTickLength * 0.55)), 1, 24);
        const minorTickThickness = this.clamp(this.resolvePropertyAsNumber('minorTickThickness', 1), 0.5, 8);
        const majorOuterRadius = innerArcRadius;
        const majorInnerRadius = Math.max(0, innerArcRadius - majorTickLength);
        const minorOuterRadius = innerArcRadius;
        const minorInnerRadius = Math.max(0, innerArcRadius - minorTickLength);
        const labelRadius = Math.max(0, majorInnerRadius - 4);

        return html`
            <div class="tachometer-shell">
                ${baseTemplate}
                <svg
                    class="tachometer-overlay"
                    viewBox=${this._overlayViewBox}
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden="true"
                >
                    ${showMajorTicks ? this.renderMajorTicks(
                        geometry,
                        majorTickCount,
                        majorOuterRadius,
                        majorInnerRadius,
                        majorTickThickness,
                        majorTickStyle
                    ) : nothing}
                    ${showMajorTicks && showMinorTicks ? this.renderMinorTicks(
                        geometry,
                        majorTickCount,
                        minorTicksPerInterval,
                        minorOuterRadius,
                        minorInnerRadius,
                        minorTickThickness,
                        minorTickStyle
                    ) : nothing}
                    ${showMajorTicks && showMajorTickValues ? this.renderMajorTickValues(
                        geometry,
                        metrics.min,
                        metrics.span,
                        majorTickCount,
                        labelRadius,
                        tickValueDecimals,
                        tickValueStyle
                    ) : nothing}
                    <g style=${styleMap(needleRotationStyle)}>
                        <path
                            class="needle-highlight"
                            d=${needleShape.highlightPath}
                        ></path>
                        <path
                            class="needle ${this.isStyleTargetActive('needle') ? 'style-target-active' : ''}"
                            d=${needleShape.path}
                            style=${styleMap(needleStyle)}
                            data-style-target="needle"
                            data-action-target="needle"
                        ></path>
                    </g>
                    <circle
                        class="needle-center ${this.isStyleTargetActive('needleCenter') ? 'style-target-active' : ''}"
                        cx=${geometry.cx}
                        cy=${geometry.cy}
                        r=${needleShape.centerRadius}
                        style=${styleMap(needleCenterStyle)}
                        data-style-target="needleCenter"
                        data-action-target="needleCenter"
                    ></circle>
                </svg>
            </div>
        `;
    }

    private renderMajorTicks(
        geometry: ReturnType<BlockGaugeRadial['createArcGeometry']>,
        count: number,
        outerRadius: number,
        innerRadius: number,
        thickness: number,
        style: Record<string, string>
    ) {
        const tickStyle: Record<string, string> = {
            ...style,
            strokeLinecap: 'butt',
            strokeWidth: String(thickness),
        };
        const result: ReturnType<typeof svg>[] = [];
        for (let index = 0; index <= count; index += 1) {
            const normalized = index / count;
            const angle = this.resolveArcAngleAt(geometry, normalized);
            const outer = this.pointOnCircle(geometry.cx, geometry.cy, outerRadius, angle);
            const inner = this.pointOnCircle(geometry.cx, geometry.cy, innerRadius, angle);
            result.push(svg`
                <line
                    class="tick-major ${this.isStyleTargetActive('majorTicks') ? 'style-target-active' : ''}"
                    x1=${outer.x}
                    y1=${outer.y}
                    x2=${inner.x}
                    y2=${inner.y}
                    style=${styleMap(tickStyle)}
                    data-style-target="majorTicks"
                ></line>
            `);
        }
        return result;
    }

    private renderMinorTicks(
        geometry: ReturnType<BlockGaugeRadial['createArcGeometry']>,
        majorCount: number,
        perInterval: number,
        outerRadius: number,
        innerRadius: number,
        thickness: number,
        style: Record<string, string>
    ) {
        const tickStyle: Record<string, string> = {
            ...style,
            strokeLinecap: 'butt',
            strokeWidth: String(thickness),
        };
        const result: ReturnType<typeof svg>[] = [];
        for (let major = 0; major < majorCount; major += 1) {
            for (let minor = 1; minor <= perInterval; minor += 1) {
                const normalized = (major + minor / (perInterval + 1)) / majorCount;
                const angle = this.resolveArcAngleAt(geometry, normalized);
                const outer = this.pointOnCircle(geometry.cx, geometry.cy, outerRadius, angle);
                const inner = this.pointOnCircle(geometry.cx, geometry.cy, innerRadius, angle);
                result.push(svg`
                    <line
                        class="tick-minor ${this.isStyleTargetActive('minorTicks') ? 'style-target-active' : ''}"
                        x1=${outer.x}
                        y1=${outer.y}
                        x2=${inner.x}
                        y2=${inner.y}
                        style=${styleMap(tickStyle)}
                        data-style-target="minorTicks"
                    ></line>
                `);
            }
        }
        return result;
    }

    private renderMajorTickValues(
        geometry: ReturnType<BlockGaugeRadial['createArcGeometry']>,
        min: number,
        span: number,
        count: number,
        labelRadius: number,
        decimals: number,
        style: Record<string, string>
    ) {
        const result: ReturnType<typeof svg>[] = [];
        for (let index = 0; index <= count; index += 1) {
            const normalized = index / count;
            const angle = this.resolveArcAngleAt(geometry, normalized);
            const point = this.pointOnCircle(geometry.cx, geometry.cy, labelRadius, angle);
            const value = min + span * normalized;
            result.push(svg`
                <text
                    class="tick-value ${this.isStyleTargetActive('tickValues') ? 'style-target-active' : ''}"
                    x=${point.x}
                    y=${point.y}
                    style=${styleMap(style)}
                    data-style-target="tickValues"
                >${this.formatNumber(value, decimals)}</text>
            `);
        }
        return result;
    }

    protected override resolveArcAngle(): number {
        const angle = this.resolvePropertyAsNumber('arcAngle', 270);
        return this.clamp(angle, 10, 360);
    }

    private resolveTachArcStrokeWidth(): number {
        const trackStyle = this.getTargetStyle('track');
        const raw = trackStyle.strokeWidth;
        if (raw) {
            const parsed = parseFloat(raw);
            if (Number.isFinite(parsed) && parsed > 0) {
                return parsed;
            }
        }
        return Math.max(1, this.resolvePropertyAsNumber('arcWidth', 10));
    }

    private createNeedleShape(cx: number, cy: number, length: number) {
        const angle = 0;
        const tip = this.pointOnCircle(cx, cy, length, angle);
        const tailLength = Math.min(10, Math.max(3, length * 0.18));
        const tail = this.pointOnCircle(cx, cy, tailLength, angle + 180);

        const baseHalfWidth = Math.max(1.3, Math.min(4.5, length * 0.055));
        const tailHalfWidth = Math.max(0.9, baseHalfWidth * 0.72);
        const normal = (angle + 90) * (Math.PI / 180);
        const nx = Math.cos(normal);
        const ny = Math.sin(normal);

        const baseLeft = {x: cx + nx * baseHalfWidth, y: cy + ny * baseHalfWidth};
        const baseRight = {x: cx - nx * baseHalfWidth, y: cy - ny * baseHalfWidth};
        const tailLeft = {x: tail.x + nx * tailHalfWidth, y: tail.y + ny * tailHalfWidth};
        const tailRight = {x: tail.x - nx * tailHalfWidth, y: tail.y - ny * tailHalfWidth};

        const path = [
            `M ${tailLeft.x} ${tailLeft.y}`,
            `L ${baseLeft.x} ${baseLeft.y}`,
            `L ${tip.x} ${tip.y}`,
            `L ${baseRight.x} ${baseRight.y}`,
            `L ${tailRight.x} ${tailRight.y}`,
            'Z',
        ].join(' ');

        const highlightStart = this.pointOnCircle(cx, cy, Math.max(1.2, tailLength * 0.25), angle + 180);
        const highlightEnd = this.pointOnCircle(cx, cy, Math.max(2, length * 0.9), angle);
        const highlightPath = `M ${highlightStart.x} ${highlightStart.y} L ${highlightEnd.x} ${highlightEnd.y}`;

        return {
            path,
            highlightPath,
            centerRadius: Math.max(3.2, baseHalfWidth + 0.2),
        };
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-gauge-tachometer': BlockGaugeTachometer;
    }
}
