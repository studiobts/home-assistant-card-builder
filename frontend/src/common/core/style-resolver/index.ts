import { createContext } from "@lit/context";
import { StyleResolver } from './style-resolver';

export { StyleResolver, type BindingContext } from '@/common/core/style-resolver/style-resolver';
export * from '@/common/core/style-resolver/style-resolution-types';
// Utils
export { resolvedToCSSProperties, valueToCSSString, type StyleOutputConfig } from '@/common/core/style-resolver/resolved-to-css';
export { getDefaultUnitForProperty, getUnitsForProperty } from '@/common/core/style-resolver/style-units';

export const styleResolverContext = createContext<StyleResolver>('style-resolver');