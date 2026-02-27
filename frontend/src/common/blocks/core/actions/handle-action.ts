import type { ActionConfig } from '@/common/core/model/types';
import type { HomeAssistant } from 'custom-card-helpers';
import { forwardHaptic } from 'custom-card-helpers';
import { fireEvent } from 'custom-card-helpers';
import { navigate } from 'custom-card-helpers';
import { toggleEntity } from 'custom-card-helpers';

export interface ActionConfigParams {
    entity?: string;
    camera_image?: string;
    image_entity?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const handleActionConfig = async (
    node: HTMLElement,
    hass: HomeAssistant,
    config: ActionConfigParams,
    actionConfig: ActionConfig | undefined
): Promise<void> => {
    if (!actionConfig) {
        actionConfig = {
            action: 'more-info',
        };
    }

    if (
        actionConfig.confirmation
        && (!actionConfig.confirmation.exemptions
            || !actionConfig.confirmation.exemptions.some((e) => e.user === hass!.user?.id))
    ) {
        forwardHaptic('warning');

        const confirmationText = actionConfig.confirmation.text
            || `Are you sure you want to ${actionConfig.action}?`;

        if (!confirm(confirmationText)) {
            return;
        }
    }

    switch (actionConfig.action) {
        case 'more-info': {
            const entityId =
                ('entity' in actionConfig && actionConfig.entity)
                || config.entity
                || config.camera_image
                || config.image_entity;
            if (entityId) {
                fireEvent(node, 'hass-more-info', {entityId});
            } else {
                forwardHaptic('failure');
            }
            break;
        }
        case 'navigate':
            if (actionConfig.navigation_path) {
                const replace = 'navigation_replace' in actionConfig
                    ? actionConfig.navigation_replace
                    : undefined;
                navigate(node, actionConfig.navigation_path, replace);
            } else {
                forwardHaptic('failure');
            }
            break;
        case 'url':
            if (actionConfig.url_path) {
                window.open(actionConfig.url_path);
            } else {
                forwardHaptic('failure');
            }
            break;
        case 'toggle':
            if (config.entity) {
                toggleEntity(hass, config.entity!);
                forwardHaptic('light');
            } else {
                forwardHaptic('failure');
            }
            break;
        case 'perform-action':
        case 'call-service': {
            const serviceName =
                ('perform_action' in actionConfig && actionConfig.perform_action)
                || ('service' in actionConfig && actionConfig.service)
                || '';
            if (!serviceName) {
                forwardHaptic('failure');
                return;
            }
            const [domain, service] = serviceName.split('.', 2);
            await hass.callService(
                domain,
                service,
                ('data' in actionConfig && actionConfig.data !== undefined)
                    ? actionConfig.data
                    : ('service_data' in actionConfig ? actionConfig.service_data : undefined),
                'target' in actionConfig ? actionConfig.target : undefined
            );
            forwardHaptic('light');
            break;
        }
        case 'fire-dom-event': {
            fireEvent(node, 'll-custom', actionConfig);
            break;
        }
        default:
            break;
    }
};

export const handleAction = async (
    node: HTMLElement,
    hass: HomeAssistant,
    config: ActionConfigParams,
    action: string
): Promise<void> => {
    let actionConfig: ActionConfig | undefined;

    if (action === 'double_tap' && config.double_tap_action) {
        actionConfig = config.double_tap_action;
    } else if (action === 'hold' && config.hold_action) {
        actionConfig = config.hold_action;
    } else if (action === 'tap' && config.tap_action) {
        actionConfig = config.tap_action;
    }

    await handleActionConfig(node, hass, config, actionConfig);
};
