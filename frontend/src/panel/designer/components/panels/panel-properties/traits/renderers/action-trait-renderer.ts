/**
 * Action Trait Renderer
 *
 * Renderizza un pulsante che, quando cliccato, invoca un action handler.
 * Usato per aprire overlay/pannelli dedicati (es: Grid Editor, SVG Binding Editor).
 */

import type { ActionTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class ActionTraitRenderer extends TraitRendererBase<ActionTrait> {
    render(
        trait: ActionTrait,
        _value: unknown,
        _onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const actionHandler = context.actionHandlers?.get(trait.actionId);

        return html`
      <div class="property-row">
        <button
          class="edit-grid-button"
          @click=${() => {
            if (actionHandler) {
                actionHandler();
            } else {
                console.warn(`[ActionTraitRenderer] No handler found for action: ${trait.actionId}`);
            }
        }}
        >
          ${trait.icon ? html`<span class="action-icon">${trait.icon}</span>` : ''}
          ${trait.buttonLabel}
        </button>
      </div>
    `;
    }
}
