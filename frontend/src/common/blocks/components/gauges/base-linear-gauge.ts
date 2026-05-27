import type { PropertyGroup, PropertyTrait } from '@/common/blocks/core/properties';
import type { BlockPanelTargetStyles } from '@/common/blocks/types';
import { BaseGauge } from './base-gauge';

export type LinearGaugeOrientation = 'horizontal' | 'vertical';
export type LinearFillDirectionHorizontal = 'left-to-right' | 'right-to-left';
export type LinearFillDirectionVertical = 'bottom-to-top' | 'top-to-bottom';
export type LinearValuePositionHorizontal = 'inside-start' | 'inside-center' | 'inside-end' | 'outside-start' | 'outside-end';
export type LinearValuePositionVertical = 'inside-start' | 'inside-center' | 'inside-end' | 'outside-start' | 'outside-end';
export type LinearLabelPositionHorizontal =
    | 'top-center'
    | 'top-left'
    | 'top-right'
    | 'bottom-center'
    | 'bottom-left'
    | 'bottom-right';
export type LinearLabelPositionVertical = 'top' | 'bottom';
export type LinearFillPattern = 'none' | 'squares' | 'circles' | 'diagonal-right' | 'diagonal-left';
export type LinearShellType = 'none' | 'battery-1' | 'tank-1' | 'custom-png';

export abstract class BaseLinearGauge extends BaseGauge {
    protected getLinearGaugePropertyGroups(): PropertyGroup[] {
        return [
            {
                id: 'bar',
                label: 'Bar',
                traits: [
                    {
                        type: 'select',
                        name: 'orientation',
                        label: 'Orientation',
                        options: [
                            {value: 'horizontal', label: 'Horizontal'},
                            {value: 'vertical', label: 'Vertical'},
                        ],
                    },
                    {
                        type: 'select',
                        name: 'horizontalFillDirection',
                        label: 'Horizontal Fill',
                        options: [
                            {value: 'left-to-right', label: 'Left to Right'},
                            {value: 'right-to-left', label: 'Right to Left'},
                        ],
                        visible: {prop: 'orientation', eq: 'horizontal'},
                    },
                    {
                        type: 'select',
                        name: 'verticalFillDirection',
                        label: 'Vertical Fill',
                        options: [
                            {value: 'bottom-to-top', label: 'Bottom to Top'},
                            {value: 'top-to-bottom', label: 'Top to Bottom'},
                        ],
                        visible: {prop: 'orientation', eq: 'vertical'},
                    },
                    {
                        type: 'slider',
                        name: 'horizontalBarHeight',
                        label: 'Horizontal Bar Height',
                        min: 8,
                        max: 250,
                        step: 1,
                        visible: {prop: 'orientation', eq: 'horizontal'},
                    },
                    {
                        type: 'slider',
                        name: 'barCornerRadius',
                        label: 'Bar Corner Radius',
                        min: 0,
                        max: 60,
                        step: 1,
                    },
                    {
                        type: 'checkbox',
                        name: 'showBackground',
                        label: 'Show Background',
                    },
                    {
                        type: 'select',
                        name: 'shellType',
                        label: 'Shell',
                        options: [
                            {value: 'none', label: 'None'},
                            {value: 'battery-1', label: 'Battery 1'},
                            {value: 'tank-1', label: 'Tank 1'},
                            {value: 'custom-png', label: 'Custom PNG'},
                        ],
                    },
                    {
                        type: 'media-picker',
                        name: 'shellPngMediaReference',
                        label: 'Custom Shell PNG',
                        emptyLabel: 'No PNG selected',
                        selectLabel: 'Select PNG',
                        editLabel: 'Edit',
                        removeLabel: 'Remove',
                        sourceProp: 'shellType',
                        sourceValue: 'custom-png',
                        visible: {
                            prop: 'shellType',
                            eq: 'custom-png',
                        },
                        binding: {
                            type: 'text',
                            placeholder: 'cb-media://local/card_builder/gauge-shell.png',
                        },
                    },
                    {
                        type: 'action',
                        name: 'toggleShellOffsetEditor',
                        label: 'Visual Offset Editor',
                        buttonLabel: 'Toggle Visual Offset Editing',
                        actionId: 'toggle-linear-shell-offset-editor',
                        icon: '⌖',
                        visible: {
                            prop: 'shellType',
                            neq: 'none',
                        },
                    },
                    {
                        type: 'number',
                        name: 'shellBarInsetTopPct',
                        label: 'Bar Inset Top (%)',
                        min: 0,
                        max: 95,
                        step: 0.1,
                        visible: {
                            prop: 'shellType',
                            neq: 'none',
                        },
                    },
                    {
                        type: 'number',
                        name: 'shellBarInsetRightPct',
                        label: 'Bar Inset Right (%)',
                        min: 0,
                        max: 95,
                        step: 0.1,
                        visible: {
                            prop: 'shellType',
                            neq: 'none',
                        },
                    },
                    {
                        type: 'number',
                        name: 'shellBarInsetBottomPct',
                        label: 'Bar Inset Bottom (%)',
                        min: 0,
                        max: 95,
                        step: 0.1,
                        visible: {
                            prop: 'shellType',
                            neq: 'none',
                        },
                    },
                    {
                        type: 'number',
                        name: 'shellBarInsetLeftPct',
                        label: 'Bar Inset Left (%)',
                        min: 0,
                        max: 95,
                        step: 0.1,
                        visible: {
                            prop: 'shellType',
                            neq: 'none',
                        },
                    },
                    {
                        type: 'select',
                        name: 'fillPattern',
                        label: 'Fill Pattern',
                        options: [
                            {value: 'none', label: 'None'},
                            {value: 'squares', label: 'Squares'},
                            {value: 'circles', label: 'Circles'},
                            {value: 'diagonal-right', label: 'Diagonal Right'},
                            {value: 'diagonal-left', label: 'Diagonal Left'},
                        ],
                    },
                    {
                        type: 'slider',
                        name: 'patternCount',
                        label: 'Pattern Rows/Columns',
                        min: 1,
                        max: 8,
                        step: 1,
                        visible: {prop: 'fillPattern', in: ['squares', 'circles', 'diagonal-right', 'diagonal-left']},
                    },
                    {
                        type: 'slider',
                        name: 'patternGapX',
                        label: 'Pattern Gap Horizontal',
                        min: 0,
                        max: 24,
                        step: 1,
                        visible: {
                            and: [
                                {prop: 'fillPattern', in: ['squares', 'circles', 'diagonal-right', 'diagonal-left']},
                                {
                                    or: [
                                        {prop: 'patternCount', neq: 1},
                                        {prop: 'orientation', eq: 'horizontal'},
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        type: 'slider',
                        name: 'patternGapY',
                        label: 'Pattern Gap Vertical',
                        min: 0,
                        max: 24,
                        step: 1,
                        visible: {
                            and: [
                                {prop: 'fillPattern', in: ['squares', 'circles', 'diagonal-right', 'diagonal-left']},
                                {
                                    or: [
                                        {prop: 'patternCount', neq: 1},
                                        {prop: 'orientation', eq: 'vertical'},
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        type: 'slider',
                        name: 'patternStrokeWidth',
                        label: 'Pattern Thickness',
                        min: 0.6,
                        max: 8,
                        step: 0.2,
                        visible: {prop: 'fillPattern', in: ['diagonal-right', 'diagonal-left']},
                    },
                    {
                        type: 'checkbox',
                        name: 'patternOnBackground',
                        label: 'Apply Pattern On Background',
                        visible: {
                            and: [
                                {prop: 'showBackground', eq: true},
                                {prop: 'fillPattern', in: ['squares', 'circles', 'diagonal-right', 'diagonal-left']},
                            ],
                        },
                    },
                    {
                        type: 'checkbox',
                        name: 'progressGlow',
                        label: 'Glow',
                    },
                    {
                        type: 'slider',
                        name: 'progressGlowIntensity',
                        label: 'Glow Intensity',
                        min: 1,
                        max: 40,
                        step: 0.5,
                        visible: {prop: 'progressGlow', eq: true},
                    },
                    {
                        type: 'select',
                        name: 'valuePositionHorizontal',
                        label: 'Value Position',
                        options: [
                            {value: 'inside-start', label: 'Inside Start'},
                            {value: 'inside-center', label: 'Inside Center'},
                            {value: 'inside-end', label: 'Inside End'},
                            {value: 'outside-start', label: 'Outside Start'},
                            {value: 'outside-end', label: 'Outside End'},
                        ],
                        visible: {
                            and: [
                                {prop: 'showValue', eq: true},
                                {prop: 'orientation', eq: 'horizontal'},
                            ],
                        },
                    },
                    {
                        type: 'select',
                        name: 'valuePositionVertical',
                        label: 'Value Position',
                        options: [
                            {value: 'inside-start', label: 'Inside Start'},
                            {value: 'inside-center', label: 'Inside Center'},
                            {value: 'inside-end', label: 'Inside End'},
                            {value: 'outside-start', label: 'Outside Start'},
                            {value: 'outside-end', label: 'Outside End'},
                        ],
                        visible: {
                            and: [
                                {prop: 'showValue', eq: true},
                                {prop: 'orientation', eq: 'vertical'},
                            ],
                        },
                    },
                ],
            },
        ];
    }

    protected getLinearGaugePanelPropertyGroups(): PropertyGroup[] {
        const barGroup = this.getLinearGaugePropertyGroups().find((group) => group.id === 'bar');
        const barTraits = barGroup?.traits ?? [];
        const shellTraitNames = new Set([
            'shellType',
            'shellPngMediaReference',
            'toggleShellOffsetEditor',
            'shellBarInsetTopPct',
            'shellBarInsetRightPct',
            'shellBarInsetBottomPct',
            'shellBarInsetLeftPct',
        ]);
        const shellTraits = barTraits.filter((trait) => shellTraitNames.has(trait.name));
        const valuePositionHorizontalTrait = barTraits.find((trait) => trait.name === 'valuePositionHorizontal');
        const valuePositionVerticalTrait = barTraits.find((trait) => trait.name === 'valuePositionVertical');
        const labelTraits: PropertyTrait[] = [
            ...this.buildGaugeLabelModeTraits(),
            {
                type: 'select',
                name: 'labelPositionHorizontal',
                label: 'Label Position',
                options: [
                    {value: 'top-center', label: 'Top Center'},
                    {value: 'top-left', label: 'Top Left'},
                    {value: 'top-right', label: 'Top Right'},
                    {value: 'bottom-center', label: 'Bottom Center'},
                    {value: 'bottom-left', label: 'Bottom Left'},
                    {value: 'bottom-right', label: 'Bottom Right'},
                ],
                visible: {
                    and: [
                        {prop: 'labelMode', neq: 'hidden'},
                        {prop: 'orientation', eq: 'horizontal'},
                    ],
                },
            },
            {
                type: 'select',
                name: 'labelPositionVertical',
                label: 'Label Position',
                options: [
                    {value: 'top', label: 'Top'},
                    {value: 'bottom', label: 'Bottom'},
                ],
                visible: {
                    and: [
                        {prop: 'labelMode', neq: 'hidden'},
                        {prop: 'orientation', eq: 'vertical'},
                    ],
                },
            },
        ];
        const dataGroup = this.buildMergedBaseDataGroup({
            insertAfterShowValueTraits: [
                ...(valuePositionHorizontalTrait ? [valuePositionHorizontalTrait] : []),
                ...(valuePositionVerticalTrait ? [valuePositionVerticalTrait] : []),
            ],
        });
        const barTraitsWithoutValuePosition = barTraits.filter((trait) =>
            trait.name !== 'valuePositionHorizontal' && trait.name !== 'valuePositionVertical'
        ).filter((trait) => !shellTraitNames.has(trait.name));
        const baseThresholds = this.getBaseGaugePropertyGroup('thresholds');
        const thresholdTraits = this.extendThresholdTraitsWithAdvancedColors(baseThresholds?.traits ?? []).map((trait) => {
            if (trait.name === 'thresholdsApplyTo') {
                return {
                    ...trait,
                    options: this.resolveLinearShowBackground()
                        ? [
                            {value: 'none', label: 'Disabled'},
                            {value: 'bar', label: 'Bar'},
                            {value: 'background', label: 'Background'},
                            {value: 'both', label: 'Both'},
                        ]
                        : [
                            {value: 'none', label: 'Disabled'},
                            {value: 'bar', label: 'Bar'},
                        ],
                };
            }

            if (
                trait.name === 'showStepColorsOnBackgroundOpacity' ||
                trait.name === 'showStepColorsOnBackgroundBlend' ||
                trait.name === 'showStepColorsOnBackgroundBlendDistance'
            ) {
                return {
                    ...trait,
                    visible: trait.visible
                        ? {and: [trait.visible, {prop: 'showBackground', eq: true}]}
                        : {prop: 'showBackground', eq: true},
                };
            }

            return trait;
        });
        const baseBehavior = this.getBaseGaugePropertyGroup('behavior');

        return [
            dataGroup,
            {
                id: 'label',
                label: 'Label',
                traits: labelTraits,
            },
            {
                id: 'bar',
                label: barGroup?.label ?? 'Bar',
                traits: barTraitsWithoutValuePosition,
            },
            {
                id: 'thresholds',
                label: 'Thresholds',
                traits: thresholdTraits,
            },
            {
                id: 'shell',
                label: 'Shell',
                traits: shellTraits,
            },
            ...(baseBehavior ? [baseBehavior] : []),
        ];
    }

    protected getLinearGaugeTargetStyles(): BlockPanelTargetStyles {
        const trackStyles: BlockPanelTargetStyles = this.resolveLinearShowBackground() ? {
            track: {
                label: 'Track',
                description: 'Gauge track',
                styles: {
                    preset: 'full',
                    exclude: {
                        groups: ['layout', 'flex'],
                    },
                },
            },
        } : {};

        return {
            ...trackStyles,
            fill: {
                label: 'Fill',
                description: 'Gauge filled area',
                styles: {
                    preset: 'full',
                    exclude: {
                        groups: ['layout', 'flex'],
                    },
                },
            },
            overlay: {
                label: 'Overlay',
                description: 'Top visual overlay',
                styles: {
                    preset: 'full',
                    exclude: {
                        groups: ['layout', 'flex'],
                    },
                },
            },
            label: {
                label: 'Label',
                description: 'Gauge label',
                styles: {
                    preset: 'full',
                    exclude: {
                        groups: ['layout', 'flex'],
                    },
                },
            },
            markers: {
                label: 'Markers',
                description: 'Threshold markers',
                styles: {
                    preset: 'full',
                    exclude: {
                        groups: ['layout', 'flex'],
                    },
                },
            },
        };
    }

    protected resolveLinearOrientation(): LinearGaugeOrientation {
        return this.resolveProperty('orientation', 'horizontal') as LinearGaugeOrientation;
    }

    protected resolveLinearValuePosition(): LinearValuePositionHorizontal | LinearValuePositionVertical {
        const orientation = this.resolveLinearOrientation();
        if (orientation === 'vertical') {
            return this.resolveProperty('valuePositionVertical', 'inside-center') as LinearValuePositionVertical;
        }
        return this.resolveProperty('valuePositionHorizontal', 'inside-center') as LinearValuePositionHorizontal;
    }

    protected resolveLinearLabelPosition(): LinearLabelPositionHorizontal | LinearLabelPositionVertical {
        const orientation = this.resolveLinearOrientation();
        if (orientation === 'vertical') {
            const position = this.resolveProperty('labelPositionVertical', 'top');
            return position === 'bottom' ? 'bottom' : 'top';
        }
        const position = this.resolveProperty('labelPositionHorizontal', 'top-center');
        if (
            position === 'top-center' ||
            position === 'top-left' ||
            position === 'top-right' ||
            position === 'bottom-center' ||
            position === 'bottom-left' ||
            position === 'bottom-right'
        ) {
            return position;
        }
        return 'top-center';
    }

    protected resolveLinearFillStyle(normalized: number): Record<string, string> {
        const orientation = this.resolveLinearOrientation();
        const duration = this.getAnimationDurationMs();
        const transition = duration > 0 ? `${duration}ms linear` : 'none';
        const percent = this.clamp(normalized * 100, 0, 100);
        const cornerRadius = this.resolveLinearBarCornerRadius();
        const round = cornerRadius > 0 ? ` round ${cornerRadius}px` : '';

        let clipPath = `inset(0 0 0 0${round})`;
        if (orientation === 'vertical') {
            const direction = this.resolveProperty('verticalFillDirection', 'bottom-to-top') as LinearFillDirectionVertical;
            clipPath = direction === 'top-to-bottom'
                ? `inset(0 0 ${100 - percent}% 0${round})`
                : `inset(${100 - percent}% 0 0 0${round})`;
        } else {
            const direction = this.resolveProperty('horizontalFillDirection', 'left-to-right') as LinearFillDirectionHorizontal;
            clipPath = direction === 'right-to-left'
                ? `inset(0 0 0 ${100 - percent}%${round})`
                : `inset(0 ${100 - percent}% 0 0${round})`;
        }

        return {
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            clipPath,
            transition: `clip-path ${transition}`,
        };
    }

    protected resolveLinearMarkerStyle(normalized: number): Record<string, string> {
        const orientation = this.resolveLinearOrientation();
        const percent = `${this.clamp(normalized * 100, 0, 100)}%`;
        if (orientation === 'vertical') {
            const direction = this.resolveProperty('verticalFillDirection', 'bottom-to-top') as LinearFillDirectionVertical;
            return direction === 'top-to-bottom'
                ? {top: percent}
                : {bottom: percent};
        }

        const direction = this.resolveProperty('horizontalFillDirection', 'left-to-right') as LinearFillDirectionHorizontal;
        return direction === 'right-to-left'
            ? {right: percent}
            : {left: percent};
    }

    protected resolveHorizontalBarHeight(): number {
        return Math.max(8, this.resolvePropertyAsNumber('horizontalBarHeight', 40));
    }

    protected resolveLinearBarCornerRadius(): number {
        return Math.max(0, this.resolvePropertyAsNumber('barCornerRadius', 0));
    }

    protected resolveLinearShowBackground(): boolean {
        return this.resolvePropertyAsBoolean('showBackground');
    }

    protected resolveLinearGradientDirection(): 'to right' | 'to left' | 'to top' | 'to bottom' {
        const orientation = this.resolveLinearOrientation();
        if (orientation === 'vertical') {
            const direction = this.resolveProperty('verticalFillDirection', 'bottom-to-top') as LinearFillDirectionVertical;
            return direction === 'top-to-bottom' ? 'to bottom' : 'to top';
        }

        const direction = this.resolveProperty('horizontalFillDirection', 'left-to-right') as LinearFillDirectionHorizontal;
        return direction === 'right-to-left' ? 'to left' : 'to right';
    }

    protected resolveLinearFillPattern(): LinearFillPattern {
        const pattern = this.resolveProperty('fillPattern', 'none');
        if (
            pattern === 'squares' ||
            pattern === 'circles' ||
            pattern === 'diagonal-right' ||
            pattern === 'diagonal-left'
        ) {
            return pattern;
        }
        return 'none';
    }
}
