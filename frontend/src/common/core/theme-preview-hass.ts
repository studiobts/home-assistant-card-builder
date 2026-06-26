import type { HomeAssistant } from 'custom-card-helpers';
import { getHassThemeMode } from '@/common/core/theme-mode';
import type { ThemeModeSelection } from '@/common/types/style-preset';

type HomeAssistantWithPreviewThemes = HomeAssistant & {
    themes: HomeAssistant['themes'] & {
        theme?: string;
        darkMode?: boolean;
    };
};

export interface ThemePreviewHassData {
    hass?: HomeAssistant;
    theme?: string;
}

export function createThemePreviewHass(
    hass: HomeAssistant | undefined,
    themeMode: ThemeModeSelection | undefined
): ThemePreviewHassData {
    if (!hass) {
        return {};
    }

    const hassWithThemes = hass as HomeAssistantWithPreviewThemes;
    const theme = hassWithThemes.themes?.theme || 'default';
    if (!themeMode || themeMode === 'auto' || getHassThemeMode(hass) === themeMode) {
        return {hass, theme};
    }

    return {
        hass: {
            ...hass,
            themes: {
                ...hassWithThemes.themes,
                darkMode: themeMode === 'dark',
            },
        } as HomeAssistant,
        theme,
    };
}
