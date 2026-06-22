import type { HomeAssistant } from 'custom-card-helpers';
import { getUnitConversionService } from '@/common/api';
import type { UnitConversionService } from '@/common/api/services/unit-conversion-service';
import {
    applyUnitMultiplier,
    resolveCustomUnitDisplay,
    resolveSourceUnitDisplay,
    type ResolvedUnitDisplay,
    type UnitConversionSource,
    type UnitDisplayConfig,
} from '@/common/core/unit-conversion';
import type {
    BaseChartConfig,
    ChartRuntimeData,
    ChartSeriesConfig,
    ResolvedChartSeriesItem,
    ResolvedChartSeries,
} from '@/common/blocks/components/charts/chart-types';

function getEntityDomain(entityId: string): string {
    return entityId.split('.')[0] || 'sensor';
}

async function resolveTargetUnitDisplay(
    service: UnitConversionService,
    config: UnitDisplayConfig,
    source: UnitConversionSource
): Promise<ResolvedUnitDisplay> {
    const targetUnit = config.targetUnit || source.sourceUnit;
    const info = await service.getConversionInfo(
        source.domain,
        source.deviceClass,
        source.sourceUnit,
        targetUnit
    );

    if (!info.supported || typeof info.multiplier !== 'number') {
        return resolveSourceUnitDisplay(source);
    }

    return {
        multiplier: info.multiplier,
        unit: targetUnit,
    };
}

async function resolveUnitDisplay(
    service: UnitConversionService,
    config: UnitDisplayConfig,
    source: UnitConversionSource
): Promise<ResolvedUnitDisplay> {
    if (config.mode === 'custom') {
        return resolveCustomUnitDisplay(config, source);
    }
    if (config.mode === 'target') {
        return resolveTargetUnitDisplay(service, config, source);
    }
    return resolveSourceUnitDisplay(source);
}

function convertSeries(
    series: ResolvedChartSeries,
    display: ResolvedUnitDisplay,
    unitConfig: UnitDisplayConfig
): ResolvedChartSeries {
    if (display.multiplier === 1 && display.unit === series.unit && series.showUnit === unitConfig.showUnit) {
        return series;
    }

    return {
        ...series,
        unit: display.unit,
        showUnit: unitConfig.showUnit,
        points: series.points.map((point) => ({
            ...point,
            value: applyUnitMultiplier(point.value, display.multiplier),
        })),
    };
}

function convertSeriesItem(
    item: ResolvedChartSeriesItem,
    display: ResolvedUnitDisplay,
    unitConfig: UnitDisplayConfig
): ResolvedChartSeriesItem {
    if (display.multiplier === 1 && display.unit === item.unit && item.showUnit === unitConfig.showUnit) {
        return item;
    }

    return {
        ...item,
        unit: display.unit,
        showUnit: unitConfig.showUnit,
        points: item.points.map((point) => ({
            ...point,
            value: applyUnitMultiplier(point.value, display.multiplier),
        })),
    };
}

async function convertSeriesWithConfig(
    service: UnitConversionService,
    series: ResolvedChartSeries,
    unitConfig: UnitDisplayConfig
): Promise<ResolvedChartSeries> {
    const display = await resolveUnitDisplay(service, unitConfig, {
        domain: getEntityDomain(series.entityId),
        deviceClass: series.deviceClass,
        sourceUnit: series.sourceUnit,
    });
    return convertSeries(series, display, unitConfig);
}

async function convertSeriesItemWithConfig(
    service: UnitConversionService,
    item: ResolvedChartSeriesItem,
    unitConfig: UnitDisplayConfig
): Promise<ResolvedChartSeriesItem> {
    const display = await resolveUnitDisplay(service, unitConfig, {
        domain: getEntityDomain(item.entityId),
        deviceClass: item.deviceClass,
        sourceUnit: item.sourceUnit,
    });
    return convertSeriesItem(item, display, unitConfig);
}

async function convertResolvedSeries(
    service: UnitConversionService,
    series: ResolvedChartSeries
): Promise<ResolvedChartSeries> {
    const convertedSeries = series.points.length > 0
        ? await convertSeriesWithConfig(service, series, series.seriesConfig.valueUnit)
        : series;
    if (!series.items?.length) {
        return convertedSeries;
    }

    const items = await Promise.all(series.items.map((item) => (
        convertSeriesItemWithConfig(service, item, item.itemConfig.valueUnit || series.seriesConfig.valueUnit)
    )));

    return {
        ...convertedSeries,
        items,
    };
}

export async function applyChartUnitConversion(
    hass: HomeAssistant,
    _config: BaseChartConfig,
    runtimeData: ChartRuntimeData
): Promise<ChartRuntimeData> {
    const service = getUnitConversionService(hass);

    const series = await Promise.all(runtimeData.series.map((entry) => convertResolvedSeries(service, entry)));

    return {
        ...runtimeData,
        series,
    };
}

export function getChartSeriesUnitConfig(_config: BaseChartConfig, series: ChartSeriesConfig): UnitDisplayConfig | undefined {
    return series.valueUnit;
}
