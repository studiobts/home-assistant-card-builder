import type {
    ChartAxisRangeConfig,
    ChartBaseAxisConfig,
    ChartRuntimeData,
    ChartTimeTickPreset,
    ChartTimeTickUnit,
    ChartXAxisConfig,
    ChartYAxisConfig,
} from '@/common/blocks/components/charts/chart-types';
import { formatConvertedValue } from '@/common/core/unit-conversion';

export interface ChartDataRange {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
}

export interface ChartValueRange {
    min?: number;
    max?: number;
}

export interface ChartAxisSeriesAssignment {
    orderedIds: string[];
    idSet: Set<string>;
}

export function computeRuntimeDataRange(runtimeData: ChartRuntimeData): ChartDataRange {
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    for (const series of runtimeData.series) {
        if (series.displayFrom < xMin) xMin = series.displayFrom;
        if (series.displayTo > xMax) xMax = series.displayTo;
        for (const point of series.points) {
            if (point.value < yMin) yMin = point.value;
            if (point.value > yMax) yMax = point.value;
        }
    }

    return {
        xMin: Number.isFinite(xMin) ? xMin : undefined,
        xMax: Number.isFinite(xMax) ? xMax : undefined,
        yMin: Number.isFinite(yMin) ? yMin : undefined,
        yMax: Number.isFinite(yMax) ? yMax : undefined,
    };
}

export function computeValueRangeForSeriesIds(runtimeData: ChartRuntimeData, seriesIds: Set<string>): ChartValueRange {
    let min = Infinity;
    let max = -Infinity;

    for (const series of runtimeData.series) {
        if (!seriesIds.has(series.id)) {
            continue;
        }
        for (const point of series.points) {
            if (point.value < min) min = point.value;
            if (point.value > max) max = point.value;
        }
    }

    return {
        min: Number.isFinite(min) ? min : undefined,
        max: Number.isFinite(max) ? max : undefined,
    };
}

export function computeTimeRangeForSeriesIds(runtimeData: ChartRuntimeData, assignment: ChartAxisSeriesAssignment): ChartValueRange {
    let min = Infinity;
    let max = -Infinity;
    const runtimeSeriesById = new Map(runtimeData.series.map((series) => [series.id, series]));

    for (const seriesId of assignment.orderedIds) {
        const series = runtimeSeriesById.get(seriesId);
        if (!series || !hasFiniteDisplayRange(series)) {
            continue;
        }
        if (series.displayFrom < min) min = series.displayFrom;
        if (series.displayTo > max) max = series.displayTo;
    }

    return {
        min: Number.isFinite(min) ? min : undefined,
        max: Number.isFinite(max) ? max : undefined,
    };
}

export function resolveAxisRange(range: ChartAxisRangeConfig, dataMin?: number, dataMax?: number): {
    min?: number;
    max?: number;
} {
    if (range.mode === 'fixed') {
        return {
            min: Number.isFinite(range.min) ? range.min : undefined,
            max: Number.isFinite(range.max) ? range.max : undefined,
        };
    }

    if (range.mode === 'data') {
        return {min: dataMin, max: dataMax};
    }

    if (range.mode === 'data-offset') {
        return {
            min: dataMin !== undefined ? dataMin - (range.minOffset || 0) : undefined,
            max: dataMax !== undefined ? dataMax + (range.maxOffset || 0) : undefined,
        };
    }

    return {};
}

function shouldHideRangeExtremes(axis: ChartBaseAxisConfig): boolean {
    return axis.hideMinMaxLabels && axis.range.mode === 'data';
}

function resolveAxisInterval(axis: ChartBaseAxisConfig): number | undefined {
    if (typeof axis.step !== 'number' || !Number.isFinite(axis.step)) {
        return undefined;
    }
    return axis.step > 0 ? axis.step : undefined;
}

function resolveAxisSplitNumber(axis: ChartBaseAxisConfig, interval: number | undefined): number | undefined {
    if (interval !== undefined || typeof axis.splitNumber !== 'number' || !Number.isFinite(axis.splitNumber)) {
        return undefined;
    }

    const value = Math.floor(axis.splitNumber);
    return value > 0 ? value : undefined;
}

function timeTickUnitFactor(unit: ChartTimeTickUnit): number {
    switch (unit) {
        case 'seconds':
            return 1000;
        case 'minutes':
            return 60 * 1000;
        case 'hours':
            return 60 * 60 * 1000;
        case 'days':
            return 24 * 60 * 60 * 1000;
    }
}

const TIME_TICK_PRESET_APPROX_INTERVALS: Record<ChartTimeTickPreset, number> = {
    '1-second': timeTickUnitFactor('seconds'),
    '2-seconds': (2 * timeTickUnitFactor('seconds')) + 1,
    '5-seconds': (5 * timeTickUnitFactor('seconds')) + 1,
    '10-seconds': (10 * timeTickUnitFactor('seconds')) + 1,
    '15-seconds': (15 * timeTickUnitFactor('seconds')) + 1,
    '20-seconds': (20 * timeTickUnitFactor('seconds')) + 1,
    '30-seconds': (30 * timeTickUnitFactor('seconds')) + 1,
    '1-minute': timeTickUnitFactor('minutes'),
    '2-minutes': (2 * timeTickUnitFactor('minutes')) + 1,
    '5-minutes': (5 * timeTickUnitFactor('minutes')) + 1,
    '10-minutes': (10 * timeTickUnitFactor('minutes')) + 1,
    '15-minutes': (15 * timeTickUnitFactor('minutes')) + 1,
    '20-minutes': (20 * timeTickUnitFactor('minutes')) + 1,
    '30-minutes': (30 * timeTickUnitFactor('minutes')) + 1,
    '1-hour': timeTickUnitFactor('hours'),
    '2-hours': (2 * timeTickUnitFactor('hours')) + 1,
    '4-hours': (4 * timeTickUnitFactor('hours')) + 1,
    '6-hours': (6 * timeTickUnitFactor('hours')) + 1,
    '12-hours': (12 * timeTickUnitFactor('hours')) + 1,
    '1-day': timeTickUnitFactor('days'),
    '2-days': (2 * timeTickUnitFactor('days')) + 1,
    '4-days': (4 * timeTickUnitFactor('days')) + 1,
    '7-days': Math.ceil(7.5 * timeTickUnitFactor('days')) + 1,
    '16-days': (16 * timeTickUnitFactor('days')) + 1,
};

function resolveXAxisTickInterval(axis: ChartXAxisConfig): number | undefined {
    if (axis.type !== 'time') {
        return resolveAxisInterval(axis);
    }

    if (axis.timeTick.mode !== 'preset') {
        return undefined;
    }

    return TIME_TICK_PRESET_APPROX_INTERVALS[axis.timeTick.preset];
}

function clampAxisDecimals(decimals: number): number {
    if (!Number.isFinite(decimals)) {
        return 2;
    }
    return Math.max(0, Math.min(6, Math.round(decimals)));
}

function resolveStepAlignment(axis: ChartBaseAxisConfig): number | undefined {
    if (typeof axis.stepAlignment !== 'number' || !Number.isFinite(axis.stepAlignment)) {
        return undefined;
    }
    return axis.stepAlignment;
}

function normalizeAxisValue(value: number): number {
    return Number(value.toFixed(12));
}

function alignDownToStep(value: number, anchor: number, interval: number): number {
    const units = Math.floor(((value - anchor) / interval) + Number.EPSILON);
    return normalizeAxisValue(anchor + (units * interval));
}

function alignUpToStep(value: number, anchor: number, interval: number): number {
    const units = Math.ceil(((value - anchor) / interval) - Number.EPSILON);
    return normalizeAxisValue(anchor + (units * interval));
}

function alignAxisRangeToStep(
    axis: ChartBaseAxisConfig,
    min: number | undefined,
    max: number | undefined,
    interval: number | undefined
): { min: number | undefined; max: number | undefined } {
    if (interval === undefined) {
        return {min, max};
    }

    if (axis.range.mode !== 'data' && axis.range.mode !== 'data-offset') {
        return {min, max};
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return {min, max};
    }

    const alignment = resolveStepAlignment(axis);
    if (alignment === undefined) {
        return {min, max};
    }

    const alignedMin = alignDownToStep(Number(min), alignment, interval);
    const alignedMax = alignUpToStep(Number(max), alignment, interval);
    return {min: alignedMin, max: alignedMax};
}

function formatAxisValue(value: number, decimals: number): string {
    return Number(value.toFixed(decimals)).toString();
}

function autoAxisOffset(axis: ChartYAxisConfig, sameSideOrder: number): number {
    if (axis.offsetMode === 'manual') {
        return Number.isFinite(axis.offsetPx) ? axis.offsetPx : 0;
    }
    return sameSideOrder * 42;
}

function buildValueFormatter(axis: ChartBaseAxisConfig): ((value: number) => string) | undefined {
    if (axis.type !== 'value' && axis.type !== 'log') {
        return undefined;
    }
    const decimals = clampAxisDecimals(axis.decimals);
    return (value: number) => formatAxisValue(value, decimals);
}

function buildYAxisValueFormatter(axis: ChartYAxisConfig, unit?: string, showUnit: boolean = false): ((value: number) => string) | undefined {
    if (axis.type !== 'value' && axis.type !== 'log') {
        return undefined;
    }
    const decimals = clampAxisDecimals(axis.decimals);
    return (value: number) => formatConvertedValue(value, decimals, unit, showUnit);
}

function parseFixedTime(value?: string): number | undefined {
    if (!value) {
        return undefined;
    }
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : undefined;
}

function hasFiniteDisplayRange(series: {displayFrom: number; displayTo: number}): boolean {
    return Number.isFinite(series.displayFrom) && Number.isFinite(series.displayTo);
}

function resolveSeriesTimeRange(series: {displayFrom: number; displayTo: number} | undefined): ChartValueRange {
    if (!series || !hasFiniteDisplayRange(series)) {
        return {};
    }
    return {
        min: series.displayFrom,
        max: series.displayTo,
    };
}

function getAssignedRuntimeSeries(runtimeData: ChartRuntimeData, assignment: ChartAxisSeriesAssignment): Map<string, {displayFrom: number; displayTo: number}> {
    const runtimeSeriesById = new Map(runtimeData.series.map((series) => [series.id, series]));
    const assignedRuntimeSeries = new Map<string, {displayFrom: number; displayTo: number}>();
    for (const seriesId of assignment.orderedIds) {
        const series = runtimeSeriesById.get(seriesId);
        if (series && hasFiniteDisplayRange(series)) {
            assignedRuntimeSeries.set(seriesId, series);
        }
    }
    return assignedRuntimeSeries;
}

function resolveSingleSeriesTimeRange(
    assignedRuntimeSeries: Map<string, {displayFrom: number; displayTo: number}>,
    assignment: ChartAxisSeriesAssignment,
    seriesId?: string
): ChartValueRange {
    if (!seriesId || !assignment.idSet.has(seriesId)) {
        return {};
    }
    const series = assignedRuntimeSeries.get(seriesId);
    if (!series) {
        return {};
    }
    return resolveSeriesTimeRange(series);
}

function resolveFirstAssignedSeriesTimeRange(
    assignedRuntimeSeries: Map<string, {displayFrom: number; displayTo: number}>,
    assignment: ChartAxisSeriesAssignment
): ChartValueRange {
    for (const seriesId of assignment.orderedIds) {
        const range = resolveSeriesTimeRange(assignedRuntimeSeries.get(seriesId));
        if (range.min !== undefined || range.max !== undefined) {
            return range;
        }
    }
    return {};
}

function resolveXAxisTimeRange(
    axis: ChartXAxisConfig,
    runtimeData: ChartRuntimeData,
    assignment: ChartAxisSeriesAssignment
): ChartValueRange {
    if (axis.timeRangeSource === 'fixed') {
        return {
            min: parseFixedTime(axis.fixedStart),
            max: parseFixedTime(axis.fixedEnd),
        };
    }

    const assignedRuntimeSeries = getAssignedRuntimeSeries(runtimeData, assignment);

    if (axis.timeRangeSource === 'selected-series') {
        const selectedRange = resolveSingleSeriesTimeRange(assignedRuntimeSeries, assignment, axis.timeRangeSeriesId);
        if (selectedRange.min !== undefined || selectedRange.max !== undefined) {
            return selectedRange;
        }
        return resolveFirstAssignedSeriesTimeRange(assignedRuntimeSeries, assignment);
    }

    if (axis.timeRangeSource === 'first-series') {
        return resolveFirstAssignedSeriesTimeRange(assignedRuntimeSeries, assignment);
    }

    return computeTimeRangeForSeriesIds(runtimeData, assignment);
}

export function buildXAxisOption(
    axis: ChartXAxisConfig,
    runtimeData: ChartRuntimeData,
    assignment: ChartAxisSeriesAssignment,
    dataMin?: number,
    dataMax?: number
): any {
    const isContinuousAxis = axis.type !== 'category';
    const isTimeAxis = axis.type === 'time';
    const resolved = isContinuousAxis
        ? (isTimeAxis ? resolveXAxisTimeRange(axis, runtimeData, assignment) : resolveAxisRange(axis.range, dataMin, dataMax))
        : {};
    const hideExtremes = shouldHideRangeExtremes(axis);
    const interval = isContinuousAxis ? resolveXAxisTickInterval(axis) : undefined;
    const alignedRange = isTimeAxis
        ? resolved
        : alignAxisRangeToStep(axis, resolved.min, resolved.max, interval);
    const formatter = buildValueFormatter(axis);

    return {
        type: axis.type,
        show: axis.enabled,
        position: axis.position,
        name: axis.label || undefined,
        nameLocation: 'middle',
        nameGap: 28,
        axisLabel: {
            show: axis.showLabels,
            hideOverlap: true,
            showMinLabel: !hideExtremes,
            showMaxLabel: !hideExtremes,
            formatter,
        },
        axisLine: {
            show: axis.showAxisLine,
        },
        axisTick: {
            show: axis.showTicks,
        },
        splitLine: {
            show: axis.showGridLines,
        },
        interval: isTimeAxis ? undefined : interval,
        minInterval: isTimeAxis ? interval : undefined,
        maxInterval: isTimeAxis ? interval : undefined,
        min: isContinuousAxis
            ? (alignedRange.min ?? (isTimeAxis ? undefined : dataMin))
            : undefined,
        max: isContinuousAxis
            ? (alignedRange.max ?? (isTimeAxis ? undefined : dataMax))
            : undefined,
    };
}

export function buildYAxisOption(
    axis: ChartYAxisConfig,
    dataMin?: number,
    dataMax?: number,
    sameSideOrder: number = 0,
    unit?: string,
    showUnit: boolean = false
): any {
    const isContinuousAxis = axis.type !== 'category';
    const resolved = isContinuousAxis ? resolveAxisRange(axis.range, dataMin, dataMax) : {};
    const hideExtremes = shouldHideRangeExtremes(axis);
    const interval = isContinuousAxis ? resolveAxisInterval(axis) : undefined;
    const splitNumber = isContinuousAxis ? resolveAxisSplitNumber(axis, interval) : undefined;
    const alignedRange = alignAxisRangeToStep(axis, resolved.min, resolved.max, interval);
    const formatter = buildYAxisValueFormatter(axis, unit, showUnit);

    return {
        type: axis.type,
        show: axis.enabled,
        name: axis.label || undefined,
        nameLocation: 'middle',
        nameGap: 36,
        position: axis.position,
        offset: autoAxisOffset(axis, sameSideOrder),
        axisLabel: {
            show: axis.showLabels,
            showMinLabel: !hideExtremes,
            showMaxLabel: !hideExtremes,
            formatter,
        },
        axisLine: {
            show: axis.showAxisLine,
        },
        axisTick: {
            show: axis.showTicks,
        },
        splitLine: {
            show: axis.showGridLines,
        },
        splitNumber,
        interval,
        min: isContinuousAxis ? alignedRange.min : undefined,
        max: isContinuousAxis ? alignedRange.max : undefined,
    };
}
