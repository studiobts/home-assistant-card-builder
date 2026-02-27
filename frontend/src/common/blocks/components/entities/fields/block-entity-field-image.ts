import { BaseEntityField } from '@/common/blocks/components/entities/fields/base-entity-field';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html, type PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Entity Image Field
 * Displays entity picture (entity_picture attribute) with styling options
 */
@customElement('block-entity-field-image')
export class BlockEntityFieldImage extends BaseEntityField {
    static styles = [
        ...BaseEntityField.styles,
        css`
            :host(.has-image) {
                padding: 0;
                overflow: hidden;
            }
            .image-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                overflow: hidden;
            }

            .entity-picture {
                width: 100%;
                height: 100%;
                transition: filter 0.3s ease;
            }

            .fallback-icon-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .fallback-icon {
                width: 50%;
                height: 50%;
                max-width: 48px;
                max-height: 48px;
            }

            .fallback-icon svg,
            .fallback-icon ha-icon {
                width: 100%;
                height: 100%;
                fill: currentColor;
            }
        `
    ];

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Entity Image',
                icon: '<ha-icon icon="mdi:image-outline"></ha-icon>',
                category: 'entities'
            },
            defaults: {
                requireEntity: true,
                props: {
                    // Image
                    customImageUrl: {value: ''},
                    fallbackIcon: {value: 'mdi:image-off-outline'}
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
                        id: 'image',
                        label: 'Image',
                        traits: [
                            {
                                type: 'text',
                                name: 'customImageUrl',
                                label: 'Custom Image URL',
                                placeholder: 'Leave empty to use entity_picture'
                            },
                            {
                                type: 'icon-picker',
                                name: 'fallbackIcon',
                                label: 'Fallback Icon',
                                placeholder: 'mdi:image-off-outline',
                                binding: {
                                    type: 'icon-picker',
                                    placeholder: 'mdi:image-off-outline'
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
            },
        };
    }

    render() {
        if (!this.entity) {
            return html`
                <div class="no-entity">No entity selected</div>`;
        }

        const imageUrl = this.getImageUrl();

        // If no image, show fallback icon
        if (!imageUrl) {
            const fallbackIcon = this.getFallbackIcon();

            return html`
                <div class="image-container">
                    <div class="fallback-icon-container">
                        <ha-icon class="fallback-icon" .icon="${fallbackIcon}"></ha-icon>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="image-container">
                <img
                    class="entity-picture"
                    src="${imageUrl}"
                    alt="${this.getEntityName()}"
                    @error="${this._handleImageError}"
                />
            </div>
        `;
    }

    updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);
        const imageUrl = this.getImageUrl();

        this.classList.toggle('has-image', !!imageUrl);
    }

    /**
     * Get image URL to display
     */
    protected getImageUrl(): string | null {
        const customImageUrl = this.resolveProperty('customImageUrl');
        if (customImageUrl) return customImageUrl;

        const entityPicture = this.getEntityAttribute('entity_picture');
        return entityPicture || null;
    }

    /**
     * Get fallback icon
     */
    protected getFallbackIcon(): string {
        return this.resolveProperty('fallbackIcon', 'mdi:image-off-outline');
    }

    /**
     * Handle image load error
     */
    private _handleImageError(e: Event): void {
        const img = e.target as HTMLImageElement;
        const fallbackIcon = this.getFallbackIcon();

        // Replace image with fallback icon
        const container = img.parentElement;
        if (container) {
            container.innerHTML = `
        <div class="fallback-icon-container">
          <ha-icon class="fallback-icon" icon="${fallbackIcon}"></ha-icon>
        </div>
      `;
        }
    }
}
