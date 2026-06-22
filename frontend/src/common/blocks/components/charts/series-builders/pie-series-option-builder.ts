import {
    buildChartTitleOption,
    hasVisibleChartTitle,
} from '@/common/blocks/components/charts/chart-common-options';
import {
    registerChartSeriesOptionBuilder,
    type ChartSeriesOptionBuildContext,
    type ChartSeriesOptionBuildResult,
} from '@/common/blocks/components/charts/chart-series-options';
import type {
    PieDonutChartConfig,
    PieDonutSpecificConfig,
    ResolvedChartSeries,
    ResolvedChartSeriesItem,
} from '@/common/blocks/components/charts/chart-types';
import {
    buildTextStyle,
    mergeObject,
    parseBoolean,
    parseEchartColor,
    parseNumber,
    parsePx,
    sanitizeEchartPieLabelPosition,
    type StyleMap,
} from '@/common/blocks/components/charts/chart-style-adapter';
import { formatConvertedValue } from '@/common/core/unit-conversion';

const PIE_CENTER_TITLE_GRAPHIC_ID = 'chart-center-title';
const PIE_CENTER_TITLE_TEXT_GRAPHIC_ID = 'chart-center-title-text';

type ChartSize = { width: number; height: number };

const DEFAULT_PIE_SPECIFIC: PieDonutSpecificConfig = {
    mode: 'pie',
    outerRadius: 85,
    innerRadius: 55,
    centerMode: 'auto',
    centerXReference: 'center',
    centerXOffset: 0,
    centerYReference: 'middle',
    centerYOffset: 0,
    titleCenterReference: 'pie',
    showLegendValue: false,
    showLabel: true,
    showSliceValue: false,
};

function getPieSpecific(config: ChartSeriesOptionBuildContext['config']): PieDonutSpecificConfig {
    const candidate = (config as Partial<PieDonutChartConfig>).specific;
    return {
        ...DEFAULT_PIE_SPECIFIC,
        ...(candidate || {}),
    };
}

function resolveItemValue(item: ResolvedChartSeriesItem): number {
    const values = item.points
        .map((point) => point.value)
        .filter((value) => typeof value === 'number' && Number.isFinite(value));

    if (values.length === 0) {
        return 0;
    }

    const dataSource = item.itemConfig.binding.dataSource;

    if (dataSource.mode === 'statistics') {
        switch (dataSource.statisticType) {
            case 'change':
                return values.reduce((total, value) => total + value, 0);
            case 'sum':
                return values[values.length - 1] - values[0];
            case 'max':
                return Math.max(...values);
            case 'min':
                return Math.min(...values);
            case 'mean':
                // Average of per-bucket means: exact for uniform bucket widths (5minute/hour/day),
                // approximate for non-uniform calendar buckets (week/month).
                return values.reduce((total, value) => total + value, 0) / values.length;
            case 'state':
                return values[values.length - 1];
        }
        return values[values.length - 1];
    }

    if (dataSource.mode === 'history') {
        if (dataSource.historyAggregation === 'max') {
            return Math.max(...values);
        }
        if (dataSource.historyAggregation === 'delta') {
            return values[values.length - 1] - values[0];
        }
        return values[values.length - 1];
    }

    return values[values.length - 1];
}

function buildRadius(specific: PieDonutSpecificConfig): string | [string, string] {
    const outer = Math.max(10, Math.min(100, Math.round(specific.outerRadius)));
    if (specific.mode === 'donut') {
        const inner = Math.max(0, Math.min(outer - 1, Math.round(specific.innerRadius)));
        return [`${inner}%`, `${outer}%`];
    }
    return `${outer}%`;
}

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, value));
}

function resolveHorizontalReference(reference: PieDonutSpecificConfig['centerXReference'], offset: number): string {
    const safeOffset = Number.isFinite(offset) ? offset : 0;
    switch (reference) {
        case 'left':
            return `${clampPercent(safeOffset)}%`;
        case 'right':
            return `${clampPercent(100 - safeOffset)}%`;
        default:
            return `${clampPercent(50 + safeOffset)}%`;
    }
}

function resolveVerticalReference(reference: PieDonutSpecificConfig['centerYReference'], offset: number): string {
    const safeOffset = Number.isFinite(offset) ? offset : 0;
    switch (reference) {
        case 'top':
            return `${clampPercent(safeOffset)}%`;
        case 'bottom':
            return `${clampPercent(100 - safeOffset)}%`;
        default:
            return `${clampPercent(50 + safeOffset)}%`;
    }
}

function resolveManualCenterWithChartSize(specific: PieDonutSpecificConfig, chartSize: ChartSize): [string, string] {
    const width = Math.max(1, chartSize.width);
    const height = Math.max(1, chartSize.height);
    const radius = Math.min(width, height) * (Math.max(10, Math.min(100, specific.outerRadius)) / 100) / 2;

    const xOffsetPx = width * ((Number.isFinite(specific.centerXOffset) ? specific.centerXOffset : 0) / 100);
    const yOffsetPx = height * ((Number.isFinite(specific.centerYOffset) ? specific.centerYOffset : 0) / 100);

    let centerX = width / 2 + xOffsetPx;
    if (specific.centerXReference === 'left') {
        centerX = radius + xOffsetPx;
    } else if (specific.centerXReference === 'right') {
        centerX = width - radius - xOffsetPx;
    }

    let centerY = height / 2 + yOffsetPx;
    if (specific.centerYReference === 'top') {
        centerY = radius + yOffsetPx;
    } else if (specific.centerYReference === 'bottom') {
        centerY = height - radius - yOffsetPx;
    }

    return [
        `${clampPercent((centerX / width) * 100)}%`,
        `${clampPercent((centerY / height) * 100)}%`,
    ];
}

function buildCenter(context: ChartSeriesOptionBuildContext, specific: PieDonutSpecificConfig): [string, string] {
    if (specific.centerMode === 'manual') {
        if (context.chartSize && Number.isFinite(context.chartSize.width) && Number.isFinite(context.chartSize.height)) {
            return resolveManualCenterWithChartSize(specific, context.chartSize);
        }
        return [
            resolveHorizontalReference(specific.centerXReference, specific.centerXOffset),
            resolveVerticalReference(specific.centerYReference, specific.centerYOffset),
        ];
    }

    if (!context.config.legend.show) {
        return ['50%', '50%'];
    }

    if (context.config.legend.position === 'right') {
        return ['38%', '50%'];
    }

    if (context.config.legend.position === 'left') {
        return ['62%', '50%'];
    }

    return ['50%', '50%'];
}

function buildPieTitleOption(config: ChartSeriesOptionBuildContext['config'], specific: PieDonutSpecificConfig): any {
    const title = buildChartTitleOption(config);
    if (!title || config.title.position !== 'center' || specific.titleCenterReference === 'block') {
        return title;
    }

    return null;
}

function buildPieCenterTitleGraphic(
    config: ChartSeriesOptionBuildContext['config'],
    specific: PieDonutSpecificConfig,
    center: [string, string]
): any {
    if (
        !hasVisibleChartTitle(config)
        || config.title.position !== 'center'
        || specific.titleCenterReference !== 'pie'
    ) {
        return undefined;
    }

    return {
        elements: [
            {
                id: PIE_CENTER_TITLE_GRAPHIC_ID,
                type: 'group',
                left: center[0],
                top: center[1],
                width: 0,
                height: 0,
                bounding: 'raw',
                silent: true,
                z: 20,
                children: [
                    {
                        id: PIE_CENTER_TITLE_TEXT_GRAPHIC_ID,
                        type: 'text',
                        silent: true,
                        style: {
                            x: 0,
                            y: 0,
                            text: config.title.text,
                            fill: '#333',
                            fontSize: 13,
                            fontWeight: 600,
                            align: 'center',
                            verticalAlign: 'middle',
                        },
                    },
                ],
            },
        ],
    };
}

function formatPieValue(
    value: number,
    context: ChartSeriesOptionBuildContext,
    unit?: string,
    showUnit?: boolean
): string {
    return formatConvertedValue(value, context.config.tooltip.decimals, unit, Boolean(showUnit));
}

function buildLegendPatch(
    context: ChartSeriesOptionBuildContext,
    specific: PieDonutSpecificConfig,
    data: any[]
): Record<string, unknown> | undefined {
    if (!specific.showLegendValue) {
        return undefined;
    }

    const valueByName = new Map(data.map((entry) => [
        entry.name,
        formatPieValue(entry.value, context, entry.unit, entry.showUnit),
    ]));

    return {
        formatter: (name: string) => {
            const value = valueByName.get(name);
            return value ? `${name}  ${value}` : name;
        },
    };
}

export function buildPieSeriesOptions(
    series: ResolvedChartSeries[],
    context: ChartSeriesOptionBuildContext
): ChartSeriesOptionBuildResult {
    const specific = getPieSpecific(context.config);
    const center = buildCenter(context, specific);
    const pieSeries = series[0];
    const items = pieSeries?.items || [];
    const data = items.map((entry) => ({
        id: entry.id,
        name: entry.name,
        value: resolveItemValue(entry),
        unit: entry.unit,
        showUnit: entry.showUnit,
        itemStyle: {
            color: entry.color,
        },
    }));

    return {
        title: buildPieTitleOption(context.config, specific),
        graphic: buildPieCenterTitleGraphic(context.config, specific, center),
        legendPatch: buildLegendPatch(context, specific, data),
        tooltipPatch: {
            trigger: 'item',
        },
        series: [
            {
                option: {
                    id: pieSeries?.id,
                    type: 'pie',
                    radius: buildRadius(specific),
                    center,
                    animationDurationUpdate: 0,
                    animationEasingUpdate: 'linear',
                    stillShowZeroSum: false,
                    data,
                    label: {
                        show: specific.showLabel,
                        position: specific.showSliceValue ? 'inside' : 'outside',
                        formatter: (params: any) => {
                            const name = params?.name || '';
                            if (!specific.showSliceValue) {
                                return name;
                            }
                            const value = typeof params?.value === 'number' ? params.value : 0;
                            return formatPieValue(value, context, params?.data?.unit, params?.data?.showUnit);
                        },
                    },
                    labelLine: {
                        show: specific.showLabel && !specific.showSliceValue,
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 4,
                    },
                },
                sourceSeriesIds: pieSeries ? [pieSeries.id, ...items.map((entry) => entry.id)] : [],
            },
        ],
    };
}

export function applyPieSeriesStyle(option: any, style: StyleMap): void {
    if (!option || Object.keys(style).length === 0) {
        return;
    }

    const echartPieSliceColor = parseEchartColor(style.echartPieSliceColor);
    const echartPieSliceBorderRadius = parseNumber(style.echartPieSliceBorderRadius);
    const borderColor = parseEchartColor(style.borderColor);
    const borderWidth = parsePx(style.borderWidth);
    const opacity = parseNumber(style.opacity);

    option.itemStyle = mergeObject(option.itemStyle, {
        color: echartPieSliceColor ?? option.itemStyle?.color,
        borderColor: borderColor ?? option.itemStyle?.borderColor,
        borderWidth,
        borderRadius: echartPieSliceBorderRadius ?? option.itemStyle?.borderRadius,
        opacity,
    });
    option.label = mergeObject(option.label, buildTextStyle(style));
}

export function applyPieSeriesItemStyle(item: any, style: StyleMap): any {
    if (!style || Object.keys(style).length === 0) {
        return item;
    }

    const echartPieSliceColor = parseEchartColor(style.echartPieSliceColor);
    const echartPieSliceBorderRadius = parseNumber(style.echartPieSliceBorderRadius);
    const echartPieLabelShow = parseBoolean(style.echartPieLabelShow);
    const echartPieLabelPosition = sanitizeEchartPieLabelPosition(style.echartPieLabelPosition);
    const echartPieLabelLineShow = parseBoolean(style.echartPieLabelLineShow);
    const echartPieLabelLineLength = parseNumber(style.echartPieLabelLineLength);
    const echartPieLabelLineLength2 = parseNumber(style.echartPieLabelLineLength2);
    const echartPieLabelLineSmooth = parseBoolean(style.echartPieLabelLineSmooth);
    const echartPieLabelLineColor = parseEchartColor(style.echartPieLabelLineColor);
    const echartPieLabelLineWidth = parseNumber(style.echartPieLabelLineWidth);
    const borderColor = parseEchartColor(style.borderColor);
    const borderWidth = parsePx(style.borderWidth);
    const opacity = parseNumber(style.opacity);

    return {
        ...item,
        itemStyle: mergeObject(item.itemStyle, {
            color: echartPieSliceColor ?? item.itemStyle?.color,
            borderColor: borderColor ?? item.itemStyle?.borderColor,
            borderWidth,
            borderRadius: echartPieSliceBorderRadius ?? item.itemStyle?.borderRadius,
            opacity,
        }),
        label: mergeObject(item.label, {
            ...buildTextStyle(style),
            show: echartPieLabelShow,
            position: echartPieLabelPosition,
        }),
        labelLine: mergeObject(item.labelLine, {
            show: echartPieLabelLineShow,
            length: echartPieLabelLineLength,
            length2: echartPieLabelLineLength2,
            smooth: echartPieLabelLineSmooth,
            lineStyle: mergeObject(item.labelLine?.lineStyle, {
                color: echartPieLabelLineColor,
                width: echartPieLabelLineWidth,
            }),
        }),
    };
}

registerChartSeriesOptionBuilder({
    type: 'pie',
    buildSeriesOptions: buildPieSeriesOptions,
    applySeriesStyle: applyPieSeriesStyle,
    applySeriesItemStyle: applyPieSeriesItemStyle,
});
