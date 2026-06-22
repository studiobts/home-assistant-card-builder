import { BaseChart } from '@/common/blocks/components/charts/base-chart';
import { buildBarsChartOption } from '@/common/blocks/components/charts/block-chart-bars/bars-chart-options';
import {
    createDefaultBarsChartConfig,
    normalizeBarsChartConfig,
    type BarsChartConfig,
} from '@/common/blocks/components/charts/chart-types';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { ChartRuntimeData } from '@/common/blocks/components/charts/chart-types';
import type { BlockPanelStyleTargetConfig, BlockPanelTargetStyles } from '@/common/blocks/types';
import type { EChartsOption } from 'echarts';
import { customElement } from 'lit/decorators.js';

@customElement('block-chart-bars')
export class BlockChartBars extends BaseChart<BarsChartConfig> {
    static readonly MAX_SERIES = 1;

    static getBlockConfig(): BlockRegistration {
        return {
            sinceVersion: '2.5.0',
            definition: {
                label: 'Bars Chart',
                icon: '<ha-icon icon="mdi:chart-bar"></ha-icon>',
                category: 'charts',
            },
            defaults: {
                props: {
                    chartConfig: createDefaultBarsChartConfig(),
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
        };
    }

    public getChartEditorTagName(): string {
        return 'chart-bars-editor-overlay';
    }

    public getMaxSeriesCount(): number {
        return BlockChartBars.MAX_SERIES;
    }

    protected normalizeChartConfig(raw: unknown): BarsChartConfig {
        return normalizeBarsChartConfig(raw, this.getMaxSeriesCount());
    }

    protected buildChartStyleTargets(config: BarsChartConfig): BlockPanelTargetStyles {
        return {
            ...this.buildTitleStyleTarget(),
            ...this.buildLegendStyleTarget(),
            ...this.buildTooltipStyleTarget(),
            ...this.buildGridStyleTargets(config),
            ...this.buildXAxisStyleTargets(config),
            ...this.buildYAxisStyleTargets(config),
            ...this.buildSeriesStyleTargetsWithOptions(config, (label) => this.getBarSeriesStyleTargetOptions(label)),
        };
    }

    private getBarSeriesStyleTargetOptions(label: string): BlockPanelStyleTargetConfig {
        return {
            label,
            description: `Style for ${label.toLowerCase()}`,
            styles: {
                preset: 'echart_bar_series',
            },
        };
    }

    protected buildChartOption(config: BarsChartConfig, runtimeData: ChartRuntimeData): EChartsOption {
        return buildBarsChartOption(config, runtimeData);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-chart-bars': BlockChartBars;
    }
}
