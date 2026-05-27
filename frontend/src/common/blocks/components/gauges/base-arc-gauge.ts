import type { PropertyGroup } from '@/common/blocks/core/properties';
import type { BlockPanelTargetStyles } from '@/common/blocks/types';
import { BaseGauge } from './base-gauge';

export type ArcDirection = 'clockwise' | 'counterclockwise';
export type ArcValuePosition =
    | 'center'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'inside-start'
    | 'inside-end'
    | 'outside-top'
    | 'outside-bottom';
export interface ArcValueAnchor {
    x: number;
    y: number;
    transform: string;
}

export interface ArcValueAnchorOptions {
    strokeWidth?: number;
    clampToArcBounds?: boolean;
    sampleSteps?: number;
}

export interface ArcGeometry {
    cx: number;
    cy: number;
    radius: number;
    startAngle: number;
    sweepAngle: number;
    direction: ArcDirection;
}

export interface ArcBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

export abstract class BaseArcGauge extends BaseGauge {
    protected getArcGaugePropertyGroups(): PropertyGroup[] {
        return [
            {
                id: 'arc',
                label: 'Arc',
                traits: [
                    {
                        type: 'slider',
                        name: 'arcAngle',
                        label: 'Arc Angle',
                        min: 10,
                        max: 360,
                        step: 1,
                    },
                    {
                        type: 'number',
                        name: 'startAngle',
                        label: 'Start Angle',
                        min: -360,
                        max: 360,
                        step: 1,
                    },
                    {
                        type: 'select',
                        name: 'arcDirection',
                        label: 'Direction',
                        options: [
                            {value: 'clockwise', label: 'Clockwise'},
                            {value: 'counterclockwise', label: 'Counterclockwise'},
                        ],
                    },
                    {
                        type: 'select',
                        name: 'valuePositionArc',
                        label: 'Value Position',
                        options: [
                            {value: 'center', label: 'Center'},
                            {value: 'left', label: 'Left'},
                            {value: 'right', label: 'Right'},
                            {value: 'top', label: 'Top'},
                            {value: 'bottom', label: 'Bottom'},
                            {value: 'outside-top', label: 'Outside Top'},
                            {value: 'outside-bottom', label: 'Outside Bottom'},
                        ],
                        visible: {prop: 'showValue', eq: true},
                    },
                ],
            },
        ];
    }

    protected getArcGaugeTargetStyles(): BlockPanelTargetStyles {
        return {
            track: {
                label: 'Track',
                description: 'Arc track',
                styles: {
                    preset: 'full',
                    exclude: {groups: ['layout', 'flex']},
                },
            },
            progress: {
                label: 'Progress',
                description: 'Arc progress stroke',
                styles: {
                    preset: 'full',
                    exclude: {groups: ['layout', 'flex']},
                },
            },
            markers: {
                label: 'Markers',
                description: 'Threshold markers',
                styles: {
                    preset: 'full',
                    exclude: {groups: ['layout', 'flex']},
                },
            },
        };
    }

    protected resolveArcDirection(): ArcDirection {
        return this.resolveProperty('arcDirection', 'clockwise') as ArcDirection;
    }

    protected resolveArcAngle(): number {
        const angle = this.resolvePropertyAsNumber('arcAngle', 180);
        return this.clamp(angle, 10, 360);
    }

    protected resolveStartAngle(): number {
        return this.resolvePropertyAsNumber('startAngle', 0);
    }

    protected resolveArcValuePosition(): ArcValuePosition {
        const position = this.resolveProperty('valuePositionArc', 'center') as ArcValuePosition;
        if (position === 'inside-start') {
            return 'left';
        }
        if (position === 'inside-end') {
            return 'right';
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
        return 'center';
    }

    protected resolveArcValueAnchor(
        geometry: ArcGeometry,
        position: ArcValuePosition,
        options: ArcValueAnchorOptions = {}
    ): ArcValueAnchor {
        const sampleSteps = Math.max(24, Math.round(options.sampleSteps ?? 240));
        const strokeHalf = Math.max(0, (options.strokeWidth ?? 0) / 2);
        const arcBounds = this.resolveArcBounds(geometry, 0, 1, sampleSteps);
        const bounds = {
            minX: arcBounds.minX - strokeHalf,
            minY: arcBounds.minY - strokeHalf,
            maxX: arcBounds.maxX + strokeHalf,
            maxY: arcBounds.maxY + strokeHalf,
        };
        const referenceRadius = geometry.radius + strokeHalf;
        const referenceSquare = {
            minX: geometry.cx - referenceRadius,
            minY: geometry.cy - referenceRadius,
            maxX: geometry.cx + referenceRadius,
            maxY: geometry.cy + referenceRadius,
        };
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const bottomY = Math.max(bounds.minY, bounds.maxY - strokeHalf);
        const clampToArcBounds = options.clampToArcBounds ?? true;
        const clampPoint = (x: number, y: number): { x: number; y: number } => ({
            x: clampToArcBounds ? this.clamp(x, bounds.minX, bounds.maxX) : x,
            y: clampToArcBounds ? this.clamp(y, bounds.minY, bounds.maxY) : y,
        });

        switch (position) {
            case 'top':
                {
                    const point = clampPoint((referenceSquare.minX + referenceSquare.maxX) / 2, referenceSquare.minY);
                    return {
                        x: point.x,
                        y: point.y,
                        transform: 'translate(-50%, 0)',
                    };
                }
            case 'outside-top':
                {
                    const point = clampPoint((referenceSquare.minX + referenceSquare.maxX) / 2, referenceSquare.minY);
                    return {
                        x: point.x,
                        y: point.y,
                        transform: 'translate(-50%, -100%)',
                    };
                }
            case 'bottom':
                {
                    const point = clampPoint((referenceSquare.minX + referenceSquare.maxX) / 2, bottomY);
                    return {
                        x: point.x,
                        y: point.y,
                        transform: 'translate(-50%, -100%)',
                    };
                }
            case 'outside-bottom':
                {
                    const point = clampPoint((referenceSquare.minX + referenceSquare.maxX) / 2, bottomY);
                    return {
                        x: point.x,
                        y: point.y,
                        transform: 'translate(-50%, 0)',
                    };
                }
            case 'left':
                {
                    const point = clampPoint(referenceSquare.minX, centerY);
                    return {
                        x: point.x,
                        y: point.y,
                        transform: 'translate(0, -50%)',
                    };
                }
            case 'right':
                {
                    const point = clampPoint(referenceSquare.maxX, centerY);
                    return {
                        x: point.x,
                        y: point.y,
                        transform: 'translate(-100%, -50%)',
                    };
                }
            default:
                return {
                    x: centerX,
                    y: centerY,
                    transform: 'translate(-50%, -50%)',
                };
        }
    }

    protected createArcGeometry(size: number, padding = 12): ArcGeometry {
        const radius = Math.max(1, size / 2 - padding);
        return {
            cx: size / 2,
            cy: size / 2,
            radius,
            startAngle: this.resolveStartAngle(),
            sweepAngle: this.resolveArcAngle(),
            direction: this.resolveArcDirection(),
        };
    }

    protected getArcTrackPath(geometry: ArcGeometry): string {
        return this.buildArcPath(geometry, geometry.sweepAngle);
    }

    protected getArcSegmentPath(geometry: ArcGeometry, startNormalized: number, endNormalized: number): string {
        const start = this.clamp(Math.min(startNormalized, endNormalized), 0, 1);
        const end = this.clamp(Math.max(startNormalized, endNormalized), 0, 1);
        if (end <= start) {
            const point = this.getArcMarkerPoint(geometry, start);
            return `M ${point.x} ${point.y}`;
        }

        const startAngle = this.resolveArcAngleAt(geometry, start);
        const segmentSweep = geometry.sweepAngle * (end - start);
        return this.buildArcPathFrom(
            geometry.cx,
            geometry.cy,
            geometry.radius,
            startAngle,
            segmentSweep,
            geometry.direction
        );
    }

    protected getArcMarkerPoint(geometry: ArcGeometry, normalized: number): { x: number; y: number } {
        return this.pointOnCircle(
            geometry.cx,
            geometry.cy,
            geometry.radius,
            this.resolveArcAngleAt(geometry, normalized),
        );
    }

    protected resolveArcAngleAt(geometry: ArcGeometry, normalized: number): number {
        const clamped = this.clamp(normalized, 0, 1);
        const delta = geometry.sweepAngle * clamped;
        return geometry.direction === 'clockwise'
            ? geometry.startAngle + delta
            : geometry.startAngle - delta;
    }

    protected pointOnCircle(cx: number, cy: number, radius: number, westZeroAngleDeg: number): { x: number; y: number } {
        const eastZeroAngle = westZeroAngleDeg + 180;
        const rad = eastZeroAngle * (Math.PI / 180);
        return {
            x: cx + radius * Math.cos(rad),
            y: cy + radius * Math.sin(rad),
        };
    }

    protected sampleArcPoints(
        geometry: ArcGeometry,
        startNormalized: number = 0,
        endNormalized: number = 1,
        steps: number = 90
    ): Array<{ x: number; y: number }> {
        const start = this.clamp(Math.min(startNormalized, endNormalized), 0, 1);
        const end = this.clamp(Math.max(startNormalized, endNormalized), 0, 1);
        const result: Array<{ x: number; y: number }> = [];

        if (end <= start) {
            result.push(this.getArcMarkerPoint(geometry, start));
            return result;
        }

        const totalSteps = Math.max(2, steps);
        for (let i = 0; i <= totalSteps; i += 1) {
            const normalized = start + ((end - start) * i) / totalSteps;
            result.push(this.getArcMarkerPoint(geometry, normalized));
        }
        return result;
    }

    protected resolveArcBounds(
        geometry: ArcGeometry,
        startNormalized: number = 0,
        endNormalized: number = 1,
        steps: number = 120
    ): ArcBounds {
        const points = this.sampleArcPoints(geometry, startNormalized, endNormalized, steps);

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (const point of points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: Math.max(1, maxX - minX),
            height: Math.max(1, maxY - minY),
        };
    }

    private buildArcPath(geometry: ArcGeometry, sweepAngle: number): string {
        const normalizedSweep = this.clamp(sweepAngle, 0, geometry.sweepAngle);
        return this.buildArcPathFrom(
            geometry.cx,
            geometry.cy,
            geometry.radius,
            geometry.startAngle,
            normalizedSweep,
            geometry.direction
        );
    }

    private buildArcPathFrom(
        cx: number,
        cy: number,
        radius: number,
        startAngle: number,
        sweepAngle: number,
        direction: ArcDirection
    ): string {
        if (sweepAngle <= 0) {
            const start = this.pointOnCircle(cx, cy, radius, startAngle);
            return `M ${start.x} ${start.y}`;
        }

        if (sweepAngle >= 360) {
            const start = this.pointOnCircle(cx, cy, radius, startAngle);
            const midAngle = direction === 'clockwise'
                ? startAngle + 180
                : startAngle - 180;
            const mid = this.pointOnCircle(cx, cy, radius, midAngle);
            const sweepFlag = direction === 'clockwise' ? 1 : 0;
            return [
                `M ${start.x} ${start.y}`,
                `A ${radius} ${radius} 0 1 ${sweepFlag} ${mid.x} ${mid.y}`,
                `A ${radius} ${radius} 0 1 ${sweepFlag} ${start.x} ${start.y}`,
            ].join(' ');
        }

        const signedSweep = direction === 'clockwise' ? sweepAngle : -sweepAngle;
        const endAngle = startAngle + signedSweep;
        const start = this.pointOnCircle(cx, cy, radius, startAngle);
        const end = this.pointOnCircle(cx, cy, radius, endAngle);
        const largeArc = sweepAngle > 180 ? 1 : 0;
        const sweepFlag = direction === 'clockwise' ? 1 : 0;

        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
    }
}
