import { BlockBase } from '@/common/blocks/components/block-base';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { isExternalUrl, isManagedMediaReference, mediaContentIdToPublicUrl } from '@/common/media';
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('block-image')
export class BlockImage extends BlockBase {
    static styles = [
        ...BlockBase.styles,
        css`
            :host {
                display: block;
                padding: 0;
                overflow: hidden;
            }
            .empty {
                text-align: center;
                padding: 16px;
                color: #000;
            }
            img {
                display: block;
                max-width: 100%;
                max-height: 100%;
                width: 100%;
                height: 100%;
            }
        `,
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Image',
                icon: '<ha-icon icon="mdi:image-outline"></ha-icon>',
                category: 'basic',
            },
            defaults: {
                props: {
                    imageSource: {value: 'none'},
                    imageUrl: {value: ''},
                    mediaReference: {value: ''},
                    objectFit: {value: 'initial'},
                    objectPositionMode: {value: 'center'},
                    objectPositionCustom: {value: 'center'},
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
                groups: [{
                    id: 'image',
                    label: 'Image',
                    traits: [
                        {
                            type: 'select',
                            name: 'imageSource',
                            label: 'Image Source',
                            options: [
                                {value: 'none', label: 'None'},
                                {value: 'url', label: 'Image URL'},
                                {value: 'media', label: 'Media Library'},
                            ],
                        },
                        {
                            type: 'text',
                            name: 'imageUrl',
                            label: 'Image URL',
                            placeholder: 'https://example.com/image.png',
                            visible: {
                                prop: 'imageSource',
                                eq: 'url',
                            },
                            binding: {
                                type: 'text',
                                placeholder: 'https://example.com/image.png',
                            },
                        },
                        {
                            type: 'media-picker',
                            name: 'mediaReference',
                            label: 'Media',
                            emptyLabel: 'No media selected',
                            selectLabel: 'Select media',
                            editLabel: 'Edit',
                            removeLabel: 'Remove',
                            sourceProp: 'imageSource',
                            sourceValue: 'media',
                            visible: {
                                prop: 'imageSource',
                                eq: 'media',
                            },
                            binding: {
                                type: 'text',
                                placeholder: 'cb-media://local/card_builder/...',
                            },
                        },
                        {
                            type: 'select',
                            name: 'objectFit',
                            label: 'Image Fit',
                            options: [
                                {value: 'initial', label: 'None (Default)'},
                                {value: 'contain', label: 'Contain (Fit Inside)'},
                                {value: 'cover', label: 'Cover (Fill & Crop)'},
                                {value: 'fill', label: 'Stretch (Fill)'},
                                {value: 'scale-down', label: 'Scale Down Only'},
                                {value: 'none', label: 'Original Size'},
                            ],
                            binding: {
                                type: 'select',
                                options: [
                                    {value: 'initial', label: 'None (Default)'},
                                    {value: 'contain', label: 'Contain (Fit Inside)'},
                                    {value: 'cover', label: 'Cover (Fill & Crop)'},
                                    {value: 'fill', label: 'Stretch (Fill)'},
                                    {value: 'scale-down', label: 'Scale Down Only'},
                                    {value: 'none', label: 'Original Size'},
                                ],
                            },
                        },
                        {
                            name: 'objectPositionMode',
                            label: 'Image Position',
                            type: 'select',
                            options: [
                                {value: 'center', label: 'Center'},
                                {value: 'top', label: 'Top'},
                                {value: 'bottom', label: 'Bottom'},
                                {value: 'left', label: 'Left'},
                                {value: 'right', label: 'Right'},
                                {value: 'top left', label: 'Top Left'},
                                {value: 'top right', label: 'Top Right'},
                                {value: 'bottom left', label: 'Bottom Left'},
                                {value: 'bottom right', label: 'Bottom Right'},
                                {value: 'custom', label: 'Custom'},
                            ],
                            binding: {
                                type: 'select',
                                options: [
                                    {value: 'center', label: 'Center'},
                                    {value: 'top', label: 'Top'},
                                    {value: 'bottom', label: 'Bottom'},
                                    {value: 'left', label: 'Left'},
                                    {value: 'right', label: 'Right'},
                                    {value: 'top left', label: 'Top Left'},
                                    {value: 'top right', label: 'Top Right'},
                                    {value: 'bottom left', label: 'Bottom Left'},
                                    {value: 'bottom right', label: 'Bottom Right'},
                                ],
                            },
                        },
                        {
                            type: 'text',
                            name: 'objectPositionCustom',
                            label: 'Custom Position',
                            placeholder: 'e.g. 20% 80%',
                            visible: {
                                prop: 'objectPositionMode',
                                eq: 'custom',
                            },
                            binding: {
                                type: 'text',
                                placeholder: 'e.g. 20% 80%',
                            },
                        },
                    ],
                }],
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
        const src = this.getImageSource();
        if (!src) {
            return html`<div class="empty">No Image Selected</div>`;
        }

        const objectFit = this.resolveProperty('objectFit', 'initial');
        const objectPosition = this.getObjectPosition();
        const style: Record<string, string> = {};
        if (objectFit) style.objectFit = objectFit;
        if (objectPosition) style.objectPosition = objectPosition;

        return html`<img src="${src}" alt="" style=${styleMap(style)} />`;
    }

    private getImageSource(): string | null {
        const source = this.resolveProperty('imageSource', 'none');
        if (source === 'none') return null;

        const raw = source === 'media'
            ? this.resolveProperty('mediaReference', '')
            : this.resolveProperty('imageUrl', '');

        if (!raw) return null;

        if (isManagedMediaReference(raw)) {
            return mediaContentIdToPublicUrl(raw) ?? null;
        }

        if (isExternalUrl(raw) || raw.startsWith('/')) {
            return raw;
        }

        return raw;
    }

    private getObjectPosition(): string {
        const mode = this.resolveProperty('objectPositionMode', 'center');
        if (mode === 'custom') {
            return this.resolveProperty('objectPositionCustom', 'center');
        }
        return mode || 'center';
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-image': BlockImage;
    }
}
