import type { HomeAssistant } from 'custom-card-helpers';
import type { ThemeMode } from '@/common/types/style-preset';

type HomeAssistantWithDarkMode = HomeAssistant & {
    themes?: HomeAssistant['themes'] & {
        darkMode?: boolean;
    };
};

export function getHassThemeMode(hass?: HomeAssistant): ThemeMode {
    return (hass as HomeAssistantWithDarkMode | undefined)?.themes?.darkMode ? 'dark' : 'light';
}
