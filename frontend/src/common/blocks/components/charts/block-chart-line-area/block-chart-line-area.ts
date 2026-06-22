import { BaseChart } from '@/common/blocks/components/charts/base-chart';
import { buildLineAreaChartOption } from '@/common/blocks/components/charts/block-chart-line-area/line-area-chart-options';
import {
    createDefaultLineAreaChartConfig,
    normalizeLineAreaChartConfig,
    type LineAreaChartConfig,
} from '@/common/blocks/components/charts/chart-types';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { ChartRuntimeData } from '@/common/blocks/components/charts/chart-types';
import type { BlockPanelStyleTargetConfig, BlockPanelTargetStyles } from '@/common/blocks/types';
import type { EChartsOption } from 'echarts';
import { customElement } from 'lit/decorators.js';

@customElement('block-chart-line-area')
export class BlockChartLineArea extends BaseChart<LineAreaChartConfig> {
    static readonly MAX_SERIES = 1;

    static getBlockConfig(): BlockRegistration {
        return {
            sinceVersion: '2.5.0',
            definition: {
                label: 'Line / Area Chart',
                icon: '<ha-icon icon="mdi:chart-line"></ha-icon>',
                category: 'charts',
            },
            defaults: {
                props: {
                    chartConfig: createDefaultLineAreaChartConfig(),
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
        };
    }

    public getChartEditorTagName(): string {
        return 'chart-line-area-editor-overlay';
    }

    public getMaxSeriesCount(): number {
        return BlockChartLineArea.MAX_SERIES;
    }

    protected normalizeChartConfig(raw: unknown): LineAreaChartConfig {
        return normalizeLineAreaChartConfig(raw, this.getMaxSeriesCount());
    }

    protected buildChartStyleTargets(config: LineAreaChartConfig): BlockPanelTargetStyles {
        return {
            ...this.buildTitleStyleTarget(),
            ...this.buildLegendStyleTarget(),
            ...this.buildTooltipStyleTarget(),
            ...this.buildGridStyleTargets(config),
            ...this.buildXAxisStyleTargets(config),
            ...this.buildYAxisStyleTargets(config),
            ...this.buildSeriesStyleTargetsWithOptions(
                config,
                (label) => this.getLineAreaSeriesStyleTargetOptions(label, config.specific.mode === 'area')
            ),
        };
    }

    private getLineAreaSeriesStyleTargetOptions(label: string, includeArea: boolean): BlockPanelStyleTargetConfig {
        return {
            label,
            description: `Style for ${label.toLowerCase()}`,
            styles: {
                preset: 'echart_line_area_series',
                properties: includeArea ? ['echart.areaColor'] : [],
            },
        };
    }

    protected buildChartOption(config: LineAreaChartConfig, runtimeData: ChartRuntimeData): EChartsOption {
        return buildLineAreaChartOption(config, runtimeData);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-chart-line-area': BlockChartLineArea;
    }
}
