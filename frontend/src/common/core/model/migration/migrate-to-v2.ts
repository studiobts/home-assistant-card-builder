import type { DocumentBlocks } from '@/common/core/model/types';
import type { ContainerStyleData } from '@/common/types/style-preset';

type MigratedStyleTargetData = {
    stylePresetId?: string;
    containers?: Record<string, ContainerStyleData>;
};

type LegacyStyleTargetData = {
    stylePresetId?: string;
    deviceStyles?: Record<string, ContainerStyleData>;
};

type LegacyBlockData = {
    styles?: Record<string, LegacyStyleTargetData>;
    deviceStyles?: Record<string, ContainerStyleData>;
    stylePresetId?: string;
    styleSlots?: Record<string, LegacyStyleTargetData>;
};

type LegacyDocumentConfig = {
    blocks?: DocumentBlocks;
    [key: string]: unknown;
};

export function migrateToV2(config: Record<string, unknown>): Record<string, unknown> {
    const blocks = (config as LegacyDocumentConfig).blocks;
    if (!blocks || typeof blocks !== 'object') {
        return {...config};
    }

    let changed = false;
    const nextBlocks: DocumentBlocks = {...blocks};

    for (const [blockId, blockValue] of Object.entries(blocks as Record<string, LegacyBlockData>)) {
        if (!blockValue || typeof blockValue !== 'object') continue;

        const block = blockValue as LegacyBlockData;
        const hasLegacyFields = 'deviceStyles' in block || 'stylePresetId' in block || 'styleSlots' in block;

        let nextBlock: LegacyBlockData = block;
        let styles = block.styles ? {...block.styles} : undefined;
        let stylesChanged = false;

        if (block.deviceStyles || block.stylePresetId) {
            const blockTarget: MigratedStyleTargetData = {...(styles?.block || {})};
            let blockTargetChanged = false;

            if (blockTarget.stylePresetId === undefined && block.stylePresetId !== undefined) {
                blockTarget.stylePresetId = block.stylePresetId;
                blockTargetChanged = true;
            }
            if (blockTarget.containers === undefined && block.deviceStyles !== undefined) {
                blockTarget.containers = block.deviceStyles;
                blockTargetChanged = true;
            }

            if (blockTargetChanged) {
                styles = {...(styles || {}), block: blockTarget};
                stylesChanged = true;
            }
        }

        if (block.styleSlots && typeof block.styleSlots === 'object') {
            for (const [targetId, slotData] of Object.entries(block.styleSlots)) {
                if (!targetId || !slotData || typeof slotData !== 'object') continue;

                const targetData: MigratedStyleTargetData = {...(styles?.[targetId] || {})};
                let targetChanged = false;

                if (targetData.stylePresetId === undefined && slotData.stylePresetId !== undefined) {
                    targetData.stylePresetId = slotData.stylePresetId;
                    targetChanged = true;
                }
                if (targetData.containers === undefined && slotData.deviceStyles !== undefined) {
                    targetData.containers = slotData.deviceStyles;
                    targetChanged = true;
                }

                if (targetChanged) {
                    styles = {...(styles || {}), [targetId]: targetData};
                    stylesChanged = true;
                }
            }
        }

        if (stylesChanged || hasLegacyFields) {
            nextBlock = {...block};
            if (stylesChanged) {
                nextBlock.styles = styles;
            }
            if (hasLegacyFields) {
                delete nextBlock.deviceStyles;
                delete nextBlock.stylePresetId;
                delete nextBlock.styleSlots;
            }
            nextBlocks[blockId] = nextBlock as DocumentBlocks[string];
            changed = true;
        }
    }

    if (!changed) {
        return {...config};
    }

    return {
        ...config,
        blocks: nextBlocks,
    };
}
