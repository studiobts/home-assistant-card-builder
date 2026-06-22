import type { ChartStatisticType } from '@/common/blocks/components/charts/chart-types';
import type { HomeAssistant } from 'custom-card-helpers';

interface HomeAssistantStatisticMetadata {
    statistic_id: string;
    display_unit_of_measurement?: string | null;
    statistics_unit_of_measurement?: string | null;
    unit_class?: string | null;
    has_mean?: boolean;
    mean_type?: string;
    has_sum?: boolean;
    name?: string | null;
    source?: string;
}

export interface ChartStatisticAvailability {
    entityId: string;
    hasStatistics: boolean;
    statisticTypes: ChartStatisticType[];
    defaultStatisticType?: ChartStatisticType;
    unit?: string;
    source?: string;
}

export async function loadChartStatisticAvailability(
    hass: HomeAssistant,
    entityId: string
): Promise<ChartStatisticAvailability> {
    const result = await hass.callWS<HomeAssistantStatisticMetadata[]>({
        type: 'recorder/get_statistics_metadata',
        statistic_ids: [entityId],
    });
    const metadata = result.find((entry) => entry.statistic_id === entityId);
    if (!metadata) {
        return {
            entityId,
            hasStatistics: false,
            statisticTypes: [],
        };
    }

    const statisticTypes = getChartStatisticTypesFromMetadata(metadata);
    return {
        entityId,
        hasStatistics: statisticTypes.length > 0,
        statisticTypes,
        defaultStatisticType: getDefaultChartStatisticType(statisticTypes),
        unit: metadata.statistics_unit_of_measurement || metadata.display_unit_of_measurement || undefined,
        source: metadata.source,
    };
}

export function getChartStatisticTypesFromMetadata(metadata: Pick<HomeAssistantStatisticMetadata, 'has_mean' | 'has_sum'>): ChartStatisticType[] {
    const statisticTypes: ChartStatisticType[] = [];

    // Home Assistant currently exposes has_mean only for arithmetic means.
    // Circular means are intentionally not mapped to mean/min/max here.
    if (metadata.has_mean) {
        statisticTypes.push('mean', 'min', 'max');
    }

    if (metadata.has_sum) {
        statisticTypes.push('sum', 'state', 'change');
    }

    return statisticTypes;
}

export function getDefaultChartStatisticType(statisticTypes: readonly ChartStatisticType[]): ChartStatisticType | undefined {
    if (statisticTypes.includes('mean')) {
        return 'mean';
    }

    if (statisticTypes.includes('change')) {
        return 'change';
    }

    return statisticTypes[0];
}
