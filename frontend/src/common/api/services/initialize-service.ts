import type { HomeAssistant } from 'custom-card-helpers';
import type { CardBuilderRuntimeConfig } from '@/common/api/runtime-config';

const WS_INITIALIZE = 'card_builder/initialize';

interface InitializeResponse {
    base_domain: string;
    base_schema: string;
    integration_version?: string;
    has_token?: boolean;
}

export class InitializeService {
    constructor(private hass: HomeAssistant) {
    }

    async initialize(): Promise<CardBuilderRuntimeConfig> {
        const response = await this.hass.callWS<InitializeResponse>({
            type: WS_INITIALIZE,
        });
        return {
            baseDomain: response.base_domain,
            baseSchema: response.base_schema,
            integrationVersion: response.integration_version,
            hasToken: response.has_token,
        };
    }
}
