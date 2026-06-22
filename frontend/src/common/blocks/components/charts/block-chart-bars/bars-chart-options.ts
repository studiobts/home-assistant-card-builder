import { buildChartOption } from '@/common/blocks/components/charts/chart-option-builder';
import '@/common/blocks/components/charts/series-builders/bar-series-option-builder';
import type {
    BarsChartConfig,
    ChartRuntimeData,
} from '@/common/blocks/components/charts/chart-types';
import type { EChartsOption } from 'echarts';

export function buildBarsChartOption(config: BarsChartConfig, runtimeData: ChartRuntimeData): EChartsOption {
    return buildChartOption(config, runtimeData);
}
