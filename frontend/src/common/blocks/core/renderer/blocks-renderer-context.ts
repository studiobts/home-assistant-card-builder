import type { BlocksRenderer } from "@/common/blocks/core/renderer/blocks-renderer";
import { createContext } from "@lit/context";

export const blocksRendererContext = createContext<BlocksRenderer>('blocks-renderer');