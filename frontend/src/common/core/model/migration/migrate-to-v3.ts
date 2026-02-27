import type { ActionConfig, ActionSlot, DocumentSlots, EntitySlot } from '@/common/core/model/types';

type LegacyDocumentConfig = {
    slots?: Record<string, EntitySlot> | DocumentSlots;
    [key: string]: unknown;
};

export function migrateToV3(config: Record<string, unknown>): Record<string, unknown> {
    const legacySlots = (config as LegacyDocumentConfig).slots;

    if (!legacySlots || typeof legacySlots !== 'object' || Array.isArray(legacySlots)) {
        return {
            ...config,
            slots: {entities: {}, actions: {}},
        };
    }

    if ('entities' in legacySlots) {
        const nextSlots = legacySlots as {
            entities?: Record<string, EntitySlot>;
            actions?: Record<string, ActionSlot>;
            targets?: Record<string, { id?: string; name?: string; description?: string }>;
        };
        const actions = nextSlots.actions ?? migrateLegacyActionSlots(nextSlots.targets ?? {});
        return {
            ...config,
            slots: {
                entities: nextSlots.entities ?? {},
                actions,
            },
        };
    }

    return {
        ...config,
        slots: {
            entities: legacySlots as Record<string, EntitySlot>,
            actions: {} as Record<string, ActionSlot>,
        },
    };
}

function migrateLegacyActionSlots(
    legacyTargets: Record<string, { id?: string; name?: string; description?: string }>
): Record<string, ActionSlot> {
    const entries = Object.entries(legacyTargets);
    if (entries.length === 0) {
        return {};
    }

    const fallbackAction: ActionConfig = {action: 'none'};

    return entries.reduce<Record<string, ActionSlot>>((acc, [slotId, slot]) => {
        const id = slot.id || slotId;
        acc[id] = {
            id,
            name: slot.name,
            description: slot.description,
            trigger: 'tap',
            action: fallbackAction,
        };
        return acc;
    }, {});
}
