/**
 * Info Trait Renderer
 *
 * Renderizza informazioni in sola lettura.
 * Usato per mostrare info sul blocco (es: "Entity is controlled by parent block").
 */

import type { InfoTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class InfoTraitRenderer extends TraitRendererBase<InfoTrait> {
    render(
        trait: InfoTrait,
        value: unknown,
        _onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const displayValue = this.getPropertyValue<string>(value, '');

        return this.renderPropertyRow(
            trait,
            html`
        <div class="property-info">
          ${displayValue}
          ${trait.description ? html`
            <div class="info-text">${trait.description}</div>
          ` : ''}
        </div>
      `,
            context,
            {resolvedValue: displayValue, propertyValue}
        );
    }
}
