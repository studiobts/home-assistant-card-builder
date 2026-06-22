import type { BlockData, BlockEntityConfig, DocumentModel } from '@/common/core/model';
import type {
    ChartSeriesConfig,
    ChartSeriesItemConfig,
    ChartSeriesDataSourceConfig,
    ChartSeriesDownsamplingConfig,
    ChartRuntimeData,
    ChartSeriesPoint,
    ChartTimeRangeConfig,
    ChartTimeRangeUnit,
    ResolvedChartSeries,
    ResolvedChartSeriesItem,
} from '@/common/blocks/components/charts/chart-types';
import type { HomeAssistant } from 'custom-card-helpers';
import type { HassEntity } from 'home-assistant-js-websocket';

interface EntityHistoryState {
    s: string;
    a?: Record<string, unknown>;
    lu: number;
}

type HistoryStates = Record<string, EntityHistoryState[]>;

interface StatisticValue {
    start: number | string;
    end?: number | string;
    mean?: number | null;
    min?: number | null;
    max?: number | null;
    sum?: number | null;
    state?: number | null;
    change?: number | null;
}

type StatisticsResponse = Record<string, StatisticValue[]>;

interface ResolvedSeriesTimeRange {
    queryFrom: Date;
    queryTo: Date;
    displayFrom: Date;
    displayTo: Date;
}

function toFiniteNumber(value: unknown): number | null {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const numeric = parseFloat(value);
        return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
}

function resolveEntityId(documentModel: DocumentModel, block: BlockData, entityConfig: BlockEntityConfig): string | undefined {
    if (entityConfig.mode === 'fixed') {
        return entityConfig.entityId;
    }
    if (entityConfig.mode === 'slot') {
        return entityConfig.slotId ? documentModel.resolveSlotEntity(entityConfig.slotId) : undefined;
    }
    return documentModel.resolveEntityForBlock(block.id).entityId;
}

function resolveEntityLabel(
    hass: HomeAssistant,
    entityId: string,
    config: { name?: string },
    index: number
): string {
    const configuredLabel = config.name?.trim();
    if (configuredLabel) {
        return configuredLabel;
    }
    const stateObj = hass.states[entityId];
    const friendlyName = stateObj?.attributes?.friendly_name;
    if (typeof friendlyName === 'string' && friendlyName.trim()) {
        return friendlyName;
    }
    return `Series ${index + 1}`;
}

function extractValueFromState(stateObj: HassEntity, source: ChartSeriesDataSourceConfig): number | null {
    if (source.valueSource === 'attribute') {
        return toFiniteNumber(stateObj.attributes?.[source.attribute || '']);
    }
    return toFiniteNumber(stateObj.state);
}

function filterSortedPoints(points: ChartSeriesPoint[], from: number, to: number): ChartSeriesPoint[] {
    return points
        .filter((point) => point.timestamp >= from && point.timestamp <= to)
        .sort((a, b) => a.timestamp - b.timestamp);
}

function windowUnitMs(unit: 'minutes' | 'hours' | 'days'): number {
    if (unit === 'minutes') {
        return 60 * 1000;
    }
    if (unit === 'hours') {
        return 60 * 60 * 1000;
    }
    return 24 * 60 * 60 * 1000;
}

function bucketPointsByCount(points: ChartSeriesPoint[], bucketCount: number): ChartSeriesPoint[][] {
    if (points.length === 0) {
        return [];
    }
    const safeBucketCount = Math.max(1, Math.min(bucketCount, points.length));
    const bucketSize = Math.ceil(points.length / safeBucketCount);
    const buckets: ChartSeriesPoint[][] = [];
    for (let index = 0; index < points.length; index += bucketSize) {
        buckets.push(points.slice(index, index + bucketSize));
    }
    return buckets;
}

function bucketPointsByWindow(points: ChartSeriesPoint[], from: number, to: number, windowMs: number): ChartSeriesPoint[][] {
    if (points.length === 0) {
        return [];
    }
    const safeWindowMs = Math.max(1, windowMs);
    const buckets = new Map<number, ChartSeriesPoint[]>();
    for (const point of points) {
        const bucketIndex = Math.floor((point.timestamp - from) / safeWindowMs);
        const bucket = buckets.get(bucketIndex) || [];
        bucket.push(point);
        buckets.set(bucketIndex, bucket);
    }
    const bucketCount = Math.max(1, Math.ceil((to - from) / safeWindowMs));
    return Array.from({length: bucketCount}, (_, index) => buckets.get(index) || []).filter((bucket) => bucket.length > 0);
}

function reduceBucketMinMax(bucket: ChartSeriesPoint[]): ChartSeriesPoint[] {
    if (bucket.length === 0) {
        return [];
    }
    let min = bucket[0];
    let max = bucket[0];
    for (const point of bucket) {
        if (point.value < min.value) {
            min = point;
        }
        if (point.value > max.value) {
            max = point;
        }
    }
    if (min.timestamp === max.timestamp) {
        return [min];
    }
    return min.timestamp < max.timestamp ? [min, max] : [max, min];
}

function reduceBucketAverage(bucket: ChartSeriesPoint[]): ChartSeriesPoint[] {
    if (bucket.length === 0) {
        return [];
    }
    const first = bucket[0];
    const last = bucket[bucket.length - 1];
    const total = bucket.reduce((sum, point) => sum + point.value, 0);
    return [{
        timestamp: Math.round((first.timestamp + last.timestamp) / 2),
        value: total / bucket.length,
    }];
}

function normalizePoints(points: ChartSeriesPoint[], from: number, to: number, downsampling: ChartSeriesDownsamplingConfig): ChartSeriesPoint[] {
    const filtered = points
        .filter((point) => point.timestamp >= from && point.timestamp <= to)
        .sort((a, b) => a.timestamp - b.timestamp);
    if (downsampling.strategy === 'none') {
        return filtered;
    }

    const sizing = downsampling.sizing;
    const buckets = sizing.mode === 'by-window'
        ? bucketPointsByWindow(filtered, from, to, sizing.window.value * windowUnitMs(sizing.window.unit))
        : bucketPointsByCount(
            filtered,
            downsampling.strategy === 'min-max'
                ? Math.max(1, Math.floor(sizing.maxPoints / 2))
                : sizing.maxPoints
        );

    if (downsampling.strategy === 'average') {
        return buckets.flatMap((bucket) => reduceBucketAverage(bucket));
    }
    if (downsampling.strategy === 'min-max') {
        return buckets.flatMap((bucket) => reduceBucketMinMax(bucket));
    }
    return buckets.map((bucket) => bucket[0]).filter((point): point is ChartSeriesPoint => Boolean(point));
}

function addTime(date: Date, amount: number, unit: ChartTimeRangeUnit): Date {
    const next = new Date(date);
    if (unit === 'hours') {
        next.setHours(next.getHours() + amount);
    } else if (unit === 'days') {
        next.setDate(next.getDate() + amount);
    } else if (unit === 'weeks') {
        next.setDate(next.getDate() + (amount * 7));
    } else {
        next.setMonth(next.getMonth() + amount);
    }
    return next;
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
    return addTime(startOfDay(date), 1, 'days');
}

function parseLocalDate(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }
    const parts = value.split('-').map((entry) => Number.parseInt(entry, 10));
    if (parts.length !== 3 || parts.some((entry) => !Number.isFinite(entry))) {
        return undefined;
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function parseDateTime(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : undefined;
}

function resolveBaseRange(range: ChartTimeRangeConfig, now: Date): { from: Date; to: Date } {
    if (range.mode === 'today') {
        return {from: startOfDay(now), to: range.showFullRange ? endOfDay(now) : now};
    }

    if (range.mode === 'yesterday') {
        const today = startOfDay(now);
        return {from: addTime(today, -1, 'days'), to: today};
    }

    if (range.mode === 'last-days') {
        const amount = Math.max(1, Math.round(range.amount || 1));
        return {
            from: addTime(startOfDay(now), -(amount - 1), 'days'),
            to: range.showFullRange ? endOfDay(now) : now,
        };
    }

    if (range.mode === 'calendar-day') {
        const from = parseLocalDate(range.date) ?? startOfDay(now);
        return {from, to: addTime(from, 1, 'days')};
    }

    if (range.mode === 'custom') {
        const fallback = {from: addTime(now, -24, 'hours'), to: now};
        const from = parseDateTime(range.start) ?? fallback.from;
        const to = parseDateTime(range.end) ?? fallback.to;
        return from.getTime() < to.getTime() ? {from, to} : fallback;
    }

    const amount = Math.max(1, range.amount || 24);
    return {from: addTime(now, -amount, range.unit || 'hours'), to: now};
}

export function resolveSeriesTimeRange(range: ChartTimeRangeConfig, now: Date): ResolvedSeriesTimeRange {
    const base = resolveBaseRange(range, now);
    const offsetAmount = Math.max(0, range.offsetAmount || 0);
    const queryOffset = -offsetAmount;
    const queryFrom = addTime(base.from, queryOffset, range.offsetUnit || 'days');
    const rawQueryTo = addTime(base.to, queryOffset, range.offsetUnit || 'days');
    const queryTo = rawQueryTo.getTime() > now.getTime() ? now : rawQueryTo;
    const shouldAlign = range.displayMode === 'aligned' && offsetAmount !== 0;
    const displayFrom = shouldAlign ? base.from : queryFrom;
    const displayTo = shouldAlign ? base.to : rawQueryTo;

    return {
        queryFrom,
        queryTo,
        displayFrom,
        displayTo,
    };
}

function applyDisplayRange(points: ChartSeriesPoint[], range: ResolvedSeriesTimeRange): ChartSeriesPoint[] {
    const offset = range.displayFrom.getTime() - range.queryFrom.getTime();
    if (offset === 0) {
        return points;
    }
    return points.map((point) => ({
        ...point,
        originalTimestamp: point.timestamp,
        timestamp: point.timestamp + offset,
    }));
}

async function fetchHistoryPoints(
    hass: HomeAssistant,
    entityId: string,
    source: ChartSeriesDataSourceConfig,
    from: Date,
    to: Date
): Promise<ChartSeriesPoint[]> {
    const response = await hass.callWS<HistoryStates>({
        type: 'history/history_during_period',
        start_time: from.toISOString(),
        end_time: to.toISOString(),
        entity_ids: [entityId],
        minimal_response: true,
        no_attributes: false,
    });

    const rows = response?.[entityId] || [];
    const points = rows
        .map((row) => {
            const rawValue = source.valueSource === 'attribute'
                ? row.a?.[source.attribute || '']
                : row.s;
            const value = toFiniteNumber(rawValue);
            if (value === null) return null;
            return {
                timestamp: row.lu * 1000,
                value,
            };
        })
        .filter((point): point is ChartSeriesPoint => Boolean(point));

    return normalizePoints(points, from.getTime(), to.getTime(), source.downsampling);
}

function statisticTimestamp(stat: StatisticValue): number {
    const candidate = stat.start;
    if (typeof candidate === 'number') {
        return candidate;
    }
    const parsed = Date.parse(candidate);
    return Number.isFinite(parsed) ? parsed : Date.now();
}

async function fetchStatisticPoints(
    hass: HomeAssistant,
    entityId: string,
    source: ChartSeriesDataSourceConfig,
    from: Date,
    to: Date
): Promise<ChartSeriesPoint[]> {
    const statisticType = source.statisticType;
    const response = await hass.callWS<StatisticsResponse>({
        type: 'recorder/statistics_during_period',
        start_time: from.toISOString(),
        end_time: to.toISOString(),
        statistic_ids: [entityId],
        period: source.statisticsPeriod,
        types: [statisticType],
    });

    const rows = response?.[entityId] || [];
    const points = rows
        .map((row) => {
            const value = toFiniteNumber(row[statisticType]);
            if (value === null) return null;
            return {
                timestamp: statisticTimestamp(row),
                value,
            };
        })
        .filter((point): point is ChartSeriesPoint => Boolean(point));

    // Statistics are already aggregated by the recorder period; do not sample them again.
    return filterSortedPoints(points, from.getTime(), to.getTime());
}

function buildLivePoint(
    hass: HomeAssistant,
    source: ChartSeriesDataSourceConfig,
    entityId: string,
    timestamp: number
): ChartSeriesPoint[] {
    const stateObj = hass.states[entityId];
    if (!stateObj) {
        return [];
    }
    const nextValue = extractValueFromState(stateObj, source);
    if (nextValue === null) {
        return [];
    }

    return [{timestamp, value: nextValue}];
}

async function loadEntityPoints(
    hass: HomeAssistant,
    source: ChartSeriesDataSourceConfig,
    resolvedEntityId: string,
    from: Date,
    to: Date
): Promise<ChartSeriesPoint[]> {
    if (source.mode === 'live') {
        return buildLivePoint(hass, source, resolvedEntityId, to.getTime());
    }
    if (source.mode === 'history') {
        return fetchHistoryPoints(hass, resolvedEntityId, source, from, to);
    }
    return fetchStatisticPoints(hass, resolvedEntityId, source, from, to);
}

function getEntityMetadata(hass: HomeAssistant, entityId: string): {
    sourceUnit?: string;
    deviceClass?: string;
} {
    const stateObj = hass.states[entityId];
    return {
        sourceUnit: typeof stateObj?.attributes?.unit_of_measurement === 'string'
            ? stateObj.attributes.unit_of_measurement
            : undefined,
        deviceClass: typeof stateObj?.attributes?.device_class === 'string'
            ? stateObj.attributes.device_class
            : undefined,
    };
}

async function loadResolvedSeriesItem(
    hass: HomeAssistant,
    documentModel: DocumentModel,
    block: BlockData,
    series: ChartSeriesConfig,
    item: ChartSeriesItemConfig,
    index: number,
    now: Date
): Promise<ResolvedChartSeriesItem | undefined> {
    const resolvedEntityId = resolveEntityId(documentModel, block, item.binding.entityConfig);
    if (!resolvedEntityId) {
        return undefined;
    }

    const range = resolveSeriesTimeRange(item.binding.dataSource.timeRange, now);
    const points = await loadEntityPoints(
        hass,
        item.binding.dataSource,
        resolvedEntityId,
        range.queryFrom,
        range.queryTo
    );
    const metadata = getEntityMetadata(hass, resolvedEntityId);

    return {
        id: item.id,
        name: resolveEntityLabel(hass, resolvedEntityId, item, index),
        color: item.color || '#3b82f6',
        entityId: resolvedEntityId,
        unit: metadata.sourceUnit,
        sourceUnit: metadata.sourceUnit,
        deviceClass: metadata.deviceClass,
        showUnit: false,
        from: range.queryFrom.getTime(),
        to: range.queryTo.getTime(),
        displayFrom: range.displayFrom.getTime(),
        displayTo: range.displayTo.getTime(),
        itemConfig: item,
        points: applyDisplayRange(points, range),
    };
}

function getRangeBoundary(
    items: ResolvedChartSeriesItem[],
    key: 'from' | 'to' | 'displayFrom' | 'displayTo',
    fallback: number,
    reducer: (...values: number[]) => number
): number {
    const values = items.map((item) => item[key]).filter((value) => Number.isFinite(value));
    return values.length > 0 ? reducer(...values) : fallback;
}

export async function loadChartRuntimeData(
    hass: HomeAssistant,
    documentModel: DocumentModel,
    block: BlockData,
    series: ChartSeriesConfig[]
): Promise<ChartRuntimeData> {
    const now = new Date();

    const resolvedEntries = series
        .filter((entry) => !entry.items?.length)
        .map((entry) => {
            const resolvedEntityId = resolveEntityId(documentModel, block, entry.binding.entityConfig);
            if (!resolvedEntityId) return null;
            return {
                series: entry,
                entityId: resolvedEntityId,
            };
        })
        .filter((entry): entry is { series: ChartSeriesConfig; entityId: string } => Boolean(entry));

    const loaded = await Promise.all(
        resolvedEntries.map(async (entry, index): Promise<ResolvedChartSeries> => {
            const range = resolveSeriesTimeRange(entry.series.binding.dataSource.timeRange, now);
            const points = await loadEntityPoints(
                hass,
                entry.series.binding.dataSource,
                entry.entityId,
                range.queryFrom,
                range.queryTo
            );
            const metadata = getEntityMetadata(hass, entry.entityId);
            return {
                id: entry.series.id,
                name: resolveEntityLabel(hass, entry.entityId, entry.series, index),
                color: entry.series.color || '#3b82f6',
                entityId: entry.entityId,
                unit: metadata.sourceUnit,
                sourceUnit: metadata.sourceUnit,
                deviceClass: metadata.deviceClass,
                showUnit: false,
                from: range.queryFrom.getTime(),
                to: range.queryTo.getTime(),
                displayFrom: range.displayFrom.getTime(),
                displayTo: range.displayTo.getTime(),
                seriesConfig: entry.series,
                points: applyDisplayRange(points, range),
            };
        })
    );
    const itemBasedLoaded = await Promise.all(
        series
            .filter((entry) => entry.items?.length)
            .map(async (entry): Promise<ResolvedChartSeries> => {
                const items = (await Promise.all(
                    (entry.items || []).map((item, index) => loadResolvedSeriesItem(
                        hass,
                        documentModel,
                        block,
                        entry,
                        item,
                        index,
                        now
                    ))
                )).filter((item): item is ResolvedChartSeriesItem => Boolean(item));
                const fallbackTime = now.getTime();

                return {
                    id: entry.id,
                    name: entry.name?.trim() || 'Series',
                    color: entry.color || '#3b82f6',
                    entityId: '',
                    unit: undefined,
                    sourceUnit: undefined,
                    deviceClass: undefined,
                    showUnit: false,
                    from: getRangeBoundary(items, 'from', fallbackTime, Math.min),
                    to: getRangeBoundary(items, 'to', fallbackTime, Math.max),
                    displayFrom: getRangeBoundary(items, 'displayFrom', fallbackTime, Math.min),
                    displayTo: getRangeBoundary(items, 'displayTo', fallbackTime, Math.max),
                    seriesConfig: entry,
                    points: [],
                    items,
                };
            })
    );
    const allLoaded = [...loaded, ...itemBasedLoaded];

    return {
        from: allLoaded.length > 0 ? Math.min(...allLoaded.map((entry) => entry.displayFrom)) : undefined,
        to: allLoaded.length > 0 ? Math.max(...allLoaded.map((entry) => entry.displayTo)) : undefined,
        series: allLoaded,
    };
}
