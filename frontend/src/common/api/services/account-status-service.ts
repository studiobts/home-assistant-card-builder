import type { HomeAssistant } from 'custom-card-helpers';

const WS_ACCOUNT_STATUS = 'card_builder/account/status';

interface AccountStatusResponse {
    has_token?: boolean;
}

export interface AccountStatus {
    hasToken: boolean;
}

export class AccountStatusService {
    constructor(private hass: HomeAssistant) {
    }

    async getStatus(): Promise<AccountStatus> {
        const response = await this.hass.callWS<AccountStatusResponse>({
            type: WS_ACCOUNT_STATUS,
        });
        return {
            hasToken: Boolean(response.has_token),
        };
    }
}
