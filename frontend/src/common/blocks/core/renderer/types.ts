import type { ResolvedStyleData } from "@/common/core/style-resolver";
import type { PositionConfig } from "./position-system";
import type { BlockPosition, BlockSize } from "@/common/core/model";

export interface RenderContext {
    tag: any;
}

export interface ResolvedRenderContext {
    canvasWidth: number;
    canvasHeight: number;
    resolved: ResolvedStyleData,
    layoutData?: StyleLayoutData;
    styles: Record<string, string>;
    targetStyles?: Record<string, Record<string, string>>;
}

export interface StyleLayoutData {
    position: BlockPosition;
    size: BlockSize;
    positionConfig: Required<PositionConfig>;
}
