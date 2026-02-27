import { BaseEntityField } from '@/common/blocks/components/entities/fields/base-entity-field';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * State color configuration
 */
interface StateColor {
    state: string;
    color: string;
}

/**
 * Entity Icon Field
 * Displays entity icon with conditional coloring
 */
@customElement('block-entity-field-icon')
export class BlockEntityFieldIcon extends BaseEntityField {
    static styles = [
        ...BaseEntityField.styles,
        css`
            .icon-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
            }

            .entity-icon {
                width: var(--mdc-icon-size, 24px);
                height: var(--mdc-icon-size, 24px);
                color: var(--icon-primary-color, currentColor);
                transition: color 0.3s ease;
            }

            .entity-icon svg,
            .entity-icon ha-icon,
            .entity-icon mwc-icon {
                width: 100%;
                height: 100%;
                fill: currentColor;
            }

            .fallback-icon {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--mdc-icon-size, 24px);
            }
        `
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Entity Icon',
                icon: '<ha-icon icon="mdi:gamepad-outline"></ha-icon>',
                category: 'entities'
            },
            defaults: {
                requireEntity: true,
                props: {
                    // Size
                    iconSize: {value: 24},
                    // Style
                    color: {value: ''},
                    // Conditional coloring
                    colorMode: {value: 'fixed'},
                    stateColors: {value: []},
                    availableColor: {value: ''},
                    unavailableColor: {value: '#9e9e9e'}
                }
            },
            entityDefaults: {
                mode: 'inherited'
            }
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'icon',
                        label: 'Icon',
                        traits: [
                            {
                                type: 'number',
                                name: 'iconSize',
                                label: 'Icon Size',
                                min: 12,
                                max: 128
                            }
                        ]
                    },
                    {
                        id: 'color',
                        label: 'Color',
                        traits: [
                            {
                                type: 'select',
                                name: 'colorMode',
                                label: 'Color Mode',
                                options: [
                                    {value: 'fixed', label: 'Fixed'},
                                    {value: 'state', label: 'State-based'},
                                    {value: 'availability', label: 'Availability-based'}
                                ]
                            },
                            {
                                type: 'color',
                                name: 'color',
                                label: 'Color',
                                visible: {prop: 'colorMode', eq: 'fixed'}
                            },
                            {
                                type: 'color',
                                name: 'availableColor',
                                label: 'Available Color',
                                visible: {prop: 'colorMode', eq: 'availability'}
                            },
                            {
                                type: 'color',
                                name: 'unavailableColor',
                                label: 'Unavailable Color',
                                visible: {prop: 'colorMode', eq: 'availability'}
                            }
                        ]
                    }
                ]
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'full'
                    }
                }
            }
        };
    }

    render() {
        if (!this.entity) {
            return html`
                <div class="no-entity">No entity selected</div>`;
        }

        const icon = this.getEntityIcon('mdi:alert-circle-outline')!;
        const iconSize = this.resolvePropertyAsNumber('iconSize', 24);
        const color = this.getIconColor();

        // Check if icon is available
        if (!icon) {
            return html`
                <div class="icon-container">
                    <div class="fallback-icon">?</div>
                </div>
            `;
        }

        return html`
            <div
                    class="icon-container"
                    style="
                --mdc-icon-size: ${iconSize}px;
                ${color ? `--icon-primary-color: ${color};` : ''}
            "
            >
                <ha-icon
                        class="entity-icon"
                        .icon="${icon}"
                ></ha-icon>
            </div>
        `;
    }

    /**
     * Get icon color based on color mode
     */
    protected getIconColor(): string | undefined {
        const colorMode = this.resolveProperty('colorMode', 'fixed');

        if (colorMode === 'fixed') {
            const color = this.resolveProperty('color');
            return color || undefined;
        }

        if (colorMode === 'state') {
            const state = this.getEntityState()?.state;
            const stateColors = this.resolveRawValue(this.block?.props?.stateColors, []);
            const list = Array.isArray(stateColors) ? (stateColors as StateColor[]) : [];
            const match = list.find(sc => sc.state === state);
            return match?.color;
        }

        if (colorMode === 'availability') {
            const isAvailable = this.isEntityAvailable();
            const availableColor = this.resolveProperty('availableColor');
            const unavailableColor = this.resolveProperty('unavailableColor', '#9e9e9e');
            return isAvailable ? (availableColor || undefined) : unavailableColor;
        }

        return undefined;
    }
}
