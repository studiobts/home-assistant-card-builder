export type LinkSegmentType = 'line' | 'curve';

export type LinkCurvePreset = 'manual' | 'smooth' | 'arc' | 'symmetric';

export interface LinkSegment {
    type: LinkSegmentType;
    curvePreset?: LinkCurvePreset;
    curveBulge?: number;
    curveAutoUpdate?: boolean;
}

export type LinkAnchorPoint =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'middle-left'
    | 'middle-center'
    | 'middle-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

export interface LinkAnchorRef {
    blockId: string;
    anchor?: LinkAnchorPoint;
    offset?: { x: number; y: number };
}

export interface LinkHandle {
    /** Offset relative to the point position (normalized 0-100 space). */
    x: number;
    y: number;
}

export interface LinkPoint {
    id: string;
    x: number;
    y: number;
    handleIn?: LinkHandle;
    handleOut?: LinkHandle;
    anchor?: LinkAnchorRef;
}
