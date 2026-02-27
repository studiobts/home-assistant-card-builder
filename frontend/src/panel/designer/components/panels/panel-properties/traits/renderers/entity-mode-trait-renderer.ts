/**
 * Entity Mode Trait Renderer
 *
 * Renderizza un toggle per switchare tra modalità "fixed" e "slot".
 * Include anche l'input per lo Slot ID quando in modalità slot.
 */

import type { EntityModeTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class EntityModeTraitRenderer extends TraitRendererBase<EntityModeTrait> {
    render(
        trait: EntityModeTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const entityMode = this.getPropertyValue<string>(value, 'fixed');
        const isSlotMode = entityMode === 'slot';

        const slotIdProp = trait.slotIdProp || 'slotId';
        const slotValue = context.props[slotIdProp];
        const slotId = typeof slotValue === 'object' && slotValue !== null && 'value' in slotValue
            ? (slotValue as { value?: string }).value ?? ''
            : (slotValue as string) || '';

        return html`
      <div class="entity-mode-toggle">
        <span class="entity-mode-label">
          ${isSlotMode ? 'Entity slot' : 'Fixed entity'}
        </span>
        <label class="toggle-switch">
          <input
            type="checkbox"
            .checked=${isSlotMode}
            @change=${(e: Event) => {
            const checked = (e.target as HTMLInputElement).checked;
            onChange(trait.name, checked ? 'slot' : 'fixed');
        }}
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
      ${isSlotMode ? html`
        <div class="property-row">
          <label class="property-label">Slot ID</label>
          <input
            type="text"
            class="property-input"
            .value=${slotId}
            @input=${(e: Event) => {
            onChange(slotIdProp, (e.target as HTMLInputElement).value);
        }}
          />
          <div class="slot-info">This entity will be configurable when the card is used</div>
        </div>
      ` : ''}
    `;
    }
}
