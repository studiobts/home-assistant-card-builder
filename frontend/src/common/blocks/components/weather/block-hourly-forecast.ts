import { BaseEntity } from '@/common/blocks/components/entities/base-entity';
import type { PropertyTrait } from '@/common/blocks/core/properties';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

const FORECAST_REFRESH_MS = 30 * 60 * 1000;
const MIN_HOURS = 4;
const MAX_HOURS = 24;
const DEFAULT_HOURS = 12;
const DEFAULT_BAR_HEIGHT = 40;
const MIN_BAR_HEIGHT = 10;
const MAX_BAR_HEIGHT = 100;
const MIN_VISIBLE_BAR_HEIGHT = 4;
const DEFAULT_VERTICAL_BAR_WIDTH = 120;
const MIN_VERTICAL_BAR_WIDTH = 24;
const MAX_VERTICAL_BAR_WIDTH = 260;
const MIN_VISIBLE_BAR_WIDTH = 6;
const MIN_HOUR_ITEM_WIDTH = 90;

type ForecastStatus = 'idle' | 'loading' | 'ready' | 'unsupported' | 'empty';
type LayoutDirection = 'horizontal' | 'vertical';
type HorizontalColumnMode = 'auto' | 'fill' | 'custom';
type VerticalBarWidthMode = 'fill' | 'custom';
type TemperatureColorRangeMode = 'forecast' | 'custom';
type ColorRamp = 'none' | 'thermal' | 'blue' | 'amber' | 'teal' | 'custom';
type HueDirection = 'shortest' | 'longest';
type RampInterpolationMode = 'hsl' | 'rgb';

type ForecastSecondaryAttributeKey =
    | 'precipitation_probability'
    | 'precipitation'
    | 'wind_speed'
    | 'wind_bearing'
    | 'humidity'
    | 'dew_point'
    | 'cloud_coverage'
    | 'uv_index'
    | 'pressure'
    | 'apparent_temperature';

interface ForecastEntry {
    datetime?: string;
    condition?: string;
    temperature?: number;
    humidity?: number;
    pressure?: number;
    wind_speed?: number;
    wind_bearing?: number | string;
    precipitation_probability?: number;
    precipitation?: number;
    cloud_coverage?: number;
    uv_index?: number;
    dew_point?: number;
    apparent_temperature?: number;
    [key: string]: unknown;
}

interface ForecastResponseEntry {
    forecast?: ForecastEntry[] | null;
}

type ForecastResponse = Record<string, ForecastResponseEntry | undefined>;

interface ForecastServiceResult {
    response?: ForecastResponse;
}

interface SecondaryAttributeDefinition {
    key: ForecastSecondaryAttributeKey;
    prop: string;
    label: string;
    targetId: string;
    defaultValue: boolean;
}

const SECONDARY_ATTRIBUTES: SecondaryAttributeDefinition[] = [
    {
        key: 'precipitation_probability',
        prop: 'show_precipitation_probability',
        label: 'Precipitation Probability',
        targetId: 'secondary-precipitation-probability',
        defaultValue: true,
    },
    {
        key: 'precipitation',
        prop: 'show_precipitation',
        label: 'Precipitation Amount',
        targetId: 'secondary-precipitation',
        defaultValue: false,
    },
    {
        key: 'wind_speed',
        prop: 'show_wind_speed',
        label: 'Wind Speed',
        targetId: 'secondary-wind-speed',
        defaultValue: true,
    },
    {
        key: 'wind_bearing',
        prop: 'show_wind_bearing',
        label: 'Wind Direction',
        targetId: 'secondary-wind-bearing',
        defaultValue: false,
    },
    {
        key: 'humidity',
        prop: 'show_humidity',
        label: 'Humidity',
        targetId: 'secondary-humidity',
        defaultValue: false,
    },
    {
        key: 'dew_point',
        prop: 'show_dew_point',
        label: 'Dew Point',
        targetId: 'secondary-dew-point',
        defaultValue: false,
    },
    {
        key: 'cloud_coverage',
        prop: 'show_cloud_coverage',
        label: 'Cloud Cover',
        targetId: 'secondary-cloud-coverage',
        defaultValue: false,
    },
    {
        key: 'uv_index',
        prop: 'show_uv_index',
        label: 'UV Index',
        targetId: 'secondary-uv-index',
        defaultValue: false,
    },
    {
        key: 'pressure',
        prop: 'show_pressure',
        label: 'Pressure',
        targetId: 'secondary-pressure',
        defaultValue: false,
    },
    {
        key: 'apparent_temperature',
        prop: 'show_apparent_temperature',
        label: 'Feels Like',
        targetId: 'secondary-apparent-temperature',
        defaultValue: false,
    },
];

const WEATHER_ICONS: Record<string, string> = {
    'clear-night': 'mdi:weather-night',
    cloudy: 'mdi:weather-cloudy',
    exceptional: 'mdi:alert-circle-outline',
    fog: 'mdi:weather-fog',
    hail: 'mdi:weather-hail',
    lightning: 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy',
    partlycloudy: 'mdi:weather-partly-cloudy',
    pouring: 'mdi:weather-pouring',
    rainy: 'mdi:weather-rainy',
    snowy: 'mdi:weather-snowy',
    'snowy-rainy': 'mdi:weather-snowy-rainy',
    sunny: 'mdi:weather-sunny',
    windy: 'mdi:weather-windy',
    'windy-variant': 'mdi:weather-windy-variant',
};

const CONDITION_COLORS: Record<string, string> = {
    'clear-night': '#818cf8',
    cloudy: '#94a3b8',
    exceptional: '#f97316',
    fog: '#a8a29e',
    hail: '#67e8f9',
    lightning: '#a78bfa',
    'lightning-rainy': '#8b5cf6',
    partlycloudy: '#fbbf24',
    pouring: '#0ea5e9',
    rainy: '#38bdf8',
    snowy: '#bae6fd',
    'snowy-rainy': '#7dd3fc',
    sunny: '#f59e0b',
    windy: '#5eead4',
    'windy-variant': '#2dd4bf',
};

const CARDINAL_DIRECTIONS = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
];

const COLOR_RAMPS: Record<Exclude<ColorRamp, 'none' | 'custom'>, {colors: string[]; mode: RampInterpolationMode}> = {
    thermal: {colors: ['#60a5fa', '#f59e0b'], mode: 'rgb'},
    blue: {colors: ['#bfdbfe', '#60a5fa', '#3b82f6'], mode: 'hsl'},
    amber: {colors: ['#fde68a', '#f59e0b', '#d97706'], mode: 'hsl'},
    teal: {colors: ['#99f6e4', '#2dd4bf', '#0d9488'], mode: 'hsl'},
};

const SECONDARY_COLOR_RAMPS: Partial<Record<ForecastSecondaryAttributeKey, Record<string, string[]>>> = {
    humidity: {
        humidity: ['#f59e0b', '#22c55e', '#2563eb'],
        blue: ['#bae6fd', '#0284c7'],
        teal: ['#ccfbf1', '#0f766e'],
    },
    cloud_coverage: {
        cloud: ['#f8fafc', '#cbd5e1', '#64748b'],
        storm: ['#e0f2fe', '#64748b', '#334155'],
        blue: ['#dbeafe', '#1d4ed8'],
    },
    uv_index: {
        uv: ['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'],
        solar: ['#22c55e', '#fde047', '#f97316'],
        alert: ['#84cc16', '#facc15', '#dc2626'],
    },
};

@customElement('block-hourly-forecast')
export class BlockHourlyForecast extends BaseEntity {
    static styles = [
        ...BaseEntity.styles,
        css`
            :host {
                display: block;
                min-width: 1px;
                min-height: 1px;
                overflow: hidden;
                padding: 0;
                font-size: 16px;
                --fc-bg: var(--ha-card-background, var(--card-background-color, transparent));
                --fc-text: var(--primary-text-color, #1f2937);
                --fc-text-secondary: var(--secondary-text-color, #64748b);
                --fc-text-muted: var(--disabled-text-color, #94a3b8);
                --fc-border: var(--divider-color, rgba(148, 163, 184, 0.28));
                --fc-accent: var(--accent-color, #03a9f4);
                --fc-rain: #38bdf8;
                --fc-auto-column-min-width: 50px;
                --fc-auto-column-max-width: none;
                --fc-custom-column-width: 52px;
                --fc-vertical-time-column-width: max-content;
                --fc-vertical-icon-column-width: max-content;
                --fc-vertical-temp-column-width: max-content;
                --fc-vertical-bar-column-width: minmax(0, 1fr);
                --fc-vertical-secondary-columns: max-content;
                --fc-vertical-bar-width: 120px;
            }

            .forecast-card {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                min-width: 0;
                box-sizing: border-box;
                overflow: hidden;
                gap: 8px;
                padding: 10px;
                background: var(--fc-bg);
                color: var(--fc-text);
            }

            .header {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                flex: 0 0 auto;
                color: var(--fc-text-secondary);
                font-size: 0.857em;
                font-weight: 500;
            }

            .title {
                display: inline-flex;
                align-items: center;
                font-size: 1.2em;
                gap: 5px;
                min-width: 0;
                flex: 1 1 auto;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .title ha-icon {
                --mdc-icon-size: 1.167em;
                flex: 0 0 auto;
            }

            .rain-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                flex: 0 0 auto;
                max-width: 45%;
                box-sizing: border-box;
                padding: 3px 7px;
                border-radius: 999px;
                background: color-mix(in srgb, var(--fc-rain) 18%, transparent);
                color: var(--fc-rain);
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 1em;
                line-height: 1.2;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .rain-badge ha-icon {
                --mdc-icon-size: 1.2em;
                flex: 0 0 auto;
            }

            .range {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                flex: 0 0 auto;
                color: var(--fc-text-muted);
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 1.2em;
                line-height: 1.2;
                white-space: nowrap;
            }

            .range-part {
                display: inline-flex;
                align-items: center;
                gap: 2px;
            }

            .range-part ha-icon {
                --mdc-icon-size: 1.1em;
            }

            .strip {
                display: flex;
                flex: 1 1 auto;
                width: 100%;
                min-width: 0;
                max-width: 100%;
                min-height: 0;
                gap: 4px;
                overflow: auto;
                scrollbar-width: none;
            }

            .strip::-webkit-scrollbar {
                display: none;
            }

            .strip.horizontal {
                flex-direction: row;
                overflow-x: auto;
                overflow-y: hidden;
                scroll-snap-type: x mandatory;
                padding-bottom: 1px;
            }

            .strip.horizontal.auto,
            .strip.horizontal.custom {
                scrollbar-width: thin;
                scrollbar-color: var(--fc-border) transparent;
            }

            .strip.horizontal.auto::-webkit-scrollbar,
            .strip.horizontal.custom::-webkit-scrollbar {
                display: block;
                height: 6px;
            }

            .strip.horizontal.auto::-webkit-scrollbar-thumb,
            .strip.horizontal.custom::-webkit-scrollbar-thumb {
                border-radius: 999px;
                background: var(--fc-border);
            }

            .strip.horizontal.auto::-webkit-scrollbar-track,
            .strip.horizontal.custom::-webkit-scrollbar-track {
                background: transparent;
            }

            .strip.horizontal.fill {
                overflow-x: hidden;
                scroll-snap-type: none;
            }

            .strip.vertical {
                display: grid;
                grid-template-columns:
                    var(--fc-vertical-time-column-width)
                    var(--fc-vertical-icon-column-width)
                    var(--fc-vertical-temp-column-width)
                    var(--fc-vertical-bar-column-width)
                    var(--fc-vertical-secondary-columns);
                grid-auto-rows: minmax(38px, auto);
                gap: 4px 8px;
                align-items: stretch;
                overflow-x: hidden;
                overflow-y: auto;
                scroll-snap-type: y proximity;
                padding-right: 1px;
            }

            .hour {
                position: relative;
                display: flex;
                box-sizing: border-box;
                border: 1px solid transparent;
                border-radius: 7px;
                color: var(--fc-text-secondary);
                scroll-snap-align: start;
            }

            .horizontal .hour {
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 8px;
                padding: 6px 4px;
                text-align: center;
            }

            .horizontal.auto .hour {
                flex: 1 0 var(--fc-auto-column-min-width);
                width: auto;
                min-width: var(--fc-auto-column-min-width);
                max-width: var(--fc-auto-column-max-width);
            }

            .horizontal.fill .hour {
                flex: 1 1 0;
                width: auto;
                min-width: 0;
                max-width: none;
            }

            .horizontal.custom .hour {
                flex: 0 0 var(--fc-custom-column-width);
                width: var(--fc-custom-column-width);
                min-width: 0;
                max-width: none;
            }

            .vertical .hour {
                display: grid;
                grid-column: 1 / -1;
                grid-template-columns: subgrid;
                width: 100%;
                min-height: 38px;
                align-items: center;
                column-gap: inherit;
                padding: 6px 8px;
                text-align: left;
                scroll-snap-align: start;
            }

            .strip.vertical.no-icons {
                --fc-vertical-icon-column-width: 0;
            }

            .strip.vertical.no-temperature {
                --fc-vertical-temp-column-width: 0;
            }

            .strip.vertical.no-bars {
                --fc-vertical-bar-column-width: 0;
            }

            .strip.vertical.no-secondary {
                --fc-vertical-secondary-columns: 0;
            }

            .strip.vertical.custom-bars {
                --fc-vertical-bar-column-width: var(--fc-vertical-bar-width);
            }

            .hour.now {
                border-color: color-mix(in srgb, var(--fc-accent) 55%, transparent);
                background: color-mix(in srgb, var(--fc-accent) 8%, transparent);
            }

            .horizontal .hour.day-separator {
                border-left-color: color-mix(in srgb, var(--fc-border) 72%, transparent);
                border-left-style: dashed;
            }

            .vertical .hour.day-separator {
                border-top-color: color-mix(in srgb, var(--fc-border) 72%, transparent);
                border-top-style: dashed;
            }

            .time {
                display: flex;
                align-items: flex-end;
                gap: 2px;
                max-width: 100%;
                overflow: hidden;
                color: var(--fc-text-muted);
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 1em;
                line-height: 1.2;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .now .time {
                color: var(--fc-accent);
                font-weight: 600;
            }

            .condition-icon {
                --mdc-icon-size: 1.2em;
                flex: 0 0 auto;
            }

            .temperature {
                max-width: 100%;
                overflow: hidden;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 1em;
                font-weight: 650;
                line-height: 1.15;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .thermal-bar-wrap {
                display: flex;
                align-items: flex-end;
                justify-content: center;
                width: 100%;
                height: var(--fc-thermal-bar-height, 24px);
            }

            .vertical .thermal-bar-wrap {
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                min-width: 0;
                height: 8px;
            }

            .thermal-bar {
                display: block;
                width: 3px;
                min-height: 4px;
                border-radius: 999px;
            }

            .vertical .thermal-bar {
                width: var(--fc-thermal-bar-width, 50%);
                height: 3px;
                min-width: 4px;
                min-height: 3px;
            }

            .secondary {
                text-align: center;
                max-width: 100%;
                overflow: hidden;
                color: var(--fc-text-muted);
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 0.85em;
                font-weight: 400;
                line-height: 1.5;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .vertical .secondary {
                text-align: left;
            }

            .secondary ha-icon {
                --mdc-icon-size: 1.112em;
                flex: 0 0 auto;
            }

            .secondary-content {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 2px;
                max-width: 100%;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .vertical .secondary-content {
                justify-content: flex-start;
            }

            .secondary-stack {
                display: flex;
                flex-direction: column;
                gap: 2px;
                max-width: 100%;
                min-width: 0;
            }

            .vertical .time {
                grid-column: 1;
            }

            .vertical .condition-icon {
                grid-column: 2;
                justify-self: center;
            }

            .vertical .temperature {
                grid-column: 3;
            }

            .vertical .thermal-bar-wrap {
                grid-column: 4;
            }

            .vertical-secondary-cell {
                min-width: 0;
                align-self: center;
            }

            .wind-row {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                gap: 1px;
                max-width: 100%;
                min-width: 0;
            }

            .vertical .wind-row {
                align-items: flex-start;
            }

            .wind-main {
                display: inline-flex;
                align-items: center;
                gap: 2px;
                max-width: 100%;
                min-width: 0;
            }

            .placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                min-height: 56px;
                box-sizing: border-box;
                padding: 10px;
                border: 1px dashed var(--fc-border);
                border-radius: 8px;
                color: var(--fc-text-secondary);
                font-size: 0.857em;
                text-align: center;
            }
        `,
    ];

    @state() private forecast: ForecastEntry[] = [];
    @state() private forecastStatus: ForecastStatus = 'idle';
    @state() private availableAttributeKeys = new Set<ForecastSecondaryAttributeKey>();

    private refreshTimerId: number | null = null;
    private requestSequence = 0;
    private loadingKey = '';
    private loadedKey = '';
    private forecastEntityId = '';
    private availableAttributeSignature = '';

    static getBlockConfig(): BlockRegistration {
        return {
            sinceVersion: '2.3.0',
            definition: {
                label: 'Hourly Forecast',
                icon: '<ha-icon icon="mdi:clock-outline"></ha-icon>',
                category: 'weather',
            },
            defaults: {
                requireEntity: true,
                props: {
                    hours: {value: DEFAULT_HOURS},
                    layout_direction: {value: 'horizontal'},
                    horizontal_column_mode: {value: 'auto'},
                    auto_column_min_width: {value: MIN_HOUR_ITEM_WIDTH},
                    auto_column_max_width: {value: ''},
                    custom_column_width: {value: '52px'},
                    show_now_indicator: {value: true},
                    show_day_separator: {value: true},
                    show_condition_icons: {value: true},
                    show_temperature: {value: true},
                    show_temperature_unit: {value: true},
                    show_thermal_bars: {value: true},
                    bar_height: {value: DEFAULT_BAR_HEIGHT},
                    vertical_bar_width_mode: {value: 'fill'},
                    vertical_bar_width: {value: DEFAULT_VERTICAL_BAR_WIDTH},
                    show_rain_badge: {value: true},
                    rain_threshold: {value: 0},
                    color_ramp: {value: 'thermal'},
                    temperature_color_range_mode: {value: 'forecast'},
                    temperature_color_min: {value: 0},
                    temperature_color_max: {value: 40},
                    color_cold: {value: '#60a5fa'},
                    color_warm: {value: '#f59e0b'},
                    color_ramp_interpolation: {value: 'rgb'},
                    color_ramp_reverse_hue: {value: false},
                    humidity_color_ramp: {value: 'humidity'},
                    humidity_color_low: {value: '#f59e0b'},
                    humidity_color_high: {value: '#2563eb'},
                    cloud_coverage_color_ramp: {value: 'cloud'},
                    cloud_coverage_color_low: {value: '#f8fafc'},
                    cloud_coverage_color_high: {value: '#64748b'},
                    uv_index_color_ramp: {value: 'uv'},
                    uv_index_color_low: {value: '#22c55e'},
                    uv_index_color_high: {value: '#8b5cf6'},
                    show_precipitation_probability: {value: true},
                    show_precipitation: {value: false},
                    show_wind_speed: {value: true},
                    show_wind_bearing: {value: false},
                    show_humidity: {value: false},
                    show_dew_point: {value: false},
                    show_cloud_coverage: {value: false},
                    show_uv_index: {value: false},
                    show_pressure: {value: false},
                    show_apparent_temperature: {value: false},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
            actionTargets: {
                header: {label: 'Header', description: 'Forecast header'},
                strip: {label: 'Forecast Strip', description: 'Scrollable forecast area'},
                hour: {label: 'Hour', description: 'Hourly forecast item'},
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        const temperatureColorVisible = {
            or: [
                {
                    prop: 'show_temperature',
                    eq: true,
                },
                {
                    prop: 'show_thermal_bars',
                    eq: true,
                },
            ],
        };
        const temperatureColorRampVisible = {
            and: [
                temperatureColorVisible,
                {
                    prop: 'color_ramp',
                    neq: 'none',
                },
            ],
        };
        const customTemperatureColorRangeVisible = {
            and: [
                temperatureColorRampVisible,
                {
                    prop: 'temperature_color_range_mode',
                    eq: 'custom',
                },
            ],
        };
        const groups = [
            {
                id: 'general',
                label: 'General',
                traits: [
                    {
                        type: 'slider',
                        name: 'hours',
                        label: 'Hours',
                        min: MIN_HOURS,
                        max: MAX_HOURS,
                        step: 1,
                        binding: {
                            type: 'slider',
                            min: MIN_HOURS,
                            max: MAX_HOURS,
                            step: 1,
                        },
                    },
                ] as PropertyTrait[],
            },
            {
                id: 'appearance',
                label: 'Appearance',
                traits: [
                    {
                        type: 'select',
                        name: 'layout_direction',
                        label: 'Layout',
                        options: [
                            {value: 'horizontal', label: 'Horizontal'},
                            {value: 'vertical', label: 'Vertical'},
                        ],
                    },
                    {
                        type: 'select',
                        name: 'horizontal_column_mode',
                        label: 'Horizontal Columns',
                        options: [
                            {value: 'auto', label: 'Auto'},
                            {value: 'fill', label: 'Fill'},
                            {value: 'custom', label: 'Custom'},
                        ],
                        visible: {
                            prop: 'layout_direction',
                            eq: 'horizontal',
                        },
                    },
                    {
                        type: 'number',
                        name: 'auto_column_min_width',
                        label: 'Column Min Width (px)',
                        min: 1,
                        step: 1,
                        visible: {
                            and: [
                                {
                                    prop: 'layout_direction',
                                    eq: 'horizontal',
                                },
                                {
                                    prop: 'horizontal_column_mode',
                                    eq: 'auto',
                                },
                            ],
                        },
                    },
                    {
                        type: 'text',
                        name: 'auto_column_max_width',
                        label: 'Column Max Width',
                        placeholder: 'Optional, e.g. 90px',
                        visible: {
                            and: [
                                {
                                    prop: 'layout_direction',
                                    eq: 'horizontal',
                                },
                                {
                                    prop: 'horizontal_column_mode',
                                    eq: 'auto',
                                },
                            ],
                        },
                    },
                    {
                        type: 'text',
                        name: 'custom_column_width',
                        label: 'Column Width',
                        placeholder: '52px or 16%',
                        visible: {
                            and: [
                                {
                                    prop: 'layout_direction',
                                    eq: 'horizontal',
                                },
                                {
                                    prop: 'horizontal_column_mode',
                                    eq: 'custom',
                                },
                            ],
                        },
                    },
                    {
                        type: 'checkbox',
                        name: 'show_now_indicator',
                        label: 'Show Now Indicator',
                    },
                    {
                        type: 'checkbox',
                        name: 'show_day_separator',
                        label: 'Show Day Separator',
                    },
                    {
                        type: 'checkbox',
                        name: 'show_condition_icons',
                        label: 'Show Condition Icons',
                    },
                    {
                        type: 'checkbox',
                        name: 'show_temperature',
                        label: 'Show Hourly Temperature',
                    },
                    {
                        type: 'checkbox',
                        name: 'show_temperature_unit',
                        label: 'Show Temperature Unit',
                        visible: {
                            prop: 'show_temperature',
                            eq: true,
                        },
                    },
                    {
                        type: 'checkbox',
                        name: 'show_thermal_bars',
                        label: 'Show Thermal Bars',
                    },
                    {
                        type: 'slider',
                        name: 'bar_height',
                        label: 'Bar Height',
                        min: MIN_BAR_HEIGHT,
                        max: MAX_BAR_HEIGHT,
                        step: 1,
                        visible: {
                            and: [
                                {
                                    prop: 'layout_direction',
                                    eq: 'horizontal',
                                },
                                {
                                    prop: 'show_thermal_bars',
                                    eq: true,
                                },
                            ],
                        },
                    },
                    {
                        type: 'select',
                        name: 'vertical_bar_width_mode',
                        label: 'Vertical Bar Width',
                        options: [
                            {value: 'fill', label: 'Fill'},
                            {value: 'custom', label: 'Custom'},
                        ],
                        visible: {
                            and: [
                                {
                                    prop: 'layout_direction',
                                    eq: 'vertical',
                                },
                                {
                                    prop: 'show_thermal_bars',
                                    eq: true,
                                },
                            ],
                        },
                    },
                    {
                        type: 'slider',
                        name: 'vertical_bar_width',
                        label: 'Custom Bar Width',
                        min: MIN_VERTICAL_BAR_WIDTH,
                        max: MAX_VERTICAL_BAR_WIDTH,
                        step: 1,
                        visible: {
                            and: [
                                {
                                    prop: 'layout_direction',
                                    eq: 'vertical',
                                },
                                {
                                    prop: 'show_thermal_bars',
                                    eq: true,
                                },
                                {
                                    prop: 'vertical_bar_width_mode',
                                    eq: 'custom',
                                },
                            ],
                        },
                    },
                    {
                        type: 'select',
                        name: 'color_ramp',
                        label: 'Temperature Color Ramp',
                        options: [
                            {value: 'none', label: 'None'},
                            {value: 'thermal', label: 'Thermal'},
                            {value: 'blue', label: 'Blue'},
                            {value: 'amber', label: 'Amber'},
                            {value: 'teal', label: 'Teal'},
                            {value: 'custom', label: 'Custom'},
                        ],
                        visible: temperatureColorVisible,
                    },
                    {
                        type: 'color',
                        name: 'color_cold',
                        label: 'Cold Color',
                        visible: {
                            and: [
                                temperatureColorRampVisible,
                                {
                                    prop: 'color_ramp',
                                    eq: 'custom',
                                },
                            ],
                        },
                    },
                    {
                        type: 'color',
                        name: 'color_warm',
                        label: 'Warm Color',
                        visible: {
                            and: [
                                temperatureColorRampVisible,
                                {
                                    prop: 'color_ramp',
                                    eq: 'custom',
                                },
                            ],
                        },
                    },
                    {
                        type: 'select',
                        name: 'color_ramp_interpolation',
                        label: 'Color Interpolation',
                        options: [
                            {value: 'rgb', label: 'Linear (RGB)'},
                            {value: 'hsl', label: 'Chromatic (HSL)'},
                        ],
                        visible: {
                            and: [
                                temperatureColorRampVisible,
                                {
                                    prop: 'color_ramp',
                                    eq: 'custom',
                                },
                            ],
                        },
                    },
                    {
                        type: 'checkbox',
                        name: 'color_ramp_reverse_hue',
                        label: 'Reverse hue path',
                        visible: {
                            and: [
                                temperatureColorVisible,
                                {
                                    prop: 'color_ramp',
                                    eq: 'custom',
                                },
                                {
                                    prop: 'color_ramp_interpolation',
                                    eq: 'hsl',
                                },
                            ],
                        },
                    },
                    {
                        type: 'select',
                        name: 'temperature_color_range_mode',
                        label: 'Temperature Color Range',
                        options: [
                            {value: 'forecast', label: 'Visible Forecast'},
                            {value: 'custom', label: 'Custom'},
                        ],
                        visible: temperatureColorRampVisible,
                    },
                    {
                        type: 'number',
                        name: 'temperature_color_min',
                        label: 'Temperature Color Min',
                        step: 1,
                        visible: customTemperatureColorRangeVisible,
                    },
                    {
                        type: 'number',
                        name: 'temperature_color_max',
                        label: 'Temperature Color Max',
                        step: 1,
                        visible: customTemperatureColorRangeVisible,
                    },
                    {
                        type: 'checkbox',
                        name: 'show_rain_badge',
                        label: 'Show Rain Badge',
                    },
                    {
                        type: 'slider',
                        name: 'rain_threshold',
                        label: 'Rain Threshold',
                        min: 0,
                        max: 50,
                        step: 5,
                    },
                ] as PropertyTrait[],
            },
        ];

        const secondaryTraits = this.getSecondaryAttributeTraits();
        if (secondaryTraits.length > 0) {
            groups.push({
                id: 'secondary',
                label: 'Secondary Data',
                traits: secondaryTraits,
            });
        }

        return {
            properties: {
                groups,
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'full',
                    },
                },
                container: {
                    label: 'Container',
                    description: 'Forecast block surface',
                    styles: {
                        preset: 'full',
                    },
                },
                header: {
                    label: 'Header',
                    description: 'Fixed forecast header',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                title: {
                    label: 'Title',
                    description: 'Header title and icon',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                badge: {
                    label: 'Rain Badge',
                    description: 'Conditional precipitation badge',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                range: {
                    label: 'Temperature Range',
                    description: 'Visible high and low temperatures',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                'range-high': {
                    label: 'Range High',
                    description: 'Maximum temperature in the range',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                'range-low': {
                    label: 'Range Low',
                    description: 'Minimum temperature in the range',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                strip: {
                    label: 'Forecast Strip',
                    description: 'Scrollable hourly forecast area',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                hour: {
                    label: 'Hour Item',
                    description: 'Single forecast hour item',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                now: {
                    label: 'Now Item',
                    description: 'Current hour item',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                time: {
                    label: 'Time Label',
                    description: 'Hourly time label',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                icon: {
                    label: 'Condition Icon',
                    description: 'Weather condition icon',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                temperature: {
                    label: 'Temperature',
                    description: 'Hourly temperature value',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                'temperature-unit': {
                    label: 'Temperature Unit',
                    description: 'Unit of measure shown with hourly temperature',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                'time-meridiem': {
                    label: 'AM/PM',
                    description: 'Meridiem indicator in 12-hour time format',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                thermalBar: {
                    label: 'Thermal Bar',
                    description: 'Temperature bar indicator',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                secondary: {
                    label: 'Secondary Value',
                    description: 'Secondary forecast data rows',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                'secondary-icon': {
                    label: 'Secondary Icons',
                    description: 'All secondary data icons',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                'secondary-unit': {
                    label: 'Secondary Units',
                    description: 'All secondary data units',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                ...this.getSecondaryTargetStyles(),
                placeholder: {
                    label: 'Placeholder',
                    description: 'Empty or error message',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
            },
        };
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.syncRefreshTimer();
        void this.ensureForecastLoaded(true);
    }

    disconnectedCallback(): void {
        this.clearRefreshTimer();
        super.disconnectedCallback();
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        this.syncRefreshTimer();

        if (changedProps.has('block') || changedProps.has('entity') || changedProps.has('hass')) {
            void this.ensureForecastLoaded(false);
        }
    }

    getBlockEntities(): string[] | undefined {
        const weatherEntity = this.resolvedEntityId();
        return weatherEntity ? [weatherEntity] : [];
    }

    render() {
        const entityId = this.resolvedEntityId();
        const stateObj = entityId ? this.hass?.states[entityId] ?? null : null;

        if (!entityId) {
            return this.renderPlaceholder('Select a weather entity');
        }

        if (!entityId.startsWith('weather.')) {
            return this.renderPlaceholder('Select a weather entity');
        }

        if (this.hass && !stateObj) {
            return this.renderPlaceholder('Weather entity not found');
        }

        if (this.forecastStatus === 'unsupported') {
            return this.renderPlaceholder('This entity does not provide hourly forecasts');
        }

        if (this.forecastStatus === 'empty') {
            return this.renderPlaceholder('No forecast data available');
        }

        if (this.forecastStatus !== 'ready' || this.forecast.length === 0) {
            return this.renderPlaceholder('Loading hourly forecast');
        }

        const visibleForecast = this.getVisibleForecast();
        if (visibleForecast.length === 0) {
            return this.renderPlaceholder('No forecast data available');
        }

        const layout = this.getLayoutDirection();
        const temperatures = this.getTemperatures(visibleForecast);
        const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : null;
        const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : null;
        const temperatureColorRange = this.getTemperatureColorRange(minTemp, maxTemp);
        const header = this.renderHeader(visibleForecast, minTemp, maxTemp);
        const enabledSecondaryKeys = this.getEnabledSecondaryKeys();
        const barHeight = this.getBarHeight();
        const horizontalColumnMode = this.getHorizontalColumnMode();
        const verticalBarWidthMode = this.getVerticalBarWidthMode();
        const showConditionIcons = this.resolvePropertyAsBoolean('show_condition_icons');
        const showTemperature = this.resolvePropertyAsBoolean('show_temperature');
        const showThermalBars = this.resolvePropertyAsBoolean('show_thermal_bars');
        const containerStyle = this.getTargetStyle('container');
        const stripStyle = {
            '--fc-thermal-bar-height': `${barHeight}px`,
            '--fc-vertical-secondary-columns': this.getVerticalSecondaryColumns(enabledSecondaryKeys),
            ...this.getHorizontalColumnStyles(horizontalColumnMode),
            ...this.getVerticalBarStyles(verticalBarWidthMode),
            ...this.getTargetStyle('strip'),
        };
        const stripClasses = [
            'strip',
            layout,
            layout === 'horizontal' ? horizontalColumnMode : `${verticalBarWidthMode}-bars`,
            showConditionIcons ? '' : 'no-icons',
            showTemperature ? '' : 'no-temperature',
            showThermalBars ? '' : 'no-bars',
            enabledSecondaryKeys.length > 0 ? '' : 'no-secondary',
            this.getTargetActiveClass('strip'),
        ].filter(Boolean).join(' ');

        return html`
            <div
                class="forecast-card ${this.getTargetActiveClass('container')}"
                style=${styleMap(containerStyle)}
                data-style-target="container"
            >
                ${header}
                <div
                    class=${stripClasses}
                    style=${styleMap(stripStyle)}
                    data-style-target="strip"
                    data-action-target="strip"
                >
                    ${visibleForecast.map((entry, index) => this.renderForecastHour(
                        entry,
                        index,
                        visibleForecast,
                        minTemp,
                        maxTemp,
                        temperatureColorRange,
                        enabledSecondaryKeys,
                        barHeight,
                        layout
                    ))}
                </div>
            </div>
        `;
    }

    private renderHeader(
        forecast: ForecastEntry[],
        minTemp: number | null,
        maxTemp: number | null
    ): TemplateResult {
        const headerStyle = this.getTargetStyle('header');
        const titleStyle = this.getTargetStyle('title');
        const rangeStyle = this.getTargetStyle('range');
        const rangeHighStyle = this.getTargetStyle('range-high');
        const rangeLowStyle = this.getTargetStyle('range-low');
        const rainBadge = this.getRainBadge(forecast);
        const warmColor = this.getTemperatureRangeColor('max');
        const coldColor = this.getTemperatureRangeColor('min');

        return html`
            <div
                class="header ${this.getTargetActiveClass('header')}"
                style=${styleMap(headerStyle)}
                data-style-target="header"
                data-action-target="header"
            >
                <div
                    class="title ${this.getTargetActiveClass('title')}"
                    style=${styleMap(titleStyle)}
                    data-style-target="title"
                >
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    <span>Hourly forecast</span>
                </div>
                ${rainBadge}
                ${minTemp !== null && maxTemp !== null ? html`
                    <div
                        class="range ${this.getTargetActiveClass('range')}"
                        style=${styleMap(rangeStyle)}
                        data-style-target="range"
                    >
                        <span
                            class="range-part ${this.getTargetActiveClass('range-high')}"
                            style=${styleMap({...this.getColorStyle(warmColor), ...rangeHighStyle})}
                            data-style-target="range-high"
                        >
                            <ha-icon icon="mdi:arrow-up-thin"></ha-icon>
                            ${this.formatWeatherValue(maxTemp, 'temperature', 0)}
                        </span>
                        <span
                            class="range-part ${this.getTargetActiveClass('range-low')}"
                            style=${styleMap({...this.getColorStyle(coldColor), ...rangeLowStyle})}
                            data-style-target="range-low"
                        >
                            <ha-icon icon="mdi:arrow-down-thin"></ha-icon>
                            ${this.formatWeatherValue(minTemp, 'temperature', 0)}
                        </span>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private renderForecastHour(
        entry: ForecastEntry,
        index: number,
        forecast: ForecastEntry[],
        minTemp: number | null,
        maxTemp: number | null,
        temperatureColorRange: {min: number | null; max: number | null},
        enabledSecondaryKeys: ForecastSecondaryAttributeKey[],
        maxBarHeight: number,
        layout: LayoutDirection
    ): TemplateResult {
        const isNow = index === 0 && this.resolvePropertyAsBoolean('show_now_indicator');
        const isDaySeparator = this.shouldRenderDaySeparator(entry, index, forecast);
        const showConditionIcons = this.resolvePropertyAsBoolean('show_condition_icons');
        const showTemperature = this.resolvePropertyAsBoolean('show_temperature');
        const showThermalBars = this.resolvePropertyAsBoolean('show_thermal_bars');
        const temperature = this.getNumberValue(entry.temperature);
        const temperatureColor = temperature === null || temperatureColorRange.min === null || temperatureColorRange.max === null
            ? undefined
            : this.getTemperatureColor(temperature, temperatureColorRange.min, temperatureColorRange.max);
        const hourStyle = {
            ...this.getTargetStyle('hour'),
            ...(isNow ? this.getTargetStyle('now') : {}),
        };
        const timeStyle = this.getTargetStyle('time');
        const iconStyle = {
            color: this.getConditionColor(entry.condition),
            ...this.getTargetStyle('icon'),
        };
        const temperatureStyle = {
            color: temperatureColor ?? 'var(--fc-text)',
            ...this.getTargetStyle('temperature'),
        };
        const condition = this.normalizeCondition(entry.condition);
        const hourClasses = [
            'hour',
            isNow ? 'now' : '',
            isDaySeparator ? 'day-separator' : '',
            this.getTargetActiveClass('hour'),
            isNow ? this.getTargetActiveClass('now') : '',
        ].filter(Boolean).join(' ');

        return html`
            <div
                class=${hourClasses}
                style=${styleMap(hourStyle)}
                data-style-target=${isNow ? 'now' : 'hour'}
                data-action-target="hour"
            >
                <div
                    class="time ${this.getTargetActiveClass('time')}"
                    style=${styleMap(timeStyle)}
                    data-style-target="time"
                >
                    ${isNow ? 'Now' : this.renderForecastTime(entry.datetime)}
                </div>
                ${showConditionIcons ? html`
                    <ha-icon
                        class="condition-icon ${this.getTargetActiveClass('icon')}"
                        style=${styleMap(iconStyle)}
                        data-style-target="icon"
                        .icon=${WEATHER_ICONS[condition] ?? WEATHER_ICONS.exceptional}
                    ></ha-icon>
                ` : nothing}
                ${showTemperature ? html`
                    <div
                        class="temperature ${this.getTargetActiveClass('temperature')}"
                        style=${styleMap(temperatureStyle)}
                        data-style-target="temperature"
                    >
                        ${this.renderTemperatureValue(temperature)}
                    </div>
                ` : nothing}
                ${showThermalBars && temperature !== null ? this.renderThermalBar(
                    temperature,
                    minTemp,
                    maxTemp,
                    maxBarHeight,
                    temperatureColor ?? 'var(--fc-accent)',
                    layout
                ) : nothing}
                ${layout === 'vertical'
                    ? enabledSecondaryKeys.map((key, secondaryIndex) => this.renderVerticalSecondaryCell(key, entry, secondaryIndex))
                    : html`
                        <div class="secondary-stack">
                            ${enabledSecondaryKeys.map((key) => this.renderSecondaryValue(key, entry))}
                        </div>
                    `}
            </div>
        `;
    }

    private renderThermalBar(
        temperature: number,
        minTemp: number | null,
        maxTemp: number | null,
        maxBarHeight: number,
        color: string,
        layout: LayoutDirection
    ): TemplateResult {
        const normalized = minTemp === null || maxTemp === null
            ? 0.5
            : this.normalizeTemperature(temperature, minTemp, maxTemp);
        const thermalBarStyle = layout === 'vertical'
            ? {
                width: `${MIN_VISIBLE_BAR_WIDTH + normalized * (100 - MIN_VISIBLE_BAR_WIDTH)}%`,
                background: color,
                ...this.getTargetStyle('thermalBar'),
            }
            : {
                height: `${MIN_VISIBLE_BAR_HEIGHT + normalized * (maxBarHeight - MIN_VISIBLE_BAR_HEIGHT)}px`,
                background: color,
                ...this.getTargetStyle('thermalBar'),
            };

        return html`
            <div class="thermal-bar-wrap">
                <span
                    class="thermal-bar ${this.getTargetActiveClass('thermalBar')}"
                    style=${styleMap(thermalBarStyle)}
                    data-style-target="thermalBar"
                ></span>
            </div>
        `;
    }

    private renderSecondaryValue(
        key: ForecastSecondaryAttributeKey,
        entry: ForecastEntry
    ): TemplateResult | typeof nothing {
        const value = entry[key];
        if (value === undefined || value === null || value === '') {
            return nothing;
        }

        const style = this.getTargetStyle('secondary');

        switch (key) {
            case 'precipitation_probability':
                return this.renderPrecipitationProbability(entry, style);
            case 'precipitation':
                return this.renderPrecipitationAmount(entry, style);
            case 'wind_speed':
                return this.renderWind(entry, style);
            case 'wind_bearing':
                return this.renderWindDirection(entry, style);
            case 'humidity':
                return this.renderSecondaryMeasureValue(key, 'mdi:water-percent', value, 'humidity', 0, {
                    ...this.getSecondaryColorStyle(key, value),
                    ...style,
                });
            case 'dew_point':
                return this.renderSecondaryMeasureValue(key, 'mdi:thermometer-water', value, 'dew_point', 0, style);
            case 'cloud_coverage':
                return this.renderSecondaryMeasureValue(key, 'mdi:weather-cloudy', value, 'cloud_coverage', 0, {
                    ...this.getSecondaryColorStyle(key, value),
                    ...style,
                });
            case 'uv_index':
                return this.renderSecondaryMeasureValue(key, 'mdi:sun-wireless', value, 'uv_index', 1, {
                    ...this.getSecondaryColorStyle(key, value),
                    ...style,
                });
            case 'pressure':
                return this.renderSecondaryMeasureValue(key, 'mdi:gauge', value, 'pressure', 0, style);
            case 'apparent_temperature':
                return this.renderSecondaryMeasureValue(key, 'mdi:thermometer', value, 'apparent_temperature', 0, style);
        }
    }

    private renderVerticalSecondaryCell(
        key: ForecastSecondaryAttributeKey,
        entry: ForecastEntry,
        index: number
    ): TemplateResult {
        const cellStyle = {
            gridColumn: String(5 + index),
        };

        return html`
            <div class="vertical-secondary-cell" style=${styleMap(cellStyle)}>
                ${this.renderSecondaryValue(key, entry)}
            </div>
        `;
    }

    private renderPrecipitationProbability(
        entry: ForecastEntry,
        style: Record<string, string>
    ): TemplateResult | typeof nothing {
        const value = this.getNumberValue(entry.precipitation_probability);
        if (value === null) return nothing;

        const threshold = this.getRainThreshold();
        if (threshold > 0 && value < threshold) return nothing;

        return this.renderSecondaryMeasureValue('precipitation_probability', 'mdi:weather-rainy', value, 'precipitation_probability', 0, {
            color: 'var(--fc-rain)',
            ...style,
        });
    }

    private renderPrecipitationAmount(
        entry: ForecastEntry,
        style: Record<string, string>
    ): TemplateResult | typeof nothing {
        const value = this.getNumberValue(entry.precipitation);
        if (value === null || value === 0) return nothing;

        return this.renderSecondaryMeasureValue('precipitation', 'mdi:weather-pouring', value, 'precipitation', 1, {
            color: 'var(--fc-rain)',
            ...style,
        });
    }

    private renderWind(
        entry: ForecastEntry,
        style: Record<string, string>
    ): TemplateResult | typeof nothing {
        const speed = this.getNumberValue(entry.wind_speed);
        if (speed === null) return nothing;

        const bearing = this.getWindBearingDegrees(entry.wind_bearing);
        const targetId = this.getSecondaryTargetId('wind_speed');
        const targetStyle = this.getTargetStyle(targetId);
        const iconStyle = {
            transform: `rotate(${bearing ?? 0}deg)`,
        };
        const speedParts = this.formatWeatherValueParts(speed, 'wind_speed', 0);
        const iconTargetId = this.getSecondaryIconTargetId('wind_speed');
        const unitTargetId = this.getSecondaryUnitTargetId('wind_speed');
        const secondaryIconStyle = {
            ...this.getTargetStyle('secondary-icon'),
            ...this.getTargetStyle(iconTargetId),
        };
        const secondaryUnitStyle = {
            ...this.getTargetStyle('secondary-unit'),
            ...this.getTargetStyle(unitTargetId),
        };

        return html`
            <div
                class="secondary wind-row ${this.getTargetActiveClass('secondary')}"
                style=${styleMap(style)}
                data-style-target="secondary"
            >
                <span
                    class="secondary-content wind-row ${this.getTargetActiveClass(targetId)}"
                    style=${styleMap(targetStyle)}
                    data-style-target=${targetId}
                >
                    <span class="wind-main">
                        <ha-icon
                            class="${this.getTargetActiveClass('secondary-icon')} ${this.getTargetActiveClass(iconTargetId)}"
                            style=${styleMap({...iconStyle, ...secondaryIconStyle})}
                            data-style-target=${iconTargetId}
                            icon="mdi:arrow-up"
                        ></ha-icon>
                        <span>${speedParts.value}</span>
                        ${speedParts.unit ? html`<span
                            class="${this.getTargetActiveClass('secondary-unit')} ${this.getTargetActiveClass(unitTargetId)}"
                            style=${styleMap(secondaryUnitStyle)}
                            data-style-target=${unitTargetId}
                        >${speedParts.unit}</span>` : nothing}
                    </span>
                </span>
            </div>
        `;
    }

    private renderWindDirection(
        entry: ForecastEntry,
        style: Record<string, string>
    ): TemplateResult | typeof nothing {
        const direction = this.getWindCardinalDirection(entry.wind_bearing);
        if (!direction) return nothing;

        return this.renderIconValue('wind_bearing', 'mdi:compass-outline', direction, '', style);
    }

    private renderSecondaryMeasureValue(
        key: ForecastSecondaryAttributeKey,
        icon: string,
        value: unknown,
        measure: ForecastSecondaryAttributeKey,
        maximumFractionDigits: number,
        style: Record<string, string>
    ): TemplateResult {
        const parts = this.formatWeatherValueParts(value, measure, maximumFractionDigits);
        return this.renderIconValue(key, icon, parts.value, parts.unit, style);
    }

    private renderIconValue(
        key: ForecastSecondaryAttributeKey,
        icon: string,
        value: string,
        unit: string,
        style: Record<string, string>
    ): TemplateResult {
        const targetId = this.getSecondaryTargetId(key);
        const targetStyle = this.getTargetStyle(targetId);
        const iconTargetId = this.getSecondaryIconTargetId(key);
        const unitTargetId = this.getSecondaryUnitTargetId(key);
        const iconStyle = {
            ...this.getTargetStyle('secondary-icon'),
            ...this.getTargetStyle(iconTargetId),
        };
        const unitStyle = {
            ...this.getTargetStyle('secondary-unit'),
            ...this.getTargetStyle(unitTargetId),
        };

        return html`
            <div
                class="secondary ${this.getTargetActiveClass('secondary')}"
                style=${styleMap(style)}
                data-style-target="secondary"
            >
                <span
                    class="secondary-content ${this.getTargetActiveClass(targetId)}"
                    style=${styleMap(targetStyle)}
                    data-style-target=${targetId}
                >
                    <ha-icon
                        class="${this.getTargetActiveClass('secondary-icon')} ${this.getTargetActiveClass(iconTargetId)}"
                        style=${styleMap(iconStyle)}
                        data-style-target=${iconTargetId}
                        .icon=${icon}
                    ></ha-icon>
                    <span>${value}</span>
                    ${unit ? html`<span
                        class="${this.getTargetActiveClass('secondary-unit')} ${this.getTargetActiveClass(unitTargetId)}"
                        style=${styleMap(unitStyle)}
                        data-style-target=${unitTargetId}
                    >${unit}</span>` : nothing}
                </span>
            </div>
        `;
    }

    private renderPlaceholder(message: string): TemplateResult {
        const containerStyle = this.getTargetStyle('container');
        const placeholderStyle = this.getTargetStyle('placeholder');

        return html`
            <div
                class="forecast-card ${this.getTargetActiveClass('container')}"
                style=${styleMap(containerStyle)}
                data-style-target="container"
            >
                <div
                    class="placeholder ${this.getTargetActiveClass('placeholder')}"
                    style=${styleMap(placeholderStyle)}
                    data-style-target="placeholder"
                >
                    ${message}
                </div>
            </div>
        `;
    }

    private async ensureForecastLoaded(force: boolean): Promise<void> {
        if (!this.hass) return;

        const entityId = this.resolvedEntityId();
        if (!entityId || !entityId.startsWith('weather.')) {
            this.forecastEntityId = '';
            this.setForecastState([], 'idle');
            this.setAvailableAttributeKeys(new Set());
            return;
        }

        const stateObj = this.hass.states[entityId];
        if (!stateObj) {
            this.forecastEntityId = '';
            this.setForecastState([], 'empty');
            this.setAvailableAttributeKeys(new Set());
            return;
        }

        if (this.forecastEntityId !== entityId) {
            this.forecastEntityId = entityId;
            this.loadedKey = '';
            this.forecast = [];
            this.forecastStatus = 'loading';
            this.setAvailableAttributeKeys(new Set());
        }

        const stateKey = `${entityId}:${stateObj.state}:${stateObj.last_changed}:${stateObj.last_updated}`;
        const requestKey = `${stateKey}:${this.getHours()}`;
        if (!force && (requestKey === this.loadedKey || requestKey === this.loadingKey)) {
            return;
        }

        const sequence = ++this.requestSequence;
        this.loadingKey = requestKey;
        this.forecastStatus = this.forecast.length > 0 ? this.forecastStatus : 'loading';

        try {
            const response = await this.hass.callWS<ForecastResponse | ForecastServiceResult>({
                type: 'call_service',
                domain: 'weather',
                service: 'get_forecasts',
                service_data: {type: 'hourly'},
                target: {entity_id: entityId},
                return_response: true,
            });

            if (sequence !== this.requestSequence) return;

            const forecast = this.extractForecastFromResponse(response, entityId);
            if (!Array.isArray(forecast) || forecast.length === 0) {
                this.setForecastState([], 'empty');
                this.setAvailableAttributeKeys(new Set());
            } else {
                this.setForecastState(forecast, 'ready');
                this.setAvailableAttributeKeys(this.extractAvailableAttributeKeys(forecast));
            }
            this.loadedKey = requestKey;
        } catch {
            if (sequence !== this.requestSequence) return;
            this.setForecastState([], 'unsupported');
            this.setAvailableAttributeKeys(new Set());
        } finally {
            if (sequence === this.requestSequence) {
                this.loadingKey = '';
            }
        }
    }

    private setForecastState(
        forecast: ForecastEntry[],
        status: ForecastStatus
    ): void {
        this.forecast = forecast;
        this.forecastStatus = status;
        if (status !== 'ready' && status !== 'loading') {
            this.loadedKey = '';
        }
    }

    private extractForecastFromResponse(
        result: ForecastResponse | ForecastServiceResult | undefined,
        entityId: string
    ): ForecastEntry[] {
        if (!result || typeof result !== 'object') {
            return [];
        }

        const wrappedResponse = (result as ForecastServiceResult).response;
        const response = wrappedResponse && typeof wrappedResponse === 'object'
            ? wrappedResponse
            : result as ForecastResponse;
        const forecast = response?.[entityId]?.forecast;

        return Array.isArray(forecast) ? forecast : [];
    }

    private syncRefreshTimer(): void {
        if (this.refreshTimerId !== null) return;

        this.refreshTimerId = window.setInterval(() => {
            void this.ensureForecastLoaded(true);
        }, FORECAST_REFRESH_MS);
    }

    private clearRefreshTimer(): void {
        if (this.refreshTimerId !== null) {
            window.clearInterval(this.refreshTimerId);
            this.refreshTimerId = null;
        }
    }

    private getSecondaryTargetStyles(): NonNullable<BlockPanelConfig['targetStyles']> {
        return Object.fromEntries(
            SECONDARY_ATTRIBUTES.flatMap((attribute) => [
                [
                    attribute.targetId,
                    {
                        label: attribute.label,
                        description: `${attribute.label} secondary forecast value`,
                        styles: {
                            preset: 'full',
                            exclude: {
                                groups: ['layout', 'flex'],
                            },
                        },
                    },
                ],
                [
                    this.getSecondaryIconTargetId(attribute.key),
                    {
                        label: `${attribute.label} Icon`,
                        description: `${attribute.label} secondary icon`,
                        styles: {
                            preset: 'full',
                            exclude: {
                                groups: ['layout', 'flex'],
                            },
                        },
                    },
                ],
                [
                    this.getSecondaryUnitTargetId(attribute.key),
                    {
                        label: `${attribute.label} Unit`,
                        description: `${attribute.label} unit of measure`,
                        styles: {
                            preset: 'full',
                            exclude: {
                                groups: ['layout', 'flex'],
                            },
                        },
                    },
                ],
            ])
        );
    }

    private getSecondaryAttributeTraits(): PropertyTrait[] {
        return SECONDARY_ATTRIBUTES
            .filter((attribute) => this.availableAttributeKeys.has(attribute.key))
            .filter((attribute) => attribute.key !== 'wind_bearing' || this.availableAttributeKeys.has('wind_speed'))
            .flatMap((attribute) => {
                const traits: PropertyTrait[] = [
                    {
                        type: 'checkbox',
                        name: attribute.prop,
                        label: attribute.label,
                        visible: attribute.key === 'wind_bearing'
                            ? {
                                prop: 'show_wind_speed',
                                eq: true,
                            }
                            : undefined,
                    },
                ];

                if (attribute.key === 'humidity' || attribute.key === 'cloud_coverage' || attribute.key === 'uv_index') {
                    const rampProp = this.getSecondaryColorRampProp(attribute.key);
                    const lowColorProp = this.getSecondaryColorLowProp(attribute.key);
                    const highColorProp = this.getSecondaryColorHighProp(attribute.key);
                    const enabledCondition = {
                        prop: attribute.prop,
                        eq: true,
                    };
                    const customRampVisible = {
                        and: [
                            enabledCondition,
                            {
                                prop: rampProp,
                                eq: 'custom',
                            },
                        ],
                    };

                    traits.push(
                        {
                            type: 'select',
                            name: rampProp,
                            label: `${attribute.label} Color Ramp`,
                            options: this.getSecondaryColorRampOptions(attribute.key),
                            visible: enabledCondition,
                        },
                        {
                            type: 'color',
                            name: lowColorProp,
                            label: `${attribute.label} Low Color`,
                            visible: customRampVisible,
                        },
                        {
                            type: 'color',
                            name: highColorProp,
                            label: `${attribute.label} High Color`,
                            visible: customRampVisible,
                        }
                    );
                }

                return traits;
            });
    }

    private getSecondaryColorRampOptions(key: ForecastSecondaryAttributeKey): Array<{value: string; label: string}> {
        switch (key) {
            case 'humidity':
                return [
                    {value: 'none', label: 'None'},
                    {value: 'humidity', label: 'Dry to Humid'},
                    {value: 'blue', label: 'Blue'},
                    {value: 'teal', label: 'Teal'},
                    {value: 'custom', label: 'Custom'},
                ];
            case 'cloud_coverage':
                return [
                    {value: 'none', label: 'None'},
                    {value: 'cloud', label: 'Clear to Overcast'},
                    {value: 'storm', label: 'Storm'},
                    {value: 'blue', label: 'Blue'},
                    {value: 'custom', label: 'Custom'},
                ];
            case 'uv_index':
                return [
                    {value: 'none', label: 'None'},
                    {value: 'uv', label: 'UV Scale'},
                    {value: 'solar', label: 'Solar'},
                    {value: 'alert', label: 'Alert'},
                    {value: 'custom', label: 'Custom'},
                ];
            default:
                return [
                    {value: 'none', label: 'None'},
                    {value: 'custom', label: 'Custom'},
                ];
        }
    }

    private getEnabledSecondaryKeys(): ForecastSecondaryAttributeKey[] {
        return SECONDARY_ATTRIBUTES
            .filter((attribute) => this.availableAttributeKeys.has(attribute.key))
            .filter((attribute) => {
                if (attribute.key !== 'wind_bearing') {
                    return true;
                }

                return this.availableAttributeKeys.has('wind_speed')
                    && this.resolvePropertyAsBoolean('show_wind_speed');
            })
            .filter((attribute) => this.resolvePropertyAsBoolean(attribute.prop, attribute.defaultValue))
            .map((attribute) => attribute.key);
    }

    private extractAvailableAttributeKeys(forecast: ForecastEntry[]): Set<ForecastSecondaryAttributeKey> {
        const keys = new Set<ForecastSecondaryAttributeKey>();

        for (const attribute of SECONDARY_ATTRIBUTES) {
            if (forecast.some((entry) => entry[attribute.key] !== undefined && entry[attribute.key] !== null)) {
                keys.add(attribute.key);
            }
        }

        return keys;
    }

    private setAvailableAttributeKeys(keys: Set<ForecastSecondaryAttributeKey>): void {
        const signature = Array.from(keys).sort().join('|');
        if (signature === this.availableAttributeSignature) {
            return;
        }

        this.availableAttributeSignature = signature;
        this.availableAttributeKeys = keys;
        this.requestPropertyPanelRefresh();
    }

    private requestPropertyPanelRefresh(): void {
        if (!this.environment?.isBuilder || !this.block || !this.selected) {
            return;
        }

        this.documentModel.dispatchEvent(new CustomEvent('block-updated', {
            detail: {block: {...this.block}},
        }));
    }

    private getVisibleForecast(): ForecastEntry[] {
        return this.forecast.slice(0, this.getHours());
    }

    private getHours(): number {
        const hours = Math.round(this.resolvePropertyAsNumber('hours', DEFAULT_HOURS));
        return Math.min(MAX_HOURS, Math.max(MIN_HOURS, hours));
    }

    private getLayoutDirection(): LayoutDirection {
        return this.resolveProperty('layout_direction') as LayoutDirection;
    }

    private getHorizontalColumnMode(): HorizontalColumnMode {
        const mode = this.resolveProperty('horizontal_column_mode', 'auto');
        return mode === 'fill' || mode === 'custom' ? mode : 'auto';
    }

    private getHorizontalColumnStyles(mode: HorizontalColumnMode): Record<string, string> {
        if (mode === 'fill') {
            return {};
        }

        if (mode === 'custom') {
            return {
                '--fc-custom-column-width': this.normalizeCssLength(
                    this.resolveProperty('custom_column_width', '52px'),
                    '52px',
                    true
                ),
            };
        }

        return {
            '--fc-auto-column-min-width': `${Math.max(1, this.resolvePropertyAsNumber('auto_column_min_width', MIN_HOUR_ITEM_WIDTH))}px`,
            '--fc-auto-column-max-width': this.normalizeCssLength(
                this.resolveProperty('auto_column_max_width', ''),
                'none',
                true
            ),
        };
    }

    private getVerticalBarWidthMode(): VerticalBarWidthMode {
        return this.resolveProperty('vertical_bar_width_mode') as VerticalBarWidthMode;
    }

    private getVerticalBarStyles(mode: VerticalBarWidthMode): Record<string, string> {
        if (mode === 'fill') {
            return {
                '--fc-vertical-bar-column-width': 'minmax(0, 1fr)',
            };
        }

        return {
            '--fc-vertical-bar-width': `${this.getVerticalBarWidth()}px`,
        };
    }

    private getVerticalSecondaryColumns(keys: ForecastSecondaryAttributeKey[]): string {
        return keys.length > 0 ? keys.map(() => 'max-content').join(' ') : '0';
    }

    private getVerticalBarWidth(): number {
        const value = this.resolvePropertyAsNumber('vertical_bar_width', DEFAULT_VERTICAL_BAR_WIDTH);
        return Math.min(MAX_VERTICAL_BAR_WIDTH, Math.max(MIN_VERTICAL_BAR_WIDTH, value));
    }

    private getBarHeight(): number {
        const value = this.resolvePropertyAsNumber('bar_height', DEFAULT_BAR_HEIGHT);
        return Math.min(MAX_BAR_HEIGHT, Math.max(MIN_BAR_HEIGHT, value));
    }

    private getRainThreshold(): number {
        const value = this.resolvePropertyAsNumber('rain_threshold', 0);
        return Math.min(50, Math.max(0, value));
    }

    private getTemperatureColorRange(
        forecastMin: number | null,
        forecastMax: number | null
    ): {min: number | null; max: number | null} {
        const mode = this.resolveProperty('temperature_color_range_mode') as TemperatureColorRangeMode;
        if (mode === 'custom') {
            return {
                min: this.resolvePropertyAsNumber('temperature_color_min', 0),
                max: this.resolvePropertyAsNumber('temperature_color_max', 40),
            };
        }

        return {
            min: forecastMin,
            max: forecastMax,
        };
    }

    private getTemperatures(forecast: ForecastEntry[]): number[] {
        return forecast
            .map((entry) => this.getNumberValue(entry.temperature))
            .filter((temperature): temperature is number => temperature !== null);
    }

    private getRainBadge(forecast: ForecastEntry[]): TemplateResult | typeof nothing {
        if (!this.resolvePropertyAsBoolean('show_rain_badge')) {
            return nothing;
        }

        const threshold = this.getRainThreshold();
        const index = forecast.findIndex((entry) => {
            const probability = this.getNumberValue(entry.precipitation_probability);
            return probability !== null && probability > threshold;
        });

        if (index === -1) return nothing;

        const badgeStyle = this.getTargetStyle('badge');
        const label = index === 0 ? 'Raining now' : `Rain in ${index}h`;
        return html`
            <div
                class="rain-badge ${this.getTargetActiveClass('badge')}"
                style=${styleMap(badgeStyle)}
                data-style-target="badge"
            >
                <ha-icon icon="mdi:weather-rainy"></ha-icon>
                <span>${label}</span>
            </div>
        `;
    }

    private shouldRenderDaySeparator(
        entry: ForecastEntry,
        index: number,
        forecast: ForecastEntry[]
    ): boolean {
        if (!this.resolvePropertyAsBoolean('show_day_separator') || index === 0) {
            return false;
        }

        const current = this.parseDate(entry.datetime);
        const previous = this.parseDate(forecast[index - 1]?.datetime);
        if (!current || !previous) return false;

        return current.getDate() !== previous.getDate() && current.getHours() === 0;
    }

    private resolveTimeFormat(): boolean {
        // Returns true if AM/PM, false if 24h
        if (! this.hass?.locale?.time_format) {
            return false;
        }

        if (this.hass.locale.time_format === '12') return true;
        if (this.hass.locale.time_format === '24') return false;
        if (this.hass.locale.time_format === 'system') {
            // Let the browser decide based on OS locale
            const test = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions();
            return test.hourCycle === 'h12' || test.hourCycle === 'h11';
        }
        // "language" — use the HA language setting
        const test = new Intl.DateTimeFormat(this.hass.locale.language, { hour: 'numeric' }).resolvedOptions();
        return test.hourCycle === 'h12' || test.hourCycle === 'h11';
    }

    private renderForecastTime(value: unknown): TemplateResult | string {
        const date = this.parseDate(value);
        if (!date) return '--';

        const language = this.hass?.locale?.language || this.hass?.language || undefined;
        const timeFormat12 = this.resolveTimeFormat();

        if (timeFormat12) {
            const formatted = new Intl.DateTimeFormat(language, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }).format(date);
            return this.renderTimeWithMeridiem(formatted);
        }

        return new Intl.DateTimeFormat(language, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);
    }

    private renderTimeWithMeridiem(formatted: string): TemplateResult | string {
        console.log(formatted);
        const match = formatted.match(/^(.*?)(\s*)(am|pm|a\.m\.|p\.m\.)$/i);
        if (!match) {
            return formatted;
        }

        const timePart = match[1];
        const spacer = match[2] || ' ';
        const meridiem = match[3].toUpperCase();
        const meridiemStyle = this.getTargetStyle('time-meridiem');

        return html`${timePart} ${spacer} <span
            class=${this.getTargetActiveClass('time-meridiem')}
            style=${styleMap(meridiemStyle)}
            data-style-target="time-meridiem"
        >${meridiem}</span>`;
    }

    private renderTemperatureValue(value: number | null): TemplateResult | string {
        if (value === null) {
            return '--';
        }

        const showUnit = this.resolvePropertyAsBoolean('show_temperature_unit');
        const parts = this.formatWeatherValueParts(value, 'temperature', 0);
        if (!showUnit || !parts.unit) {
            return html`${parts.value}°`;
        }

        const unitStyle = this.getTargetStyle('temperature-unit');
        return html`${parts.value}<span
            class=${this.getTargetActiveClass('temperature-unit')}
            style=${styleMap(unitStyle)}
            data-style-target="temperature-unit"
        >${parts.unit}</span>`;
    }

    private formatWeatherValue(
        value: unknown,
        measure: ForecastSecondaryAttributeKey | 'temperature',
        maximumFractionDigits: number
    ): string {
        const parts = this.formatWeatherValueParts(value, measure, maximumFractionDigits);
        return parts.unit ? `${parts.value}${parts.unit}` : parts.value;
    }

    private formatWeatherValueParts(
        value: unknown,
        measure: ForecastSecondaryAttributeKey | 'temperature',
        maximumFractionDigits: number
    ): {value: string; unit: string} {
        let unit = this.getWeatherUnit(measure);
        const showTemperatureUnit = this.resolvePropertyAsBoolean('show_temperature_unit');
        if (measure === 'temperature' && ! showTemperatureUnit) {
            unit = '°';
        }
        const formatted = this.formatNumber(value, maximumFractionDigits);
        return {value: formatted, unit};
    }

    private formatNumber(value: unknown, maximumFractionDigits: number): string {
        const numberValue = this.getNumberValue(value);
        if (numberValue === null) {
            return String(value ?? '');
        }

        const language = this.hass?.locale?.language || this.hass?.language || undefined;
        return new Intl.NumberFormat(language, {
            maximumFractionDigits,
            minimumFractionDigits: 0,
        }).format(numberValue);
    }

    private getWeatherUnit(measure: ForecastSecondaryAttributeKey | 'temperature'): string {
        const stateObj = this.getEntityState();
        const attributes = stateObj?.attributes ?? {};
        const lengthUnit = this.hass?.config?.unit_system?.length || '';
        const unitSystem = this.hass?.config?.unit_system as Record<string, string | undefined> | undefined;

        switch (measure) {
            case 'temperature':
            case 'apparent_temperature':
            case 'dew_point':
                return String(attributes.temperature_unit || unitSystem?.temperature || '');
            case 'precipitation':
                return String(attributes.precipitation_unit || (lengthUnit === 'km' ? 'mm' : 'in'));
            case 'pressure':
                return String(attributes.pressure_unit || (lengthUnit === 'km' ? 'hPa' : 'inHg'));
            case 'wind_speed':
                return String(attributes.wind_speed_unit || (lengthUnit ? `${lengthUnit}/h` : ''));
            case 'cloud_coverage':
            case 'humidity':
            case 'precipitation_probability':
                return '%';
            case 'uv_index':
            case 'wind_bearing':
                return '';
        }
    }

    private getTemperatureColor(temperature: number, minTemp: number, maxTemp: number): string | undefined {
        const ramp = this.resolveProperty('color_ramp') as ColorRamp;
        if (ramp === 'none') {
            return undefined;
        }

        const normalized = this.normalizeTemperature(temperature, minTemp, maxTemp);
        const rampConfig = this.getTemperatureColorRampConfig(ramp);

        return this.interpolateRamp(rampConfig.colors, normalized, rampConfig.mode, rampConfig.direction);
    }

    private getTemperatureRangeColor(bound: 'min' | 'max'): string | undefined {
        const ramp = this.resolveProperty('color_ramp') as ColorRamp;
        if (ramp === 'none') {
            return undefined;
        }

        const rampConfig = this.getTemperatureColorRampConfig(ramp);

        return this.interpolateRamp(rampConfig.colors, bound === 'min' ? 0 : 1, rampConfig.mode, rampConfig.direction);
    }

    private getColorStyle(color: string | undefined): Record<string, string> {
        return color ? {color} : {};
    }

    private getTemperatureColorRampConfig(ramp: Exclude<ColorRamp, 'none'>): {
        colors: string[];
        mode: RampInterpolationMode;
        direction: HueDirection;
    } {
        if (ramp !== 'custom') {
            const preset = COLOR_RAMPS[ramp];
            return {
                colors: preset.colors,
                mode: preset.mode,
                direction: 'shortest',
            };
        }

        const mode = this.resolveProperty('color_ramp_interpolation') as RampInterpolationMode;
        return {
            colors: [this.resolveProperty('color_cold'), this.resolveProperty('color_warm')],
            mode,
            direction: mode === 'hsl' && this.resolvePropertyAsBoolean('color_ramp_reverse_hue') ? 'longest' : 'shortest',
        };
    }

    private normalizeTemperature(temperature: number, minTemp: number, maxTemp: number): number {
        if (!Number.isFinite(temperature) || !Number.isFinite(minTemp) || !Number.isFinite(maxTemp) || maxTemp === minTemp) {
            return 0.5;
        }

        const low = Math.min(minTemp, maxTemp);
        const high = Math.max(minTemp, maxTemp);
        const clampedTemperature = Math.min(high, Math.max(low, temperature));

        return (clampedTemperature - low) / (high - low);
    }

    private interpolateRamp(
        colors: string[],
        amount: number,
        mode: RampInterpolationMode = 'hsl',
        forceDirection: HueDirection = 'shortest'
    ): string {
        if (colors.length === 0) return '#f59e0b';
        if (colors.length === 1) return colors[0];

        const clamped = Math.min(1, Math.max(0, amount));
        const segmentLength = 1 / (colors.length - 1);
        const segmentIndex = Math.min(colors.length - 2, Math.floor(clamped / segmentLength));
        const localAmount = (clamped - segmentIndex * segmentLength) / segmentLength;

        if (mode === 'rgb') {
            return this.interpolateRgb(colors[segmentIndex], colors[segmentIndex + 1], localAmount);
        }

        return this.interpolateHsl(colors[segmentIndex], colors[segmentIndex + 1], localAmount, forceDirection);
    }

    private interpolateRgb(from: string, to: string, amount: number): string {
        const fromRgb = this.hexToRgb(from);
        const toRgb = this.hexToRgb(to);
        if (!fromRgb || !toRgb) return amount < 0.5 ? from : to;

        return this.rgbToHex(
            Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * amount),
            Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * amount),
            Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * amount),
        );
    }

    private interpolateHsl(
        from: string,
        to: string,
        amount: number,
        forceDirection: HueDirection = 'shortest'
    ): string {
        const fromHsl = this.hexToHsl(from);
        const toHsl = this.hexToHsl(to);
        if (!fromHsl || !toHsl) {
            return amount < 0.5 ? from : to;
        }

        let hueDelta = toHsl.h - fromHsl.h;
        if (forceDirection === 'longest') {
            if (hueDelta > 0 && hueDelta <= 180) hueDelta -= 360;
            else if (hueDelta < 0 && hueDelta >= -180) hueDelta += 360;
        } else {
            if (hueDelta > 180) hueDelta -= 360;
            if (hueDelta < -180) hueDelta += 360;
        }

        const h = (fromHsl.h + hueDelta * amount + 360) % 360;
        const s = fromHsl.s + (toHsl.s - fromHsl.s) * amount;
        const l = fromHsl.l + (toHsl.l - fromHsl.l) * amount;
        return this.hslToHex(h, s, l);
    }

    private hexToHsl(hex: string): {h: number; s: number; l: number} | null {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return null;

        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;

        if (max === min) {
            return {h: 0, s: 0, l};
        }

        const diff = max - min;
        const s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
        let h = 0;

        switch (max) {
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            case b:
                h = (r - g) / diff + 4;
                break;
        }

        return {h: h * 60, s, l};
    }

    private hslToHex(h: number, s: number, l: number): string {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0;
        let g = 0;
        let b = 0;

        if (h < 60) {
            r = c;
            g = x;
        } else if (h < 120) {
            r = x;
            g = c;
        } else if (h < 180) {
            g = c;
            b = x;
        } else if (h < 240) {
            g = x;
            b = c;
        } else if (h < 300) {
            r = x;
            b = c;
        } else {
            r = c;
            b = x;
        }

        return this.rgbToHex(
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        );
    }

    private hexToRgb(hex: string): {r: number; g: number; b: number} | null {
        const normalized = hex.trim().replace(/^#/, '');
        const expanded = normalized.length === 3
            ? normalized.split('').map((char) => `${char}${char}`).join('')
            : normalized;

        if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
            return null;
        }

        const value = Number.parseInt(expanded, 16);
        return {
            r: (value >> 16) & 255,
            g: (value >> 8) & 255,
            b: value & 255,
        };
    }

    private rgbToHex(r: number, g: number, b: number): string {
        return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
    }

    private getSecondaryColorStyle(key: ForecastSecondaryAttributeKey, value: unknown): Record<string, string> {
        const color = this.getSecondaryColor(key, value);
        return color ? {color} : {};
    }

    private getSecondaryColor(key: ForecastSecondaryAttributeKey, value: unknown): string | undefined {
        const ramp = this.resolveProperty(this.getSecondaryColorRampProp(key));
        if (!ramp || ramp === 'none') {
            return undefined;
        }

        const amount = this.normalizeSecondaryColorAmount(key, value);
        if (amount === null) {
            return undefined;
        }

        const colors = ramp === 'custom'
            ? [
                this.resolveProperty(this.getSecondaryColorLowProp(key)),
                this.resolveProperty(this.getSecondaryColorHighProp(key)),
            ]
            : SECONDARY_COLOR_RAMPS[key]?.[ramp];

        return colors ? this.interpolateRamp(colors, amount) : undefined;
    }

    private normalizeSecondaryColorAmount(key: ForecastSecondaryAttributeKey, value: unknown): number | null {
        const numberValue = this.getNumberValue(value);
        if (numberValue === null) {
            return null;
        }

        switch (key) {
            case 'humidity':
            case 'cloud_coverage':
                return Math.min(1, Math.max(0, numberValue / 100));
            case 'uv_index':
                return Math.min(1, Math.max(0, numberValue / 11));
            default:
                return null;
        }
    }

    private getSecondaryColorRampProp(key: ForecastSecondaryAttributeKey): string {
        return `${key}_color_ramp`;
    }

    private getSecondaryColorLowProp(key: ForecastSecondaryAttributeKey): string {
        return `${key}_color_low`;
    }

    private getSecondaryColorHighProp(key: ForecastSecondaryAttributeKey): string {
        return `${key}_color_high`;
    }

    private getConditionColor(condition: unknown): string {
        return CONDITION_COLORS[this.normalizeCondition(condition)] ?? CONDITION_COLORS.exceptional;
    }

    private normalizeCondition(condition: unknown): string {
        const value = String(condition || '').toLowerCase();
        return WEATHER_ICONS[value] ? value : 'exceptional';
    }

    private getWindBearingDegrees(value: unknown): number | null {
        const numberValue = this.getNumberValue(value);
        if (numberValue === null) return null;
        return ((numberValue % 360) + 360) % 360;
    }

    private getWindCardinalDirection(value: unknown): string {
        const degrees = this.getWindBearingDegrees(value);
        if (degrees === null) {
            return typeof value === 'string' ? value : '';
        }

        return CARDINAL_DIRECTIONS[Math.round(degrees / 22.5) % 16];
    }

    private getSecondaryTargetId(key: ForecastSecondaryAttributeKey): string {
        return SECONDARY_ATTRIBUTES.find((attribute) => attribute.key === key)?.targetId ?? 'secondary';
    }

    private getSecondaryIconTargetId(key: ForecastSecondaryAttributeKey): string {
        return `${this.getSecondaryTargetId(key)}-icon`;
    }

    private getSecondaryUnitTargetId(key: ForecastSecondaryAttributeKey): string {
        return `${this.getSecondaryTargetId(key)}-unit`;
    }

    private normalizeCssLength(value: unknown, fallback: string, allowPercent: boolean): string {
        const rawValue = String(value ?? '').trim();
        if (!rawValue) return fallback;

        if (/^\d+(\.\d+)?$/.test(rawValue)) {
            return `${rawValue}px`;
        }

        const units = allowPercent ? 'px|%' : 'px';
        const pattern = new RegExp(`^\\d+(\\.\\d+)?(${units})$`, 'i');
        return pattern.test(rawValue) ? rawValue : fallback;
    }

    private parseDate(value: unknown): Date | null {
        if (typeof value !== 'string' && typeof value !== 'number') {
            return null;
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    private getNumberValue(value: unknown): number | null {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }

        if (typeof value === 'string' && value.trim()) {
            const parsed = Number.parseFloat(value);
            return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
    }

    private getTargetActiveClass(targetId: string): string {
        return this.isStyleTargetActive(targetId) ? 'style-target-active' : '';
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-hourly-forecast': BlockHourlyForecast;
    }
}
