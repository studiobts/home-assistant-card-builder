import { BlockBase } from '@/common/blocks/components/block-base';
import type {
    BlockPanelConfig,
    BlockPanelStyleTargetConfig,
    BlockPanelTargetStyles,
} from '@/common/blocks/types';
import type { BlockData, BlockEntityConfig } from '@/common/core/model';
import { loadChartRuntimeData } from '@/common/blocks/components/charts/chart-data-provider';
import type {
    BaseChartConfig,
    ChartBaseAxisConfig,
    ChartSeriesConfig,
    ChartSeriesItemConfig,
    ChartRuntimeData,
    ResolvedChartSeries,
} from '@/common/blocks/components/charts/chart-types';
import { applyChartStyleTargetsToOption } from '@/common/blocks/components/charts/chart-style-adapter';
import { applyChartUnitConversion } from '@/common/blocks/components/charts/chart-unit-conversion';
import { echarts } from '@/common/blocks/components/charts/echarts-setup';
import type { EChartsOption, EChartsType } from 'echarts';
import { css, html, nothing, type PropertyValues } from 'lit';
import { query, state } from 'lit/decorators.js';

export abstract class BaseChart<TConfig extends BaseChartConfig> extends BlockBase {
    static styles = [
        ...BlockBase.styles,
        css`
            :host {
                display: block;
                min-width: 1px;
                min-height: 1px;
                padding: 0;
                height: 300px;
            }

            .chart-shell {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .chart-root {
                width: 100%;
                height: 100%;
            }

            .placeholder {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: var(--secondary-text-color, #666);
                text-align: center;
                padding: 12px;
                pointer-events: none;
            }
        `,
    ];

    @query('.chart-root')
    protected chartRoot?: HTMLDivElement;

    @state()
    protected statusMessage: string = '';

    protected chartInstance?: EChartsType;
    protected chartRefreshTimer: number | null = null;
    protected refreshInProgress = false;
    protected resizeObserver?: ResizeObserver;

    protected get chartConfigPropName(): string {
        return 'chartConfig';
    }

    public abstract getChartEditorTagName(): string;

    public abstract getMaxSeriesCount(): number;

    protected abstract normalizeChartConfig(raw: unknown): TConfig;

    protected abstract buildChartOption(config: TConfig, runtimeData: ChartRuntimeData): EChartsOption;

    protected abstract buildChartStyleTargets(config: TConfig): BlockPanelTargetStyles;

    protected getChartConfig(): TConfig {
        const config = this.normalizeChartConfig(this.block?.props?.[this.chartConfigPropName]);
        return {
            ...config,
            series: config.series.slice(0, this.getMaxSeriesCount()),
        };
    }

    protected getChartSeries(config: TConfig): ChartSeriesConfig[] {
        return config.series;
    }

    public getPanelConfig(): BlockPanelConfig {
        const chartConfig = this.getChartConfig();
        return {
            properties: {
                groups: [
                    {
                        id: 'chart-editor',
                        label: 'Chart',
                        traits: [
                            {
                                type: 'action',
                                name: 'chartEditor',
                                label: 'Chart Editor',
                                buttonLabel: 'Configure Chart',
                                actionId: 'open-chart-editor',
                            },
                        ],
                    },
                ],
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'full',
                    },
                },
                ...this.buildChartStyleTargets(chartConfig),
            },
        };
    }

    protected getTitleStyleTargetId(): string {
        return 'chart-title';
    }

    protected getLegendStyleTargetId(): string {
        return 'chart-legend';
    }

    protected getLegendLabelStyleTargetId(): string {
        return 'chart-legend-label';
    }

    protected getLegendValueStyleTargetId(): string {
        return 'chart-legend-value';
    }

    protected getLegendUnitStyleTargetId(): string {
        return 'chart-legend-unit';
    }

    protected getTooltipStyleTargetId(): string {
        return 'chart-tooltip';
    }

    protected getXAxisStyleTargetId(axisId: string): string {
        return `chart-x-axis-${axisId}`;
    }

    protected getYAxisStyleTargetId(axisId: string): string {
        return `chart-y-axis-${axisId}`;
    }

    protected getSeriesStyleTargetId(seriesId: string): string {
        return `chart-series-${seriesId}`;
    }

    protected getAllSeriesStyleTargetId(): string {
        return 'chart-series';
    }

    protected getGridStyleTargetId(gridId: string): string {
        return `chart-grid-${gridId}`;
    }

    protected getTitleStyleTargetOptions(): BlockPanelStyleTargetConfig {
        return {
            label: 'Chart Title',
            description: 'Style for chart title',
            styles: {
                preset: 'echart_text',
                properties: [
                    'background.backgroundColor',
                    'border.borderColor',
                    'border.borderWidth',
                ],
            },
        };
    }

    protected getLegendStyleTargetOptions(): BlockPanelStyleTargetConfig {
        return {
            label: 'Legend',
            description: 'Style for chart legend',
            styles: {
                properties: [
                    'background.backgroundColor',
                    'border.borderColor',
                    'border.borderWidth',
                    'echart.legendIcon',
                    'echart.legendIconSize',
                ],
                exclude: {
                    properties: [
                        'typography.textAlign',
                    ],
                },
            },
        };
    }

    protected getLegendLabelStyleTargetOptions(): BlockPanelStyleTargetConfig {
        return {
            label: 'Legend Label',
            description: 'Style for chart legend labels',
            styles: {
                preset: 'echart_text',
                exclude: {
                    properties: [
                        'typography.textAlign',
                    ],
                },
            },
        };
    }

    protected getLegendValueStyleTargetOptions(): BlockPanelStyleTargetConfig {
        return {
            label: 'Legend Value',
            description: 'Style for chart legend values',
            styles: {
                preset: 'echart_text',
                exclude: {
                    properties: [
                        'typography.textAlign',
                    ],
                },
            },
        };
    }

    protected getLegendUnitStyleTargetOptions(): BlockPanelStyleTargetConfig {
        return {
            label: 'Legend Unit',
            description: 'Style for chart legend units',
            styles: {
                preset: 'echart_text',
                exclude: {
                    properties: [
                        'typography.textAlign',
                    ],
                },
            },
        };
    }

    protected getTooltipStyleTargetOptions(): BlockPanelStyleTargetConfig {
        return {
            label: 'Tooltip',
            description: 'Style for chart tooltip',
            styles: {
                preset: 'echart_text',
                properties: [
                    'background.backgroundColor',
                    'border.borderColor',
                    'border.borderWidth',
                ],
                exclude: {
                    properties: [
                        'typography.textAlign',
                    ],
                },
            },
        };
    }

    protected getAxisStyleTargetOptions(label: string): BlockPanelStyleTargetConfig {
        return {
            label,
            description: `Style for ${label.toLowerCase()}`,
            styles: {
                preset: 'echart_stroke',
                properties: [
                    'typography.fontSize',
                    'typography.fontWeight',
                ],
                exclude: {
                    properties: [
                        'typography.textAlign',
                    ],
                },
            },
        };
    }

    protected getSeriesStyleTargetOptions(label: string): BlockPanelStyleTargetConfig {
        return {
            label,
            description: `Style for ${label.toLowerCase()}`,
            styles: {
                preset: 'echart_fill',
                properties: [
                    'typography.fontSize',
                    'typography.fontWeight',
                ],
            },
        };
    }

    protected getGridStyleTargetOptions(label: string): BlockPanelStyleTargetConfig {
        return {
            label,
            description: `Padding for ${label.toLowerCase()}`,
            styles: {
                preset: 'echart_grid_spacing',
            },
        };
    }

    protected buildTitleStyleTarget(): BlockPanelTargetStyles {
        return {
            [this.getTitleStyleTargetId()]: this.getTitleStyleTargetOptions(),
        };
    }

    protected buildLegendStyleTarget(): BlockPanelTargetStyles {
        return {
            [this.getLegendStyleTargetId()]: this.getLegendStyleTargetOptions(),
            [this.getLegendLabelStyleTargetId()]: this.getLegendLabelStyleTargetOptions(),
        };
    }

    protected buildLegendValueStyleTargets(): BlockPanelTargetStyles {
        return {
            [this.getLegendValueStyleTargetId()]: this.getLegendValueStyleTargetOptions(),
            [this.getLegendUnitStyleTargetId()]: this.getLegendUnitStyleTargetOptions(),
        };
    }

    protected buildTooltipStyleTarget(): BlockPanelTargetStyles {
        return {
            [this.getTooltipStyleTargetId()]: this.getTooltipStyleTargetOptions(),
        };
    }

    protected buildXAxisStyleTargets(config: TConfig): BlockPanelTargetStyles {
        return Object.fromEntries(
            config.components.xAxes.map((axis, index) => {
                const targetId = this.getXAxisStyleTargetId(axis.id);
                const axisLabel = this.getAxisTargetLabel('X Axis', axis, index + 1);
                return [targetId, this.getAxisStyleTargetOptions(axisLabel)];
            })
        );
    }

    protected buildYAxisStyleTargets(config: TConfig): BlockPanelTargetStyles {
        return Object.fromEntries(
            config.components.yAxes.map((axis, index) => {
                const targetId = this.getYAxisStyleTargetId(axis.id);
                const axisLabel = this.getAxisTargetLabel('Y Axis', axis, index + 1);
                return [targetId, this.getAxisStyleTargetOptions(axisLabel)];
            })
        );
    }

    protected buildSeriesStyleTargets(config: TConfig): BlockPanelTargetStyles {
        return {
            [this.getAllSeriesStyleTargetId()]: this.getSeriesStyleTargetOptions('All Series'),
            ...Object.fromEntries(
                config.series.map((series, index) => {
                    const targetId = this.getSeriesStyleTargetId(series.id);
                    const seriesLabel = this.getSeriesTargetLabel(series, index + 1);
                    return [targetId, this.getSeriesStyleTargetOptions(seriesLabel)];
                })
            ),
        };
    }

    protected buildSeriesStyleTargetsWithOptions(
        config: TConfig,
        getOptions: (label: string) => BlockPanelStyleTargetConfig
    ): BlockPanelTargetStyles {
        return {
            [this.getAllSeriesStyleTargetId()]: getOptions('All Series'),
            ...Object.fromEntries(
                config.series.map((series, index) => {
                    const targetId = this.getSeriesStyleTargetId(series.id);
                    const seriesLabel = this.getSeriesTargetLabel(series, index + 1);
                    return [targetId, getOptions(seriesLabel)];
                })
            ),
        };
    }

    protected buildSeriesItemStyleTargetsWithOptions(
        config: TConfig,
        getOptions: (label: string) => BlockPanelStyleTargetConfig
    ): BlockPanelTargetStyles {
        const seriesItems = config.series.flatMap((series) => series.items || []);
        return {
            [this.getAllSeriesStyleTargetId()]: getOptions('All Series'),
            ...Object.fromEntries(
                seriesItems.map((item, index) => {
                    const targetId = this.getSeriesStyleTargetId(item.id);
                    const seriesLabel = this.getSeriesItemTargetLabel(item, index + 1);
                    return [targetId, getOptions(seriesLabel)];
                })
            ),
        };
    }

    protected buildGridStyleTargets(config: TConfig): BlockPanelTargetStyles {
        return Object.fromEntries(
            config.components.grids.map((grid, index) => {
                const targetId = this.getGridStyleTargetId(grid.id);
                const gridLabel = `Grid ${index + 1}`;
                return [targetId, this.getGridStyleTargetOptions(gridLabel)];
            })
        );
    }

    protected getAxisTargetLabel(prefix: string, axis: ChartBaseAxisConfig, index: number): string {
        const label = axis.label.trim();
        return label ? `${prefix}: ${label}` : `${prefix} ${index}`;
    }

    protected getSeriesTargetLabel(series: ChartSeriesConfig, index: number): string {
        const label = series.name?.trim();
        if (label) {
            return `Series: ${label}`;
        }
        const entityId = series.binding.entityConfig.entityId?.trim();
        if (entityId) {
            return `Series: ${entityId}`;
        }
        return `Series ${index}`;
    }

    protected getSeriesItemTargetLabel(item: ChartSeriesItemConfig, index: number): string {
        const label = item.name?.trim();
        if (label) {
            return `Series: ${label}`;
        }
        const entityId = item.binding.entityConfig.entityId?.trim();
        if (entityId) {
            return `Series: ${entityId}`;
        }
        return `Series ${index}`;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._scheduleChartRefresh(true);
    }

    disconnectedCallback(): void {
        if (this.chartRefreshTimer !== null) {
            window.clearTimeout(this.chartRefreshTimer);
            this.chartRefreshTimer = null;
        }
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
        this.chartInstance?.dispose();
        this.chartInstance = undefined;
        super.disconnectedCallback();
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        this._ensureChartInstance();
        this._scheduleChartRefresh();
    }

    getBlockEntities(): string[] | undefined {
        if (!this.block) {
            return [];
        }
        const config = this.getChartConfig();
        const entities = new Set<string>();

        for (const series of this.getChartSeries(config)) {
            const itemBindings = series.items?.length
                ? series.items.map((item) => item.binding.entityConfig)
                : [series.binding.entityConfig];

            for (const entityConfig of itemBindings) {
                const resolvedEntity = this._resolveEntityId(entityConfig);
                if (resolvedEntity) {
                    entities.add(resolvedEntity);
                }
            }
        }

        return Array.from(entities);
    }

    render() {
        return html`
            <div class="chart-shell">
                <div class="chart-root" data-action-target="block"></div>
                ${this.statusMessage ? html`<div class="placeholder">${this.statusMessage}</div>` : nothing}
            </div>
        `;
    }

    private _resolveEntityId(config: BlockEntityConfig): string | undefined {
        if (!this.block) {
            return undefined;
        }
        if (config.mode === 'fixed') {
            return config.entityId;
        }
        if (config.mode === 'slot') {
            return config.slotId ? this.documentModel.resolveSlotEntity(config.slotId) : undefined;
        }
        return this.documentModel.resolveEntityForBlock(this.block.id).entityId;
    }

    protected _scheduleChartRefresh(immediate: boolean = false): void {
        if (this.chartRefreshTimer !== null) {
            window.clearTimeout(this.chartRefreshTimer);
            this.chartRefreshTimer = null;
        }

        const delay = immediate ? 0 : 180;
        this.chartRefreshTimer = window.setTimeout(() => {
            this.chartRefreshTimer = null;
            void this._refreshChart();
        }, delay);
    }

    protected async _refreshChart(): Promise<void> {
        if (this.refreshInProgress) return;
        if (!this.block || !this.hass || !this.chartInstance) return;

        this.refreshInProgress = true;
        try {
            const config = this.getChartConfig();
            const rawRuntimeData = await loadChartRuntimeData(
                this.hass,
                this.documentModel,
                this.block,
                this.getChartSeries(config)
            );
            const runtimeData = await applyChartUnitConversion(this.hass, config, rawRuntimeData);

            const hasAnySeries = runtimeData.series.some((entry) => this._hasRuntimeSeriesData(entry));
            this.statusMessage = hasAnySeries ? '' : 'No chart data available';

            const baseOption = this.buildChartOption(config, runtimeData);
            let styledOptionApplied = false;

            try {
                applyChartStyleTargetsToOption({
                    config,
                    option: baseOption,
                    getTitleStyle: () => this.getTargetStyle(this.getTitleStyleTargetId()),
                    getLegendStyle: () => this.getTargetStyle(this.getLegendStyleTargetId()),
                    getLegendLabelStyle: () => this.getTargetStyle(this.getLegendLabelStyleTargetId()),
                    getLegendValueStyle: () => this.getTargetStyle(this.getLegendValueStyleTargetId()),
                    getLegendUnitStyle: () => this.getTargetStyle(this.getLegendUnitStyleTargetId()),
                    getTooltipStyle: () => this.getTargetStyle(this.getTooltipStyleTargetId()),
                    getGridStyle: (gridId: string) => this.getTargetStyle(this.getGridStyleTargetId(gridId)),
                    getXAxisStyle: (axisId: string) => this.getTargetStyle(this.getXAxisStyleTargetId(axisId)),
                    getYAxisStyle: (axisId: string) => this.getTargetStyle(this.getYAxisStyleTargetId(axisId)),
                    getAllSeriesStyle: () => this.getTargetStyle(this.getAllSeriesStyleTargetId()),
                    getSeriesStyle: (seriesId: string) => this.getTargetStyle(this.getSeriesStyleTargetId(seriesId)),
                });
                this.chartInstance.setOption(baseOption, {notMerge: true});
                styledOptionApplied = true;
            } catch (styleRenderError) {
                // Style patch errors should not be reported as data loading errors.
                console.warn('[Chart] Style patch could not be applied, rendering base chart option.', styleRenderError);
            }

            if (!styledOptionApplied) {
                this.chartInstance.setOption(this.buildChartOption(config, runtimeData), {notMerge: true});
            }
        } catch (_error) {
            this.statusMessage = 'Unable to load chart data';
        } finally {
            this.refreshInProgress = false;
        }
    }

    protected _ensureChartInstance(): void {
        if (!this.chartRoot) return;

        if (!this.chartInstance) {
            this.chartInstance = echarts.init(this.chartRoot);
            this.resizeObserver = new ResizeObserver(() => {
                this.chartInstance?.resize();
            });
            this.resizeObserver.observe(this.chartRoot);
        }
    }

    private _hasRuntimeSeriesData(series: ResolvedChartSeries): boolean {
        return series.points.length > 0 || Boolean(series.items?.some((item) => item.points.length > 0));
    }
}
