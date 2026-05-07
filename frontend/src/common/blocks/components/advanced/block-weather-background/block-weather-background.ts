import { BaseEntity } from '@/common/blocks/components/entities/base-entity';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { isExternalUrl, isManagedMediaReference, mediaContentIdToPublicUrl } from '@/common/media';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { HassEntity } from 'home-assistant-js-websocket';
import background1Svg from './backgrounds/background-1.svg?raw';

const ROLE_ATTR = 'data-cb-weather-background-role';
const WEATHER_ATTR = 'data-cb-weather-background-weather';
const PHASE_ATTR = 'data-cb-weather-background-phase';
const ORIGINAL_DISPLAY_ATTR = 'data-cb-weather-background-original-display';
const ORIGINAL_TRANSFORM_ATTR = 'data-cb-weather-background-original-transform';
const RUNTIME_ATTR = 'data-cb-weather-background-runtime';
const SUN_ENTITY_ID = 'sun.sun';
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_UPDATE_MINUTES = 10;
const MIN_UPDATE_MINUTES = 5;
const MAX_UPDATE_MINUTES = 60;
const UPDATE_STEP_MINUTES = 5;
const DEFAULT_SVG_BACKGROUND = 'background-1';

const WEATHER_CONDITIONS = [
    'clear-night',
    'cloudy',
    'exceptional',
    'fog',
    'hail',
    'lightning',
    'lightning-rainy',
    'partlycloudy',
    'pouring',
    'rainy',
    'snowy',
    'snowy-rainy',
    'sunny',
    'windy',
    'windy-variant',
] as const;

type WeatherCondition = typeof WEATHER_CONDITIONS[number];
type SolarPhase = 'day' | 'night' | 'dawn' | 'dusk';
type SvgSource = 'default' | 'media';

interface DefaultSvgBackground {
    id: string;
    label: string;
    fileName: string;
    svg: string;
}

const DEFAULT_SVG_BACKGROUNDS: DefaultSvgBackground[] = [
    {
        id: DEFAULT_SVG_BACKGROUND,
        label: 'Background #1',
        fileName: 'background-1.svg',
        svg: background1Svg,
    },
];

interface SkyPalette {
    top: string;
    middle: string;
    bottom: string;
    cloudOpacity: string;
}

interface WeatherAnimationVariables {
    cloudSpeed: string;
    cloudBobSpeed: string;
    rainSpeed: string;
    rainOpacity: string;
    pouringSpeed: string;
    pouringOpacity: string;
    snowSpeed: string;
    snowOpacity: string;
    hailSpeed: string;
    hailOpacity: string;
    lightningSpeed: string;
    lightningIntensity: string;
    windSpeed: string;
    windOpacity: string;
    fogSpeed: string;
    exceptionalSpeed: string;
    exceptionalOpacity: string;
    starSpeed: string;
    starOpacity: string;
    sunPulseSpeed: string;
}

interface SolarContext {
    progress: number | null;
    phase: SolarPhase;
    phaseTokens: Set<string>;
    sunVisible: boolean;
    warnings: string[];
}

interface SvgPreparationResult {
    markup: string;
    warnings: string[];
}

@customElement('block-weather-background')
export class BlockWeatherBackground extends BaseEntity {
    static styles = [
        ...BaseEntity.styles,
        css`
            :host {
                display: block;
                padding: 0;
                overflow: hidden;
                min-width: 1px;
                min-height: 1px;
                background: transparent;
            }

            .weather-background {
                position: relative;
                width: 100%;
                height: auto;
                overflow: hidden;
            }

            .svg-stage svg {
                display: block;
                width: 100%;
                height: 100%;
            }

            .svg-stage.animations-disabled svg,
            .svg-stage.animations-disabled svg *,
            .svg-stage.animations-disabled svg *::before,
            .svg-stage.animations-disabled svg *::after {
                animation: none !important;
                transition: none !important;
            }

            .warnings {
                position: absolute;
                z-index: 2;
                top: 8px;
                left: 8px;
                right: 8px;
                max-height: calc(100% - 16px);
                overflow: auto;
                box-sizing: border-box;
                padding: 8px 10px;
                border: 1px solid rgba(255, 214, 102, 0.7);
                border-radius: 6px;
                background: rgba(38, 31, 16, 0.88);
                color: #fff6d8;
                font-size: 12px;
                line-height: 1.35;
                pointer-events: none;
                text-align: left;
            }

            .warning + .warning {
                margin-top: 4px;
            }
        `,
    ];

    @state() private svgMarkup = background1Svg;
    @state() private svgWarnings: string[] = [];
    @state() private svgLoadWarning: string | null = null;

    private loadedSourceKey = '';
    private loadingSourceKey = '';
    private loadSequence = 0;
    private updateTimerId: number | null = null;
    private updateTimerMinutes: number | null = null;
    private runtimeFrameId: number | null = null;

    static getBlockConfig(): BlockRegistration {
        return {
            sinceVersion: '2.1.0',
            definition: {
                label: 'Weather Background',
                icon: '<ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>',
                category: 'advanced',
            },
            defaults: {
                requireEntity: true,
                props: {
                    svgSource: {value: 'default'},
                    defaultSvgBackground: {value: DEFAULT_SVG_BACKGROUND},
                    mediaReference: {value: ''},
                    animationsEnabled: {value: true},
                    showSvgWarnings: {value: true},
                    sunPositionUpdateMinutes: {value: DEFAULT_UPDATE_MINUTES},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'svg',
                        label: 'SVG',
                        traits: [
                            {
                                type: 'select',
                                name: 'svgSource',
                                label: 'SVG Source',
                                options: [
                                    {value: 'default', label: 'Default SVG'},
                                    {value: 'media', label: 'Media Library'},
                                ],
                            },
                            {
                                type: 'select',
                                name: 'defaultSvgBackground',
                                label: 'Default Background',
                                options: DEFAULT_SVG_BACKGROUNDS.map((background) => ({
                                    value: background.id,
                                    label: background.label,
                                })),
                                visible: {
                                    prop: 'svgSource',
                                    eq: 'default',
                                },
                            },
                            {
                                type: 'media-picker',
                                name: 'mediaReference',
                                label: 'Custom SVG',
                                emptyLabel: 'No SVG selected',
                                selectLabel: 'Select SVG',
                                editLabel: 'Edit',
                                removeLabel: 'Remove',
                                sourceProp: 'svgSource',
                                sourceValue: 'media',
                                visible: {
                                    prop: 'svgSource',
                                    eq: 'media',
                                },
                                binding: {
                                    type: 'text',
                                    placeholder: 'cb-media://local/card_builder/weather.svg',
                                },
                            },
                            {
                                type: 'checkbox',
                                name: 'animationsEnabled',
                                label: 'Enable Animations',
                            },
                            {
                                type: 'checkbox',
                                name: 'showSvgWarnings',
                                label: 'Show SVG Warnings',
                            },
                        ],
                    },
                    {
                        id: 'sun',
                        label: 'Sun',
                        traits: [
                            {
                                type: 'slider',
                                name: 'sunPositionUpdateMinutes',
                                label: 'Update Interval',
                                min: MIN_UPDATE_MINUTES,
                                max: MAX_UPDATE_MINUTES,
                                step: UPDATE_STEP_MINUTES,
                                binding: {
                                    type: 'slider',
                                    min: MIN_UPDATE_MINUTES,
                                    max: MAX_UPDATE_MINUTES,
                                    step: UPDATE_STEP_MINUTES,
                                },
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
            },
        };
    }

    connectedCallback(): void {
        super.connectedCallback();
        void this.ensureSvgLoaded();
    }

    disconnectedCallback(): void {
        this.clearUpdateTimer();
        if (this.runtimeFrameId !== null) {
            window.cancelAnimationFrame(this.runtimeFrameId);
            this.runtimeFrameId = null;
        }
        super.disconnectedCallback();
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        this.syncUpdateTimer();
        void this.ensureSvgLoaded();
        this.scheduleRuntimeApply();
    }

    getBlockEntities(): string[] | undefined {
        const entities = new Set<string>();
        const weatherEntity = this.resolvedEntityId();
        if (weatherEntity) {
            entities.add(weatherEntity);
        }
        entities.add(SUN_ENTITY_ID);
        return Array.from(entities);
    }

    render() {
        const warnings = this.getVisibleWarnings();
        const animationsEnabled = this.areAnimationsEnabled();

        return html`
            <div class="weather-background">
                <div class="svg-stage ${animationsEnabled ? '' : 'animations-disabled'}">
                    ${this.svgMarkup ? unsafeHTML(this.svgMarkup) : nothing}
                </div>
                ${warnings.length > 0 ? html`
                    <div class="warnings" role="alert">
                        ${warnings.map((warning) => html`<div class="warning">${warning}</div>`)}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private async ensureSvgLoaded(): Promise<void> {
        const source = this.getSvgSource();
        const defaultBackground = this.getDefaultSvgBackground();
        const reference = this.resolveProperty('mediaReference', '');
        const sourceKey = source === 'media' ? `media:${reference}` : `default:${defaultBackground.id}`;

        if (sourceKey === this.loadedSourceKey || sourceKey === this.loadingSourceKey) {
            return;
        }

        const sequence = ++this.loadSequence;
        this.loadingSourceKey = sourceKey;

        try {
            const rawSvg = await this.loadRawSvg(source, reference);
            if (sequence !== this.loadSequence) return;

            const prepared = this.prepareSvg(rawSvg);
            this.svgMarkup = prepared.markup;
            this.svgWarnings = prepared.warnings;
            this.svgLoadWarning = source === 'media' && !reference
                ? 'No custom SVG selected; using the default weather background SVG.'
                : null;
            this.loadedSourceKey = sourceKey;
        } catch (err) {
            if (sequence !== this.loadSequence) return;

            const fallback = this.prepareSvg(this.getDefaultSvgBackground().svg);
            this.svgMarkup = fallback.markup;
            this.svgWarnings = fallback.warnings;
            this.svgLoadWarning = `Unable to load custom weather SVG: ${this.getErrorMessage(err)}. Using the default SVG.`;
            this.loadedSourceKey = sourceKey;
        } finally {
            if (sequence === this.loadSequence) {
                this.loadingSourceKey = '';
                this.scheduleRuntimeApply();
            }
        }
    }

    private async loadRawSvg(source: SvgSource, reference: string): Promise<string> {
        if (source === 'default') {
            return this.getDefaultSvgBackground().svg;
        }

        if (!reference) {
            return this.getDefaultSvgBackground().svg;
        }

        const url = this.resolveSvgUrl(reference);
        if (!url) {
            throw new Error('the selected media reference cannot be resolved');
        }

        const response = await fetch(url, {credentials: 'same-origin'});
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.text();
    }

    private resolveSvgUrl(reference: string): string | null {
        if (isManagedMediaReference(reference)) {
            return mediaContentIdToPublicUrl(reference);
        }

        if (isExternalUrl(reference) || reference.startsWith('/')) {
            return reference;
        }

        return reference || null;
    }

    private prepareSvg(rawSvg: string): SvgPreparationResult {
        const doc = this.parseSvg(rawSvg);
        this.sanitizeSvgDocument(doc);

        const warnings = this.validateSvgDocument(doc);
        const svg = doc.documentElement;
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.setAttribute('preserveAspectRatio', svg.getAttribute('preserveAspectRatio') || 'xMidYMid slice');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('aria-hidden', 'true');

        const existingClass = svg.getAttribute('class');
        svg.setAttribute('class', existingClass ? `${existingClass} cb-weather-background-svg` : 'cb-weather-background-svg');

        return {
            markup: new XMLSerializer().serializeToString(svg),
            warnings,
        };
    }

    private parseSvg(rawSvg: string): XMLDocument {
        const doc = new DOMParser().parseFromString(rawSvg, 'image/svg+xml');
        const root = doc.documentElement;
        const parserErrors = doc.getElementsByTagName('parsererror');

        if (!root || root.localName.toLowerCase() !== 'svg' || parserErrors.length > 0) {
            throw new Error('the selected file is not a valid SVG document');
        }

        return doc;
    }

    private sanitizeSvgDocument(doc: XMLDocument): void {
        const blockedSelectors = 'script, foreignObject, iframe, object, embed, link';
        doc.querySelectorAll(blockedSelectors).forEach((node) => node.remove());

        doc.querySelectorAll('*').forEach((element) => {
            for (const attribute of Array.from(element.attributes)) {
                const name = attribute.name.toLowerCase();
                const value = attribute.value.trim().toLowerCase();

                if (name.startsWith('on')) {
                    element.removeAttribute(attribute.name);
                    continue;
                }

                if ((name === 'href' || name === 'xlink:href') && value.startsWith('javascript:')) {
                    element.removeAttribute(attribute.name);
                    continue;
                }

                if (name === 'style' && value.includes('javascript:')) {
                    element.removeAttribute(attribute.name);
                }
            }
        });
    }

    private validateSvgDocument(doc: XMLDocument): string[] {
        const warnings: string[] = [];
        const skyElements = this.findElementsByRole(doc, 'sky');
        const sunArcElements = this.findElementsByRole(doc, 'sun-arc');
        const sunElements = this.findElementsByRole(doc, 'sun');
        const sunArcPaths = sunArcElements.filter((element) => element.localName.toLowerCase() === 'path');

        if (skyElements.length === 0) {
            warnings.push(`Missing SVG element with ${ROLE_ATTR}="sky".`);
        }

        if (sunArcPaths.length === 0) {
            warnings.push(`Missing SVG path with ${ROLE_ATTR}="sun-arc".`);
        }

        if (sunElements.length === 0) {
            warnings.push(`Missing SVG element with ${ROLE_ATTR}="sun".`);
        }

        const coveredWeather = new Set<string>();
        doc.querySelectorAll(`[${WEATHER_ATTR}]`).forEach((element) => {
            this.getTokenList(element.getAttribute(WEATHER_ATTR)).forEach((token) => coveredWeather.add(token));
        });

        for (const condition of WEATHER_CONDITIONS) {
            if (!coveredWeather.has(condition)) {
                warnings.push(`Missing weather representation for "${condition}".`);
            }
        }

        const hasTwilightElement = Array.from(doc.querySelectorAll(`[${PHASE_ATTR}]`))
            .some((element) => {
                const tokens = this.getTokenList(element.getAttribute(PHASE_ATTR));
                return tokens.includes('dawn') || tokens.includes('dusk') || tokens.includes('twilight');
            });
        if (!hasTwilightElement) {
            warnings.push(`Missing sunrise/sunset phase representation using ${PHASE_ATTR}="dawn dusk twilight".`);
        }

        return warnings;
    }

    private findElementsByRole(doc: XMLDocument | SVGElement, role: string): Element[] {
        return Array.from(doc.querySelectorAll(`[${ROLE_ATTR}]`))
            .filter((element) => this.getTokenList(element.getAttribute(ROLE_ATTR)).includes(role));
    }

    private scheduleRuntimeApply(): void {
        if (this.runtimeFrameId !== null) {
            window.cancelAnimationFrame(this.runtimeFrameId);
        }

        this.runtimeFrameId = window.requestAnimationFrame(() => {
            this.runtimeFrameId = null;
            this.applyRuntimeSvgState();
        });
    }

    private applyRuntimeSvgState(): void {
        const svg = this.renderRoot.querySelector('.svg-stage svg') as SVGSVGElement | null;
        if (!svg) return;

        svg.setAttribute('data-cb-weather-background-runtime-active', 'true');

        const weatherCondition = this.getWeatherCondition();
        const solarContext = this.getSolarContext();
        const palette = this.getSkyPalette(weatherCondition, solarContext.phase);
        const animationVariables = this.getWeatherAnimationVariables(weatherCondition, solarContext.phase);
        const weatherTokens = this.getWeatherTokens(weatherCondition);

        this.applySkyPalette(svg, palette);
        this.applyWeatherAnimationVariables(svg, animationVariables);
        this.applyAnimationState(svg, this.areAnimationsEnabled());
        this.applyConditionalVisibility(svg, weatherTokens, solarContext.phaseTokens);
        this.applySunPosition(svg, solarContext, weatherTokens);
    }

    private applySkyPalette(svg: SVGSVGElement, palette: SkyPalette): void {
        svg.style.setProperty('--cb-weather-background-sky-top', palette.top);
        svg.style.setProperty('--cb-weather-background-sky-middle', palette.middle);
        svg.style.setProperty('--cb-weather-background-sky-bottom', palette.bottom);
        svg.style.setProperty('--cb-weather-background-cloud-opacity', palette.cloudOpacity);

        const gradientId = `cb-weather-background-sky-${this.getSafeBlockId()}`;
        const gradient = this.ensureRuntimeSkyGradient(svg, gradientId);
        const stops = Array.from(gradient.querySelectorAll('stop'));
        const colors = [palette.top, palette.middle, palette.bottom];
        const offsets = ['0%', '58%', '100%'];

        stops.forEach((stop, index) => {
            stop.setAttribute('offset', offsets[index]);
            stop.setAttribute('stop-color', colors[index]);
        });

        this.findElementsByRole(svg, 'sky').forEach((element) => {
            element.setAttribute('fill', `url(#${gradientId})`);
        });
    }

    private applyWeatherAnimationVariables(
        svg: SVGSVGElement,
        variables: WeatherAnimationVariables
    ): void {
        svg.style.setProperty('--cb-weather-background-cloud-speed', variables.cloudSpeed);
        svg.style.setProperty('--cb-weather-background-cloud-bob-speed', variables.cloudBobSpeed);
        svg.style.setProperty('--cb-weather-background-rain-speed', variables.rainSpeed);
        svg.style.setProperty('--cb-weather-background-rain-opacity', variables.rainOpacity);
        svg.style.setProperty('--cb-weather-background-pouring-speed', variables.pouringSpeed);
        svg.style.setProperty('--cb-weather-background-pouring-opacity', variables.pouringOpacity);
        svg.style.setProperty('--cb-weather-background-snow-speed', variables.snowSpeed);
        svg.style.setProperty('--cb-weather-background-snow-opacity', variables.snowOpacity);
        svg.style.setProperty('--cb-weather-background-hail-speed', variables.hailSpeed);
        svg.style.setProperty('--cb-weather-background-hail-opacity', variables.hailOpacity);
        svg.style.setProperty('--cb-weather-background-lightning-speed', variables.lightningSpeed);
        svg.style.setProperty('--cb-weather-background-lightning-intensity', variables.lightningIntensity);
        svg.style.setProperty('--cb-weather-background-wind-speed', variables.windSpeed);
        svg.style.setProperty('--cb-weather-background-wind-opacity', variables.windOpacity);
        svg.style.setProperty('--cb-weather-background-fog-speed', variables.fogSpeed);
        svg.style.setProperty('--cb-weather-background-exceptional-speed', variables.exceptionalSpeed);
        svg.style.setProperty('--cb-weather-background-exceptional-opacity', variables.exceptionalOpacity);
        svg.style.setProperty('--cb-weather-background-star-speed', variables.starSpeed);
        svg.style.setProperty('--cb-weather-background-star-opacity', variables.starOpacity);
        svg.style.setProperty('--cb-weather-background-sun-pulse-speed', variables.sunPulseSpeed);
    }

    private applyAnimationState(svg: SVGSVGElement, enabled: boolean): void {
        svg.dataset.cbWeatherBackgroundAnimations = enabled ? 'enabled' : 'disabled';
        svg.style.setProperty('--cb-weather-background-animation-play-state', enabled ? 'running' : 'paused');

        try {
            if (enabled) {
                svg.unpauseAnimations();
            } else {
                svg.pauseAnimations();
            }
        } catch (_err) {
            // Some browsers do not expose SVG animation controls for all SVG fragments.
        }
    }

    private ensureRuntimeSkyGradient(svg: SVGSVGElement, gradientId: string): SVGLinearGradientElement {
        const namespace = 'http://www.w3.org/2000/svg';
        let defs = svg.querySelector(`defs[${RUNTIME_ATTR}="true"]`) as SVGDefsElement | null;

        if (!defs) {
            defs = document.createElementNS(namespace, 'defs');
            defs.setAttribute(RUNTIME_ATTR, 'true');
            svg.insertBefore(defs, svg.firstChild);
        }

        let gradient = defs.querySelector(`#${gradientId}`) as SVGLinearGradientElement | null;
        if (!gradient) {
            gradient = document.createElementNS(namespace, 'linearGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('x1', '0');
            gradient.setAttribute('y1', '0');
            gradient.setAttribute('x2', '0');
            gradient.setAttribute('y2', '1');

            for (let i = 0; i < 3; i += 1) {
                gradient.appendChild(document.createElementNS(namespace, 'stop'));
            }

            defs.appendChild(gradient);
        }

        return gradient;
    }

    private applyConditionalVisibility(
        svg: SVGSVGElement,
        weatherTokens: Set<string>,
        phaseTokens: Set<string>
    ): void {
        const conditionalElements = svg.querySelectorAll(`[${WEATHER_ATTR}], [${PHASE_ATTR}]`);
        conditionalElements.forEach((element) => {
            this.setSvgElementVisible(element as SVGElement, this.shouldShowForRuntimeConditions(
                element,
                weatherTokens,
                phaseTokens
            ));
        });
    }

    private shouldShowForRuntimeConditions(
        element: Element,
        weatherTokens: Set<string>,
        phaseTokens: Set<string>
    ): boolean {
        const weatherMatches = this.matchesTokens(element.getAttribute(WEATHER_ATTR), weatherTokens);
        const phaseMatches = this.matchesTokens(element.getAttribute(PHASE_ATTR), phaseTokens);
        return weatherMatches && phaseMatches;
    }

    private applySunPosition(
        svg: SVGSVGElement,
        solarContext: SolarContext,
        weatherTokens: Set<string>
    ): void {
        const sunArc = this.findElementsByRole(svg, 'sun-arc')
            .find((element): element is SVGPathElement => element instanceof SVGPathElement);
        const sunElements = this.findElementsByRole(svg, 'sun') as SVGElement[];

        if (!sunArc || sunElements.length === 0) {
            return;
        }

        const progress = solarContext.progress;
        if (!solarContext.sunVisible || progress === null) {
            sunElements.forEach((element) => this.setSvgElementVisible(element, false));
            return;
        }

        try {
            const point = sunArc.getPointAtLength(sunArc.getTotalLength() * progress);
            sunElements.forEach((element) => {
                const originalTransform = this.getOriginalTransform(element);
                const transform = `${originalTransform} translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`.trim();
                element.setAttribute('transform', transform);
                const shouldShow = this.shouldShowForRuntimeConditions(
                    element,
                    weatherTokens,
                    solarContext.phaseTokens
                );
                this.setSunElementVisible(element, shouldShow);
            });
        } catch (_err) {
            sunElements.forEach((element) => this.setSvgElementVisible(element, false));
        }
    }

    private setSunElementVisible(element: SVGElement, visible: boolean): void {
        if (!visible) {
            this.setSvgElementVisible(element, false);
            return;
        }

        element.removeAttribute('display');
        element.style.display = '';
    }

    private setSvgElementVisible(element: SVGElement, visible: boolean): void {
        if (!element.hasAttribute(ORIGINAL_DISPLAY_ATTR)) {
            element.setAttribute(ORIGINAL_DISPLAY_ATTR, element.getAttribute('display') || element.style.display || '');
        }

        if (visible) {
            const originalDisplay = element.getAttribute(ORIGINAL_DISPLAY_ATTR) || '';
            if (originalDisplay) {
                element.setAttribute('display', originalDisplay);
            } else {
                element.removeAttribute('display');
            }
            element.style.display = '';
            return;
        }

        element.setAttribute('display', 'none');
        element.style.display = 'none';
    }

    private getOriginalTransform(element: SVGElement): string {
        if (!element.hasAttribute(ORIGINAL_TRANSFORM_ATTR)) {
            element.setAttribute(ORIGINAL_TRANSFORM_ATTR, element.getAttribute('transform') || '');
        }
        return element.getAttribute(ORIGINAL_TRANSFORM_ATTR) || '';
    }

    private getWeatherCondition(): WeatherCondition {
        const state = this.getEntityState();
        const value = String(state?.state || '').toLowerCase();
        if (this.isWeatherCondition(value)) {
            return value;
        }
        return 'exceptional';
    }

    private isWeatherCondition(value: string): value is WeatherCondition {
        return (WEATHER_CONDITIONS as readonly string[]).includes(value);
    }

    private getWeatherTokens(condition: WeatherCondition): Set<string> {
        const tokens = new Set<string>([condition]);

        if (condition === 'pouring') {
            tokens.add('rainy');
        }
        if (condition === 'lightning-rainy') {
            tokens.add('lightning');
            tokens.add('rainy');
        }
        if (condition === 'snowy-rainy') {
            tokens.add('snowy');
            tokens.add('rainy');
        }
        if (condition === 'windy-variant') {
            tokens.add('windy');
        }
        if (condition === 'clear-night') {
            tokens.add('night');
            tokens.add('clear');
        }

        return tokens;
    }

    private getSolarContext(): SolarContext {
        const warnings: string[] = [];
        const sunState = this.getSunState();

        if (!sunState) {
            warnings.push(`${SUN_ENTITY_ID} entity not found.`);
            return this.buildSolarContext(null, 'night', warnings);
        }

        const progress = this.calculateSunProgress(sunState, warnings);
        const phase = this.calculateSolarPhase(sunState, progress);
        return this.buildSolarContext(progress, phase, warnings);
    }

    private buildSolarContext(progress: number | null, phase: SolarPhase, warnings: string[]): SolarContext {
        const phaseTokens = new Set<string>([phase]);
        const sunVisible = progress !== null && progress >= 0 && progress <= 1;

        if (phase === 'dawn' || phase === 'dusk') {
            phaseTokens.add('twilight');
            phaseTokens.add('day');
        }

        if (sunVisible) {
            phaseTokens.add('sun-up');
        } else {
            phaseTokens.add('sun-down');
        }

        return {
            progress,
            phase,
            phaseTokens,
            sunVisible,
            warnings,
        };
    }

    private calculateSunProgress(sunState: HassEntity, warnings: string[]): number | null {
        const nextRising = this.parseDate(sunState.attributes?.next_rising);
        const nextSetting = this.parseDate(sunState.attributes?.next_setting);

        if (!nextRising || !nextSetting) {
            warnings.push(`${SUN_ENTITY_ID} is missing next_rising or next_setting attributes.`);
            return null;
        }

        const now = Date.now();
        const isAboveHorizon = sunState.state === 'above_horizon';
        const isRising = this.isSunRising(sunState);

        if (isAboveHorizon) {
            return this.normalizeBetween(now, nextRising.getTime() - DAY_MS, nextSetting.getTime());
        }

        if (isRising) {
            return this.normalizeBetween(now, nextRising.getTime(), nextSetting.getTime());
        }

        return this.normalizeBetween(now, nextRising.getTime() - DAY_MS, nextSetting.getTime() - DAY_MS);
    }

    private calculateSolarPhase(sunState: HassEntity, progress: number | null): SolarPhase {
        if (progress !== null && progress >= 0 && progress <= 1) {
            if (progress <= 0.12) return 'dawn';
            if (progress >= 0.88) return 'dusk';
            return 'day';
        }

        const now = Date.now();
        const nextDawn = this.parseDate(sunState.attributes?.next_dawn);
        const nextRising = this.parseDate(sunState.attributes?.next_rising);
        const nextSetting = this.parseDate(sunState.attributes?.next_setting);
        const nextDusk = this.parseDate(sunState.attributes?.next_dusk);

        if (nextDawn && nextRising && now >= nextDawn.getTime() && now <= nextRising.getTime()) {
            return 'dawn';
        }

        if (nextSetting && nextDusk) {
            const previousSetting = nextSetting.getTime() - DAY_MS;
            const previousDusk = nextDusk.getTime() - DAY_MS;
            if (now >= previousSetting && now <= previousDusk) {
                return 'dusk';
            }
        }

        if (progress !== null && progress < 0 && progress > -0.12) {
            return 'dawn';
        }

        if (progress !== null && progress > 1 && progress < 1.12) {
            return 'dusk';
        }

        return 'night';
    }

    private getSkyPalette(condition: WeatherCondition, phase: SolarPhase): SkyPalette {
        if (phase === 'night') {
            if (condition === 'clear-night') {
                return {top: '#050b18', middle: '#0b1630', bottom: '#182a46', cloudOpacity: '0.72'};
            }
            if (condition === 'lightning' || condition === 'lightning-rainy' || condition === 'exceptional') {
                return {top: '#030711', middle: '#111827', bottom: '#263044', cloudOpacity: '0.9'};
            }
            return {top: '#08111f', middle: '#151d2b', bottom: '#263446', cloudOpacity: '0.86'};
        }

        if (phase === 'dawn') {
            return this.adjustTwilightPalette(condition, {
                top: '#324b83',
                middle: '#f09b72',
                bottom: '#ffe4aa',
                cloudOpacity: '0.84',
            });
        }

        if (phase === 'dusk') {
            return this.adjustTwilightPalette(condition, {
                top: '#2d356f',
                middle: '#d97873',
                bottom: '#ffc477',
                cloudOpacity: '0.88',
            });
        }

        switch (condition) {
            case 'cloudy':
            case 'partlycloudy':
                return {top: '#7898ad', middle: '#b7c8d1', bottom: '#e2e7e8', cloudOpacity: '0.96'};
            case 'fog':
                return {top: '#a8b4bb', middle: '#cdd4d7', bottom: '#ebeeee', cloudOpacity: '0.74'};
            case 'hail':
            case 'snowy':
            case 'snowy-rainy':
                return {top: '#86a8bd', middle: '#c9dce5', bottom: '#f6fbff', cloudOpacity: '0.88'};
            case 'rainy':
            case 'pouring':
                return {top: '#33485f', middle: '#6c7c8b', bottom: '#aab4bc', cloudOpacity: '0.92'};
            case 'lightning':
            case 'lightning-rainy':
                return {top: '#1b2231', middle: '#424b5e', bottom: '#7c8795', cloudOpacity: '0.95'};
            case 'exceptional':
                return {top: '#442640', middle: '#9a5756', bottom: '#e0a06c', cloudOpacity: '0.9'};
            case 'windy':
            case 'windy-variant':
                return {top: '#68a7d0', middle: '#a4d0ea', bottom: '#e0f3fa', cloudOpacity: '0.72'};
            case 'clear-night':
                return {top: '#050b18', middle: '#0b1630', bottom: '#182a46', cloudOpacity: '0.72'};
            case 'sunny':
            default:
                return {top: '#61b8f4', middle: '#a8dcff', bottom: '#e8f7ff', cloudOpacity: '0.68'};
        }
    }

    private adjustTwilightPalette(condition: WeatherCondition, base: SkyPalette): SkyPalette {
        switch (condition) {
            case 'cloudy':
            case 'partlycloudy':
            case 'fog':
                return {top: '#5f7185', middle: '#c29286', bottom: '#e1c8a3', cloudOpacity: '0.94'};
            case 'rainy':
            case 'pouring':
            case 'lightning':
            case 'lightning-rainy':
            case 'exceptional':
                return {top: '#202738', middle: '#705365', bottom: '#aa7664', cloudOpacity: '0.95'};
            case 'snowy':
            case 'snowy-rainy':
            case 'hail':
                return {top: '#6d829b', middle: '#d4b6a5', bottom: '#f4ddbd', cloudOpacity: '0.88'};
            default:
                return base;
        }
    }

    private getWeatherAnimationVariables(
        condition: WeatherCondition,
        phase: SolarPhase
    ): WeatherAnimationVariables {
        const base: WeatherAnimationVariables = {
            cloudSpeed: '52s',
            cloudBobSpeed: '9s',
            rainSpeed: '0.9s',
            rainOpacity: '0.76',
            pouringSpeed: '0.55s',
            pouringOpacity: '0.9',
            snowSpeed: '7s',
            snowOpacity: '0.94',
            hailSpeed: '1.4s',
            hailOpacity: '0.92',
            lightningSpeed: '2.8s',
            lightningIntensity: '0.78',
            windSpeed: '2.8s',
            windOpacity: '0.82',
            fogSpeed: '24s',
            exceptionalSpeed: '3.6s',
            exceptionalOpacity: '0.78',
            starSpeed: '4s',
            starOpacity: phase === 'night' ? '0.96' : '0.35',
            sunPulseSpeed: phase === 'day' ? '5s' : '3.6s',
        };

        switch (condition) {
            case 'cloudy':
                return {...base, cloudSpeed: '42s', cloudBobSpeed: '10s'};
            case 'partlycloudy':
                return {...base, cloudSpeed: '58s', cloudBobSpeed: '11s'};
            case 'rainy':
                return {...base, cloudSpeed: '38s', rainSpeed: '0.82s', rainOpacity: '0.78'};
            case 'pouring':
                return {...base, cloudSpeed: '34s', rainSpeed: '0.72s', pouringSpeed: '0.48s', pouringOpacity: '0.96'};
            case 'lightning':
                return {...base, cloudSpeed: '32s', lightningSpeed: '2.2s', lightningIntensity: '0.88'};
            case 'lightning-rainy':
                return {
                    ...base,
                    cloudSpeed: '30s',
                    rainSpeed: '0.7s',
                    rainOpacity: '0.86',
                    lightningSpeed: '2.1s',
                    lightningIntensity: '0.94',
                };
            case 'snowy':
                return {...base, cloudSpeed: '46s', snowSpeed: '8.5s', snowOpacity: '0.96'};
            case 'snowy-rainy':
                return {...base, cloudSpeed: '40s', rainSpeed: '1s', rainOpacity: '0.58', snowSpeed: '7.2s'};
            case 'hail':
                return {...base, cloudSpeed: '34s', hailSpeed: '1.05s', hailOpacity: '0.96'};
            case 'fog':
                return {...base, cloudSpeed: '64s', cloudBobSpeed: '14s', fogSpeed: '30s'};
            case 'windy':
                return {...base, cloudSpeed: '26s', windSpeed: '2.1s', windOpacity: '0.84'};
            case 'windy-variant':
                return {...base, cloudSpeed: '20s', windSpeed: '1.55s', windOpacity: '0.92'};
            case 'exceptional':
                return {
                    ...base,
                    cloudSpeed: '24s',
                    lightningSpeed: '1.9s',
                    lightningIntensity: '0.9',
                    windSpeed: '1.8s',
                    exceptionalSpeed: '2.4s',
                    exceptionalOpacity: '0.86',
                };
            case 'clear-night':
                return {...base, starSpeed: '3.6s', starOpacity: '0.98', cloudSpeed: '70s'};
            case 'sunny':
            default:
                return base;
        }
    }

    private getVisibleWarnings(): string[] {
        const warnings: string[] = [];

        if (this.shouldShowSvgWarnings()) {
            if (this.svgLoadWarning) {
                warnings.push(this.svgLoadWarning);
            }

            warnings.push(...this.svgWarnings);
        }
        warnings.push(...this.getRuntimeWarnings());
        return Array.from(new Set(warnings));
    }

    private getRuntimeWarnings(): string[] {
        const warnings: string[] = [];
        const weatherEntity = this.resolvedEntityId();

        if (!weatherEntity) {
            warnings.push('Weather entity is not configured.');
        } else if (!weatherEntity.startsWith('weather.')) {
            warnings.push(`Configured entity "${weatherEntity}" is not a weather entity.`);
        } else if (this.hass && !this.hass.states[weatherEntity]) {
            warnings.push(`Weather entity "${weatherEntity}" was not found in Home Assistant states.`);
        } else {
            const state = this.getEntityState();
            const value = String(state?.state || '').toLowerCase();
            if (value && !this.isWeatherCondition(value)) {
                warnings.push(`Unsupported weather state "${value}"; using exceptional fallback.`);
            }
        }

        if (this.hass && !this.hass.states[SUN_ENTITY_ID]) {
            warnings.push(`${SUN_ENTITY_ID} was not found in Home Assistant states.`);
        } else {
            warnings.push(...this.getSolarContext().warnings);
        }

        return warnings;
    }

    private getSunState(): HassEntity | null {
        return this.hass?.states[SUN_ENTITY_ID] ?? null;
    }

    private getSvgSource(): SvgSource {
        return this.resolveProperty('svgSource', 'default') === 'media' ? 'media' : 'default';
    }

    private getDefaultSvgBackground(): DefaultSvgBackground {
        const selected = this.resolveProperty('defaultSvgBackground', DEFAULT_SVG_BACKGROUND);
        return DEFAULT_SVG_BACKGROUNDS.find((background) => background.id === selected)
            ?? DEFAULT_SVG_BACKGROUNDS[0];
    }

    private shouldShowSvgWarnings(): boolean {
        return this.resolvePropertyAsBoolean('showSvgWarnings');
    }

    private areAnimationsEnabled(): boolean {
        return this.resolvePropertyAsBoolean('animationsEnabled');
    }

    private syncUpdateTimer(): void {
        const minutes = this.getUpdateIntervalMinutes();
        if (this.updateTimerMinutes === minutes && this.updateTimerId !== null) {
            return;
        }

        this.clearUpdateTimer();
        this.updateTimerMinutes = minutes;
        this.updateTimerId = window.setInterval(() => {
            this.requestUpdate();
            this.scheduleRuntimeApply();
        }, minutes * 60 * 1000);
    }

    private clearUpdateTimer(): void {
        if (this.updateTimerId !== null) {
            window.clearInterval(this.updateTimerId);
            this.updateTimerId = null;
        }
    }

    private getUpdateIntervalMinutes(): number {
        const rawValue = this.resolvePropertyAsNumber('sunPositionUpdateMinutes', DEFAULT_UPDATE_MINUTES);
        const clamped = Math.min(MAX_UPDATE_MINUTES, Math.max(MIN_UPDATE_MINUTES, rawValue));
        return Math.round(clamped / UPDATE_STEP_MINUTES) * UPDATE_STEP_MINUTES;
    }

    private getTokenList(value: string | null): string[] {
        if (!value) return [];
        return value
            .split(/\s+/)
            .map((token) => token.trim().toLowerCase())
            .filter(Boolean);
    }

    private matchesTokens(value: string | null, activeTokens: Set<string>): boolean {
        const tokens = this.getTokenList(value);
        if (tokens.length === 0) return true;
        if (tokens.includes('all')) return true;
        return tokens.some((token) => activeTokens.has(token));
    }

    private parseDate(value: unknown): Date | null {
        if (typeof value !== 'string' && typeof value !== 'number') {
            return null;
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    private normalizeBetween(value: number, start: number, end: number): number | null {
        const duration = end - start;
        if (!Number.isFinite(duration) || duration <= 0) {
            return null;
        }
        return (value - start) / duration;
    }

    private isSunRising(sunState: HassEntity): boolean {
        const rising = sunState.attributes?.rising;
        return rising === true || rising === 'true';
    }

    private getSafeBlockId(): string {
        return (this.block?.id || 'default').replace(/[^a-zA-Z0-9_-]/g, '-');
    }

    private getErrorMessage(err: unknown): string {
        return err instanceof Error ? err.message : String(err);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-weather-background': BlockWeatherBackground;
    }
}
