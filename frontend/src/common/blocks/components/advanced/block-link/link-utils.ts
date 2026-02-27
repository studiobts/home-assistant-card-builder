import type { LinkPoint, LinkSegment } from '@/common/blocks/components/advanced/block-link/link-types';

export const DEFAULT_LINK_SEGMENT: LinkSegment = {type: 'line'};

export function clampNormalized(value: number): number {
    if (Number.isNaN(value)) return 0;
    return Math.min(100, Math.max(0, value));
}

export function ensureSegments(points: LinkPoint[], segments?: LinkSegment[]): LinkSegment[] {
    const count = Math.max(0, points.length - 1);
    const safe = (segments || []).slice(0, count).map((segment) => ({...segment}));
    while (safe.length < count) {
        safe.push({...DEFAULT_LINK_SEGMENT});
    }
    return safe;
}

export function normalizePoint(point: LinkPoint): LinkPoint {
    return {
        ...point,
        x: clampNormalized(point.x),
        y: clampNormalized(point.y),
    };
}
