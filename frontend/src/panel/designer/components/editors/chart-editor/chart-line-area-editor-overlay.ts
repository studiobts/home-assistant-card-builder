import { BaseChartEditorOverlay } from '@/panel/designer/components/editors/chart-editor/base-chart-editor-overlay';
import { buildLineAreaChartOption } from '@/common/blocks/components/charts/block-chart-line-area/line-area-chart-options';
import {
    cloneLineAreaChartConfig,
    createDefaultLineAreaChartConfig,
    normalizeLineAreaChartConfig,
    type ChartRuntimeData,
    type LineAreaChartConfig,
} from '@/common/blocks/components/charts/chart-types';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('chart-line-area-editor-overlay')
export class ChartLineAreaEditorOverlay extends BaseChartEditorOverlay<LineAreaChartConfig> {
    protected getEditorTitle(): string {
        return 'Line / Area Chart';
    }

    protected getGroupPrefix(): string {
        return 'chart-line-area';
    }

    protected getSpecificSectionLabel(): string {
        return 'Line / Area';
    }

    protected getDefaultConfig(): LineAreaChartConfig {
        return createDefaultLineAreaChartConfig();
    }

    protected normalizeConfig(raw: unknown, maxSeries?: number): LineAreaChartConfig {
        return normalizeLineAreaChartConfig(raw, maxSeries);
    }

    protected cloneConfig(config: LineAreaChartConfig): LineAreaChartConfig {
        return cloneLineAreaChartConfig(config);
    }

    protected buildPreviewOption(config: LineAreaChartConfig, runtimeData: ChartRuntimeData): any {
        return buildLineAreaChartOption(config, runtimeData);
    }

    protected renderSpecificSection(config: LineAreaChartConfig) {
        return html`
            <div class="group-body">
                <div class="row inline">
                    <div class="field">
                        <span class="label">Mode</span>
                        <select
                            .value=${config.specific.mode}
                            @change=${(e: Event) => this._updateSpecific('mode', (e.target as HTMLSelectElement).value)}
                        >
                            <option value="line">Line</option>
                            <option value="area">Area</option>
                        </select>
                    </div>
                    <div class="field">
                        <span class="label">Line Width</span>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            .value=${String(config.specific.lineWidth)}
                            @input=${(e: Event) => this._updateSpecificNumber('lineWidth', e)}
                        />
                    </div>
                </div>
                <div class="row inline">
                    ${config.specific.mode === 'area' ? html`
                        <div class="field">
                            <span class="label">Area Opacity</span>
                            <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.05"
                                .value=${String(config.specific.areaOpacity)}
                                @input=${(e: Event) => this._updateSpecificNumber('areaOpacity', e)}
                            />
                        </div>
                    ` : null}
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.specific.smooth}
                            @change=${(e: Event) => this._updateSpecific('smooth', (e.target as HTMLInputElement).checked)}
                        />
                        Smooth
                    </label>
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.specific.showPoints}
                            @change=${(e: Event) => this._updateSpecific('showPoints', (e.target as HTMLInputElement).checked)}
                        />
                        Show points
                    </label>
                </div>
                <div class="row">
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            .checked=${config.specific.connectNulls}
                            @change=${(e: Event) => this._updateSpecific('connectNulls', (e.target as HTMLInputElement).checked)}
                        />
                        Connect null values
                    </label>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'chart-line-area-editor-overlay': ChartLineAreaEditorOverlay;
    }
}

