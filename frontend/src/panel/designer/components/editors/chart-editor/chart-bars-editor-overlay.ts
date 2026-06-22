import { BaseChartEditorOverlay } from '@/panel/designer/components/editors/chart-editor/base-chart-editor-overlay';
import { buildBarsChartOption } from '@/common/blocks/components/charts/block-chart-bars/bars-chart-options';
import {
    cloneBarsChartConfig,
    createDefaultBarsChartConfig,
    normalizeBarsChartConfig,
    type BarsChartConfig,
    type ChartRuntimeData,
} from '@/common/blocks/components/charts/chart-types';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('chart-bars-editor-overlay')
export class ChartBarsEditorOverlay extends BaseChartEditorOverlay<BarsChartConfig> {
    protected getEditorTitle(): string {
        return 'Bars Chart';
    }

    protected getGroupPrefix(): string {
        return 'chart-bars';
    }

    protected getSpecificSectionLabel(): string {
        return 'Bars';
    }

    protected getDefaultConfig(): BarsChartConfig {
        return createDefaultBarsChartConfig();
    }

    protected normalizeConfig(raw: unknown, maxSeries?: number): BarsChartConfig {
        return normalizeBarsChartConfig(raw, maxSeries);
    }

    protected cloneConfig(config: BarsChartConfig): BarsChartConfig {
        return cloneBarsChartConfig(config);
    }

    protected buildPreviewOption(config: BarsChartConfig, runtimeData: ChartRuntimeData): any {
        return buildBarsChartOption(config, runtimeData);
    }

    protected renderSpecificSection(config: BarsChartConfig) {
        return html`
            <div class="group-body">
                <div class="row inline">
                    <div class="field">
                        <span class="label">Mode</span>
                        <select
                            .value=${config.specific.mode}
                            @change=${(e: Event) => this._updateSpecific('mode', (e.target as HTMLSelectElement).value)}
                        >
                            <option value="grouped">Grouped</option>
                            <option value="stacked">Stacked</option>
                        </select>
                    </div>
                    <div class="field">
                        <span class="label">Bar Width</span>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            .value=${String(config.specific.barWidth)}
                            @input=${(e: Event) => this._updateSpecificNumber('barWidth', e)}
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="field">
                        <span class="label">Border Radius</span>
                        <input
                            type="number"
                            min="0"
                            max="40"
                            .value=${String(config.specific.borderRadius)}
                            @input=${(e: Event) => this._updateSpecificNumber('borderRadius', e)}
                        />
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'chart-bars-editor-overlay': ChartBarsEditorOverlay;
    }
}

