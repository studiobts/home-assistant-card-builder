import { BaseChart } from '@/common/blocks/components/charts/base-chart';
import { buildPieDonutChartOption } from '@/common/blocks/components/charts/block-chart-pie-donut/pie-donut-chart-options';
import {
    createDefaultPieDonutChartConfig,
    normalizePieDonutChartConfig,
    type ChartRuntimeData,
    type ChartType,
    type PieDonutChartConfig,
} from '@/common/blocks/components/charts/chart-types';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelStyleTargetConfig, BlockPanelTargetStyles } from '@/common/blocks/types';
import type { EChartsOption } from 'echarts';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('block-chart-pie-donut')
export class BlockChartPieDonut extends BaseChart<PieDonutChartConfig> {
    static readonly MAX_SERIES = 3;
    static override styles = [
        ...BaseChart.styles,
        css`
            :host {
                height: auto;
                aspect-ratio: 1 / 1;
            }
        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            sinceVersion: '2.5.0',
            definition: {
                label: 'Pie / Donut Chart',
                icon: '<ha-icon icon="mdi:chart-donut"></ha-icon>',
                category: 'charts',
            },
            defaults: {
                props: {
                    chartConfig: createDefaultPieDonutChartConfig(),
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
        };
    }

    public getChartType(): ChartType {
        return 'pie-donut';
    }

    public getChartEditorTagName(): string {
        return 'chart-pie-donut-editor-overlay';
    }

    public getMaxSeriesCount(): number {
        return BlockChartPieDonut.MAX_SERIES;
    }

    protected normalizeChartConfig(raw: unknown): PieDonutChartConfig {
        return normalizePieDonutChartConfig(raw, this.getMaxSeriesCount());
    }

    protected buildChartStyleTargets(config: PieDonutChartConfig): BlockPanelTargetStyles {
        return {
            ...this.buildTitleStyleTarget(),
            ...this.buildLegendStyleTarget(),
            ...this.buildTooltipStyleTarget(),
            ...this.buildSeriesItemStyleTargetsWithOptions(config, (label) => this.getPieDonutSeriesStyleTargetOptions(label)),
        };
    }

    private getPieDonutSeriesStyleTargetOptions(label: string): BlockPanelStyleTargetConfig {
        return {
            label,
            description: `Style for ${label.toLowerCase()}`,
            styles: {
                preset: 'echart_pie_donut_series',
            },
        };
    }

    protected buildChartOption(config: PieDonutChartConfig, runtimeData: ChartRuntimeData): EChartsOption {
        return buildPieDonutChartOption(config, runtimeData, {
            width: this.chartRoot?.clientWidth || 0,
            height: this.chartRoot?.clientHeight || 0,
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-chart-pie-donut': BlockChartPieDonut;
    }
}
