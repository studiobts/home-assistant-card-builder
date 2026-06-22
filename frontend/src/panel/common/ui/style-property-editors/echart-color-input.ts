import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseInput } from './base-input';

type EChartColorMode = 'solid' | 'linear' | 'radial';

interface EChartColorStop {
    offset: number;
    color: string;
}

interface LinearColorConfig {
    type: 'linear';
    x: number;
    y: number;
    x2: number;
    y2: number;
    colorStops: EChartColorStop[];
    global?: boolean;
}

interface RadialColorConfig {
    type: 'radial';
    x: number;
    y: number;
    r: number;
    colorStops: EChartColorStop[];
    global?: boolean;
}

interface ParsedColorValue {
    mode: EChartColorMode;
    solid: string;
    linear: LinearColorConfig;
    radial: RadialColorConfig;
}

const DEFAULT_STOPS: EChartColorStop[] = [
    { offset: 0, color: '#3b82f6' },
    { offset: 1, color: '#22d3ee' },
];

const DEFAULT_LINEAR: LinearColorConfig = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: DEFAULT_STOPS,
    global: false,
};

const DEFAULT_RADIAL: RadialColorConfig = {
    type: 'radial',
    x: 0.5,
    y: 0.5,
    r: 0.5,
    colorStops: DEFAULT_STOPS,
    global: false,
};

@customElement('sm-echart-color-input')
export class SMEchartColorInput extends BaseInput<string> {
    static styles = [
        ...BaseInput.styles,
        css`
            .root {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .row > * {
                flex: 1;
                min-width: 0;
            }

            .field {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .field-label {
                font-size: 10px;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
            }

            .field input,
            .field select {
                width: 100%;
                box-sizing: border-box;
                border: 1px solid var(--border-color, #d4d4d4);
                background: var(--bg-secondary, #f5f5f5);
                color: var(--text-primary, #333);
                border-radius: 3px;
                padding: 5px 8px;
                font-size: 11px;
                outline: none;
            }

            .field input:focus,
            .field select:focus {
                border-color: var(--accent-color, #0078d4);
            }

            .stop-row {
                display: grid;
                grid-template-columns: 1fr 1fr auto;
                gap: 8px;
                align-items: end;
            }

            .remove-btn,
            .add-btn {
                border: 1px solid var(--border-color, #d4d4d4);
                background: var(--bg-secondary, #f5f5f5);
                color: var(--text-primary, #333);
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
                height: 28px;
                padding: 0 10px;
            }

            .remove-btn {
                width: 32px;
                padding: 0;
            }
        `,
    ];

    @property({ type: String }) override value: string = '#3b82f6';

    protected renderInput() {
        const parsed = this.parseValue(this.value);
        const linear = parsed.linear;
        const radial = parsed.radial;
        const active = parsed.mode === 'linear' ? linear : radial;
        const cssValue = parsed.mode === 'linear'
            ? this.toCssGradient('linear', linear)
            : this.toCssGradient('radial', radial);

        return html`
            <div class="root">
                <div class="field">
                    <span class="field-label">Mode</span>
                    <select
                        .value=${parsed.mode}
                        @change=${(e: Event) => this.handleModeChange(parsed, (e.target as HTMLSelectElement).value as EChartColorMode)}
                    >
                        <option value="solid">Solid</option>
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                    </select>
                </div>

                ${parsed.mode === 'solid' ? html`
                    <div class="row">
                        <sm-color-input
                            .value=${parsed.solid}
                            @change=${(e: CustomEvent) => this.handleSolidColorChange(e)}
                        ></sm-color-input>
                    </div>
                ` : html`
                    <div class="field">
                        <span class="field-label">CSS Gradient</span>
                        <input
                            type="text"
                            .value=${cssValue}
                            @change=${(e: Event) => this.handleCssGradientChange(
                                parsed.mode === 'linear' ? 'linear' : 'radial',
                                (e.target as HTMLInputElement).value
                            )}
                        />
                    </div>

                    ${parsed.mode === 'linear' ? html`
                        <div class="row">
                            ${this.renderNumberField('X', linear.x, (next) => this.updateLinear(parsed, { x: next }))}
                            ${this.renderNumberField('Y', linear.y, (next) => this.updateLinear(parsed, { y: next }))}
                            ${this.renderNumberField('X2', linear.x2, (next) => this.updateLinear(parsed, { x2: next }))}
                            ${this.renderNumberField('Y2', linear.y2, (next) => this.updateLinear(parsed, { y2: next }))}
                        </div>
                    ` : html`
                        <div class="row">
                            ${this.renderNumberField('Center X', radial.x, (next) => this.updateRadial(parsed, { x: next }))}
                            ${this.renderNumberField('Center Y', radial.y, (next) => this.updateRadial(parsed, { y: next }))}
                            ${this.renderNumberField('Radius', radial.r, (next) => this.updateRadial(parsed, { r: next }))}
                        </div>
                    `}

                    <div class="field">
                        <span class="field-label">Color Stops</span>
                        ${active.colorStops.map((stop, index) => html`
                            <div class="stop-row">
                                <sm-color-input
                                    .value=${stop.color}
                                    @change=${(e: CustomEvent) => this.handleStopColorChange(parsed, index, e)}
                                ></sm-color-input>
                                ${this.renderStopOffsetField(parsed, index, stop.offset)}
                                <button
                                    type="button"
                                    class="remove-btn"
                                    title="Remove stop"
                                    ?disabled=${active.colorStops.length <= 2}
                                    @click=${() => this.removeStop(parsed, index)}
                                >-</button>
                            </div>
                        `)}
                        <button type="button" class="add-btn" @click=${() => this.addStop(parsed)}>Add Stop</button>
                    </div>
                `}
            </div>
        `;
    }

    private renderNumberField(
        label: string,
        value: number,
        onChange: (value: number) => void,
        options?: { min?: number; max?: number; step?: number }
    ) {
        return html`
            <div class="field">
                <span class="field-label">${label}</span>
                <input
                    type="number"
                    .value=${String(value)}
                    min=${options?.min ?? 0}
                    max=${options?.max ?? 1}
                    step=${options?.step ?? 0.01}
                    @change=${(e: Event) => {
                        const next = Number.parseFloat((e.target as HTMLInputElement).value);
                        if (!Number.isFinite(next)) {
                            return;
                        }
                        onChange(next);
                    }}
                />
            </div>
        `;
    }

    private renderStopOffsetField(parsed: ParsedColorValue, index: number, offset: number) {
        return this.renderNumberField(
            'Offset (%)',
            this.unitToPercent(offset),
            (next) => this.updateStop(parsed, index, { offset: this.percentToUnit(next) }),
            { min: 0, max: 100, step: 1 }
        );
    }

    private parseValue(raw: string | undefined): ParsedColorValue {
        const fallback: ParsedColorValue = {
            mode: 'solid',
            solid: '#3b82f6',
            linear: { ...DEFAULT_LINEAR, colorStops: DEFAULT_STOPS.map((stop) => ({ ...stop })) },
            radial: { ...DEFAULT_RADIAL, colorStops: DEFAULT_STOPS.map((stop) => ({ ...stop })) },
        };

        const value = String(raw || '').trim();
        if (!value) {
            return fallback;
        }

        if (value.startsWith('{') && value.endsWith('}')) {
            try {
                const parsed = JSON.parse(value) as {
                    type?: string;
                    color?: unknown;
                    x?: unknown;
                    y?: unknown;
                    x2?: unknown;
                    y2?: unknown;
                    r?: unknown;
                    colorStops?: unknown;
                    global?: unknown;
                };
                if (parsed.type === 'linear') {
                    fallback.mode = 'linear';
                    fallback.linear = this.normalizeLinear(parsed as Partial<LinearColorConfig>);
                    return fallback;
                }
                if (parsed.type === 'radial') {
                    fallback.mode = 'radial';
                    fallback.radial = this.normalizeRadial(parsed as Partial<RadialColorConfig>);
                    return fallback;
                }
                if (parsed.type === 'solid' && typeof parsed.color === 'string') {
                    fallback.mode = 'solid';
                    fallback.solid = parsed.color || fallback.solid;
                    return fallback;
                }
            } catch (_error) {
            }
        }

        const cssLinear = this.parseCssLinearGradient(value);
        if (cssLinear) {
            fallback.mode = 'linear';
            fallback.linear = cssLinear;
            return fallback;
        }

        const cssRadial = this.parseCssRadialGradient(value);
        if (cssRadial) {
            fallback.mode = 'radial';
            fallback.radial = cssRadial;
            return fallback;
        }

        fallback.mode = 'solid';
        fallback.solid = value;
        return fallback;
    }

    private normalizeStops(raw: unknown): EChartColorStop[] {
        if (!Array.isArray(raw)) {
            return DEFAULT_STOPS.map((stop) => ({ ...stop }));
        }
        const stops = raw
            .map((entry) => {
                const stop = entry as Partial<EChartColorStop>;
                const offset = this.clamp01(Number(stop.offset));
                const color = typeof stop.color === 'string' && stop.color.trim()
                    ? stop.color.trim()
                    : '#3b82f6';
                if (!Number.isFinite(offset)) {
                    return null;
                }
                return { offset, color };
            })
            .filter((entry): entry is EChartColorStop => entry !== null);
        if (stops.length < 2) {
            return DEFAULT_STOPS.map((stop) => ({ ...stop }));
        }
        return stops;
    }

    private normalizeLinear(raw: Partial<LinearColorConfig>): LinearColorConfig {
        return {
            type: 'linear',
            x: this.normalizeUnit(raw.x, DEFAULT_LINEAR.x),
            y: this.normalizeUnit(raw.y, DEFAULT_LINEAR.y),
            x2: this.normalizeUnit(raw.x2, DEFAULT_LINEAR.x2),
            y2: this.normalizeUnit(raw.y2, DEFAULT_LINEAR.y2),
            colorStops: this.normalizeStops(raw.colorStops),
            global: Boolean(raw.global),
        };
    }

    private normalizeRadial(raw: Partial<RadialColorConfig>): RadialColorConfig {
        return {
            type: 'radial',
            x: this.normalizeUnit(raw.x, DEFAULT_RADIAL.x),
            y: this.normalizeUnit(raw.y, DEFAULT_RADIAL.y),
            r: this.normalizeUnit(raw.r, DEFAULT_RADIAL.r),
            colorStops: this.normalizeStops(raw.colorStops),
            global: Boolean(raw.global),
        };
    }

    private normalizeUnit(value: unknown, fallback: number): number {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return fallback;
        }
        return numeric;
    }

    private handleModeChange(parsed: ParsedColorValue, mode: EChartColorMode): void {
        if (mode === 'solid') {
            this.dispatchChange({ value: parsed.solid || '#3b82f6' });
            return;
        }
        const gradient = mode === 'linear' ? parsed.linear : parsed.radial;
        this.dispatchChange({ value: this.serializeGradient(gradient) });
    }

    private handleSolidColorChange(e: CustomEvent): void {
        e.stopPropagation();
        this.dispatchChange({ value: String(e.detail.value || '').trim() || '#3b82f6' });
    }

    private handleStopColorChange(parsed: ParsedColorValue, index: number, e: CustomEvent): void {
        e.stopPropagation();
        this.updateStop(parsed, index, { color: String(e.detail.value || '#3b82f6') });
    }

    private updateLinear(parsed: ParsedColorValue, patch: Partial<LinearColorConfig>): void {
        const next: LinearColorConfig = {
            ...parsed.linear,
            ...patch,
            colorStops: patch.colorStops ?? parsed.linear.colorStops,
        };
        this.dispatchChange({ value: this.serializeGradient(next) });
    }

    private updateRadial(parsed: ParsedColorValue, patch: Partial<RadialColorConfig>): void {
        const next: RadialColorConfig = {
            ...parsed.radial,
            ...patch,
            colorStops: patch.colorStops ?? parsed.radial.colorStops,
        };
        this.dispatchChange({ value: this.serializeGradient(next) });
    }

    private updateStop(parsed: ParsedColorValue, index: number, patch: Partial<EChartColorStop>): void {
        if (parsed.mode === 'solid') {
            return;
        }
        const active = parsed.mode === 'linear' ? parsed.linear : parsed.radial;
        const nextStops = active.colorStops.map((stop, stopIndex) => {
            if (stopIndex !== index) {
                return stop;
            }
            return {
                offset: patch.offset !== undefined ? this.clamp01(patch.offset) : stop.offset,
                color: patch.color ?? stop.color,
            };
        });
        if (parsed.mode === 'linear') {
            this.updateLinear(parsed, { colorStops: nextStops });
            return;
        }
        this.updateRadial(parsed, { colorStops: nextStops });
    }

    private addStop(parsed: ParsedColorValue): void {
        if (parsed.mode === 'solid') {
            return;
        }
        const active = parsed.mode === 'linear' ? parsed.linear : parsed.radial;
        const nextStops = this.distributeStops([
            ...active.colorStops,
            { offset: 1, color: '#ffffff' },
        ]);
        if (parsed.mode === 'linear') {
            this.updateLinear(parsed, { colorStops: nextStops });
            return;
        }
        this.updateRadial(parsed, { colorStops: nextStops });
    }

    private removeStop(parsed: ParsedColorValue, index: number): void {
        if (parsed.mode === 'solid') {
            return;
        }
        const active = parsed.mode === 'linear' ? parsed.linear : parsed.radial;
        if (active.colorStops.length <= 2) {
            return;
        }
        const nextStops = this.distributeStops(active.colorStops.filter((_, stopIndex) => stopIndex !== index));
        if (parsed.mode === 'linear') {
            this.updateLinear(parsed, { colorStops: nextStops });
            return;
        }
        this.updateRadial(parsed, { colorStops: nextStops });
    }

    private serializeGradient(config: LinearColorConfig | RadialColorConfig): string {
        return JSON.stringify({
            ...config,
            colorStops: config.colorStops.map((stop) => ({
                offset: this.clamp01(stop.offset),
                color: String(stop.color || '#3b82f6'),
            })),
        });
    }

    private distributeStops(stops: EChartColorStop[]): EChartColorStop[] {
        if (stops.length <= 1) {
            return stops.map((stop) => ({ ...stop, offset: 0 }));
        }
        const maxIndex = stops.length - 1;
        return stops.map((stop, index) => ({
            ...stop,
            offset: this.roundUnit(index / maxIndex),
        }));
    }

    private unitToPercent(value: number): number {
        return Number((this.clamp01(value) * 100).toFixed(2));
    }

    private percentToUnit(value: number): number {
        return this.clamp01(value / 100);
    }

    private roundUnit(value: number): number {
        return Number(this.clamp01(value).toFixed(4));
    }

    private clamp01(value: number): number {
        if (!Number.isFinite(value)) {
            return 0;
        }
        if (value < 0) return 0;
        if (value > 1) return 1;
        return value;
    }

    private handleCssGradientChange(mode: 'linear' | 'radial', rawCss: string): void {
        const css = rawCss.trim();
        if (!css) {
            return;
        }
        const parsed = mode === 'linear'
            ? this.parseCssLinearGradient(css)
            : this.parseCssRadialGradient(css);
        if (!parsed) {
            return;
        }
        this.dispatchChange({ value: this.serializeGradient(parsed) });
    }

    private toCssGradient(
        mode: 'linear' | 'radial',
        config: LinearColorConfig | RadialColorConfig
    ): string {
        const stops = config.colorStops.map((stop) => `${stop.color} ${Math.round(this.clamp01(stop.offset) * 100)}%`);
        if (mode === 'linear') {
            const linear = config as LinearColorConfig;
            const direction = this.vectorToDirection(linear);
            return `linear-gradient(${direction}, ${stops.join(', ')})`;
        }
        const radial = config as RadialColorConfig;
        const x = Math.round(radial.x * 100);
        const y = Math.round(radial.y * 100);
        return `radial-gradient(circle at ${x}% ${y}%, ${stops.join(', ')})`;
    }

    private parseCssLinearGradient(input: string): LinearColorConfig | null {
        const match = input.match(/^linear-gradient\(([\s\S]+)\)$/i);
        if (!match) {
            return null;
        }
        const tokens = this.splitTopLevelComma(match[1]);
        if (tokens.length < 2) {
            return null;
        }

        const firstToken = tokens[0].trim().toLowerCase();
        let stopsTokens = tokens;
        let vector = { x: 0, y: 0, x2: 1, y2: 0 };
        const hasDirection = firstToken.startsWith('to ') || firstToken.endsWith('deg');
        if (hasDirection) {
            vector = this.directionToVector(tokens[0].trim());
            stopsTokens = tokens.slice(1);
        }
        const stops = this.parseGradientStops(stopsTokens);
        if (stops.length < 2) {
            return null;
        }

        return {
            type: 'linear',
            ...vector,
            colorStops: stops,
            global: false,
        };
    }

    private parseCssRadialGradient(input: string): RadialColorConfig | null {
        const match = input.match(/^radial-gradient\(([\s\S]+)\)$/i);
        if (!match) {
            return null;
        }
        const tokens = this.splitTopLevelComma(match[1]);
        if (tokens.length < 2) {
            return null;
        }

        let descriptor = '';
        let stopTokens = tokens;
        const first = tokens[0].trim().toLowerCase();
        if (first.includes('circle') || first.includes('ellipse') || first.includes('at ')) {
            descriptor = tokens[0].trim().toLowerCase();
            stopTokens = tokens.slice(1);
        }
        const stops = this.parseGradientStops(stopTokens);
        if (stops.length < 2) {
            return null;
        }

        const center = this.parseRadialCenter(descriptor);
        return {
            type: 'radial',
            x: center.x,
            y: center.y,
            r: 0.5,
            colorStops: stops,
            global: false,
        };
    }

    private parseRadialCenter(descriptor: string): { x: number; y: number } {
        if (!descriptor) {
            return { x: 0.5, y: 0.5 };
        }
        const match = descriptor.match(/at\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/i);
        if (!match) {
            return { x: 0.5, y: 0.5 };
        }
        return {
            x: this.clamp01(Number.parseFloat(match[1]) / 100),
            y: this.clamp01(Number.parseFloat(match[2]) / 100),
        };
    }

    private parseGradientStops(tokens: string[]): EChartColorStop[] {
        if (tokens.length === 0) {
            return [];
        }
        const rawStops = tokens.map((token) => this.parseStopToken(token)).filter((item): item is EChartColorStop | { color: string } => item !== null);
        if (rawStops.length === 0) {
            return [];
        }
        const stops: EChartColorStop[] = rawStops.map((item, index) => {
            const hasOffset = 'offset' in item && typeof item.offset === 'number' && Number.isFinite(item.offset);
            if (hasOffset) {
                return { color: item.color, offset: this.clamp01(item.offset) };
            }
            const offset = rawStops.length === 1 ? 0 : index / (rawStops.length - 1);
            return { color: item.color, offset };
        });
        return stops;
    }

    private parseStopToken(token: string): EChartColorStop | { color: string } | null {
        const trimmed = token.trim();
        if (!trimmed) {
            return null;
        }
        const splitIndex = this.findLastTopLevelWhitespace(trimmed);
        if (splitIndex < 0) {
            return { color: trimmed };
        }
        const color = trimmed.slice(0, splitIndex).trim();
        const offsetRaw = trimmed.slice(splitIndex + 1).trim();
        const offset = this.parseOffset(offsetRaw);
        if (offset === null) {
            return { color: trimmed };
        }
        return { color, offset };
    }

    private parseOffset(raw: string): number | null {
        const value = raw.trim().toLowerCase();
        if (!value) return null;
        if (value.endsWith('%')) {
            const percent = Number.parseFloat(value.slice(0, -1));
            if (!Number.isFinite(percent)) {
                return null;
            }
            return this.clamp01(percent / 100);
        }
        const numeric = Number.parseFloat(value);
        if (!Number.isFinite(numeric)) {
            return null;
        }
        return this.clamp01(numeric);
    }

    private findLastTopLevelWhitespace(input: string): number {
        let depth = 0;
        for (let index = input.length - 1; index >= 0; index -= 1) {
            const char = input[index];
            if (char === ')') {
                depth += 1;
                continue;
            }
            if (char === '(') {
                depth = Math.max(0, depth - 1);
                continue;
            }
            if (depth === 0 && /\s/.test(char)) {
                return index;
            }
        }
        return -1;
    }

    private splitTopLevelComma(input: string): string[] {
        const result: string[] = [];
        let depth = 0;
        let start = 0;
        for (let index = 0; index < input.length; index += 1) {
            const char = input[index];
            if (char === '(') {
                depth += 1;
                continue;
            }
            if (char === ')') {
                depth = Math.max(0, depth - 1);
                continue;
            }
            if (char === ',' && depth === 0) {
                result.push(input.slice(start, index).trim());
                start = index + 1;
            }
        }
        result.push(input.slice(start).trim());
        return result.filter(Boolean);
    }

    private directionToVector(direction: string): { x: number; y: number; x2: number; y2: number } {
        const normalized = direction.trim().toLowerCase();
        const map: Record<string, { x: number; y: number; x2: number; y2: number }> = {
            'to right': { x: 0, y: 0, x2: 1, y2: 0 },
            'to left': { x: 1, y: 0, x2: 0, y2: 0 },
            'to bottom': { x: 0, y: 0, x2: 0, y2: 1 },
            'to top': { x: 0, y: 1, x2: 0, y2: 0 },
            'to bottom right': { x: 0, y: 0, x2: 1, y2: 1 },
            'to bottom left': { x: 1, y: 0, x2: 0, y2: 1 },
            'to top right': { x: 0, y: 1, x2: 1, y2: 0 },
            'to top left': { x: 1, y: 1, x2: 0, y2: 0 },
        };
        if (map[normalized]) {
            return map[normalized];
        }
        return { x: 0, y: 0, x2: 1, y2: 0 };
    }

    private vectorToDirection(config: LinearColorConfig): string {
        const variants: Array<{ label: string; x: number; y: number; x2: number; y2: number }> = [
            { label: 'to right', x: 0, y: 0, x2: 1, y2: 0 },
            { label: 'to left', x: 1, y: 0, x2: 0, y2: 0 },
            { label: 'to bottom', x: 0, y: 0, x2: 0, y2: 1 },
            { label: 'to top', x: 0, y: 1, x2: 0, y2: 0 },
            { label: 'to bottom right', x: 0, y: 0, x2: 1, y2: 1 },
            { label: 'to bottom left', x: 1, y: 0, x2: 0, y2: 1 },
            { label: 'to top right', x: 0, y: 1, x2: 1, y2: 0 },
            { label: 'to top left', x: 1, y: 1, x2: 0, y2: 0 },
        ];
        const match = variants.find((variant) =>
            Math.abs(config.x - variant.x) < 0.0001
            && Math.abs(config.y - variant.y) < 0.0001
            && Math.abs(config.x2 - variant.x2) < 0.0001
            && Math.abs(config.y2 - variant.y2) < 0.0001
        );
        return match?.label ?? 'to right';
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sm-echart-color-input': SMEchartColorInput;
    }
}
