import type { HomeAssistant } from 'custom-card-helpers';
import { handleActionConfig } from '@/common/blocks/core/actions/handle-action';
import type { EventBus } from '@/common/core/event-bus';
import type { ActionConfig, ActionTrigger } from '@/common/core/model/types';

interface DispatchActionOptions {
    hass?: HomeAssistant;
    element: HTMLElement;
    action: ActionConfig;
    trigger: ActionTrigger;
    entityId?: string;
    eventBus?: EventBus;
    blockId?: string;
    targetId?: string;
    slotId?: string;
    throwOnError?: boolean;
}

export async function dispatchBlockAction(options: DispatchActionOptions): Promise<void> {
    const {hass, element, action, trigger, entityId, eventBus, blockId, targetId, slotId, throwOnError} = options;

    if (!hass) return;

    try {
        await handleActionConfig(element, hass, {entity: entityId}, action as any);
    } catch (error) {
        console.error('[Actions] Failed to dispatch action:', error);
        if (throwOnError) {
            throw error;
        }
    } finally {
        eventBus?.dispatchEvent('block-action', {
            blockId,
            targetId,
            trigger,
            action: action.action,
            entityId,
            slotId,
        });
    }
}
