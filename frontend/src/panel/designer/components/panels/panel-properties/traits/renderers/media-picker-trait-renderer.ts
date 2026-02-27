/**
 * Media Picker Trait Renderer
 *
 * Renders a media picker UI with select/edit/remove actions.
 */

import type { MediaPickerTrait } from '@/common/blocks/core/properties';
import { getMediaReferenceName } from '@/common/media';
import type { TraitRenderContext } from '@/panel/designer/components/panels/panel-properties/traits';
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class MediaPickerTraitRenderer extends TraitRendererBase<MediaPickerTrait> {
    render(
        trait: MediaPickerTrait,
        value: unknown,
        _onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const reference = this.getPropertyValue<string>(value, '');
        const hasValue = Boolean(reference);
        const displayName = hasValue
            ? (getMediaReferenceName(reference) || reference)
            : (trait.emptyLabel ?? 'No media selected');

        const openId = `media-picker-open:${trait.name}`;
        const clearId = `media-picker-clear:${trait.name}`;
        const openHandler = context.actionHandlers?.get(openId);
        const clearHandler = context.actionHandlers?.get(clearId);

        const selectLabel = trait.selectLabel ?? 'Select media';
        const editLabel = trait.editLabel ?? 'Edit';
        const removeLabel = trait.removeLabel ?? 'Remove';

        const content = html`
            <div class="media-picker ${hasValue ? 'has-value' : 'empty'}">
                <div class="media-chip" title=${hasValue ? reference : ''}>
                    ${displayName}
                </div>
                <div class="media-picker-actions">
                    ${hasValue ? html`
                        <button
                            class="media-action-btn"
                            @click=${() => {
                                if (openHandler) {
                                    openHandler();
                                } else {
                                    console.warn(`[MediaPickerTrait] No handler for ${openId}`);
                                }
                            }}
                        >
                            ${editLabel}
                        </button>
                        <button
                            class="media-action-btn danger"
                            @click=${() => {
                                if (clearHandler) {
                                    clearHandler();
                                } else {
                                    console.warn(`[MediaPickerTrait] No handler for ${clearId}`);
                                }
                            }}
                        >
                            ${removeLabel}
                        </button>
                    ` : html`
                        <button
                            class="media-action-btn primary"
                            @click=${() => {
                                if (openHandler) {
                                    openHandler();
                                } else {
                                    console.warn(`[MediaPickerTrait] No handler for ${openId}`);
                                }
                            }}
                        >
                            ${selectLabel}
                        </button>
                    `}
                </div>
            </div>
        `;

        return this.renderPropertyRow(
            trait,
            content,
            context,
            {
                resolvedValue: reference,
                propertyValue,
                classes: ['media-picker-row'],
            }
        );
    }
}
