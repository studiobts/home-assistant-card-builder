import type { BlockPropertyConfig } from '@/common/blocks/core/properties';
import type { BlockStyleConfig } from '@/common/blocks/style';

// Grid Block types
export type GridUnit = 'px' | '%' | 'fr' | 'auto' | 'minmax';

export interface GridDimension {
    value: number;
    unit: GridUnit;
    minValue?: number; // For minmax
    maxValue?: number; // For minmax
}

export interface GridArea {
    id: string;
    name: string;
    rowStart: number;
    rowEnd: number;
    columnStart: number;
    columnEnd: number;
    color?: string; // Optional color for visual distinction
}

export interface GridGap {
    row: number;
    column: number;
}

export interface GridConfig {
    rows: number;
    columns: number;
    rowSizes: GridDimension[];
    columnSizes: GridDimension[];
    areas: GridArea[];
    gap: GridGap;
}

export interface BlockPanelStyleTargetConfig {
    label?: string;
    description?: string;
    styles?: BlockStyleConfig;
}

export type BlockPanelTargetStyles = Record<string, BlockPanelStyleTargetConfig>;

export interface BlockPanelConfig {
    properties?: BlockPropertyConfig;
    targetStyles?: BlockPanelTargetStyles;
}

export interface BlockInterface extends HTMLElement {
    getPanelConfig(): BlockPanelConfig;
    getBlockEntities(): string[] | undefined;
    getBlockBoundingClientRect?(): DOMRect;
}
