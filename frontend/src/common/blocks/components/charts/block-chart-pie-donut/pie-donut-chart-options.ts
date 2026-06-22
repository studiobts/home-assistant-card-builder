import { buildChartOption } from '@/common/blocks/components/charts/chart-option-builder';
import '@/common/blocks/components/charts/series-builders/pie-series-option-builder';
import type {
    ChartRuntimeData,
    PieDonutChartConfig,
} from '@/common/blocks/components/charts/chart-types';
import type { EChartsOption } from 'echarts';

type ChartSize = { width: number; height: number };

export function buildPieDonutChartOption(
    config: PieDonutChartConfig,
    runtimeData: ChartRuntimeData,
    chartSize?: ChartSize
): EChartsOption {
    return buildChartOption(config, runtimeData, {chartSize});
}
