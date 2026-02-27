/**
 * Checkbox Trait Renderer
 */

import type { CheckboxTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class CheckboxTraitRenderer extends TraitRendererBase<CheckboxTrait> {
    render(
        trait: CheckboxTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const boolValue = this.getPropertyValue<boolean>(value, false);

        return this.renderPropertyRow(
            trait,
            html`
            <label class="toggle-switch">
                <input
                    type="checkbox"
                    .checked=${Boolean(boolValue)}
                    @change=${(e: Event) => {onChange(trait.name, (e.target as HTMLInputElement).checked)}}
                />
                <span class="toggle-slider"></span>
            </label>
          `,
            context,
            {description: trait.description, resolvedValue: boolValue, propertyValue, classes: ['property-row-inline']}
        );
    }
}
