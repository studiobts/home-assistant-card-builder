import { PROPS_FORMATTING } from "@/common/blocks/components/entities/base-entity";
import { BaseEntityField } from '@/common/blocks/components/entities/fields/base-entity-field';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ENTITY_NAME_TEMPLATE_KEYWORDS } from '@/common/core/template/ha-template-service';

/**
 * Entity State Field
 * Displays entity state or a specific attribute with formatting and conditional coloring
 */
@customElement('block-entity-field-state')
export class BlockEntityFieldState extends BaseEntityField {
    static styles = [
        ...BaseEntityField.styles,
        css`
            .state-value {
                font-size: 16px;
                white-space: nowrap;
                display: inline-block;
            }
            .state-number {
                font-variant-numeric: tabular-nums;
            }
            .state-unit {
                font-size: 0.8em;
                margin-left: 2px;
            }
        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Entity State',
                icon: '<ha-icon icon="mdi:state-machine"></ha-icon>',
                category: 'entities',
            },
            defaults: {
                requireEntity: true,
                props: {
                    // Formatting
                    format: { value: 'text' },
                    precision: { value: 1 },
                    dateFormat: { value: 'full' },
                    formatTemplate: { value: '' },
                    // Unit of measurement
                    showUnit: { value: true },
                    customUnit: { value: '' },
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
            actionTargets: {
                state: {label: 'State', description: 'State value'},
                unit: {label: 'Unit', description: 'Unit of measurement'},
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'formatting',
                        label: 'Formatting',
                        traits: PROPS_FORMATTING
                    },
                    {
                        id: 'unit',
                        label: 'Unit',
                        traits: [
                            {
                                type: 'checkbox',
                                name: 'showUnit',
                                label: 'Show Unit'
                            },
                            {
                                type: 'text',
                                name: 'customUnit',
                                label: 'Custom Unit',
                                placeholder: 'Leave empty for auto',
                                visible: {
                                    prop: 'showUnit',
                                    eq: true
                                }
                            }
                        ]
                    }
                ]
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'full',
                    },
                },
                state: {
                    label: 'State value',
                    description: 'Main state text',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                unit: {
                    label: 'Unit',
                    description: 'Unit of measurement displayed after the value',
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

    render() {
        if (!this.entity) {
            return html`
                <div class="no-entity">No entity selected</div>
            `;
        }

        if (!this.hass || !this.getEntityState()) {
            return html`
                <div class="state-container">
                    <div class="state-value">—</div>
                </div>
            `;
        }

        const rawValue = this.getDisplayValue();
        const formattedValue = this.formatValue(rawValue);
        const unit = this.getUnit();

        const format = this.resolveProperty('format', 'text');
        const isNumeric = format === 'numeric' || format === 'integer';
        const stateTargetStyle = this.getTargetStyle('state');
        const unitTargetStyle = this.getTargetStyle('unit');
        const stateTargetActive = this.isStyleTargetActive('state');
        const unitTargetActive = this.isStyleTargetActive('unit');

        return html`
            <div class="state-container">
                <div
                    class="state-value ${stateTargetActive ? 'style-target-active' : ''}"
                    style=${styleMap(stateTargetStyle)}
                    data-style-target="state"
                    data-action-target="state"
                >
                    <span class="${isNumeric ? 'state-number' : ''}">${formattedValue}</span>
                </div>
                ${unit ? html`
                    <span
                        class="state-unit ${unitTargetActive ? 'style-target-active' : ''}"
                        style=${styleMap(unitTargetStyle)}
                        data-style-target="unit"
                        data-action-target="unit"
                    >${unit}</span>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get the value to display
     */
    protected getDisplayValue(): string {
        return this.getEntityState()?.state || '';
    }

    /**
     * Get unit of measurement
     */
    protected getUnit(): string {
        const showUnit = this.resolvePropertyAsBoolean('showUnit');
        if (!showUnit) return '';

        const customUnit = this.resolveProperty('customUnit');
        if (customUnit) return customUnit;

        return this.getEntityAttribute('unit_of_measurement') || '';
    }
}
