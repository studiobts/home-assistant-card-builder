import { BaseOptionSelector, buildFeatureTraitOptions, type ResolvedFeature } from '@/common/blocks/components/controls/base-option-selector';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { HassEntity } from 'home-assistant-js-websocket';

// =============================================================================
// Types
// =============================================================================

type ToggleOrientation = 'horizontal' | 'vertical';
type ContentLayout = 'horizontal' | 'vertical';
type ContentOrder = 'icon-first' | 'label-first';
type VerticalAlign = 'left' | 'center' | 'right';

// =============================================================================
// Button Toggle Block
// =============================================================================

@customElement('block-button-toggle')
export class BlockButtonToggle extends BaseOptionSelector {
    static styles = [
        ...BaseOptionSelector.styles,
        css`
            :host {
                display: block;
            }

            .toggle-root {
                display: flex;
                flex-direction: column;
                gap: 6px;
                width: 100%;
            }

            .mode-selector {
                display: flex;
                background: var(--bg-tertiary, #f5f5f5);
                border-radius: 6px;
                padding: 2px;
                gap: 2px;
                box-sizing: border-box;
            }

            .mode-selector.vertical {
                flex-direction: column;
            }

            .mode-selector.vertical.align-left .mode-option {
                justify-content: flex-start;
                text-align: left;
            }

            .mode-selector.vertical.align-center .mode-option {
                justify-content: center;
                text-align: center;
            }

            .mode-selector.vertical.align-right .mode-option {
                justify-content: flex-end;
                text-align: right;
            }

            .mode-option {
                flex: 1 1 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 11px;
                font-weight: 500;
                color: var(--text-secondary, #666);
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s ease;
                user-select: none;
                border: none;
                background: transparent;
                padding: 6px 10px;
                min-height: 30px;
            }

            .mode-option:hover {
                color: var(--text-primary, #333);
            }

            .mode-option.active {
                background: var(--accent-color, #2196f3);
                color: white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
            }

            .option-content {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .option-content.layout-vertical {
                flex-direction: column;
                gap: 2px;
            }

            .option-content.order-label-first .option-icon {
                order: 2;
            }

            .option-content.order-label-first .option-label {
                order: 1;
            }

            .option-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .option-label {
                white-space: nowrap;
                font-variant-numeric: tabular-nums;
            }

            .no-options {
                font-size: 12px;
                color: var(--text-secondary, #666);
                padding: 6px 8px;
            }
        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Button Toggle',
                icon: '<ha-icon icon="mdi:toggle-switch-off-outline"></ha-icon>',
                category: 'controls',
            },
            defaults: {
                requireEntity: true,
                props: {
                    orientation: {value: 'horizontal'},
                    feature: {value: 'auto'},
                    showIcon: {value: true},
                    showLabel: {value: true},
                    contentLayout: {value: 'horizontal'},
                    contentOrder: {value: 'icon-first'},
                    verticalAlign: {value: 'center'},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
            exposeBlockActionTarget: false,
        };
    }

    protected hasNativeActions(): boolean {
        return true;
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'options',
                        label: 'Options',
                        traits: [
                            {
                                type: 'context-select',
                                name: 'feature',
                                label: 'Feature',
                                emptyLabel: 'No options available',
                                optionsProvider: buildFeatureTraitOptions,
                            },
                        ],
                    },
                    {
                        id: 'appearance',
                        label: 'Appearance',
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
                                type: 'checkbox',
                                name: 'showIcon',
                                label: 'Show Icon',
                            },
                            {
                                type: 'checkbox',
                                name: 'showLabel',
                                label: 'Show Label',
                            },
                            {
                                type: 'select',
                                name: 'contentLayout',
                                label: 'Icon + Label Layout',
                                options: [
                                    {value: 'horizontal', label: 'Horizontal'},
                                    {value: 'vertical', label: 'Vertical'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'showIcon', eq: true},
                                        {prop: 'showLabel', eq: true},
                                    ],
                                },
                            },
                            {
                                type: 'select',
                                name: 'contentOrder',
                                label: 'Content Order',
                                options: [
                                    {value: 'icon-first', label: 'Icon First'},
                                    {value: 'label-first', label: 'Label First'},
                                ],
                                visible: {
                                    and: [
                                        {prop: 'showIcon', eq: true},
                                        {prop: 'showLabel', eq: true},
                                    ],
                                },
                            },
                            {
                                type: 'select',
                                name: 'verticalAlign',
                                label: 'Vertical Align',
                                options: [
                                    {value: 'left', label: 'Left'},
                                    {value: 'center', label: 'Center'},
                                    {value: 'right', label: 'Right'},
                                ],
                                visible: {prop: 'orientation', eq: 'vertical'},
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
                container: {
                    label: 'Container',
                    description: 'Options container',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                option: {
                    label: 'Option',
                    description: 'Option button',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'option-active': {
                    label: 'Option Active',
                    description: 'Active option button',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                icon: {
                    label: 'Icon',
                    description: 'Option icon',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'icon-active': {
                    label: 'Icon Active',
                    description: 'Active option icon',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                label: {
                    label: 'Label',
                    description: 'Option label',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'label-active': {
                    label: 'Label Active',
                    description: 'Active option label',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
            },
        };
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (changedProps.has('block')) {
            this.entity = this.resolvedEntityId();
        }
    }

    render() {
        if (!this.entity) {
            return html`<div class="no-options">No entity selected</div>`;
        }

        const state = this.getEntityState();
        if (!state) {
            return html`<div class="no-options">Entity unavailable</div>`;
        }

        const domain = this.getEntityDomain();
        if (!domain) {
            return html`<div class="no-options">Entity unavailable</div>`;
        }

        const available = this._resolveAvailableFeatures(state, domain);
        const feature = this._resolveSelectedFeature(available);

        if (!feature || feature.options.length < 2) {
            return html`<div class="no-options">No options available</div>`;
        }

        const orientation = this._getOrientation();
        const showIcon = this.resolvePropertyAsBoolean('showIcon');
        const showLabel = this.resolvePropertyAsBoolean('showLabel');
        const contentLayout = this.resolveProperty('contentLayout', 'horizontal') as ContentLayout;
        const contentOrder = this.resolveProperty('contentOrder', 'icon-first') as ContentOrder;
        const verticalAlign = this.resolveProperty('verticalAlign', 'center') as VerticalAlign;

        const effectiveValue = this._getEffectiveValue(feature, state);
        const options = this._buildOptions(feature, state);

        const containerStyle = this.getTargetStyle('container');
        const optionStyle = this.getTargetStyle('option');
        const optionActiveStyle = this.getTargetStyle('option-active');
        const iconStyle = this.getTargetStyle('icon');
        const iconActiveStyle = this.getTargetStyle('icon-active');
        const labelStyle = this.getTargetStyle('label');
        const labelActiveStyle = this.getTargetStyle('label-active');

        const selectorClasses = classMap({
            'mode-selector': true,
            vertical: orientation === 'vertical',
            'align-left': orientation === 'vertical' && verticalAlign === 'left',
            'align-center': orientation === 'vertical' && verticalAlign === 'center',
            'align-right': orientation === 'vertical' && verticalAlign === 'right',
            'style-target-active': this.isStyleTargetActive('container'),
        });

        return html`
            <div class="toggle-root">
                <div
                    class=${selectorClasses}
                    style=${styleMap(containerStyle)}
                    data-style-target="container"
                >
                    ${options.map(option => {
                        const isActive = option.value === effectiveValue;
                        const optionTargetId = isActive ? 'option-active' : 'option';
                        const iconTargetId = isActive ? 'icon-active' : 'icon';
                        const labelTargetId = isActive ? 'label-active' : 'label';
                        const optionClasses = classMap({
                            'mode-option': true,
                            active: isActive,
                            'style-target-active': this.isStyleTargetActive(optionTargetId),
                        });
                        const optionStyleResolved = isActive
                            ? {...optionStyle, ...optionActiveStyle}
                            : optionStyle;
                        const iconStyleResolved = isActive
                            ? {...iconStyle, ...iconActiveStyle}
                            : iconStyle;
                        const labelStyleResolved = isActive
                            ? {...labelStyle, ...labelActiveStyle}
                            : labelStyle;
                        const contentClasses = classMap({
                            'option-content': true,
                            'layout-vertical': contentLayout === 'vertical',
                            'layout-horizontal': contentLayout === 'horizontal',
                            'order-label-first': contentOrder === 'label-first',
                        });
                        const iconTemplate = showIcon
                            ? this._renderOptionIcon(feature, option.value, iconStyleResolved, iconTargetId)
                            : nothing;
                        const labelTemplate = showLabel
                            ? this._renderOptionLabel(option.label, labelStyleResolved, labelTargetId)
                            : nothing;

                        return html`
                            <button
                                class=${optionClasses}
                                style=${styleMap(optionStyleResolved)}
                                data-style-target=${optionTargetId}
                                type="button"
                                aria-disabled=${this.areActionsEnabled() && this.isEntityAvailable() ? 'false' : 'true'}
                                aria-pressed=${isActive ? 'true' : 'false'}
                                @click=${(e: Event) => this._handleOptionClick(e, option.value, feature, state)}
                            >
                                <div class=${contentClasses}>
                                    ${iconTemplate}
                                    ${labelTemplate}
                                </div>
                            </button>
                        `;
                    })}
                </div>
            </div>
        `;
    }

    // =============================================================================
    // Interaction
    // =============================================================================

    private async _handleOptionClick(
        e: Event,
        value: string,
        feature: ResolvedFeature,
        state: HassEntity
    ): Promise<void> {
        if (!this.hass || !this.entity) return;
        if (!this.areActionsEnabled()) return;
        if (!this.isEntityAvailable()) return;

        e.preventDefault();
        e.stopPropagation();

        const current = this._getEffectiveValue(feature, state);
        if (current === value) return;

        this._setPendingValue(value);
        this._dispatchBlockAction(feature, value);
    }

    protected _emitServiceError(error: unknown, payload: Record<string, unknown>): void {
        const detail = {
            entityId: this.entity,
            error,
            payload,
            blockId: this.block?.id,
        };

        this.eventBus?.dispatchEvent('button-toggle-service-error', detail);
        this.dispatchEvent(new CustomEvent('button-toggle-service-error', {detail, bubbles: true, composed: true}));
    }

    private _getOrientation(): ToggleOrientation {
        const orientation = this.resolveProperty('orientation', 'horizontal') as ToggleOrientation;
        return orientation === 'vertical' ? 'vertical' : 'horizontal';
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-button-toggle': BlockButtonToggle;
    }
}
