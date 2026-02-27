import { BlockBase } from '@/common/blocks/components/block-base';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import {
    buildEntityTemplateVariables,
    DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
    TEMPLATE_GENERIC_ERROR,
} from '@/common/core/template/ha-template-service';
import { css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

const DEFAULT_ICON = 'mdi:star-outline';

@customElement('block-icon')
export class BlockIcon extends BlockBase {
    static styles = [
        ...BlockBase.styles,
        css`
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .icon {
                width: var(--mdc-icon-size, 24px);
                height: var(--mdc-icon-size, 24px);
            }
            .icon-template {
                white-space: nowrap;
            }
        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Icon',
                icon: '<ha-icon icon="mdi:star-outline"></ha-icon>',
                category: 'basic',
            },
            defaults: {
                props: {
                    iconSize: {value: 24},
                    iconSource: {value: 'list'},
                    icon: {value: DEFAULT_ICON},
                    iconTemplate: {value: ''},
                    preTemplate: {value: ''},
                    postTemplate: {value: ''},
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
                        id: 'icon',
                        label: 'Icon',
                        traits: [
                            {
                                type: 'number',
                                name: 'iconSize',
                                label: 'Icon Size',
                                min: 12,
                                max: 128,
                            },
                            {
                                type: 'select',
                                name: 'iconSource',
                                label: 'Icon Source',
                                options: [
                                    {value: 'list', label: 'From List'},
                                    {value: 'template', label: 'From Template'},
                                ],
                            },
                            {
                                type: 'icon-picker',
                                name: 'icon',
                                label: 'Icon',
                                placeholder: 'mdi:icon-name',
                                visible: {
                                    prop: 'iconSource',
                                    eq: 'list',
                                },
                                binding: {
                                    type: 'icon-picker',
                                    placeholder: 'mdi:icon-name',
                                },
                            },
                            {
                                type: 'text',
                                name: 'iconTemplate',
                                label: 'Icon Template',
                                placeholder: "{{ 'mdi:lightbulb' if state == 'on' else 'mdi:lightbulb-off' }}",
                                description: 'If set, overrides the selected icon.',
                                templateKeywords: DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
                                visible: {
                                    prop: 'iconSource',
                                    eq: 'template',
                                },
                            },
                        ],
                    },
                    {
                        id: 'templates',
                        label: 'Templates',
                        traits: [
                            {
                                type: 'text',
                                name: 'preTemplate',
                                label: 'Pre Template',
                                placeholder: 'Text before icon',
                                templateKeywords: DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
                            },
                            {
                                type: 'text',
                                name: 'postTemplate',
                                label: 'Post Template',
                                placeholder: 'Text after icon',
                                templateKeywords: DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
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
                icon: {
                    label: 'Icon',
                    description: 'Icon element',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                pre: {
                    label: 'Pre Template',
                    description: 'Text before the icon',
                    styles: {
                        preset: 'full',
                        exclude: {
                            groups: ['layout', 'flex'],
                        },
                    },
                },
                post: {
                    label: 'Post Template',
                    description: 'Text after the icon',
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
        const templateVariables = this.getTemplateVariables();

        const iconSource = this.resolveProperty('iconSource', 'list');
        const iconTemplate = this.resolveProperty('iconTemplate', '');
        const preTemplate = this.resolveProperty('preTemplate', '');
        const postTemplate = this.resolveProperty('postTemplate', '');
        const iconSize = this.resolvePropertyAsNumber('iconSize', 24);

        const useTemplateIcon = iconSource === 'template';
        const hasIconTemplate = iconTemplate.trim().length > 0;
        const hasPreTemplate = preTemplate.trim().length > 0;
        const hasPostTemplate = postTemplate.trim().length > 0;

        const iconFromTemplate = useTemplateIcon && hasIconTemplate ? this.resolveTemplateString('iconTemplate', iconTemplate, templateVariables) : '';

        const icon = this.resolveIcon(iconFromTemplate, useTemplateIcon);

        const preText = hasPreTemplate ? this.resolveTemplateString('preTemplate', preTemplate, templateVariables) : '';
        const postText = hasPostTemplate ? this.resolveTemplateString('postTemplate', postTemplate, templateVariables) : '';

        const iconTargetStyle = this.getTargetStyle('icon');
        const iconStyle = {
            '--mdc-icon-size': `${iconSize}px`,
            ...iconTargetStyle,
        };
        const preTargetStyle = this.getTargetStyle('pre');
        const postTargetStyle = this.getTargetStyle('post');

        const iconTargetActive = this.isStyleTargetActive('icon');
        const preTargetActive = this.isStyleTargetActive('pre');
        const postTargetActive = this.isStyleTargetActive('post');

        return html`
            ${hasPreTemplate ? html`
                <span
                    class="icon-template ${preTargetActive ? 'style-target-active' : ''}"
                    style=${styleMap(preTargetStyle)}
                    data-style-target="pre"
                >${preText}</span>
            ` : nothing}
            <ha-icon
                class="icon ${iconTargetActive ? 'style-target-active' : ''}"
                style=${styleMap(iconStyle)}
                data-style-target="icon"
                .icon=${icon}
            ></ha-icon>
            ${hasPostTemplate ? html`
                <span
                    class="icon-template ${postTargetActive ? 'style-target-active' : ''}"
                    style=${styleMap(postTargetStyle)}
                    data-style-target="post"
                >${postText}</span>
            ` : nothing}
        `;
    }

    private getTemplateVariables(): Record<string, unknown> {
        const state = this.getEntityState() ?? undefined;
        return buildEntityTemplateVariables(state as any, state?.state);
    }

    private resolveIcon(templateValue: string, useTemplate: boolean): string {
        if (useTemplate) {
            if (templateValue && templateValue !== TEMPLATE_GENERIC_ERROR) {
                return templateValue;
            }
            return DEFAULT_ICON;
        }

        const iconValue = this.resolveProperty('icon', DEFAULT_ICON);
        if (iconValue && iconValue !== TEMPLATE_GENERIC_ERROR) {
            return iconValue;
        }

        return DEFAULT_ICON;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-icon': BlockIcon;
    }
}
