import { loadChartRuntimeData, resolveSeriesTimeRange } from '@/common/blocks/components/charts/chart-data-provider';
import { BaseChart } from '@/common/blocks/components/charts/base-chart';
import { applyChartStyleTargetsToOption } from '@/common/blocks/components/charts/chart-style-adapter';
import { applyChartUnitConversion } from '@/common/blocks/components/charts/chart-unit-conversion';
import { getUnitConversionService } from '@/common/api';
import {
    CHART_HISTORY_AGGREGATIONS,
    CHART_DOWNSAMPLING_STRATEGIES,
    CHART_DOWNSAMPLING_SIZING_MODES,
    CHART_STATISTIC_PERIODS,
    CHART_STATISTIC_TYPES,
    CHART_TIME_TICK_PRESETS,
    CHART_TIME_RANGE_MODES,
    createChartSeries,
    createChartYAxis,
    type BaseChartConfig,
    type ChartBaseAxisConfig,
    type ChartDataMode,
    type ChartHistoryAggregation,
    type ChartRuntimeData,
    type ChartSeriesConfig,
    type ChartSeriesDataSourceConfig,
    type ChartDownsamplingStrategy,
    type ChartDownsamplingSizingMode,
    type ChartDownsamplingWindowUnit,
    type ChartStatisticType,
    type ChartTimeRangeConfig,
    type ChartTimeRangeMode,
    type ChartTimeRangeUnit,
    type ChartTimeTickPreset,
    type ChartXAxisConfig,
    type ChartXAxisTimeRangeSource,
    type ChartYAxisConfig,
} from '@/common/blocks/components/charts/chart-types';
import {
    UNIT_DISPLAY_MODES,
    type UnitConversionSource,
    type UnitDisplayConfig,
    type UnitDisplayMode,
} from '@/common/core/unit-conversion';
import { echarts } from '@/common/blocks/components/charts/echarts-setup';
import {
    getDefaultChartStatisticType,
    loadChartStatisticAvailability,
    type ChartStatisticAvailability,
} from '@/panel/designer/components/editors/chart-editor/chart-statistics-metadata';
import { documentModelContext, type BlockData, type BlockEntityConfig, type DocumentModel, type ResolvedEntityInfo } from '@/common/core/model';
import type { HomeAssistant } from 'custom-card-helpers';
import { consume } from '@lit/context';
import type { EChartsType } from 'echarts';
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import '@/panel/designer/components/editors/entity-config-editor/entity-config-editor';
import '@/panel/designer/components/panels/panel-properties/panel-property-group';

const HISTORY_DOWNSAMPLING_WARNING_THRESHOLD = 1000;
const DOWNSAMPLING_STRATEGY_LABELS: Record<ChartDownsamplingStrategy, string> = {
    'min-max': 'Preserve peaks (min/max)',
    'every-nth': 'Fast sample',
    average: 'Smooth trend (average)',
    none: 'All data (slow)',
};
const DOWNSAMPLING_SIZING_LABELS: Record<ChartDownsamplingSizingMode, string> = {
    'by-points': 'Target point count',
    'by-window': 'Time window',
};

export abstract class BaseChartEditorOverlay<TConfig extends BaseChartConfig & { specific: object }> extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1000;
            pointer-events: none;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .overlay-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.56);
            opacity: 0;
            transition: opacity 0.22s ease;
        }

        :host([open]) .overlay-backdrop {
            opacity: 1;
        }

        .panel {
            position: absolute;
            top: 0;
            left: 100%;
            bottom: 0;
            width: min(96vw, 1680px);
            background: var(--bg-primary, #fff);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
            display: flex;
            flex-direction: column;
            transform: translateX(0);
            transition: transform 0.3s ease;
        }

        :host([open]) .panel {
            transform: translateX(-100%);
        }

        .header {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            border-bottom: 1px solid var(--border-color, #e0e0e0);
            background: var(--bg-secondary, #f8f8f8);
            gap: 12px;
        }

        .title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary, #333);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn {
            border: 1px solid var(--border-color, #d6d6d6);
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .btn.primary {
            border: none;
            background: var(--accent-color, #2196f3);
            color: #fff;
        }
        .btn:disabled {
            opacity: 0.5;
        }

        .content {
            flex: 1;
            min-height: 0;
            display: grid;
            grid-template-columns: 1fr minmax(360px, 440px);
            overflow: hidden;
        }

        .config {
            min-height: 0;
            overflow: auto;
            border-left: 1px solid var(--border-color, #e0e0e0);
            background: var(--bg-secondary, #fafafa);
        }

        .group-body {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: var(--bg-primary, #fff);
        }

        .group-inline-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .inline-alert {
            padding: 8px 10px;
            border: 1px solid #ef9a9a;
            border-radius: 4px;
            background: #ffebee;
            color: #b71c1c;
            font-size: 12px;
            line-height: 1.4;
        }

        property-group {
            display: block;
            overflow: hidden;
            background: white;
        }

        .row {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .row.inline {
            flex-direction: row;
            gap: 8px;
        }

        .row.top-aligned {
            align-items: flex-start;
        }

        .field {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 0;
        }

        .label {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary, #666);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        input,
        select {
            width: 100%;
            box-sizing: border-box;
            padding: 7px 9px;
            border: 1px solid var(--border-color, #d6d6d6);
            border-radius: 4px;
            font-size: 12px;
            color: var(--text-primary, #333);
            background: var(--bg-primary, #fff);
        }

        input[type='checkbox'] {
            width: auto;
            padding: 0;
        }

        input[type='color'] {
            height: 34px;
            padding: 4px;
        }

        .checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-primary, #333);
            min-height: 34px;
        }

        .entity-card {
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: var(--bg-primary, #fff);
        }

        .entity-list {
            display: flex;
            flex-direction: column;
        }

        .entity-list property-group {
            overflow: hidden;
            border: 1px solid #ccc;
            border-bottom-width: 0;
        }
        .entity-list property-group:last-child {
            border-bottom-width: 1px;
        }

        .entity-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .entity-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-primary, #333);
        }

        .preview {
            position: relative;
            min-height: 0;
            padding: 15px;
            background: var(--bg-primary, #fff);
            overflow: auto;
        }

        .preview-stage {
            min-width: 100%;
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-warning {
            position: sticky;
            top: 0;
            z-index: 1;
            width: min(560px, calc(100% - 24px));
            margin: 0 auto 10px;
            padding: 8px 12px;
            border: 1px solid rgba(217, 119, 6, 0.35);
            border-radius: 6px;
            background: rgba(255, 251, 235, 0.96);
            color: #92400e;
            font-size: 12px;
            line-height: 1.4;
            text-align: center;
        }

        .preview-block {
            position: relative;
            box-sizing: border-box;
            flex: 0 0 auto;
            border: 1px solid #eee;
            box-shadow: 0 0 15px -3px rgba(0, 0, 0, 0.15);
        }

        .preview-chart {
            width: 100%;
            height: 100%;
        }

        .preview-placeholder {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: var(--text-secondary, #666);
            pointer-events: none;
        }
    `;

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @property({type: Boolean, reflect: true})
    open = false;

    @property({attribute: false})
    block?: BlockData;

    @property({attribute: false})
    config?: TConfig;

    @property({attribute: false})
    hass?: HomeAssistant;

    @query('.preview-chart')
    previewChart?: HTMLDivElement;

    @state()
    private editingConfig: TConfig = this.getDefaultConfig();

    @state()
    private previewMessage = '';

    @state()
    private entitiesLimitMessage: string | null = null;

    @state()
    private unitOptionsByKey: Record<string, string[]> = {};

    @state()
    private previewBlockStyles: Record<string, string> = {};

    @state()
    private statisticAvailabilityByEntityId: Record<string, ChartStatisticAvailability> = {};

    private chartInstance?: EChartsType;
    private resizeObserver?: ResizeObserver;
    private previewRefreshTimer: number | null = null;
    private previewRefreshInProgress = false;
    private unitOptionRequests = new Set<string>();
    private statisticAvailabilityRequests = new Map<string, Promise<void>>();
    private statisticAvailabilityFailedEntityIds = new Set<string>();

    protected abstract getEditorTitle(): string;

    protected abstract getGroupPrefix(): string;

    protected abstract getSpecificSectionLabel(): string;

    protected abstract getDefaultConfig(): TConfig;

    protected abstract normalizeConfig(raw: unknown, maxSeries?: number): TConfig;

    protected abstract cloneConfig(config: TConfig): TConfig;

    protected abstract buildPreviewOption(config: TConfig, runtimeData: ChartRuntimeData): any;

    protected abstract renderSpecificSection(config: TConfig): unknown;

    protected showAxisSections(): boolean {
        return true;
    }

    protected showSeriesYAxisSelector(): boolean {
        return this.showAxisSections();
    }

    protected getEditableEntities(config: TConfig): ChartSeriesConfig[] {
        return config.series;
    }

    protected updateEditableEntity(
        config: TConfig,
        index: number,
        updater: (entity: ChartSeriesConfig) => ChartSeriesConfig
    ): TConfig {
        return {
            ...config,
            series: config.series.map((entry, currentIndex) => (
                currentIndex === index ? updater(entry) : entry
            )),
        };
    }

    protected addEditableEntity(config: TConfig): TConfig {
        const defaultGridId = config.components.grids[0]?.id;
        const defaultXAxisId = config.components.xAxes[0]?.id;
        const defaultYAxisId = config.components.yAxes[0]?.id;
        return {
            ...config,
            series: [
                ...config.series,
                createChartSeries(config.series.length, {
                    gridId: defaultGridId,
                    xAxisId: defaultXAxisId,
                    yAxisId: defaultYAxisId,
                }),
            ],
        };
    }

    protected removeEditableEntity(config: TConfig, index: number): TConfig {
        return {
            ...config,
            series: config.series.filter((_, currentIndex) => currentIndex !== index),
        };
    }

    private _resolvedMaxSeries(): number | undefined {
        if (!this.block) {
            return undefined;
        }
        const blockEl = this.documentModel.getElement(this.block) as BaseChart<any>;
        const rawValue = blockEl.getMaxSeriesCount();

        if (!Number.isFinite(rawValue)) {
            return 1;
        }
        const value = Math.floor(Number(rawValue));
        return value > 0 ? value : 1;
    }

    updated(changedProps: PropertyValues): void {
        if ((changedProps.has('open') && this.open) || changedProps.has('config') || changedProps.has('block')) {
            const maxSeries = this._resolvedMaxSeries();
            const normalized = this.normalizeConfig(this.config, maxSeries);
            this.editingConfig = this.cloneConfig(normalized);
            this.entitiesLimitMessage = null;
            this.statisticAvailabilityByEntityId = {};
            this.statisticAvailabilityRequests.clear();
            this.statisticAvailabilityFailedEntityIds.clear();
        }

        if (changedProps.has('open')) {
            if (this.open) {
                window.addEventListener('keydown', this._onEscape);
                this._ensurePreviewChart();
            } else {
                window.removeEventListener('keydown', this._onEscape);
                this._disposePreviewChart();
            }
        }

        if (this.open && (changedProps.has('editingConfig') || changedProps.has('block') || changedProps.has('hass'))) {
            this._ensureStatisticAvailabilityForConfig();
            this._validateDataSourcesWithAvailability();
            this._schedulePreviewRefresh();
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this._onEscape);
        this._disposePreviewChart();
    }

    render() {
        if (!this.open) {
            return html``;
        }

        if (!this.block || !this.hass) {
            const title = this.getEditorTitle();
            return html`
                <div class="overlay-backdrop" @click=${this._cancel}></div>
                <div class="panel">
                    <div class="header">
                        <div class="title">${title}</div>
                        <div class="header-actions">
                            <button class="btn" @click=${this._cancel}>Close</button>
                        </div>
                    </div>
                    <div class="preview">
                        <div class="preview-placeholder">Chart editor is not ready</div>
                    </div>
                </div>
            `;
        }

        const config = this.editingConfig;
        const title = this.getEditorTitle();
        const prefix = this.getGroupPrefix();
        const specificLabel = this.getSpecificSectionLabel();
        const xAxis = config.components.xAxes[0];
        const previewWarning = this._getDownsamplingPreviewWarning(config);

        return html`
            <div class="overlay-backdrop" @click=${this._cancel}></div>
            <div class="panel">
                <div class="header">
                    <div class="title">${title}</div>
                    <div class="header-actions">
                        <button class="btn" @click=${this._cancel}>Cancel</button>
                        <button class="btn primary" @click=${this._apply}>Apply</button>
                    </div>
                </div>
                <div class="content">
                    <div class="preview">
                        ${previewWarning ? html`<div class="preview-warning">${previewWarning}</div>` : nothing}
                        <div class="preview-stage">
                            <div class="preview-block" style=${styleMap(this.previewBlockStyles)}>
                                <div class="preview-chart"></div>
                            </div>
                        </div>
                        ${this.previewMessage ? html`<div class="preview-placeholder">${this.previewMessage}</div>` : nothing}
                    </div>
                    <div class="config">
                        <property-group label="Entities" groupId="${prefix}-entities">
                            ${this._renderEntitiesSection(config)}
                        </property-group>
                        <property-group label="General" groupId="${prefix}-general">
                            ${this._renderMainSection(config)}
                        </property-group>
                        <property-group label="${specificLabel}" groupId="${prefix}-specific">
                            ${this.renderSpecificSection(config)}
                        </property-group>
                        ${this.showAxisSections() ? html`
                            <property-group label="X Axis" groupId="${prefix}-axis-x">
                                ${xAxis ? this._renderAxisSection('x', xAxis, 0) : nothing}
                            </property-group>
                            <property-group label="Y Axes" groupId="${prefix}-axis-y">
                                ${this._renderYAxesSection(config)}
                            </property-group>
                        ` : nothing}
                    </div>
                </div>
            </div>
        `;
    }

    private _renderMainSection(config: BaseChartConfig) {
        return html`
            <div class="group-body">
                <div class="row inline">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.title.show}
                            @change=${(e: Event) => this._updateNestedValue('title', 'show', (e.target as HTMLInputElement).checked)}
                        />
                        Show title
                    </label>
                </div>
                ${config.title.show ? html`
                    <div class="row">
                        <div class="field">
                            <span class="label">Title Text</span>
                            <input
                                type="text"
                                .value=${config.title.text}
                                @input=${(e: Event) => this._updateNestedValue('title', 'text', (e.target as HTMLInputElement).value)}
                            />
                        </div>
                    </div>
                    <div class="row">
                        <div class="field">
                            <span class="label">Title Position</span>
                            <select
                                .value=${config.title.position}
                                @change=${(e: Event) => this._updateNestedValue('title', 'position', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="center">Center</option>
                            </select>
                        </div>
                    </div>
                ` : nothing}
                <div class="row inline">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.legend.show}
                            @change=${(e: Event) => this._updateNestedValue('legend', 'show', (e.target as HTMLInputElement).checked)}
                        />
                        Show legend
                    </label>
                    ${config.legend.show ? html`
                        <div class="field">
                            <span class="label">Legend Position</span>
                            <select
                                .value=${config.legend.position}
                                @change=${(e: Event) => this._updateNestedValue('legend', 'position', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div class="field">
                            <span class="label">Legend Orientation</span>
                            <select
                                .value=${config.legend.orientation}
                                @change=${(e: Event) => this._updateNestedValue('legend', 'orientation', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="horizontal">Horizontal</option>
                                <option value="vertical">Vertical</option>
                            </select>
                        </div>
                    ` : nothing}
                </div>
                <div class="row inline">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.tooltip.show}
                            @change=${(e: Event) => this._updateNestedValue('tooltip', 'show', (e.target as HTMLInputElement).checked)}
                        />
                        Show tooltip
                    </label>
                    ${config.tooltip.show ? html`
                        <div class="field">
                            <span class="label">Tooltip Trigger</span>
                            <select
                                .value=${config.tooltip.trigger}
                                @change=${(e: Event) => this._updateNestedValue('tooltip', 'trigger', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="axis">Axis</option>
                                <option value="item">Item</option>
                            </select>
                        </div>
                        <div class="field">
                            <span class="label">Tooltip Decimals</span>
                            <select
                                .value=${String(config.tooltip.decimals)}
                                @change=${(e: Event) => this._updateNestedValue('tooltip', 'decimals', parseInt((e.target as HTMLSelectElement).value, 10))}
                            >
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </select>
                        </div>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    private _renderEntitiesSection(config: TConfig) {
        const entities = this.getEditableEntities(config);
        return html`
            <div class="group-body">
                <div class="group-inline-actions">
                    <span class="label">Series</span>
                    <button class="btn" @click=${this._addEntity}>Add</button>
                </div>
                ${this.entitiesLimitMessage ? html`
                    <div class="inline-alert">${this.entitiesLimitMessage}</div>
                ` : nothing}
                <div class="entity-list">
                    ${entities.map((series, index) => this._renderEntitySection(series, index))}
                </div>
            </div>
        `;
    }

    private _renderYAxesSection(config: TConfig) {
        const canRemove = config.components.yAxes.length > 1;
        const maxYAxes = this.getEditableEntities(config).length;
        const canAdd = config.components.yAxes.length < maxYAxes;
        const prefix = this.getGroupPrefix();
        return html`
            <div class="group-body">
                <div class="group-inline-actions">
                    <span class="label">Axes</span>
                    <button class="btn" ?disabled=${!canAdd} @click=${this._addYAxis}>Add</button>
                </div>
                <div class="entity-list">
                    ${config.components.yAxes.map((axis, index) => html`
                        <property-group
                            .label=${axis.label?.trim() || `Y Axis ${index + 1}`}
                            .groupId=${`${prefix}-y-axis-${axis.id}`}
                        >
                            <div class="group-body">
                                <div class="group-inline-actions">
                                    <span class="label">Axis Options</span>
                                    <button class="btn" ?disabled=${!canRemove} @click=${() => this._removeYAxis(axis.id)}>Remove</button>
                                </div>
                                ${this._renderAxisSection('y', axis, index, false)}
                            </div>
                        </property-group>
                    `)}
                </div>
            </div>
        `;
    }

    private _renderAxisSection(
        axisKey: 'x' | 'y',
        axis: ChartXAxisConfig | ChartYAxisConfig,
        _axisIndex: number,
        withWrapper: boolean = true
    ) {
        const yAxis = axisKey === 'y' ? axis as ChartYAxisConfig : undefined;
        const xAxis = axisKey === 'x' ? axis as ChartXAxisConfig : undefined;
        const isTimeXAxis = Boolean(xAxis && xAxis.type === 'time');
        const content = html`
            <div class="row top-aligned">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        .checked=${axis.enabled}
                        @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'enabled', (e.target as HTMLInputElement).checked)}
                    />
                    Enable axis
                </label>
            </div>
            ${axis.enabled ? html`
                ${axisKey === 'y' && yAxis ? html`
                    <div class="row inline">
                        <div class="field">
                            <span class="label">Position</span>
                            <select
                                .value=${yAxis.position}
                                @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'position', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div class="field">
                            <span class="label">Offset Mode</span>
                            <select
                                .value=${yAxis.offsetMode}
                                @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'offsetMode', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="auto">Auto</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                    </div>
                    ${yAxis.offsetMode === 'manual' ? html`
                        <div class="row">
                            <div class="field">
                                <span class="label">Offset (px)</span>
                                <input
                                    type="number"
                                    step="1"
                                    .value=${String(yAxis.offsetPx)}
                                    @input=${(e: Event) => this._updateAxisNumber(axisKey, axis.id, 'offsetPx', e)}
                                />
                            </div>
                        </div>
                    ` : nothing}
                ` : nothing}
                <div class="row">
                    <div class="field">
                        <span class="label">Axis Label</span>
                        <input
                            type="text"
                            .value=${axis.label}
                            @input=${(e: Event) => this._updateAxis(axisKey, axis.id, 'label', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                </div>
                <div class="row inline top-aligned">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${axis.showLabels}
                            @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'showLabels', (e.target as HTMLInputElement).checked)}
                        />
                        Show values
                    </label>
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${axis.showGridLines}
                            @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'showGridLines', (e.target as HTMLInputElement).checked)}
                        />
                        Show grid lines
                    </label>
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${axis.showAxisLine}
                            @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'showAxisLine', (e.target as HTMLInputElement).checked)}
                        />
                        Show axis line
                    </label>
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${axis.showTicks}
                            @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'showTicks', (e.target as HTMLInputElement).checked)}
                        />
                        Show ticks
                    </label>
                </div>
                ${axisKey === 'y' && yAxis ? this._renderUnitDisplaySection(
                    'Value Unit',
                    yAxis.unit,
                    this._getYAxisUnitSource(yAxis.id),
                    (key, value) => this._updateYAxisUnit(yAxis.id, key, value)
                ) : nothing}
                ${isTimeXAxis && xAxis
                    ? this._renderXAxisTimeRangeSourceSection(xAxis)
                    : this._renderAxisRangeMode(axisKey, axis)}
                <div class="row inline">
                    ${isTimeXAxis && xAxis
                        ? this._renderXAxisTimeTickField(xAxis)
                        : html`
                            <div class="field">
                                <span class="label">Step</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    .value=${axis.step !== undefined ? String(axis.step) : ''}
                                    @input=${(e: Event) => this._updateAxisOptionalNumber(axisKey, axis.id, 'step', e)}
                                />
                            </div>
                        `}
                    ${axisKey === 'y' && axis.showLabels ? html`
                        <div class="field">
                            <span class="label">Decimals</span>
                            <select
                                .value=${String(axis.decimals)}
                                @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'decimals', parseInt((e.target as HTMLSelectElement).value, 10))}
                            >
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </select>
                        </div>
                    ` : nothing}
                    ${typeof axis.step === 'number'
                    && axis.step > 0
                    && !isTimeXAxis
                    && (axis.range.mode === 'data' || axis.range.mode === 'data-offset') ? html`
                        <div class="field">
                            <span class="label">${axisKey === 'x' ? 'Step Alignment (ms)' : 'Step Alignment'}</span>
                            <input
                                type="number"
                                step="0.01"
                                .value=${axis.stepAlignment !== undefined ? String(axis.stepAlignment) : ''}
                                @input=${(e: Event) => this._updateAxisOptionalNumber(axisKey, axis.id, 'stepAlignment', e)}
                            />
                        </div>
                    ` : nothing}
                </div>
                ${!isTimeXAxis && axis.showLabels && axis.range.mode === 'data' ? html`
                    <div class="row">
                        <label class="checkbox">
                            <input
                                type="checkbox"
                                .checked=${axis.hideMinMaxLabels}
                                @change=${(e: Event) => this._updateAxis(axisKey, axis.id, 'hideMinMaxLabels', (e.target as HTMLInputElement).checked)}
                            />
                            Hide min/max labels
                        </label>
                    </div>
                ` : nothing}
                ${!isTimeXAxis && axis.range.mode === 'data-offset' ? html`
                    <div class="row inline">
                        <div class="field">
                            <span class="label">${axisKey === 'x' ? 'Min Offset (ms)' : 'Min Offset'}</span>
                            <input
                                type="number"
                                step="0.1"
                                .value=${String(axis.range.minOffset)}
                                @input=${(e: Event) => this._updateAxisRangeNumber(axisKey, axis.id, 'minOffset', e)}
                            />
                        </div>
                        <div class="field">
                            <span class="label">${axisKey === 'x' ? 'Max Offset (ms)' : 'Max Offset'}</span>
                            <input
                                type="number"
                                step="0.1"
                                .value=${String(axis.range.maxOffset)}
                                @input=${(e: Event) => this._updateAxisRangeNumber(axisKey, axis.id, 'maxOffset', e)}
                            />
                        </div>
                    </div>
                ` : nothing}
                ${!isTimeXAxis && axis.range.mode === 'fixed' ? html`
                    <div class="row inline">
                        <div class="field">
                            <span class="label">${axisKey === 'x' ? 'Fixed Min (ms)' : 'Fixed Min'}</span>
                            <input
                                type="number"
                                step="0.1"
                                .value=${axis.range.min ?? ''}
                                @input=${(e: Event) => this._updateAxisRangeOptionalNumber(axisKey, axis.id, 'min', e)}
                            />
                        </div>
                        <div class="field">
                            <span class="label">${axisKey === 'x' ? 'Fixed Max (ms)' : 'Fixed Max'}</span>
                            <input
                                type="number"
                                step="0.1"
                                .value=${axis.range.max ?? ''}
                                @input=${(e: Event) => this._updateAxisRangeOptionalNumber(axisKey, axis.id, 'max', e)}
                            />
                        </div>
                    </div>
                ` : nothing}
            ` : nothing}
        `;

        return withWrapper ? html`<div class="group-body">${content}</div>` : content;
    }

    private _renderXAxisTimeTickField(axis: ChartXAxisConfig) {
        const selectedValue = axis.timeTick.mode === 'preset' ? axis.timeTick.preset : axis.timeTick.mode;
        return html`
            <div class="field">
                <span class="label">Tick Interval</span>
                <select
                    .value=${selectedValue}
                    @change=${(e: Event) => this._updateXAxisTimeTick(axis.id, (e.target as HTMLSelectElement).value)}
                >
                    <option value="auto">Auto</option>
                    <optgroup label="Seconds">
                        ${CHART_TIME_TICK_PRESETS.filter((preset) => preset.endsWith('second') || preset.endsWith('seconds')).map((preset) => html`
                            <option value=${preset}>${this._formatTimeTickPreset(preset)}</option>
                        `)}
                    </optgroup>
                    <optgroup label="Minutes">
                        ${CHART_TIME_TICK_PRESETS.filter((preset) => preset.endsWith('minute') || preset.endsWith('minutes')).map((preset) => html`
                            <option value=${preset}>${this._formatTimeTickPreset(preset)}</option>
                        `)}
                    </optgroup>
                    <optgroup label="Hours">
                        ${CHART_TIME_TICK_PRESETS.filter((preset) => preset.endsWith('hour') || preset.endsWith('hours')).map((preset) => html`
                            <option value=${preset}>${this._formatTimeTickPreset(preset)}</option>
                        `)}
                    </optgroup>
                    <optgroup label="Days">
                        ${CHART_TIME_TICK_PRESETS.filter((preset) => preset.endsWith('day') || preset.endsWith('days')).map((preset) => html`
                            <option value=${preset}>${this._formatTimeTickPreset(preset)}</option>
                        `)}
                    </optgroup>
                </select>
            </div>
        `;
    }

    private _renderAxisRangeMode(axisKey: 'x' | 'y', axis: ChartXAxisConfig | ChartYAxisConfig) {
        return html`
            <div class="row inline">
                <div class="field">
                    <span class="label">Range Mode</span>
                    <select
                        .value=${axis.range.mode}
                        @change=${(e: Event) => this._updateAxisRange(axisKey, axis.id, 'mode', (e.target as HTMLSelectElement).value)}
                    >
                        <option value="auto">Auto</option>
                        <option value="data">Use Data Min/Max</option>
                        <option value="data-offset">Data + Offset</option>
                        <option value="fixed">Fixed Min/Max</option>
                    </select>
                </div>
            </div>
        `;
    }

    protected renderValueUnitSection(config: UnitDisplayConfig) {
        return this._renderUnitDisplaySection(
            'Value Unit',
            config,
            this._getPieValueUnitSource(),
            (key, value) => this._updateValueUnit(key, value)
        );
    }

    private _renderUnitDisplaySection(
        label: string,
        config: UnitDisplayConfig,
        source: UnitConversionSource,
        onChange: (key: keyof UnitDisplayConfig, value: unknown) => void
    ) {
        const options = this._getConvertibleUnitOptions(source);
        const selectedTargetUnit = config.targetUnit || source.sourceUnit || options[0] || '';
        const unitOptionsKey = source.domain && source.deviceClass ? `${source.domain}|${source.deviceClass}` : '';
        const loadingUnitOptions = Boolean(unitOptionsKey && this.unitOptionsByKey[unitOptionsKey] === undefined);

        return html`
            <div class="row inline top-aligned">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        .checked=${config.showUnit}
                        @change=${(e: Event) => onChange('showUnit', (e.target as HTMLInputElement).checked)}
                    />
                    Show unit
                </label>
                <div class="field">
                    <span class="label">${label}</span>
                    <select
                        .value=${config.mode}
                        @change=${(e: Event) => onChange('mode', (e.target as HTMLSelectElement).value as UnitDisplayMode)}
                    >
                        ${UNIT_DISPLAY_MODES.map((mode) => html`
                            <option value=${mode}>${this._formatUnitDisplayMode(mode)}</option>
                        `)}
                    </select>
                </div>
                ${config.mode === 'target' ? html`
                    <div class="field">
                        <span class="label">Target Unit</span>
                        <select
                            .value=${selectedTargetUnit}
                            ?disabled=${options.length === 0}
                            @change=${(e: Event) => onChange('targetUnit', (e.target as HTMLSelectElement).value)}
                        >
                            ${options.length > 0
                                ? options.map((unit) => html`<option value=${unit}>${unit}</option>`)
                                : html`<option value="">${loadingUnitOptions ? 'Loading units...' : 'No compatible units'}</option>`}
                        </select>
                    </div>
                ` : nothing}
            </div>
            ${config.mode === 'custom' ? html`
                <div class="row inline">
                    <div class="field">
                        <span class="label">Custom Unit</span>
                        <input
                            type="text"
                            .value=${config.customUnit}
                            @input=${(e: Event) => onChange('customUnit', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                    <div class="field">
                        <span class="label">Multiplier</span>
                        <input
                            type="number"
                            step="0.000001"
                            .value=${String(config.customMultiplier)}
                            @input=${(e: Event) => {
                                const value = parseFloat((e.target as HTMLInputElement).value);
                                if (Number.isFinite(value)) {
                                    onChange('customMultiplier', value);
                                }
                            }}
                        />
                    </div>
                </div>
            ` : nothing}
        `;
    }

    private _formatUnitDisplayMode(mode: UnitDisplayMode): string {
        switch (mode) {
            case 'source':
                return 'Source unit';
            case 'target':
                return 'Convert to';
            case 'custom':
                return 'Custom';
        }
    }

    private _getConvertibleUnitOptions(source: UnitConversionSource): string[] {
        if (!source.deviceClass || !source.domain) {
            return source.sourceUnit ? [source.sourceUnit] : [];
        }

        const key = `${source.domain}|${source.deviceClass}`;
        const options = this.unitOptionsByKey[key];
        if (options) {
            return options;
        }

        this._requestConvertibleUnits(source.domain, source.deviceClass, key);
        return source.sourceUnit ? [source.sourceUnit] : [];
    }

    private _requestConvertibleUnits(domain: string, deviceClass: string, key: string): void {
        if (!this.hass || this.unitOptionRequests.has(key)) {
            return;
        }

        this.unitOptionRequests.add(key);
        getUnitConversionService(this.hass).getConvertibleUnits(domain, deviceClass)
            .then((options) => {
                this.unitOptionsByKey = {
                    ...this.unitOptionsByKey,
                    [key]: options,
                };
            })
            .finally(() => {
                this.unitOptionRequests.delete(key);
            });
    }

    private _getYAxisUnitSource(axisId: string): UnitConversionSource {
        const series = this._getSeriesForYAxis(axisId)[0];
        return series ? this._getSeriesUnitSource(series) : {domain: 'sensor'};
    }

    private _getPieValueUnitSource(): UnitConversionSource {
        const series = this.getEditableEntities(this.editingConfig)[0];
        return series ? this._getSeriesUnitSource(series) : {domain: 'sensor'};
    }

    private _getSeriesUnitSource(series: ChartSeriesConfig): UnitConversionSource {
        const resolved = this._resolveEntityInfo(series.binding.entityConfig);
        const entityId = resolved.entityId || series.binding.entityConfig.entityId || '';
        const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
        const sourceUnit = typeof stateObj?.attributes?.unit_of_measurement === 'string'
            ? stateObj.attributes.unit_of_measurement
            : undefined;
        const deviceClass = typeof stateObj?.attributes?.device_class === 'string'
            ? stateObj.attributes.device_class
            : undefined;

        return {
            domain: entityId.split('.')[0] || 'sensor',
            deviceClass,
            sourceUnit,
        };
    }

    private _renderXAxisTimeRangeSourceSection(axis: ChartXAxisConfig) {
        const series = this._getSeriesForXAxis(axis.id);
        return html`
            <div class="row inline">
                <div class="field">
                    <span class="label">Time Range Source</span>
                    <select
                        .value=${axis.timeRangeSource}
                        @change=${(e: Event) => this._updateAxis('x', axis.id, 'timeRangeSource', (e.target as HTMLSelectElement).value as ChartXAxisTimeRangeSource)}
                    >
                        <option value="series-union">All series</option>
                        <option value="first-series">First series</option>
                        <option value="selected-series">Specific series</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>
                ${axis.timeRangeSource === 'selected-series' ? html`
                    <div class="field">
                        <span class="label">Series</span>
                        <select
                            .value=${axis.timeRangeSeriesId || ''}
                            @change=${(e: Event) => this._updateAxis('x', axis.id, 'timeRangeSeriesId', (e.target as HTMLSelectElement).value)}
                        >
                            <option value="">First available</option>
                            ${series.map((entry, index) => html`
                                <option value=${entry.id}>${this._getSeriesSelectLabel(entry, index)}</option>
                            `)}
                        </select>
                    </div>
                ` : nothing}
            </div>
            ${axis.timeRangeSource === 'fixed' ? html`
                <div class="row inline">
                    <div class="field">
                        <span class="label">Start</span>
                        <input
                            type="datetime-local"
                            .value=${axis.fixedStart || ''}
                            @input=${(e: Event) => this._updateAxis('x', axis.id, 'fixedStart', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                    <div class="field">
                        <span class="label">End</span>
                        <input
                            type="datetime-local"
                            .value=${axis.fixedEnd || ''}
                            @input=${(e: Event) => this._updateAxis('x', axis.id, 'fixedEnd', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                </div>
            ` : nothing}
        `;
    }

    private _getSeriesForXAxis(axisId: string): ChartSeriesConfig[] {
        const defaultXAxisId = this.editingConfig.components.xAxes[0]?.id;
        if (!this.editingConfig.capabilities.usesCartesianComponents) {
            return [];
        }
        return this.editingConfig.series.filter((series) => (
            (series.xAxisId || defaultXAxisId) === axisId
        ));
    }

    private _getSeriesForYAxis(axisId: string): ChartSeriesConfig[] {
        const defaultYAxisId = this.editingConfig.components.yAxes[0]?.id;
        if (!this.editingConfig.capabilities.usesCartesianComponents) {
            return [];
        }
        return this.editingConfig.series.filter((series) => (
            (series.yAxisId || defaultYAxisId) === axisId
        ));
    }

    private _getSeriesSelectLabel(series: ChartSeriesConfig, index: number): string {
        const label = series.name?.trim();
        if (label) {
            return label;
        }
        const entityId = series.binding.entityConfig.entityId;
        return entityId || `Series ${index + 1}`;
    }

    private _renderEntitySection(series: ChartSeriesConfig, index: number) {
        const resolvedInfo = this._resolveEntityInfo(series.binding.entityConfig);
        const entityHeaderLabel = this._getEntityGroupLabel(series, index, resolvedInfo);
        const yAxes = this.editingConfig.components.yAxes;
        const prefix = this.getGroupPrefix();

        return html`
            <property-group
                .label=${entityHeaderLabel}
                .groupId=${`${prefix}-series-${series.id}`}
            >
                <div class="group-body">
                    <div class="group-inline-actions">
                    <span class="label">Entity Options</span>
                    <button class="btn" @click=${() => this._removeEntity(index)}>Remove</button>
                </div>
                <div class="row inline">
                    <div class="field">
                        <span class="label">Label</span>
                        <input
                            type="text"
                            .value=${series.name || ''}
                            @input=${(e: Event) => this._updateSeries(index, 'name', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                    <div class="field">
                        <span class="label">Color</span>
                        <input
                            type="color"
                            .value=${series.color || '#3b82f6'}
                            @input=${(e: Event) => this._updateSeries(index, 'color', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                </div>
                ${this.block ? html`
                    <entity-config-editor
                        .block=${this.block}
                        .config=${series.binding.entityConfig}
                        .resolvedInfo=${resolvedInfo}
                        .hass=${this.hass}
                        @config-changed=${(e: CustomEvent<BlockEntityConfig>) => this._updateSeriesBinding(index, 'entityConfig', e.detail)}
                    ></entity-config-editor>
                ` : nothing}
                ${this.showSeriesYAxisSelector() ? html`
                    <div class="row">
                        <div class="field">
                            <span class="label">Y Axis</span>
                            <select
                                .value=${series.yAxisId || yAxes[0]?.id || ''}
                                @change=${(e: Event) => this._updateSeries(index, 'yAxisId', (e.target as HTMLSelectElement).value)}
                            >
                                ${yAxes.map((axis, axisIndex) => html`
                                    <option value=${axis.id}>
                                        ${axis.label?.trim() || `Y Axis ${axisIndex + 1}`}
                                    </option>
                                `)}
                            </select>
                        </div>
                    </div>
                ` : nothing}
                <div class="row inline">
                    <div class="field">
                        <span class="label">Data Type</span>
                        <select
                            .value=${series.binding.dataSource.mode}
                            @change=${(e: Event) => this._updateSeriesDataSource(index, 'mode', (e.target as HTMLSelectElement).value)}
                        >
                            ${this.getAvailableDataModes(series).map((mode) => html`<option value=${mode}>${mode}</option>`)}
                        </select>
                    </div>
                    ${series.binding.dataSource.mode !== 'statistics' ? html`
                        <div class="field">
                            <span class="label">Value Source</span>
                            <select
                                .value=${series.binding.dataSource.valueSource}
                                @change=${(e: Event) => this._updateSeriesDataSource(index, 'valueSource', (e.target as HTMLSelectElement).value)}
                            >
                                <option value="state">State</option>
                                <option value="attribute">Attribute</option>
                            </select>
                        </div>
                    ` : nothing}
                </div>
                ${series.binding.dataSource.mode !== 'statistics' && series.binding.dataSource.valueSource === 'attribute' ? html`
                    <div class="row">
                        <div class="field">
                            <span class="label">Attribute</span>
                            <input
                                type="text"
                                .value=${series.binding.dataSource.attribute || ''}
                                @input=${(e: Event) => this._updateSeriesDataSource(index, 'attribute', (e.target as HTMLInputElement).value)}
                            />
                        </div>
                    </div>
                ` : nothing}
                ${series.binding.dataSource.mode === 'statistics' ? html`
                    <div class="row inline">
                        <div class="field">
                            <span class="label">Period</span>
                            <select
                                .value=${series.binding.dataSource.statisticsPeriod}
                                @change=${(e: Event) => this._updateSeriesDataSource(index, 'statisticsPeriod', (e.target as HTMLSelectElement).value)}
                            >
                                ${CHART_STATISTIC_PERIODS.map((period) => html`<option value=${period}>${period}</option>`)}
                            </select>
                        </div>
                        <div class="field">
                            <span class="label">Statistic</span>
                            <select
                                .value=${series.binding.dataSource.statisticType}
                                @change=${(e: Event) => this._updateSeriesDataSource(index, 'statisticType', (e.target as HTMLSelectElement).value as ChartStatisticType)}
                            >
                                ${this.getAvailableStatisticTypes(series).map((type) => html`<option value=${type}>${type}</option>`)}
                            </select>
                        </div>
                    </div>
                ` : nothing}
                ${series.binding.dataSource.mode === 'history' ? html`
                    <div class="row inline">
                        ${this.shouldShowHistoryAggregation() ? html`
                            <div class="field">
                                <span class="label">Aggregation</span>
                                <select
                                    .value=${series.binding.dataSource.historyAggregation}
                                    @change=${(e: Event) => this._updateSeriesDataSource(index, 'historyAggregation', (e.target as HTMLSelectElement).value as ChartHistoryAggregation)}
                                >
                                    ${this.getAvailableHistoryAggregations().map((aggregation) => html`
                                        <option value=${aggregation}>${this._formatHistoryAggregation(aggregation)}</option>
                                    `)}
                                </select>
                            </div>
                        ` : nothing}
                        <div class="field">
                            <span class="label">Strategy</span>
                            <select
                                .value=${series.binding.dataSource.downsampling.strategy}
                                @change=${(e: Event) => this._updateSeriesDownsamplingStrategy(index, (e.target as HTMLSelectElement).value as ChartDownsamplingStrategy)}
                            >
                                ${CHART_DOWNSAMPLING_STRATEGIES.map((strategy) => html`
                                    <option value=${strategy}>${DOWNSAMPLING_STRATEGY_LABELS[strategy]}</option>
                                `)}
                            </select>
                        </div>
                    </div>
                    ${series.binding.dataSource.downsampling.strategy !== 'none' ? this._renderDownsamplingSizing(index, series.binding.dataSource) : nothing}
                ` : nothing}
                ${this.shouldShowSeriesTimeRange(series.binding.dataSource) ? this._renderSeriesTimeRange(index, series.binding.dataSource) : nothing}
                </div>
            </property-group>
        `;
    }

    private _renderDownsamplingSizing(index: number, dataSource: ChartSeriesDataSourceConfig) {
        const sizing = dataSource.downsampling.sizing;
        return html`
            <div class="row inline">
                <div class="field">
                    <span class="label">Sizing</span>
                    <select
                        .value=${sizing.mode}
                        @change=${(e: Event) => this._updateSeriesDownsamplingSizingMode(index, (e.target as HTMLSelectElement).value as ChartDownsamplingSizingMode)}
                    >
                        ${CHART_DOWNSAMPLING_SIZING_MODES.map((mode) => html`
                            <option value=${mode}>${DOWNSAMPLING_SIZING_LABELS[mode]}</option>
                        `)}
                    </select>
                </div>
                ${sizing.mode === 'by-points' ? html`
                    <div class="field">
                        <span class="label">Target Points</span>
                        <input
                            type="number"
                            min="20"
                            max="5000"
                            .value=${String(sizing.maxPoints)}
                            @input=${(e: Event) => this._updateSeriesDownsamplingPoints(index, parseFloat((e.target as HTMLInputElement).value))}
                        />
                    </div>
                ` : html`
                    <div class="field">
                        <span class="label">Window</span>
                        <input
                            type="number"
                            min="1"
                            .value=${String(sizing.window.value)}
                            @input=${(e: Event) => this._updateSeriesDownsamplingWindowValue(index, parseFloat((e.target as HTMLInputElement).value))}
                        />
                    </div>
                    <div class="field">
                        <span class="label">Unit</span>
                        <select
                            .value=${sizing.window.unit}
                            @change=${(e: Event) => this._updateSeriesDownsamplingWindowUnit(index, (e.target as HTMLSelectElement).value as ChartDownsamplingWindowUnit)}
                        >
                            <option value="minutes">minutes</option>
                            <option value="hours">hours</option>
                            <option value="days">days</option>
                        </select>
                    </div>
                `}
            </div>
        `;
    }

    private _getDownsamplingPreviewWarning(config: TConfig): string | undefined {
        const now = new Date();
        for (const series of this.getEditableEntities(config)) {
            const source = series.binding.dataSource;
            if (source.mode !== 'history') {
                continue;
            }
            if (source.downsampling.strategy === 'none') {
                return 'All raw history points will be rendered. This can be heavy for sensors with many state changes.';
            }
            const sizing = source.downsampling.sizing;
            if (sizing.mode !== 'by-window') {
                continue;
            }
            const range = resolveSeriesTimeRange(source.timeRange, now);
            const windowMs = this._downsamplingWindowMs(sizing.window.value, sizing.window.unit);
            const windows = Math.max(1, Math.ceil((range.queryTo.getTime() - range.queryFrom.getTime()) / windowMs));
            const estimatedPoints = source.downsampling.strategy === 'min-max' ? windows * 2 : windows;
            if (estimatedPoints > HISTORY_DOWNSAMPLING_WARNING_THRESHOLD) {
                return source.downsampling.strategy === 'min-max'
                    ? `This history setting may render up to ${estimatedPoints.toLocaleString()} points because preserve-peaks emits min and max for each window.`
                    : `This history setting may render about ${estimatedPoints.toLocaleString()} points. Increase the window size for better performance.`;
            }
        }
        return undefined;
    }

    private _downsamplingWindowMs(value: number, unit: ChartDownsamplingWindowUnit): number {
        const amount = Math.max(1, value);
        if (unit === 'minutes') {
            return amount * 60 * 1000;
        }
        if (unit === 'hours') {
            return amount * 60 * 60 * 1000;
        }
        return amount * 24 * 60 * 60 * 1000;
    }

    protected getBaseDataModes(): ChartDataMode[] {
        return ['statistics', 'history'];
    }

    protected getAvailableDataModes(series?: ChartSeriesConfig): ChartDataMode[] {
        return this._getAvailableDataModesForSeries(series);
    }

    protected getBaseStatisticTypes(): ChartStatisticType[] {
        return [...CHART_STATISTIC_TYPES];
    }

    protected getAvailableStatisticTypes(series?: ChartSeriesConfig): ChartStatisticType[] {
        return this._getAvailableStatisticTypesForSeries(series);
    }

    protected getAvailableHistoryAggregations(): ChartHistoryAggregation[] {
        return [...CHART_HISTORY_AGGREGATIONS];
    }

    protected shouldShowHistoryAggregation(): boolean {
        return false;
    }

    protected shouldShowSeriesTimeRange(dataSource: ChartSeriesDataSourceConfig): boolean {
        return dataSource.mode !== 'live';
    }

    protected getAvailableTimeRangeModes(dataSource: ChartSeriesDataSourceConfig): ChartTimeRangeMode[] {
        if (dataSource.mode === 'live') {
            return [];
        }

        if (dataSource.mode === 'history') {
            return [...CHART_TIME_RANGE_MODES];
        }

        if (dataSource.statisticsPeriod === 'day' || dataSource.statisticsPeriod === 'week') {
            return ['rolling', 'last-days', 'custom'];
        }

        if (dataSource.statisticsPeriod === 'month') {
            return ['rolling', 'custom'];
        }

        return [...CHART_TIME_RANGE_MODES];
    }

    private _formatHistoryAggregation(aggregation: ChartHistoryAggregation): string {
        switch (aggregation) {
            case 'last':
                return 'Last value';
            case 'max':
                return 'Maximum';
            case 'delta':
                return 'Delta';
        }
    }

    private _renderSeriesTimeRange(index: number, dataSource: ChartSeriesDataSourceConfig) {
        const range = dataSource.timeRange;
        const availableModes = this.getAvailableTimeRangeModes(dataSource);
        return html`
            <div class="row inline">
                <div class="field">
                    <span class="label">Time Range</span>
                    <select
                        .value=${range.mode}
                        @change=${(e: Event) => this._updateSeriesTimeRange(index, 'mode', (e.target as HTMLSelectElement).value)}
                    >
                        ${availableModes.map((mode) => html`
                            <option value=${mode}>${this._formatTimeRangeMode(mode)}</option>
                        `)}
                    </select>
                </div>
                ${range.mode === 'rolling' ? html`
                    <div class="field compact">
                        <span class="label">Amount</span>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            .value=${String(range.amount)}
                            @input=${(e: Event) => this._updateSeriesTimeRangeNumber(index, 'amount', e)}
                        />
                    </div>
                    <div class="field compact">
                        <span class="label">Unit</span>
                        ${this._renderTimeUnitSelect(range.unit, (value) => this._updateSeriesTimeRange(index, 'unit', value))}
                    </div>
                ` : nothing}
                ${range.mode === 'last-days' ? html`
                    <div class="field compact">
                        <span class="label">Days</span>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            .value=${String(range.amount)}
                            @input=${(e: Event) => this._updateSeriesTimeRangeNumber(index, 'amount', e)}
                        />
                    </div>
                ` : nothing}
                ${range.mode === 'calendar-day' ? html`
                    <div class="field">
                        <span class="label">Date</span>
                        <input
                            type="date"
                            .value=${range.date}
                            @input=${(e: Event) => this._updateSeriesTimeRange(index, 'date', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                ` : nothing}
                ${this._supportsFullRangeAxis(range.mode) ? html`
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${range.showFullRange}
                            @change=${(e: Event) => this._updateSeriesTimeRange(index, 'showFullRange', (e.target as HTMLInputElement).checked)}
                        />
                        Show full period axis
                    </label>
                ` : nothing}
            </div>
            ${range.mode === 'custom' ? html`
                <div class="row inline">
                    <div class="field">
                        <span class="label">Start</span>
                        <input
                            type="datetime-local"
                            .value=${range.start}
                            @input=${(e: Event) => this._updateSeriesTimeRange(index, 'start', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                    <div class="field">
                        <span class="label">End</span>
                        <input
                            type="datetime-local"
                            .value=${range.end}
                            @input=${(e: Event) => this._updateSeriesTimeRange(index, 'end', (e.target as HTMLInputElement).value)}
                        />
                    </div>
                </div>
            ` : nothing}
            <div class="row inline">
                <div class="field compact">
                    <span class="label">Previous Offset</span>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        .value=${String(range.offsetAmount)}
                        @input=${(e: Event) => this._updateSeriesTimeRangeNumber(index, 'offsetAmount', e)}
                    />
                </div>
                <div class="field compact">
                    <span class="label">Offset Unit</span>
                    ${this._renderTimeUnitSelect(range.offsetUnit, (value) => this._updateSeriesTimeRange(index, 'offsetUnit', value))}
                </div>
                ${range.offsetAmount !== 0 ? html`
                    <div class="field">
                        <span class="label">Display</span>
                        <select
                            .value=${range.displayMode}
                            @change=${(e: Event) => this._updateSeriesTimeRange(index, 'displayMode', (e.target as HTMLSelectElement).value)}
                        >
                            <option value="aligned">Align for comparison</option>
                            <option value="absolute">Use original time</option>
                        </select>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _renderTimeUnitSelect(value: ChartTimeRangeUnit, onChange: (value: ChartTimeRangeUnit) => void) {
        return html`
            <select
                .value=${value}
                @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value as ChartTimeRangeUnit)}
            >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
            </select>
        `;
    }

    private _supportsFullRangeAxis(mode: string): boolean {
        return mode === 'today' || mode === 'last-days';
    }

    private _formatTimeRangeMode(mode: string): string {
        switch (mode) {
            case 'rolling':
                return 'Last period';
            case 'today':
                return 'Today';
            case 'yesterday':
                return 'Yesterday';
            case 'last-days':
                return 'Last days';
            case 'calendar-day':
                return 'Specific day';
            case 'custom':
                return 'Custom';
            default:
                return mode;
        }
    }

    private _formatTimeTickPreset(preset: ChartTimeTickPreset): string {
        return preset
            .split('-')
            .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    private _getAvailableDataModesForSeries(
        series?: ChartSeriesConfig,
        availability?: ChartStatisticAvailability
    ): ChartDataMode[] {
        const baseModes = this.getBaseDataModes();
        const resolvedAvailability = availability || (series ? this._getStatisticAvailabilityForSeries(series) : undefined);
        if (!resolvedAvailability) {
            return baseModes;
        }

        return resolvedAvailability.hasStatistics
            ? baseModes
            : baseModes.filter((mode) => mode !== 'statistics');
    }

    private _getAvailableStatisticTypesForSeries(
        series?: ChartSeriesConfig,
        availability?: ChartStatisticAvailability
    ): ChartStatisticType[] {
        const baseTypes = this.getBaseStatisticTypes();
        const resolvedAvailability = availability || (series ? this._getStatisticAvailabilityForSeries(series) : undefined);
        if (!resolvedAvailability) {
            return baseTypes;
        }

        return baseTypes.filter((type) => resolvedAvailability.statisticTypes.includes(type));
    }

    private _getStatisticAvailabilityForSeries(series: ChartSeriesConfig): ChartStatisticAvailability | undefined {
        const entityId = this._getResolvedEntityId(series);
        return entityId ? this.statisticAvailabilityByEntityId[entityId] : undefined;
    }

    private _getResolvedEntityId(series: ChartSeriesConfig): string | undefined {
        const resolved = this._resolveEntityInfo(series.binding.entityConfig);
        return resolved.entityId || series.binding.entityConfig.entityId;
    }

    private _ensureStatisticAvailabilityForConfig(): void {
        if (!this.hass) {
            return;
        }

        for (const series of this.getEditableEntities(this.editingConfig)) {
            const entityId = this._getResolvedEntityId(series);
            if (
                !entityId
                || this.statisticAvailabilityByEntityId[entityId]
                || this.statisticAvailabilityRequests.has(entityId)
                || this.statisticAvailabilityFailedEntityIds.has(entityId)
            ) {
                continue;
            }

            const request = loadChartStatisticAvailability(this.hass, entityId)
                .then((availability) => {
                    this.statisticAvailabilityByEntityId = {
                        ...this.statisticAvailabilityByEntityId,
                        [entityId]: availability,
                    };
                    this._validateDataSourcesWithAvailability();
                })
                .catch((error) => {
                    this.statisticAvailabilityFailedEntityIds.add(entityId);
                    console.warn('[Chart] Unable to load statistic metadata', entityId, error);
                })
                .finally(() => {
                    this.statisticAvailabilityRequests.delete(entityId);
                });

            this.statisticAvailabilityRequests.set(entityId, request);
        }
    }

    private _validateDataSourcesWithAvailability(): void {
        let nextConfig = this.editingConfig;
        let changed = false;
        const entities = this.getEditableEntities(nextConfig);

        entities.forEach((series, index) => {
            const availability = this._getStatisticAvailabilityForSeries(series);
            const dataSource = series.binding.dataSource;
            const availableModes = this._getAvailableDataModesForSeries(series, availability);
            const availableStatisticTypes = this._getAvailableStatisticTypesForSeries(series, availability);
            const fallbackMode = this._getFallbackDataMode(availableModes);
            const fallbackStatisticType = this._getFallbackStatisticType(availableStatisticTypes);
            const nextMode = availableModes.includes(dataSource.mode) ? dataSource.mode : fallbackMode;
            const nextStatisticType = fallbackStatisticType && !availableStatisticTypes.includes(dataSource.statisticType)
                ? fallbackStatisticType
                : dataSource.statisticType;
            const dataSourceWithValidatedMode = {
                ...dataSource,
                mode: nextMode,
                statisticType: nextStatisticType,
            };
            const nextTimeRange = this._getValidatedTimeRange(dataSourceWithValidatedMode);

            if (
                nextMode === dataSource.mode
                && nextStatisticType === dataSource.statisticType
                && nextTimeRange === dataSource.timeRange
            ) {
                return;
            }

            changed = true;
            nextConfig = this.updateEditableEntity(nextConfig, index, (entry) => ({
                ...entry,
                binding: {
                    ...entry.binding,
                    dataSource: {
                        ...entry.binding.dataSource,
                        mode: nextMode,
                        statisticType: nextStatisticType,
                        timeRange: nextTimeRange,
                    },
                },
            }));
        });

        if (changed) {
            this.editingConfig = nextConfig;
        }
    }

    private _getFallbackDataMode(availableModes: readonly ChartDataMode[]): ChartDataMode {
        if (availableModes.includes('history')) {
            return 'history';
        }

        return availableModes[0] || 'history';
    }

    private _getFallbackStatisticType(availableStatisticTypes: readonly ChartStatisticType[]): ChartStatisticType | undefined {
        return getDefaultChartStatisticType(availableStatisticTypes);
    }

    private _getValidatedTimeRange(dataSource: ChartSeriesDataSourceConfig): ChartTimeRangeConfig {
        const availableModes = this.getAvailableTimeRangeModes(dataSource);
        if (availableModes.length === 0) {
            return dataSource.timeRange;
        }

        if (availableModes.includes(dataSource.timeRange.mode)) {
            return dataSource.timeRange;
        }

        return {
            ...dataSource.timeRange,
            mode: this._getFallbackTimeRangeMode(dataSource, availableModes),
        };
    }

    private _getFallbackTimeRangeMode(
        dataSource: ChartSeriesDataSourceConfig,
        availableModes: readonly ChartTimeRangeMode[]
    ): ChartTimeRangeMode {
        if (
            dataSource.mode === 'statistics'
            && (dataSource.statisticsPeriod === 'day' || dataSource.statisticsPeriod === 'week')
            && availableModes.includes('last-days')
        ) {
            return 'last-days';
        }

        if (availableModes.includes('rolling')) {
            return 'rolling';
        }

        return availableModes[0] || 'rolling';
    }

    private _resolveEntityInfo(entityConfig: BlockEntityConfig): ResolvedEntityInfo {
        if (!this.block) {
            return {entityId: undefined, source: 'none'};
        }
        if (entityConfig.mode === 'fixed') {
            return {entityId: entityConfig.entityId, source: 'fixed'};
        }
        if (entityConfig.mode === 'slot') {
            return {
                entityId: entityConfig.slotId ? this.documentModel.resolveSlotEntity(entityConfig.slotId) : undefined,
                source: 'slot',
                slotId: entityConfig.slotId,
            };
        }
        return this.documentModel.resolveEntityForBlock(this.block.id);
    }

    private _getEntityGroupLabel(
        series: ChartSeriesConfig,
        index: number,
        resolvedInfo: ResolvedEntityInfo
    ): string {
        const customLabel = series.name?.trim();
        if (customLabel) {
            return customLabel;
        }

        const resolvedEntityId = resolvedInfo.entityId || series.binding.entityConfig.entityId;
        if (!resolvedEntityId) {
            return `Entity ${index + 1}`;
        }

        const friendlyName = this.hass?.states?.[resolvedEntityId]?.attributes?.friendly_name;
        if (typeof friendlyName === 'string' && friendlyName.trim()) {
            return friendlyName;
        }

        return resolvedEntityId;
    }

    private _updateNestedValue(section: 'title' | 'legend' | 'tooltip', key: string, value: unknown): void {
        this.editingConfig = {
            ...this.editingConfig,
            [section]: {
                ...this.editingConfig[section],
                [key]: value,
            },
        };
    }

    private _updateAxis(axisKey: 'x' | 'y', axisId: string, key: string, value: unknown): void {
        if (axisKey === 'x') {
            const xAxes = this.editingConfig.components.xAxes.map((axis) => (
                axis.id === axisId ? {...axis, [key]: value} : axis
            ));
            this.editingConfig = {
                ...this.editingConfig,
                components: {
                    ...this.editingConfig.components,
                    xAxes,
                },
            };
            return;
        }

        const yAxes = this.editingConfig.components.yAxes.map((axis) => (
            axis.id === axisId ? {...axis, [key]: value} : axis
        ));
        this.editingConfig = {
            ...this.editingConfig,
            components: {
                ...this.editingConfig.components,
                yAxes,
            },
        };
    }

    private _updateAxisNumber(axisKey: 'x' | 'y', axisId: string, key: string, event: Event): void {
        const value = parseFloat((event.target as HTMLInputElement).value);
        if (!Number.isFinite(value)) return;
        this._updateAxis(axisKey, axisId, key, value);
    }

    private _updateAxisOptionalNumber(
        axisKey: 'x' | 'y',
        axisId: string,
        key: 'step' | 'stepAlignment',
        event: Event
    ): void {
        const raw = (event.target as HTMLInputElement).value.trim();
        if (!raw) {
            this._updateAxis(axisKey, axisId, key, undefined);
            return;
        }

        const value = parseFloat(raw);
        if (!Number.isFinite(value)) return;
        this._updateAxis(axisKey, axisId, key, value);
    }

    private _updateXAxisTimeTick(axisId: string, value: string): void {
        const preset = CHART_TIME_TICK_PRESETS.includes(value as ChartTimeTickPreset)
            ? value as ChartTimeTickPreset
            : undefined;
        const xAxes = this.editingConfig.components.xAxes.map((axis) => (
            axis.id === axisId
                ? {
                    ...axis,
                    timeTick: {
                        ...axis.timeTick,
                        mode: preset ? 'preset' : 'auto',
                        preset: preset || axis.timeTick.preset,
                    },
                }
                : axis
        ));

        this.editingConfig = {
            ...this.editingConfig,
            components: {
                ...this.editingConfig.components,
                xAxes,
            },
        };
    }

    private _updateAxisRange(
        axisKey: 'x' | 'y',
        axisId: string,
        key: keyof ChartBaseAxisConfig['range'],
        value: unknown
    ): void {
        if (axisKey === 'x') {
            const xAxes = this.editingConfig.components.xAxes.map((axis) => (
                axis.id === axisId
                    ? {
                        ...axis,
                        range: {
                            ...axis.range,
                            [key]: value,
                        },
                    }
                    : axis
            ));
            this.editingConfig = {
                ...this.editingConfig,
                components: {
                    ...this.editingConfig.components,
                    xAxes,
                },
            };
            return;
        }

        const yAxes = this.editingConfig.components.yAxes.map((axis) => (
            axis.id === axisId
                ? {
                    ...axis,
                    range: {
                        ...axis.range,
                        [key]: value,
                    },
                }
                : axis
        ));
        this.editingConfig = {
            ...this.editingConfig,
            components: {
                ...this.editingConfig.components,
                yAxes,
            },
        };
    }

    private _updateAxisRangeNumber(
        axisKey: 'x' | 'y',
        axisId: string,
        key: 'minOffset' | 'maxOffset',
        event: Event
    ): void {
        const value = parseFloat((event.target as HTMLInputElement).value);
        if (!Number.isFinite(value)) return;
        this._updateAxisRange(axisKey, axisId, key, value);
    }

    private _updateAxisRangeOptionalNumber(
        axisKey: 'x' | 'y',
        axisId: string,
        key: 'min' | 'max',
        event: Event
    ): void {
        const raw = (event.target as HTMLInputElement).value.trim();
        if (!raw) {
            this._updateAxisRange(axisKey, axisId, key, undefined);
            return;
        }
        const value = parseFloat(raw);
        if (!Number.isFinite(value)) return;
        this._updateAxisRange(axisKey, axisId, key, value);
    }

    private _updateYAxisUnit(axisId: string, key: keyof UnitDisplayConfig, value: unknown): void {
        const yAxes = this.editingConfig.components.yAxes.map((axis) => (
            axis.id === axisId
                ? {
                    ...axis,
                    unit: {
                        ...axis.unit,
                        [key]: value,
                    },
                }
                : axis
        ));
        this.editingConfig = {
            ...this.editingConfig,
            components: {
                ...this.editingConfig.components,
                yAxes,
            },
        };
    }

    private _updateValueUnit(key: keyof UnitDisplayConfig, value: unknown): void {
        const config = this.editingConfig as TConfig & {valueUnit: UnitDisplayConfig};
        this.editingConfig = {
            ...config,
            valueUnit: {
                ...config.valueUnit,
                [key]: value,
            },
        } as TConfig;
    }

    protected _updateSpecific(key: string, value: unknown): void {
        const specific = {
            ...this.editingConfig.specific,
            [key]: value,
        } as TConfig['specific'];

        this.editingConfig = {
            ...this.editingConfig,
            specific,
        } as TConfig;
    }

    protected _updateSpecificNumber(key: string, event: Event): void {
        const value = parseFloat((event.target as HTMLInputElement).value);
        if (!Number.isFinite(value)) return;
        this._updateSpecific(key, value);
    }

    private _updateSeries(index: number, key: keyof ChartSeriesConfig, value: unknown): void {
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => ({
            ...entry,
            [key]: value,
        }));
    }

    private _updateSeriesBinding(
        index: number,
        key: keyof ChartSeriesConfig['binding'],
        value: unknown
    ): void {
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => ({
            ...entry,
            binding: {
                ...entry.binding,
                [key]: value,
            },
        }));
    }

    private _updateSeriesDataSource(
        index: number,
        key: keyof ChartSeriesConfig['binding']['dataSource'],
        value: unknown
    ): void {
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => ({
            ...entry,
            binding: {
                ...entry.binding,
                dataSource: {
                    ...entry.binding.dataSource,
                    [key]: value,
                },
            },
        }));
    }

    private _updateSeriesDownsamplingStrategy(index: number, strategy: ChartDownsamplingStrategy): void {
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => ({
            ...entry,
            binding: {
                ...entry.binding,
                dataSource: {
                    ...entry.binding.dataSource,
                    downsampling: {
                        ...entry.binding.dataSource.downsampling,
                        strategy,
                    },
                },
            },
        }));
    }

    private _updateSeriesDownsamplingSizingMode(index: number, mode: ChartDownsamplingSizingMode): void {
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => {
            const current = entry.binding.dataSource.downsampling.sizing;
            return {
                ...entry,
                binding: {
                    ...entry.binding,
                    dataSource: {
                        ...entry.binding.dataSource,
                        downsampling: {
                            ...entry.binding.dataSource.downsampling,
                            sizing: mode === 'by-window'
                                ? {
                                    mode,
                                    window: current.mode === 'by-window' ? current.window : {value: 1, unit: 'hours' as const},
                                }
                                : {
                                    mode,
                                    maxPoints: current.mode === 'by-points' ? current.maxPoints : 240,
                                },
                        },
                    },
                },
            };
        });
    }

    private _updateSeriesDownsamplingPoints(index: number, value: number): void {
        if (!Number.isFinite(value)) return;
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => ({
            ...entry,
            binding: {
                ...entry.binding,
                dataSource: {
                    ...entry.binding.dataSource,
                    downsampling: {
                        ...entry.binding.dataSource.downsampling,
                        sizing: {
                            mode: 'by-points',
                            maxPoints: Math.max(1, Math.round(value)),
                        },
                    },
                },
            },
        }));
    }

    private _updateSeriesDownsamplingWindowValue(index: number, value: number): void {
        if (!Number.isFinite(value)) return;
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => {
            const current = entry.binding.dataSource.downsampling.sizing;
            const window = current.mode === 'by-window' ? current.window : {value: 1, unit: 'hours' as const};
            return {
                ...entry,
                binding: {
                    ...entry.binding,
                    dataSource: {
                        ...entry.binding.dataSource,
                        downsampling: {
                            ...entry.binding.dataSource.downsampling,
                            sizing: {
                                mode: 'by-window',
                                window: {
                                    ...window,
                                    value: Math.max(1, Math.round(value)),
                                },
                            },
                        },
                    },
                },
            };
        });
    }

    private _updateSeriesDownsamplingWindowUnit(index: number, unit: ChartDownsamplingWindowUnit): void {
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => {
            const current = entry.binding.dataSource.downsampling.sizing;
            const window = current.mode === 'by-window' ? current.window : {value: 1, unit: 'hours' as const};
            return {
                ...entry,
                binding: {
                    ...entry.binding,
                    dataSource: {
                        ...entry.binding.dataSource,
                        downsampling: {
                            ...entry.binding.dataSource.downsampling,
                            sizing: {
                                mode: 'by-window',
                                window: {
                                    ...window,
                                    unit,
                                },
                            },
                        },
                    },
                },
            };
        });
    }

    private _updateSeriesTimeRange(
        index: number,
        key: keyof ChartTimeRangeConfig,
        value: unknown
    ): void {
        this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => ({
            ...entry,
            binding: {
                ...entry.binding,
                dataSource: {
                    ...entry.binding.dataSource,
                    timeRange: {
                        ...entry.binding.dataSource.timeRange,
                        [key]: value,
                    },
                },
            },
        }));
    }

    private _updateSeriesTimeRangeNumber(
        index: number,
        key: 'amount' | 'offsetAmount',
        event: Event
    ): void {
        const rawValue = parseFloat((event.target as HTMLInputElement).value);
        const value = key === 'offsetAmount' ? Math.max(0, rawValue) : rawValue;
        if (!Number.isFinite(value)) return;
        if (key === 'offsetAmount') {
            const displayMode = value === 0 ? 'absolute' : 'aligned';
            this.editingConfig = this.updateEditableEntity(this.editingConfig, index, (entry) => ({
                ...entry,
                binding: {
                    ...entry.binding,
                    dataSource: {
                        ...entry.binding.dataSource,
                        timeRange: {
                            ...entry.binding.dataSource.timeRange,
                            offsetAmount: value,
                            displayMode,
                        },
                    },
                },
            }));
            return;
        }
        this._updateSeriesTimeRange(index, key, value);
    }

    private _addEntity = (): void => {
        const maxSeries = this._resolvedMaxSeries();
        if (maxSeries !== undefined && this.getEditableEntities(this.editingConfig).length >= maxSeries) {
            this.entitiesLimitMessage = `This block is limited to ${maxSeries} entities. To add more entities, use the Pro version of the integration.`;
            return;
        }
        this.entitiesLimitMessage = null;
        this.editingConfig = this.addEditableEntity(this.editingConfig);
    };

    private _addYAxis = (): void => {
        const maxYAxes = this.getEditableEntities(this.editingConfig).length;
        if (this.editingConfig.components.yAxes.length >= maxYAxes) {
            return;
        }

        const defaultGridId = this.editingConfig.components.grids[0]?.id || '';
        const yAxes = [
            ...this.editingConfig.components.yAxes,
            createChartYAxis(this.editingConfig.components.yAxes.length, {gridId: defaultGridId}),
        ];
        this.editingConfig = {
            ...this.editingConfig,
            components: {
                ...this.editingConfig.components,
                yAxes,
            },
        };
    };

    private _removeYAxis(axisId: string): void {
        if (this.editingConfig.components.yAxes.length <= 1) {
            return;
        }

        const yAxes = this.editingConfig.components.yAxes.filter((axis) => axis.id !== axisId);
        if (yAxes.length === 0) {
            return;
        }

        const fallbackAxisId = yAxes[0].id;
        const series = this.editingConfig.series.map((entry) => (
            entry.yAxisId === axisId ? {...entry, yAxisId: fallbackAxisId} : entry
        ));

        this.editingConfig = {
            ...this.editingConfig,
            series,
            components: {
                ...this.editingConfig.components,
                yAxes,
            },
        };
    }

    private _removeEntity(index: number): void {
        this.editingConfig = this.removeEditableEntity(this.editingConfig, index);
        this.entitiesLimitMessage = null;
    }

    private _schedulePreviewRefresh(): void {
        if (this.previewRefreshTimer !== null) {
            window.clearTimeout(this.previewRefreshTimer);
            this.previewRefreshTimer = null;
        }
        this.previewRefreshTimer = window.setTimeout(() => {
            this.previewRefreshTimer = null;
            void this._refreshPreview();
        }, 120);
    }

    private async _refreshPreview(): Promise<void> {
        if (!this.open || !this.hass || !this.block || !this.chartInstance) {
            return;
        }
        if (this.previewRefreshInProgress) return;

        this.previewRefreshInProgress = true;
        try {
            const config = this.normalizeConfig(this.editingConfig, this._resolvedMaxSeries());
            const blockEl = this._getChartBlockElement();
            this._syncPreviewBlockStyles(blockEl);
            const rawRuntimeData = await loadChartRuntimeData(
                this.hass,
                this.documentModel,
                this.block,
                config.series
            );
            const runtimeData = await applyChartUnitConversion(this.hass, config, rawRuntimeData);
            const hasData = runtimeData.series.some((entry) => (
                entry.points.length > 0 || Boolean(entry.items?.some((item) => item.points.length > 0))
            ));
            this.previewMessage = hasData ? '' : 'No preview data available';
            const option = this.buildPreviewOption(config, runtimeData);
            if (blockEl) {
                try {
                    applyChartStyleTargetsToOption({
                        config,
                        option,
                        getTitleStyle: () => this._getChartTargetStyle(blockEl, 'getTitleStyleTargetId'),
                        getLegendStyle: () => this._getChartTargetStyle(blockEl, 'getLegendStyleTargetId'),
                        getTooltipStyle: () => this._getChartTargetStyle(blockEl, 'getTooltipStyleTargetId'),
                        getGridStyle: (gridId: string) => this._getChartTargetStyle(blockEl, 'getGridStyleTargetId', gridId),
                        getXAxisStyle: (axisId: string) => this._getChartTargetStyle(blockEl, 'getXAxisStyleTargetId', axisId),
                        getYAxisStyle: (axisId: string) => this._getChartTargetStyle(blockEl, 'getYAxisStyleTargetId', axisId),
                        getAllSeriesStyle: () => this._getChartTargetStyle(blockEl, 'getAllSeriesStyleTargetId'),
                        getSeriesStyle: (seriesId: string) => this._getChartTargetStyle(blockEl, 'getSeriesStyleTargetId', seriesId),
                    });
                } catch (_styleError) {
                }
            }
            this.chartInstance.setOption(option, {notMerge: true});
        } catch (_error) {
            this.previewMessage = 'Unable to build preview';
        } finally {
            this.previewRefreshInProgress = false;
        }
    }

    private _ensurePreviewChart(): void {
        if (!this.previewChart) {
            return;
        }
        if (this.chartInstance) {
            return;
        }
        this._syncPreviewBlockStyles(this._getChartBlockElement());
        this.chartInstance = echarts.init(this.previewChart);
        this.resizeObserver = new ResizeObserver(() => this.chartInstance?.resize());
        this.resizeObserver.observe(this.previewChart);
    }

    private _disposePreviewChart(): void {
        if (this.previewRefreshTimer !== null) {
            window.clearTimeout(this.previewRefreshTimer);
            this.previewRefreshTimer = null;
        }
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
        this.chartInstance?.dispose();
        this.chartInstance = undefined;
    }

    private _getChartBlockElement(): (BaseChart<any> & HTMLElement) | null {
        if (!this.block) {
            return null;
        }
        const element = this.documentModel.getElement(this.block);
        return element instanceof HTMLElement ? element as BaseChart<any> & HTMLElement : null;
    }

    private _syncPreviewBlockStyles(blockEl: (BaseChart<any> & HTMLElement) | null): void {
        if (!blockEl) {
            this.previewBlockStyles = {
                width: '100%',
                height: '300px',
            };
            return;
        }

        const rect = blockEl.getBoundingClientRect();
        const resolvedStyles = typeof (blockEl as any).getResolvedContextStyles === 'function'
            ? ((blockEl as any).getResolvedContextStyles() as Record<string, string>)
            : {};

        this.previewBlockStyles = {
            ...resolvedStyles,
            position: 'relative',
            left: 'auto',
            top: 'auto',
            right: 'auto',
            bottom: 'auto',
            transform: 'none',
            margin: '0',
            width: `${Math.max(1, Math.round(rect.width))}px`,
            height: `${Math.max(1, Math.round(rect.height))}px`,
            maxWidth: '100%',
        };
    }

    private _getChartTargetStyle(
        blockEl: BaseChart<any> & HTMLElement,
        targetIdFactoryName: string,
        ...args: string[]
    ): Record<string, string> {
        const targetIdFactory = (blockEl as any)[targetIdFactoryName];
        const getTargetStyle = (blockEl as any).getTargetStyle;

        if (typeof targetIdFactory !== 'function' || typeof getTargetStyle !== 'function') {
            return {};
        }

        const targetId = targetIdFactory.apply(blockEl, args);
        if (!targetId) {
            return {};
        }

        return getTargetStyle.call(blockEl, targetId) || {};
    }

    private _onEscape = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this._cancel();
        }
    };

    private _cancel = (): void => {
        this.dispatchEvent(new CustomEvent('overlay-cancel', {
            bubbles: true,
            composed: true,
        }));
    };

    private _apply = (): void => {
        this.dispatchEvent(new CustomEvent('overlay-apply', {
            detail: {
                config: this.normalizeConfig(this.editingConfig, this._resolvedMaxSeries()),
            },
            bubbles: true,
            composed: true,
        }));
    };
}
