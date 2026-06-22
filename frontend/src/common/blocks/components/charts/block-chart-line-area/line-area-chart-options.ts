import { buildChartOption } from '@/common/blocks/components/charts/chart-option-builder';
import '@/common/blocks/components/charts/series-builders/line-series-option-builder';
import type {
    ChartRuntimeData,
    LineAreaChartConfig,
} from '@/common/blocks/components/charts/chart-types';
import type { EChartsOption } from 'echarts';

export function buildLineAreaChartOption(config: LineAreaChartConfig, runtimeData: ChartRuntimeData): EChartsOption {
    return buildChartOption(config, runtimeData);
}
