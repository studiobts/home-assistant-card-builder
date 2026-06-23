import { getChartSeriesOptionBuilder } from '@/common/blocks/components/charts/chart-series-options';
import type { BaseChartConfig } from '@/common/blocks/components/charts/chart-types';

export type StyleMap = Record<string, string>;

const ALLOWED_TEXT_ALIGN = new Set(['left', 'center', 'right', 'auto']);
const ALLOWED_ECHART_LINE_SYMBOLS = new Set([
    'none',
    'circle',
    'emptyCircle',
    'rect',
    'roundRect',
    'triangle',
    'diamond',
    'pin',
    'arrow',
]);
const ALLOWED_ECHART_LEGEND_ICONS = new Set([
    'none',
    'circle',
    'rect',
    'roundRect',
    'triangle',
    'diamond',
    'pin',
    'arrow',
]);
const ALLOWED_ECHART_PIE_LABEL_POSITIONS = new Set(['outside', 'inside', 'center']);
const PIE_CENTER_TITLE_GRAPHIC_ID = 'chart-center-title';
const PIE_CENTER_TITLE_TEXT_GRAPHIC_ID = 'chart-center-title-text';

function asArray<T>(value: T | T[] | undefined): T[] {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

export function parseNumber(value: string | undefined): number | undefined {
    if (!value) {
        return undefined;
    }
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function sanitizeColor(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    const normalized = value.trim();
    if (!normalized) {
        return undefined;
    }
    if (normalized.includes('var(') || normalized.includes('calc(')) {
        return undefined;
    }
    return normalized;
}

function clampUnit(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
}

export function parseEchartColor(value: string | undefined): unknown {
    if (!value) {
        return undefined;
    }
    const normalized = value.trim();
    if (!normalized) {
        return undefined;
    }

    if (normalized.startsWith('{') && normalized.endsWith('}')) {
        try {
            const parsed = JSON.parse(normalized) as {
                type?: string;
                color?: unknown;
                x?: unknown;
                y?: unknown;
                x2?: unknown;
                y2?: unknown;
                r?: unknown;
                global?: unknown;
                colorStops?: Array<{ offset?: unknown; color?: unknown }>;
            };

            if (parsed.type === 'solid') {
                return sanitizeColor(typeof parsed.color === 'string' ? parsed.color : undefined);
            }

            if (parsed.type === 'linear' && Array.isArray(parsed.colorStops)) {
                const colorStops = parsed.colorStops
                    .map((stop) => ({
                        offset: clampUnit(Number(stop.offset)),
                        color: sanitizeColor(typeof stop.color === 'string' ? stop.color : undefined) ?? '#3b82f6',
                    }))
                    .filter((stop) => Number.isFinite(stop.offset));
                if (colorStops.length < 2) {
                    return undefined;
                }
                return {
                    type: 'linear',
                    x: Number.isFinite(Number(parsed.x)) ? Number(parsed.x) : 0,
                    y: Number.isFinite(Number(parsed.y)) ? Number(parsed.y) : 0,
                    x2: Number.isFinite(Number(parsed.x2)) ? Number(parsed.x2) : 1,
                    y2: Number.isFinite(Number(parsed.y2)) ? Number(parsed.y2) : 0,
                    colorStops,
                    global: Boolean(parsed.global),
                };
            }

            if (parsed.type === 'radial' && Array.isArray(parsed.colorStops)) {
                const colorStops = parsed.colorStops
                    .map((stop) => ({
                        offset: clampUnit(Number(stop.offset)),
                        color: sanitizeColor(typeof stop.color === 'string' ? stop.color : undefined) ?? '#3b82f6',
                    }))
                    .filter((stop) => Number.isFinite(stop.offset));
                if (colorStops.length < 2) {
                    return undefined;
                }
                return {
                    type: 'radial',
                    x: Number.isFinite(Number(parsed.x)) ? Number(parsed.x) : 0.5,
                    y: Number.isFinite(Number(parsed.y)) ? Number(parsed.y) : 0.5,
                    r: Number.isFinite(Number(parsed.r)) ? Number(parsed.r) : 0.5,
                    colorStops,
                    global: Boolean(parsed.global),
                };
            }
        } catch (_error) {
        }
    }

    return sanitizeColor(normalized);
}

export function sanitizeEchartLineSymbol(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    const normalized = value.trim();
    return ALLOWED_ECHART_LINE_SYMBOLS.has(normalized) ? normalized : undefined;
}

function sanitizeEchartLegendIcon(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    const normalized = value.trim();
    return ALLOWED_ECHART_LEGEND_ICONS.has(normalized) ? normalized : undefined;
}

export function parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', '1', 'on', 'show'].includes(normalized)) {
        return true;
    }
    if (['false', 'no', '0', 'off', 'hide'].includes(normalized)) {
        return false;
    }
    return undefined;
}

export function sanitizeEchartPieLabelPosition(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    const normalized = value.trim();
    return ALLOWED_ECHART_PIE_LABEL_POSITIONS.has(normalized) ? normalized : undefined;
}

function sanitizeTextAlign(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    return ALLOWED_TEXT_ALIGN.has(value) ? value : undefined;
}

export function parsePx(value: string | undefined): number | undefined {
    return parseNumber(value);
}

function parseFontWeight(value: string | undefined): string | number | undefined {
    if (!value) {
        return undefined;
    }
    const numeric = Number.parseInt(value, 10);
    if (Number.isFinite(numeric) && String(numeric) === value.trim()) {
        return numeric;
    }
    return value;
}

export function buildTextStyle(style: StyleMap): Record<string, unknown> {
    const fontSize = parsePx(style.fontSize);
    const textColor = parseEchartColor(style.color);

    return {
        color: textColor,
        fontSize,
        fontWeight: parseFontWeight(style.fontWeight),
    };
}

export function mergeObject<T extends Record<string, unknown>>(base: T | undefined, patch: Record<string, unknown>): T {
    const safeBase = base && typeof base === 'object' && !Array.isArray(base)
        ? base
        : ({} as T);
    return {
        ...safeBase,
        ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)),
    } as T;
}

function mergeStyleFallback(base: StyleMap, override: StyleMap | undefined): StyleMap {
    const result: StyleMap = {...base};
    Object.entries(override ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value.trim() !== '') {
            result[key] = value;
        }
    });
    return result;
}

function applyTitleStyle(option: any, style: StyleMap): void {
    if (!option || !style || Object.keys(style).length === 0) {
        return;
    }
    option.textStyle = mergeObject(option.textStyle, buildTextStyle(style));
    option.backgroundColor = parseEchartColor(style.backgroundColor) ?? option.backgroundColor;
    option.borderColor = parseEchartColor(style.borderColor) ?? option.borderColor;
    option.borderWidth = parsePx(style.borderWidth) ?? option.borderWidth;
    option.textAlign = sanitizeTextAlign(style.textAlign) || option.textAlign;
}

function collectGraphicElements(option: any): any[] {
    const elements: any[] = [];

    const visit = (entry: any): void => {
        if (!entry) {
            return;
        }
        if (Array.isArray(entry)) {
            entry.forEach(visit);
            return;
        }
        if (Array.isArray(entry.elements)) {
            entry.elements.forEach(visit);
            return;
        }

        elements.push(entry);
        if (Array.isArray(entry.children)) {
            entry.children.forEach(visit);
        }
    };

    visit(option);
    return elements;
}

function applyGraphicTitleStyle(option: any, style: StyleMap): void {
    if (!option || !style || Object.keys(style).length === 0) {
        return;
    }

    const elements = collectGraphicElements(option);
    const hasCenterTitle = elements.some((entry) => entry?.id === PIE_CENTER_TITLE_GRAPHIC_ID);
    if (!hasCenterTitle) {
        return;
    }

    const titleText = elements.find((entry) => entry?.id === PIE_CENTER_TITLE_TEXT_GRAPHIC_ID);
    if (!titleText) {
        return;
    }

    const textStyle = buildTextStyle(style);
    titleText.style = mergeObject(titleText.style, {
        fill: parseEchartColor(style.color),
        fontSize: textStyle.fontSize,
        fontWeight: textStyle.fontWeight,
    });
}

function applyLegendStyle(option: any, style: StyleMap): void {
    if (!option || !style || Object.keys(style).length === 0) {
        return;
    }
    option.backgroundColor = parseEchartColor(style.backgroundColor) ?? option.backgroundColor;
    option.borderColor = parseEchartColor(style.borderColor) ?? option.borderColor;
    option.borderWidth = parsePx(style.borderWidth) ?? option.borderWidth;
    option.icon = sanitizeEchartLegendIcon(style.echartLegendIcon) ?? option.icon;
    const legendIconSize = parsePx(style.echartLegendIconSize);
    if (legendIconSize !== undefined) {
        option.itemWidth = legendIconSize;
        option.itemHeight = legendIconSize;
    }
}

function applyLegendTextStyle(option: any, richKey: string | undefined, style: StyleMap, applyRoot: boolean = false): void {
    if (!option || !style || Object.keys(style).length === 0) {
        return;
    }

    if (applyRoot) {
        option.textStyle = mergeObject(option.textStyle, buildTextStyle(style));
    } else {
        option.textStyle = mergeObject(option.textStyle, {});
    }
    if (!richKey) {
        return;
    }

    option.textStyle.rich = mergeObject(option.textStyle.rich, {
        [richKey]: mergeObject(option.textStyle.rich?.[richKey], buildTextStyle(style)),
    });
}

function applyTooltipStyle(option: any, style: StyleMap): void {
    if (!option || !style || Object.keys(style).length === 0) {
        return;
    }
    option.textStyle = mergeObject(option.textStyle, buildTextStyle(style));
    option.backgroundColor = parseEchartColor(style.backgroundColor) ?? option.backgroundColor;
    option.borderColor = parseEchartColor(style.borderColor) ?? option.borderColor;
    option.borderWidth = parsePx(style.borderWidth) ?? option.borderWidth;
}

function applyAxisStyle(option: any, style: StyleMap): void {
    if (!option || !style || Object.keys(style).length === 0) {
        return;
    }

    const rawColor = parseEchartColor(style.color);
    const labelColor = rawColor;
    const lineColor = parseEchartColor(style.borderColor) ?? labelColor;
    const lineWidth = parsePx(style.borderWidth);
    const gridWidth = parsePx(style.borderTopWidth || style.borderWidth);

    option.nameTextStyle = mergeObject(option.nameTextStyle, buildTextStyle(style));
    option.axisLabel = mergeObject(option.axisLabel, buildTextStyle(style));
    option.axisLine = mergeObject(option.axisLine, {
        lineStyle: mergeObject(option.axisLine?.lineStyle, {
            color: lineColor,
            width: lineWidth,
        }),
    });
    option.splitLine = mergeObject(option.splitLine, {
        lineStyle: mergeObject(option.splitLine?.lineStyle, {
            color: lineColor,
            width: gridWidth,
            opacity: parseNumber(style.opacity),
        }),
    });

    if (labelColor !== undefined) {
        option.axisLabel = mergeObject(option.axisLabel, {color: labelColor});
    }
}

function parsePaddingShorthand(value: string | undefined): {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
} {
    if (!value) {
        return {};
    }
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return {};
    }
    const values = parts.map((part) => parsePx(part));
    if (values.some((entry) => entry === undefined)) {
        return {};
    }

    if (values.length === 1) {
        return {
            top: values[0],
            right: values[0],
            bottom: values[0],
            left: values[0],
        };
    }
    if (values.length === 2) {
        return {
            top: values[0],
            right: values[1],
            bottom: values[0],
            left: values[1],
        };
    }
    if (values.length === 3) {
        return {
            top: values[0],
            right: values[1],
            bottom: values[2],
            left: values[1],
        };
    }
    return {
        top: values[0],
        right: values[1],
        bottom: values[2],
        left: values[3],
    };
}

function applyGridStyle(option: any, style: StyleMap): void {
    if (!option || !style || Object.keys(style).length === 0) {
        return;
    }

    const shorthand = parsePaddingShorthand(style.padding);
    const top = parsePx(style.paddingTop) ?? shorthand.top;
    const right = parsePx(style.paddingRight) ?? shorthand.right;
    const bottom = parsePx(style.paddingBottom) ?? shorthand.bottom;
    const left = parsePx(style.paddingLeft) ?? shorthand.left;

    if (top !== undefined) {
        option.top = top;
    }
    if (right !== undefined) {
        option.right = right;
    }
    if (bottom !== undefined) {
        option.bottom = bottom;
    }
    if (left !== undefined) {
        option.left = left;
    }
}

export interface ChartStyleTargetsContext {
    config: BaseChartConfig;
    option: any;
    getTitleStyle: () => StyleMap;
    getLegendStyle: () => StyleMap;
    getLegendLabelStyle: () => StyleMap;
    getLegendValueStyle: () => StyleMap;
    getLegendUnitStyle: () => StyleMap;
    getTooltipStyle: () => StyleMap;
    getGridStyle: (gridId: string) => StyleMap;
    getXAxisStyle: (axisId: string) => StyleMap;
    getYAxisStyle: (axisId: string) => StyleMap;
    getAllSeriesStyle: () => StyleMap;
    getSeriesStyle: (seriesId: string) => StyleMap;
}

export function applyChartStyleTargetsToOption(context: ChartStyleTargetsContext): any {
    const option = context.option;
    if (!option || !context.config) {
        return option;
    }

    for (const titleOption of asArray(option.title)) {
        try {
            applyTitleStyle(titleOption, context.getTitleStyle());
        } catch (_error) {
        }
    }
    try {
        applyGraphicTitleStyle(option.graphic, context.getTitleStyle());
    } catch (_error) {
    }
    try {
        applyLegendStyle(option.legend, context.getLegendStyle());
        applyLegendTextStyle(option.legend, 'legendLabel', context.getLegendLabelStyle(), true);
        applyLegendTextStyle(option.legend, 'legendValue', context.getLegendValueStyle());
        applyLegendTextStyle(option.legend, 'legendUnit', context.getLegendUnitStyle());
    } catch (_error) {
    }
    try {
        applyTooltipStyle(option.tooltip, context.getTooltipStyle());
    } catch (_error) {
    }

    const gridOptions = asArray(option.grid);
    context.config.components.grids.forEach((grid, index) => {
        try {
            applyGridStyle(gridOptions[index], context.getGridStyle(grid.id));
        } catch (_error) {
        }
    });

    const xAxisOptions = asArray(option.xAxis);
    context.config.components.xAxes.forEach((axis, index) => {
        try {
            applyAxisStyle(xAxisOptions[index], context.getXAxisStyle(axis.id));
        } catch (_error) {
        }
    });

    const yAxisOptions = asArray(option.yAxis);
    context.config.components.yAxes.forEach((axis, index) => {
        try {
            applyAxisStyle(yAxisOptions[index], context.getYAxisStyle(axis.id));
        } catch (_error) {
        }
    });

    const seriesStyleMap = new Map<string, StyleMap>();
    const configSeriesById = new Map(context.config.series.map((series) => [series.id, series]));
    const itemParentSeriesById = new Map<string, string>();
    const allSeriesStyle = context.getAllSeriesStyle();
    context.config.series.forEach((series) => {
        seriesStyleMap.set(series.id, context.getSeriesStyle(series.id));
        series.items?.forEach((item) => {
            seriesStyleMap.set(item.id, context.getSeriesStyle(item.id));
            itemParentSeriesById.set(item.id, series.id);
        });
    });

    const seriesOptions = asArray(option.series);
    for (const seriesOption of seriesOptions) {
        if (typeof seriesOption?.id === 'string') {
            try {
                const sourceSeries = configSeriesById.get(seriesOption.id);
                const builder = sourceSeries ? getChartSeriesOptionBuilder(sourceSeries.type) : undefined;
                builder?.applySeriesStyle(seriesOption, mergeStyleFallback(allSeriesStyle, seriesStyleMap.get(seriesOption.id)));
            } catch (_error) {
            }
        }

        if (Array.isArray(seriesOption?.data)) {
            seriesOption.data = seriesOption.data.map((item: any) => {
                const itemId = typeof item?.id === 'string' ? item.id : undefined;
                const parentSeriesId = itemId ? itemParentSeriesById.get(itemId) : undefined;
                const parentSeries = parentSeriesId ? configSeriesById.get(parentSeriesId) : undefined;
                const builder = parentSeries ? getChartSeriesOptionBuilder(parentSeries.type) : undefined;
                if (!itemId || !builder) {
                    return item;
                }
                try {
                    return builder.applySeriesItemStyle(
                        item,
                        mergeStyleFallback(allSeriesStyle, seriesStyleMap.get(itemId))
                    );
                } catch (_error) {
                    return item;
                }
            });
        }
    }

    return option;
}
