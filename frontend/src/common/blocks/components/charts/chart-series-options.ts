import type { CartesianComponentsOptionsResult } from '@/common/blocks/components/charts/chart-common-options';
import type {
    BaseChartConfig,
    ChartRuntimeData,
    ChartSeriesConfig,
    ChartSeriesType,
    ResolvedChartSeries,
} from '@/common/blocks/components/charts/chart-types';
import type { StyleMap } from '@/common/blocks/components/charts/chart-style-adapter';
import type { EChartsOption } from 'echarts';

export interface ChartSeriesOptionBuildContext {
    config: BaseChartConfig;
    runtimeData: ChartRuntimeData;
    components: CartesianComponentsOptionsResult;
    configSeriesById: Map<string, ChartSeriesConfig>;
    chartSize?: { width: number; height: number };
}

export interface ChartSeriesOptionEntry {
    option: any;
    sourceSeriesIds: string[];
}

export interface ChartSeriesOptionBuildResult {
    series: ChartSeriesOptionEntry[];
    title?: EChartsOption['title'] | null;
    legendPatch?: Record<string, unknown>;
    tooltipPatch?: Record<string, unknown>;
    graphic?: EChartsOption['graphic'];
}

export interface ChartSeriesOptionBuilder {
    type: ChartSeriesType;
    buildSeriesOptions(
        series: ResolvedChartSeries[],
        context: ChartSeriesOptionBuildContext
    ): ChartSeriesOptionBuildResult;
    applySeriesStyle(option: any, style: StyleMap): void;
    applySeriesItemStyle(itemOption: any, style: StyleMap): any;
}

const seriesOptionBuilders = new Map<ChartSeriesType, ChartSeriesOptionBuilder>();

export function registerChartSeriesOptionBuilder(builder: ChartSeriesOptionBuilder): void {
    seriesOptionBuilders.set(builder.type, builder);
}

export function getChartSeriesOptionBuilder(type: ChartSeriesType): ChartSeriesOptionBuilder | undefined {
    return seriesOptionBuilders.get(type);
}

export function getRegisteredChartSeriesOptionBuilders(): ChartSeriesOptionBuilder[] {
    return Array.from(seriesOptionBuilders.values());
}
