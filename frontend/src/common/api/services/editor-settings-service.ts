import { BASE_PATH, type GlobalEditorSettings } from '@/common/api/types';
import type { HomeAssistant } from 'custom-card-helpers';

const BASE_EDITOR_SETTINGS_PATH = `${BASE_PATH}/editor_settings`;

export class EditorSettingsService {
    constructor(private hass: HomeAssistant) {
    }

    async getSettings(): Promise<GlobalEditorSettings> {
        return this.hass.callWS<GlobalEditorSettings>({
            type: `${BASE_EDITOR_SETTINGS_PATH}/get`,
        });
    }

    async updateSettings(settings: GlobalEditorSettings | undefined): Promise<GlobalEditorSettings> {
        return this.hass.callWS<GlobalEditorSettings>({
            type: `${BASE_EDITOR_SETTINGS_PATH}/update`,
            settings: settings ?? {},
        });
    }
}
