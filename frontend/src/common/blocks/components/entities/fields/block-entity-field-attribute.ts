import { PROPS_FORMATTING } from "@/common/blocks/components/entities/base-entity";
import { BaseEntityField } from '@/common/blocks/components/entities/fields/base-entity-field';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { DEFAULT_ENTITY_TEMPLATE_KEYWORDS } from '@/common/core/template/ha-template-service';

/**
 * Entity Attribute Field
 * Displays a single entity attribute with label and formatting
 */
@customElement('block-entity-field-attribute')
export class BlockEntityFieldAttribute extends BaseEntityField {
    static styles = [
        ...BaseEntityField.styles,
        css`
            .attribute-container {
                width: 100%;
                height: 100%;
                display: flex;
                box-sizing: border-box;
            }

            .attribute-container.layout-top {
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            .attribute-container.layout-left {
                flex-direction: row;
                align-items: center;
                gap: 8px;
            }

            .attribute-container.layout-inline {
                flex-direction: row;
                align-items: baseline;
                gap: 4px;
            }
      
            .attribute-label {
                font-size: 12px;
                white-space: nowrap;
            }

            .layout-top .attribute-label {
                margin-bottom: 4px;
            }

            .attribute-value {
                font-size: 14px;
                white-space: nowrap;
            }

            .value-content {
                display: flex;
                align-items: baseline;
                gap: 4px;
            }
        `
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Entity Attribute',
                icon: '<ha-icon icon="mdi:tag-text-outline"></ha-icon>',
                category: 'entities'
            },
            defaults: {
                requireEntity: true,
                props: {
                    // Attribute
                    attributeName: {value: ''},
                    // Label
                    showLabel: {value: true},
                    customLabel: {value: ''},
                    labelPosition: {value: 'top'},
                    // Formatting
                    format: {value: 'text'},
                    precision: {value: 1},
                    dateFormat: {value: 'full'},
                    formatTemplate: {value: ''},
                    prefix: {value: ''},
                    suffix: {value: ''}
                }
            },
            entityDefaults: {
                mode: 'inherited'
            },
            actionTargets: {
                label: {label: 'Label', description: 'Attribute label'},
                value: {label: 'Value', description: 'Attribute value'}
            }
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'attribute',
                        label: 'Attribute',
                        traits: [
                            {
                                type: 'attribute-picker',
                                name: 'attributeName',
                                label: 'Attribute Name',
                                placeholder: 'Enter attribute name'
                            }
                        ]
                    },
                    {
                        id: 'label',
                        label: 'Label',
                        traits: [
                            {
                                type: 'checkbox',
                                name: 'showLabel',
                                label: 'Show Label'
                            },
                            {
                                type: 'text',
                                name: 'customLabel',
                                label: 'Custom Label',
                                placeholder: 'Auto-generated from attribute name',
                                visible: {
                                    prop: 'showLabel',
                                    eq: true
                                }
                            },
                            {
                                type: 'select',
                                name: 'labelPosition',
                                label: 'Label Position',
                                options: [
                                    {value: 'top', label: 'Top'},
                                    {value: 'left', label: 'Left'},
                                    {value: 'inline', label: 'Inline'}
                                ],
                                visible: {
                                    prop: 'showLabel',
                                    eq: true
                                }
                            }
                        ]
                    },
                    {
                        id: 'formatting',
                        label: 'Formatting',
                        traits: [
                            ...PROPS_FORMATTING,
                            {
                                type: 'text',
                                name: 'prefix',
                                label: 'Prefix',
                                templateKeywords: DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
                                visible: {
                                    prop: 'format',
                                    neq: 'template'
                                }
                            },
                            {
                                type: 'text',
                                name: 'suffix',
                                label: 'Suffix',
                                templateKeywords: DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
                                visible: {
                                    prop: 'format',
                                    neq: 'template'
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
                label: {
                    label: 'Label',
                    description: 'Label shown for the attribute name',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                value: {
                    label: 'Value',
                    description: 'Formatted attribute value',
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

        const attributeName = this.resolveProperty('attributeName');
        if (!attributeName) {
            return html`
                <div class="no-entity">No attribute selected</div>
            `;
        }

        const rawValue = this.getAttributeValue();
        const format = this.resolveProperty('format', 'text');
        const formattedValue = this.formatValue(rawValue);
        const templateVariables = this.getTemplateVariables(rawValue, {attribute: rawValue});
        const prefix = format !== 'template' ? this.resolveProperty('prefix') : null;
        const prefixValue = prefix ? this.resolveTemplateString('prefix', prefix, templateVariables) : '';
        const suffix = format !== 'template' ? this.resolveProperty('suffix') : null;
        const suffixValue = suffix ? this.resolveTemplateString('suffix', suffix, templateVariables) : '';

        const showLabel = this.resolvePropertyAsBoolean('showLabel');
        const labelText = this.getLabelText();
        const labelPosition = this.resolveProperty('labelPosition', 'top');

        const labelTargetStyle = this.getTargetStyle('label');
        const valueTargetStyle = this.getTargetStyle('value');
        const labelTargetActive = this.isStyleTargetActive('label');
        const valueTargetActive = this.isStyleTargetActive('value');

        return html`

            <div class="attribute-container layout-${labelPosition}">
                ${showLabel ? html`
                    <div
                            class="attribute-label ${labelTargetActive ? 'style-target-active' : nothing}"
                            style=${styleMap(labelTargetStyle)}
                            data-style-target="label"
                            data-action-target="label"
                    >${labelText}:
                    </div>
                ` : nothing}
                <div
                        class="attribute-value ${valueTargetActive ? 'style-target-active' : nothing}"
                        style=${styleMap(valueTargetStyle)}
                        data-style-target="value"
                        data-action-target="value"
                >
                    <div class="value-content">
                        ${prefix ? html`<span class="value-prefix">${prefixValue}</span>` : nothing}
                        <span>${formattedValue}</span>
                        ${suffix ? html`<span class="value-suffix">${suffixValue}</span>` : nothing}
                    </div>
                </div>
            </div>

        `;
    }

    /**
     * Get attribute value
     */
    protected getAttributeValue(): any {
        const attributeName = this.resolveProperty('attributeName');
        if (!attributeName) return undefined;

        return this.getEntityAttribute(attributeName);
    }

    /**
     * Get label text
     */
    protected getLabelText(): string {
        const customLabel = this.resolveProperty('customLabel');
        if (customLabel) return customLabel;

        const attributeName = this.resolveProperty('attributeName');
        if (!attributeName) return 'Attribute';

        return this.getAttributeLabel(attributeName);
    }
}
