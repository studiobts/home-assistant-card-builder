import type { BlockEntityConfig } from '@/common/core/model';
import { createUnitDisplayConfig, type UnitDisplayConfig } from '@/common/core/unit-conversion';

export const CHART_COLOR_PALETTE = ['#3b82f6', '#22c55e', '#f97316'] as const;
export const CHART_TYPES = ['line-area', 'bars', 'pie-donut'] as const;
export const CHART_SERIES_TYPES = ['line', 'bar', 'pie'] as const;

export type ChartType = (typeof CHART_TYPES)[number];
export type ChartSeriesType = (typeof CHART_SERIES_TYPES)[number];
export type ChartCoordinateSystem = 'cartesian2d' | 'none';
export type ChartAxisType = 'value' | 'category' | 'time' | 'log';

export const CHART_DATA_MODES = ['statistics', 'history', 'live'] as const;
export type ChartDataMode = (typeof CHART_DATA_MODES)[number];

export const CHART_STATISTIC_TYPES = ['mean', 'min', 'max', 'sum', 'state', 'change'] as const;
export type ChartStatisticType = (typeof CHART_STATISTIC_TYPES)[number];

export const CHART_HISTORY_AGGREGATIONS = ['last', 'max', 'delta'] as const;
export type ChartHistoryAggregation = (typeof CHART_HISTORY_AGGREGATIONS)[number];

export const CHART_STATISTIC_PERIODS = ['5minute', 'hour', 'day', 'week', 'month'] as const;
export type ChartStatisticPeriod = (typeof CHART_STATISTIC_PERIODS)[number];
export const CHART_DOWNSAMPLING_STRATEGIES = ['min-max', 'every-nth', 'average', 'none'] as const;
export type ChartDownsamplingStrategy = (typeof CHART_DOWNSAMPLING_STRATEGIES)[number];
export const CHART_DOWNSAMPLING_SIZING_MODES = ['by-points', 'by-window'] as const;
export type ChartDownsamplingSizingMode = (typeof CHART_DOWNSAMPLING_SIZING_MODES)[number];
export type ChartDownsamplingWindowUnit = 'minutes' | 'hours' | 'days';

export const CHART_TIME_RANGE_MODES = ['rolling', 'today', 'yesterday', 'last-days', 'calendar-day', 'custom'] as const;
export type ChartTimeRangeMode = (typeof CHART_TIME_RANGE_MODES)[number];
export type ChartTimeRangeUnit = 'hours' | 'days' | 'weeks' | 'months';
export type ChartTimeDisplayMode = 'absolute' | 'aligned';

export type ChartValueSource = 'state' | 'attribute';
export type ChartTitlePosition = 'top' | 'bottom' | 'center';
export type ChartLegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type ChartLegendOrientation = 'horizontal' | 'vertical';

export interface ChartTimeRangeConfig {
    mode: ChartTimeRangeMode;
    amount: number;
    unit: ChartTimeRangeUnit;
    offsetAmount: number;
    offsetUnit: ChartTimeRangeUnit;
    date: string;
    start: string;
    end: string;
    displayMode: ChartTimeDisplayMode;
    showFullRange: boolean;
}

export interface ChartSeriesDataSourceConfig {
    mode: ChartDataMode;
    valueSource: ChartValueSource;
    attribute?: string;
    statisticsPeriod: ChartStatisticPeriod;
    statisticType: ChartStatisticType;
    historyAggregation: ChartHistoryAggregation;
    downsampling: ChartSeriesDownsamplingConfig;
    timeRange: ChartTimeRangeConfig;
}

export interface ChartSeriesDownsamplingConfig {
    strategy: ChartDownsamplingStrategy;
    sizing: ChartSeriesDownsamplingSizingConfig;
}

export type ChartSeriesDownsamplingSizingConfig =
    | {
        mode: 'by-points';
        maxPoints: number;
    }
    | {
        mode: 'by-window';
        window: {
            value: number;
            unit: ChartDownsamplingWindowUnit;
        };
    };

export interface ChartSeriesBindingConfig {
    entityConfig: BlockEntityConfig;
    dataSource: ChartSeriesDataSourceConfig;
}

export interface ChartSeriesStyleConfig {
    lineMode?: 'line' | 'area';
    smooth?: boolean;
    lineWidth?: number;
    showPoints?: boolean;
    areaOpacity?: number;
    connectNulls?: boolean;
    barWidth?: number;
    borderRadius?: number;
    innerRadius?: number;
}

export interface ChartSeriesItemStyleConfig {
}

export interface ChartSeriesItemConfig {
    id: string;
    name?: string;
    color?: string;
    valueUnit?: UnitDisplayConfig;
    binding: ChartSeriesBindingConfig;
    style: ChartSeriesItemStyleConfig;
}

export interface ChartSeriesConfig {
    id: string;
    name?: string;
    color?: string;
    type: ChartSeriesType;
    coordinateSystem: ChartCoordinateSystem;
    gridId?: string;
    xAxisId?: string;
    yAxisId?: string;
    stack?: string;
    valueUnit: UnitDisplayConfig;
    binding: ChartSeriesBindingConfig;
    style: ChartSeriesStyleConfig;
    items?: ChartSeriesItemConfig[];
}

export interface ChartTitleConfig {
    show: boolean;
    text: string;
    position: ChartTitlePosition;
}

export interface ChartLegendConfig {
    show: boolean;
    position: ChartLegendPosition;
    orientation: ChartLegendOrientation;
}

export interface ChartTooltipConfig {
    show: boolean;
    trigger: 'axis' | 'item' | 'none';
    decimals: number;
}

export type ChartAxisRangeMode = 'auto' | 'data' | 'data-offset' | 'fixed';
export type ChartXAxisTimeRangeSource = 'series-union' | 'first-series' | 'selected-series' | 'fixed';
export type ChartTimeTickUnit = 'seconds' | 'minutes' | 'hours' | 'days';
export const CHART_TIME_TICK_PRESETS = [
    '1-second',
    '2-seconds',
    '5-seconds',
    '10-seconds',
    '15-seconds',
    '20-seconds',
    '30-seconds',
    '1-minute',
    '2-minutes',
    '5-minutes',
    '10-minutes',
    '15-minutes',
    '20-minutes',
    '30-minutes',
    '1-hour',
    '2-hours',
    '4-hours',
    '6-hours',
    '12-hours',
    '1-day',
    '2-days',
    '4-days',
    '7-days',
    '16-days',
] as const;
export type ChartTimeTickPreset = (typeof CHART_TIME_TICK_PRESETS)[number];
export type ChartTimeTickMode = 'auto' | 'preset' | 'custom';

export interface ChartTimeTickCustomConfig {
    value?: number;
    unit: ChartTimeTickUnit;
}

export interface ChartTimeTickConfig {
    mode: ChartTimeTickMode;
    preset: ChartTimeTickPreset;
    custom: ChartTimeTickCustomConfig;
}

export interface ChartAxisRangeConfig {
    mode: ChartAxisRangeMode;
    minOffset: number;
    maxOffset: number;
    min?: number;
    max?: number;
}

export interface ChartBaseAxisConfig {
    id: string;
    type: ChartAxisType;
    gridId: string;
    enabled: boolean;
    label: string;
    showLabels: boolean;
    showGridLines: boolean;
    showAxisLine: boolean;
    showTicks: boolean;
    hideMinMaxLabels: boolean;
    step?: number;
    stepAlignment?: number;
    splitNumber?: number;
    decimals: number;
    range: ChartAxisRangeConfig;
}

export type ChartXAxisPosition = 'top' | 'bottom';
export interface ChartXAxisConfig extends ChartBaseAxisConfig {
    position: ChartXAxisPosition;
    timeRangeSource: ChartXAxisTimeRangeSource;
    timeRangeSeriesId?: string;
    fixedStart?: string;
    fixedEnd?: string;
    timeTick: ChartTimeTickConfig;
}

export type ChartYAxisPosition = 'left' | 'right';
export type ChartYAxisOffsetMode = 'auto' | 'manual';

export interface ChartYAxisConfig extends ChartBaseAxisConfig {
    position: ChartYAxisPosition;
    offsetMode: ChartYAxisOffsetMode;
    offsetPx: number;
    unit: UnitDisplayConfig;
}

export interface ChartGridConfig {
    id: string;
    enabled: boolean;
    containLabel: boolean;
    autoLayout: boolean;
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type ChartDataZoomType = 'inside' | 'slider';

export interface ChartDataZoomConfig {
    id: string;
    enabled: boolean;
    type: ChartDataZoomType;
    xAxisIds: string[];
    yAxisIds: string[];
    start?: number;
    end?: number;
    height?: number;
}

export type ChartVisualMapType = 'continuous' | 'piecewise';

export interface ChartVisualMapConfig {
    id: string;
    enabled: boolean;
    type: ChartVisualMapType;
    min: number;
    max: number;
    dimension: number;
    seriesIds: string[];
}

export interface ChartDatasetConfig {
    id: string;
    source: unknown[];
}

export interface ChartComponentConfig {
    grids: ChartGridConfig[];
    xAxes: ChartXAxisConfig[];
    yAxes: ChartYAxisConfig[];
    dataZoom: ChartDataZoomConfig[];
    visualMaps: ChartVisualMapConfig[];
    datasets: ChartDatasetConfig[];
}

export interface BaseChartConfig {
    chartType: ChartType;
    capabilities: ChartConfigCapabilities;
    series: ChartSeriesConfig[];
    title: ChartTitleConfig;
    legend: ChartLegendConfig;
    tooltip: ChartTooltipConfig;
    components: ChartComponentConfig;
}

export interface ChartConfigCapabilities {
    usesCartesianComponents: boolean;
}

export interface ChartConfigPolicy {
    chartType: ChartType;
    defaultSeriesType: ChartSeriesType;
    defaultCoordinateSystem: ChartCoordinateSystem;
    usesCartesianComponents: boolean;
    allowedDataModes: ChartDataMode[];
    fallbackDataMode: ChartDataMode;
}

export interface LineAreaSpecificConfig {
    mode: 'line' | 'area';
    smooth: boolean;
    lineWidth: number;
    showPoints: boolean;
    areaOpacity: number;
    connectNulls: boolean;
}

export interface LineAreaChartConfig extends BaseChartConfig {
    chartType: 'line-area';
    specific: LineAreaSpecificConfig;
}

export interface BarsSpecificConfig {
    mode: 'grouped' | 'stacked';
    barWidth: number;
    borderRadius: number;
}

export interface BarsChartConfig extends BaseChartConfig {
    chartType: 'bars';
    specific: BarsSpecificConfig;
}

export interface PieDonutSpecificConfig {
    mode: 'pie' | 'donut';
    outerRadius: number;
    innerRadius: number;
    titleCenterReference: 'block' | 'pie';
    centerMode: 'auto' | 'manual';
    centerXReference: 'left' | 'center' | 'right';
    centerXOffset: number;
    centerYReference: 'top' | 'middle' | 'bottom';
    centerYOffset: number;
    showLegendValue: boolean;
    showLabel: boolean;
    showSliceValue: boolean;
}

export interface PieDonutChartConfig extends BaseChartConfig {
    chartType: 'pie-donut';
    valueUnit: UnitDisplayConfig;
    specific: PieDonutSpecificConfig;
}

export type AnyChartConfig = LineAreaChartConfig | BarsChartConfig | PieDonutChartConfig;

export interface ChartSeriesPoint {
    timestamp: number;
    originalTimestamp?: number;
    value: number;
}

export interface ResolvedChartSeries {
    id: string;
    name: string;
    color: string;
    entityId: string;
    unit?: string;
    sourceUnit?: string;
    deviceClass?: string;
    showUnit?: boolean;
    from: number;
    to: number;
    displayFrom: number;
    displayTo: number;
    seriesConfig: ChartSeriesConfig;
    points: ChartSeriesPoint[];
    items?: ResolvedChartSeriesItem[];
}

export interface ResolvedChartSeriesItem {
    id: string;
    name: string;
    color: string;
    entityId: string;
    unit?: string;
    sourceUnit?: string;
    deviceClass?: string;
    showUnit?: boolean;
    from: number;
    to: number;
    displayFrom: number;
    displayTo: number;
    itemConfig: ChartSeriesItemConfig;
    points: ChartSeriesPoint[];
}

export interface ChartRuntimeData {
    from?: number;
    to?: number;
    series: ResolvedChartSeries[];
}

const DEFAULT_LINE_AREA_SPECIFIC: LineAreaSpecificConfig = {
    mode: 'line',
    smooth: true,
    lineWidth: 2,
    showPoints: false,
    areaOpacity: 0.25,
    connectNulls: false,
};

const DEFAULT_BARS_SPECIFIC: BarsSpecificConfig = {
    mode: 'grouped',
    barWidth: 18,
    borderRadius: 0,
};

const DEFAULT_PIE_DONUT_SPECIFIC: PieDonutSpecificConfig = {
    mode: 'pie',
    outerRadius: 85,
    innerRadius: 55,
    titleCenterReference: 'pie',
    centerMode: 'auto',
    centerXReference: 'center',
    centerXOffset: 0,
    centerYReference: 'middle',
    centerYOffset: 0,
    showLegendValue: false,
    showLabel: true,
    showSliceValue: false,
};

const DEFAULT_TITLE: ChartTitleConfig = {
    show: false,
    text: '',
    position: 'top',
};

const DEFAULT_LEGEND: ChartLegendConfig = {
    show: true,
    position: 'bottom',
    orientation: 'horizontal',
};

const DEFAULT_TOOLTIP: ChartTooltipConfig = {
    show: true,
    trigger: 'axis',
    decimals: 2,
};

export const DEFAULT_SERIES_TIME_RANGE: ChartTimeRangeConfig = {
    mode: 'rolling',
    amount: 24,
    unit: 'hours',
    offsetAmount: 0,
    offsetUnit: 'days',
    date: '',
    start: '',
    end: '',
    displayMode: 'absolute',
    showFullRange: false,
};

const DEFAULT_AXIS_RANGE: ChartAxisRangeConfig = {
    mode: 'auto',
    minOffset: 0,
    maxOffset: 0,
};

const DEFAULT_GRID: Omit<ChartGridConfig, 'id'> = {
    enabled: true,
    containLabel: true,
    autoLayout: true,
    top: 10,
    right: 10,
    bottom: 10,
    left: 0,
};

const DEFAULT_X_AXIS: Omit<ChartXAxisConfig, 'id' | 'gridId'> = {
    type: 'time',
    position: 'bottom',
    timeRangeSource: 'series-union',
    timeRangeSeriesId: '',
    fixedStart: '',
    fixedEnd: '',
    timeTick: {
        mode: 'auto',
        preset: '1-hour',
        custom: {
            unit: 'hours',
        },
    },
    enabled: true,
    label: '',
    showLabels: true,
    showGridLines: false,
    showAxisLine: true,
    showTicks: true,
    hideMinMaxLabels: false,
    step: undefined,
    stepAlignment: undefined,
    decimals: 0,
    range: {...DEFAULT_AXIS_RANGE},
};

const DEFAULT_Y_AXIS: Omit<ChartYAxisConfig, 'id' | 'gridId' | 'position'> = {
    type: 'value',
    enabled: true,
    label: '',
    showLabels: true,
    showGridLines: true,
    showAxisLine: true,
    showTicks: true,
    hideMinMaxLabels: false,
    step: undefined,
    stepAlignment: undefined,
    decimals: 2,
    range: {...DEFAULT_AXIS_RANGE},
    offsetMode: 'auto',
    offsetPx: 0,
    unit: createUnitDisplayConfig(),
};

const DEFAULT_SERIES_DATA_SOURCE: ChartSeriesDataSourceConfig = {
    mode: 'statistics',
    valueSource: 'state',
    attribute: '',
    statisticsPeriod: 'hour',
    statisticType: 'mean',
    historyAggregation: 'last',
    downsampling: {
        strategy: 'min-max',
        sizing: {
            mode: 'by-points',
            maxPoints: 240,
        },
    },
    timeRange: {...DEFAULT_SERIES_TIME_RANGE},
};

const LINE_AREA_CHART_POLICY: ChartConfigPolicy = {
    chartType: 'line-area',
    defaultSeriesType: 'line',
    defaultCoordinateSystem: 'cartesian2d',
    usesCartesianComponents: true,
    allowedDataModes: ['statistics', 'history'],
    fallbackDataMode: 'statistics',
};

const BARS_CHART_POLICY: ChartConfigPolicy = {
    chartType: 'bars',
    defaultSeriesType: 'bar',
    defaultCoordinateSystem: 'cartesian2d',
    usesCartesianComponents: true,
    allowedDataModes: ['statistics', 'history'],
    fallbackDataMode: 'statistics',
};

const PIE_DONUT_CHART_POLICY: ChartConfigPolicy = {
    chartType: 'pie-donut',
    defaultSeriesType: 'pie',
    defaultCoordinateSystem: 'none',
    usesCartesianComponents: false,
    allowedDataModes: ['live', 'statistics', 'history'],
    fallbackDataMode: 'live',
};

function createComponentId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeDataModeForPolicy(mode: ChartDataMode, policy: ChartConfigPolicy): ChartDataMode {
    return policy.allowedDataModes.includes(mode) ? mode : policy.fallbackDataMode;
}

function normalizeStatisticType(type: ChartStatisticType): ChartStatisticType {
    return type;
}

function normalizeDownsamplingSizingConfig(
    input: Partial<ChartSeriesDownsamplingSizingConfig> | undefined,
    fallbackMaxPoints: number
): ChartSeriesDownsamplingSizingConfig {
    if (input?.mode === 'by-window') {
        const rawWindow = input.window;
        const unit = rawWindow?.unit === 'minutes' || rawWindow?.unit === 'hours' || rawWindow?.unit === 'days'
            ? rawWindow.unit
            : 'hours';
        return {
            mode: 'by-window',
            window: {
                value: Number.isFinite(rawWindow?.value) ? Math.max(1, Math.round(rawWindow!.value!)) : 1,
                unit,
            },
        };
    }

    const legacyMaxPoints = Number.isFinite((input as {maxPoints?: number} | undefined)?.maxPoints)
        ? (input as {maxPoints: number}).maxPoints
        : undefined;
    return {
        mode: 'by-points',
        maxPoints: Math.max(1, Math.round(legacyMaxPoints ?? fallbackMaxPoints)),
    };
}

function normalizeDownsamplingConfig(
    input?: Partial<ChartSeriesDownsamplingConfig> & {maxPoints?: number},
    fallbackMaxPoints: number = DEFAULT_SERIES_DATA_SOURCE.downsampling.sizing.maxPoints
): ChartSeriesDownsamplingConfig {
    const strategy = input?.strategy && CHART_DOWNSAMPLING_STRATEGIES.includes(input.strategy)
        ? input.strategy
        : DEFAULT_SERIES_DATA_SOURCE.downsampling.strategy;
    return {
        strategy,
        sizing: normalizeDownsamplingSizingConfig(
            input?.sizing || (Number.isFinite(input?.maxPoints) ? {mode: 'by-points', maxPoints: input!.maxPoints!} : undefined),
            fallbackMaxPoints
        ),
    };
}

function normalizeSeriesDataSource(
    input: Partial<ChartSeriesDataSourceConfig> | undefined,
    base: ChartSeriesDataSourceConfig,
    policy: ChartConfigPolicy,
    fallbackMaxPoints?: number
): ChartSeriesDataSourceConfig {
    return {
        ...base,
        ...(input || {}),
        mode: normalizeDataModeForPolicy(input?.mode || base.mode, policy),
        statisticType: normalizeStatisticType(input?.statisticType || base.statisticType),
        historyAggregation: input?.historyAggregation || base.historyAggregation,
        downsampling: normalizeDownsamplingConfig(
            input?.downsampling,
            fallbackMaxPoints ?? (
                base.downsampling.sizing.mode === 'by-points'
                    ? base.downsampling.sizing.maxPoints
                    : DEFAULT_SERIES_DATA_SOURCE.downsampling.sizing.maxPoints
            )
        ),
        timeRange: {
            ...DEFAULT_SERIES_TIME_RANGE,
            ...(input?.timeRange || {}),
        },
    };
}

export function createChartGrid(overrides: Partial<ChartGridConfig> = {}): ChartGridConfig {
    return {
        ...DEFAULT_GRID,
        ...overrides,
        id: overrides.id || createComponentId('grid'),
    };
}

export function createChartXAxis(overrides: Partial<ChartXAxisConfig> = {}): ChartXAxisConfig {
    return {
        ...DEFAULT_X_AXIS,
        ...overrides,
        id: overrides.id || createComponentId('x-axis'),
        gridId: overrides.gridId || '',
        timeTick: {
            ...DEFAULT_X_AXIS.timeTick,
            ...(overrides.timeTick || {}),
            custom: {
                ...DEFAULT_X_AXIS.timeTick.custom,
                ...(overrides.timeTick?.custom || {}),
            },
        },
        range: {
            ...DEFAULT_AXIS_RANGE,
            ...(overrides.range || {}),
        },
    };
}

export function createChartYAxis(index: number = 0, overrides: Partial<ChartYAxisConfig> = {}): ChartYAxisConfig {
    const defaultPosition: ChartYAxisPosition = index % 2 === 0 ? 'left' : 'right';
    return {
        ...DEFAULT_Y_AXIS,
        ...overrides,
        id: overrides.id || createComponentId('y-axis'),
        gridId: overrides.gridId || '',
        position: overrides.position || defaultPosition,
        unit: createUnitDisplayConfig(overrides.unit),
        range: {
            ...DEFAULT_AXIS_RANGE,
            ...(overrides.range || {}),
        },
    };
}

export function createChartSeries(
    index: number = 0,
    bindings?: {gridId?: string; xAxisId?: string; yAxisId?: string},
    overrides: Partial<ChartSeriesConfig> = {}
): ChartSeriesConfig {
    const type: ChartSeriesType = overrides.type || 'line';
    const coordinateSystem = overrides.coordinateSystem || 'cartesian2d';
    const bindingOverrides: Partial<ChartSeriesBindingConfig> = overrides.binding || {};

    return {
        id: overrides.id || createComponentId('series'),
        name: '',
        color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
        type,
        coordinateSystem,
        gridId: overrides.gridId ?? bindings?.gridId,
        xAxisId: overrides.xAxisId ?? bindings?.xAxisId,
        yAxisId: overrides.yAxisId ?? bindings?.yAxisId,
        stack: overrides.stack,
        valueUnit: createUnitDisplayConfig(overrides.valueUnit),
        binding: {
            entityConfig: {
                mode: bindingOverrides.entityConfig?.mode ?? 'inherited',
                entityId: bindingOverrides.entityConfig?.entityId,
                slotId: bindingOverrides.entityConfig?.slotId,
            },
            dataSource: {
                ...DEFAULT_SERIES_DATA_SOURCE,
                ...(bindingOverrides.dataSource || {}),
                historyAggregation: bindingOverrides.dataSource?.historyAggregation || DEFAULT_SERIES_DATA_SOURCE.historyAggregation,
                downsampling: normalizeDownsamplingConfig(bindingOverrides.dataSource?.downsampling),
                timeRange: {
                    ...DEFAULT_SERIES_TIME_RANGE,
                    ...(bindingOverrides.dataSource?.timeRange || {}),
                },
            },
        },
        style: {
            ...(overrides.style || {}),
        },
        items: overrides.items,
    };
}

export function createChartSeriesItem(
    index: number = 0,
    overrides: Partial<ChartSeriesItemConfig> = {}
): ChartSeriesItemConfig {
    const bindingOverrides: Partial<ChartSeriesBindingConfig> = overrides.binding || {};

    return {
        id: overrides.id || createComponentId('item'),
        name: overrides.name || '',
        color: overrides.color || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
        valueUnit: createUnitDisplayConfig(overrides.valueUnit),
        binding: {
            entityConfig: {
                mode: bindingOverrides.entityConfig?.mode ?? 'inherited',
                entityId: bindingOverrides.entityConfig?.entityId,
                slotId: bindingOverrides.entityConfig?.slotId,
            },
            dataSource: {
                ...DEFAULT_SERIES_DATA_SOURCE,
                ...(bindingOverrides.dataSource || {}),
                historyAggregation: bindingOverrides.dataSource?.historyAggregation || DEFAULT_SERIES_DATA_SOURCE.historyAggregation,
                downsampling: normalizeDownsamplingConfig(bindingOverrides.dataSource?.downsampling),
                timeRange: {
                    ...DEFAULT_SERIES_TIME_RANGE,
                    ...(bindingOverrides.dataSource?.timeRange || {}),
                },
            },
        },
        style: {
            ...(overrides.style || {}),
        },
    };
}

function normalizeSeriesItem(
    entry: Partial<ChartSeriesItemConfig>,
    index: number,
    policy: ChartConfigPolicy,
    fallbackUnit?: UnitDisplayConfig,
    fallbackMaxPoints?: number
): ChartSeriesItemConfig {
    const baseItem = createChartSeriesItem(index, {
        valueUnit: fallbackUnit,
    });

    const normalized: ChartSeriesItemConfig = {
        ...baseItem,
        ...entry,
        valueUnit: createUnitDisplayConfig(entry.valueUnit ?? fallbackUnit ?? baseItem.valueUnit),
        binding: {
            ...baseItem.binding,
            ...(entry.binding || {}),
            entityConfig: {
                mode: entry.binding?.entityConfig?.mode ?? baseItem.binding.entityConfig.mode,
                entityId: entry.binding?.entityConfig?.entityId,
                slotId: entry.binding?.entityConfig?.slotId,
            },
            dataSource: normalizeSeriesDataSource(
                entry.binding?.dataSource,
                baseItem.binding.dataSource,
                policy,
                fallbackMaxPoints
            ),
        },
        style: {
            ...baseItem.style,
            ...(entry.style || {}),
        },
    };

    return normalized;
}

export function createDefaultComponentConfig(): ChartComponentConfig {
    const grid = createChartGrid();
    const xAxis = createChartXAxis({gridId: grid.id});
    const yAxis = createChartYAxis(0, {gridId: grid.id});
    return {
        grids: [grid],
        xAxes: [xAxis],
        yAxes: [yAxis],
        dataZoom: [],
        visualMaps: [],
        datasets: [],
    };
}

function createDefaultBaseConfigWithoutType(): Omit<BaseChartConfig, 'chartType' | 'capabilities' | 'series' | 'components'> {
    return {
        title: {...DEFAULT_TITLE},
        legend: {...DEFAULT_LEGEND},
        tooltip: {...DEFAULT_TOOLTIP},
    };
}

export function createDefaultBaseChartConfig(policy: ChartConfigPolicy): BaseChartConfig {
    const components = createDefaultComponentConfig();
    const firstGrid = components.grids[0];
    const firstXAxis = components.xAxes[0];
    const firstYAxis = components.yAxes[0];
    const base = createDefaultBaseConfigWithoutType();

    const series = createChartSeries(
        0,
        {
            gridId: firstGrid.id,
            xAxisId: firstXAxis.id,
            yAxisId: firstYAxis.id,
        },
        {
            type: policy.defaultSeriesType,
            coordinateSystem: policy.defaultCoordinateSystem,
        }
    );

    if (!policy.usesCartesianComponents) {
        series.gridId = undefined;
        series.xAxisId = undefined;
        series.yAxisId = undefined;
    }

    return {
        ...base,
        chartType: policy.chartType,
        capabilities: {
            usesCartesianComponents: policy.usesCartesianComponents,
        },
        series: [series],
        components,
    };
}

function normalizeComponents(
    candidateComponents: Partial<ChartComponentConfig> | undefined,
    defaults: ChartComponentConfig
): ChartComponentConfig {
    const grids = Array.isArray(candidateComponents?.grids)
        ? candidateComponents.grids
            .filter((grid) => Boolean(grid && typeof grid === 'object'))
            .map((grid) => createChartGrid(grid as Partial<ChartGridConfig>))
        : defaults.grids;
    const normalizedGrids = grids.length > 0 ? grids : defaults.grids;
    const defaultGridId = normalizedGrids[0].id;
    const gridIds = new Set(normalizedGrids.map((grid) => grid.id));

    const xAxes = Array.isArray(candidateComponents?.xAxes)
        ? candidateComponents.xAxes
            .filter((axis) => Boolean(axis && typeof axis === 'object'))
            .map((axis) => createChartXAxis({
                ...(axis as Partial<ChartXAxisConfig>),
                gridId: axis?.gridId && gridIds.has(axis.gridId) ? axis.gridId : defaultGridId,
            }))
        : defaults.xAxes;
    const normalizedXAxes = xAxes.length > 0
        ? xAxes
        : [createChartXAxis({...defaults.xAxes[0], gridId: defaultGridId})];

    const yAxes = Array.isArray(candidateComponents?.yAxes)
        ? candidateComponents.yAxes
            .filter((axis) => Boolean(axis && typeof axis === 'object'))
            .map((axis, index) => createChartYAxis(index, {
                ...(axis as Partial<ChartYAxisConfig>),
                gridId: axis?.gridId && gridIds.has(axis.gridId) ? axis.gridId : defaultGridId,
            }))
        : defaults.yAxes;
    const normalizedYAxes = yAxes.length > 0
        ? yAxes
        : [createChartYAxis(0, {...defaults.yAxes[0], gridId: defaultGridId})];

    const dataZoom = Array.isArray(candidateComponents?.dataZoom)
        ? candidateComponents.dataZoom
            .filter((entry) => Boolean(entry && typeof entry === 'object'))
            .map((entry) => ({
                id: entry.id || createComponentId('data-zoom'),
                enabled: entry.enabled ?? false,
                type: entry.type || 'inside',
                xAxisIds: Array.isArray(entry.xAxisIds) ? [...entry.xAxisIds] : [],
                yAxisIds: Array.isArray(entry.yAxisIds) ? [...entry.yAxisIds] : [],
                start: entry.start,
                end: entry.end,
                height: entry.height,
            }))
        : defaults.dataZoom;

    const visualMaps = Array.isArray(candidateComponents?.visualMaps)
        ? candidateComponents.visualMaps
            .filter((entry) => Boolean(entry && typeof entry === 'object'))
            .map((entry) => ({
                id: entry.id || createComponentId('visual-map'),
                enabled: entry.enabled ?? false,
                type: entry.type || 'continuous',
                min: entry.min ?? 0,
                max: entry.max ?? 100,
                dimension: entry.dimension ?? 1,
                seriesIds: Array.isArray(entry.seriesIds) ? [...entry.seriesIds] : [],
            }))
        : defaults.visualMaps;

    const datasets = Array.isArray(candidateComponents?.datasets)
        ? candidateComponents.datasets
            .filter((entry) => Boolean(entry && typeof entry === 'object'))
            .map((entry) => ({
                id: entry.id || createComponentId('dataset'),
                source: Array.isArray(entry.source) ? [...entry.source] : [],
            }))
        : defaults.datasets;

    return {
        grids: normalizedGrids,
        xAxes: normalizedXAxes,
        yAxes: normalizedYAxes,
        dataZoom,
        visualMaps,
        datasets,
    };
}

function normalizeSeries(
    candidateSeries: unknown,
    components: ChartComponentConfig,
    defaults: ChartSeriesConfig[],
    policy: ChartConfigPolicy,
    legacyMaxPoints?: number
): ChartSeriesConfig[] {
    if (!Array.isArray(candidateSeries)) {
        return defaults;
    }

    const defaultGridId = components.grids[0]?.id;
    const defaultXAxisId = components.xAxes[0]?.id;
    const defaultYAxisId = components.yAxes[0]?.id;
    const gridIds = new Set(components.grids.map((entry) => entry.id));
    const xAxisIds = new Set(components.xAxes.map((entry) => entry.id));
    const yAxisIds = new Set(components.yAxes.map((entry) => entry.id));

    return candidateSeries
        .filter((entry): entry is Partial<ChartSeriesConfig> => Boolean(entry && typeof entry === 'object'))
        .map((entry, index) => {
            const candidateType = entry.type || policy.defaultSeriesType;
            const coordinateSystem = entry.coordinateSystem || policy.defaultCoordinateSystem;

            const baseSeries = createChartSeries(
                index,
                {
                    gridId: defaultGridId,
                    xAxisId: defaultXAxisId,
                    yAxisId: defaultYAxisId,
                },
                {
                    type: candidateType,
                    coordinateSystem,
                }
            );

            const normalized: ChartSeriesConfig = {
                ...baseSeries,
                ...entry,
                type: candidateType,
                coordinateSystem,
                valueUnit: createUnitDisplayConfig(entry.valueUnit ?? baseSeries.valueUnit),
                binding: {
                    ...baseSeries.binding,
                    ...(entry.binding || {}),
                    entityConfig: {
                        mode: entry.binding?.entityConfig?.mode ?? baseSeries.binding.entityConfig.mode,
                        entityId: entry.binding?.entityConfig?.entityId,
                        slotId: entry.binding?.entityConfig?.slotId,
                    },
                    dataSource: normalizeSeriesDataSource(
                        entry.binding?.dataSource,
                        baseSeries.binding.dataSource,
                        policy,
                        legacyMaxPoints
                    ),
                },
                style: {
                    ...baseSeries.style,
                    ...(entry.style || {}),
                },
                items: Array.isArray(entry.items)
                    ? entry.items
                        .filter((item) => Boolean(item && typeof item === 'object'))
                        .map((item, itemIndex) => normalizeSeriesItem(
                            item as Partial<ChartSeriesItemConfig>,
                            itemIndex,
                            policy,
                            entry.valueUnit ?? baseSeries.valueUnit,
                            legacyMaxPoints
                        ))
                    : undefined,
            };

            if (policy.usesCartesianComponents) {
                normalized.gridId = normalized.gridId && gridIds.has(normalized.gridId)
                    ? normalized.gridId
                    : defaultGridId;
                normalized.xAxisId = normalized.xAxisId && xAxisIds.has(normalized.xAxisId)
                    ? normalized.xAxisId
                    : defaultXAxisId;
                normalized.yAxisId = normalized.yAxisId && yAxisIds.has(normalized.yAxisId)
                    ? normalized.yAxisId
                    : defaultYAxisId;
            } else {
                normalized.gridId = undefined;
                normalized.xAxisId = undefined;
                normalized.yAxisId = undefined;
            }

            return normalized;
        });
}

function applySeriesLimit(series: ChartSeriesConfig[], maxSeries?: number): ChartSeriesConfig[] {
    if (!Number.isFinite(maxSeries)) {
        return series;
    }
    return series.slice(0, maxSeries);
}

function applySeriesItemLimit(items: ChartSeriesItemConfig[], maxSeries?: number): ChartSeriesItemConfig[] {
    if (!Number.isFinite(maxSeries)) {
        return items;
    }
    return items.slice(0, maxSeries);
}

function getStableConfigId(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
}

function resolvePieParentSeriesId(
    parentCandidate: Partial<ChartSeriesConfig> | undefined,
    parentSource: Partial<ChartSeriesConfig> | undefined,
    items: ChartSeriesItemConfig[],
    defaultSourceSeries: ChartSeriesConfig
): string {
    const existingParentId = getStableConfigId(parentCandidate?.id);
    if (existingParentId) {
        return existingParentId;
    }

    const stableSourceId = getStableConfigId(parentSource?.id)
        || items.map((item) => getStableConfigId(item.id)).find(Boolean)
        || getStableConfigId(defaultSourceSeries.id);

    return stableSourceId ? `pie-series-${stableSourceId}` : 'pie-series-default';
}

export function normalizeBaseChartConfig(raw: unknown, policy: ChartConfigPolicy, maxSeries?: number): BaseChartConfig {
    const defaults = createDefaultBaseChartConfig(policy);
    if (!raw || typeof raw !== 'object') {
        const defaultSeries = applySeriesLimit(defaults.series, maxSeries);
        return defaultSeries.length === defaults.series.length
            ? defaults
            : {
                ...defaults,
                series: defaultSeries,
            };
    }

    const candidate = raw as Partial<BaseChartConfig>;
    const legacyMaxPoints = typeof (raw as Record<string, unknown>).maxPoints === 'number'
        ? (raw as Record<string, number>).maxPoints
        : undefined;
    const components = normalizeComponents(candidate.components, defaults.components);
    const series = applySeriesLimit(
        normalizeSeries(candidate.series, components, defaults.series, policy, legacyMaxPoints),
        maxSeries
    );

    return {
        ...defaults,
        chartType: policy.chartType,
        capabilities: {
            usesCartesianComponents: policy.usesCartesianComponents,
        },
        series,
        title: {...defaults.title, ...(candidate.title || {})},
        legend: {...defaults.legend, ...(candidate.legend || {})},
        tooltip: {...defaults.tooltip, ...(candidate.tooltip || {})},
        components,
    };
}

export function createDefaultLineAreaChartConfig(): LineAreaChartConfig {
    const base = createDefaultBaseChartConfig(LINE_AREA_CHART_POLICY);
    return {
        ...base,
        chartType: 'line-area',
        series: base.series.map((entry) => ({
            ...entry,
            type: 'line',
            coordinateSystem: 'cartesian2d',
            style: {
                ...entry.style,
                lineMode: DEFAULT_LINE_AREA_SPECIFIC.mode,
                smooth: DEFAULT_LINE_AREA_SPECIFIC.smooth,
                lineWidth: DEFAULT_LINE_AREA_SPECIFIC.lineWidth,
                showPoints: DEFAULT_LINE_AREA_SPECIFIC.showPoints,
                areaOpacity: DEFAULT_LINE_AREA_SPECIFIC.areaOpacity,
                connectNulls: DEFAULT_LINE_AREA_SPECIFIC.connectNulls,
            },
        })),
        specific: {...DEFAULT_LINE_AREA_SPECIFIC},
    };
}

export function createDefaultBarsChartConfig(): BarsChartConfig {
    const base = createDefaultBaseChartConfig(BARS_CHART_POLICY);
    return {
        ...base,
        chartType: 'bars',
        series: base.series.map((entry) => ({
            ...entry,
            type: 'bar',
            coordinateSystem: 'cartesian2d',
            style: {
                ...entry.style,
                barWidth: DEFAULT_BARS_SPECIFIC.barWidth,
                borderRadius: DEFAULT_BARS_SPECIFIC.borderRadius,
            },
            stack: DEFAULT_BARS_SPECIFIC.mode === 'stacked' ? 'total' : undefined,
        })),
        specific: {...DEFAULT_BARS_SPECIFIC},
    };
}

export function createDefaultPieDonutChartConfig(): PieDonutChartConfig {
    const base = createDefaultBaseChartConfig(PIE_DONUT_CHART_POLICY);
    const sourceSeries = base.series[0];
    const valueUnit = createUnitDisplayConfig();
    const pieSeries = {
        ...sourceSeries,
        id: createComponentId('pie-series'),
        type: 'pie' as const,
        coordinateSystem: 'none' as const,
        gridId: undefined,
        xAxisId: undefined,
        yAxisId: undefined,
        valueUnit,
        // Item-based series keep a parent binding for shape consistency only.
        // The data-bearing bindings live on items.
        binding: {
            ...sourceSeries.binding,
            dataSource: {
                ...sourceSeries.binding.dataSource,
                mode: 'live' as const,
                statisticType: 'sum' as const,
                historyAggregation: 'last' as const,
            },
        },
        style: {
            ...sourceSeries.style,
            innerRadius: DEFAULT_PIE_DONUT_SPECIFIC.innerRadius,
        },
        items: [
            createChartSeriesItem(0, {
                id: sourceSeries.id,
                name: sourceSeries.name,
                color: sourceSeries.color,
                valueUnit,
                binding: {
                    ...sourceSeries.binding,
                    dataSource: {
                        ...sourceSeries.binding.dataSource,
                        mode: 'live',
                        statisticType: 'sum',
                        historyAggregation: 'last',
                    },
                },
            }),
        ],
    };
    return {
        ...base,
        chartType: 'pie-donut',
        valueUnit,
        series: [pieSeries],
        specific: {...DEFAULT_PIE_DONUT_SPECIFIC},
    };
}

export function cloneChartConfig<T extends AnyChartConfig>(config: T): T {
    return JSON.parse(JSON.stringify(config)) as T;
}

export function cloneLineAreaChartConfig(config: LineAreaChartConfig): LineAreaChartConfig {
    return cloneChartConfig(config);
}

export function cloneBarsChartConfig(config: BarsChartConfig): BarsChartConfig {
    return cloneChartConfig(config);
}

export function clonePieDonutChartConfig(config: PieDonutChartConfig): PieDonutChartConfig {
    return cloneChartConfig(config);
}

export function normalizeLineAreaChartConfig(raw: unknown, maxSeries?: number): LineAreaChartConfig {
    const base = normalizeBaseChartConfig(raw, LINE_AREA_CHART_POLICY, maxSeries);
    const candidate = raw && typeof raw === 'object' ? (raw as Partial<LineAreaChartConfig>) : undefined;
    const specific = {
        ...DEFAULT_LINE_AREA_SPECIFIC,
        ...(candidate?.specific || {}),
    };

    const yAxesById = new Map(base.components.yAxes.map((axis) => [axis.id, axis]));
    const defaultYAxis = base.components.yAxes[0];
    const series = base.series.map((entry) => {
        const axis = (entry.yAxisId ? yAxesById.get(entry.yAxisId) : undefined) || defaultYAxis;
        return {
            ...entry,
            type: 'line' as const,
            coordinateSystem: 'cartesian2d' as const,
            valueUnit: createUnitDisplayConfig(axis?.unit),
            style: {
                ...entry.style,
                lineMode: specific.mode,
                smooth: specific.smooth,
                lineWidth: specific.lineWidth,
                showPoints: specific.showPoints,
                areaOpacity: specific.areaOpacity,
                connectNulls: specific.connectNulls,
            },
        };
    });

    return {
        ...base,
        chartType: 'line-area',
        series,
        specific,
    };
}

export function normalizeBarsChartConfig(raw: unknown, maxSeries?: number): BarsChartConfig {
    const base = normalizeBaseChartConfig(raw, BARS_CHART_POLICY, maxSeries);
    const candidate = raw && typeof raw === 'object' ? (raw as Partial<BarsChartConfig>) : undefined;
    const specific = {
        ...DEFAULT_BARS_SPECIFIC,
        ...(candidate?.specific || {}),
    };

    const yAxesById = new Map(base.components.yAxes.map((axis) => [axis.id, axis]));
    const defaultYAxis = base.components.yAxes[0];
    const series = base.series.map((entry) => {
        const axis = (entry.yAxisId ? yAxesById.get(entry.yAxisId) : undefined) || defaultYAxis;
        return {
            ...entry,
            type: 'bar' as const,
            coordinateSystem: 'cartesian2d' as const,
            stack: specific.mode === 'stacked' ? 'total' : undefined,
            valueUnit: createUnitDisplayConfig(axis?.unit),
            style: {
                ...entry.style,
                barWidth: specific.barWidth,
                borderRadius: specific.borderRadius,
            },
        };
    });

    return {
        ...base,
        chartType: 'bars',
        series,
        specific,
    };
}

export function normalizePieDonutChartConfig(raw: unknown, maxSeries?: number): PieDonutChartConfig {
    const base = normalizeBaseChartConfig(raw, PIE_DONUT_CHART_POLICY, maxSeries);
    const candidate = raw && typeof raw === 'object' ? (raw as Partial<PieDonutChartConfig>) : undefined;
    const legacyMaxPoints = raw && typeof raw === 'object' && typeof (raw as Record<string, unknown>).maxPoints === 'number'
        ? (raw as Record<string, number>).maxPoints
        : undefined;
    const valueUnit = createUnitDisplayConfig(candidate?.valueUnit);
    const candidateSeries = Array.isArray(candidate?.series)
        ? candidate.series
            .filter((entry) => Boolean(entry && typeof entry === 'object'))
            .map((entry) => entry as Partial<ChartSeriesConfig>)
        : [];
    const defaultSourceSeries = base.series[0] || createDefaultBaseChartConfig(PIE_DONUT_CHART_POLICY).series[0];
    const sourceItems = base.series.length === 1 && Array.isArray(base.series[0].items) && base.series[0].items.length > 0
        ? base.series[0].items
        : base.series.map((entry, index) => createChartSeriesItem(index, {
            id: entry.id,
            name: entry.name,
            color: entry.color,
            valueUnit: entry.valueUnit,
            binding: entry.binding,
        }));
    const limitedItems = applySeriesItemLimit(sourceItems, maxSeries);
    const items = limitedItems.map((item, index) => {
        const source = item.binding.dataSource;
        return normalizeSeriesItem({
            ...item,
            valueUnit,
            binding: {
                ...item.binding,
                dataSource: {
                    ...source,
                    mode: source?.mode ?? 'live',
                    statisticType: normalizeStatisticType(source?.statisticType || 'sum'),
                    historyAggregation: source?.historyAggregation || 'last',
                },
            },
        }, index, PIE_DONUT_CHART_POLICY, valueUnit, legacyMaxPoints);
    });

    const parentCandidate = candidateSeries.find((entry) => Array.isArray(entry.items));
    const parentSource = parentCandidate || candidateSeries[0];
    const parentSeriesId = resolvePieParentSeriesId(parentCandidate, parentSource, items, defaultSourceSeries);
    const parentSeries: ChartSeriesConfig = {
        ...createChartSeries(0, undefined, {
            id: parentSeriesId,
            type: 'pie',
            coordinateSystem: 'none',
            valueUnit,
            binding: defaultSourceSeries.binding,
            style: {
                innerRadius: DEFAULT_PIE_DONUT_SPECIFIC.innerRadius,
            },
        }),
        ...parentCandidate,
        id: parentSeriesId,
        type: 'pie',
        coordinateSystem: 'none',
        gridId: undefined,
        xAxisId: undefined,
        yAxisId: undefined,
        valueUnit,
        binding: {
            ...defaultSourceSeries.binding,
            ...(parentSource?.binding || {}),
            dataSource: normalizeSeriesDataSource(
                {
                    ...(parentSource?.binding?.dataSource || {}),
                    mode: parentSource?.binding?.dataSource?.mode ?? 'live',
                    statisticType: parentSource?.binding?.dataSource?.statisticType || 'sum',
                    historyAggregation: parentSource?.binding?.dataSource?.historyAggregation || 'last',
                },
                defaultSourceSeries.binding.dataSource,
                PIE_DONUT_CHART_POLICY,
                legacyMaxPoints
            ),
        },
        style: {
            ...defaultSourceSeries.style,
            ...(parentSource?.style || {}),
            innerRadius: DEFAULT_PIE_DONUT_SPECIFIC.innerRadius,
        },
        items,
    };

    return {
        ...base,
        chartType: 'pie-donut',
        valueUnit,
        series: [parentSeries],
        specific: {
            ...DEFAULT_PIE_DONUT_SPECIFIC,
            ...(candidate?.specific || {}),
        },
    };
}
