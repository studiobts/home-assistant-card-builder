/**
 * Select Trait Renderer
 */

import type { SelectTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class SelectTraitRenderer extends TraitRendererBase<SelectTrait> {
    render(
        trait: SelectTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const stringValue = this.getPropertyValue<string>(value, '');

        return this.renderPropertyRow(
            trait,
            html`
        <select
          class="property-input"
          .value=${String(stringValue)}
          @change=${(e: Event) => {
                onChange(trait.name, (e.target as HTMLSelectElement).value);
            }}
        >
          ${trait.options.map(option => html`
            <option value="${option.value}" ?selected=${stringValue === option.value}>
              ${option.label}
            </option>
          `)}
        </select>
      `,
            context,
            {description: trait.description, resolvedValue: stringValue, propertyValue}
        );
    }
}
