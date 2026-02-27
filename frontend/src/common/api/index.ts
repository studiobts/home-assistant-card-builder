/**
 * API service exports
 */

import type { HomeAssistant } from 'custom-card-helpers';
import { CardsService } from './services/cards-service';
import { CssCustomPropertiesService } from "./services/css-custom-properties-service";
import { StylePresetsService } from "./services/style-presets-service";

export * from './types';
export { CardsService } from './services/cards-service';
export { CssCustomPropertiesService } from './services/css-custom-properties-service';
export { MediaService } from './services/media-service';
export { StylePresetsService } from './services/style-presets-service';
export type { CSSCustomPropertyUpdateCallback } from './services/css-custom-properties-service';
export type { PresetUpdateCallback } from './services/style-presets-service';

/**
 * Singleton instance of CardsService
 */
let cardServiceInstance: CardsService | null = null;
let stylePresetsServiceInstance: StylePresetsService | null = null;
let cssCustomPropertiesServiceInstance: CssCustomPropertiesService | null = null;

/**
 * Get or create CardsService instance
 * @param hass HomeAssistant instance
 * @returns CardsService singleton
 */
export function getCardsService(hass: HomeAssistant): CardsService {
    if (!cardServiceInstance || (cardServiceInstance as any).hass !== hass) {
        cardServiceInstance = new CardsService(hass);
    }
    return cardServiceInstance;
}

/**
 * Get or create StylePresetsService instance
 * @param hass HomeAssistant instance
 * @returns StylePresetsService singleton
 */
export async function getStylePresentsService(hass: HomeAssistant): Promise<StylePresetsService> {
    if (!stylePresetsServiceInstance || (stylePresetsServiceInstance as any).hass !== hass) {
        stylePresetsServiceInstance = new StylePresetsService(hass);
        await stylePresetsServiceInstance.initialize();
    }

    return stylePresetsServiceInstance;
}

/**
 * Get or create CSSCustomPropertiesService instance
 * @param hass HomeAssistant instance
 * @returns CSSCustomPropertiesService singleton
 */
export async function getCSSCustomPropertiesService(hass: HomeAssistant): Promise<CssCustomPropertiesService> {
    if (!cssCustomPropertiesServiceInstance || (cssCustomPropertiesServiceInstance as any).hass !== hass) {
        cssCustomPropertiesServiceInstance = new CssCustomPropertiesService(hass);
        await cssCustomPropertiesServiceInstance.initialize();
    }

    return cssCustomPropertiesServiceInstance;
}
