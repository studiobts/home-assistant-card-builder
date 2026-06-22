import {
    buildCartesianComponentsOptions,
    buildChartLegendOption,
    buildChartTitleOption,
    buildChartTooltipOption,
    buildDataZoomOptions,
    buildDatasetOptions,
    buildVisualMapOptions,
} from '@/common/blocks/components/charts/chart-common-options';
import {
    getChartSeriesOptionBuilder,
    type ChartSeriesOptionBuildContext,
    type ChartSeriesOptionBuildResult,
    type ChartSeriesOptionEntry,
} from '@/common/blocks/components/charts/chart-series-options';
import type {
    BaseChartConfig,
    ChartRuntimeData,
    ChartSeriesConfig,
} from '@/common/blocks/components/charts/chart-types';
import type { EChartsOption } from 'echarts';

export interface BuildChartOptionOptions {
    chartSize?: { width: number; height: number };
}

function mergePatch<T>(base: T, patch: Record<string, unknown> | undefined): T {
    if (!patch) {
        return base;
    }
    return {
        ...(base as Record<string, unknown>),
        ...patch,
    } as T;
}

function mergeGraphic(target: EChartsOption['graphic'], patch: EChartsOption['graphic']): EChartsOption['graphic'] {
    if (!target) {
        return patch;
    }
    if (!patch) {
        return target;
    }
    return [
        ...(Array.isArray(target) ? target : [target]),
        ...(Array.isArray(patch) ? patch : [patch]),
    ] as EChartsOption['graphic'];
}

function mergeBuildResult(target: ChartSeriesOptionBuildResult, next: ChartSeriesOptionBuildResult): ChartSeriesOptionBuildResult {
    target.series.push(...next.series);
    target.title = next.title !== undefined ? next.title : target.title;
    target.legendPatch = mergePatch(target.legendPatch ?? {}, next.legendPatch);
    target.tooltipPatch = mergePatch(target.tooltipPatch ?? {}, next.tooltipPatch);
    target.graphic = mergeGraphic(target.graphic, next.graphic);
    return target;
}

function buildSeriesOptions(
    runtimeData: ChartRuntimeData,
    context: ChartSeriesOptionBuildContext
): ChartSeriesOptionBuildResult {
    const result: ChartSeriesOptionBuildResult = {series: []};

    for (const entry of runtimeData.series) {
        const builder = getChartSeriesOptionBuilder(entry.seriesConfig.type);
        if (!builder) {
            continue;
        }

        mergeBuildResult(result, builder.buildSeriesOptions([entry], context));
    }

    return result;
}

function registerSeriesIndexes(
    entries: ChartSeriesOptionEntry[],
    seriesOptions: any[],
    seriesIndexById: Map<string, number>
): void {
    for (const entry of entries) {
        const index = seriesOptions.length;
        seriesOptions.push(entry.option);
        for (const sourceSeriesId of entry.sourceSeriesIds) {
            seriesIndexById.set(sourceSeriesId, index);
        }
    }
}

export function buildChartOption(
    config: BaseChartConfig,
    runtimeData: ChartRuntimeData,
    options: BuildChartOptionOptions = {}
): EChartsOption {
    const components = buildCartesianComponentsOptions(config, runtimeData);
    const configSeriesById = new Map<string, ChartSeriesConfig>(config.series.map((series) => [series.id, series]));
    const context: ChartSeriesOptionBuildContext = {
        config,
        runtimeData,
        components,
        configSeriesById,
        chartSize: options.chartSize,
    };

    const seriesOptions: any[] = [];
    const seriesIndexById = new Map<string, number>();
    let title = buildChartTitleOption(config);
    let legend = buildChartLegendOption(config);
    let tooltip = buildChartTooltipOption(config, runtimeData);
    let graphic: EChartsOption['graphic'];

    const seriesBuildResult = buildSeriesOptions(runtimeData, context);
    registerSeriesIndexes(seriesBuildResult.series, seriesOptions, seriesIndexById);
    title = seriesBuildResult.title === null ? {show: false} : (seriesBuildResult.title ?? title);
    legend = mergePatch(legend, seriesBuildResult.legendPatch);
    tooltip = mergePatch(tooltip, seriesBuildResult.tooltipPatch);
    graphic = mergeGraphic(graphic, seriesBuildResult.graphic);

    const usesCartesianComponents = config.capabilities.usesCartesianComponents;

    return {
        animationDuration: 220,
        color: runtimeData.series.map((series) => series.color),
        title,
        legend,
        tooltip,
        grid: usesCartesianComponents ? components.gridOptions : undefined,
        xAxis: usesCartesianComponents ? components.xAxisOptions : undefined,
        yAxis: usesCartesianComponents ? components.yAxisOptions : undefined,
        dataZoom: usesCartesianComponents
            ? buildDataZoomOptions(config, components.xAxisIndexById, components.yAxisIndexById)
            : undefined,
        visualMap: buildVisualMapOptions(config, seriesIndexById),
        dataset: buildDatasetOptions(config),
        graphic,
        series: seriesOptions,
    };
}
