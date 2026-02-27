import { createContext } from "@lit/context";
import type { BlockRegistry } from './block-registry';

export const blockRegistryContext = createContext<BlockRegistry>('block-registry');