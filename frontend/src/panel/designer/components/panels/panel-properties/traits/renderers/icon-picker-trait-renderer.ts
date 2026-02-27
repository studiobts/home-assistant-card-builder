/**
 * Icon Picker Trait Renderer
 */

import type { IconPickerTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class IconPickerTraitRenderer extends TraitRendererBase<IconPickerTrait> {
    render(
        trait: IconPickerTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const iconValue = this.getPropertyValue<string>(value, '');

        if (!context.hass) return html``;


        return this.renderPropertyRow(
            trait,
            html`
        <ha-icon-picker
          .hass=${context.hass}
          .value=${iconValue}
          @value-changed=${(e: CustomEvent) => {
                onChange(trait.name, e.detail.value);
            }}
        ></ha-icon-picker>
      `,
            context,
            {description: trait.description, resolvedValue: iconValue, propertyValue}
        );

    }
}
