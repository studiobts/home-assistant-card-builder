import type { PropertyGroup, PropertyTrait } from '@/common/blocks/core/properties';
import type { BlockPanelTargetStyles } from '@/common/blocks/types';
import { BaseEntity } from '@/common/blocks/components/entities/base-entity';
import {
    type GaugeDisplayMode,
    type GaugeThreshold,
    type GaugeValueSource,
    normalizeGaugeThresholds,
} from './gauge-types';

export interface GaugeMetrics {
    rawValue: number;
    hasValue: boolean;
    min: number;
    max: number;
    span: number;
    normalized: number;
    percent: number;
    thresholds: GaugeThreshold[];
    activeThreshold?: GaugeThreshold;
}

export interface GaugeValueParts {
    valueText: string;
    unitText: string;
}

export type GaugeThresholdPlacement = 'none' | 'bar' | 'background' | 'both';

export interface GaugeColorChange {
    position: number;
    color: string;
}

export interface GaugeGradientStop {
    color: string;
    offset?: number;
}

export interface GaugeRGBColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

export abstract class BaseGauge extends BaseEntity {
    protected getBaseGaugePropertyGroups(): PropertyGroup[] {
        return [
            {
                id: 'data',
                label: 'Data',
                traits: [
                    {
                        type: 'select',
                        name: 'valueSource',
                        label: 'Value Source',
                        options: [
                            {value: 'state', label: 'State'},
                            {value: 'attribute', label: 'Attribute'},
                        ],
                    },
                    {
                        type: 'attribute-picker',
                        name: 'valueAttribute',
                        label: 'Value Attribute',
                        placeholder: 'Select or type attribute',
                        visible: {prop: 'valueSource', eq: 'attribute'},
                    },
                ],
            },
            {
                id: 'range',
                label: 'Range',
                traits: [
                    {
                        type: 'number',
                        name: 'minValue',
                        label: 'Min',
                        step: 0.1,
                        binding: {type: 'number'},
                    },
                    {
                        type: 'number',
                        name: 'maxValue',
                        label: 'Max',
                        step: 0.1,
                        binding: {type: 'number'},
                    },
                    {
                        type: 'checkbox',
                        name: 'clampValue',
                        label: 'Clamp Value',
                    },
                ],
            },
            {
                id: 'value',
                label: 'Value',
                traits: [
                    {
                        type: 'checkbox',
                        name: 'showValue',
                        label: 'Show Value',
                    },
                    {
                        type: 'select',
                        name: 'displayMode',
                        label: 'Display',
                        options: [
                            {value: 'value', label: 'Value'},
                            {value: 'percent', label: 'Percent'},
                        ],
                        visible: {prop: 'showValue', eq: true},
                    },
                    {
                        type: 'number',
                        name: 'decimalPlaces',
                        label: 'Decimals',
                        min: 0,
                        max: 6,
                        visible: {prop: 'showValue', eq: true},
                    },
                    {
                        type: 'checkbox',
                        name: 'showUnit',
                        label: 'Show Unit',
                        visible: {
                            and: [
                                {prop: 'showValue', eq: true},
                                {prop: 'displayMode', eq: 'value'},
                            ],
                        },
                    },
                    {
                        type: 'text',
                        name: 'customUnit',
                        label: 'Custom Unit',
                        placeholder: 'Leave empty for auto',
                        visible: {
                            and: [
                                {prop: 'showValue', eq: true},
                                {prop: 'displayMode', eq: 'value'},
                                {prop: 'showUnit', eq: true},
                            ],
                        },
                    },
                    {
                        type: 'select',
                        name: 'unitPosition',
                        label: 'Unit Position',
                        options: [
                            {value: 'inline', label: 'Inline'},
                            {value: 'below', label: 'Below Value'},
                        ],
                        visible: {
                            and: [
                                {prop: 'showValue', eq: true},
                                {prop: 'displayMode', eq: 'value'},
                                {prop: 'showUnit', eq: true},
                            ],
                        },
                    },
                ],
            },
            {
                id: 'thresholds',
                label: 'Thresholds',
                traits: [
                    {
                        type: 'checkbox',
                        name: 'thresholdsEnabled',
                        label: 'Enable Thresholds',
                    },
                    {
                        type: 'action',
                        name: 'editThresholds',
                        label: 'Thresholds',
                        buttonLabel: 'Edit Thresholds',
                        actionId: 'open-gauge-thresholds-editor',
                        icon: '◉',
                        visible: this.withThresholdsEnabledVisibility(),
                    },
                    {
                        type: 'checkbox',
                        name: 'valueFollowThresholdColor',
                        label: 'Value Follows Threshold Color',
                        visible: this.withThresholdsEnabledVisibility({prop: 'showValue', eq: true}),
                    },
                    {
                        type: 'checkbox',
                        name: 'showThresholdMarkers',
                        label: 'Show Markers',
                        visible: this.withThresholdsEnabledVisibility(),
                    },
                    {
                        type: 'number',
                        name: 'markerWidthRatio',
                        label: 'Marker Width Ratio',
                        min: 0.5,
                        max: 2,
                        step: 0.1,
                        visible: this.withThresholdsEnabledVisibility({prop: 'showThresholdMarkers', eq: true}),
                    },
                    {
                        type: 'number',
                        name: 'markerThicknessPx',
                        label: 'Marker Thickness (px)',
                        min: 0.5,
                        max: 20,
                        step: 0.5,
                        visible: this.withThresholdsEnabledVisibility({prop: 'showThresholdMarkers', eq: true}),
                    },
                    {
                        type: 'select',
                        name: 'thresholdColorMode',
                        label: 'Color Mode',
                        options: [
                            {value: 'active', label: 'Active Threshold'},
                            {value: 'none', label: 'None'},
                        ],
                        visible: this.withThresholdsEnabledVisibility(),
                    },
                ],
            },
            {
                id: 'behavior',
                label: 'Behavior',
                traits: [
                    {
                        type: 'checkbox',
                        name: 'animate',
                        label: 'Animate',
                    },
                    {
                        type: 'number',
                        name: 'animationDurationMs',
                        label: 'Animation (ms)',
                        min: 0,
                        max: 4000,
                        step: 10,
                        visible: {prop: 'animate', eq: true},
                    },
                ],
            },
        ];
    }

    protected getBaseGaugeTargetStyles(): BlockPanelTargetStyles {
        return {
            block: {
                styles: {
                    preset: 'full',
                },
            },
            value: {
                label: 'Value',
                description: 'Gauge value label',
                styles: {
                    preset: 'full',
                    exclude: {
                        groups: ['layout', 'flex'],
                    },
                },
            },
            unit: {
                label: 'Unit',
                description: 'Gauge unit label',
                styles: {
                    preset: 'full',
                    exclude: {
                        groups: ['layout', 'flex'],
                    },
                },
            },
        };
    }

    protected getBaseGaugePropertyGroup(id: string): PropertyGroup | undefined {
        return this.getBaseGaugePropertyGroups().find((group) => group.id === id);
    }

    protected buildMergedBaseDataGroup(options?: {
        insertAfterShowValueTraits?: PropertyTrait[];
        appendTraits?: PropertyTrait[];
        label?: string;
    }): PropertyGroup {
        const dataTraits = [...(this.getBaseGaugePropertyGroup('data')?.traits ?? [])];
        const rangeTraits = this.getBaseGaugePropertyGroup('range')?.traits ?? [];
        const valueTraits = this.getBaseGaugePropertyGroup('value')?.traits ?? [];
        const insertAfterShowValueTraits = options?.insertAfterShowValueTraits ?? [];

        dataTraits.push(...rangeTraits);

        let inserted = insertAfterShowValueTraits.length === 0;
        for (const trait of valueTraits) {
            dataTraits.push(trait);
            if (!inserted && trait.name === 'showValue') {
                dataTraits.push(...insertAfterShowValueTraits);
                inserted = true;
            }
        }

        if (!inserted) {
            dataTraits.push(...insertAfterShowValueTraits);
        }

        if (options?.appendTraits?.length) {
            dataTraits.push(...options.appendTraits);
        }

        return {
            id: 'data',
            label: options?.label ?? 'Data',
            traits: dataTraits,
        };
    }

    protected buildGaugeLabelModeTraits(options?: {
        modeName?: string;
        customName?: string;
        modeLabel?: string;
        customLabel?: string;
    }): PropertyTrait[] {
        const modeName = options?.modeName ?? 'labelMode';
        const customName = options?.customName ?? 'customLabel';
        return [
            {
                type: 'select',
                name: modeName,
                label: options?.modeLabel ?? 'Label',
                options: [
                    {value: 'hidden', label: 'Hidden'},
                    {value: 'entity', label: 'Entity Name'},
                    {value: 'custom', label: 'Custom Name'},
                ],
            },
            {
                type: 'text',
                name: customName,
                label: options?.customLabel ?? 'Custom Name',
                visible: {prop: modeName, eq: 'custom'},
            },
        ];
    }

    protected extendThresholdTraitsWithAdvancedColors(
        baseTraits: PropertyTrait[],
        options?: {
            singleColorModeLabel?: string;
            singleColorModeVisible?: PropertyTrait['visible'];
        }
    ): PropertyTrait[] {
        const singleColorModeLabel = options?.singleColorModeLabel ?? 'Single Color Mode';
        const singleColorModeVisible = options?.singleColorModeVisible ?? {prop: 'thresholdsApplyTo', in: ['none', 'background']};

        const thresholdModeTrait = baseTraits.find((trait) => trait.name === 'thresholdColorMode');
        const mappedThresholdModeTrait = thresholdModeTrait
            ? {
                ...thresholdModeTrait,
                label: singleColorModeLabel,
                visible: singleColorModeVisible,
            }
            : null;
        const baseTraitsWithoutMode = baseTraits.filter((trait) => trait.name !== 'thresholdColorMode');

        const traits: PropertyTrait[] = [
            ...baseTraitsWithoutMode,
            {
                type: 'color',
                name: 'thresholdBaseColor',
                label: 'Base Color',
            },
            {
                type: 'select',
                name: 'thresholdsApplyTo',
                label: 'Show Step Colors On',
                options: [
                    {value: 'none', label: 'Disabled'},
                    {value: 'bar', label: 'Bar'},
                    {value: 'background', label: 'Background'},
                    {value: 'both', label: 'Both'},
                ],
            },
            ...(mappedThresholdModeTrait ? [mappedThresholdModeTrait] : []),
            {
                type: 'checkbox',
                name: 'showStepColorsOnBarBlend',
                label: 'Blend Bar Colors',
                visible: {
                    prop: 'thresholdsApplyTo',
                    in: ['bar', 'both'],
                },
            },
            {
                type: 'number',
                name: 'showStepColorsOnBarBlendDistance',
                label: 'Bar Blend Distance',
                min: 0,
                max: 40,
                step: 0.5,
                visible: {
                    and: [
                        {prop: 'thresholdsApplyTo', in: ['bar', 'both']},
                        {prop: 'showStepColorsOnBarBlend', eq: true},
                    ],
                },
            },
            {
                type: 'number',
                name: 'showStepColorsOnBackgroundOpacity',
                label: 'Background Opacity',
                min: 0,
                max: 1,
                step: 0.05,
                visible: {
                    prop: 'thresholdsApplyTo',
                    in: ['background', 'both'],
                },
            },
            {
                type: 'checkbox',
                name: 'showStepColorsOnBackgroundBlend',
                label: 'Blend Background Colors',
                visible: {
                    prop: 'thresholdsApplyTo',
                    in: ['background', 'both'],
                },
            },
            {
                type: 'number',
                name: 'showStepColorsOnBackgroundBlendDistance',
                label: 'Background Blend Distance',
                min: 0,
                max: 40,
                step: 0.5,
                visible: {
                    and: [
                        {prop: 'thresholdsApplyTo', in: ['background', 'both']},
                        {prop: 'showStepColorsOnBackgroundBlend', eq: true},
                    ],
                },
            },
        ];

        return traits.map((trait) => {
            if (trait.name === 'thresholdsEnabled') {
                return trait;
            }
            return {
                ...trait,
                visible: this.withThresholdsEnabledVisibility(trait.visible),
            };
        });
    }

    protected withThresholdsEnabledVisibility(
        visible?: PropertyTrait['visible']
    ): PropertyTrait['visible'] {
        const enabledGuard: NonNullable<PropertyTrait['visible']> = {
            prop: 'thresholdsEnabled',
            eq: true,
        };
        if (!visible) {
            return enabledGuard;
        }
        return {
            and: [enabledGuard, visible],
        };
    }

    protected resolveThresholdsEnabled(): boolean {
        return this.resolvePropertyAsBoolean('thresholdsEnabled');
    }

    protected getThresholds(): GaugeThreshold[] {
        if (!this.resolveThresholdsEnabled()) {
            return [];
        }
        const raw = this.getTraitPropertyValue('thresholds');
        return normalizeGaugeThresholds(raw);
    }

    protected resolveGaugeMetrics(): GaugeMetrics {
        const {min, max, span} = this.resolveGaugeRange();
        const parsedValue = this.resolveGaugeRawValue();
        const hasValue = parsedValue !== null;
        const value = hasValue ? parsedValue! : min;
        const rawNormalized = (value - min) / span;
        const clamp = this.resolvePropertyAsBoolean('clampValue');
        const normalized = clamp ? this.clamp(rawNormalized, 0, 1) : rawNormalized;
        const percent = normalized * 100;
        const thresholds = this.getThresholds();
        const activeThreshold = this.resolveActiveThreshold(value, thresholds);

        return {
            rawValue: value,
            hasValue,
            min,
            max,
            span,
            normalized,
            percent,
            thresholds,
            activeThreshold,
        };
    }

    protected resolveGaugeValueParts(metrics: GaugeMetrics): GaugeValueParts {
        if (!metrics.hasValue) {
            return {
                valueText: '—',
                unitText: '',
            };
        }

        const displayMode = this.resolveProperty('displayMode', 'value') as GaugeDisplayMode;
        const decimals = Math.max(0, Math.min(6, this.resolvePropertyAsNumber('decimalPlaces', 1)));
        if (displayMode === 'percent') {
            return {
                valueText: this.formatNumber(metrics.percent, decimals),
                unitText: '%',
            };
        }

        const unit = this.resolveGaugeUnit();
        return {
            valueText: this.formatNumber(metrics.rawValue, decimals),
            unitText: unit,
        };
    }

    protected resolveGaugeUnit(): string {
        const showUnit = this.resolvePropertyAsBoolean('showUnit');
        if (!showUnit) {
            return '';
        }

        const customUnit = this.resolveProperty('customUnit', '').trim();
        if (customUnit) {
            return customUnit;
        }
        return String(this.getEntityAttribute('unit_of_measurement') || '');
    }

    protected resolveActiveThresholdColor(metrics: GaugeMetrics): string | undefined {
        if (!this.resolveThresholdsEnabled()) {
            return undefined;
        }
        if (this.resolveProperty('thresholdColorMode', 'active') !== 'active') {
            return undefined;
        }
        return metrics.activeThreshold?.color;
    }

    protected resolveValueTextColor(metrics: GaugeMetrics): string | undefined {
        if (!this.resolveThresholdsEnabled()) {
            return undefined;
        }
        const follow = this.resolvePropertyAsBoolean('valueFollowThresholdColor');
        if (!follow) {
            return undefined;
        }
        const active = metrics.activeThreshold?.color;
        if (active) {
            return active;
        }
        const baseColor = this.resolveProperty('thresholdBaseColor', '').trim();
        return baseColor || undefined;
    }

    protected resolveThresholdBaseColor(): string {
        if (!this.resolveThresholdsEnabled()) {
            return '';
        }
        return this.resolveProperty('thresholdBaseColor', '').trim();
    }

    protected resolveGlowIntensity(): number {
        return this.clamp(this.resolvePropertyAsNumber('progressGlowIntensity', 6), 1, 40);
    }

    protected resolveThresholdPlacement(): GaugeThresholdPlacement {
        if (!this.resolveThresholdsEnabled()) {
            return 'none';
        }

        const rawPlacement = this.getTraitPropertyValue('thresholdsApplyTo');
        const placement = typeof rawPlacement === 'string' ? rawPlacement : undefined;
        const isValidPlacement = placement === 'bar' || placement === 'background' || placement === 'both' || placement === 'none';

        if (isValidPlacement) {
            return placement;
        }

        return 'none';
    }

    protected buildThresholdColorChanges(defaultColor: string, min: number, span: number): GaugeColorChange[] {
        const safeSpan = Math.max(1e-9, span);
        const changes: GaugeColorChange[] = [{position: 0, color: defaultColor}];
        for (const threshold of this.getThresholds()) {
            if (!threshold.color) {
                continue;
            }
            const normalized = this.clamp((threshold.value - min) / safeSpan, 0, 1);
            const last = changes[changes.length - 1];
            if (Math.abs(last.position - normalized) < 1e-6) {
                last.color = threshold.color;
                continue;
            }
            changes.push({position: normalized, color: threshold.color});
        }
        return changes;
    }

    protected buildThresholdGradientStops(
        colorChanges: GaugeColorChange[],
        blendEnabled: boolean,
        blendDistance: number
    ): Array<{ offset: number; color: string }> {
        if (colorChanges.length === 0) {
            return [{offset: 0, color: '#2196f3'}, {offset: 1, color: '#2196f3'}];
        }

        const changes = [...colorChanges].sort((a, b) => a.position - b.position);
        if (!blendEnabled || changes.length < 2) {
            const stops: Array<{ offset: number; color: string }> = [];
            for (let index = 0; index < changes.length; index += 1) {
                const current = changes[index];
                const start = this.clamp(current.position, 0, 1);
                const end = index < changes.length - 1
                    ? this.clamp(changes[index + 1].position, 0, 1)
                    : 1;
                stops.push({offset: start, color: current.color});
                stops.push({offset: end, color: current.color});
            }
            return stops;
        }

        const blendSize = this.clamp(blendDistance / 100, 0, 0.6);
        const stops: Array<{ offset: number; color: string }> = [];
        let currentColor = changes[0].color;
        let cursor = 0;
        stops.push({offset: 0, color: currentColor});

        for (let index = 1; index < changes.length; index += 1) {
            const threshold = this.clamp(changes[index].position, 0, 1);
            const nextColor = changes[index].color;
            if (threshold <= cursor) {
                currentColor = nextColor;
                continue;
            }

            const half = blendSize / 2;
            const blendStart = this.clamp(threshold - half, cursor, 1);
            const blendEnd = this.clamp(threshold + half, blendStart, 1);

            stops.push({offset: blendStart, color: currentColor});
            stops.push({offset: blendEnd, color: nextColor});

            cursor = blendEnd;
            currentColor = nextColor;
        }

        stops.push({offset: 1, color: currentColor});
        return stops;
    }

    protected buildLinearThresholdGradient(
        direction: 'to right' | 'to left' | 'to top' | 'to bottom',
        colorChanges: Array<{position: number; color: string}>,
        blendEnabled: boolean,
        blendDistance: number
    ): string {
        const stops = this.buildThresholdGradientStops(colorChanges, blendEnabled, blendDistance);
        const cssStops = stops.map((stop) => `${stop.color} ${this.clamp(stop.offset ?? 0, 0, 1) * 100}%`);
        if (cssStops.length === 0) {
            return `linear-gradient(${direction}, #2196f3 0%, #2196f3 100%)`;
        }
        if (cssStops.length === 1) {
            const color = stops[0]?.color ?? '#2196f3';
            return `linear-gradient(${direction}, ${color} 0%, ${color} 100%)`;
        }
        return `linear-gradient(${direction}, ${cssStops.join(', ')})`;
    }

    protected resolveGaugeLabelText(modeProp = 'labelMode', customProp = 'customLabel'): string {
        const mode = this.resolveProperty(modeProp, 'hidden');
        if (mode === 'hidden') {
            return '';
        }
        if (mode === 'custom') {
            return this.resolveProperty(customProp, '').trim();
        }
        return this.getEntityName();
    }

    protected resolvePreferredPaint(
        style: Record<string, string>,
        fallbackColor: string,
        order: Array<'stroke' | 'background' | 'backgroundImage' | 'backgroundColor'> = ['background', 'backgroundImage', 'backgroundColor']
    ): string {
        for (const key of order) {
            if (key === 'stroke') {
                const stroke = style.stroke;
                if (typeof stroke === 'string' && stroke.trim()) {
                    return stroke.trim();
                }
                continue;
            }
            if (key === 'background') {
                const background = style.background;
                if (typeof background === 'string' && background.trim()) {
                    return background.trim();
                }
                continue;
            }
            if (key === 'backgroundImage') {
                const backgroundImage = style.backgroundImage ?? style['background-image'];
                if (typeof backgroundImage === 'string' && backgroundImage.trim()) {
                    return backgroundImage.trim();
                }
                continue;
            }
            const backgroundColor = style.backgroundColor ?? style['background-color'];
            if (typeof backgroundColor === 'string' && backgroundColor.trim()) {
                return backgroundColor.trim();
            }
        }
        return fallbackColor;
    }

    protected extractFirstLinearGradientExpression(paint: string): string | null {
        const lower = paint.toLowerCase();
        const startIndex = lower.indexOf('linear-gradient(');
        if (startIndex < 0) {
            return null;
        }
        const openIndex = paint.indexOf('(', startIndex);
        if (openIndex < 0) {
            return null;
        }
        let depth = 0;
        for (let index = openIndex; index < paint.length; index += 1) {
            const char = paint[index];
            if (char === '(') {
                depth += 1;
                continue;
            }
            if (char === ')') {
                depth -= 1;
                if (depth === 0) {
                    return paint.slice(startIndex, index + 1).trim();
                }
            }
        }
        return null;
    }

    protected parseLinearGradientExpression(
        expression: string
    ): { direction: string; stops: GaugeGradientStop[] } | null {
        const match = expression.match(/^linear-gradient\(([\s\S]+)\)$/i);
        if (!match) {
            return null;
        }
        const tokens = this.splitTopLevelCommaSeparated(match[1]);
        if (tokens.length === 0) {
            return null;
        }
        const firstToken = tokens[0].trim();
        let direction = 'to right';
        let stopTokens = tokens;
        if (this.isGradientDirectionToken(firstToken)) {
            direction = firstToken;
            stopTokens = tokens.slice(1);
        }
        const stops: GaugeGradientStop[] = [];
        for (const token of stopTokens) {
            const parsed = this.parseGradientStopToken(token);
            if (parsed) {
                stops.push(parsed);
            }
        }
        if (stops.length === 0) {
            return null;
        }
        return {direction, stops};
    }

    protected splitTopLevelCommaSeparated(input: string): string[] {
        const parts: string[] = [];
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
                parts.push(input.slice(start, index).trim());
                start = index + 1;
            }
        }
        const tail = input.slice(start).trim();
        if (tail) {
            parts.push(tail);
        }
        return parts.filter((part) => part.length > 0);
    }

    protected isGradientDirectionToken(token: string): boolean {
        const normalized = token.trim().toLowerCase();
        if (!normalized) {
            return false;
        }
        if (normalized.startsWith('to ')) {
            return true;
        }
        return /^-?\d*\.?\d+(deg|rad|turn)$/.test(normalized);
    }

    protected parseGradientStopToken(token: string): GaugeGradientStop | null {
        const trimmed = token.trim();
        if (!trimmed) {
            return null;
        }
        const splitIndex = this.findLastTopLevelWhitespace(trimmed);
        if (splitIndex < 0) {
            return {color: trimmed};
        }
        const color = trimmed.slice(0, splitIndex).trim();
        const offsetToken = trimmed.slice(splitIndex + 1).trim();
        const offset = this.parseGradientOffset(offsetToken);
        if (offset === null || !color) {
            return {color: trimmed};
        }
        return {color, offset};
    }

    protected findLastTopLevelWhitespace(input: string): number {
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

    protected parseGradientOffset(raw: string): number | null {
        const normalized = raw.trim().toLowerCase();
        if (!normalized) {
            return null;
        }
        if (normalized.endsWith('%')) {
            const pct = parseFloat(normalized.slice(0, -1));
            if (!Number.isFinite(pct)) {
                return null;
            }
            return this.clamp(pct / 100, 0, 1);
        }
        const numeric = parseFloat(normalized);
        if (!Number.isFinite(numeric)) {
            return null;
        }
        return this.clamp(numeric, 0, 1);
    }

    protected resolveGradientStopOffsets(stops: GaugeGradientStop[]): GaugeGradientStop[] {
        if (stops.length === 0) {
            return [];
        }
        const resolved: GaugeGradientStop[] = stops.map((stop) => ({...stop}));
        if (resolved[0].offset === undefined) {
            resolved[0].offset = 0;
        }
        if (resolved[resolved.length - 1].offset === undefined) {
            resolved[resolved.length - 1].offset = 1;
        }
        let anchor = 0;
        while (anchor < resolved.length - 1) {
            if (resolved[anchor].offset === undefined) {
                anchor += 1;
                continue;
            }
            let next = anchor + 1;
            while (next < resolved.length && resolved[next].offset === undefined) {
                next += 1;
            }
            if (next >= resolved.length) {
                break;
            }
            const startOffset = resolved[anchor].offset ?? 0;
            const endOffset = resolved[next].offset ?? startOffset;
            const gap = next - anchor;
            if (gap > 1) {
                for (let i = 1; i < gap; i += 1) {
                    const ratio = i / gap;
                    resolved[anchor + i].offset = startOffset + (endOffset - startOffset) * ratio;
                }
            }
            anchor = next;
        }
        let previous = 0;
        for (const stop of resolved) {
            const offset = this.clamp(stop.offset ?? previous, 0, 1);
            stop.offset = Math.max(previous, offset);
            previous = stop.offset;
        }
        return resolved;
    }

    protected resolveGradientVector(
        direction: string,
        rect: { minX: number; minY: number; width: number; height: number }
    ): { x1: number; y1: number; x2: number; y2: number } {
        const minX = rect.minX;
        const minY = rect.minY;
        const maxX = rect.minX + rect.width;
        const maxY = rect.minY + rect.height;
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const normalizedDirection = direction.trim().toLowerCase();

        if (normalizedDirection.startsWith('to ')) {
            const hasLeft = normalizedDirection.includes('left');
            const hasRight = normalizedDirection.includes('right');
            const hasTop = normalizedDirection.includes('top');
            const hasBottom = normalizedDirection.includes('bottom');
            const x1 = hasRight ? minX : hasLeft ? maxX : cx;
            const x2 = hasRight ? maxX : hasLeft ? minX : cx;
            const y1 = hasBottom ? minY : hasTop ? maxY : cy;
            const y2 = hasBottom ? maxY : hasTop ? minY : cy;
            return {x1, y1, x2, y2};
        }

        const angleMatch = normalizedDirection.match(/^(-?\d*\.?\d+)(deg|rad|turn)$/);
        if (!angleMatch) {
            return {x1: minX, y1: cy, x2: maxX, y2: cy};
        }

        const numeric = parseFloat(angleMatch[1]);
        const unit = angleMatch[2];
        const radians = unit === 'deg'
            ? (numeric * Math.PI) / 180
            : unit === 'turn'
                ? numeric * Math.PI * 2
                : numeric;
        const dx = Math.sin(radians);
        const dy = -Math.cos(radians);
        const halfDiagonal = Math.hypot(rect.width, rect.height) / 2;
        return {
            x1: cx - dx * halfDiagonal,
            y1: cy - dy * halfDiagonal,
            x2: cx + dx * halfDiagonal,
            y2: cy + dy * halfDiagonal,
        };
    }

    protected resolveGlowColorFromPaint(paint: string, fallback: string): string {
        const trimmed = paint.trim();
        if (!trimmed) {
            return fallback;
        }
        const gradientExpression = this.extractFirstLinearGradientExpression(trimmed);
        if (gradientExpression) {
            const parsedGradient = this.parseLinearGradientExpression(gradientExpression);
            const resolvedStops = parsedGradient ? this.resolveGradientStopOffsets(parsedGradient.stops) : [];
            return resolvedStops[0]?.color ?? fallback;
        }
        return trimmed;
    }

    protected parseColor(value: string): GaugeRGBColor | null {
        const input = value.trim();
        if (input.startsWith('#')) {
            const hex = input.slice(1);
            if (hex.length === 3 || hex.length === 4) {
                const r = parseInt(hex[0] + hex[0], 16);
                const g = parseInt(hex[1] + hex[1], 16);
                const b = parseInt(hex[2] + hex[2], 16);
                const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
                return {r, g, b, a};
            }
            if (hex.length === 6 || hex.length === 8) {
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
                return {r, g, b, a};
            }
            return null;
        }
        const rgbaMatch = input.match(/^rgba?\(([^)]+)\)$/i);
        if (!rgbaMatch) {
            return null;
        }
        const parts = rgbaMatch[1].split(',').map((part) => part.trim());
        if (parts.length < 3) {
            return null;
        }
        const r = parseFloat(parts[0]);
        const g = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);
        const a = parts.length >= 4 ? parseFloat(parts[3]) : 1;
        if (![r, g, b, a].every((item) => Number.isFinite(item))) {
            return null;
        }
        return {r, g, b, a};
    }

    protected mixColors(left: GaugeRGBColor, right: GaugeRGBColor, ratio: number): GaugeRGBColor {
        return {
            r: left.r + (right.r - left.r) * ratio,
            g: left.g + (right.g - left.g) * ratio,
            b: left.b + (right.b - left.b) * ratio,
            a: left.a + (right.a - left.a) * ratio,
        };
    }

    protected rgbToString(color: GaugeRGBColor): string {
        const r = Math.round(this.clamp(color.r, 0, 255));
        const g = Math.round(this.clamp(color.g, 0, 255));
        const b = Math.round(this.clamp(color.b, 0, 255));
        const a = this.clamp(color.a, 0, 1);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    protected resolveUnitPosition(): 'inline' | 'below' {
        const position = this.resolveProperty('unitPosition', 'inline');
        return position === 'below' ? 'below' : 'inline';
    }

    protected resolveMarkerWidthRatio(): number {
        return this.clamp(this.resolvePropertyAsNumber('markerWidthRatio', 1.2), 0.5, 2);
    }

    protected resolveMarkerThicknessPx(): number {
        return Math.max(0.5, this.resolvePropertyAsNumber('markerThicknessPx', 2));
    }

    protected getAnimationDurationMs(): number {
        if (!this.resolvePropertyAsBoolean('animate')) {
            return 0;
        }
        return Math.max(0, this.resolvePropertyAsNumber('animationDurationMs', 350));
    }

    protected formatNumber(value: number, decimals: number): string {
        return value.toFixed(decimals);
    }

    protected clamp(value: number, min: number, max: number): number {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    protected getTraitPropertyValue(name: string): unknown {
        const raw = this.block?.props?.[name];
        if (!raw || typeof raw !== 'object') {
            return undefined;
        }
        const candidate = raw as { value?: unknown };
        return candidate.value;
    }

    private resolveGaugeRawValue(): number | null {
        const state = this.getEntityState();
        if (!state) {
            return null;
        }

        const source = this.resolveProperty('valueSource', 'state') as GaugeValueSource;
        if (source === 'attribute') {
            const attribute = this.resolveProperty('valueAttribute', '').trim();
            if (!attribute) {
                return null;
            }
            const attributeValue = this.getEntityAttribute(attribute);
            const parsedAttribute = parseFloat(String(attributeValue));
            return Number.isFinite(parsedAttribute) ? parsedAttribute : null;
        }

        const parsedState = parseFloat(state.state);
        return Number.isFinite(parsedState) ? parsedState : null;
    }

    private resolveGaugeRange(): { min: number; max: number; span: number } {
        let min = this.resolvePropertyAsNumber('minValue', 0);
        let max = this.resolvePropertyAsNumber('maxValue', 100);
        if (max < min) {
            const swap = min;
            min = max;
            max = swap;
        }
        if (max === min) {
            max = min + 1;
        }
        return {
            min,
            max,
            span: max - min,
        };
    }

    private resolveActiveThreshold(value: number, thresholds: GaugeThreshold[]): GaugeThreshold | undefined {
        let active: GaugeThreshold | undefined;
        for (const threshold of thresholds) {
            if (value >= threshold.value) {
                active = threshold;
            } else {
                break;
            }
        }
        return active;
    }
}
