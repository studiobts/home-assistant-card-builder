import { BaseEntityField } from '@/common/blocks/components/entities/fields/base-entity-field';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ENTITY_NAME_TEMPLATE_KEYWORDS } from '@/common/core/template/ha-template-service';

/**
 * Entity Name Field
 * Displays entity friendly name with formatting options
 */
@customElement('block-entity-field-name')
export class BlockEntityFieldName extends BaseEntityField {
    static styles = [
        ...BaseEntityField.styles,
        css`
            .name-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: var(--text-align, flex-start);
                box-sizing: border-box;
            }
      
            .name-text {
                overflow: hidden;
                white-space: nowrap;
            }

            .name-text.ellipsis {
                text-overflow: ellipsis;
            }

            .name-text.wrap {
                white-space: normal;
                word-break: break-word;
            }
        `
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Entity Name',
                icon: '<ha-icon icon="mdi:alphabetical-variant"></ha-icon>',
                category: 'entities'
            },
            defaults: {
                requireEntity: true,
                props: {
                    // Name
                    customName: {value: ''},
                    // Formatting
                    case: {value: 'none'},
                    maxLength: {value: 0},
                    ellipsis: {value: true}
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
                        id: 'name',
                        label: 'Name',
                        traits: [{
                            type: 'text',
                            name: 'customName',
                            label: 'Custom Name',
                            placeholder: 'Custom name or template (e.g. {{name}})',
                            description: 'Leave empty to use entity friendly name. Use {{name}} to display entity name inside text.',
                            templateKeywords: ENTITY_NAME_TEMPLATE_KEYWORDS
                        }]
                    },
                    {
                        id: 'formatting',
                        label: 'Formatting',
                        traits: [
                            {
                                type: 'select',
                                name: 'case',
                                label: 'Case',
                                options: [
                                    {value: 'none', label: 'None'},
                                    {value: 'upper', label: 'Upper'},
                                    {value: 'lower', label: 'Lower'},
                                    {value: 'title', label: 'Title'},
                                    {value: 'kebab', label: 'Kebab'},
                                    {value: 'camel', label: 'Camel'}
                                ]
                            },
                            {
                                type: 'number',
                                name: 'maxLength',
                                label: 'Max Length',
                                min: 1,
                                max: 250,
                                step: 1,
                                description: 'Leave empty to disable truncation'
                            },
                            {
                                type: 'checkbox',
                                name: 'ellipsis',
                                label: 'Use Ellipsis',
                                description: 'If enabled, truncation will be done using ellipsis instead of hiding text'
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
            },
        };
    }

    render() {
        if (!this.entity) {
            return html`
                <div class="no-entity">No entity selected</div>
            `;
        }

        const rawName = this.getEntityName();
        const customName = this.resolveProperty('customName');
        const displayBase = customName
            ? this.resolveTemplateString('customName', customName, this.getTemplateVariables(rawName, {name: rawName}))
            : rawName;
        const formattedName = this.formatName(displayBase);
        const displayName = this.truncateName(formattedName);

        const ellipsis = this.resolvePropertyAsBoolean('ellipsis');
        const maxLength = this.resolvePropertyAsNumber('maxLength', 0);
        const useEllipsis = ellipsis && maxLength === 0;

        return html`
            <div class="name-container">
                <div class="name-text ${useEllipsis ? 'ellipsis' : ''}">
                    ${displayName}
                </div>
            </div>
        `;
    }

    /**
     * Format name based on case option
     */
    protected formatName(name: string): string {
        const caseOption = this.resolveProperty('case', 'none');

        switch (caseOption) {
            case 'upper':
                return name.toUpperCase();
            case 'lower':
                return name.toLowerCase();
            case 'title':
                return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            case 'kebab': {
                const words = name.match(/[A-Za-z0-9]+/g) || [];
                return words.map(w => w.toLowerCase()).join('-');
            }
            case 'camel': {
                const words = name.match(/[A-Za-z0-9]+/g) || [];
                if (words.length === 0) return '';
                return words[0]?.toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
            }
            default:
                return name;
        }
    }

    /**
     * Truncate name if needed
     */
    protected truncateName(name: string): string {
        const maxLength = this.resolvePropertyAsNumber('maxLength', 0);

        if (maxLength > 0 && name.length > maxLength) {
            const ellipsis = this.resolvePropertyAsBoolean('ellipsis');
            return ellipsis ? name.substring(0, maxLength) + '...' : name.substring(0, maxLength);
        }

        return name;
    }
}
