import {
    buildXAxisOption,
    buildYAxisOption,
    type ChartAxisSeriesAssignment,
    computeRuntimeDataRange,
    computeValueRangeForSeriesIds,
} from '@/common/blocks/components/charts/chart-axis-options';
import type {
    BaseChartConfig,
    ChartGridConfig,
    ChartLegendConfig,
    ChartRuntimeData,
    ResolvedChartSeries,
} from '@/common/blocks/components/charts/chart-types';
import { formatConvertedValue } from '@/common/core/unit-conversion';

export interface CartesianComponentsOptionsResult {
    gridOptions: any[];
    xAxisOptions: any[];
    yAxisOptions: any[];
    gridIndexById: Map<string, number>;
    xAxisIndexById: Map<string, number>;
    yAxisIndexById: Map<string, number>;
    defaultGridId?: string;
    defaultXAxisId?: string;
    defaultYAxisId?: string;
    leftEnabledAxisCount: number;
    rightEnabledAxisCount: number;
}

export function hasVisibleChartTitle(config: Pick<BaseChartConfig, 'title'>): boolean {
    return config.title.show && Boolean(config.title.text.trim());
}

export function buildChartTitleOption(config: Pick<BaseChartConfig, 'title'>): any {
    if (!hasVisibleChartTitle(config)) {
        return undefined;
    }

    return {
        text: config.title.text,
        left: 'center',
        top: config.title.position === 'center'
            ? 'middle'
            : config.title.position === 'top'
                ? 6
                : undefined,
        bottom: config.title.position === 'bottom' ? 8 : undefined,
        textStyle: {
            fontSize: 13,
            fontWeight: 600,
        },
    };
}

function legendPosition(legend: ChartLegendConfig): Record<string, string | number> {
    switch (legend.position) {
        case 'top':
            return {top: 8, left: 'center'};
        case 'bottom':
            return {bottom: 4, left: 'center'};
        case 'left':
            return {left: 8, top: 'middle'};
        case 'right':
            return {right: 8, top: 'middle'};
    }
}

export function buildChartLegendOption(config: Pick<BaseChartConfig, 'legend'>): any {
    return {
        show: config.legend.show,
        orient: config.legend.orientation,
        type: 'scroll',
        ...legendPosition(config.legend),
    };
}

function clampDecimals(decimals: number): number {
    if (!Number.isFinite(decimals)) {
        return 2;
    }
    return Math.max(0, Math.min(6, Math.round(decimals)));
}

function escapeHtml(value: unknown): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getTooltipParamValue(param: any): number | undefined {
    const value = param?.value;
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (Array.isArray(value) && typeof value[1] === 'number' && Number.isFinite(value[1])) {
        return value[1];
    }
    return undefined;
}

function buildTooltipFormatter(config: Pick<BaseChartConfig, 'tooltip'>, runtimeData?: ChartRuntimeData): ((params: any) => string) | undefined {
    if (!runtimeData) {
        return undefined;
    }

    const decimals = clampDecimals(config.tooltip.decimals);
    const unitBySeriesId = new Map(runtimeData.series.map((series) => [series.id, series.unit]));
    const unitBySeriesName = new Map(runtimeData.series.map((series) => [series.name, series.unit]));
    const showUnitBySeriesId = new Map(runtimeData.series.map((series) => [series.id, series.showUnit]));
    const showUnitBySeriesName = new Map(runtimeData.series.map((series) => [series.name, series.showUnit]));

    return (params: any) => {
        const items = Array.isArray(params) ? params : [params];
        const first = items[0];
        const title = first?.axisValueLabel ? `${escapeHtml(first.axisValueLabel)}<br/>` : '';
        const rows = items.map((item) => {
            const rawValue = getTooltipParamValue(item);
            const unit = item?.data?.unit || unitBySeriesId.get(item?.seriesId) || unitBySeriesName.get(item?.seriesName);
            const showUnit = item?.data?.showUnit
                ?? showUnitBySeriesId.get(item?.seriesId)
                ?? showUnitBySeriesName.get(item?.seriesName)
                ?? false;
            const value = rawValue === undefined
                ? ''
                : formatConvertedValue(rawValue, decimals, unit, showUnit);
            const marker = item?.marker || '';
            const labelSource = item?.data?.id
                ? (item?.name || item?.data?.name || item?.seriesName || '')
                : (item?.seriesName || item?.name || '');
            const label = escapeHtml(labelSource);
            return `${marker}${label}: ${escapeHtml(value)}`;
        });
        return `${title}${rows.join('<br/>')}`;
    };
}

export function buildChartTooltipOption(config: Pick<BaseChartConfig, 'tooltip'>, runtimeData?: ChartRuntimeData): any {
    if (config.tooltip.trigger === 'none') {
        return {
            show: false,
        };
    }

    const decimals = clampDecimals(config.tooltip.decimals);
    return {
        show: config.tooltip.show,
        trigger: config.tooltip.trigger,
        confine: true,
        formatter: buildTooltipFormatter(config, runtimeData),
        valueFormatter: (value: unknown) => {
            if (typeof value !== 'number') {
                return '';
            }
            return value.toFixed(decimals);
        },
    };
}

function buildAutoLayoutGrid(
    config: BaseChartConfig,
    grid: ChartGridConfig,
    leftAxisCount: number,
    rightAxisCount: number
): any {
    if (!grid.autoLayout) {
        return {
            left: grid.left,
            right: grid.right,
            top: grid.top,
            bottom: grid.bottom,
            containLabel: grid.containLabel,
        };
    }

    let top = 10;
    let right = 10;
    let bottom = 10;
    let left = 0;

    if (hasVisibleChartTitle(config)) {
        if (config.title.position === 'top') {
            top += 28;
        } else if (config.title.position === 'bottom') {
            bottom += 28;
        }
    }

    if (config.legend.show) {
        switch (config.legend.position) {
            case 'top':
                top += 30;
                break;
            case 'bottom':
                bottom += 30;
                break;
            case 'left':
                left += 96;
                break;
            case 'right':
                right += 96;
                break;
        }
    }

    if (leftAxisCount > 1) {
        left += (leftAxisCount - 1) * 36;
    }
    if (rightAxisCount > 1) {
        right += (rightAxisCount - 1) * 36;
    }

    return {
        left,
        right,
        top,
        bottom,
        containLabel: grid.containLabel,
    };
}

function resolveAxisUnitDisplay(
    config: BaseChartConfig,
    runtimeData: ChartRuntimeData,
    axisId: string,
    defaultYAxisId?: string
): { unit?: string; showUnit: boolean } {
    const runtimeSeriesById = new Map<string, ResolvedChartSeries>(runtimeData.series.map((series) => [series.id, series]));
    const sourceSeries = config.series.find((series) => (
        (series.yAxisId || defaultYAxisId) === axisId
        && (runtimeSeriesById.get(series.id)?.points.length || 0) > 0
    ));
    if (!sourceSeries) {
        return {showUnit: false};
    }

    const runtimeSeries = runtimeSeriesById.get(sourceSeries.id);
    return {
        unit: runtimeSeries?.unit,
        showUnit: Boolean(runtimeSeries?.showUnit),
    };
}

export function buildCartesianComponentsOptions(
    config: BaseChartConfig,
    runtimeData: ChartRuntimeData
): CartesianComponentsOptionsResult {
    const dataRange = computeRuntimeDataRange(runtimeData);
    const grids = config.components.grids;
    const xAxes = config.components.xAxes;
    const yAxes = config.components.yAxes;

    const gridIndexById = new Map<string, number>(grids.map((grid, index) => [grid.id, index]));
    const xAxisIndexById = new Map<string, number>(xAxes.map((axis, index) => [axis.id, index]));
    const yAxisIndexById = new Map<string, number>(yAxes.map((axis, index) => [axis.id, index]));

    const defaultGridId = grids[0]?.id;
    const defaultXAxisId = xAxes[0]?.id;
    const defaultYAxisId = yAxes[0]?.id;

    const yAxisSeriesIds = new Map<string, Set<string>>();
    const xAxisSeriesAssignments = new Map<string, ChartAxisSeriesAssignment>();
    for (const axis of xAxes) {
        xAxisSeriesAssignments.set(axis.id, {
            orderedIds: [],
            idSet: new Set<string>(),
        });
    }
    for (const axis of yAxes) {
        yAxisSeriesIds.set(axis.id, new Set<string>());
    }

    for (const series of config.series) {
        const xAxisId = series.xAxisId || defaultXAxisId;
        const yAxisId = series.yAxisId || defaultYAxisId;
        if (!xAxisId || !yAxisId) {
            continue;
        }
        const xSeriesAssignment = xAxisSeriesAssignments.get(xAxisId);
        if (xSeriesAssignment && !xSeriesAssignment.idSet.has(series.id)) {
            xSeriesAssignment.orderedIds.push(series.id);
            xSeriesAssignment.idSet.add(series.id);
        }
        const ySeriesIds = yAxisSeriesIds.get(yAxisId);
        if (ySeriesIds) {
            ySeriesIds.add(series.id);
        }
    }

    let leftEnabledAxisCount = 0;
    let rightEnabledAxisCount = 0;
    const yAxisOptions = yAxes.map((axis) => {
        const seriesIds = yAxisSeriesIds.get(axis.id) || new Set<string>();
        const range = computeValueRangeForSeriesIds(runtimeData, seriesIds);
        const unitDisplay = resolveAxisUnitDisplay(config, runtimeData, axis.id, defaultYAxisId);
        const sameSideOrder = axis.position === 'left' ? leftEnabledAxisCount : rightEnabledAxisCount;
        if (axis.enabled) {
            if (axis.position === 'left') {
                leftEnabledAxisCount += 1;
            } else {
                rightEnabledAxisCount += 1;
            }
        }

        const gridId = axis.gridId || defaultGridId;
        const gridIndex = gridId ? (gridIndexById.get(gridId) ?? 0) : 0;

        return {
            ...buildYAxisOption(axis, range.min, range.max, sameSideOrder, unitDisplay.unit, unitDisplay.showUnit),
            gridIndex,
        };
    });

    const xAxisOptions = xAxes.map((axis) => {
        const assignment = xAxisSeriesAssignments.get(axis.id) || {orderedIds: [], idSet: new Set<string>()};
        const gridId = axis.gridId || defaultGridId;
        const gridIndex = gridId ? (gridIndexById.get(gridId) ?? 0) : 0;
        return {
            ...buildXAxisOption(axis, runtimeData, assignment, dataRange.xMin, dataRange.xMax),
            gridIndex,
        };
    });

    const gridOptions = grids.map((grid) => (
        buildAutoLayoutGrid(config, grid, leftEnabledAxisCount, rightEnabledAxisCount)
    ));

    return {
        gridOptions,
        xAxisOptions,
        yAxisOptions,
        gridIndexById,
        xAxisIndexById,
        yAxisIndexById,
        defaultGridId,
        defaultXAxisId,
        defaultYAxisId,
        leftEnabledAxisCount,
        rightEnabledAxisCount,
    };
}

export function buildDataZoomOptions(
    config: BaseChartConfig,
    xAxisIndexById: Map<string, number>,
    yAxisIndexById: Map<string, number>
): any[] | undefined {
    const options = config.components.dataZoom
        .filter((entry) => entry.enabled)
        .map((entry) => ({
            type: entry.type,
            xAxisIndex: entry.xAxisIds
                .map((id) => xAxisIndexById.get(id))
                .filter((index): index is number => index !== undefined),
            yAxisIndex: entry.yAxisIds
                .map((id) => yAxisIndexById.get(id))
                .filter((index): index is number => index !== undefined),
            start: entry.start,
            end: entry.end,
            height: entry.type === 'slider' ? entry.height : undefined,
        }));

    return options.length > 0 ? options : undefined;
}

export function buildVisualMapOptions(
    config: BaseChartConfig,
    seriesIndexById: Map<string, number>
): any[] | undefined {
    const options = config.components.visualMaps
        .filter((entry) => entry.enabled)
        .map((entry) => ({
            type: entry.type,
            min: entry.min,
            max: entry.max,
            dimension: entry.dimension,
            seriesIndex: entry.seriesIds
                .map((id) => seriesIndexById.get(id))
                .filter((index): index is number => index !== undefined),
        }));

    return options.length > 0 ? options : undefined;
}

export function buildDatasetOptions(config: BaseChartConfig): any[] | undefined {
    const options = config.components.datasets
        .filter((entry) => Array.isArray(entry.source))
        .map((entry) => ({
            id: entry.id,
            source: entry.source,
        }));
    return options.length > 0 ? options : undefined;
}
