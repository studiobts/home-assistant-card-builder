import { BlockBase } from '@/common/blocks/components/block-base';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('block-text')
export class BlockText extends BlockBase {
    static styles = [
        ...BlockBase.styles,
        css`
            :host {
                overflow: hidden;
            }
            .text-content {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Text',
                icon: '<ha-icon icon="mdi:format-text"></ha-icon>',
                category: 'basic',
            },
            defaults: {},
            entityDefaults: {
                mode: 'inherited',
            },
        };
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [{
                    id: 'content',
                    label: 'Content',
                    traits: [{
                        type: 'text',
                        name: 'text',
                        label: 'Text',
                        placeholder: 'Enter text...',
                        binding: {
                            type: 'text',
                            placeholder: 'Enter text...'
                        }
                    }]
                }]
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
        const text = this.resolveProperty('text', 'Text');

        return html`
            <div class="text-content">
                ${text}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-text': BlockText;
    }
}
