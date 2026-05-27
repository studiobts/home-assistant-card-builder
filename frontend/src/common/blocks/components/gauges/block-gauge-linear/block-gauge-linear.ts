import { type BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import type { TraitPropertyValue } from '@/common/blocks/core/properties';
import { BaseLinearGauge, type LinearShellType } from '@/common/blocks/components/gauges/base-linear-gauge';
import { isExternalUrl, isManagedMediaReference, mediaContentIdToPublicUrl } from '@/common/media';
import { css, html, nothing, svg, type PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

interface LinearShellDefinition {
    id: 'battery-1' | 'tank-1';
    label: string;
    fileName: string;
    defaultInsets: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

type LinearShellTransformMode = 'none' | 'flip-horizontal' | 'rotate-left' | 'rotate-right';
type LinearShellOffsetSide = 'top' | 'right' | 'bottom' | 'left';

const DEFAULT_LINEAR_SHELLS: LinearShellDefinition[] = [
    {
        id: 'battery-1',
        label: 'Battery #1',
        fileName: 'battery_1.png',
        defaultInsets: {top: 10.5, right: 0.9, bottom: 5.5, left: 2.1},
    },
    {
        id: 'tank-1',
        label: 'Tank #1',
        fileName: 'tank_1.png',
        defaultInsets: {top: 24.8, right: 10.6, bottom: 17.4, left: 2.7},
    },
];

@customElement('block-gauge-linear')
export class BlockGaugeLinear extends BaseLinearGauge {
    private readonly _patternSvgId = Math.random().toString(36).slice(2, 8);
    private _lastShellType: LinearShellType | null = null;

    private _offsetEditorDragState: {
        pointerId: number;
        side: LinearShellOffsetSide;
        rect: DOMRect;
    } | null = null;

    static styles = [
        ...BaseLinearGauge.styles,
        css`
            :host {
                display: block;
                min-width: 60px;
                min-height: 18px;
            }

            .linear-root {
                display: flex;
                width: 100%;
                height: 100%;
                align-items: center;
                gap: 8px;
            }

            .linear-root.horizontal {
                flex-direction: column;
                align-items: stretch;
                gap: 4px;
            }

            .bar-row {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                min-width: 0;
            }

            .linear-root.vertical {
                flex-direction: column;
                justify-content: center;
                min-height: 100px;
            }

            .track {
                position: relative;
                flex: 1 1 auto;
                width: 100%;
                height: 100%;
                min-height: 8px;
                min-width: 8px;
                overflow: hidden;
                border-radius: inherit;
                background: rgba(0, 0, 0, 0.16);
            }

            .linear-root.vertical .track {
                width: 100%;
                height: 100%;
                min-height: 40px;
                flex: 1 1 auto;
            }

            .fill {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: var(--accent-color, #2196f3);
            }

            .fill-glow {
                position: absolute;
                inset: 0;
                pointer-events: none;
                border-radius: inherit;
                overflow: visible;
            }

            .fill-glow-source {
                position: absolute;
                inset: 0;
                border-radius: inherit;
            }

            .track-thresholds {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                pointer-events: none;
            }

            .bar-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: inherit;
            }

            .value {
                display: inline-flex;
                align-items: baseline;
                gap: 4px;
                white-space: nowrap;
                z-index: 2;
                pointer-events: none;
            }

            .label {
                display: inline-flex;
                align-items: center;
                white-space: nowrap;
                z-index: 5;
                pointer-events: none;
            }

            .label-row {
                display: flex;
                width: 100%;
                min-width: 0;
                pointer-events: none;
            }

            .label-row.align-left {
                justify-content: flex-start;
            }

            .label-row.align-center {
                justify-content: center;
            }

            .label-row.align-right {
                justify-content: flex-end;
            }

            .label-row.top {
                order: 0;
            }

            .label-row.bottom {
                order: 2;
            }

            .bar-row {
                order: 1;
            }

            .label.vertical.top {
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
            }

            .label.vertical.bottom {
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
            }

            .value.unit-below {
                flex-direction: column;
                align-items: center;
                gap: 0;
                line-height: 1.1;
            }

            .value-number {
                display: inline-grid;
                align-items: baseline;
                justify-items: end;
            }

            .value-number-layer {
                grid-area: 1 / 1;
                justify-self: end;
            }

            .value-placeholder {
                visibility: hidden;
                pointer-events: none;
                justify-self: start;
            }

            .value.inside {
                position: absolute;
            }

            .value.inside.horizontal.inside-start {
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
            }

            .value.inside.horizontal.inside-center {
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            .value.inside.horizontal.inside-end {
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
            }

            .value.inside.vertical.inside-start {
                top: 8px;
                left: 50%;
                transform: translateX(-50%);
            }

            .value.inside.vertical.inside-center {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .value.inside.vertical.inside-end {
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
            }

            .marker {
                position: absolute;
                width: 2px;
                height: 100%;
                transform: translateX(-50%);
                pointer-events: auto;
                background: rgba(0, 0, 0, 0.55);
            }

            .linear-root.vertical .marker {
                width: 100%;
                height: 2px;
                transform: translateY(50%);
                background: rgba(0, 0, 0, 0.55);
            }

            .shell-layer {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 3;
            }

            .shell-layer svg {
                display: block;
                width: 100%;
                height: 100%;
                overflow: visible;
            }

            .shell-image-svg {
                display: block;
                width: 100%;
                height: 100%;
                overflow: visible;
            }

            .shell-offset-editor {
                position: absolute;
                inset: 0;
                z-index: 6;
                pointer-events: none;
            }

            .shell-offset-overlay {
                position: absolute;
                inset: 0;
                border: 1px dashed rgba(0, 120, 212, 0.45);
                background: rgba(0, 120, 212, 0.04);
                box-sizing: border-box;
            }

            .shell-offset-inner {
                position: absolute;
                border: 1px solid rgba(0, 120, 212, 0.95);
                background: rgba(0, 120, 212, 0.10);
                box-sizing: border-box;
                pointer-events: none;
            }

            .shell-offset-line {
                position: absolute;
                pointer-events: auto;
                touch-action: none;
            }

            .shell-offset-line.top,
            .shell-offset-line.bottom {
                left: 0;
                right: 0;
                height: 12px;
                margin-top: -6px;
                cursor: ns-resize;
            }

            .shell-offset-line.top::after,
            .shell-offset-line.bottom::after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                top: 50%;
                border-top: 2px solid rgba(0, 120, 212, 1);
            }

            .shell-offset-line.left,
            .shell-offset-line.right {
                top: 0;
                bottom: 0;
                width: 12px;
                margin-left: -6px;
                cursor: ew-resize;
            }

            .shell-offset-line.left::after,
            .shell-offset-line.right::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50%;
                border-left: 2px solid rgba(0, 120, 212, 1);
            }

            .shell-offset-line.right {
                margin-left: 0;
                margin-right: -6px;
            }

            .shell-offset-badge {
                position: absolute;
                z-index: 1;
                pointer-events: none;
                border-radius: 3px;
                background: rgba(0, 0, 0, 0.72);
                color: #fff;
                font-size: 10px;
                line-height: 1;
                padding: 2px 4px;
                white-space: nowrap;
            }

            .shell-offset-badge.top {
                left: 50%;
                transform: translate(-50%, -100%);
            }

            .shell-offset-badge.bottom {
                left: 50%;
                transform: translate(-50%, 0);
            }

            .shell-offset-badge.left {
                top: 50%;
                transform: translate(-100%, -50%);
            }

            .shell-offset-badge.right {
                top: 50%;
                transform: translate(0, -50%);
            }

            .fx-overlay {
                position: absolute;
                z-index: 7;
                pointer-events: none;
                background: transparent;
                box-sizing: border-box;
                border-radius: inherit;
            }

        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            sinceVersion: '2.4.0',
            definition: {
                label: 'Gauge Linear',
                icon: '<ha-icon icon="mdi:gauge"></ha-icon>',
                category: 'gauges',
            },
            defaults: {
                requireEntity: true,
                props: {
                    valueSource: {value: 'state'},
                    valueAttribute: {value: ''},
                    minValue: {value: 0},
                    maxValue: {value: 100},
                    clampValue: {value: true},
                    showValue: {value: true},
                    displayMode: {value: 'value'},
                    decimalPlaces: {value: 1},
                    showUnit: {value: true},
                    customUnit: {value: ''},
                    unitPosition: {value: 'inline'},
                    thresholds: {value: []},
                    thresholdsEnabled: {value: false},
                    showThresholdMarkers: {value: false},
                    markerWidthRatio: {value: 1.2},
                    markerThicknessPx: {value: 2},
                    thresholdColorMode: {value: 'active'},
                    thresholdBaseColor: {value: ''},
                    thresholdsApplyTo: {value: 'none'},
                    showStepColorsOnBarBlend: {value: false},
                    showStepColorsOnBarBlendDistance: {value: 4},
                    showStepColorsOnBackgroundOpacity: {value: 0.28},
                    showStepColorsOnBackgroundBlend: {value: false},
                    showStepColorsOnBackgroundBlendDistance: {value: 4},
                    animate: {value: true},
                    animationDurationMs: {value: 350},
                    valueFollowThresholdColor: {value: false},
                    orientation: {value: 'horizontal'},
                    horizontalFillDirection: {value: 'left-to-right'},
                    verticalFillDirection: {value: 'bottom-to-top'},
                    horizontalBarHeight: {value: 40},
                    barCornerRadius: {value: 0},
                    showBackground: {value: true},
                    shellType: {value: 'none'},
                    shellPngMediaReference: {value: ''},
                    shellBarInsetTopPct: {value: 0},
                    shellBarInsetRightPct: {value: 0},
                    shellBarInsetBottomPct: {value: 0},
                    shellBarInsetLeftPct: {value: 0},
                    shellVisualOffsetEditing: {value: false},
                    fillPattern: {value: 'none'},
                    patternCount: {value: 1},
                    patternGapX: {value: 2},
                    patternGapY: {value: 2},
                    patternStrokeWidth: {value: 1.6},
                    patternOnBackground: {value: false},
                    progressGlow: {value: false},
                    progressGlowIntensity: {value: 6},
                    valuePositionHorizontal: {value: 'inside-center'},
                    valuePositionVertical: {value: 'inside-center'},
                    labelMode: {value: 'hidden'},
                    customLabel: {value: ''},
                    labelPositionHorizontal: {value: 'top-center'},
                    labelPositionVertical: {value: 'top'},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
            actionTargets: {
                value: {label: 'Value', description: 'Gauge value label'},
                fill: {label: 'Fill', description: 'Gauge fill area'},
                label: {label: 'Label', description: 'Gauge label'},
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: this.getLinearGaugePanelPropertyGroups(),
            },
            targetStyles: {
                ...this.getBaseGaugeTargetStyles(),
                ...this.getLinearGaugeTargetStyles(),
            },
        };
    }

    connectedCallback(): void {
        super.connectedCallback();
        if (this.environment?.isBuilder) {
            this.documentModel.addEventListener('selection-changed', this.onBuilderSelectionChanged);
        }
    }

    disconnectedCallback(): void {
        if (this.environment?.isBuilder) {
            this.documentModel.removeEventListener('selection-changed', this.onBuilderSelectionChanged);
        }
        this.stopShellOffsetEditingDrag();
        super.disconnectedCallback();
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        this.syncShellInsetsFromDefaultsOnTypeChange();
        if (
            this.environment?.isBuilder
            && !this.selected
            && this.resolvePropertyAsBoolean('shellVisualOffsetEditing')
        ) {
            this.stopShellOffsetEditingDrag();
            this.setShellVisualOffsetEditing(false);
            return;
        }
        if (!this.shouldShowShellOffsetEditor()) {
            this.stopShellOffsetEditingDrag();
        }
    }

    private syncShellInsetsFromDefaultsOnTypeChange(): void {
        if (!this.block) return;

        const shellType = this.resolveProperty('shellType', 'none') as LinearShellType;
        if (this._lastShellType === null) {
            this._lastShellType = shellType;
            return;
        }
        if (shellType === this._lastShellType) {
            return;
        }
        this._lastShellType = shellType;

        if (shellType === 'none' || shellType === 'custom-png') {
            return;
        }

        const defaults = this.getDefaultShell(shellType).defaultInsets;
        const insetProps = [
            ['shellBarInsetTopPct', defaults.top],
            ['shellBarInsetRightPct', defaults.right],
            ['shellBarInsetBottomPct', defaults.bottom],
            ['shellBarInsetLeftPct', defaults.left],
        ] as const;

        const nextProps: Record<string, TraitPropertyValue> = {};
        let hasChanges = false;

        for (const [propName, defaultValue] of insetProps) {
            const currentRaw = this.block.props?.[propName];
            const currentValue = this.resolvePropertyAsNumber(propName, 0);
            if (Math.abs(currentValue - defaultValue) < 0.0001) {
                continue;
            }
            hasChanges = true;
            if (typeof currentRaw === 'object' && currentRaw !== null && 'value' in (currentRaw as Record<string, unknown>)) {
                nextProps[propName] = {
                    value: defaultValue,
                    binding: (currentRaw as TraitPropertyValue).binding,
                };
                continue;
            }
            nextProps[propName] = {value: defaultValue};
        }

        if (!hasChanges) {
            return;
        }

        this.documentModel.updateBlock(this.block.id, {
            props: nextProps,
        });
    }

    render() {
        if (!this.entity) {
            return html`<div class="no-entity">No entity selected</div>`;
        }

        const metrics = this.resolveGaugeMetrics();
        const orientation = this.resolveLinearOrientation();
        const valuePosition = this.resolveLinearValuePosition();
        const showValue = this.resolvePropertyAsBoolean('showValue');
        const showMarkers = this.resolvePropertyAsBoolean('showThresholdMarkers');
        const glowEnabled = this.resolvePropertyAsBoolean('progressGlow');
        const glowIntensity = this.resolveGlowIntensity();
        const labelText = this.resolveGaugeLabelText();
        const labelPosition = this.resolveLinearLabelPosition();
        const barCornerRadius = this.resolveLinearBarCornerRadius();
        const showBackground = this.resolveLinearShowBackground();
        const shellTransformMode = this.resolveShellTransformMode(orientation);
        const shellType = this.resolveProperty('shellType', 'none') as LinearShellType;
        const defaultShell = shellType !== 'none' && shellType !== 'custom-png' ? this.getDefaultShell(shellType) : null;
        const defaultShellUrl = defaultShell ? this.resolveDefaultShellUrl(defaultShell.fileName) : null;
        const pngShellReference = this.resolveProperty('shellPngMediaReference', '').trim();
        const customPngUrl = shellType === 'custom-png' ? this.resolveShellMediaUrl(pngShellReference) : null;
        const shellPngUrl = defaultShellUrl || customPngUrl;
        const shellActive = !!shellPngUrl;
        const shellOffsetEditorVisible = this.shouldShowShellOffsetEditor() && shellActive;
        const shellOffsetInsets = this.resolveShellOffsetInsets();
        const fillPattern = this.resolveLinearFillPattern();
        const patternActive = fillPattern !== 'none';
        const patternOnBackground = patternActive
            && showBackground
            && this.resolvePropertyAsBoolean('patternOnBackground');
        const thresholdPlacement = this.resolveThresholdPlacement();
        const thresholdsEnabled = this.resolveThresholdsEnabled();
        const barThresholdsActive = thresholdPlacement === 'bar' || thresholdPlacement === 'both';
        const backgroundThresholdsActive = showBackground
            && (thresholdPlacement === 'background' || thresholdPlacement === 'both');
        const valueParts = this.resolveGaugeValueParts(metrics);
        const activeColor = this.resolveActiveThresholdColor(metrics);

        const thresholdBaseColor = this.resolveThresholdBaseColor();
        const trackStyle = {
            ...this.getTargetStyle('track'),
        };
        if (orientation === 'horizontal') {
            const heightPx = this.resolveHorizontalBarHeight();
            trackStyle.height = `${heightPx}px`;
            if (!trackStyle.minHeight) {
                trackStyle.minHeight = `${heightPx}px`;
            }
        }
        if (glowEnabled || shellActive) {
            trackStyle.overflow = 'visible';
        }
        trackStyle.borderRadius = `${barCornerRadius}px`;
        const barLayoutStyle = shellActive
            ? this.resolvePngShellBarLayoutStyle(shellTransformMode, defaultShell?.defaultInsets)
            : {};
        const barMaskStyle = {};
        const barContentStyle = {
            ...barLayoutStyle,
            ...barMaskStyle,
        };
        const fillStyle = {
            ...this.resolveLinearFillStyle(metrics.normalized),
            ...this.getTargetStyle('fill'),
        };
        if (thresholdsEnabled) {
            delete fillStyle.background;
            delete fillStyle.backgroundImage;
            delete fillStyle['background-image'];
        }
        fillStyle.borderRadius = `${barCornerRadius}px`;
        const fillTargetStyle = this.getTargetStyle('fill');
        if (!barThresholdsActive) {
            const singleColor = activeColor || thresholdBaseColor;
            if (
                singleColor
                && !fillTargetStyle.backgroundColor
                && !fillTargetStyle.background
                && !fillTargetStyle.backgroundImage
                && !fillTargetStyle['background-image']
            ) {
                fillStyle.backgroundColor = singleColor;
            }
        }
        const gradientDirection = this.resolveLinearGradientDirection();
        const defaultFillColor = String(fillStyle.backgroundColor || '#2196f3');
        const defaultFillPaint = this.resolvePreferredPaint(fillStyle, defaultFillColor, ['background', 'backgroundImage', 'backgroundColor']);
        const patternDefaultFillPaint = this.resolveSvgCompatiblePaint(defaultFillPaint, defaultFillColor);
        const defaultTrackColor = String(trackStyle.backgroundColor || 'rgba(0, 0, 0, 0.16)');
        const defaultTrackPaint = this.resolvePreferredPaint(trackStyle, defaultTrackColor, ['background', 'backgroundImage', 'backgroundColor']);
        const barBaseStepColor = thresholdBaseColor || defaultFillColor;
        const colorChanges = this.buildThresholdColorChanges(barBaseStepColor, metrics.min, metrics.span);
        const barBlendEnabled = this.resolvePropertyAsBoolean('showStepColorsOnBarBlend');
        const barBlendDistance = this.resolvePropertyAsNumber('showStepColorsOnBarBlendDistance', 4);

        if (barThresholdsActive) {
            fillStyle.background = this.buildLinearThresholdGradient(
                gradientDirection,
                colorChanges,
                barBlendEnabled,
                barBlendDistance
            );
            delete fillStyle.backgroundColor;
        }

        const glowPaint = barThresholdsActive
            ? String(fillStyle.background || defaultFillColor)
            : defaultFillPaint;
        const renderShellExternalGlow = glowEnabled && shellActive;
        const thresholdsTrackStyle: Record<string, string> = {};
        let backgroundPaint = defaultTrackColor;
        let backgroundOpacity = 1;
        const backgroundBaseStepColor = thresholdBaseColor || defaultTrackColor;
        let backgroundColorChanges = this.buildThresholdColorChanges(backgroundBaseStepColor, metrics.min, metrics.span);
        let backgroundBlendEnabled = false;
        let backgroundBlendDistance = 4;
        if (backgroundThresholdsActive) {
            backgroundBlendEnabled = this.resolvePropertyAsBoolean('showStepColorsOnBackgroundBlend');
            backgroundBlendDistance = this.resolvePropertyAsNumber('showStepColorsOnBackgroundBlendDistance', 4);
            backgroundOpacity = this.clamp(
                this.resolvePropertyAsNumber('showStepColorsOnBackgroundOpacity', 0.28),
                0,
                1
            );
            backgroundColorChanges = this.buildThresholdColorChanges(backgroundBaseStepColor, metrics.min, metrics.span);
            backgroundPaint = this.buildLinearThresholdGradient(
                gradientDirection,
                backgroundColorChanges,
                backgroundBlendEnabled,
                backgroundBlendDistance
            );
            thresholdsTrackStyle.background = backgroundPaint;
            thresholdsTrackStyle.opacity = String(backgroundOpacity);
        } else if (showBackground && shellActive) {
            thresholdsTrackStyle.background = defaultTrackPaint;
            thresholdsTrackStyle.opacity = '1';
        }
        if (shellActive) {
            trackStyle.background = 'transparent';
            trackStyle.backgroundColor = 'transparent';
        } else if (patternActive) {
            trackStyle.background = 'transparent';
            trackStyle.backgroundColor = 'transparent';
        } else if (!showBackground) {
            trackStyle.background = 'transparent';
            trackStyle.backgroundColor = 'transparent';
        }

        const valueStyle = {
            ...this.getTargetStyle('value'),
        };
        const valueTextColor = this.resolveValueTextColor(metrics);
        if (valueTextColor) {
            valueStyle.color = valueTextColor;
        }
        const unitStyle = this.getTargetStyle('unit');
        const outsideStart = valuePosition === 'outside-start';
        const outsideEnd = valuePosition === 'outside-end';
        const inside = valuePosition.startsWith('inside');
        const reserveValueWidth = orientation === 'horizontal' && (outsideStart || outsideEnd);
        const unitPosition = this.resolveUnitPosition();
        const valuePlaceholderText = this.resolveLinearValuePlaceholder(metrics);

        const valueTemplate = showValue ? html`
            <span
                class=${classMap({
                    value: true,
                    'unit-below': unitPosition === 'below',
                    inside,
                    [orientation]: true,
                    [valuePosition]: true,
                    'style-target-active': this.isStyleTargetActive('value'),
                })}
                style=${styleMap(valueStyle)}
                data-style-target="value"
                data-action-target="value"
            >
                <span class="value-number">
                    ${reserveValueWidth ? html`
                        <span class="value-number-layer value-placeholder" aria-hidden="true">${valuePlaceholderText}</span>
                    ` : nothing}
                    <span class="value-number-layer">${valueParts.valueText}</span>
                </span>
                ${valueParts.unitText ? html`
                    <span
                        class="${this.isStyleTargetActive('unit') ? 'style-target-active' : ''}"
                        style=${styleMap(unitStyle)}
                        data-style-target="unit"
                        data-action-target="unit"
                    >${valueParts.unitText}</span>
                ` : nothing}
            </span>
        ` : nothing;
        const labelTemplate = labelText ? html`
            <span
                class=${classMap({
                    label: true,
                    [orientation]: true,
                    [labelPosition]: true,
                    'style-target-active': this.isStyleTargetActive('label'),
                })}
                style=${styleMap(this.getTargetStyle('label'))}
                data-style-target="label"
                data-action-target="label"
            >${labelText}</span>
        ` : nothing;
        const horizontalLabelMeta = orientation === 'horizontal' && labelText
            ? {
                vertical: String(labelPosition).startsWith('top') ? 'top' : 'bottom',
                align: String(labelPosition).endsWith('-left')
                    ? 'left'
                    : String(labelPosition).endsWith('-right')
                        ? 'right'
                        : 'center',
            }
            : null;
        const horizontalTopLabelTemplate = horizontalLabelMeta?.vertical === 'top' ? html`
            <div class=${classMap({
                'label-row': true,
                top: true,
                'align-left': horizontalLabelMeta.align === 'left',
                'align-center': horizontalLabelMeta.align === 'center',
                'align-right': horizontalLabelMeta.align === 'right',
            })}>
                ${labelTemplate}
            </div>
        ` : nothing;
        const horizontalBottomLabelTemplate = horizontalLabelMeta?.vertical === 'bottom' ? html`
            <div class=${classMap({
                'label-row': true,
                bottom: true,
                'align-left': horizontalLabelMeta.align === 'left',
                'align-center': horizontalLabelMeta.align === 'center',
                'align-right': horizontalLabelMeta.align === 'right',
            })}>
                ${labelTemplate}
            </div>
        ` : nothing;

        const fillTemplate = patternActive
            ? this.renderPatternFillSvg({
                pattern: fillPattern,
                orientation,
                normalized: metrics.normalized,
                gradientDirection,
                showBackground,
                colorChanges,
                barThresholdsActive,
                barBlendEnabled,
                barBlendDistance,
                defaultFillPaint: patternDefaultFillPaint,
                glowEnabled: glowEnabled && !renderShellExternalGlow,
                glowIntensity,
                barCornerRadius,
                fillTargetStyle,
                patternOnBackground,
                backgroundPaint,
                backgroundOpacity,
                backgroundThresholdsActive,
                backgroundColorChanges,
                backgroundBlendEnabled,
                backgroundBlendDistance,
            })
            : html`
                ${glowEnabled && !renderShellExternalGlow ? html`
                    <div
                        class="fill-glow"
                        style=${styleMap(this.resolveLinearGlowContainerStyle(glowIntensity))}
                    >
                        <div
                            class="fill-glow-source"
                            style=${styleMap(this.resolveLinearGlowSourceStyle(metrics.normalized, glowPaint))}
                        ></div>
                    </div>
                ` : nothing}
                <div
                    class="fill ${this.isStyleTargetActive('fill') ? 'style-target-active' : ''}"
                    style=${styleMap(fillStyle)}
                    data-style-target="fill"
                    data-action-target="fill"
                ></div>
            `;

        const shellExternalGlowTemplate = renderShellExternalGlow ? html`
            <div
                class="fill-glow"
                style=${styleMap({
                    ...this.resolveLinearGlowContainerStyle(glowIntensity),
                    ...barLayoutStyle,
                    borderRadius: `${barCornerRadius}px`,
                })}
            >
                <div
                    class="fill-glow-source"
                    style=${styleMap({
                        ...this.resolveLinearGlowSourceStyle(metrics.normalized, glowPaint),
                        borderRadius: `${barCornerRadius}px`,
                    })}
                ></div>
            </div>
        ` : nothing;

        const shellPngTemplate = shellActive ? html`
            <div class="shell-layer" data-cb-gauge-shell-orientation=${orientation}>
                <svg
                    class="shell-image-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    focusable="false"
                    aria-hidden="true"
                >
                    <image
                        href=${shellPngUrl!}
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        preserveAspectRatio="none"
                        transform=${this.resolvePngShellImageTransform(shellTransformMode)}
                    ></image>
                </svg>
            </div>
        ` : nothing;
        const overlayStyle = {
            ...this.getTargetStyle('overlay'),
            ...barLayoutStyle,
            ...barMaskStyle,
            left: barLayoutStyle.left ?? '0%',
            top: barLayoutStyle.top ?? '0%',
            width: barLayoutStyle.width ?? '100%',
            height: barLayoutStyle.height ?? '100%',
            pointerEvents: 'none',
            background: this.getTargetStyle('overlay').background ?? 'transparent',
        };
        const overlayTemplate = html`
            <div
                class="fx-overlay ${this.isStyleTargetActive('overlay') ? 'style-target-active' : ''}"
                style=${styleMap(overlayStyle)}
                data-style-target="overlay"
            ></div>
        `;
        const shellOffsetEditorTemplate = shellOffsetEditorVisible
            ? this.renderShellOffsetEditor(shellOffsetInsets)
            : nothing;

        const trackTemplate = html`
            <div
                class="track ${this.isStyleTargetActive('track') ? 'style-target-active' : ''}"
                style=${styleMap(trackStyle)}
                data-style-target="track"
            >
                <div class="bar-content" style=${styleMap(barContentStyle)}>
                    ${showBackground && !patternActive && (backgroundThresholdsActive || shellActive) ? html`
                        <div class="track-thresholds" style=${styleMap(thresholdsTrackStyle)}></div>
                    ` : nothing}
                    ${fillTemplate}
                    ${showMarkers ? this.renderThresholdMarkers(metrics.min, metrics.span) : nothing}
                </div>
                ${shellExternalGlowTemplate}
                ${inside ? valueTemplate : nothing}
                ${shellPngTemplate}
                ${overlayTemplate}
                ${orientation === 'vertical' ? labelTemplate : nothing}
                ${shellOffsetEditorTemplate}
            </div>
        `;

        if (orientation === 'horizontal') {
            return html`
                <div class=${classMap({'linear-root': true, [orientation]: true})}>
                    ${horizontalTopLabelTemplate}
                    <div class="bar-row">
                        ${outsideStart ? valueTemplate : nothing}
                        ${trackTemplate}
                        ${outsideEnd ? valueTemplate : nothing}
                    </div>
                    ${horizontalBottomLabelTemplate}
                </div>
            `;
        }

        return html`
            <div class=${classMap({'linear-root': true, [orientation]: true})}>
                ${outsideStart ? valueTemplate : nothing}
                ${trackTemplate}
                ${outsideEnd ? valueTemplate : nothing}
            </div>
        `;
    }

    private resolveShellMediaUrl(reference: string): string | null {
        if (isManagedMediaReference(reference)) {
            return mediaContentIdToPublicUrl(reference);
        }
        if (isExternalUrl(reference) || reference.startsWith('/')) {
            return reference;
        }
        return reference || null;
    }

    private getDefaultShell(shellType: LinearShellType): LinearShellDefinition {
        const shell = DEFAULT_LINEAR_SHELLS.find((candidate) => candidate.id === shellType);
        if (!shell) {
            throw new Error(`unknown shell type "${shellType}"`);
        }
        return shell;
    }

    private resolveDefaultShellUrl(fileName: string): string {
        return `/card_builder/assets/common/blocks/components/gauges/block-gauge-linear/shells/${fileName}`;
    }

    private resolveShellTransformMode(
        orientation: ReturnType<BlockGaugeLinear['resolveLinearOrientation']>
    ): LinearShellTransformMode {
        if (orientation === 'vertical') {
            const verticalDirection = this.resolveProperty('verticalFillDirection', 'bottom-to-top');
            return verticalDirection === 'top-to-bottom' ? 'rotate-right' : 'rotate-left';
        }

        const horizontalDirection = this.resolveProperty('horizontalFillDirection', 'left-to-right');
        return horizontalDirection === 'right-to-left' ? 'flip-horizontal' : 'none';
    }

    private resolvePngShellBarLayoutStyle(
        _transformMode: LinearShellTransformMode,
        defaultInsets?: LinearShellDefinition['defaultInsets']
    ): Record<string, string> {
        const rawTopInset = this.clamp(this.resolvePropertyAsNumber('shellBarInsetTopPct', defaultInsets?.top ?? 0), 0, 95);
        const rawRightInset = this.clamp(this.resolvePropertyAsNumber('shellBarInsetRightPct', defaultInsets?.right ?? 0), 0, 95);
        const rawBottomInset = this.clamp(this.resolvePropertyAsNumber('shellBarInsetBottomPct', defaultInsets?.bottom ?? 0), 0, 95);
        const rawLeftInset = this.clamp(this.resolvePropertyAsNumber('shellBarInsetLeftPct', defaultInsets?.left ?? 0), 0, 95);

        // Insets always refer to final on-screen sides (top/right/bottom/left),
        // regardless of shell image transform (flip/rotation).
        const topInset = rawTopInset;
        const rightInset = rawRightInset;
        const bottomInset = rawBottomInset;
        const leftInset = rawLeftInset;

        const widthPct = Math.max(1, 100 - leftInset - rightInset);
        const heightPct = Math.max(1, 100 - topInset - bottomInset);

        return {
            left: `${this.roundPattern(leftInset)}%`,
            top: `${this.roundPattern(topInset)}%`,
            width: `${this.roundPattern(widthPct)}%`,
            height: `${this.roundPattern(heightPct)}%`,
        };
    }

    private resolvePngShellImageTransform(transformMode: LinearShellTransformMode): string {
        if (transformMode === 'flip-horizontal') {
            return 'matrix(-1 0 0 1 100 0)';
        }
        if (transformMode === 'rotate-left') {
            return 'matrix(0 -1 1 0 0 100)';
        }
        if (transformMode === 'rotate-right') {
            return 'matrix(0 1 -1 0 100 0)';
        }
        return 'matrix(1 0 0 1 0 0)';
    }

    private shouldShowShellOffsetEditor(): boolean {
        return !!this.environment?.isBuilder
            && this.resolveProperty('shellType', 'none') as LinearShellType !== 'none'
            && this.resolvePropertyAsBoolean('shellVisualOffsetEditing');
    }

    private resolveShellOffsetInsets(): { top: number; right: number; bottom: number; left: number } {
        return {
            top: this.clamp(this.resolvePropertyAsNumber('shellBarInsetTopPct', 0), 0, 95),
            right: this.clamp(this.resolvePropertyAsNumber('shellBarInsetRightPct', 0), 0, 95),
            bottom: this.clamp(this.resolvePropertyAsNumber('shellBarInsetBottomPct', 0), 0, 95),
            left: this.clamp(this.resolvePropertyAsNumber('shellBarInsetLeftPct', 0), 0, 95),
        };
    }

    private renderShellOffsetEditor(insets: { top: number; right: number; bottom: number; left: number }) {
        const width = Math.max(1, 100 - insets.left - insets.right);
        const height = Math.max(1, 100 - insets.top - insets.bottom);
        const format = (value: number) => `${this.roundPattern(value)}%`;

        return html`
            <div class="shell-offset-editor">
                <div class="shell-offset-overlay"></div>
                <div
                    class="shell-offset-inner"
                    style=${styleMap({
                        top: `${insets.top}%`,
                        right: `${insets.right}%`,
                        bottom: `${insets.bottom}%`,
                        left: `${insets.left}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                    })}
                ></div>

                <div
                    class="shell-offset-line top"
                    style=${styleMap({top: `${insets.top}%`})}
                    @pointerdown=${(event: PointerEvent) => this.startShellOffsetEditingDrag(event, 'top')}
                >
                    <span class="shell-offset-badge top">${format(insets.top)}</span>
                </div>

                <div
                    class="shell-offset-line right"
                    style=${styleMap({right: `${insets.right}%`})}
                    @pointerdown=${(event: PointerEvent) => this.startShellOffsetEditingDrag(event, 'right')}
                >
                    <span class="shell-offset-badge right">${format(insets.right)}</span>
                </div>

                <div
                    class="shell-offset-line bottom"
                    style=${styleMap({bottom: `${insets.bottom}%`})}
                    @pointerdown=${(event: PointerEvent) => this.startShellOffsetEditingDrag(event, 'bottom')}
                >
                    <span class="shell-offset-badge bottom">${format(insets.bottom)}</span>
                </div>

                <div
                    class="shell-offset-line left"
                    style=${styleMap({left: `${insets.left}%`})}
                    @pointerdown=${(event: PointerEvent) => this.startShellOffsetEditingDrag(event, 'left')}
                >
                    <span class="shell-offset-badge left">${format(insets.left)}</span>
                </div>
            </div>
        `;
    }

    private startShellOffsetEditingDrag(event: PointerEvent, side: LinearShellOffsetSide): void {
        if (!this.block) return;
        if (!this.shouldShowShellOffsetEditor()) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        const target = event.currentTarget as HTMLElement | null;
        const track = this.renderRoot?.querySelector('.track') as HTMLElement | null;
        if (!target || !track) return;

        event.preventDefault();
        event.stopPropagation();
        target.setPointerCapture?.(event.pointerId);
        this._offsetEditorDragState = {
            pointerId: event.pointerId,
            side,
            rect: track.getBoundingClientRect(),
        };
        window.addEventListener('pointermove', this.onShellOffsetEditorPointerMove);
        window.addEventListener('pointerup', this.onShellOffsetEditorPointerUp);
        window.addEventListener('pointercancel', this.onShellOffsetEditorPointerUp);
    }

    private onShellOffsetEditorPointerMove = (event: PointerEvent): void => {
        const state = this._offsetEditorDragState;
        if (!state || event.pointerId !== state.pointerId) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();

        const insets = this.resolveShellOffsetInsets();
        const x = this.clamp(event.clientX - state.rect.left, 0, state.rect.width);
        const y = this.clamp(event.clientY - state.rect.top, 0, state.rect.height);
        const maxPair = 99;
        const toPctX = state.rect.width > 0 ? (x / state.rect.width) * 100 : 0;
        const toPctY = state.rect.height > 0 ? (y / state.rect.height) * 100 : 0;

        if (state.side === 'top') {
            const next = this.roundPattern(this.clamp(toPctY, 0, Math.min(95, maxPair - insets.bottom)));
            this.updateShellInsetProp('shellBarInsetTopPct', next);
            return;
        }
        if (state.side === 'bottom') {
            const raw = 100 - toPctY;
            const next = this.roundPattern(this.clamp(raw, 0, Math.min(95, maxPair - insets.top)));
            this.updateShellInsetProp('shellBarInsetBottomPct', next);
            return;
        }
        if (state.side === 'left') {
            const next = this.roundPattern(this.clamp(toPctX, 0, Math.min(95, maxPair - insets.right)));
            this.updateShellInsetProp('shellBarInsetLeftPct', next);
            return;
        }

        const raw = 100 - toPctX;
        const next = this.roundPattern(this.clamp(raw, 0, Math.min(95, maxPair - insets.left)));
        this.updateShellInsetProp('shellBarInsetRightPct', next);
    };

    private onShellOffsetEditorPointerUp = (event: PointerEvent): void => {
        const state = this._offsetEditorDragState;
        if (!state || event.pointerId !== state.pointerId) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.stopShellOffsetEditingDrag();
    };

    private stopShellOffsetEditingDrag(): void {
        this._offsetEditorDragState = null;
        window.removeEventListener('pointermove', this.onShellOffsetEditorPointerMove);
        window.removeEventListener('pointerup', this.onShellOffsetEditorPointerUp);
        window.removeEventListener('pointercancel', this.onShellOffsetEditorPointerUp);
    }

    private onBuilderSelectionChanged = (event: Event): void => {
        if (!this.environment?.isBuilder || !this.block) return;
        const detail = (event as CustomEvent<{ selectedId?: string | null }>).detail;
        const isSelected = detail?.selectedId === this.block.id;
        if (isSelected) {
            return;
        }
        if (!this.resolvePropertyAsBoolean('shellVisualOffsetEditing')) {
            return;
        }
        this.stopShellOffsetEditingDrag();
        this.setShellVisualOffsetEditing(false);
    };

    private updateShellInsetProp(
        propName: 'shellBarInsetTopPct' | 'shellBarInsetRightPct' | 'shellBarInsetBottomPct' | 'shellBarInsetLeftPct',
        value: number
    ): void {
        if (!this.block) return;

        const currentRaw = this.block.props?.[propName];
        if (typeof currentRaw === 'object' && currentRaw !== null && 'value' in (currentRaw as Record<string, unknown>)) {
            const current = Number((currentRaw as TraitPropertyValue).value ?? 0);
            if (Number.isFinite(current) && Math.abs(current - value) < 0.0001) {
                return;
            }
            const next: TraitPropertyValue = {
                value,
                binding: (currentRaw as TraitPropertyValue).binding,
            };
            this.documentModel.updateBlock(this.block.id, {
                props: {[propName]: next},
            });
            return;
        }

        const current = this.resolvePropertyAsNumber(propName, 0);
        if (Math.abs(current - value) < 0.0001) {
            return;
        }

        this.documentModel.updateBlock(this.block.id, {
            props: {[propName]: {value}},
        });
    }

    private setShellVisualOffsetEditing(enabled: boolean): void {
        if (!this.block) return;
        const currentRaw = this.block.props?.shellVisualOffsetEditing;
        if (typeof currentRaw === 'object' && currentRaw !== null && 'value' in (currentRaw as Record<string, unknown>)) {
            const current = Boolean((currentRaw as TraitPropertyValue).value);
            if (current === enabled) {
                return;
            }
            const next: TraitPropertyValue = {
                value: enabled,
                binding: (currentRaw as TraitPropertyValue).binding,
            };
            this.documentModel.updateBlock(this.block.id, {
                props: {shellVisualOffsetEditing: next},
            });
            return;
        }

        const current = this.resolvePropertyAsBoolean('shellVisualOffsetEditing');
        if (current === enabled) {
            return;
        }

        this.documentModel.updateBlock(this.block.id, {
            props: {shellVisualOffsetEditing: {value: enabled}},
        });
    }

    private renderPatternFillSvg(params: {
        pattern: ReturnType<BlockGaugeLinear['resolveLinearFillPattern']>;
        orientation: ReturnType<BlockGaugeLinear['resolveLinearOrientation']>;
        normalized: number;
        gradientDirection: ReturnType<BlockGaugeLinear['resolveLinearGradientDirection']>;
        showBackground: boolean;
        colorChanges: Array<{ position: number; color: string }>;
        barThresholdsActive: boolean;
        barBlendEnabled: boolean;
        barBlendDistance: number;
        defaultFillPaint: string;
        glowEnabled: boolean;
        glowIntensity: number;
        barCornerRadius: number;
        fillTargetStyle: Record<string, string>;
        patternOnBackground: boolean;
        backgroundPaint: string;
        backgroundOpacity: number;
        backgroundThresholdsActive: boolean;
        backgroundColorChanges: Array<{ position: number; color: string }>;
        backgroundBlendEnabled: boolean;
        backgroundBlendDistance: number;
    }) {
        const duration = this.getAnimationDurationMs();
        const transition = duration > 0 ? `${duration}ms linear` : 'none';
        const normalized = this.clamp(params.normalized, 0, 1);
        const viewport = this.resolvePatternSvgViewport(params.orientation);
        const geometry = this.resolvePatternTileGeometry(params.orientation, viewport);
        const patternRender = this.resolvePatternRenderMeta(params.pattern, geometry);
        const clipRect = this.resolvePatternClipRect(normalized, params.orientation, viewport);
        const {x1, y1, x2, y2} = this.resolveSvgGradientVector(params.gradientDirection, viewport);

        const blockId = this.block?.id ? this.block.id.replace(/[^a-zA-Z0-9_-]/g, '-') : 'block';
        const uid = `${blockId}-${this._patternSvgId}`;
        const patternId = `vb-pat-${uid}`;
        const maskId = `vb-mask-${uid}`;
        const clipId = `vb-clip-${uid}`;
        const gradientId = `vb-grad-${uid}`;
        const backgroundGradientId = `vb-bg-grad-${uid}`;
        const glowFilterId = `vb-glow-${uid}`;

        const gradientStops = params.barThresholdsActive
            ? this.buildLinearThresholdGradientStops(params.colorChanges, params.barBlendEnabled, params.barBlendDistance)
            : [];
        const backgroundGradientStops = params.backgroundThresholdsActive
            ? this.buildLinearThresholdGradientStops(
                params.backgroundColorChanges,
                params.backgroundBlendEnabled,
                params.backgroundBlendDistance
            )
            : [];
        const fillPaint = gradientStops.length > 0 ? `url(#${gradientId})` : params.defaultFillPaint;
        const backgroundFillPaint = backgroundGradientStops.length > 0
            ? `url(#${backgroundGradientId})`
            : params.backgroundPaint;

        const svgStyle: Record<string, string> = {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            overflow: params.glowEnabled ? 'visible' : 'hidden',
            pointerEvents: 'none',
            borderRadius: `${this.roundPattern(params.barCornerRadius)}px`,
        };

        const fillStyleExclusions = new Set([
            'left',
            'top',
            'right',
            'bottom',
            'width',
            'height',
            'clipPath',
            'transition',
            'background',
            'backgroundColor',
            'filter',
        ]);
        for (const [key, value] of Object.entries(params.fillTargetStyle)) {
            if (!fillStyleExclusions.has(key)) {
                svgStyle[key] = value;
            }
        }

        return html`
            <svg
                class="${this.isStyleTargetActive('fill') ? 'style-target-active' : ''}"
                style=${styleMap(svgStyle)}
                data-style-target="fill"
                data-action-target="fill"
                viewBox="0 0 ${this.roundPattern(viewport.width)} ${this.roundPattern(viewport.height)}"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id=${patternId}
                        x="0"
                        y="0"
                        width=${String(this.roundPattern(patternRender.tileW))}
                        height=${String(this.roundPattern(patternRender.tileH))}
                        patternUnits="userSpaceOnUse"
                        patternTransform=${patternRender.transform ?? nothing}
                    >
                        <rect
                            x="0"
                            y="0"
                            width=${String(this.roundPattern(patternRender.tileW))}
                            height=${String(this.roundPattern(patternRender.tileH))}
                            fill="black"
                        ></rect>
                        ${this.renderPatternShape(params.pattern, geometry, patternRender)}
                    </pattern>

                    <mask
                        id=${maskId}
                        maskUnits="userSpaceOnUse"
                        maskContentUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width=${String(this.roundPattern(viewport.width))}
                        height=${String(this.roundPattern(viewport.height))}
                    >
                        <rect
                            x="0"
                            y="0"
                            width=${String(this.roundPattern(viewport.width))}
                            height=${String(this.roundPattern(viewport.height))}
                            fill=${`url(#${patternId})`}
                        ></rect>
                    </mask>

                    <clipPath id=${clipId} clipPathUnits="userSpaceOnUse">
                        <rect
                            x=${String(this.roundPattern(clipRect.x))}
                            y=${String(this.roundPattern(clipRect.y))}
                            width=${String(this.roundPattern(clipRect.width))}
                            height=${String(this.roundPattern(clipRect.height))}
                            rx=${String(this.roundPattern(params.barCornerRadius))}
                            ry=${String(this.roundPattern(params.barCornerRadius))}
                            style=${styleMap({
                                x: `${this.roundPattern(clipRect.x)}px`,
                                y: `${this.roundPattern(clipRect.y)}px`,
                                width: `${this.roundPattern(clipRect.width)}px`,
                                height: `${this.roundPattern(clipRect.height)}px`,
                                transition: [
                                    `x ${transition}`,
                                    `y ${transition}`,
                                    `width ${transition}`,
                                    `height ${transition}`,
                                ].join(', '),
                            })}
                        ></rect>
                    </clipPath>

                    ${gradientStops.length > 0 ? svg`
                        <linearGradient
                            id=${gradientId}
                            gradientUnits="userSpaceOnUse"
                            x1=${String(x1)}
                            y1=${String(y1)}
                            x2=${String(x2)}
                            y2=${String(y2)}
                        >
                            ${gradientStops.map((stop) => svg`
                                <stop offset="${this.roundPattern(stop.offset)}%" stop-color=${stop.color}></stop>
                            `)}
                        </linearGradient>
                    ` : nothing}
                    ${backgroundGradientStops.length > 0 ? svg`
                        <linearGradient
                            id=${backgroundGradientId}
                            gradientUnits="userSpaceOnUse"
                            x1=${String(x1)}
                            y1=${String(y1)}
                            x2=${String(x2)}
                            y2=${String(y2)}
                        >
                            ${backgroundGradientStops.map((stop) => svg`
                                <stop offset="${this.roundPattern(stop.offset)}%" stop-color=${stop.color}></stop>
                            `)}
                        </linearGradient>
                    ` : nothing}

                    ${params.glowEnabled ? svg`
                        <filter id=${glowFilterId} x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                            <feGaussianBlur
                                in="SourceGraphic"
                                stdDeviation=${String(this.roundPattern(Math.max(0.2, params.glowIntensity / 2)))}
                                result="blur"
                            ></feGaussianBlur>
                            <feComposite in="blur" in2="SourceAlpha" operator="out" result="outerGlow"></feComposite>
                            <feMerge>
                                <feMergeNode in="outerGlow"></feMergeNode>
                            </feMerge>
                        </filter>
                    ` : nothing}
                </defs>

                ${params.showBackground ? svg`
                    <rect
                        x="0"
                        y="0"
                        width=${String(this.roundPattern(viewport.width))}
                        height=${String(this.roundPattern(viewport.height))}
                        rx=${String(this.roundPattern(params.barCornerRadius))}
                        ry=${String(this.roundPattern(params.barCornerRadius))}
                        fill=${backgroundFillPaint}
                        opacity=${String(this.roundPattern(params.backgroundOpacity))}
                        mask=${params.patternOnBackground ? `url(#${maskId})` : nothing}
                    ></rect>
                ` : nothing}

                ${params.glowEnabled ? svg`
                    <rect
                        x=${String(this.roundPattern(clipRect.x))}
                        y=${String(this.roundPattern(clipRect.y))}
                        width=${String(this.roundPattern(clipRect.width))}
                        height=${String(this.roundPattern(clipRect.height))}
                        rx=${String(this.roundPattern(params.barCornerRadius))}
                        ry=${String(this.roundPattern(params.barCornerRadius))}
                        fill=${fillPaint}
                        filter=${`url(#${glowFilterId})`}
                        opacity="0.92"
                        style=${styleMap({
                            x: `${this.roundPattern(clipRect.x)}px`,
                            y: `${this.roundPattern(clipRect.y)}px`,
                            width: `${this.roundPattern(clipRect.width)}px`,
                            height: `${this.roundPattern(clipRect.height)}px`,
                            transition: [
                                `x ${transition}`,
                                `y ${transition}`,
                                `width ${transition}`,
                                `height ${transition}`,
                                `fill ${transition}`,
                            ].join(', '),
                        })}
                    ></rect>
                ` : nothing}
                <rect
                    x="0"
                    y="0"
                    width=${String(this.roundPattern(viewport.width))}
                    height=${String(this.roundPattern(viewport.height))}
                    rx=${String(this.roundPattern(params.barCornerRadius))}
                    ry=${String(this.roundPattern(params.barCornerRadius))}
                    fill=${fillPaint}
                    clip-path=${`url(#${clipId})`}
                    mask=${`url(#${maskId})`}
                    style=${styleMap({
                        transition: `fill ${transition}`,
                    })}
                ></rect>
            </svg>
        `;
    }

    private resolveLinearGlowContainerStyle(glowIntensity: number): Record<string, string> {
        return {
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            filter: `blur(${glowIntensity}px)`,
            opacity: '0.92',
        };
    }

    private resolveLinearGlowSourceStyle(normalized: number, glowPaint: string): Record<string, string> {
        const clipStyle = this.resolveLinearFillStyle(normalized);
        const style: Record<string, string> = {
            ...clipStyle,
        };
        if (glowPaint.includes('gradient(')) {
            style.background = glowPaint;
        } else {
            style.backgroundColor = glowPaint;
        }
        return style;
    }

    private resolveSvgCompatiblePaint(paint: string, fallbackColor: string): string {
        const normalized = paint.trim().toLowerCase();
        if (normalized.includes('gradient(')) {
            return fallbackColor;
        }
        return paint;
    }

    private resolvePatternSvgViewport(
        orientation: ReturnType<BlockGaugeLinear['resolveLinearOrientation']>
    ): { width: number; height: number } {
        const barContent = this.renderRoot?.querySelector('.bar-content') as HTMLElement | null;
        const track = this.renderRoot?.querySelector('.track') as HTMLElement | null;
        const rect = barContent?.getBoundingClientRect();
        const trackRect = track?.getBoundingClientRect();
        const hostRect = this.getBoundingClientRect();

        if (orientation === 'horizontal') {
            const height = Math.max(1, rect?.height ?? trackRect?.height ?? this.resolveHorizontalBarHeight());
            const width = Math.max(
                1,
                rect?.width ?? 0,
                trackRect?.width ?? 0,
                hostRect.width > 0 ? hostRect.width : 160
            );
            return {width, height};
        }

        const width = Math.max(
            1,
            rect?.width ?? 0,
            trackRect?.width ?? 0,
            hostRect.width > 0 ? hostRect.width : 40
        );
        const height = Math.max(
            1,
            rect?.height ?? 0,
            trackRect?.height ?? 0,
            hostRect.height > 0 ? hostRect.height : 140
        );
        return {width, height};
    }

    private resolvePatternTileGeometry(
        orientation: ReturnType<BlockGaugeLinear['resolveLinearOrientation']>,
        viewport: { width: number; height: number }
    ): {
        tileW: number;
        tileH: number;
        shapeX: number;
        shapeY: number;
        shapeW: number;
        shapeH: number;
        patternThickness: number;
    } {
        const rows = this.clamp(Math.round(this.resolvePropertyAsNumber('patternCount', 1)), 1, 8);
        const gapX = this.clamp(this.resolvePropertyAsNumber('patternGapX', 2), 0, 24);
        const gapY = this.clamp(this.resolvePropertyAsNumber('patternGapY', 2), 0, 24);
        const crossGap = rows > 1 ? (orientation === 'horizontal' ? gapY : gapX) : 0;
        const primaryGap = orientation === 'horizontal' ? gapX : gapY;
        const crossSize = orientation === 'horizontal' ? viewport.height : viewport.width;
        const cellSize = Math.max(1, (crossSize - (rows - 1) * crossGap) / rows);
        const tilePrimary = Math.max(1, cellSize + primaryGap);
        const tileCross = Math.max(1, cellSize + crossGap);
        const tileW = orientation === 'horizontal' ? tilePrimary : tileCross;
        const tileH = orientation === 'horizontal' ? tileCross : tilePrimary;
        const shapeW = cellSize;
        const shapeH = cellSize;
        // Keep gap only between repeated cells: anchor shape to tile origin,
        // so no leading outer gap on left/top borders.
        const shapeX = 0;
        const shapeY = 0;
        const patternThickness = Math.max(0.5, this.resolvePropertyAsNumber('patternStrokeWidth', 1.6));

        return {
            tileW,
            tileH,
            shapeX,
            shapeY,
            shapeW,
            shapeH,
            patternThickness,
        };
    }

    private resolvePatternClipRect(
        normalized: number,
        orientation: ReturnType<BlockGaugeLinear['resolveLinearOrientation']>,
        viewport: { width: number; height: number }
    ): { x: number; y: number; width: number; height: number } {
        if (orientation === 'vertical') {
            const direction = this.resolveProperty('verticalFillDirection', 'bottom-to-top');
            if (direction === 'top-to-bottom') {
                return {x: 0, y: 0, width: viewport.width, height: normalized * viewport.height};
            }
            return {
                x: 0,
                y: (1 - normalized) * viewport.height,
                width: viewport.width,
                height: normalized * viewport.height,
            };
        }

        const direction = this.resolveProperty('horizontalFillDirection', 'left-to-right');
        if (direction === 'right-to-left') {
            return {
                x: (1 - normalized) * viewport.width,
                y: 0,
                width: normalized * viewport.width,
                height: viewport.height,
            };
        }
        return {x: 0, y: 0, width: normalized * viewport.width, height: viewport.height};
    }

    private resolveSvgGradientVector(
        direction: ReturnType<BlockGaugeLinear['resolveLinearGradientDirection']>,
        viewport: { width: number; height: number }
    ): {
        x1: number; y1: number; x2: number; y2: number;
    } {
        return this.resolveGradientVector(direction, {
            minX: 0,
            minY: 0,
            width: viewport.width,
            height: viewport.height,
        });
    }

    private buildLinearThresholdGradientStops(
        colorChanges: Array<{position: number; color: string}>,
        blendEnabled: boolean,
        blendDistance: number
    ): Array<{offset: number; color: string}> {
        return this.buildThresholdGradientStops(colorChanges, blendEnabled, blendDistance).map((stop) => ({
            offset: this.clamp((stop.offset ?? 0) * 100, 0, 100),
            color: stop.color,
        }));
    }

    private resolvePatternRenderMeta(
        pattern: ReturnType<BlockGaugeLinear['resolveLinearFillPattern']>,
        geometry: {
            tileW: number;
            tileH: number;
            shapeX: number;
            shapeY: number;
            shapeW: number;
            shapeH: number;
            patternThickness: number;
        }
    ): { tileW: number; tileH: number; transform?: string } {
        if (pattern === 'diagonal-right' || pattern === 'diagonal-left') {
            const tileSize = Math.max(1, Math.max(geometry.tileW, geometry.tileH));
            return {
                tileW: tileSize,
                tileH: tileSize,
                transform: pattern === 'diagonal-right'
                    ? 'rotate(45)'
                    : 'rotate(-45)',
            };
        }

        return {
            tileW: geometry.tileW,
            tileH: geometry.tileH,
        };
    }

    private renderPatternShape(
        pattern: ReturnType<BlockGaugeLinear['resolveLinearFillPattern']>,
        geometry: {
            tileW: number;
            tileH: number;
            shapeX: number;
            shapeY: number;
            shapeW: number;
            shapeH: number;
            patternThickness: number;
        },
        renderMeta: { tileW: number; tileH: number; transform?: string }
    ) {
        const v = (value: number) => this.roundPattern(value);
        const x0 = geometry.shapeX;
        const y0 = geometry.shapeY;
        const x1 = geometry.shapeX + geometry.shapeW;
        const y1 = geometry.shapeY + geometry.shapeH;
        const cx = geometry.shapeX + geometry.shapeW / 2;
        const cy = geometry.shapeY + geometry.shapeH / 2;
        const stroke = Math.max(0.5, geometry.patternThickness);

        if (pattern === 'squares') {
            return svg`
                <rect
                    x=${String(v(geometry.shapeX))}
                    y=${String(v(geometry.shapeY))}
                    width=${String(v(geometry.shapeW))}
                    height=${String(v(geometry.shapeH))}
                    fill="white"
                ></rect>
            `;
        }

        if (pattern === 'circles') {
            return svg`
                <circle
                    cx=${String(v(cx))}
                    cy=${String(v(cy))}
                    r=${String(v(Math.min(geometry.shapeW, geometry.shapeH) / 2))}
                    fill="white"
                ></circle>
            `;
        }

        if (pattern === 'diagonal-right' || pattern === 'diagonal-left') {
            const yA = renderMeta.tileH * 0.25;
            const yB = renderMeta.tileH * 0.75;
            return svg`
                <line
                    x1="0"
                    y1=${String(v(yA))}
                    x2=${String(v(renderMeta.tileW))}
                    y2=${String(v(yA))}
                    stroke="white"
                    stroke-width=${String(v(stroke))}
                    stroke-linecap="butt"
                ></line>
                <line
                    x1="0"
                    y1=${String(v(yB))}
                    x2=${String(v(renderMeta.tileW))}
                    y2=${String(v(yB))}
                    stroke="white"
                    stroke-width=${String(v(stroke))}
                    stroke-linecap="butt"
                ></line>
            `;
        }

        return svg`
            <line
                x1=${String(v(x0))}
                y1=${String(v(y0))}
                x2=${String(v(x1))}
                y2=${String(v(y1))}
                stroke="white"
                stroke-width=${String(v(stroke))}
                stroke-linecap="butt"
            ></line>
        `;
    }

    private roundPattern(value: number): number {
        return Math.round(value * 1000) / 1000;
    }

    private renderThresholdMarkers(min: number, span: number) {
        const markersStyle = this.getTargetStyle('markers');
        const markersActive = this.isStyleTargetActive('markers');
        const orientation = this.resolveLinearOrientation();
        const markerWidthRatio = this.resolveMarkerWidthRatio();
        const markerThicknessPx = this.resolveMarkerThicknessPx();
        const markerSizeStyle: Record<string, string> = orientation === 'vertical'
            ? {
                width: `${markerWidthRatio * 100}%`,
                left: `${((1 - markerWidthRatio) * 100) / 2}%`,
                height: `${markerThicknessPx}px`,
            }
            : {
                height: `${markerWidthRatio * 100}%`,
                top: `${((1 - markerWidthRatio) * 100) / 2}%`,
                width: `${markerThicknessPx}px`,
            };

        return this.getThresholds().map((threshold) => {
            const normalized = this.clamp((threshold.value - min) / span, 0, 1);
            const style: Record<string, string> = {
                ...markersStyle,
                ...this.resolveLinearMarkerStyle(normalized),
                ...markerSizeStyle,
            };

            if (threshold.color && !style.backgroundColor) {
                style.backgroundColor = threshold.color;
            }
            if (threshold.color && orientation === 'vertical' && !style.borderColor) {
                style.borderColor = threshold.color;
            }

            return html`
                <div
                    class="marker ${markersActive ? 'style-target-active' : ''}"
                    style=${styleMap(style)}
                    data-style-target="markers"
                ></div>
            `;
        });
    }

    private resolveLinearValuePlaceholder(metrics: { min: number; max: number }): string {
        const displayMode = this.resolveProperty('displayMode', 'value');
        const decimals = Math.max(0, Math.min(6, this.resolvePropertyAsNumber('decimalPlaces', 1)));

        if (displayMode === 'percent') {
            return this.formatNumber(100, decimals);
        }

        const minText = this.formatNumber(metrics.min, decimals);
        const maxText = this.formatNumber(metrics.max, decimals);
        return minText.length >= maxText.length ? minText : maxText;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-gauge-linear': BlockGaugeLinear;
    }
}
