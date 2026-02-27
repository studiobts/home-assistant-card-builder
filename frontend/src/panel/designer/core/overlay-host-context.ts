import { createContext } from '@lit/context';
import type { TemplateResult } from 'lit';
import { nothing } from 'lit';

export type OverlayRenderer = () => TemplateResult | typeof nothing;

export interface OverlayHost {
    registerOverlay: (id: string, renderer: OverlayRenderer) => void;
    unregisterOverlay: (id: string) => void;
    invalidateOverlays: () => void;
}

export const overlayHostContext = createContext<OverlayHost>('overlay-host');
