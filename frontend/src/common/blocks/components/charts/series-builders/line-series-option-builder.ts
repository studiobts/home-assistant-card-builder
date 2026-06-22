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
    sanitizeEchartLineSymbol,
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

function buildLineSeriesOption(series: ResolvedChartSeries, context: ChartSeriesOptionBuildContext): any {
    const style = series.seriesConfig.style;
    const showArea = style.lineMode === 'area';

    return {
        id: series.id,
        name: series.name,
        type: 'line',
        data: series.points.map((point) => [point.timestamp, point.value]),
        xAxisIndex: resolveXAxisIndex(series, context),
        yAxisIndex: resolveYAxisIndex(series, context),
        smooth: style.smooth ?? true,
        showSymbol: style.showPoints ?? false,
        symbolSize: 7,
        lineStyle: {
            width: style.lineWidth ?? 2,
            color: series.color,
        },
        itemStyle: {
            color: series.color,
        },
        areaStyle: showArea
            ? {
                opacity: style.areaOpacity,
                color: series.color,
            }
            : undefined,
        connectNulls: style.connectNulls ?? false,
    };
}

export function buildLineSeriesOptions(
    series: ResolvedChartSeries[],
    context: ChartSeriesOptionBuildContext
): ChartSeriesOptionBuildResult {
    return {
        series: series.map((entry) => ({
            option: buildLineSeriesOption(entry, context),
            sourceSeriesIds: [entry.id],
        })),
    };
}

export function applyLineSeriesStyle(option: any, style: StyleMap): void {
    if (!option || Object.keys(style).length === 0) {
        return;
    }

    const color = parseEchartColor(style.color);
    const borderColor = parseEchartColor(style.borderColor);
    const borderWidth = parsePx(style.borderWidth);
    const opacity = parseNumber(style.opacity);
    const echartLineColor = parseEchartColor(style.echartLineColor) ?? color;
    const echartAreaColor = parseEchartColor(style.echartAreaColor);
    const echartLineWidth = parseNumber(style.echartLineWidth);
    const echartLineSymbol = sanitizeEchartLineSymbol(style.echartLineSymbol);
    const echartLineSymbolSize = parseNumber(style.echartLineSymbolSize);

    option.lineStyle = mergeObject(option.lineStyle, {
        color: echartLineColor ?? option.lineStyle?.color,
        width: echartLineWidth ?? borderWidth ?? option.lineStyle?.width,
        opacity,
    });
    option.itemStyle = mergeObject(option.itemStyle, {
        color: echartLineColor ?? option.itemStyle?.color,
        borderColor: borderColor ?? option.itemStyle?.borderColor,
        borderWidth,
        opacity,
    });
    if (option.areaStyle) {
        option.areaStyle = mergeObject(option.areaStyle, {
            color: echartAreaColor ?? option.areaStyle?.color,
        });
    }
    if (echartLineSymbol !== undefined) {
        option.symbol = echartLineSymbol;
    }
    if (echartLineSymbolSize !== undefined) {
        option.symbolSize = echartLineSymbolSize;
    }
    option.label = mergeObject(option.label, buildTextStyle(style));
}

function applyLineSeriesItemStyle(itemOption: any): any {
    return itemOption;
}

registerChartSeriesOptionBuilder({
    type: 'line',
    buildSeriesOptions: buildLineSeriesOptions,
    applySeriesStyle: applyLineSeriesStyle,
    applySeriesItemStyle: applyLineSeriesItemStyle,
});
