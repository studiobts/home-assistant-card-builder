import {
    registerChartSeriesOptionBuilder,
    type ChartSeriesOptionBuildContext,
    type ChartSeriesOptionBuildResult,
} from '@/common/blocks/components/charts/chart-series-options';
import type { ResolvedChartSeries } from '@/common/blocks/components/charts/chart-types';
import {
    buildTextStyle,
    mergeObject,
    parseEchartColor,
    parseNumber,
    parsePx,
    type StyleMap,
} from '@/common/blocks/components/charts/chart-style-adapter';

function resolveXAxisIndex(series: ResolvedChartSeries, context: ChartSeriesOptionBuildContext): number {
    const xAxisId = series.seriesConfig.xAxisId || context.components.defaultXAxisId;
    return xAxisId ? (context.components.xAxisIndexById.get(xAxisId) ?? 0) : 0;
}

function resolveYAxisIndex(series: ResolvedChartSeries, context: ChartSeriesOptionBuildContext): number {
    const yAxisId = series.seriesConfig.yAxisId || context.components.defaultYAxisId;
    return yAxisId ? (context.components.yAxisIndexById.get(yAxisId) ?? 0) : 0;
}

function buildBarSeriesOption(series: ResolvedChartSeries, context: ChartSeriesOptionBuildContext): any {
    const style = series.seriesConfig.style;

    return {
        id: series.id,
        name: series.name,
        type: 'bar',
        data: series.points.map((point) => [point.timestamp, point.value]),
        xAxisIndex: resolveXAxisIndex(series, context),
        yAxisIndex: resolveYAxisIndex(series, context),
        stack: series.seriesConfig.stack,
        barWidth: style.barWidth ?? 18,
        itemStyle: {
            color: series.color,
            borderRadius: style.borderRadius ?? 0,
        },
    };
}

export function buildBarSeriesOptions(
    series: ResolvedChartSeries[],
    context: ChartSeriesOptionBuildContext
): ChartSeriesOptionBuildResult {
    return {
        series: series.map((entry) => ({
            option: buildBarSeriesOption(entry, context),
            sourceSeriesIds: [entry.id],
        })),
    };
}

export function applyBarSeriesStyle(option: any, style: StyleMap): void {
    if (!option || Object.keys(style).length === 0) {
        return;
    }

    const color = parseEchartColor(style.color);
    const borderColor = parseEchartColor(style.borderColor);
    const borderWidth = parsePx(style.borderWidth);
    const opacity = parseNumber(style.opacity);
    const echartBarColor = parseEchartColor(style.echartBarColor) ?? color;
    const echartBarBorderRadius = parseNumber(style.echartBarBorderRadius);

    option.itemStyle = mergeObject(option.itemStyle, {
        color: echartBarColor ?? option.itemStyle?.color,
        borderColor: borderColor ?? option.itemStyle?.borderColor,
        borderWidth,
        borderRadius: echartBarBorderRadius ?? option.itemStyle?.borderRadius,
        opacity,
    });
    option.label = mergeObject(option.label, buildTextStyle(style));
}

function applyBarSeriesItemStyle(itemOption: any): any {
    return itemOption;
}

registerChartSeriesOptionBuilder({
    type: 'bar',
    buildSeriesOptions: buildBarSeriesOptions,
    applySeriesStyle: applyBarSeriesStyle,
    applySeriesItemStyle: applyBarSeriesItemStyle,
});
