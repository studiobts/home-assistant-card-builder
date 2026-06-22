import { BaseChartEditorOverlay } from '@/panel/designer/components/editors/chart-editor/base-chart-editor-overlay';
import { buildPieDonutChartOption } from '@/common/blocks/components/charts/block-chart-pie-donut/pie-donut-chart-options';
import {
    CHART_TIME_RANGE_MODES,
    createChartSeriesItem,
    clonePieDonutChartConfig,
    createDefaultPieDonutChartConfig,
    normalizePieDonutChartConfig,
    type ChartDataMode,
    type ChartHistoryAggregation,
    type ChartRuntimeData,
    type ChartSeriesConfig,
    type ChartSeriesDataSourceConfig,
    type ChartSeriesItemConfig,
    type ChartTimeRangeMode,
    type PieDonutChartConfig,
} from '@/common/blocks/components/charts/chart-types';
import { html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('chart-pie-donut-editor-overlay')
export class ChartPieDonutEditorOverlay extends BaseChartEditorOverlay<PieDonutChartConfig> {
    protected getEditorTitle(): string {
        return 'Pie / Donut Chart';
    }

    protected getGroupPrefix(): string {
        return 'chart-pie-donut';
    }

    protected getSpecificSectionLabel(): string {
        return 'Pie / Donut';
    }

    protected getDefaultConfig(): PieDonutChartConfig {
        return createDefaultPieDonutChartConfig();
    }

    protected normalizeConfig(raw: unknown, maxSeries?: number): PieDonutChartConfig {
        return normalizePieDonutChartConfig(raw, maxSeries);
    }

    protected cloneConfig(config: PieDonutChartConfig): PieDonutChartConfig {
        return clonePieDonutChartConfig(config);
    }

    protected buildPreviewOption(config: PieDonutChartConfig, runtimeData: ChartRuntimeData): any {
        return buildPieDonutChartOption(config, runtimeData, {
            width: this.previewChart?.clientWidth || 0,
            height: this.previewChart?.clientHeight || 0,
        });
    }

    protected getEditableEntities(config: PieDonutChartConfig): ChartSeriesConfig[] {
        const parentSeries = config.series[0];
        if (!parentSeries) {
            return [];
        }

        return (parentSeries.items || []).map((item) => this._itemToEditableSeries(parentSeries, item));
    }

    protected addEditableEntity(config: PieDonutChartConfig): PieDonutChartConfig {
        const parentSeries = this._getOrCreateParentSeries(config);
        const items = parentSeries.items || [];
        const nextItem = createChartSeriesItem(items.length, {
            valueUnit: config.valueUnit,
            binding: parentSeries.binding,
        });

        return this._replaceParentSeries(config, {
            ...parentSeries,
            items: [...items, nextItem],
        });
    }

    protected updateEditableEntity(
        config: PieDonutChartConfig,
        index: number,
        updater: (entity: ChartSeriesConfig) => ChartSeriesConfig
    ): PieDonutChartConfig {
        const parentSeries = this._getOrCreateParentSeries(config);
        const items = parentSeries.items || [];
        const updatedItems = items.map((item, currentIndex) => {
            if (currentIndex !== index) {
                return item;
            }
            const updated = updater(this._itemToEditableSeries(parentSeries, item));
            return this._editableSeriesToItem(item, updated);
        });

        return this._replaceParentSeries(config, {
            ...parentSeries,
            items: updatedItems,
        });
    }

    protected removeEditableEntity(config: PieDonutChartConfig, index: number): PieDonutChartConfig {
        const parentSeries = this._getOrCreateParentSeries(config);
        return this._replaceParentSeries(config, {
            ...parentSeries,
            items: (parentSeries.items || []).filter((_, currentIndex) => currentIndex !== index),
        });
    }

    protected renderSpecificSection(config: PieDonutChartConfig) {
        return html`
            <div class="group-body">
                <div class="row inline">
                    <div class="field">
                        <span class="label">Mode</span>
                        <select
                            .value=${config.specific.mode}
                            @change=${(e: Event) => this._updateSpecific('mode', (e.target as HTMLSelectElement).value)}
                        >
                            <option value="pie">Pie</option>
                            <option value="donut">Donut</option>
                        </select>
                    </div>
                    <div class="field">
                        <span class="label">Size (%)</span>
                        <input
                            type="number"
                            min="10"
                            max="100"
                            .value=${String(config.specific.outerRadius)}
                            @input=${(e: Event) => this._updateSpecificNumber('outerRadius', e)}
                        />
                    </div>
                    ${config.specific.mode === 'donut' ? html`
                        <div class="field">
                            <span class="label">Inner Radius (%)</span>
                            <input
                                type="number"
                                min="0"
                                max="90"
                                .value=${String(config.specific.innerRadius)}
                                @input=${(e: Event) => this._updateSpecificNumber('innerRadius', e)}
                            />
                        </div>
                    ` : nothing}
                </div>
                <div class="row inline">
                    <div class="field">
                        <span class="label">Center Mode</span>
                        <select
                            .value=${config.specific.centerMode}
                            @change=${(e: Event) => this._updateSpecific('centerMode', (e.target as HTMLSelectElement).value)}
                        >
                            <option value="auto">Auto</option>
                            <option value="manual">Manual</option>
                        </select>
                    </div>
                    ${config.specific.centerMode === 'manual' ? html`
                        <div class="field">
                            <span class="label">X Reference</span>
                            <select
                                .value=${config.specific.centerXReference}
                                @change=${(e: Event) => this._updateSpecific('centerXReference', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div class="field">
                            <span class="label">X Offset (%)</span>
                            <input
                                type="number"
                                min="-100"
                                max="100"
                                .value=${String(config.specific.centerXOffset)}
                                @input=${(e: Event) => this._updateSpecificNumber('centerXOffset', e)}
                            />
                        </div>
                    ` : nothing}
                </div>
                ${config.specific.centerMode === 'manual' ? html`
                    <div class="row inline">
                        <div class="field">
                            <span class="label">Y Reference</span>
                            <select
                                .value=${config.specific.centerYReference}
                                @change=${(e: Event) => this._updateSpecific('centerYReference', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="top">Top</option>
                                <option value="middle">Middle</option>
                                <option value="bottom">Bottom</option>
                            </select>
                        </div>
                        <div class="field">
                            <span class="label">Y Offset (%)</span>
                            <input
                                type="number"
                                min="-100"
                                max="100"
                                .value=${String(config.specific.centerYOffset)}
                                @input=${(e: Event) => this._updateSpecificNumber('centerYOffset', e)}
                            />
                        </div>
                    </div>
                ` : nothing}
                ${config.title.show && config.title.position === 'center' ? html`
                    <div class="row">
                        <div class="field">
                            <span class="label">Title Center Reference</span>
                            <select
                                .value=${config.specific.titleCenterReference}
                                @change=${(e: Event) => this._updateSpecific('titleCenterReference', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="pie">Pie / Donut</option>
                                <option value="block">Block</option>
                            </select>
                        </div>
                    </div>
                ` : nothing}
                <div class="row inline top-aligned">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.specific.showLegendValue}
                            @change=${(e: Event) => this._updateSpecific('showLegendValue', (e.target as HTMLInputElement).checked)}
                        />
                        Show legend value
                    </label>
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.specific.showLabel}
                            @change=${(e: Event) => this._updateSpecific('showLabel', (e.target as HTMLInputElement).checked)}
                        />
                        Show label
                    </label>
                    ${config.specific.showLabel ? html`
                        <label class="checkbox">
                            <input
                                type="checkbox"
                                .checked=${config.specific.showSliceValue}
                                @change=${(e: Event) => this._updateSpecific('showSliceValue', (e.target as HTMLInputElement).checked)}
                            />
                            Show value inside slice
                        </label>
                    ` : nothing}
                </div>
                ${this.renderValueUnitSection(config.valueUnit)}
            </div>
        `;
    }

    protected showAxisSections(): boolean {
        return false;
    }

    protected getBaseDataModes(): ChartDataMode[] {
        return ['live', 'statistics', 'history'];
    }

    protected getAvailableHistoryAggregations(): ChartHistoryAggregation[] {
        return ['last', 'max', 'delta'];
    }

    protected getAvailableTimeRangeModes(dataSource: ChartSeriesDataSourceConfig): ChartTimeRangeMode[] {
        return dataSource.mode === 'live'
            ? []
            : [...CHART_TIME_RANGE_MODES];
    }

    protected shouldShowHistoryAggregation(): boolean {
        return true;
    }

    private _getOrCreateParentSeries(config: PieDonutChartConfig): ChartSeriesConfig {
        return config.series[0] || createDefaultPieDonutChartConfig().series[0];
    }

    private _replaceParentSeries(config: PieDonutChartConfig, parentSeries: ChartSeriesConfig): PieDonutChartConfig {
        return {
            ...config,
            series: [parentSeries],
        };
    }

    private _itemToEditableSeries(parentSeries: ChartSeriesConfig, item: ChartSeriesItemConfig): ChartSeriesConfig {
        return {
            ...parentSeries,
            id: item.id,
            name: item.name,
            color: item.color,
            valueUnit: item.valueUnit || parentSeries.valueUnit,
            binding: item.binding,
            style: parentSeries.style,
            items: undefined,
        };
    }

    private _editableSeriesToItem(item: ChartSeriesItemConfig, series: ChartSeriesConfig): ChartSeriesItemConfig {
        return {
            ...item,
            id: series.id,
            name: series.name,
            color: series.color,
            valueUnit: series.valueUnit,
            binding: series.binding,
        };
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'chart-pie-donut-editor-overlay': ChartPieDonutEditorOverlay;
    }
}
