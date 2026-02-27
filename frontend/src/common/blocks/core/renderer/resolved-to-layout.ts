import type { PositionConfig } from './position-system';
import type { BlockPosition, BlockSize } from '@/common/core/model/types';
import type { ResolvedStyleData } from '@/common/core/style-resolver';

export interface StyleLayoutData {
    position: BlockPosition;
    size: BlockSize;
    positionConfig: Required<PositionConfig>;
}

const DEFAULT_POSITION_CONFIG: Required<PositionConfig> = {
    x: 50,
    y: 50,
    anchor: 'top-left',
    originPoint: 'top-left',
    unitSystem: 'px',
};

const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && !Number.isNaN(value);

const toNumber = (value: unknown, fallback: number): number =>
    isNumber(value) ? value : fallback;

const normalizePositionConfig = (value: PositionConfig): Required<PositionConfig> => {
    const anchor = value?.anchor ?? DEFAULT_POSITION_CONFIG.anchor;
    const originPoint = value?.originPoint ?? anchor;
    const unitSystem = value?.unitSystem ?? DEFAULT_POSITION_CONFIG.unitSystem;
    const x = isNumber(value?.x) ? value.x : DEFAULT_POSITION_CONFIG.x;
    const y = isNumber(value?.y) ? value.y : DEFAULT_POSITION_CONFIG.y;

    return {x, y, anchor, originPoint, unitSystem};
};

export const getStyleLayoutData = (resolved: ResolvedStyleData): StyleLayoutData => {
    const rawPositionConfig = resolved._internal?.position_config?.value as PositionConfig;
    const positionConfig = normalizePositionConfig(rawPositionConfig);

    const position: BlockPosition = {
        x: toNumber(resolved.layout?.positionX?.value, positionConfig.x),
        y: toNumber(resolved.layout?.positionY?.value, positionConfig.y),
    };

    const size: BlockSize = {
        width: toNumber(resolved.size?.width?.value, 0),
        height: toNumber(resolved.size?.height?.value, 0),
    };

    return {position, size, positionConfig};
};
