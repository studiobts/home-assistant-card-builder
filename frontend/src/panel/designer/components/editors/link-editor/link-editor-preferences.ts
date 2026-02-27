import { createContext } from '@lit/context';

export interface LinkEditorPreferences {
    showGrid: boolean;
    snapToGrid: boolean;
    snapToPoints: boolean;
    snapToBlocks: boolean;
    showPoints: boolean;
}

export const DEFAULT_LINK_EDITOR_PREFERENCES: LinkEditorPreferences = {
    showGrid: false,
    snapToGrid: false,
    snapToPoints: false,
    snapToBlocks: false,
    showPoints: true,
};

export function normalizeLinkEditorPreferences(input?: Partial<LinkEditorPreferences> | null): LinkEditorPreferences {
    return {
        ...DEFAULT_LINK_EDITOR_PREFERENCES,
        ...(input ?? {}),
    };
}

export const linkEditorPreferencesContext = createContext<LinkEditorPreferences>('link-editor-preferences');
