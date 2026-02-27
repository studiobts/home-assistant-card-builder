/**
 * Entity Picker Trait Renderer
 *
 * Usa il componente ha-selector di Home Assistant per la selezione delle entity.
 */

import type { EntityPickerTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class EntityPickerTraitRenderer extends TraitRendererBase<EntityPickerTrait> {
    render(
        trait: EntityPickerTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const entityValue = this.getPropertyValue<string>(value, '');

        if (!context.hass) return html``;


        return this.renderPropertyRow(
            trait,
            html`
        <ha-selector
          .hass=${context.hass}
          .selector=${{
                entity: {
                    multiple: false,
                    domain: trait.includeDomains,
                    device_class: trait.deviceClass,
                }
            }}
          .value=${entityValue}
          @value-changed=${(e: CustomEvent) => {
                onChange(trait.name, e.detail.value);
            }}
        ></ha-selector>
      `,
            context,
            {description: trait.description, resolvedValue: entityValue, propertyValue}
        );

    }
}
