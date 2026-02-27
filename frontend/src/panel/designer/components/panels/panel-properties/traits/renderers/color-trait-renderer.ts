/**
 * Color Trait Renderer
 */

import type { ColorTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class ColorTraitRenderer extends TraitRendererBase<ColorTrait> {
    render(
        trait: ColorTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const colorValue = this.getPropertyValue<string>(value, '#000000');

        return this.renderPropertyRow(
            trait,
            html`
        <input
          type="color"
          class="property-input"
          .value=${String(colorValue)}
          @input=${(e: Event) => {
                onChange(trait.name, (e.target as HTMLInputElement).value);
            }}
        />
      `,
            context,
            {description: trait.description, resolvedValue: colorValue, propertyValue}
        );
    }
}
