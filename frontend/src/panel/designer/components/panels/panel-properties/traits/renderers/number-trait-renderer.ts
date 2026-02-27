/**
 * Number Trait Renderer
 */

import type { NumberTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class NumberTraitRenderer extends TraitRendererBase<NumberTrait> {
    render(
        trait: NumberTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const numValue = this.getPropertyValue<number>(value, 0);

        return this.renderPropertyRow(
            trait,
            html`
        <input
          type="number"
          class="property-input"
          .value=${String(numValue)}
          min="${trait.min ?? ''}"
          max="${trait.max ?? ''}"
          step="${trait.step ?? 1}"
          @input=${(e: Event) => {
                const inputValue = (e.target as HTMLInputElement).value;
                const parsed = trait.step && trait.step < 1
                    ? parseFloat(inputValue)
                    : parseInt(inputValue, 10);
                onChange(trait.name, isNaN(parsed) ? 0 : parsed);
            }}
        />
      `,
            context,
            {description: trait.description, resolvedValue: numValue, propertyValue}
        );
    }
}
